import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import clubConfig from '@/config/club.config';
import { getClubNow, addDaysStr, getSlotsForDate } from '@/lib/schedule';
import {
  LEDGER_COLLECTION, COURT_COUNT, BOOKING_WINDOW_DAYS,
  ledgerId, isBookableSlot, pickFreeCourt, readTaken,
} from '@/lib/slotLedger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * GET /api/bookings?days=7
 *
 * Disponibilités en direct : nombre de terrains pris par créneau. Aucune donnée
 * personnelle. 503 tant que Firebase n'est pas configuré — le widget garde
 * alors le parcours « demande + WhatsApp ».
 */
export async function GET(req: Request) {
  const admin = getAdminFirestore();
  if ('error' in admin) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: NO_STORE });
  }

  const requested = Number(new URL(req.url).searchParams.get('days'));
  const days = Math.min(BOOKING_WINDOW_DAYS, Math.max(1, Number.isFinite(requested) && requested > 0 ? requested : 7));
  const now = getClubNow();
  const pairs = Array.from({ length: days }, (_, i) => addDaysStr(now.dateStr, i))
    .flatMap((date) => getSlotsForDate(date, now).map((time) => ({ date, time })));

  if (pairs.length === 0) {
    return NextResponse.json({ courts: COURT_COUNT, taken: {} }, { headers: NO_STORE });
  }

  try {
    // Lecture par identifiants (getAll) : pas de requête filtrée, donc aucun
    // index composite à créer dans Firestore.
    const col = admin.db.collection(LEDGER_COLLECTION);
    const snaps = await admin.db.getAll(...pairs.map((p) => col.doc(ledgerId(p.date, p.time))));
    const taken: Record<string, number> = {};
    snaps.forEach((snap, i) => {
      const count = snap.exists ? readTaken(snap.get('courts_taken')).length : 0;
      if (count > 0) taken[`${pairs[i].date}T${pairs[i].time}`] = count;
    });
    return NextResponse.json({ courts: COURT_COUNT, taken }, { headers: NO_STORE });
  } catch (err) {
    console.error('availability read error', err);
    return NextResponse.json({ error: 'read_failed' }, { status: 500, headers: NO_STORE });
  }
}

// Limite par IP, au mieux : la mémoire n'est pas partagée entre instances
// serverless, mais elle freine un script qui vide le planning en boucle.
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

const LOCALES = new Set(['fr', 'en', 'es', 'ar']);

/**
 * POST /api/bookings  { name, phone, level, players, date, time_slot, locale }
 *
 * Réservation instantanée : attribue un terrain libre dans une transaction et
 * enregistre la réservation confirmée.
 *  - 201 { id, court }
 *  - 400 { error: 'invalid' }
 *  - 409 { error: 'slot_full' | 'slot_unavailable' }
 *  - 429 { error: 'rate_limited' }
 *  - 503 { error: 'unavailable' }   Firebase non configuré
 */
export async function POST(req: Request) {
  const admin = getAdminFirestore();
  if ('error' in admin) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  // Champ piège invisible : un humain ne le remplit jamais.
  if (str(body.website, 200)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const name = str(body.name, 119);
  const phone = str(body.phone, 29);
  const level = str(body.level, 60);
  const date = str(body.date, 10);
  const time = str(body.time_slot, 5);
  const locale = LOCALES.has(str(body.locale, 2)) ? str(body.locale, 2) : clubConfig.defaultLocale;
  const players = Number(body.players);
  const digits = phone.replace(/\D/g, '');

  if (
    !name ||
    digits.length < 8 || digits.length > 15 ||
    ![2, 3, 4].includes(players) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  if (!isBookableSlot(date, time)) {
    return NextResponse.json({ error: 'slot_unavailable' }, { status: 409 });
  }

  const { db } = admin;
  const ledgerRef = db.collection(LEDGER_COLLECTION).doc(ledgerId(date, time));
  const bookingRef = db.collection('booking_requests').doc();
  const stamp = new Date().toISOString();

  try {
    const court = await db.runTransaction(async (tx) => {
      const ledger = await tx.get(ledgerRef);
      const taken = ledger.exists ? readTaken(ledger.get('courts_taken')) : [];
      const free = pickFreeCourt(taken);
      if (free === null) return null;

      tx.set(
        ledgerRef,
        { club_slug: clubConfig.slug, date, time_slot: time, courts_taken: [...taken, free], updated_at: stamp },
        { merge: true },
      );
      tx.set(bookingRef, {
        club_slug: clubConfig.slug,
        date,
        time_slot: time,
        court: free,
        name,
        phone,
        level,
        players,
        locale,
        status: 'confirmed',
        source: 'instant',
        created_at: stamp,
        status_updated_at: stamp,
      });
      return free;
    });

    if (court === null) {
      return NextResponse.json({ error: 'slot_full' }, { status: 409 });
    }
    return NextResponse.json({ id: bookingRef.id, court }, { status: 201 });
  } catch (err) {
    console.error('instant booking error', err);
    return NextResponse.json({ error: 'write_failed' }, { status: 500 });
  }
}

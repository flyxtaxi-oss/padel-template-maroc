import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { adminCode, hasValidSession, isSameOrigin, unauthorized } from '@/lib/adminAuth';
import { getClub } from '@/lib/clubSettings.server';
import { reserveSlot } from '@/lib/bookingService';
import { slotsOfDay } from '@/lib/bookingStats';
import { addDaysStr, getClubNow } from '@/lib/schedule';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/bookings/manual  { date, time_slot, name, phone, players, court?, note? }
 *
 * Réservation saisie par le gérant (appel téléphonique, client au comptoir).
 * Même transaction que le site : le terrain est retiré des disponibilités en
 * ligne à l'instant, aucune double réservation possible.
 *
 *  - 201 { id, court }
 *  - 400 { error }                 champ invalide
 *  - 409 { error, reason }         créneau complet / terrain déjà pris
 *  - 503 { reason }                base non configurée → le tableau de bord
 *                                  enregistre alors sur l'appareil (mode local)
 */
export async function POST(req: Request) {
  if (!adminCode()) {
    return NextResponse.json({ error: 'ADMIN_CODE non configuré', reason: 'no_admin_code' }, { status: 503 });
  }
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Origine refusée' }, { status: 403 });
  if (!hasValidSession(req)) return unauthorized();

  const admin = getAdminFirestore();
  if ('error' in admin) {
    return NextResponse.json({ error: 'Base non configurée', reason: 'no_service_account' }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

  const date = str(body.date, 10);
  const time = str(body.time_slot, 5);
  const name = str(body.name, 119);
  const phone = str(body.phone, 29);
  const note = str(body.note, 200);
  const players = Number(body.players);
  const courtRaw = body.court === '' || body.court == null ? undefined : Number(body.court);

  const club = await getClub();
  const today = getClubNow().dateStr;

  if (!name) return NextResponse.json({ error: 'Le nom du client est obligatoire.' }, { status: 400 });
  const digits = phone.replace(/\D/g, '');
  if (phone && (digits.length < 8 || digits.length > 15)) {
    return NextResponse.json({ error: 'Numéro de téléphone invalide.' }, { status: 400 });
  }
  if (![1, 2, 3, 4].includes(players)) return NextResponse.json({ error: 'Nombre de joueurs invalide.' }, { status: 400 });
  // Le gérant peut saisir jusqu'à 60 jours à l'avance, et aujourd'hui même un
  // créneau déjà commencé (client arrivé sans réserver).
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today || date > addDaysStr(today, 60)) {
    return NextResponse.json({ error: 'Date invalide (aujourd’hui à J+60).' }, { status: 400 });
  }
  if (!slotsOfDay(date, club).includes(time)) {
    return NextResponse.json({ error: 'Ce créneau n’existe pas ce jour-là (horaires ou fermeture).' }, { status: 400 });
  }
  if (courtRaw !== undefined && (!Number.isInteger(courtRaw) || courtRaw < 1 || courtRaw > club.courts.length)) {
    return NextResponse.json({ error: 'Terrain invalide.' }, { status: 400 });
  }

  try {
    const result = await reserveSlot(
      admin.db,
      club,
      { date, time, name, phone, players, note, level: note, court: courtRaw },
      'manager',
    );
    if (!result.ok) {
      const error = result.reason === 'court_taken' ? 'Ce terrain est déjà pris sur ce créneau.' : 'Créneau complet : tous les terrains sont pris.';
      return NextResponse.json({ error, reason: result.reason }, { status: 409 });
    }
    return NextResponse.json({ id: result.id, court: result.court }, { status: 201 });
  } catch (err) {
    console.error('manual booking error', err);
    return NextResponse.json({ error: 'Enregistrement impossible pour le moment.' }, { status: 500 });
  }
}

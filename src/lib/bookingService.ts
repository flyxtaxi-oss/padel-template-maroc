import 'server-only';
import { createHash } from 'node:crypto';
import type { ClubConfig } from '@/config/club.config';
import { getClubNow } from '@/lib/schedule';
import { LEDGER_COLLECTION, ledgerId, pickFreeCourt, readTaken } from '@/lib/slotLedger';

/**
 * Service de réservation unique — serveur uniquement.
 *
 * Le formulaire du site, la saisie manuelle du gérant (et demain un agent
 * téléphonique) passent tous par ici : même transaction, même registre des
 * créneaux, donc jamais deux réservations sur le même terrain au même moment.
 */

const PHONE_GUARD = 'booking_phone_guard';
/** Plafond de créneaux à venir par numéro, pour le parcours public uniquement. */
export const MAX_UPCOMING_PER_PHONE = 4;

export type BookingSource = 'instant' | 'manager';

export type ReserveInput = {
  date: string;
  time: string;
  name: string;
  phone: string;
  players: number;
  level?: string;
  locale?: string;
  note?: string;
  /** Terrain souhaité (saisie gérant) ; sinon le plus petit libre. */
  court?: number;
};

export type ReserveResult =
  | { ok: true; id: string; court: number }
  | { ok: false; reason: 'slot_full' | 'court_taken' | 'too_many_for_phone' };

const phoneGuardId = (slug: string, digits: string) =>
  createHash('sha256').update(`${slug}:${digits}`).digest('hex').slice(0, 40);

export async function reserveSlot(
  db: FirebaseFirestore.Firestore,
  club: ClubConfig,
  input: ReserveInput,
  source: BookingSource,
): Promise<ReserveResult> {
  const ledgerRef = db.collection(LEDGER_COLLECTION).doc(ledgerId(input.date, input.time));
  const bookingRef = db.collection('booking_requests').doc();
  const digits = input.phone.replace(/\D/g, '');
  // Le plafond par numéro protège le formulaire public ; le gérant, lui, peut
  // réserver autant qu'il veut (un habitué, un tournoi…).
  const guardRef = source === 'instant' ? db.collection(PHONE_GUARD).doc(phoneGuardId(club.slug, digits)) : null;
  const stamp = new Date().toISOString();
  const today = getClubNow().dateStr;
  const slotKey = `${input.date}T${input.time}`;

  return db.runTransaction(async (tx) => {
    // Toutes les lectures d'une transaction Firestore précèdent les écritures.
    const [ledger, guard] = await Promise.all([tx.get(ledgerRef), guardRef ? tx.get(guardRef) : Promise.resolve(null)]);
    const taken = ledger.exists ? readTaken(ledger.get('courts_taken')) : [];

    let mine: string[] = [];
    if (guardRef && guard) {
      const upcoming: unknown = guard.exists ? guard.get('slots') : [];
      mine = (Array.isArray(upcoming) ? upcoming : []).filter(
        (k): k is string => typeof k === 'string' && k.slice(0, 10) >= today,
      );
      if (mine.length >= MAX_UPCOMING_PER_PHONE) return { ok: false, reason: 'too_many_for_phone' } as const;
    }

    let court: number | null;
    if (typeof input.court === 'number') {
      if (taken.includes(input.court)) return { ok: false, reason: 'court_taken' } as const;
      court = input.court;
    } else {
      court = pickFreeCourt(taken);
    }
    if (court === null) return { ok: false, reason: 'slot_full' } as const;

    if (guardRef) tx.set(guardRef, { slots: [...mine, slotKey], updated_at: stamp });
    tx.set(
      ledgerRef,
      { club_slug: club.slug, date: input.date, time_slot: input.time, courts_taken: [...taken, court], updated_at: stamp },
      { merge: true },
    );
    tx.set(bookingRef, {
      club_slug: club.slug,
      date: input.date,
      time_slot: input.time,
      court,
      name: input.name,
      phone: input.phone,
      level: input.level ?? '',
      players: input.players,
      locale: input.locale ?? club.defaultLocale,
      ...(input.note ? { note: input.note } : {}),
      // Tarif du moment : un changement de prix ultérieur ne réécrit pas le passé.
      price_mad: club.pricing[0]?.price ?? 0,
      status: 'confirmed',
      source,
      created_at: stamp,
      status_updated_at: stamp,
    });
    return { ok: true, id: bookingRef.id, court } as const;
  });
}

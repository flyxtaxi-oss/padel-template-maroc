import clubConfig from '@/config/club.config';
import { getClubNow, addDaysStr, getSlotsForDate } from '@/lib/schedule';

/**
 * Registre des créneaux — serveur uniquement.
 *
 * Un document par créneau (`slot_ledger/{club}_{date}_{heure}`) liste les
 * terrains déjà attribués. C'est lui qui rend la réservation instantanée sûre :
 * la lecture et l'écriture se font dans une transaction Firestore, donc deux
 * joueurs qui cliquent au même moment sur le dernier terrain ne peuvent pas
 * l'obtenir tous les deux.
 *
 * Il ne contient aucune donnée personnelle : le site peut exposer les
 * disponibilités sans jamais toucher aux noms ni aux téléphones.
 */

export const LEDGER_COLLECTION = 'slot_ledger';
export const COURT_COUNT = Math.max(1, clubConfig.courts.length);
/** Jours réservables à l'avance, aujourd'hui compris. */
export const BOOKING_WINDOW_DAYS = 14;

export function ledgerId(date: string, time: string): string {
  return `${clubConfig.slug}_${date}_${time.replace(':', '')}`;
}

/** Vrai si le créneau existe, n'est pas passé et reste dans la fenêtre de réservation. */
export function isBookableSlot(date: string, time: string): boolean {
  const now = getClubNow();
  if (date < now.dateStr || date > addDaysStr(now.dateStr, BOOKING_WINDOW_DAYS - 1)) return false;
  return getSlotsForDate(date, now).includes(time);
}

/** Plus petit numéro de terrain libre, ou `null` si le créneau est complet. */
export function pickFreeCourt(taken: number[]): number | null {
  for (let court = 1; court <= COURT_COUNT; court++) {
    if (!taken.includes(court)) return court;
  }
  return null;
}

export function readTaken(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((c): c is number => typeof c === 'number') : [];
}

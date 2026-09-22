import clubConfig from '@/config/club.config';
import { getSlotsForDate, addDaysStr, type ClubNow } from '@/lib/schedule';

/**
 * Statistiques du tableau de bord — calculées à partir des VRAIES réservations.
 *
 * Tout ce qui est ici fonctionne aussi bien en mode démo qu'en production :
 * c'est la différence entre un tableau de bord qui impressionne pendant une
 * démonstration et un outil qui sert encore le gérant six mois plus tard.
 * Aucune valeur n'est inventée — si la donnée manque, la fonction renvoie zéro
 * et l'écran le dit.
 */

export type StatBooking = {
  id: string;
  name?: string;
  phone?: string;
  date?: string;
  time_slot?: string;
  court?: number;
  players?: number;
  level?: string;
  status?: string;
  created_at?: string;
};

/** Une réservation refusée ne compte ni dans l'occupation ni dans les revenus. */
export const isActive = (b: StatBooking) => (b.status ?? 'pending') !== 'declined';

export const COURTS = clubConfig.courts.map((_, i) => i + 1);
export const PRICE_MAD = clubConfig.pricing[0]?.price ?? 240;

// `getSlotsForDate` retire les créneaux déjà passés quand la date est
// aujourd'hui. Pour mesurer une capacité (« combien de créneaux ce jour
// offrait-il ? »), il faut la journée entière : ce repère n'est jamais
// « aujourd'hui », donc aucun créneau n'est retiré.
const FULL_DAY: ClubNow = { dateStr: '', minutes: 0 };

/** Tous les créneaux d'une journée, passés compris. */
export function slotsOfDay(date: string): string[] {
  return getSlotsForDate(date, FULL_DAY);
}

/**
 * Taux de remplissage des jours À VENIR (aujourd'hui compris) : créneaux-terrains
 * réservés rapportés à la capacité totale (créneaux du jour × nombre de terrains).
 *
 * Tourné vers l'avant, volontairement : un gérant ne décide rien avec le
 * remplissage de la semaine passée, il décide avec ce qui reste à vendre.
 */
export function occupancy(
  bookings: StatBooking[],
  startDate: string,
  days: number,
): { rate: number; booked: number; capacity: number } {
  const dates = Array.from({ length: days }, (_, i) => addDaysStr(startDate, i));
  const inRange = new Set(dates);
  const capacity = dates.reduce((sum, d) => sum + slotsOfDay(d).length * COURTS.length, 0);
  const booked = bookings.filter((b) => isActive(b) && b.date && inRange.has(b.date)).length;
  return { rate: capacity > 0 ? booked / capacity : 0, booked, capacity };
}

/** Réservations par créneau horaire, dans l'ordre de la journée. */
export function peakHours(bookings: StatBooking[]): Array<{ time: string; count: number }> {
  const counts = new Map<string, number>();
  for (const t of slotsOfDay('2026-01-01')) counts.set(t, 0);
  for (const b of bookings) {
    if (!isActive(b) || !b.time_slot) continue;
    counts.set(b.time_slot, (counts.get(b.time_slot) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

/** Numéro réduit à ses chiffres : « +212 661 02 03 04 » et « 0661020304 » sont le même client. */
const phoneKey = (phone?: string) => (phone ?? '').replace(/\D/g, '').slice(-9);

export type Client = { key: string; name: string; phone: string; visits: number; last: string };

/** Clients classés par nombre de venues (réservations non refusées). */
export function clients(bookings: StatBooking[]): Client[] {
  const map = new Map<string, Client>();
  for (const b of bookings) {
    const key = phoneKey(b.phone);
    if (!isActive(b) || !key) continue;
    const found = map.get(key);
    if (found) {
      found.visits += 1;
      if ((b.date ?? '') > found.last) found.last = b.date ?? '';
    } else {
      map.set(key, { key, name: b.name || '—', phone: b.phone || '', visits: 1, last: b.date ?? '' });
    }
  }
  return [...map.values()].sort((a, b) => b.visits - a.visits || b.last.localeCompare(a.last));
}

export type PlanningCell = { slot: string; booking?: StatBooking };
export type PlanningRow = { court: number; cells: PlanningCell[] };

/**
 * Planning d'une journée : une ligne par terrain, une colonne par créneau.
 *
 * Les demandes reçues sans terrain attribué (parcours WhatsApp, anciennes
 * demandes) ne sont pas inventées sur un terrain : elles sortent à part, pour
 * que le gérant les place lui-même.
 */
export function dayPlanning(
  bookings: StatBooking[],
  date: string,
): { slots: string[]; rows: PlanningRow[]; unassigned: StatBooking[] } {
  const slots = slotsOfDay(date);
  const ofDay = bookings.filter((b) => isActive(b) && b.date === date);

  const placed = new Map<string, StatBooking>();
  const unassigned: StatBooking[] = [];
  for (const b of ofDay) {
    if (typeof b.court === 'number' && b.time_slot) placed.set(`${b.court}_${b.time_slot}`, b);
    else unassigned.push(b);
  }

  const rows = COURTS.map((court) => ({
    court,
    cells: slots.map((slot) => ({ slot, booking: placed.get(`${court}_${slot}`) })),
  }));

  return { slots, rows, unassigned };
}

/** Revenus d'un mois ('yyyy-MM'), au tarif d'un créneau. */
export function revenueOfMonth(bookings: StatBooking[], month: string): number {
  return bookings.filter((b) => isActive(b) && b.date?.startsWith(month)).length * PRICE_MAD;
}

/** Export tableur : le gérant ouvre ses réservations dans Excel. */
export function toCsv(bookings: StatBooking[]): string {
  const head = ['Date', 'Heure', 'Terrain', 'Client', 'Téléphone', 'Joueurs', 'Niveau', 'Statut', 'Reçue le'];
  const cell = (v: unknown) => {
    const s = String(v ?? '');
    // Un nom contenant « ; » ou un retour à la ligne casserait la colonne.
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = bookings.map((b) =>
    [b.date, b.time_slot, b.court ?? '', b.name, b.phone, b.players ?? '', b.level ?? '', b.status ?? 'pending', b.created_at]
      .map(cell)
      .join(';'),
  );
  // BOM : sans lui, Excel affiche « Ã© » à la place des accents.
  return `﻿${head.join(';')}\n${rows.join('\n')}`;
}

import clubConfig from '@/config/club.config';

// Fuseau du club. Le serveur Vercel tourne en UTC, le navigateur du visiteur
// peut être n'importe où : on ramène tout le monde à l'heure de Tanger pour que
// le rendu serveur et le rendu client soient identiques (pas d'erreur
// d'hydratation) et que les créneaux passés soient bien ceux du club.
export const CLUB_TIMEZONE = 'Africa/Casablanca';

export type ClubNow = {
  /** Date du jour au club, format 'yyyy-MM-dd'. */
  dateStr: string;
  /** Minutes écoulées depuis minuit au club (ex: 14h30 → 870). */
  minutes: number;
};

/** Heure courante au club, dérivée de l'instant absolu → identique serveur/client. */
export function getClubNow(at: Date = new Date()): ClubNow {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLUB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(at);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  const hour = parseInt(get('hour'), 10) % 24; // '24' possible sur certains runtimes

  return {
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: hour * 60 + parseInt(get('minute'), 10),
  };
}

/** Ajoute n jours à une date 'yyyy-MM-dd' (calcul en UTC, insensible au fuseau). */
export function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.trim().split(':').map((v) => parseInt(v, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
};

const fromMinutes = (mins: number): string => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Plage d'ouverture du club en minutes depuis minuit.
 * '09:00 - 00:00' → { open: 540, close: 1440 } (minuit = fin de journée, pas 0h).
 */
export function getOpeningRange(): { open: number; close: number } {
  const ranges = Object.values(clubConfig.openingHours);
  const raw = ranges[0] ?? '09:00 - 00:00';
  const [openRaw, closeRaw] = raw.split('-').map((s) => s.trim());

  let open = toMinutes(openRaw);
  let close = toMinutes(closeRaw);

  if (Number.isNaN(open)) open = 9 * 60;
  if (Number.isNaN(close)) close = 24 * 60;
  // Fermeture à minuit (ou après) : on la traite comme la fin de la journée.
  if (close <= open) close += 24 * 60;

  return { open, close };
}

/**
 * Créneaux réservables pour une date donnée ('yyyy-MM-dd').
 * Construits depuis openingHours + slotDurationMinutes, moins bookedSlots,
 * moins les créneaux déjà passés si la date est aujourd'hui.
 * Un créneau n'est proposé que s'il se termine avant l'heure de fermeture.
 */
export function getSlotsForDate(dateStr: string, now: ClubNow = getClubNow()): string[] {
  const { open, close } = getOpeningRange();
  const duration = clubConfig.slotDurationMinutes || 90;
  const booked = new Set(clubConfig.bookedSlots ?? []);
  const isToday = dateStr === now.dateStr;
  // Arrondi à 10 min : le serveur et le client ne rendent pas à la milliseconde
  // près, cet arrondi garantit qu'ils calculent la même liste.
  const nowMinutes = Math.floor(now.minutes / 10) * 10;

  const slots: string[] = [];
  for (let start = open; start + duration <= close; start += duration) {
    const time = fromMinutes(start);
    // Marge de 30 min : on ne propose pas un créneau qui commence dans l'instant.
    if (isToday && start <= nowMinutes + 30) continue;
    if (booked.has(`${dateStr}T${time}`)) continue;
    slots.push(time);
  }
  return slots;
}

// Stockage local des réservations (mode démo) — fiable, instantané, sans dépendance.
// Permet le flux « je réserve → je vois la résa sur le tableau de bord » même sans
// Firebase. Les données restent dans le navigateur (démo). Pour du multi-appareils
// réel → Firebase (voir firebaseAdmin.ts / firestore.rules).

export type StoredBooking = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time_slot: string;
  level: string;
  players: number;
  created_at: string;
  club_slug: string;
};

const KEY = 'gp_bookings';

export function saveBooking(b: StoredBooking) {
  if (typeof window === 'undefined') return;
  try {
    const all = getBookings();
    all.unshift(b);
    window.localStorage.setItem(KEY, JSON.stringify(all.slice(0, 500)));
  } catch {
    // ignore quota / private mode
  }
}

export function getBookings(): StoredBooking[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

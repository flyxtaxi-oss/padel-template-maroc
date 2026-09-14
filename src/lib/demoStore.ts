// Stockage local des réservations (mode démo) — fiable, instantané, sans dépendance.
// Permet le flux « je réserve → je vois la résa sur le tableau de bord » même sans
// Firebase. Les données restent dans le navigateur (démo). Pour du multi-appareils
// réel → Firebase (voir firebaseAdmin.ts / firestore.rules).

/** Cycle de vie d'une demande : reçue → confirmée ou refusée par le gérant. */
export type BookingStatus = 'pending' | 'confirmed' | 'declined';

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
  /** Langue du client au moment de la demande — pour lui répondre dans sa langue. */
  locale?: string;
  /** Absent sur les anciennes demandes : à lire comme 'pending'. */
  status?: BookingStatus;
  status_updated_at?: string;
  /** Terrain attribué (réservation instantanée uniquement). */
  court?: number;
};

export type StoredFeedback = {
  id: string;
  rating: number;
  comment: string;
  name: string;
  phone: string;
  created_at: string;
  club_slug: string;
};

const KEY = 'gp_bookings';
const FEEDBACK_KEY = 'gp_feedbacks';

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

/** Change le statut d'une demande stockée localement (mode démo / repli). */
export function updateLocalBookingStatus(id: string, status: BookingStatus): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const all = getBookings();
    const b = all.find((x) => x.id === id);
    if (!b) return false;
    b.status = status;
    b.status_updated_at = new Date().toISOString();
    window.localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
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

export function saveFeedback(f: StoredFeedback) {
  if (typeof window === 'undefined') return;
  try {
    const all = getFeedbacks();
    all.unshift(f);
    window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all.slice(0, 500)));
  } catch {
    // ignore quota / private mode
  }
}

export function getFeedbacks(): StoredFeedback[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(FEEDBACK_KEY) || '[]');
  } catch {
    return [];
  }
}

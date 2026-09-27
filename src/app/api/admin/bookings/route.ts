import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import clubConfig from '@/config/club.config';
import { LEDGER_COLLECTION, ledgerId, pickFreeCourt, readTaken } from '@/lib/slotLedger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/bookings  { code }
 *
 * Seul chemin de lecture des réservations et des retours clients.
 *
 * Pourquoi côté serveur : `firestore.rules` interdit toute lecture depuis un
 * navigateur (`allow read: if false`). Les numéros de téléphone des clients ne
 * doivent jamais être exposés à qui ouvre le site. L'Admin SDK contourne les
 * règles avec la clé de service, qui ne quitte jamais le serveur — et le code
 * gérant est vérifié ici, pas dans du JavaScript que n'importe qui peut lire.
 *
 * Réponses :
 *  - 200 { bookings, feedbacks }        lecture distante réussie
 *  - 401 { error }                      code incorrect
 *  - 503 { error, reason }              backend non configuré — le tableau de
 *                                       bord bascule en mode local et le dit.
 */

type Unconfigured = 'no_admin_code' | 'no_service_account';

function unconfigured(reason: Unconfigured, error: string, detail?: string) {
  return NextResponse.json({ error, reason, detail }, { status: 503 });
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_CODE;
  if (!expected) {
    return unconfigured('no_admin_code', 'ADMIN_CODE non configuré côté serveur');
  }

  let code = '';
  try {
    const body = await req.json();
    code = typeof body?.code === 'string' ? body.code : '';
  } catch {
    code = '';
  }

  if (code !== expected) {
    return NextResponse.json({ error: 'Code incorrect' }, { status: 401 });
  }

  const admin = getAdminFirestore();
  if ('error' in admin) {
    // Le détail distingue « clé absente » de « clé malformée » : sans lui, le
    // gérant (et jibril) voit le même message dans les deux cas.
    return unconfigured(
      'no_service_account',
      admin.error === 'missing'
        ? 'FIREBASE_SERVICE_ACCOUNT non configuré'
        : 'FIREBASE_SERVICE_ACCOUNT invalide',
      admin.detail,
    );
  }
  const db = admin.db;

  // Une réservation sans `club_slug` date d'avant l'ajout du champ : on la
  // garde plutôt que de la faire disparaître du tableau de bord.
  const belongsToClub = (d: { club_slug?: string }) => !d.club_slug || d.club_slug === clubConfig.slug;

  // Chaque document lu est facturé une lecture Firestore, à chaque
  // rafraîchissement du tableau de bord. 500 documents par collection, c'était
  // dix fois ce que l'écran affiche (30 réservations, 50 retours) : le quota
  // gratuit partait en fumée sans qu'aucun de ces documents ne soit regardé.
  // Le tri par `created_at` décroissant garde les plus récents, les seuls qui
  // comptent pour un planning et des statistiques à 7 jours.
  async function readCollection<T extends { club_slug?: string }>(name: string, max: number): Promise<T[]> {
    const snap = await db.collection(name).orderBy('created_at', 'desc').limit(max).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as T).filter(belongsToClub);
  }

  try {
    // Les deux lectures sont indépendantes : en parallèle.
    const [bookings, feedbacks] = await Promise.all([
      readCollection<{ id: string; club_slug?: string }>('booking_requests', 150),
      readCollection<{ id: string; club_slug?: string }>('feedbacks', 50),
    ]);
    return NextResponse.json({ bookings, feedbacks });
  } catch (err) {
    console.error('admin read error', err);
    return NextResponse.json({ error: 'Lecture impossible' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/bookings  { code, id, status }
 *
 * Le gérant confirme ou refuse une demande. Même garde que POST : code vérifié
 * ici, écriture via l'Admin SDK (les règles Firestore interdisent toute
 * modification depuis un navigateur).
 */
const STATUSES = new Set(['pending', 'confirmed', 'declined']);

export async function PATCH(req: Request) {
  const expected = process.env.ADMIN_CODE;
  if (!expected) return unconfigured('no_admin_code', 'ADMIN_CODE non configuré côté serveur');

  let body: { code?: unknown; id?: unknown; status?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  if (body.code !== expected) return NextResponse.json({ error: 'Code incorrect' }, { status: 401 });

  const id = typeof body.id === 'string' ? body.id : '';
  const status = typeof body.status === 'string' ? body.status : '';
  if (!id || !STATUSES.has(status)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
  }

  const admin = getAdminFirestore();
  if ('error' in admin) {
    return unconfigured('no_service_account', 'FIREBASE_SERVICE_ACCOUNT non utilisable', admin.detail);
  }

  try {
    const { db } = admin;
    const ref = db.collection('booking_requests').doc(id);
    const stamp = new Date().toISOString();

    // Transaction : refuser une réservation instantanée libère son terrain dans
    // le registre des créneaux ; la réactiver le reprend, s'il est encore libre.
    const outcome = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return 'not_found' as const;

      const b = snap.data() as { date?: string; time_slot?: string; status?: string; court?: number };
      const wasActive = (b.status ?? 'pending') !== 'declined';
      const willBeActive = status !== 'declined';
      const patch: Record<string, unknown> = { status, status_updated_at: stamp };

      // Les anciennes demandes (sans `court`) ne sont pas dans le registre.
      if (typeof b.court === 'number' && b.date && b.time_slot && wasActive !== willBeActive) {
        const ledgerRef = db.collection(LEDGER_COLLECTION).doc(ledgerId(b.date, b.time_slot));
        const ledger = await tx.get(ledgerRef);
        const taken = ledger.exists ? readTaken(ledger.get('courts_taken')) : [];

        if (!willBeActive) {
          tx.set(ledgerRef, { courts_taken: taken.filter((c) => c !== b.court), updated_at: stamp }, { merge: true });
        } else {
          const court = taken.includes(b.court) ? pickFreeCourt(taken) : b.court;
          if (court === null) return 'slot_full' as const;
          tx.set(ledgerRef, { courts_taken: [...taken, court], updated_at: stamp }, { merge: true });
          patch.court = court;
        }
      }

      tx.update(ref, patch);
      return 'ok' as const;
    });

    if (outcome === 'not_found') return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    if (outcome === 'slot_full') return NextResponse.json({ error: 'Créneau complet entre-temps' }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('admin status update error', err);
    return NextResponse.json({ error: 'Mise à jour impossible' }, { status: 500 });
  }
}

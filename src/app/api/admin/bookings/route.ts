import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import clubConfig from '@/config/club.config';

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

  async function readCollection<T extends { club_slug?: string }>(name: string): Promise<T[]> {
    const snap = await db.collection(name).orderBy('created_at', 'desc').limit(500).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as T).filter(belongsToClub);
  }

  try {
    // Les deux lectures sont indépendantes : en parallèle.
    const [bookings, feedbacks] = await Promise.all([
      readCollection<{ id: string; club_slug?: string }>('booking_requests'),
      readCollection<{ id: string; club_slug?: string }>('feedbacks'),
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
    const ref = admin.db.collection('booking_requests').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    await ref.update({ status, status_updated_at: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('admin status update error', err);
    return NextResponse.json({ error: 'Mise à jour impossible' }, { status: 500 });
  }
}

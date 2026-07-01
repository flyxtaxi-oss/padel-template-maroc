import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import clubConfig from '@/config/club.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin/bookings  { code }
// Vérifie le code gérant côté serveur, puis renvoie les réservations.
// Le code et la clé de service ne quittent jamais le serveur.
export async function POST(req: Request) {
  const expected = process.env.ADMIN_CODE;
  if (!expected) {
    return NextResponse.json({ error: 'ADMIN_CODE non configuré' }, { status: 503 });
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

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: 'FIREBASE_SERVICE_ACCOUNT non configuré' }, { status: 503 });
  }

  try {
    const snap = await db
      .collection('booking_requests')
      .orderBy('created_at', 'desc')
      .limit(500)
      .get();

    const bookings = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Record<string, unknown> & { club_slug?: string },
    );
    const filtered = bookings.filter((b) => !b.club_slug || b.club_slug === clubConfig.slug);

    return NextResponse.json({ bookings: filtered });
  } catch (err) {
    console.error('admin bookings read error', err);
    return NextResponse.json({ error: 'Lecture impossible' }, { status: 500 });
  }
}

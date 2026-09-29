import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import defaultClub from '@/config/club.config';
import { adminCode, hasValidSession, isSameOrigin, unauthorized } from '@/lib/adminAuth';
import { applySettings, editableFrom, sanitizeSettings } from '@/lib/clubSettings';
import { readSettings, settingsStorage, SETTINGS_TAG, writeSettings } from '@/lib/clubSettings.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * GET /api/admin/settings  → { values, club, storage, updatedAt }
 * PUT /api/admin/settings  { …réglages } → enregistre et met le site à jour
 *
 * Même garde que les réservations : session gérant obligatoire quand
 * ADMIN_CODE est configuré. En démonstration (aucun code), l'onglet reste
 * utilisable en local — jamais en production (stockage `none`).
 */
function guard(req: Request): NextResponse | null {
  if (!adminCode()) {
    // Démo locale uniquement : en production, un espace sans code ne doit rien modifier.
    return process.env.NODE_ENV === 'production'
      ? NextResponse.json({ error: 'ADMIN_CODE non configuré', reason: 'no_admin_code' }, { status: 503 })
      : null;
  }
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Origine refusée' }, { status: 403 });
  if (!hasValidSession(req)) return unauthorized();
  return null;
}

export async function GET(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  const saved = await readSettings();
  const club = applySettings(defaultClub, saved);
  return NextResponse.json(
    { values: editableFrom(club), club, storage: settingsStorage(), updatedAt: saved?.updated_at ?? null },
    { headers: NO_STORE },
  );
}

export async function PUT(req: Request) {
  const denied = guard(req);
  if (denied) return denied;

  if (settingsStorage() === 'none') {
    return NextResponse.json(
      { error: 'Enregistrement impossible : la base de données n’est pas configurée (FIREBASE_SERVICE_ACCOUNT).' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Données illisibles.' }, { status: 400 });
  }

  const parsed = sanitizeSettings(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    await writeSettings(parsed.settings);
  } catch (err) {
    console.error('settings write error', err);
    return NextResponse.json({ error: 'Enregistrement impossible pour le moment.' }, { status: 500 });
  }

  // Le site public est généré à l'avance : on invalide les données en cache
  // et toutes les pages, qui se régénèrent à la prochaine visite.
  revalidateTag(SETTINGS_TAG, { expire: 0 });
  revalidatePath('/', 'layout');

  const club = applySettings(defaultClub, parsed.settings);
  return NextResponse.json({ ok: true, values: editableFrom(club), club }, { headers: NO_STORE });
}

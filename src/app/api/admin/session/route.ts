import { NextResponse } from 'next/server';
import {
  adminCode, adminCodeIsWeak, clearFailures, clearSessionCookie, clientIp, codeMatches,
  createSessionCookie, hasValidSession, isSameOrigin, lockedMinutes, recordFailure,
} from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * GET    /api/admin/session          → { authed, configured, weakCode }
 * POST   /api/admin/session { code } → ouvre une session de 30 jours
 * DELETE /api/admin/session          → déconnexion
 *
 * Réponses du POST :
 *  - 200 { ok }                         cookie de session posé
 *  - 401 { error, attemptsLocked? }     code incorrect
 *  - 429 { error, minutes }             trop d'essais : attendre
 *  - 503 { reason: 'no_admin_code' }    ADMIN_CODE absent : mode démo local
 */
export async function GET(req: Request) {
  return NextResponse.json(
    { authed: hasValidSession(req), configured: Boolean(adminCode()), weakCode: adminCode() ? adminCodeIsWeak() : false },
    { headers: NO_STORE },
  );
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Origine refusée' }, { status: 403 });
  if (!adminCode()) {
    return NextResponse.json({ error: 'ADMIN_CODE non configuré', reason: 'no_admin_code' }, { status: 503 });
  }

  const ip = clientIp(req);
  const wait = await lockedMinutes(ip);
  if (wait > 0) {
    return NextResponse.json({ error: 'Trop d’essais', minutes: wait }, { status: 429, headers: NO_STORE });
  }

  let code = '';
  try {
    const body = await req.json();
    code = typeof body?.code === 'string' ? body.code.slice(0, 200) : '';
  } catch {
    code = '';
  }

  if (!codeMatches(code)) {
    const locked = await recordFailure(ip);
    // Ralentit un script qui enchaîne les essais, sans gêner un humain.
    await new Promise((r) => setTimeout(r, 600));
    if (locked) {
      return NextResponse.json({ error: 'Trop d’essais', minutes: locked }, { status: 429, headers: NO_STORE });
    }
    return NextResponse.json({ error: 'Code incorrect' }, { status: 401, headers: NO_STORE });
  }

  await clearFailures(ip);
  const res = NextResponse.json({ ok: true }, { headers: NO_STORE });
  createSessionCookie(res);
  return res;
}

export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Origine refusée' }, { status: 403 });
  const res = NextResponse.json({ ok: true }, { headers: NO_STORE });
  clearSessionCookie(res);
  return res;
}

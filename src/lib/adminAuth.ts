import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';

/**
 * Authentification de l'espace gérant — entièrement côté serveur.
 *
 * Avant : le code gérant était aussi exposé en `NEXT_PUBLIC_ADMIN_CODE`, donc
 * écrit en clair dans le JavaScript public, avec un code par défaut dans le
 * dépôt. N'importe qui pouvait le lire puis appeler l'API et récupérer les noms
 * et téléphones des clients. Désormais :
 *  - le code n'existe que dans `ADMIN_CODE` (variable serveur) ;
 *  - un code accepté ouvre une session de 30 jours dans un cookie httpOnly
 *    signé (HMAC), illisible par le JavaScript de la page ;
 *  - changer `ADMIN_CODE` sur Vercel déconnecte toutes les sessions (la clé de
 *    signature en dérive) ;
 *  - 5 échecs depuis la même adresse bloquent les essais 15 minutes.
 */

const SESSION_DAYS = 30;
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;
const GUARD_COLLECTION = 'admin_login_guard';

// `__Host-` : le navigateur refuse ce cookie s'il n'est pas Secure, sur `/`,
// sans domaine — il ne peut donc être ni posé ni lu par un sous-domaine.
const COOKIE = process.env.NODE_ENV === 'production' ? '__Host-gp_admin' : 'gp_admin';

export function adminCode(): string | null {
  const code = process.env.ADMIN_CODE?.trim();
  return code ? code : null;
}

/** Un code court se devine ; le tableau de bord le signale au gérant. */
export function adminCodeIsWeak(): boolean {
  return (adminCode()?.length ?? 0) < 12;
}

const sha256 = (s: string) => createHash('sha256').update(s).digest();

/** Comparaison à temps constant (les empreintes égalisent les longueurs). */
export function codeMatches(input: string): boolean {
  const expected = adminCode();
  if (!expected) return false;
  return timingSafeEqual(sha256(input), sha256(expected));
}

function signingKey(code: string) {
  return sha256(`gp-admin-session:${code}`);
}

function sign(payload: string, code: string) {
  return createHmac('sha256', signingKey(code)).update(payload).digest('base64url');
}

export function createSessionCookie(res: NextResponse) {
  const code = adminCode();
  if (!code) return;
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  res.cookies.set(COOKIE, `${payload}.${sign(payload, code)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function hasValidSession(req: Request): boolean {
  const code = adminCode();
  const raw = readCookie(req, COOKIE);
  if (!code || !raw) return false;
  const [payload, mac] = raw.split('.');
  if (!payload || !mac) return false;
  const expected = Buffer.from(sign(payload, code));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp?: number };
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

/**
 * Refuse une requête qui modifie l'état si elle ne vient pas du site lui-même.
 * Le cookie est déjà `SameSite=Strict` ; c'est une seconde barrière.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // navigateurs anciens / requêtes same-origin sans en-tête
  try {
    return new URL(origin).host === new URL(req.url).host
      || new URL(origin).host === req.headers.get('x-forwarded-host');
  } catch {
    return false;
  }
}

export function clientIp(req: Request): string {
  return req.headers.get('x-real-ip')
    || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

// ── Limitation des essais ────────────────────────────────────────────────
// Stockée dans Firestore quand il est configuré : les fonctions Vercel ne
// partagent pas leur mémoire, un compteur en mémoire se contournerait en
// tombant sur une autre instance. L'adresse IP n'est jamais stockée en clair.
const memoryGuard = new Map<string, { fails: number; lockedUntil: number }>();

function guardId(ip: string) {
  return createHash('sha256').update(`gp-login:${ip}:${adminCode() ?? ''}`).digest('hex').slice(0, 32);
}

type Guard = { fails: number; lockedUntil: number };

async function readGuard(id: string): Promise<Guard> {
  const admin = getAdminFirestore();
  if (!('error' in admin)) {
    try {
      const snap = await admin.db.collection(GUARD_COLLECTION).doc(id).get();
      if (snap.exists) {
        return { fails: Number(snap.get('fails')) || 0, lockedUntil: Number(snap.get('locked_until')) || 0 };
      }
      return { fails: 0, lockedUntil: 0 };
    } catch {
      // Firestore indisponible : repli mémoire ci-dessous.
    }
  }
  return memoryGuard.get(id) ?? { fails: 0, lockedUntil: 0 };
}

async function writeGuard(id: string, g: Guard | null) {
  const admin = getAdminFirestore();
  if (!('error' in admin)) {
    try {
      const ref = admin.db.collection(GUARD_COLLECTION).doc(id);
      if (g) await ref.set({ fails: g.fails, locked_until: g.lockedUntil, updated_at: new Date().toISOString() });
      else await ref.delete();
      return;
    } catch {
      // repli mémoire
    }
  }
  if (g) memoryGuard.set(id, g);
  else memoryGuard.delete(id);
}

/** Minutes restantes de blocage, ou 0 si l'adresse peut essayer. */
export async function lockedMinutes(ip: string): Promise<number> {
  const g = await readGuard(guardId(ip));
  const left = g.lockedUntil - Date.now();
  return left > 0 ? Math.ceil(left / 60_000) : 0;
}

export async function recordFailure(ip: string): Promise<number> {
  const id = guardId(ip);
  const g = await readGuard(id);
  const fails = (g.lockedUntil && g.lockedUntil < Date.now() ? 0 : g.fails) + 1;
  const lockedUntil = fails >= MAX_FAILS ? Date.now() + LOCK_MS : 0;
  await writeGuard(id, { fails: lockedUntil ? 0 : fails, lockedUntil });
  return lockedUntil ? Math.ceil(LOCK_MS / 60_000) : 0;
}

export async function clearFailures(ip: string) {
  await writeGuard(guardId(ip), null);
}

/** Réponse standard quand l'appelant n'a pas de session valide. */
export function unauthorized() {
  return NextResponse.json({ error: 'Session expirée', reason: 'no_session' }, { status: 401 });
}

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Admin SDK — serveur uniquement. Contourne les règles Firestore pour lire les
 * réservations en toute sécurité (jamais exposé au navigateur).
 *
 * Nécessite `FIREBASE_SERVICE_ACCOUNT` : le JSON de la clé de service, généré
 * dans console Firebase → Paramètres → Comptes de service → Générer une
 * nouvelle clé privée. À coller en une seule ligne dans les variables
 * d'environnement Vercel.
 *
 * Les deux pièges classiques sont distingués explicitement : une clé absente et
 * une clé malformée produisaient auparavant le même `null` silencieux, ce qui
 * rendait le diagnostic impossible depuis le tableau de bord.
 */

export type AdminInitError = 'missing' | 'invalid_json' | 'invalid_credentials';

let cached: App | null = null;

function getAdminApp(): { app: App } | { error: AdminInitError; detail?: string } {
  if (cached) return { app: cached };
  if (getApps().length) {
    cached = getApps()[0]!;
    return { app: cached };
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw || !raw.trim()) return { error: 'missing' };

  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    return { error: 'invalid_json', detail: 'FIREBASE_SERVICE_ACCOUNT n’est pas du JSON valide.' };
  }

  // Les trois champs sans lesquels `cert()` échoue de façon opaque.
  const missing = (['project_id', 'client_email', 'private_key'] as const).filter(
    (k) => typeof serviceAccount[k] !== 'string' || !(serviceAccount[k] as string).trim(),
  );
  if (missing.length) {
    return { error: 'invalid_credentials', detail: `Champs manquants dans la clé : ${missing.join(', ')}.` };
  }

  try {
    cached = initializeApp({ credential: cert(serviceAccount as never) });
    return { app: cached };
  } catch (err) {
    return {
      error: 'invalid_credentials',
      detail: err instanceof Error ? err.message : 'Initialisation Firebase Admin impossible.',
    };
  }
}

/** Firestore côté serveur, ou la raison précise de l'échec. */
export function getAdminFirestore():
  | { db: FirebaseFirestore.Firestore }
  | { error: AdminInitError; detail?: string } {
  const res = getAdminApp();
  if ('error' in res) return res;
  return { db: getFirestore(res.app) };
}

/** Compat : renvoie la base ou `null`. Préférer `getAdminFirestore()`. */
export function getAdminDb() {
  const res = getAdminFirestore();
  return 'error' in res ? null : res.db;
}

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Admin SDK — serveur uniquement. Contourne les règles Firestore pour lire
// les réservations en toute sécurité (jamais exposé au navigateur).
// Nécessite la variable d'environnement FIREBASE_SERVICE_ACCOUNT (JSON de la
// clé de service, à générer dans console Firebase → Paramètres → Comptes de
// service → Générer une nouvelle clé privée).

function getAdminApp(): App | null {
  if (getApps().length) return getApps()[0]!;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const serviceAccount = JSON.parse(raw);
    return initializeApp({ credential: cert(serviceAccount) });
  } catch {
    return null;
  }
}

export function getAdminDb() {
  const app = getAdminApp();
  if (!app) return null;
  return getFirestore(app);
}

import 'server-only';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { unstable_cache } from 'next/cache';
import defaultClub, { type ClubConfig } from '@/config/club.config';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { applySettings, type ClubSettings } from '@/lib/clubSettings';

/**
 * Stockage des réglages « Mon club ».
 *
 *  - Production : Firestore, document `club_settings/{slug}`, lu et écrit
 *    uniquement par le serveur (les règles ferment la collection au navigateur).
 *  - Développement sans Firebase : fichier `.data/club-settings.json` (ignoré
 *    par git), pour tester l'onglet en local.
 *  - Production sans Firebase : lecture seule (valeurs du fichier de config) ;
 *    l'enregistrement renvoie une erreur explicite.
 */

export const SETTINGS_TAG = 'club-settings';
const COLLECTION = 'club_settings';
const LOCAL_FILE = join(process.cwd(), '.data', 'club-settings.json');

export type SettingsStorage = 'firestore' | 'file' | 'none';

export function settingsStorage(): SettingsStorage {
  if (!('error' in getAdminFirestore())) return 'firestore';
  return process.env.NODE_ENV === 'production' ? 'none' : 'file';
}

export async function readSettings(): Promise<ClubSettings | null> {
  const storage = settingsStorage();
  try {
    if (storage === 'firestore') {
      const admin = getAdminFirestore();
      if ('error' in admin) return null;
      const snap = await admin.db.collection(COLLECTION).doc(defaultClub.slug).get();
      return snap.exists ? (snap.data() as ClubSettings) : null;
    }
    if (storage === 'file') {
      return JSON.parse(await readFile(LOCAL_FILE, 'utf8')) as ClubSettings;
    }
  } catch {
    // Fichier absent ou Firestore momentanément injoignable : valeurs par défaut.
  }
  return null;
}

export async function writeSettings(settings: ClubSettings): Promise<void> {
  const storage = settingsStorage();
  const doc = { ...settings, updated_at: new Date().toISOString() };
  if (storage === 'firestore') {
    const admin = getAdminFirestore();
    if ('error' in admin) throw new Error('Firestore indisponible');
    await admin.db.collection(COLLECTION).doc(defaultClub.slug).set(doc);
    return;
  }
  if (storage === 'file') {
    await mkdir(join(process.cwd(), '.data'), { recursive: true });
    await writeFile(LOCAL_FILE, JSON.stringify(doc, null, 2));
    return;
  }
  throw new Error('Aucun stockage configuré (FIREBASE_SERVICE_ACCOUNT manquant).');
}

/**
 * Config du club en vigueur (défauts + réglages du gérant), mise en cache.
 * L'enregistrement dans « Mon club » invalide l'étiquette `club-settings` :
 * les pages sont régénérées à la visite suivante.
 */
export const getClub: () => Promise<ClubConfig> = unstable_cache(
  async () => applySettings(defaultClub, await readSettings()),
  ['club-settings-v1'],
  { tags: [SETTINGS_TAG], revalidate: 3600 },
);

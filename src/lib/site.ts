import clubConfig from '@/config/club.config';

// URL canonique du site. Vercel expose VERCEL_PROJECT_PRODUCTION_URL au build,
// ce qui évite de dépendre d'une variable oubliée. NEXT_PUBLIC_SITE_URL reste
// prioritaire pour le jour où le club branche son propre nom de domaine.
export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://padel-one-xi.vercel.app');

/** Pages publiques, hors outils internes (/admin, /qr). */
export const PUBLIC_PATHS = ['', '/avis', '/mentions-legales', '/confidentialite'] as const;

export const LOCALES = clubConfig.locales;

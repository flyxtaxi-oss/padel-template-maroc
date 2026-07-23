import { MetadataRoute } from 'next';
import { SITE_URL, LOCALES, PUBLIC_PATHS } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency: (path === '' ? 'weekly' : 'yearly') as 'weekly' | 'yearly',
      priority: path === '' ? (locale === 'fr' ? 1 : 0.8) : 0.3,
      // hreflang : chaque URL déclare ses équivalents dans les autres langues.
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`]),
        ),
      },
    })),
  );
}

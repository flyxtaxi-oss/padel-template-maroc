import { MetadataRoute } from 'next';
import { SITE_URL, LOCALES } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Outils internes du gérant : jamais indexés, jamais découvrables via Google.
  const internal = LOCALES.flatMap((l) => [`/${l}/admin`, `/${l}/qr`]);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: internal,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

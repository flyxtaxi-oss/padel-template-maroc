import type { Metadata } from 'next';
import clubConfig from '@/config/club.config';

// La page /avis est un composant client : ses métadonnées vivent ici.
// Sans ce layout, elle héritait du titre, de la description ET du canonical
// de l'accueil — déclarée doublon de la home auprès de Google.
const TITLE: Record<string, string> = {
  fr: 'Votre avis',
  en: 'Your review',
  es: 'Tu opinión',
  ar: 'رأيك',
};
const DESCRIPTION: Record<string, string> = {
  fr: `Donnez votre avis sur ${clubConfig.name} à Tanger : votre retour aide le club à s'améliorer.`,
  en: `Share your experience at ${clubConfig.name}, Tangier: your feedback helps the club improve.`,
  es: `Comparte tu experiencia en ${clubConfig.name}, Tánger: tu opinión ayuda al club a mejorar.`,
  ar: `شاركنا تجربتك في ${clubConfig.name} بطنجة: رأيك يساعد النادي على التحسن.`,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const path = '/avis';
  return {
    title: `${TITLE[locale] || TITLE.fr} — ${clubConfig.name}`,
    description: DESCRIPTION[locale] || DESCRIPTION.fr,
    openGraph: { url: `/${locale}${path}`, title: `${TITLE[locale] || TITLE.fr} — ${clubConfig.name}`, description: DESCRIPTION[locale] || DESCRIPTION.fr, images: [{ url: clubConfig.hero.mediaPath, width: 1200, height: 630, alt: clubConfig.name }] },
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        ...Object.fromEntries(clubConfig.locales.map((l) => [l, `/${l}${path}`])),
        'x-default': `/${clubConfig.defaultLocale}${path}`,
      },
    },
  };
}

export default function AvisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

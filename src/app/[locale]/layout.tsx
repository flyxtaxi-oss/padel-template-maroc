import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import clubConfig from "@/config/club.config";
import { SITE_URL } from "@/lib/site";
import { getOpeningRange } from "@/lib/schedule";
import { metaDescription, metaTitle } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

// La variable s'appelle --font-jetbrains-mono, PAS --font-mono : globals.css
// définit le token de thème `--font-mono`, et lui donner le même nom créait une
// référence circulaire (`--font-mono: var(--font-mono)`) qui invalidait la
// variable. Résultat : tous les `.font-mono` (prix, compteurs, stats) étaient
// rendus en Inter au lieu de JetBrains Mono.
const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = clubConfig.locales.includes(resolvedParams.locale) ? resolvedParams.locale : clubConfig.defaultLocale;
  
  const title = metaTitle(locale);
  const description = metaDescription(locale);
  
  const languages = clubConfig.locales.reduce((acc, loc) => {
    acc[loc] = `/${loc}`;
    return acc;
  }, {} as Record<string, string>);
  // x-default : la version servie quand aucune langue du visiteur ne correspond.
  languages['x-default'] = `/${clubConfig.defaultLocale}`;

  return {
    // metadataBase rend canonical/hreflang/OG absolus — sans lui, Next émet des
    // URLs relatives que Google interprète mal.
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: ['padel Tanger', 'club de padel', 'terrain padel indoor', 'réservation padel Tanger', 'Golden Padel Club'],
    openGraph: {
      type: 'website',
      siteName: clubConfig.name,
      locale,
      url: `${SITE_URL}/${locale}`,
      title,
      description,
      // Pas d'`images` ici : l'aperçu est généré par `opengraph-image.tsx`, au
      // format 1200×630. Déclarer la photo du hero revenait à annoncer un
      // portrait de 640 px comme une bannière paysage — WhatsApp et Facebook
      // le rognaient. Une valeur ici écraserait l'image générée.
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  // Un segment inconnu (`/inexistant.xml`, `/wp-login.php`…) tombait ici en
  // « fr » et servait la page d'accueil en 200 : soft-404, contenu dupliqué
  // aux yeux de Google. Un locale invalide est un vrai 404.
  if (!clubConfig.locales.includes(resolvedParams.locale)) notFound();
  const locale = resolvedParams.locale;
  const isRtl = locale === 'ar';

  // Horaires : schema.org attend des jours en anglais, pas la clé française
  // « Tous les jours » (qui était invalide et ignorée par Google).
  const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const { open, close } = getOpeningRange();
  const fmt = (mins: number) => `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

  const prices = clubConfig.pricing.map((p) => p.price);
  const priceRange = prices.length
    ? `${Math.min(...prices)}–${Math.max(...prices)} MAD`
    : 'MAD';

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["SportsActivityLocation", "LocalBusiness"],
        "@id": `${SITE_URL}/#business`,
        name: clubConfig.name,
        description: clubConfig.about.text[locale] || clubConfig.about.text[clubConfig.defaultLocale],
        image: `${SITE_URL}${clubConfig.hero.mediaPath}`,
        url: `${SITE_URL}/${locale}`,
        telephone: clubConfig.contact.phone,
        currenciesAccepted: "MAD",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Marjane, Route de Rabat",
          addressLocality: "Tanger",
          postalCode: "90000",
          addressRegion: "Tanger-Tétouan-Al Hoceïma",
          addressCountry: "MA"
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: clubConfig.contact.lat,
          longitude: clubConfig.contact.lng
        },
        openingHoursSpecification: [{
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ALL_DAYS,
          opens: fmt(open),
          closes: fmt(close)
        }],
        priceRange,
        sport: "Padel",
        sameAs: [clubConfig.contact.instagram],
        // GEO : ce que Google et les assistants utilisent pour répondre à
        // « padel près de moi », « club de padel ouvert ce soir à Tanger ».
        hasMap: `https://www.google.com/maps/search/?api=1&query=${clubConfig.contact.lat},${clubConfig.contact.lng}`,
        areaServed: { "@type": "City", name: "Tanger" },
        publicAccess: true,
        isAccessibleForFree: false,
        // Le paiement se fait sur place (cf. FAQ) : on ne déclare rien d'autre.
        paymentAccepted: "Cash",
        // Langues parlées par l'équipe, telles qu'annoncées dans la FAQ.
        knowsLanguage: ["ar", "fr", "en"],
        // Équipements affichés sur la page « Terrains & tarifs ». Une IA qui
        // répond « est-ce qu'il y a un parking / des douches ? » lit ceci.
        amenityFeature: [
          ["Terrains indoor", true],
          ["Climatisation", true],
          ["Éclairage LED", true],
          ["Vidéosurveillance", true],
          ["Douches & vestiaires", true],
          ["Pro-shop", true],
          ["Parking privé gratuit", true],
        ].map(([name, value]) => ({
          "@type": "LocationFeatureSpecification",
          name,
          value,
        })),
        // Tarifs explicites : une IA interrogée sur le prix cite ce chiffre au
        // lieu d'en inventer un.
        makesOffer: clubConfig.pricing.map((p) => ({
          "@type": "Offer",
          name: p.label[locale] || p.label[clubConfig.defaultLocale],
          price: p.price,
          priceCurrency: "MAD",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/${locale}#booking`,
        })),
        potentialAction: {
          "@type": "ReserveAction",
          target: `${SITE_URL}/${locale}#booking`
        }
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/${locale}`,
        name: clubConfig.name,
        inLanguage: locale,
        publisher: { "@id": `${SITE_URL}/#business` }
      },
      ...(clubConfig.faq && clubConfig.faq.length > 0 ? [{
        "@type": "FAQPage",
        mainEntity: clubConfig.faq.map(f => ({
          "@type": "Question",
          name: f.question[locale] || f.question[clubConfig.defaultLocale],
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer[locale] || f.answer[clubConfig.defaultLocale]
          }
        }))
      }] : [])
    ]
  };

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      className={`${inter.variable} ${fraunces.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body 
        className="min-h-full flex flex-col bg-background text-foreground"
        style={{
          "--primary": clubConfig.brandColors.primary,
          "--secondary": clubConfig.brandColors.secondary,
          "--accent": clubConfig.brandColors.accent,
        } as React.CSSProperties}
      >
        {children}
        {/* Audience réelle du site (Vercel Analytics) : sans cookie, sans
            bannière de consentement, l'adresse IP n'étant ni stockée ni
            revendue. C'est ce qui permettra au club de savoir combien de
            visiteurs il reçoit vraiment — jusqu'ici le tableau de bord n'avait
            qu'un chiffre de démonstration. À activer une fois dans Vercel :
            projet → onglet Analytics → Enable. */}
        <Analytics />
      </body>
    </html>
  );
}

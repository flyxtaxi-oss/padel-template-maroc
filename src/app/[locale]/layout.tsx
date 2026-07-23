import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import clubConfig from "@/config/club.config";
import { SITE_URL } from "@/lib/site";
import { getOpeningRange } from "@/lib/schedule";

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

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = clubConfig.locales.includes(resolvedParams.locale) ? resolvedParams.locale : clubConfig.defaultLocale;
  
  const title = `${clubConfig.name} - ${clubConfig.tagline[locale] || clubConfig.tagline[clubConfig.defaultLocale]}`;
  const description = clubConfig.about.text[locale]?.slice(0, 160) || clubConfig.about.text[clubConfig.defaultLocale].slice(0, 160);
  
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
      images: [{ url: clubConfig.hero.mediaPath, width: 1200, height: 630, alt: clubConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [clubConfig.hero.mediaPath],
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
  const locale = clubConfig.locales.includes(resolvedParams.locale) ? resolvedParams.locale : clubConfig.defaultLocale;
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
        potentialAction: {
          "@type": "ReserveAction",
          target: `${SITE_URL}/${locale}#booking`
        }
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
      </body>
    </html>
  );
}

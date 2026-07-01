import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import clubConfig from "@/config/club.config";

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
  
  return {
    title,
    description,
    openGraph: {
      title: clubConfig.name,
      description,
      images: [{ url: clubConfig.hero.mediaPath }],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: clubConfig.locales.reduce((acc, loc) => {
        acc[loc] = `/${loc}`;
        return acc;
      }, {} as Record<string, string>)
    }
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["SportsActivityLocation", "LocalBusiness"],
        "@id": `${clubConfig.name.replace(/\s+/g, '-').toLowerCase()}-business`,
        name: clubConfig.name,
        image: clubConfig.hero.mediaPath,
        url: "", 
        telephone: clubConfig.contact.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: clubConfig.contact.address,
          addressCountry: "MA"
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: clubConfig.contact.lat,
          longitude: clubConfig.contact.lng
        },
        openingHoursSpecification: Object.entries(clubConfig.openingHours).map(([days, hours]) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: days,
          opens: hours.split(' - ')[0],
          closes: hours.split(' - ')[1]
        })),
        priceRange: "MAD",
        sameAs: [clubConfig.contact.instagram]
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

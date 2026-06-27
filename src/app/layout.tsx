import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import clubConfig from "@/config/club.config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${clubConfig.name} - ${clubConfig.tagline}`,
  description: clubConfig.about.text.slice(0, 160),
  openGraph: {
    title: clubConfig.name,
    description: clubConfig.tagline,
    images: [{ url: clubConfig.hero.mediaPath }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate JSON-LD LocalBusiness schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: clubConfig.name,
    image: clubConfig.hero.mediaPath,
    "@id": "",
    url: "", // In a real app, this would be the actual domain
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
    openingHoursSpecification: Object.entries(clubConfig.openingHours).map(([days, hours]) => {
      // Very basic schema parsing, assumes "Lundi - Vendredi" format could be refined
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days,
        opens: hours.split(' - ')[0],
        closes: hours.split(' - ')[1]
      };
    }),
    sameAs: [clubConfig.contact.instagram]
  };

  const isRtl = clubConfig.enableArabic;

  return (
    <html
      lang={isRtl ? "ar" : "fr"}
      dir={isRtl ? "rtl" : "ltr"}
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
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

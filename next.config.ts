import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin est un package Node serveur — ne pas le bundler.
  serverExternalPackages: ["firebase-admin"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Anti-clickjacking. Pas de CSP script-src : Next injecte des scripts
          // inline (hydratation) qui imposeraient 'unsafe-inline', ce qui
          // viderait la directive de son sens. frame-ancestors suffit ici.
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
  images: {
    // AVIF avant WebP : ~30 % plus léger que WebP sur des photos de terrain.
    // Compte pour beaucoup sur mobile 4G marocaine, cible principale du site.
    formats: ["image/avif", "image/webp"],
    // Largeurs que le site est autorisé à demander.
    //
    // Par défaut Next monte jusqu'à 3840 px. Sur un écran large, le hero
    // (`sizes="100vw"`) réclamait donc une version 3840 px… d'une photo qui
    // fait 1080 px de large. Le serveur partait encoder en AVIF une image
    // agrandie quatre fois : plusieurs secondes de calcul pendant lesquelles
    // le hero restait NOIR, pour un résultat plus flou que l'original.
    // Plafonner à 1920 px supprime ce travail inutile — et sur Vercel, chaque
    // variante générée est facturée.
    // ⚠️ À relever le jour où le club fournira ses photos en haute définition.
    // La plus grande photo fournie fait 1080 px : au-delà, on ferait encoder
    // au serveur un agrandissement plus lourd ET plus flou que l'original.
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
};

export default nextConfig;

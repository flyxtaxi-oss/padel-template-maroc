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
  },
};

export default nextConfig;

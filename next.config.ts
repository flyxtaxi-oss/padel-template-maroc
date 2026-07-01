import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin est un package Node serveur — ne pas le bundler.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;

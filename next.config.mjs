// Bindings Cloudflare disponibles en `next dev`, via OpenNext.
// Remplace setupDevPlatform de @cloudflare/next-on-pages, qui est ABANDONNÉ
// (npm : « Please use the OpenNext adapter instead »).
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "norvika.ca" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "image.thum.io" },
      { protocol: "https", hostname: "lepimentszechuan.com" },
      { protocol: "https", hostname: "www.vergerfrancoislegault.ca" },
    ],
  },

  // Refonte du 2026-08-21 : l'ancienne URL gardait du referencement, elle part
  // en 301 pour que le « jus SEO » suive la nouvelle page.
  async redirects() {
    return [
      // statusCode 301 explicite : `permanent: true` renvoie un 308, que Google
      // traite pareil, mais que de vieux robots et annuaires ne suivent pas.
      { source: "/photo-video", destination: "/photo-et-video", statusCode: 301 },
    ];
  },

  // En-têtes de sécurité, appliqués par le Worker Cloudflare.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

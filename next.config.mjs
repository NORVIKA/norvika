// Bindings Cloudflare disponibles en `next dev`, via OpenNext.
// Remplace setupDevPlatform de @cloudflare/next-on-pages, qui est ABANDONNÉ
// (npm : « Please use the OpenNext adapter instead »).
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ne pas annoncer le framework dans chaque reponse.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Images du Studio Sanity (projet k99pdqd1), servies par son CDN.
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "norvika.ca" },
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
          // HSTS : une fois vu, le navigateur refuse le HTTP en clair sur ce
          // domaine. Volontairement SANS `includeSubDomains` ni `preload` :
          // les deux s'appliqueraient a tous les sous-domaines et le preload
          // se defait tres difficilement.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Politique de sécurité du contenu (CSP). Empeche l'injection de
          // scripts externes, l'inclusion du site dans une iframe tierce, et le
          // detournement des formulaires vers un autre domaine.
          //
          // `'unsafe-inline'` sur script-src reste necessaire : Next injecte ses
          // scripts d'hydratation en ligne, sans nonce. Le vrai gain est
          // ailleurs (script-src limite au domaine, form-action, base-uri,
          // frame-ancestors, object-src). Le site n'affiche jamais de HTML
          // fourni par un visiteur, donc la surface XSS reste minime.
          //
          // Supabase et Resend sont appeles cote serveur uniquement : le
          // navigateur ne parle plus a Supabase depuis le retrait du /admin
          // (2026-11-16), d'ou son absence de connect-src et de img-src.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // ⚠️ `unsafe-eval` UNIQUEMENT en developpement. React s'en sert en
              // mode dev pour reconstruire les piles d'appel ; sans lui, `npm run
              // dev` perd ses outils de debogage. React n'utilise JAMAIS eval en
              // production, donc la regle reste stricte sur le site en ligne.
              //
              // ⛔ static.cloudflareinsights.com n'est VOLONTAIREMENT plus
              // autorise : le beacon d'analytics que Cloudflare injectait tout
              // seul est coupe (decision William, 2026-08-22). Tant qu'il n'est
              // pas aussi desactive dans le tableau de bord Cloudflare, la CSP
              // l'empeche de s'executer.
              //
              // cdn-cookieyes.com : la banniere de consentement.
              // googletagmanager.com : GA4, qui ne mesure qu'apres acceptation.
              // challenges.cloudflare.com : Turnstile, l'anti-robot des formulaires
              // (script, iframe de la case et verification).
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://cdn-cookieyes.com https://www.googletagmanager.com https://challenges.cloudflare.com`,
              "style-src 'self' 'unsafe-inline' https://cdn-cookieyes.com",
              // Plus de i.ytimg.com (2026-11-18) : les vignettes des videos sont servies par le
              // site lui-meme (lib/vignettes-youtube.ts), rien ne part chez Google avant le clic.
              "img-src 'self' data: https://cdn.sanity.io https://placehold.co https://image.thum.io https://cdn-cookieyes.com https://*.google-analytics.com https://*.googletagmanager.com",
              "font-src 'self' data: https://cdn-cookieyes.com",
              // La video de fond du haut de l'accueil, televersee dans le Studio : sans cette
              // ligne, `default-src 'self'` bloque le fichier et le fond reste sur son image.
              "media-src 'self' https://cdn.sanity.io",
              "connect-src 'self' https://cdn-cookieyes.com https://log.cookieyes.com https://directives.cookieyes.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://challenges.cloudflare.com",
              // Les lecteurs YouTube des fiches de realisation. Le domaine
              // youtube-nocookie.com ne depose rien avant que le visiteur
              // clique sur lecture, et le lecteur n'est insere qu'a ce
              // moment-la. Sans cette ligne, `default-src 'self'` bloquerait
              // l'iframe et la video resterait un cadre vide.
              "frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // Isole le contexte de navigation des fenetres ouvertes par le site.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import { getSiteData } from "@/lib/get-site-data";

// Le design n'utilise Sora qu'en 600 (titres) et DM Sans qu'en 400/500/600.
// Charger les autres graisses, c'est du poids de police pour rien.
const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Norvika · Vos courtiers des outils numériques",
    template: "%s | Norvika",
  },
  description:
    "Sites web, automatisation, photo et vidéo pour les entreprises du Québec. On comprend votre réalité, puis on bâtit une offre qui vous ressemble.",
  metadataBase: new URL("https://norvika.ca"),
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: "https://norvika.ca",
    siteName: "Norvika",
    images: [
      {
        url: "/assets/lau-et-will-2.webp",
        alt: "Laurianne Plouffe et William Simard, fondateurs de Norvika",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: [{ url: "/favicon.png", type: "image/png" }, { url: "/icon.svg", type: "image/svg+xml" }] },
};

// Identifiant GA4. Absent = aucun script de mesure n'est emis du tout, ce qui
// est le defaut sain : on n'installe un traceur que si quelqu'un l'a demande.
// ⚠️ Variable NEXT_PUBLIC_*, donc FIGEE AU MOMENT DE LA CONSTRUCTION : elle doit
// exister dans les variables du depot pour que l'action GitHub la voie.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// ISR : le shell est prerendere et servi en cache a l'edge, le Worker ne
// rebatit pas la page a chaque visite (c'est ce qui declenche l'erreur 1102).
export const revalidate = 3600;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteInfo } = await getSiteData();
  const email = siteInfo.email || "info@norvika.ca";

  return (
    <html lang="fr" className={`${sora.variable} ${dmSans.variable}`}>
      <head>
        {/* COOKIEYES INSERT HERE */}
        {/* Banniere de consentement. Doit venir EN PREMIER dans le <head> :
            c'est elle qui debloque les traceurs, donc elle doit exister avant
            qu'un traceur puisse se declencher. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts --
            Le chargement synchrone est VOULU et ne doit pas etre « corrige ».
            La banniere doit exister avant qu'un traceur puisse se declencher ;
            en `async`, GA4 pourrait partir avant elle et deposer un temoin sans
            consentement, ce qui est exactement ce que la Loi 25 interdit. */}
        <script
          id="cookieyes"
          type="text/javascript"
          src="https://cdn-cookieyes.com/client_data/6581bcd9cee3517fb2a568c0bccd08d2/script.js"
        />

        {/* GA4 INSERT HERE */}
        {/* ⛔ LOI 25, art. 8.1 : AUCUN temoin de mesure avant un consentement
            explicite. Le mode consentement de Google est donc pose a « refuse »
            par defaut, AVANT le chargement de gtag. Sans ce bloc, GA4 depose
            _ga des la premiere visite et le cas 2 du test (refuser, verifier
            qu'il n'y a toujours rien) echoue.
            CookieYes envoie ensuite un `consent: update` quand le visiteur
            accepte, et seulement a ce moment-la GA4 se met a mesurer. */}
        {GA_ID ? (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);`,
              }}
            />
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`,
              }}
            />
          </>
        ) : null}

        {/* GSC VERIFICATION INSERT HERE */}
        {/* Sans JS, l'observateur ne pose jamais .is-in et le contenu resterait invisible. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Norvika",
              url: "https://norvika.ca",
              email,
              telephone: siteInfo.telephone || "438 522 4275",
              description:
                "Présence numérique pour les entreprises et les travailleurs autonomes.",
              areaServed: { "@type": "Place", name: "Québec, Canada" },
              serviceType: [
                "Création de sites web",
                "Automatisation",
                "Photo et vidéo",
                "Formation",
              ],
              founder: [
                { "@type": "Person", name: "Laurianne Plouffe" },
                { "@type": "Person", name: "William Simard" },
              ],
              // Note Google, affichee sur l'accueil (section « Avis Google »).
              // Sert les extraits enrichis et les reponses des moteurs IA (GEO).
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5.0",
                reviewCount: "6",
                bestRating: "5",
              },
              review: [
                {
                  "@type": "Review",
                  reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
                  author: { "@type": "Person", name: "Marie-Claire Huard" },
                  reviewBody:
                    "Je recommande Norvika et Laurianne sans aucune hésitation. Un service humain, personnalisé et un résultat à la hauteur de nos attentes.",
                },
                {
                  "@type": "Review",
                  reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
                  author: { "@type": "Person", name: "Mélodie Colpron" },
                  reviewBody:
                    "Une équipe professionnelle, dynamique et super agréable. Je recommande leurs services à 100 pour cent.",
                },
              ],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

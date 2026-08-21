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
        {/* GA4 INSERT HERE */}
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
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

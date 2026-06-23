import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteData } from "@/lib/get-site-data";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Norvika — Présence numérique pour entreprises du Québec",
    template: "%s | Norvika",
  },
  description:
    "On trouve ce qui vous freine, de votre site à vos tâches répétitives, puis on le règle avec vous.",
  metadataBase: new URL("https://norvika.ca"),
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: "https://norvika.ca",
    siteName: "Norvika",
    images: [
      {
        url: "/images/fondateurs.png",
        width: 1200,
        height: 630,
        alt: "Les fondateurs de Norvika",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteInfo, colors } = await getSiteData();

  const cssVars = {
    "--primary": colors.primary,
    "--brand": colors.brand,
    "--background": colors.background,
    "--foreground": colors.foreground,
    "--cream": colors.cream,
    "--brand-soft": colors.accent,
  } as React.CSSProperties;

  const rdvLink = siteInfo.lien_rdv || "https://calendar.app.google/W5SS5UmnJCTLXhw8A";
  const email = siteInfo.email || "info@norvika.ca";

  return (
    <html lang="fr" className={`${sora.variable} ${dmSans.variable}`}>
      <head>
        {/* COOKIEYES INSERT HERE */}
        {/* GA4 INSERT HERE */}
        {/* GSC VERIFICATION INSERT HERE */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Norvika",
              url: "https://norvika.ca",
              email: email,
              telephone: siteInfo.telephone || "438 522 4275",
              description:
                "Présence numérique pour les entreprises et les travailleurs autonomes.",
              areaServed: { "@type": "Place", name: "Québec, Canada" },
              serviceType: ["Création de sites web", "Automatisation", "Photo et vidéo"],
            }),
          }}
        />
      </head>
      <body style={cssVars}>
        <Header rdvLink={rdvLink} hideCtaUntilScroll={false} />
        <main className="flex-1">{children}</main>
        <Footer email={email} />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import { FournisseurContenu } from "@/components/site/ContenuGlobal";
import { obtenirContenu } from "@/lib/contenu";

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

// Les valeurs par défaut (titre, description, image de partage) viennent de « Infos de
// l'entreprise » dans le Studio. Chaque page remplace le titre et la description par les siens.
export async function generateMetadata(): Promise<Metadata> {
  const { parametres } = await obtenirContenu();
  return {
    title: {
      default: parametres.seoTitreDefaut,
      template: `%s | ${parametres.nom}`,
    },
    description: parametres.seoDescriptionDefaut,
    metadataBase: new URL("https://norvika.ca"),
    openGraph: {
      type: "website",
      locale: "fr_CA",
      url: "https://norvika.ca",
      siteName: parametres.nom,
      images: [
        {
          url: parametres.imagePartage.url,
          alt: parametres.imagePartage.alt ?? "",
        },
      ],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
    // Icônes : app/favicon.ico, app/icon.png et app/apple-icon.png, lus par Next.
    // Générées sur fond navy plein par scripts/generer-icones.mjs.
  };
}

// Identifiant GA4. Absent = aucun script de mesure n'est emis du tout, ce qui
// est le defaut sain : on n'installe un traceur que si quelqu'un l'a demande.
// ⚠️ Variable NEXT_PUBLIC_*, donc FIGEE AU MOMENT DE LA CONSTRUCTION : elle doit
// exister dans les variables du depot pour que l'action GitHub la voie.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Pages entierement statiques, batties une fois au deploiement.
//
// ⚠️ C'ETAIT « export const revalidate = 3600 », et ce reglage mentait.
// Il met les pages en mode ISR : Next les considere perimees apres une heure et
// tente de les rebatir. Sauf que notre cache incrementiel
// (staticAssetsIncrementalCache, voir open-next.config.ts) est en LECTURE SEULE :
// il ne peut RIEN reecrire. La page restait donc « perimee » a perpetuite.
//
// Deux degats, tous les deux invisibles en test :
// 1. Next annoncait « s-maxage=2, stale-while-revalidate=2592000 », ce qui
//    autorise un navigateur a afficher une page vieille de 30 JOURS avant
//    d'aller verifier. Cette vieille page pointe vers des fichiers CSS qui
//    n'existent plus depuis le dernier deploiement : le site s'affichait sans
//    ses couleurs jusqu'a ce qu'on rafraichisse.
// 2. Chaque visite declenchait une reconstruction de la page dans le Worker,
//    pour un resultat jamais conserve. C'est la charge par rendu qui mene a
//    l'erreur 1102.
//
// « force-static » dit la verite : le contenu vient de Sanity au moment de la
// construction et ne change que lorsqu'on redeploie (publication dans le Studio).
// Resultat mesurable : x-nextjs-cache passe de STALE a HIT.
export const dynamic = "force-static";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contenu = await obtenirContenu();
  const { parametres } = contenu;
  const global = {
    parametres,
    navigation: contenu.navigation,
    blocContact: contenu.blocContact,
    page404: contenu.page404,
    services: contenu.services,
  };

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
              name: parametres.nom,
              url: "https://norvika.ca",
              email: parametres.courriel,
              telephone: parametres.telephone,
              description: parametres.description,
              // Zone desservie PRECISE, invisible a l'ecran mais lue par Google : une
              // seule entree « Québec, Canada » ne dit rien pour une recherche locale
              // (veille SEO du 2026-09-14). Ville de Québec en premier : c'est la cible
              // de developpement (William, 2026-09-14). Pas d'adresse postale tant que
              // le siege n'est pas confirme. Liste tenue dans « Infos de l'entreprise ».
              areaServed: parametres.zonesDesservies.map((z) => ({ "@type": z.type, name: z.nom })),
              serviceType: parametres.typesDeService,
              founder: parametres.fondateurs.map((nom) => ({ "@type": "Person", name: nom })),
              // Note Google, affichee sur l'accueil (section « Avis Google »).
              // Sert les extraits enrichis et les reponses des moteurs IA (GEO).
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: parametres.noteGoogle,
                reviewCount: parametres.nombreAvisGoogle,
                bestRating: "5",
              },
              // Les avis qui ont un « Extrait lu par Google » dans le Studio.
              review: contenu.avis
                .filter((a) => a.extraitGoogle)
                .map((a) => ({
                  "@type": "Review",
                  reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
                  author: { "@type": "Person", name: a.nom },
                  reviewBody: a.extraitGoogle,
                })),
            }),
          }}
        />
      </head>
      <body>
        <FournisseurContenu valeur={global}>{children}</FournisseurContenu>
      </body>
    </html>
  );
}

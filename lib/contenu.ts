import "server-only";
import { cache } from "react";

import { clientSanity } from "./sanity";
import { typographier } from "./typographie";
import type {
  Avis,
  BlocContact,
  ContenuGlobal,
  Membre,
  Navigation,
  Page404,
  PageAccueil,
  PageAutomatisation,
  PageBienvenue,
  PageContact,
  PageDiagnostic,
  PageEquipe,
  PageFormation,
  PagePhotoVideo,
  PagePlanDuSite,
  PageRealisations,
  PageVerificateur,
  PageSitesWeb,
  Parametres,
  Realisation,
  ServiceResume,
} from "./types-contenu";

/**
 * TOUT le contenu affiché vient d'ici, donc de Sanity (zéro texte en dur, règle Sanity 5).
 *
 * UNE seule requête GROQ pour tout le site, lue AU BUILD (pages statiques) et gardée en mémoire
 * pendant la construction : chaque page la réutilise au lieu d'en refaire une (règle 1102, et
 * quota Sanity ménagé). Le site d'avant faisait la même chose avec Supabase.
 *
 * ⛔ Une erreur de lecture ARRÊTE la construction (aucune valeur de repli) : mieux vaut un
 *    déploiement refusé qu'un site en ligne sans texte.
 */

const IMAGE = `{ "url": asset->url, "largeur": asset->metadata.dimensions.width, "hauteur": asset->metadata.dimensions.height, alt, "hotspot": hotspot{ x, y } }`;
const URL = `asset->url`;
const AVANT_APRES = `{ "avant": avant.${URL}, "avant2x": avant2x.${URL}, "apres": apres.${URL}, "apres2x": apres2x.${URL}, alt, adresse, legende }`;
// `_updatedAt` : la vraie date de modification, lue par le sitemap (même requête, aucun aller-retour de plus).
const REALISATION = `{
  _updatedAt, "slug": slug.current, nom, secteur, categories, siteWeb, resume, besoin, mandat, resultat,
  "logo": logo${IMAGE}, logoStyle, logoForme, logoEchelle, "couverture": couverture${IMAGE},
  "avantApres": avantApres${AVANT_APRES}, video
}`;
const SEO = `seoTitre, seoDescription, partageTitre, partageDescription, "partageImage": partageImage${IMAGE}`;

/** Le chemin de chaque page de service : l'adresse est une affaire de code (routes, redirections). */
export const CHEMINS_SERVICES = {
  pageSitesWeb: "/sites-web",
  pageAutomatisation: "/automatisation",
  pagePhotoVideo: "/photo-et-video",
  pageFormation: "/formation",
} as const;

const REQUETE = `{
  "parametres": *[_id == "parametres"][0]{ ..., "imagePartage": imagePartage${IMAGE}, "logoEntete": logoEntete${IMAGE}, "logoPied": logoPied${IMAGE} },
  "navigation": *[_id == "navigation"][0],
  "blocContact": *[_id == "blocContact"][0],
  "page404": *[_id == "page404"][0],
  "services": *[_type in ${JSON.stringify(Object.keys(CHEMINS_SERVICES))} && !(_id in path("drafts.**"))] | order(ordre asc){ _type, nom, accroche, detail },
  "accueil": *[_id == "pageAccueil"][0]{
    ..., ${SEO},
    heroVideo{ afficher, "ordinateur": ordinateur.${URL}, "mobile": mobile.${URL}, "affiche": affiche${IMAGE}, boutonPause, boutonLecture },
    videos{ ..., liste[]{ youtubeId, titre, "fiche": realisation->slug.current } },
    avantApres{ ..., "realisation": realisation->{ "slug": slug.current, "avantApres": avantApres${AVANT_APRES} } },
    logos{ ..., "liste": realisations[]->{ nom, logoStyle, "logo": logo${IMAGE} } },
    fondateurs{ ..., "photo": photo${IMAGE} }
  },
  "avis": *[_type == "avis" && afficher != false && !(_id in path("drafts.**"))] | order(ordre asc){ _updatedAt, nom, contexte, signature, accroche, suite, extraitGoogle },
  "sitesWeb": *[_id == "pageSitesWeb"][0]{ ..., ${SEO} },
  "automatisation": *[_id == "pageAutomatisation"][0]{ ..., ${SEO} },
  "photoVideo": *[_id == "pagePhotoVideo"][0]{ ..., ${SEO}, tournage{ ..., "photo": photo${IMAGE} } },
  "formation": *[_id == "pageFormation"][0]{ ..., ${SEO} },
  "diagnostic": *[_id == "pageDiagnostic"][0]{ ..., ${SEO} },
  "verificateur": *[_id == "pageVerificateurLoi25"][0]{ ..., ${SEO} },
  "equipe": *[_id == "pageEquipe"][0]{ ..., ${SEO}, ensemble{ ..., "photo": photo${IMAGE} } },
  "membres": *[_type == "membre" && afficher != false && !(_id in path("drafts.**"))] | order(ordre asc){ _updatedAt, nom, role, texte, "photo": photo${IMAGE} },
  "realisationsPage": *[_id == "pageRealisations"][0]{ ..., ${SEO} },
  "realisations": *[_type == "realisation" && !(_id in path("drafts.**"))] | order(ordre asc)${REALISATION},
  "contact": *[_id == "pageContact"][0]{ ..., ${SEO} },
  "bienvenue": *[_id == "pageBienvenue"][0]{ ..., ${SEO} },
  "planDuSite": *[_id == "pagePlanDuSite"][0]{ ..., ${SEO} }
}`;

type Brut = {
  parametres: Parametres;
  navigation: Navigation;
  blocContact: BlocContact;
  page404: Page404;
  services: (Omit<ServiceResume, "chemin"> & { _type: keyof typeof CHEMINS_SERVICES })[];
  accueil: PageAccueil;
  avis: Avis[];
  sitesWeb: PageSitesWeb;
  automatisation: PageAutomatisation;
  photoVideo: PagePhotoVideo;
  formation: PageFormation;
  diagnostic: PageDiagnostic;
  verificateur: PageVerificateur;
  equipe: PageEquipe;
  membres: Membre[];
  realisationsPage: PageRealisations;
  realisations: Realisation[];
  contact: PageContact;
  bienvenue: PageBienvenue;
  planDuSite: PagePlanDuSite;
};

export type Contenu = Omit<Brut, "services"> & { services: ServiceResume[] };

async function lire(): Promise<Contenu> {
  // Apostrophes typographiques à l'affichage (lib/typographie.ts), avant tout le reste.
  const brut = typographier(await clientSanity.fetch<Brut>(REQUETE));
  const manquants = (Object.keys(brut) as (keyof Brut)[]).filter((cle) => brut[cle] == null);
  if (manquants.length) {
    throw new Error(`Sanity (k99pdqd1) : document(s) introuvable(s) : ${manquants.join(", ")}. Lancer le semis (studio/scripts/semer.ts).`);
  }
  return {
    ...brut,
    services: brut.services.map(({ _type, ...s }) => ({ ...s, chemin: CHEMINS_SERVICES[_type] })),
  };
}

// Pendant `next build`, une seule lecture pour toutes les pages du même processus. En
// développement, une lecture par rendu (cache de React), pour voir un changement du Studio
// en rechargeant la page.
let promesse: Promise<Contenu> | null = null;
const lireParRendu = cache(lire);

export function obtenirContenu(): Promise<Contenu> {
  if (process.env.NODE_ENV === "development") return lireParRendu();
  promesse ??= lire().catch((erreur) => {
    promesse = null;
    throw erreur;
  });
  return promesse;
}

/**
 * L'année du « © » au pied de page, à l'heure du Québec : la construction tourne en UTC chez Cloudflare,
 * et le 31 décembre à 19 h, il y serait déjà l'année suivante. Calculée au BUILD (pages statiques) :
 * elle change à la première publication de l'année, pas à minuit.
 */
function anneeAuQuebec(): number {
  return Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric" }).format(new Date()));
}

/** Ce que toutes les pages partagent (menu, pied de page, bloc de contact...), lu par app/layout.tsx. */
export async function obtenirGlobal(): Promise<ContenuGlobal> {
  const c = await obtenirContenu();
  return {
    parametres: c.parametres,
    navigation: c.navigation,
    blocContact: c.blocContact,
    page404: c.page404,
    services: c.services,
    annee: anneeAuQuebec(),
    lienVerificateur: c.verificateur.lienPied,
  };
}

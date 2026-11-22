import type { MetadataRoute } from "next";

import { CHEMINS_SERVICES, type Contenu } from "./contenu";
import { CHEMIN_VERIFICATEUR } from "./verificateur/types";

/**
 * LA liste des pages publiques, DÉCLARÉE UNE FOIS (règle d'agence 5). Elle nourrit le sitemap,
 * le plan du site et /llms.txt : une page ajoutée ici apparaît dans les trois.
 *
 * Les adresses sont une affaire de code (routes, redirections) ; les noms et les descriptions
 * viennent de Sanity (zéro texte en dur). Une fiche de réalisation publiée dans le Studio s'ajoute
 * toute seule, par `contenu.realisations`.
 *
 * Dates : `_updatedAt` du document Sanity de la page, lu dans la requête unique de lib/contenu.ts.
 * Quand le contenu principal d'une page est une collection (les fiches sur /realisations, les
 * membres sur /equipe, les avis sur l'accueil), la date retenue est la plus récente des deux :
 * ajouter une fiche change bien la page /realisations.
 */

export type PageDuSite = {
  /** Nom court, depuis Sanity. */
  nom: string;
  chemin: string;
  /** Description dans Google, depuis Sanity ; absente pour une page qui n'en a pas dans le Studio. */
  description?: string;
  /** Dernière modification (ISO). Absente pour une page hors Sanity. */
  modifie?: string;
  /** Hors sitemap et hors /llms.txt (page cachée de Google), mais listée dans le plan du site. */
  cacheeDeGoogle?: boolean;
  frequence: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priorite: number;
};

/** La plus récente de plusieurs dates ISO (elles se comparent comme du texte). */
export const plusRecente = (...dates: string[]): string => dates.reduce((a, b) => (b > a ? b : a));

/** Les pages publiques, dans l'ordre du site (celui du sitemap et du plan du site). */
export function pagesDuSite(c: Contenu): PageDuSite[] {
  const fiches = c.realisations.map((r) => r._updatedAt);
  const pages: PageDuSite[] = [
    {
      nom: c.navigation.filArianeAccueil,
      chemin: "/",
      description: c.accueil.seoDescription,
      modifie: plusRecente(c.accueil._updatedAt, ...c.avis.map((a) => a._updatedAt)),
      frequence: "monthly",
      priorite: 1,
    },
    ...(
      [
        [c.sitesWeb, CHEMINS_SERVICES.pageSitesWeb],
        [c.automatisation, CHEMINS_SERVICES.pageAutomatisation],
        [c.photoVideo, CHEMINS_SERVICES.pagePhotoVideo],
        [c.formation, CHEMINS_SERVICES.pageFormation],
      ] as const
    ).map(([p, chemin]) => ({
      nom: p.nom,
      chemin,
      description: p.seoDescription,
      modifie: p._updatedAt,
      frequence: "monthly" as const,
      priorite: 0.9,
    })),
    {
      nom: c.realisationsPage.nom,
      chemin: "/realisations",
      description: c.realisationsPage.seoDescription,
      modifie: plusRecente(c.realisationsPage._updatedAt, ...fiches),
      frequence: "monthly",
      priorite: 0.8,
    },
    {
      nom: c.equipe.nom,
      chemin: "/equipe",
      description: c.equipe.seoDescription,
      modifie: plusRecente(c.equipe._updatedAt, ...c.membres.map((m) => m._updatedAt)),
      frequence: "yearly",
      priorite: 0.7,
    },
    {
      nom: c.diagnostic.nom,
      chemin: "/diagnostic",
      description: c.diagnostic.seoDescription,
      modifie: c.diagnostic._updatedAt,
      frequence: "monthly",
      priorite: 0.8,
    },
    {
      nom: c.verificateur.nom,
      chemin: CHEMIN_VERIFICATEUR,
      description: c.verificateur.seoDescription,
      modifie: c.verificateur._updatedAt,
      frequence: "monthly",
      priorite: 0.8,
    },
    {
      nom: c.contact.nom,
      chemin: "/contact",
      description: c.contact.seoDescription,
      modifie: c.contact._updatedAt,
      frequence: "yearly",
      priorite: 0.7,
    },
    // La politique est cachée de Google et son texte n'est pas (encore) dans Sanity : son nom est
    // celui du lien du pied de page, et elle n'a ni description ni date.
    {
      nom: c.navigation.piedPolitique,
      chemin: "/politique-de-confidentialite",
      cacheeDeGoogle: true,
      frequence: "yearly",
      priorite: 0.1,
    },
  ];
  return pages;
}

/** Le plan du site lui-même : dans le sitemap, pas dans sa propre liste ni dans /llms.txt. */
export function pagePlanDuSite(c: Contenu): PageDuSite {
  const dates = pagesDuSite(c).flatMap((p) => (p.modifie ? [p.modifie] : []));
  return {
    nom: c.navigation.piedPlanDuSite,
    chemin: "/plan-du-site",
    description: c.planDuSite.seoDescription,
    modifie: plusRecente(c.planDuSite._updatedAt, ...dates),
    frequence: "monthly",
    priorite: 0.3,
  };
}

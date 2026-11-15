/**
 * Apostrophes typographiques à l'affichage : ' devient ’ dans tout le texte lu dans Sanity.
 *
 * Pourquoi à l'affichage et pas dans les données : le propriétaire du site tape une apostrophe
 * droite au clavier, comme tout le monde. La corriger ici protège chaque texte futur sans rien
 * lui demander (modèle : bistro-de-la-gare, lib/texte.ts). Le vérificateur de contenu
 * (scripts/verifier-contenu.mjs) refuse toute apostrophe droite dans le texte affiché.
 *
 * Laissés tels quels : les adresses (liens, courriel), les identifiants techniques, et les champs
 * « Google et partage » (titre et description dans Google gardent ce qui a été écrit, comme les
 * titres protégés du Studio).
 */
const CLES_INTACTES = new Set([
  "_id",
  "_type",
  "_key",
  "_ref",
  "slug",
  "url",
  "lien",
  "chemin",
  "youtubeId",
  "courriel",
  "siteWeb",
  "lienRendezVous",
  "lienPortfolio",
  "seoTitre",
  "seoDescription",
  "partageTitre",
  "partageDescription",
  "seoTitreDefaut",
  "seoDescriptionDefaut",
]);

const ADRESSE = /^(https?:|mailto:|tel:|\/)/;

export function apostrophes(texte: string): string {
  return ADRESSE.test(texte) ? texte : texte.replace(/'/g, "’");
}

/** Applique les apostrophes typographiques à toutes les chaînes d'une valeur, à toute profondeur. */
export function typographier<T>(valeur: T, cle?: string): T {
  if (cle && CLES_INTACTES.has(cle)) return valeur;
  if (typeof valeur === "string") return apostrophes(valeur) as T;
  if (Array.isArray(valeur)) return valeur.map((v) => typographier(v)) as T;
  if (valeur && typeof valeur === "object") {
    const sortie: Record<string, unknown> = {};
    for (const [c, v] of Object.entries(valeur)) sortie[c] = typographier(v, c);
    return sortie as T;
  }
  return valeur;
}

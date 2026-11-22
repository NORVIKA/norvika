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

/**
 * Espaces insécables de la typographie française : l'espace qui suit « et celle qui précède », : ;
 * ! ? devient insécable. Sans elle, un guillemet reste seul en fin de ligne et son mot passe à la
 * ligne suivante (vu au vérificateur Loi 25, 375 px : « après un clic sur « » puis « Accepter »
 * dans… »). Seule une espace déjà tapée est remplacée : aucune n'est ajoutée.
 */
export function insecables(texte: string): string {
  if (ADRESSE.test(texte)) return texte;
  return texte.replace(/« /g, "« ").replace(/ »/g, " »").replace(/ ([:;!?])/g, " $1");
}

/** Applique `corriger` à toutes les chaînes d'une valeur, à toute profondeur (sauf CLES_INTACTES). */
function parcourir<T>(valeur: T, corriger: (texte: string) => string, cle?: string): T {
  if (cle && CLES_INTACTES.has(cle)) return valeur;
  if (typeof valeur === "string") return corriger(valeur) as T;
  if (Array.isArray(valeur)) return valeur.map((v) => parcourir(v, corriger)) as T;
  if (valeur && typeof valeur === "object") {
    const sortie: Record<string, unknown> = {};
    for (const [c, v] of Object.entries(valeur)) sortie[c] = parcourir(v, corriger, c);
    return sortie as T;
  }
  return valeur;
}

/** Applique les apostrophes typographiques à toutes les chaînes d'une valeur, à toute profondeur. */
export function typographier<T>(valeur: T, cle?: string): T {
  return parcourir(valeur, apostrophes, cle);
}

/**
 * Espaces insécables partout dans une valeur. Appliqué aux textes du vérificateur Loi 25 (page et
 * bloc de /sites-web) ; le reste du site ne les a pas encore (voir le rapport QA du 2026-11-19).
 */
export function insecablesPartout<T>(valeur: T): T {
  return parcourir(valeur, insecables);
}

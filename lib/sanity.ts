import { createClient } from "@sanity/client";

/**
 * Projet Sanity de NORVIKA (organisation ohmk37dig). L'identifiant est public : il est écrit ici
 * en repli pour que la construction de l'action GitHub, où aucune variable Sanity n'est encore
 * définie, lise quand même le bon projet. Une variable NEXT_PUBLIC_SANITY_PROJECT_ID le remplace.
 */
const ID_PROJET = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "k99pdqd1";
const JEU_DE_DONNEES = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/**
 * Le client du RENDU. Toutes les pages publiques sont statiques : Sanity n'est lu qu'au build.
 * ⚠️ `useCdn: false` + `perspective: 'published'` (règle Sanity 7 de CLAUDE.md) : un build lancé
 *    juste après une publication (donc par le webhook) lirait sinon le CDN encore périmé et
 *    remettrait l'ancien texte en ligne, build vert et aucune erreur.
 * Aucun jeton : le jeu de données est public en lecture (vérifié le 2026-11-14, sans jeton).
 */
export const clientSanity = createClient({
  projectId: ID_PROJET,
  dataset: JEU_DE_DONNEES,
  apiVersion: "2025-02-19",
  useCdn: false,
  perspective: "published",
});

/**
 * Le client de l'EXÉCUTION : une lecture faite pendant une requête, jamais au build. Seul usage :
 * la route du vérificateur Loi 25 lit les textes du rapport par courriel au moment de l'envoyer.
 * `useCdn: true` (règle Sanity 7) : une lecture rapide et mise en cache par Sanity, sans réveiller
 * l'API à chaque analyse. Un texte publié à l'instant peut y arriver avec quelques secondes de retard.
 */
export const clientSanityExecution = createClient({
  projectId: ID_PROJET,
  dataset: JEU_DE_DONNEES,
  apiVersion: "2025-02-19",
  useCdn: true,
  perspective: "published",
});

// Post-build patch pour @cloudflare/next-on-pages 1.13.12
//
// Bug : quand la racine "/" est en rendu dynamique (force-dynamic), next-on-pages
// genere par erreur, dans _worker.js/index.js, une entree de route
//   "/": { type:"override", path:"/_next/static/not-found.txt" }
// au lieu de pointer "/" vers sa fonction. Resultat : la page d'accueil renvoie
// "Not Found" (200) alors que "/index" sert correctement la vraie page.
//
// Ce script reecrit l'entree "/" pour qu'elle pointe vers index.func.js,
// exactement comme l'entree "/index" generee correctement.
//
// A relancer apres CHAQUE `npx @cloudflare/next-on-pages`.

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const WORKER = ".vercel/output/static/_worker.js/index.js";

if (!existsSync(WORKER)) {
  console.error(`[fix-index-route] Fichier introuvable: ${WORKER}. Lancez d'abord le build next-on-pages.`);
  process.exit(1);
}

let src = readFileSync(WORKER, "utf8");

const BAD = `"/":{type:"override",path:"/_next/static/not-found.txt",headers:{"content-type":"text/plain"}}`;
const GOOD = `"/":{type:"function",entrypoint:"__next-on-pages-dist__/functions/index.func.js"}`;

if (src.includes(GOOD)) {
  console.log("[fix-index-route] Deja corrige, rien a faire.");
  process.exit(0);
}

if (!src.includes(BAD)) {
  // Cas normal quand la racine est rendue en STATIQUE (ISR) : "/" est un asset
  // prerendere (index.html), le bug d'override vers not-found.txt n'existe pas.
  // On ne fait rien et on ne casse pas le pipeline.
  console.log("[fix-index-route] Rien a corriger (racine statique/ISR ou deja OK).");
  process.exit(0);
}

src = src.replace(BAD, GOOD);
writeFileSync(WORKER, src);
console.log("[fix-index-route] OK : \"/\" pointe maintenant vers index.func.js.");

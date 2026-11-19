/**
 * Essai SANS réseau des règles par état du vérificateur Loi 25 (lib/verificateur/analyse.ts),
 * alignées sur celles de Martin (contenu/verificateur-loi25-textes.md, section 2).
 *
 *   npx tsx scripts/verificateur/essai-analyse.ts
 */
import { analyser, type Observations } from "../../lib/verificateur/analyse";

const POLITIQUE_COMPLETE =
  "Politique de confidentialité. Responsable de la protection des renseignements personnels : écrivez à vie.privee@exemple.ca. " +
  "Vos renseignements peuvent être traités hors du Québec, notamment aux États-Unis, par nos fournisseurs. " +
  "Vous avez un droit d'accès à vos renseignements, vous pouvez les faire rectifier et retirer votre consentement en tout temps. " +
  "Nous utilisons YouTube pour les vidéos. ".repeat(2);

const base = (o: Partial<Observations> = {}): Observations => ({
  adresse: "https://exemple.ca/",
  adresseFinale: "https://exemple.ca/",
  temoins: [],
  requetes: [],
  banniere: { outil: null, maison: false, refus: null },
  lienPolitique: { texte: "Politique de confidentialité", url: "https://exemple.ca/confidentialite" },
  politique: { url: "https://exemple.ca/confidentialite", statut: 200, texte: POLITIQUE_COMPLETE },
  https: "redirige",
  ...o,
});
const req = (url: string) => ({ url, hote: new URL(url).hostname, type: "script" });

let echecs = 0;
function attendre(nom: string, o: Observations, id: string, etat: string, cas?: string) {
  const r = analyser(o, Date.now()).resultats.find((x) => x.id === id)!;
  const ok = r.etat === etat && (!cas || r.cas === cas);
  if (!ok) echecs++;
  console.log(`${ok ? "ok    " : "ÉCHEC "} ${nom} : ${r.etat}/${r.cas}${ok ? "" : ` (attendu ${etat}/${cas ?? "?"})`} ${JSON.stringify(r.preuves)}`);
}

// 1. Témoins
attendre("aucun traceur", base(), "temoins", "en-place", "enPlace");
attendre("_ga déposé", base({ temoins: [{ nom: "_ga", domaine: ".exemple.ca" }], requetes: [req("https://www.googletagmanager.com/gtag/js?id=G-X")] }), "temoins", "a-corriger", "aCorriger");
attendre("envoi sans témoin (mode avancé)", base({ requetes: [req("https://region1.google-analytics.com/g/collect?v=2")] }), "temoins", "a-verifier", "aVerifier");
attendre("témoin de bannière seul", base({ temoins: [{ nom: "cookieyes-consent", domaine: "exemple.ca" }] }), "temoins", "en-place", "enPlace");
attendre("bouton j'aime Facebook n'est pas un pixel", base({ requetes: [req("https://www.facebook.com/plugins/like.php")] }), "temoins", "en-place");
// 2. Bannière
attendre("outil + refus", base({ banniere: { outil: "CookieYes", maison: false, refus: "Tout rejeter" } }), "banniere", "en-place", "enPlace");
attendre("outil + refus mais témoins", base({ banniere: { outil: "CookieYes", maison: false, refus: "Refuser" }, temoins: [{ nom: "_fbp", domaine: ".exemple.ca" }] }), "banniere", "en-place", "enPlace+ajoutSansBlocage");
attendre("outil sans refus", base({ banniere: { outil: "Cookiebot", maison: false, refus: null } }), "banniere", "a-corriger", "aCorrigerSansRefus");
attendre("maison sans refus", base({ banniere: { outil: null, maison: true, refus: null } }), "banniere", "a-verifier", "aVerifier");
attendre("traceur sans bannière", base({ temoins: [{ nom: "_ga", domaine: ".exemple.ca" }] }), "banniere", "a-corriger", "aCorrigerAbsente");
attendre("envoi sans bannière", base({ requetes: [req("https://www.googletagmanager.com/gtm.js?id=GTM-X")] }), "banniere", "a-corriger", "aCorrigerAbsente");
attendre("ni traceur ni bannière", base(), "banniere", "en-place", "enPlaceSansTraceur");
// 3. Politique
attendre("lien + 200", base(), "politique", "en-place", "enPlace");
attendre("aucun lien", base({ lienPolitique: null, politique: null }), "politique", "a-corriger", "aCorrigerAbsente");
attendre("lien brisé 404", base({ politique: { url: "https://exemple.ca/x", statut: 404, texte: null } }), "politique", "a-corriger", "aCorrigerLienBrise");
attendre("PDF illisible", base({ politique: { url: "https://exemple.ca/p.pdf", statut: 200, texte: null } }), "politique", "a-verifier", "aVerifier");
// 4 à 6 sans politique, illisible
for (const id of ["responsable", "transfert", "droits"]) {
  attendre(`${id} sans politique`, base({ lienPolitique: null, politique: null }), id, "a-corriger", "aCorrigerSansPolitique");
  attendre(`${id} lien brisé`, base({ politique: { url: "x", statut: 500, texte: null } }), id, "a-corriger", "aCorrigerSansPolitique");
  attendre(`${id} illisible`, base({ politique: { url: "x", statut: null, texte: null } }), id, "a-verifier", "politiqueIllisible");
  attendre(`${id} complet`, base(), id, "en-place", "enPlace");
}
const politique = (texte: string) => base({ politique: { url: "x", statut: 200, texte: texte.padEnd(400, " .") } });
attendre("responsable sans coordonnées", politique("Le responsable de la protection des renseignements personnels est notre présidente."), "responsable", "a-verifier", "aVerifier");
attendre("courriel sans titre", politique("Pour toute question, écrivez à info@exemple.ca."), "responsable", "a-verifier", "aVerifier");
attendre("ni titre ni coordonnées", politique("Nous respectons votre vie privée."), "responsable", "a-corriger", "aCorriger");
attendre("Canada seul", politique("Nos serveurs sont situés au Canada."), "transfert", "a-verifier", "aVerifier");
attendre("rien sur le lieu", politique("Nous respectons votre vie privée."), "transfert", "a-corriger", "aCorriger");
attendre("droits partiels", politique("Vous avez un droit d'accès à vos renseignements."), "droits", "a-verifier", "aVerifier");
attendre("aucun droit", politique("Nous respectons votre vie privée."), "droits", "a-corriger", "aCorriger");
// 7. Services externes (cas norvika.ca : vignettes YouTube, politique qui ne nomme pas YouTube)
const yt = [req("https://i.ytimg.com/vi/abc/hqdefault.jpg")];
attendre("aucun service", base(), "tiers", "en-place", "enPlace");
attendre("YouTube nommé", base({ requetes: yt }), "tiers", "a-verifier", "aVerifier");
attendre("YouTube non nommé (norvika.ca)", { ...politique("Responsable de la protection des renseignements personnels : info@exemple.ca. Hors du Québec."), requetes: yt }, "tiers", "a-corriger", "aCorriger");
attendre("YouTube sans politique", base({ requetes: yt, lienPolitique: null, politique: null }), "tiers", "a-corriger", "aCorriger");
attendre("YouTube, politique illisible", base({ requetes: yt, politique: { url: "x", statut: 200, texte: null } }), "tiers", "a-verifier", "aVerifier");
attendre("CDN général ignoré", base({ requetes: [req("https://cdn.jsdelivr.net/npm/x.js"), req("https://cdn.sanity.io/images/a.jpg")] }), "tiers", "en-place", "enPlace");
// 8. HTTPS
attendre("redirige", base(), "https", "en-place", "enPlace");
attendre("http fermé", base({ https: "http-ferme" }), "https", "a-verifier", "aVerifier");
attendre("sans redirection", base({ https: "sans-redirection" }), "https", "a-corriger", "aCorrigerSansRedirection");
attendre("http seulement", base({ adresseFinale: "http://exemple.ca/", https: "https-absent" }), "https", "a-corriger", "aCorrigerSansHttps");

// Le mot « conforme » ne sort jamais de l'analyse.
const tout = JSON.stringify(analyser(base({ temoins: [{ nom: "_ga", domaine: ".x" }] }), Date.now()));
if (/conform/i.test(tout)) {
  echecs++;
  console.log("ÉCHEC  le rapport contient « conforme »");
}
console.log(echecs ? `\n${echecs} échec(s).` : "\nTout passe.");
process.exit(echecs ? 1 : 0);

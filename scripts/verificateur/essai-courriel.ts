/**
 * Essai SANS ENVOI du rapport par courriel (lib/verificateur/courriel.ts) :
 *   1. compose les courriels à partir d'un rapport fictif et des textes du Studio (lecture publique
 *      du CDN, rien n'est écrit), vérifie les règles de contenu, et dépose le HTML dans qa/ (dossier
 *      non versionné) pour relecture : rapport sans la case, rapport avec la case, copie interne ;
 *   2. rejoue envoyerRapport() avec un faux Resend (fetch remplacé, AUCUN appel réseau vers Resend) :
 *      copie interne seulement si le rapport est accepté, case ignorée si elle n'était pas en ligne,
 *      aucun paramètre de suivi, aucune adresse ni corps d'erreur au journal, rien en local.
 *
 *   NODE_PATH=node_modules/next/dist/compiled NODE_ENV=development VERIFICATEUR_TEXTES_LOCAUX=1 \
 *     npx tsx --conditions=react-server scripts/verificateur/essai-courriel.ts
 *
 * NODE_PATH et --conditions : `server-only` n'est pas un paquet du projet, Next le fournit à la
 * construction ; hors de Next, on prend sa version vide (celle des composants serveur).
 * VERIFICATEUR_TEXTES_LOCAUX=1 : textes de studio/scripts/verificateur-courriel-textes.json tant que
 * le groupe « Rapport par courriel » n'est pas semé. Une preuve piégée (<script>, guillemets)
 * vérifie que tout ce qui vient du site visité est échappé.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { analyser, type Observations } from "../../lib/verificateur/analyse";
import { courrielInterne, courrielVisiteur, envoyerRapport, PREFIXE_CONSENTEMENT } from "../../lib/verificateur/courriel";
import { lireTextesCourriel, type TextesCourriel } from "../../lib/verificateur/textes-serveur";

const PIEGE = `<script>alert("x")</script>`;
const COURRIEL = "o'neil+essai@exemple.ca";
const ADRESSE_ESSAI = "123, rue d'Essai, Chambly (Québec) J3L 0A0";

const observations: Observations = {
  adresse: "https://exemple.ca/",
  adresseFinale: "https://www.exemple.ca/",
  temoins: [
    { nom: "_ga", domaine: ".exemple.ca" },
    { nom: PIEGE, domaine: ".exemple.ca" },
  ],
  requetes: [
    { url: "https://www.googletagmanager.com/gtag/js?id=G-X", hote: "www.googletagmanager.com", type: "script" },
    { url: "https://fonts.googleapis.com/css2?family=X", hote: "fonts.googleapis.com", type: "stylesheet" },
  ],
  banniere: { outil: null, maison: false, refus: null },
  lienPolitique: { texte: `Confidentialité "${PIEGE}"`, url: "https://www.exemple.ca/confidentialite" },
  politique: {
    url: "https://www.exemple.ca/confidentialite",
    statut: 200,
    texte: "Politique de confidentialité. Vous avez un droit d'accès à vos renseignements. ".repeat(4),
  },
  https: "redirige",
};

let echecs = 0;
function verifier(nom: string, ok: boolean) {
  if (!ok) echecs++;
  console.log(`${ok ? "ok    " : "ÉCHEC "} ${nom}`);
}

/** Les mêmes textes, avec la case allumée ou éteinte et une adresse postale d'essai ou vide. */
function variante(base: TextesCourriel, afficherCase: boolean, adressePostale: string): TextesCourriel {
  return { ...base, adressePostale, t: { ...base.t, rapportCourriel: { ...base.t.rapportCourriel!, afficherCase } } };
}

type Appel = { url: string; corps: Record<string, unknown> };

/** Remplace fetch le temps d'un essai : Resend répond `statuts[i]` au i-ème appel. Capte le journal. */
async function avecFauxResend<T>(statuts: number[], essai: () => Promise<T>): Promise<{ resultat: T; appels: Appel[]; journal: string }> {
  const appels: Appel[] = [];
  const lignes: string[] = [];
  const fetchAvant = globalThis.fetch;
  const erreurAvant = console.error;
  const logAvant = console.log;
  const cleAvant = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "re_essai_factice";
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const statut = statuts[appels.length] ?? 500;
    appels.push({ url: String(url), corps: JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown> });
    // Le corps d'erreur cite l'adresse, comme le ferait Resend : il ne doit jamais aller au journal.
    const corps = statut === 200 ? { id: `essai-${appels.length}` } : { name: "validation_error", message: `Invalid to: ${COURRIEL}` };
    return new Response(JSON.stringify(corps), { status: statut, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  console.error = (...args: unknown[]) => void lignes.push(args.map(String).join(" "));
  console.log = (...args: unknown[]) => void lignes.push(args.map(String).join(" "));
  try {
    return { resultat: await essai(), appels, journal: lignes.join("\n") };
  } finally {
    globalThis.fetch = fetchAvant;
    console.error = erreurAvant;
    console.log = logAvant;
    if (cleAvant === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = cleAvant;
  }
}

async function principal() {
  const rapport = { ...analyser(observations, Date.now()), date: "2026-11-23T19:05:00.000Z" };
  const lus = await lireTextesCourriel();
  if (!lus?.t.rapportCourriel) {
    console.error("⛔ Textes du rapport par courriel introuvables (semis absent ? lancer avec VERIFICATEUR_TEXTES_LOCAUX=1 et NODE_ENV=development).");
    process.exit(1);
  }
  const avecCase = variante(lus, true, ADRESSE_ESSAI);
  const rc = lus.t.rapportCourriel;

  /* ------------------------------------------------------------ 1. contenu */
  const sansCase = courrielVisiteur(rapport, lus, false);
  const visiteurCase = courrielVisiteur(rapport, avecCase, true);
  const interne = courrielInterne(rapport, avecCase, COURRIEL, "essai-id-resend");
  const tout = [sansCase, visiteurCase, interne].flatMap((m) => [m.objet, m.html, m.texte ?? ""]).join("\n");
  verifier("aucun tiret long (— ou –)", !/[—–]/.test(tout));
  verifier("aucune flèche", !/[←↑→↓⇐⇒➔➜⟶]/.test(tout));
  verifier("jamais « conforme »", !/conforme/i.test(tout));
  verifier("aucune image distante (C4)", !/<img|url\(/i.test(tout));
  verifier("preuve piégée échappée (aucune balise <script>)", !/<script/i.test(sansCase.html + visiteurCase.html + interne.html));
  verifier("preuve piégée affichée en texte", sansCase.html.includes("&lt;script&gt;"));
  verifier("avertissement « pas un avis juridique » présent", sansCase.html.includes(lus.t.avertissementCourt));
  verifier("lien du rendez-vous sans paramètre ajouté", sansCase.html.includes(`href="${lus.lienRendezVous}"`));
  verifier("nom légal présent", sansCase.html.includes(lus.nomLegal));
  verifier("huit points dans le courriel", (sansCase.texte ?? "").split("\n").filter((l) => /^(À corriger|À vérifier|En place) : /.test(l)).length === 8);
  verifier("sans la case : paragraphe « sans case »", sansCase.html.includes(rc.paragrapheSansCase.slice(0, 40)) && !sansCase.html.includes("désabonnement"));
  verifier("avec la case : paragraphe « si ce n'est pas vous » (point 5)", visiteurCase.html.includes("désabonnement"));
  verifier("adresse postale au pied quand elle existe", visiteurCase.html.includes("rue d") && !sansCase.html.includes("rue d"));
  verifier("copie interne : préfixe fixe de l'objet (C6)", interne.objet.startsWith(`${PREFIXE_CONSENTEMENT} : `));
  verifier("copie interne : identifiant Resend", interne.html.includes("essai-id-resend"));
  verifier("copie interne : texte de la case et adresse postale", interne.html.includes("Chambly") && interne.html.includes("Norvika inc. m"));
  verifier("copie interne : adresse de la personne", interne.html.includes("neil+essai@exemple.ca"));

  /* ------------------------------------------------------------ 2. envoi, faux Resend */
  const envoyer = (textes: TextesCourriel, suivi: boolean, local = false) =>
    envoyerRapport({ rapport, courriel: COURRIEL, suivi, textes: Promise.resolve(textes), local });

  const a = await avecFauxResend([200, 200], () => envoyer(avecCase, true));
  verifier("case comptée + rapport accepté : rapport puis copie interne", a.appels.length === 2 && a.resultat.visiteur === "envoye" && a.resultat.interne === "envoye");
  verifier("le rapport va à la personne, réponse à info@ (C9)", JSON.stringify(a.appels[0]?.corps.to) === JSON.stringify([COURRIEL]) && a.appels[0]?.corps.reply_to === "info@norvika.ca");
  verifier("la copie va à info@, réponse à la personne", JSON.stringify(a.appels[1]?.corps.to) === JSON.stringify(["info@norvika.ca"]) && a.appels[1]?.corps.reply_to === COURRIEL);
  verifier("la copie cite l'identifiant rendu par Resend", String(a.appels[1]?.corps.html).includes("essai-1"));
  verifier("aucun paramètre de suivi envoyé à Resend (point 4)", a.appels.every((x) => !Object.keys(x.corps).some((k) => /track/i.test(k))));
  verifier("journal sans l'adresse (C2)", !a.journal.includes("neil"));

  const b = await avecFauxResend([422, 200], () => envoyer(avecCase, true));
  verifier("rapport refusé : AUCUNE copie interne (point 2)", b.appels.length === 1 && b.resultat.visiteur === "echec" && b.resultat.interne === "aucun");
  verifier("rapport refusé : journal = code HTTP seulement (point 3)", b.journal.includes("Resend : 422") && !b.journal.includes("neil") && !b.journal.includes("validation_error"));

  const c = await avecFauxResend([200, 200], () => envoyer(variante(lus, false, ADRESSE_ESSAI), true));
  verifier("case cochée mais interrupteur éteint : ignorée", c.appels.length === 1 && c.resultat.interne === "aucun" && !String(c.appels[0]?.corps.html).includes("désabonnement"));

  const d = await avecFauxResend([200, 200], () => envoyer(variante(lus, true, ""), true));
  verifier("case cochée sans adresse postale : ignorée (DORS/2012-36, art. 4 d)", d.appels.length === 1 && d.resultat.interne === "aucun");

  const e = await avecFauxResend([200], () => envoyer(avecCase, false));
  verifier("case non cochée : rapport seul", e.appels.length === 1 && e.resultat.visiteur === "envoye" && e.resultat.interne === "aucun");

  const f = await avecFauxResend([200, 200], () => envoyer(avecCase, true, true));
  verifier("poste local : aucun appel à Resend, état simulé", f.appels.length === 0 && f.resultat.visiteur === "simule" && f.resultat.interne === "simule");

  const g = await avecFauxResend([200], () => envoyerRapport({ rapport, courriel: COURRIEL, suivi: true, textes: Promise.resolve(null), local: false }));
  verifier("textes illisibles : échec, aucun appel, aucune copie", g.appels.length === 0 && g.resultat.visiteur === "echec" && g.resultat.interne === "aucun");

  /* ------------------------------------------------------------ dépôt pour relecture */
  const dossier = join(process.cwd(), "qa");
  mkdirSync(dossier, { recursive: true });
  writeFileSync(join(dossier, "2026-11-23-courriel-rapport-sans-case.html"), sansCase.html);
  writeFileSync(join(dossier, "2026-11-23-courriel-rapport-sans-case.txt"), `Objet : ${sansCase.objet}\n\n${sansCase.texte}`);
  writeFileSync(join(dossier, "2026-11-23-courriel-rapport-avec-case.html"), visiteurCase.html);
  writeFileSync(
    join(dossier, "2026-11-23-courriel-copie-interne.html"),
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${interne.objet}</title></head><body>${interne.html}</body></html>`,
  );
  console.log(`\nObjet du rapport : ${sansCase.objet}\nObjet de la copie : ${interne.objet}\nDéposés dans qa/ (non versionné). Échecs : ${echecs}.`);
  process.exit(echecs ? 1 : 0);
}

void principal();

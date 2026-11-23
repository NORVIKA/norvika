/**
 * Essai SANS ENVOI du rapport par courriel (lib/verificateur/courriel.ts) :
 *   1. compose les courriels à partir d'un rapport fictif et des textes du Studio (lecture publique
 *      du CDN, rien n'est écrit), vérifie les règles de contenu, et dépose le HTML dans qa/ (dossier
 *      non versionné) pour relecture : rapport sans la case, rapport avec la case, copie interne ;
 *   2. rejoue envoyerRapport() avec un faux Resend (fetch remplacé, AUCUN appel réseau vers Resend) :
 *      copie interne seulement si le rapport est accepté, case ignorée si elle n'était pas en ligne,
 *      aucun paramètre de suivi, aucune adresse ni corps d'erreur au journal, rien en local ;
 *      aucun appel à Resend sans MX ou au-delà du plafond de courriels ;
 *   3. rejoue le contrôle MX et le compteur de courriels avec un faux résolveur et un faux Supabase.
 *
 *   NODE_PATH=node_modules/next/dist/compiled NODE_ENV=development VERIFICATEUR_TEXTES_LOCAUX=1 \
 *     npx tsx --conditions=react-server scripts/verificateur/essai-courriel.ts
 *
 * NODE_PATH et --conditions : `server-only` n'est pas un paquet du projet, Next le fournit à la
 * construction ; hors de Next, on prend sa version vide (celle des composants serveur).
 * VERIFICATEUR_TEXTES_LOCAUX=1 : textes de studio/scripts/verificateur-courriel-textes.json tant que
 * le groupe « Rapport par courriel » n'est pas semé.
 * ⛔ ESSAI BLOQUANT (sortie 1) : quatre pièges posés par un site analysé (une adresse dans le texte du
 *    lien de politique, l'adresse nue de ce lien, une adresse dans le bouton de refus, une adresse
 *    dans un nom de témoin) ne doivent paraître NI dans le HTML NI dans le texte du courriel.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { analyser, type Observations } from "../../lib/verificateur/analyse";
import { formeCourrielValide } from "../../lib/garde-formulaire";
import { reserverCourrielsVerificateur, verifierDebitVerificateur, type ReserveCourriels } from "../../lib/rate-limit";
import { recoitDuCourriel } from "../../lib/verificateur/adresse";
import { courrielInterne, courrielVisiteur, envoyerRapport, PREFIXE_CONSENTEMENT } from "../../lib/verificateur/courriel";
import { remplirAvecAdresse } from "../../lib/verificateur/textes";
import { lienAbsolu, lireTextesCourriel, type TextesCourriel } from "../../lib/verificateur/textes-serveur";

const PIEGE = `<script>alert("x")</script>`;
/** Les quatre pièges : chacun porte un domaine qui ne doit jamais sortir dans un courriel. */
const PIEGES = {
  texteDuLien: "piege-texte-lien.example",
  adresseDuLien: "piege-adresse-lien.example",
  boutonRefus: "piege-bouton.example",
  nomTemoin: "piege-temoin.example",
} as const;
const COURRIEL = "o'neil+essai@exemple.ca";
/**
 * L'adresse du semis (studio/scripts/verificateur-courriel-parametres.json) ; vide depuis le 2026-11-23
 * (William ne veut pas publier son adresse), donc une adresse fictive pour essayer le chemin « avec case ».
 */
const ADRESSE_SEMIS = String(
  (JSON.parse(readFileSync(join(process.cwd(), "studio/scripts/verificateur-courriel-parametres.json"), "utf8")) as { adressePostale?: unknown }).adressePostale ?? "",
).trim();
const ADRESSE_ESSAI = ADRESSE_SEMIS || "C.P. 1000, succursale Essai, Montréal (Québec) H0H 0H0";
/** Un morceau de l'adresse sans apostrophe (la typographie change ' en ’). */
const REPERE_ADRESSE = ADRESSE_ESSAI.replace(/'/g, "’").slice(0, 10);

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

/** Site piégé A : texte du lien piégé et page en 404, bouton de refus piégé, nom de témoin piégé. */
const piegeA: Observations = {
  ...observations,
  temoins: [
    { nom: "_ga", domaine: ".exemple.ca" },
    { nom: `_ga facture impayée https://${PIEGES.nomTemoin}/p`, domaine: ".exemple.ca" },
    { nom: "_gaPIEGEMOT", domaine: ".exemple.ca" },
    { nom: "_fbp_514-555-0123", domaine: ".exemple.ca" },
  ],
  banniere: { outil: "CookieYes", maison: false, refus: `Refuser et payer sur www.${PIEGES.boutonRefus}` },
  lienPolitique: { texte: `Confidentialité : facture impayée, réglez-la sur https://${PIEGES.texteDuLien}/p`, url: "https://www.exemple.ca/confidentialite" },
  politique: { url: "https://www.exemple.ca/confidentialite", statut: 404, texte: null },
};

/** Site piégé B : lien de politique SANS texte, donc son adresse nue serait recopiée ; page lisible. */
const piegeB: Observations = {
  ...observations,
  lienPolitique: { texte: "", url: `https://${PIEGES.adresseDuLien}/confidentialite` },
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
  // Sortie 1 si le script s'arrête avant son bilan (une promesse jamais résolue vide la boucle de
  // Node sans erreur) : un essai qui ne va pas au bout ne doit jamais passer pour réussi.
  process.exitCode = 1;
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
  verifier("texte libre du site absent (aucune trace du piège <script>)", !/script|alert/i.test(tout));

  // ⛔ BLOQUANT : les quatre pièges, dans le HTML ET dans le texte, avec et sans la case.
  const rapportA = { ...analyser(piegeA, Date.now()), date: rapport.date };
  const rapportB = { ...analyser(piegeB, Date.now()), date: rapport.date };
  const piegesRendus = [rapportA, rapportB]
    .flatMap((r) => [courrielVisiteur(r, lus, false), courrielVisiteur(r, avecCase, true)])
    .flatMap((m) => [m.objet, m.html, m.texte ?? ""])
    .join("\n");
  for (const [nom, domaine] of Object.entries(PIEGES)) verifier(`piège « ${nom} » absent du courriel (HTML et texte)`, !piegesRendus.includes(domaine));
  verifier("piège A bien analysé : lien brisé, bannière en place, témoin à corriger", rapportA.resultats.find((x) => x.id === "politique")?.cas === "aCorrigerLienBrise" && rapportA.resultats.find((x) => x.id === "banniere")?.etat === "en-place" && rapportA.resultats.find((x) => x.id === "temoins")?.etat === "a-corriger");
  verifier("piège B bien analysé : politique en place", rapportB.resultats.find((x) => x.id === "politique")?.cas === "enPlace");
  verifier("nom de témoin piégé ramené à « _ga » dans le rapport (la page garde les noms ordinaires)", JSON.stringify(rapportA.resultats.find((x) => x.id === "temoins")?.preuves[0]) === JSON.stringify({ type: "temoins", valeurs: ["_ga", "_gaPIEGEMOT", "_fbp_514-555-0123"] }));
  verifier("courriel : noms de témoins réduits au nom connu (_ga, _fbp), rien après", !piegesRendus.includes("PIEGEMOT") && !piegesRendus.includes("514-555-0123") && piegesRendus.includes("_ga, _fbp"));
  verifier("aucun guillemet vide laissé par un texte retiré", !/«\s*»/.test(piegesRendus));
  verifier("avertissement « pas un avis juridique » présent", sansCase.html.includes(lus.t.avertissementCourt));
  verifier("lien du rendez-vous sans paramètre ajouté", sansCase.html.includes(`href="${lus.lienRendezVous}"`));
  verifier("nom légal présent", sansCase.html.includes(lus.nomLegal));
  verifier("huit points dans le courriel", (sansCase.texte ?? "").split("\n").filter((l) => /^(À corriger|À vérifier|En place) : /.test(l)).length === 8);
  verifier("sans la case : paragraphe « sans case »", sansCase.html.includes(rc.paragrapheSansCase.slice(0, 40)) && !sansCase.html.includes("désabonnement"));
  verifier("avec la case : paragraphe « si ce n'est pas vous » (point 5)", visiteurCase.html.includes("désabonnement"));
  verifier(
    "adresse postale au pied quand elle existe, absente sinon",
    visiteurCase.html.includes(REPERE_ADRESSE) &&
      courrielVisiteur(rapport, variante(lus, false, ADRESSE_ESSAI), false).html.includes(REPERE_ADRESSE) &&
      !courrielVisiteur(rapport, variante(lus, false, ""), false).html.includes(REPERE_ADRESSE),
  );
  // Sans adresse au semis (décision de William, 2026-11-23), la case reste cachée même ouverte.
  verifier("semis : case ouverte, adresse lue telle que semée (poste local)", lus.t.rapportCourriel?.afficherCase === true && lus.adressePostale === ADRESSE_SEMIS.replace(/'/g, "’"));
  verifier("copie interne : préfixe fixe de l'objet (C6)", interne.objet.startsWith(`${PREFIXE_CONSENTEMENT} : `));
  verifier("copie interne : identifiant Resend", interne.html.includes("essai-id-resend"));
  verifier("copie interne : texte de la case et adresse postale", interne.html.includes(REPERE_ADRESSE) && interne.html.includes("Norvika inc. m"));
  verifier("copie interne : adresse de la personne", interne.html.includes("neil+essai@exemple.ca"));

  /* ------------------------------------------------------------ 2. envoi, faux Resend */
  // Faux MX et faux compteur par défaut : tout passe. Les essais du plafond et du MX les changent.
  const reserves: number[] = [];
  const reserverOk = async (n: 1 | 2): Promise<ReserveCourriels> => (reserves.push(n), "ok");
  const envoyer = (textes: TextesCourriel, suivi: boolean, local = false, reserver = reserverOk, mx = true) =>
    envoyerRapport({ rapport, courriel: COURRIEL, suivi, textes: Promise.resolve(textes), domaineRecoit: Promise.resolve(mx), local, reserver });

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

  const g = await avecFauxResend([200], () => envoyerRapport({ rapport, courriel: COURRIEL, suivi: true, textes: Promise.resolve(null), domaineRecoit: Promise.resolve(true), local: false, reserver: reserverOk }));
  verifier("textes illisibles : échec, aucun appel, aucune copie", g.appels.length === 0 && g.resultat.visiteur === "echec" && g.resultat.interne === "aucun");

  reserves.length = 0;
  await avecFauxResend([200, 200], () => envoyer(avecCase, true));
  await avecFauxResend([200], () => envoyer(avecCase, false));
  verifier("plafond : 2 réservés avec la copie, 1 sans", JSON.stringify(reserves) === "[2,1]");

  const h = await avecFauxResend([200, 200], () => envoyer(avecCase, true, false, reserverOk, false));
  verifier("domaine sans MX : échec, AUCUN appel à Resend", h.appels.length === 0 && h.resultat.visiteur === "echec" && h.resultat.motif === "sans-mx");
  const h2 = await avecFauxResend([200], () => envoyer(avecCase, true, true, reserverOk, false));
  verifier("domaine sans MX, poste local : échec aussi (pas de « simulé »)", h2.resultat.visiteur === "echec");

  const plein = async (): Promise<ReserveCourriels> => "plafond";
  const k = await avecFauxResend([200, 200], () => envoyer(avecCase, true, false, plein));
  verifier("plafond de courriels atteint : échec, AUCUN appel à Resend", k.appels.length === 0 && k.resultat.visiteur === "echec" && k.resultat.motif === "plafond");
  const enPanne = async (): Promise<ReserveCourriels> => "panne";
  const l = await avecFauxResend([200], () => envoyer(avecCase, false, false, enPanne));
  verifier("compteur absent ou en panne : échec, AUCUN appel à Resend", l.appels.length === 0 && l.resultat.motif === "compteur");

  /* ------------------------------------------------------------ adresse dans une phrase, liens du Studio */
  verifier("une adresse avec « $& » reste intacte dans « Rapport envoyé à »", remplirAvecAdresse(rc.envoiReussi, "courriel", "a$&b$'c@exemple.ca").includes("a$&b$'c@exemple.ca"));
  verifier("lien relatif du Studio rendu absolu", lienAbsolu("/contact") === "https://norvika.ca/contact" && lienAbsolu("#rdv") === "https://norvika.ca/#rdv");
  verifier("lien complet du Studio gardé tel quel", lienAbsolu("https://cal.example/norvika") === "https://cal.example/norvika");
  const relatif = courrielVisiteur(rapport, { ...lus, lienRendezVous: lienAbsolu("/contact") }, false);
  verifier("courriel : le bouton de rendez-vous mène à une adresse complète", relatif.html.includes('href="https://norvika.ca/contact"'));

  /* ------------------------------------------------------------ forme du courriel (les trois formulaires) */
  for (const bonne of ["o'neil+essai@exemple.ca", "a@b.ca", "prenom.nom@sous.domaine-qc.ca"]) verifier(`forme acceptée : ${bonne}`, formeCourrielValide(bonne));
  for (const mauvaise of ['"Facturation"<x@domaine.example>', "Nom <x@y.ca>", "x@y", "a b@c.ca", "x@-y.ca", "x@y..ca", "x,y@z.ca", "é@x.ca", "x@exemple.ca\n"]) {
    verifier(`forme refusée : ${JSON.stringify(mauvaise)}`, !formeCourrielValide(mauvaise));
  }

  /* ------------------------------------------------------------ 3. MX et compteur, vrais modules, faux réseau */
  const reponsesDoh: Record<string, object | number> = {
    "avec-mx.example": { Status: 0, Answer: [{ type: 15, data: "10 mx.avec-mx.example." }] },
    "sans-mx.example": { Status: 0, Answer: [] },
    "inexistant.example": { Status: 3 },
    "mx-nul.example": { Status: 0, Answer: [{ type: 15, data: "0 ." }] },
    "servfail.example": { Status: 2 },
    "en-panne.example": 503,
  };
  const fetchAvant = globalThis.fetch;
  let rpc: { statut: number; corps: unknown } = { statut: 200, corps: "ok" };
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = new URL(String(url));
    if (u.hostname === "cloudflare-dns.com") {
      const r = reponsesDoh[u.searchParams.get("name") ?? ""];
      if (typeof r === "number") return new Response("", { status: r });
      return new Response(JSON.stringify(r ?? { Status: 0, Answer: [] }), { status: 200 });
    }
    if (u.pathname.endsWith("/rpc/verifier_debit_verificateur")) {
      // Un compteur des analyses qui ne répond jamais : seul le délai de 3 s peut l'arrêter.
      const signal = init?.signal;
      return new Promise<Response>((_, rejeter) => signal?.addEventListener("abort", () => rejeter(signal.reason)));
    }
    if (u.pathname.endsWith("/rpc/reserver_courriels_verificateur")) {
      return new Response(JSON.stringify(rpc.corps), { status: rpc.statut, headers: { "Content-Type": "application/json" } });
    }
    return new Response("", { status: 500 });
  }) as typeof fetch;
  const erreurAvant = console.error;
  console.error = () => undefined;
  try {
    verifier("MX présent : reçoit du courriel", await recoitDuCourriel("avec-mx.example"));
    verifier("aucun MX : refusé", !(await recoitDuCourriel("sans-mx.example")));
    verifier("domaine inexistant : refusé", !(await recoitDuCourriel("inexistant.example")));
    verifier("MX nul (RFC 7505) : refusé", !(await recoitDuCourriel("mx-nul.example")));
    verifier("résolveur en échec (SERVFAIL, HTTP 503) : refusé", !(await recoitDuCourriel("servfail.example")) && !(await recoitDuCourriel("en-panne.example")));

    const urlAvant = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const cleAvant = process.env.SUPABASE_SERVICE_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;
    verifier("compteur sans configuration Supabase : panne (aucun envoi)", (await reserverCourrielsVerificateur(1)) === "panne");
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://faux-projet.supabase.co";
    process.env.SUPABASE_SERVICE_KEY = "cle-factice";
    rpc = { statut: 404, corps: { code: "PGRST202", message: "Could not find the function" } };
    verifier("fonction SQL pas encore créée : panne (aucun envoi)", (await reserverCourrielsVerificateur(1)) === "panne");
    rpc = { statut: 200, corps: "jour" };
    verifier("compteur répond « jour » : plafond", (await reserverCourrielsVerificateur(2)) === "plafond");
    rpc = { statut: 200, corps: "ok" };
    verifier("compteur répond « ok » : réservé", (await reserverCourrielsVerificateur(1)) === "ok");
    rpc = { statut: 200, corps: "autre" };
    verifier("réponse inconnue : panne (fermé dans le doute)", (await reserverCourrielsVerificateur(1)) === "panne");
    const avant = Date.now();
    // AbortSignal.timeout ne retient pas Node : un minuteur ordinaire garde l'essai en vie le temps du délai.
    const garde = setTimeout(() => undefined, 10_000);
    const debit = await verifierDebitVerificateur(new Request("https://norvika.ca/api/verificateur-loi-25", { headers: { "cf-connecting-ip": "203.0.113.5" } }));
    clearTimeout(garde);
    const duree = Date.now() - avant;
    verifier(`compteur des analyses muet : refus après le délai (${duree} ms)`, debit === "panne" && duree >= 2900 && duree < 4500);
    if (urlAvant === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = urlAvant;
    if (cleAvant === undefined) delete process.env.SUPABASE_SERVICE_KEY;
    else process.env.SUPABASE_SERVICE_KEY = cleAvant;
  } finally {
    globalThis.fetch = fetchAvant;
    console.error = erreurAvant;
  }

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

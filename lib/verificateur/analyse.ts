/**
 * Vérificateur Loi 25 : des observations du navigateur aux huit vérifications. Fonctions PURES
 * (aucun réseau, aucun navigateur) : c'est ce qui se teste sans rien lancer
 * (scripts/verificateur/essai-analyse.ts).
 *
 * Les règles par état sont celles de Martin (contenu/verificateur-loi25-textes.md, section 2). Le
 * `cas` rendu est le NOM DU CHAMP du texte à afficher dans le Studio (document « Vérificateur
 * Loi 25 », objet de la vérification) : enPlace, aCorriger, aCorrigerSansPolitique, etc.
 *
 * Chaque vérification rend aussi ses PREUVES : ce que le navigateur a réellement vu (noms des
 * témoins, domaines contactés, texte du lien trouvé). La page s'en sert pour remplir les variables
 * des textes ({temoins}, {services}, {outil}...) et pour afficher la liste brute.
 *
 * ⛔ Jamais le NOM du responsable trouvé dans une politique (fait F5 de Martin) : on constate qu'un
 * titre et un moyen de joindre existent, on ne recopie ni l'un ni l'autre.
 */

import { DOMAINES_SUIVI, MOTIFS_POLITIQUE, PREFIXES_TEMOINS_SUIVI, SERVICES_EXTERNES, TEMOINS_SUIVI_EXACTS } from "./listes";
import type { Etat, Preuve, Rapport, ResultatVerification } from "./types";

/* ------------------------------------------------------------------ observations */

export type Temoin = { nom: string; domaine: string };
export type Requete = { url: string; hote: string; type: string };

/** Ce que le moteur (moteur.ts) a vu, sans aucune interprétation. */
export type Observations = {
  adresse: string;
  adresseFinale: string;
  /** Tous les témoins du navigateur après 8 s sans clic, témoins tiers compris. */
  temoins: Temoin[];
  /** Toutes les requêtes parties pendant la visite de l'accueil (bloquées comprises). */
  requetes: Requete[];
  banniere: {
    /** Outil de consentement reconnu (CookieYes, Cookiebot...), ou null. */
    outil: string | null;
    /** Une boîte flottante qui parle de témoins, sans outil reconnu. */
    maison: boolean;
    /** Texte du bouton de refus visible au premier niveau, ou null. */
    refus: string | null;
  };
  lienPolitique: { texte: string; url: string } | null;
  /**
   * La page de politique (null : aucun lien). `statut` : code HTTP, null si la page n'a pas répondu
   * (délai, réseau). `texte` : null si la page ne se lit pas (PDF, erreur).
   */
  politique: { url: string; statut: number | null; texte: string | null } | null;
  https: "redirige" | "http-ferme" | "sans-redirection" | "https-absent" | "inconnu";
};

/* ------------------------------------------------------------------ utilitaires */

const MAX_PREUVES = 12;
const MAX_LONGUEUR_PREUVE = 120;
/** En dessous, une « politique » est une page vide ou un gabarit : elle ne se lit pas. */
const TEXTE_MINIMUM = 200;

/** Une preuve courte : texte brut, sans doublon, tronqué, plafonné en nombre. */
function preuve(type: Preuve["type"], valeurs: string[]): Preuve {
  const propres = [...new Set(valeurs.map((v) => v.replace(/\s+/g, " ").trim()).filter(Boolean))].map((v) =>
    v.length > MAX_LONGUEUR_PREUVE ? `${v.slice(0, MAX_LONGUEUR_PREUVE - 1)}…` : v,
  );
  const reste = propres.length - MAX_PREUVES;
  return { type, valeurs: reste > 0 ? [...propres.slice(0, MAX_PREUVES), `+${reste}`] : propres };
}

/** Vrai si `hote` est `domaine` ou l'un de ses sous-domaines. */
export function dansDomaine(hote: string, domaine: string): boolean {
  return hote === domaine || hote.endsWith(`.${domaine}`);
}

/** Vrai si la requête correspond au motif : un domaine (« ytimg.com ») ou un domaine et un chemin (« facebook.com/tr »). */
function correspond(requete: Requete, motif: string): boolean {
  if (!motif.includes("/")) return dansDomaine(requete.hote, motif);
  let chemin = "/";
  try {
    chemin = new URL(requete.url).pathname;
  } catch {
    return false;
  }
  const adresse = `${requete.hote}${chemin}`;
  return adresse.startsWith(motif) || adresse.includes(`.${motif}`);
}

export function estTemoinDeSuivi(nom: string): boolean {
  return TEMOINS_SUIVI_EXACTS.includes(nom) || PREFIXES_TEMOINS_SUIVI.some((p) => nom.startsWith(p));
}

/** La politique, si elle a été lue (lien trouvé, page en 200, assez de texte). */
function texteLisible(o: Observations): string | null {
  const p = o.politique;
  if (!p || p.statut === null || p.statut >= 400 || !p.texte || p.texte.trim().length < TEXTE_MINIMUM) return null;
  return p.texte;
}

/** Le lien de politique mène à une page en erreur (404, 500...). */
const lienBrise = (o: Observations) => !!o.politique && o.politique.statut !== null && o.politique.statut >= 400;

/* ------------------------------------------------------------------ les huit vérifications */

type Verdict = Omit<ResultatVerification, "id">;

/**
 * 1. Témoins de suivi avant le consentement (art. 8.1 et 14). Règle de Martin : un témoin de suivi
 * connu déposé sans clic, à corriger ; aucun témoin mais des envois vers un domaine de mesure ou de
 * publicité connu (mode consentement « avancé » de Google), à vérifier ; en place sinon.
 */
function verifierTemoins(o: Observations): Verdict & { hotes: string[] } {
  const temoins = o.temoins.filter((t) => estTemoinDeSuivi(t.nom));
  const outils = new Set<string>();
  const hotes = new Set<string>();
  for (const r of o.requetes) {
    const trouve = DOMAINES_SUIVI.find(([motif]) => correspond(r, motif));
    if (!trouve) continue;
    outils.add(trouve[1]);
    hotes.add(r.hote);
  }
  // Un témoin tiers dit aussi quel outil l'a déposé, même sans requête reconnue (ex. : .doubleclick.net).
  for (const t of temoins) {
    const trouve = DOMAINES_SUIVI.find(([motif]) => !motif.includes("/") && dansDomaine(t.domaine.replace(/^\./, ""), motif));
    if (trouve) outils.add(trouve[1]);
  }

  const preuves: Preuve[] = [];
  if (temoins.length) preuves.push(preuve("temoins", temoins.map((t) => t.nom)));
  if (outils.size) preuves.push(preuve("note", [...outils]));
  if (hotes.size) preuves.push(preuve("domaines", [...hotes]));

  const liste = [...hotes];
  if (temoins.length) return { etat: "a-corriger", cas: "aCorriger", preuves, hotes: liste };
  if (hotes.size) return { etat: "a-verifier", cas: "aVerifier", preuves, hotes: liste };
  return { etat: "en-place", cas: "enPlace", preuves: [], hotes: liste };
}

/**
 * 2. Bannière avec un vrai choix de refuser (art. 8.1 et 14). Règle de Martin : bannière avec un
 * refus visible au premier niveau, en place ; bannière connue sans refus, à corriger ; traceurs et
 * aucune bannière, à corriger ; ni traceur ni bannière, en place ; doute, à vérifier.
 */
function verifierBanniere(o: Observations, temoins: Verdict): Verdict {
  const { outil, maison, refus } = o.banniere;
  const preuves: Preuve[] = [];
  if (outil) preuves.push(preuve("note", [outil]));
  if (refus) preuves.push(preuve("extrait", [refus]));

  if (outil || maison) {
    if (refus) return { etat: "en-place", cas: temoins.etat === "a-corriger" ? "enPlace+ajoutSansBlocage" : "enPlace", preuves };
    // Outil reconnu sans refus : un constat. Boîte « maison » sans refus : un doute.
    return outil ? { etat: "a-corriger", cas: "aCorrigerSansRefus", preuves } : { etat: "a-verifier", cas: "aVerifier", preuves };
  }
  if (temoins.etat !== "en-place") return { etat: "a-corriger", cas: "aCorrigerAbsente", preuves };
  return { etat: "en-place", cas: "enPlaceSansTraceur", preuves };
}

/**
 * 3. Politique de confidentialité accessible (art. 8.2). Règle de Martin : lien trouvé et page en
 * 200, en place ; aucun lien ou page en erreur, à corriger ; lien trouvé mais contenu illisible, à
 * vérifier.
 */
function verifierPolitique(o: Observations): Verdict {
  if (!o.lienPolitique) return { etat: "a-corriger", cas: "aCorrigerAbsente", preuves: [] };
  const lien = preuve("lien", [o.lienPolitique.texte || o.lienPolitique.url]);
  if (lienBrise(o)) return { etat: "a-corriger", cas: "aCorrigerLienBrise", preuves: [lien, preuve("note", [String(o.politique?.statut)])] };
  if (!texteLisible(o)) return { etat: "a-verifier", cas: "aVerifier", preuves: [lien] };
  return { etat: "en-place", cas: "enPlace", preuves: [lien] };
}

/**
 * Le verdict commun des vérifications 4, 5 et 6 quand la politique manque ou ne se lit pas. Sans
 * politique (ou lien brisé) : à corriger, variante. Martin : « sinon un site sans politique
 * paraîtrait mieux noté qu'un site à la politique incomplète ». Illisible : à vérifier.
 */
function sansPolitique(o: Observations): Verdict | null {
  if (!o.lienPolitique || lienBrise(o)) return { etat: "a-corriger", cas: "aCorrigerSansPolitique", preuves: [] };
  if (!texteLisible(o)) return { etat: "a-verifier", cas: "politiqueIllisible", preuves: [] };
  return null;
}

/**
 * 4. Responsable de la protection des renseignements (art. 3.1). Règle de Martin : le titre ET un
 * courriel ou un téléphone, en place ; l'un des deux seulement, à vérifier ; aucun, à corriger.
 * Les coordonnées comptent si elles sont PRÈS du titre (300 caractères avant, 900 après) : un
 * courriel de facturation au bas de la page ne fait pas un responsable joignable.
 */
function verifierResponsable(o: Observations): Verdict {
  const manque = sansPolitique(o);
  if (manque) return manque;
  const texte = texteLisible(o) as string;
  const contact = (t: string) => MOTIFS_POLITIQUE.courriel.test(t) || MOTIFS_POLITIQUE.telephone.test(t);
  const m = MOTIFS_POLITIQUE.responsable.exec(texte);
  if (m) {
    const fenetre = texte.slice(Math.max(0, m.index - 300), m.index + m[0].length + 900);
    return contact(fenetre) ? { etat: "en-place", cas: "enPlace", preuves: [] } : { etat: "a-verifier", cas: "aVerifier", preuves: [] };
  }
  return contact(texte) ? { etat: "a-verifier", cas: "aVerifier", preuves: [] } : { etat: "a-corriger", cas: "aCorriger", preuves: [] };
}

/**
 * 5. Renseignements traités hors du Québec (art. 8 et 17). Règle de Martin : « hors du Québec »,
 * « à l'extérieur du Québec » ou un pays nommé, en place ; fournisseurs ou hébergement sans lieu, ou
 * « Canada » seul, à vérifier ; rien, à corriger.
 */
function verifierTransfert(o: Observations): Verdict {
  const manque = sansPolitique(o);
  if (manque) return manque;
  const texte = texteLisible(o) as string;
  const fort = MOTIFS_POLITIQUE.horsQuebec.exec(texte);
  if (fort) return { etat: "en-place", cas: "enPlace", preuves: [preuve("extrait", [fort[0]])] };
  const faible = MOTIFS_POLITIQUE.ailleurs.exec(texte);
  if (faible) return { etat: "a-verifier", cas: "aVerifier", preuves: [preuve("extrait", [faible[0]])] };
  return { etat: "a-corriger", cas: "aCorriger", preuves: [] };
}

/** 6. Droits des personnes (art. 8, 27 et 28). Règle de Martin : les trois, en place ; un ou deux, à vérifier ; aucun, à corriger. */
function verifierDroits(o: Observations): Verdict {
  const manque = sansPolitique(o);
  if (manque) return manque;
  const texte = texteLisible(o) as string;
  const droits = { acces: MOTIFS_POLITIQUE.acces, rectification: MOTIFS_POLITIQUE.rectification, retrait: MOTIFS_POLITIQUE.retrait };
  const manquants = (Object.keys(droits) as (keyof typeof droits)[]).filter((d) => !droits[d].test(texte));
  if (!manquants.length) return { etat: "en-place", cas: "enPlace", preuves: [] };
  if (manquants.length === 3) return { etat: "a-corriger", cas: "aCorriger", preuves: [] };
  // Les identifiants des droits manquants ; la page les remplace par leur nom (Studio).
  return { etat: "a-verifier", cas: "aVerifier", preuves: [preuve("manquants", manquants)] };
}

/**
 * 7. Services externes chargés dès l'arrivée (art. 8 et 17). Règle de Martin : aucun service
 * surveillé, en place ; chargés et TOUS nommés dans la politique, à vérifier ; un service chargé
 * absent de la politique (ou pas de politique), à corriger. Politique illisible : on ne peut pas
 * savoir, donc à vérifier.
 * Les domaines déjà comptés comme outils de suivi (vérification 1) ne sont pas recomptés ici.
 */
function verifierTiers(o: Observations, dejaComptes: string[]): Verdict {
  const parService = new Map<string, { hotes: Set<string>; politique: RegExp }>();
  for (const r of o.requetes) {
    if (dejaComptes.includes(r.hote)) continue;
    const s = SERVICES_EXTERNES.find((x) => correspond(r, x.motif));
    if (!s) continue;
    const entree = parService.get(s.nom) ?? { hotes: new Set<string>(), politique: s.politique };
    entree.hotes.add(r.hote);
    parService.set(s.nom, entree);
  }
  if (!parService.size) return { etat: "en-place", cas: "enPlace", preuves: [] };

  const hotes = [...parService.values()].flatMap((s) => [...s.hotes]);
  const texte = texteLisible(o);
  const politiqueIllisible = !!o.lienPolitique && !lienBrise(o) && !texte;
  const nonNommes = [...parService.entries()].filter(([, s]) => !texte || !s.politique.test(texte)).map(([nom]) => nom);

  if (politiqueIllisible) return { etat: "a-verifier", cas: "aVerifier", preuves: [preuve("note", [...parService.keys()]), preuve("domaines", hotes)] };
  if (nonNommes.length) return { etat: "a-corriger", cas: "aCorriger", preuves: [preuve("note", nonNommes), preuve("domaines", hotes)] };
  return { etat: "a-verifier", cas: "aVerifier", preuves: [preuve("note", [...parService.keys()]), preuve("domaines", hotes)] };
}

/**
 * 8. Connexion sécurisée (art. 10). Règle de Martin : https et http qui y redirige, en place ; pas
 * de https ou certificat invalide, à corriger ; http accessible sans redirection, à corriger ;
 * redirection non confirmée (http fermé ou sans réponse), à vérifier.
 */
function verifierHttps(o: Observations): Verdict {
  if (!o.adresseFinale.startsWith("https://") || o.https === "https-absent") return { etat: "a-corriger", cas: "aCorrigerSansHttps", preuves: [] };
  if (o.https === "redirige") return { etat: "en-place", cas: "enPlace", preuves: [] };
  if (o.https === "sans-redirection") return { etat: "a-corriger", cas: "aCorrigerSansRedirection", preuves: [] };
  return { etat: "a-verifier", cas: "aVerifier", preuves: [] };
}

/* ------------------------------------------------------------------ le rapport */

export function analyser(o: Observations, debut: number): Rapport {
  const temoins = verifierTemoins(o);
  const resultats: ResultatVerification[] = [
    { id: "temoins", etat: temoins.etat, cas: temoins.cas, preuves: temoins.preuves },
    { id: "banniere", ...verifierBanniere(o, temoins) },
    { id: "politique", ...verifierPolitique(o) },
    { id: "responsable", ...verifierResponsable(o) },
    { id: "transfert", ...verifierTransfert(o) },
    { id: "droits", ...verifierDroits(o) },
    { id: "tiers", ...verifierTiers(o, temoins.hotes) },
    { id: "https", ...verifierHttps(o) },
  ];
  const synthese: Record<Etat, number> = { "a-corriger": 0, "a-verifier": 0, "en-place": 0 };
  for (const r of resultats) synthese[r.etat] += 1;
  return {
    adresse: o.adresse,
    adresseFinale: o.adresseFinale,
    politique: o.politique?.url ?? o.lienPolitique?.url ?? null,
    date: new Date().toISOString(),
    duree: Date.now() - debut,
    resultats,
    synthese,
  };
}

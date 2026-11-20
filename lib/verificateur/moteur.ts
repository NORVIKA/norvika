/**
 * Vérificateur Loi 25 : la visite, avec un vrai navigateur (Cloudflare Browser Run, liaison
 * `BROWSER` du Worker norvika). SERVEUR SEULEMENT.
 *
 * Une visite = l'accueil, 8 secondes SANS AUCUNE INTERACTION (on regarde ce qui part et ce qui se
 * dépose tout seul), puis la page de politique trouvée par son lien. Deux pages au plus, 30 s au
 * total, navigateur fermé dans un `finally` quoi qu'il arrive (et de force à l'échéance).
 *
 * POURQUOI LA LIAISON ET PAS L'API REST : l'API REST exigerait un jeton de compte Cloudflare posé
 * en secret sur le Worker ; la liaison n'en demande aucun (elle est le droit d'accès). Forfait
 * Workers Paid : 10 h de navigateur par mois incluses (environ 1 800 visites de 20 s).
 *
 * SÉCURITÉ (revue de Sentinel du 2026-11-19, constats E2, M1, M2, F1, F2 corrigés ici) :
 *   - chaque requête du navigateur, redirections comprises, passe par l'interception et par la garde
 *     de lib/verificateur/adresse.ts (forme, puis DNS) AVANT de partir : http(s) seulement, ports
 *     80 et 443, aucune adresse privée ou réservée, aucun nom local ;
 *   - ce que l'interception de Puppeteer NE voit PAS est retiré avant tout script du site, dans
 *     chaque cadre : WebSocket (aussi bloqué au niveau réseau, ws:// et wss://), WebTransport,
 *     SharedWorker, Worker, WebRTC, service workers, window.open. Une cible worker ou service worker
 *     qui apparaît quand même arrête la visite (E2) ;
 *   - chaque réponse est contrôlée sur l'adresse IP jointe par le navigateur : une adresse privée
 *     (rebinding DNS) arrête la visite (M1), sauf la paire exacte du mandataire de Browser Run ;
 *   - 400 requêtes au plus par visite ; après les 8 s, seule la page de politique et ce qui vient de
 *     son propre domaine passent (M2) ;
 *   - le navigateur est fermé même si le visiteur coupe la connexion, par waitUntil (F1) ;
 *   - les scripts de lecture tournent dans un monde ISOLÉ (le site ne peut pas falsifier leurs
 *     fonctions), et leur résultat est revérifié ici, type et longueur (F2).
 * Aucune réponse brute n'est rendue au visiteur : seulement des signaux (noms de témoins,
 * domaines, oui ou non).
 *
 * ⚠️ Le code exécuté DANS la page est une CHAÎNE (SCRIPT_ACCUEIL, SCRIPT_TEXTE), pas une fonction :
 * la construction (Next, puis esbuild d'OpenNext) réécrit les fonctions et peut y glisser des
 * aides (`__name`) qui n'existent pas dans la page. Une chaîne arrive telle quelle.
 */
import "server-only";

import puppeteer, { type Browser, type CDPSession, type HTTPRequest, type Page } from "@cloudflare/puppeteer";

type Connection = NonNullable<ReturnType<CDPSession["connection"]>>;
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { creerGardeReseau, ipReservee } from "./adresse";
import type { Observations, Requete, Temoin } from "./analyse";
import {
  ADRESSE_POLITIQUE,
  OUTILS_CONSENTEMENT,
  TEXTE_BANNIERE,
  TEXTE_POLITIQUE,
  TEXTE_REFUS,
} from "./listes";

/** Budget total d'une visite. La route ajoute sa propre marge (Turnstile, limite de débit). */
const BUDGET_MS = 30_000;
/** Observation sans interaction, après le chargement de l'accueil (cahier des charges). */
const OBSERVATION_MS = 8_000;
const DELAI_ACCUEIL_MS = 12_000;
const DELAI_POLITIQUE_MS = 7_000;
/** Requêtes au plus par visite (M2) : au-delà, tout est refusé, pas seulement non noté. */
const MAX_REQUETES = 400;
/** Navigateurs en même temps pour tout le compte (souhait de Sentinel, E1) : au-delà, « capacite ». */
const MAX_SIMULTANES = 5;
const MAX_TEMOINS = 200;
const MAX_TEXTE_POLITIQUE = 200_000;

/** Pourquoi une visite n'a pas pu se faire. Le texte affiché vient du Studio, par ce code. */
export type CodeMoteur = "indisponible" | "capacite" | "inaccessible" | "refusee" | "protege" | "delai" | "incompatible";

export class ErreurMoteur extends Error {
  constructor(
    readonly code: CodeMoteur,
    detail?: string,
  ) {
    super(detail ?? code);
    this.name = "ErreurMoteur";
  }
}

type LiaisonNavigateur = { fetch: typeof fetch };

/** Domaines de fournisseurs dont la politique n'est PAS celle du site (badge reCAPTCHA, bannière). */
const POLITIQUES_DE_FOURNISSEURS = [
  "google.com",
  "cookieyes.com",
  "cookiebot.com",
  "onetrust.com",
  "cookielaw.org",
  "wix.com",
  "squarespace.com",
  "shopify.com",
  "facebook.com",
  "hubspot.com",
  "cloudflare.com",
  "axeptio.eu",
  "didomi.io",
  "usercentrics.com",
];

/**
 * Script lancé dans l'accueil après les 8 s. Il ne CLIQUE sur rien : il lit la page.
 * Rend : outils de consentement reconnus par leur sélecteur, boîte flottante « maison » qui parle
 * de témoins, texte du bouton de refus visible, lien vers la politique, et signe d'un défi anti-robot.
 */
const SCRIPT_ACCUEIL = `(function (args) {
  var refus = new RegExp(args.refus, "i");
  var banniere = new RegExp(args.banniere, "i");
  var politique = new RegExp(args.politique, "i");
  var adressePolitique = new RegExp(args.adressePolitique, "i");

  function visible(el) {
    if (!el || !el.getClientRects || el.getClientRects().length === 0) return false;
    var s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) === 0) return false;
    var r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  }
  // Le texte visible d'abord ; l'étiquette accessible seulement si le bouton n'a pas de texte.
  function texteDe(el) {
    var t = (el.innerText || el.textContent || el.value || "").replace(/\\s+/g, " ").trim();
    return t || (el.getAttribute("aria-label") || el.getAttribute("title") || "").replace(/\\s+/g, " ").trim();
  }
  // Toutes les racines : le document et les racines fantômes ouvertes (Usercentrics, par exemple).
  var racines = [document];
  (function chercher(racine, profondeur) {
    if (profondeur > 3) return;
    var tous = racine.querySelectorAll("*");
    for (var i = 0; i < tous.length && i < 6000; i++) {
      if (tous[i].shadowRoot) { racines.push(tous[i].shadowRoot); chercher(tous[i].shadowRoot, profondeur + 1); }
    }
  })(document, 0);
  function tousLes(selecteur) {
    var liste = [];
    racines.forEach(function (r) { try { liste = liste.concat(Array.prototype.slice.call(r.querySelectorAll(selecteur))); } catch (e) {} });
    return liste;
  }

  var outils = [];
  args.outils.forEach(function (o) {
    if (o.selecteurs.some(function (s) { return tousLes(s).length > 0; })) outils.push(o.nom);
  });

  // Boîte flottante qui parle de témoins : on sonde quelques points de l'écran (bas, centre, haut)
  // et on remonte jusqu'à un ancêtre en position fixe ou collante.
  var maison = false;
  var w = innerWidth, h = innerHeight;
  var points = [[w / 2, h - 30], [w / 2, h - 110], [w / 2, h / 2], [60, h - 40], [w - 60, h - 40], [w / 2, 40]];
  for (var p = 0; p < points.length && !maison; p++) {
    var pile = document.elementsFromPoint(points[p][0], points[p][1]);
    for (var k = 0; k < pile.length && !maison; k++) {
      var el = pile[k];
      for (var n = 0; el && n < 12; n++, el = el.parentElement) {
        var pos = getComputedStyle(el).position;
        if (pos === "fixed" || pos === "sticky") {
          var t = (el.innerText || "").slice(0, 3000);
          if (banniere.test(t) && el.querySelector("button, a, [role=button]")) maison = true;
          break;
        }
      }
    }
  }

  // Bouton de refus VISIBLE au premier niveau (sans ouvrir de panneau de réglages).
  var texteRefus = null;
  var candidats = tousLes("button, a, [role=button], input[type=button], input[type=submit]");
  for (var c = 0; c < candidats.length; c++) {
    var tx = texteDe(candidats[c]);
    if (tx.length > 0 && tx.length <= 60 && refus.test(tx) && visible(candidats[c])) { texteRefus = tx; break; }
  }

  // Lien vers la politique : par le texte d'abord, par l'adresse ensuite. Les liens du site
  // passent avant ceux d'un autre domaine (politique hébergée chez Termly, par exemple).
  var liens = Array.prototype.slice.call(document.querySelectorAll("a[href]"));
  var trouves = [];
  liens.forEach(function (a) {
    var href = a.href || "";
    if (!/^https?:/i.test(href)) return;
    var tx = texteDe(a);
    var parTexte = politique.test(tx);
    var parAdresse = adressePolitique.test(href);
    if (!parTexte && !parAdresse) return;
    var hote = "";
    try { hote = new URL(href).hostname.toLowerCase(); } catch (e) { return; }
    if (args.fournisseurs.some(function (d) { return hote === d || hote.slice(-d.length - 1) === "." + d; })) return;
    var memeSite = hote === location.hostname.toLowerCase() || hote.replace(/^www\\./, "") === location.hostname.toLowerCase().replace(/^www\\./, "");
    // Un lien du pied de page passe avant celui d'une mention de formulaire ou d'un paragraphe.
    var auPied = !!(a.closest && a.closest("footer, [role=contentinfo]"));
    trouves.push({ texte: tx.slice(0, 120), url: href, score: (memeSite ? 4 : 0) + (parTexte ? 2 : 0) + (auPied ? 1 : 0) });
  });
  trouves.sort(function (a, b) { return b.score - a.score; });
  var lien = trouves.length ? { texte: trouves[0].texte, url: trouves[0].url } : null;

  var corps = (document.body && document.body.innerText) || "";
  var defi = /just a moment|attention required|checking your browser|v[ée]rification de s[ée]curit[ée]|un instant/i.test(document.title) ||
    (!!document.querySelector("#challenge-form, #challenge-running, iframe[src*='challenges.cloudflare.com']") && corps.length < 600);

  return { outils: outils, maison: maison, refus: texteRefus, lien: lien, defi: defi };
})`;

/** Texte lisible d'une page (la politique), plafonné dans la page. */
const SCRIPT_TEXTE = `(function (max) { return ((document.body && document.body.innerText) || "").slice(0, max); })`;

/**
 * Lancé dans CHAQUE document, chaque cadre et chaque worker, AVANT tout script du site (E2 de
 * Sentinel ; WebSocketStream ajouté à la passe 2, N1 : Network.setBlockedURLs ne le bloque pas) :
 * retire ce qui échappe à l'interception de Puppeteer. `globalThis` : le même texte vaut pour une
 * page et pour un worker (où `window` n'existe pas). Validé par le banc d'essai de Sentinel (0
 * contournement, cadres vides et cadres d'un autre site compris). Effet connu : un site qui déplace
 * Google Analytics dans un Worker (Partytown) est moins bien lu, ce qui reste rare.
 */
const SCRIPT_BARRIERE = `(function () {
  var g = typeof globalThis !== "undefined" ? globalThis : self;
  try { g.open = function () { return null; }; } catch (e) {}
  var cles = ["WebSocket", "WebSocketStream", "WebTransport", "SharedWorker", "Worker", "RTCPeerConnection", "webkitRTCPeerConnection", "RTCDataChannel"];
  for (var i = 0; i < cles.length; i++) {
    try { delete g[cles[i]]; Object.defineProperty(g, cles[i], { value: undefined, configurable: false, writable: false }); } catch (e) {}
  }
  try { Object.defineProperty(Navigator.prototype, "serviceWorker", { get: function () { return undefined; }, configurable: false }); } catch (e) {}
  // N2 : une iframe sandbox sans allow-same-origin et sans adresse http(s) (srcdoc, data:, blob:,
  // about:) part dans un autre processus que Chrome ne met PAS en pause : aucune barrière n'y
  // entre à temps. Elle est retirée du document dès son insertion, avant que sa navigation aboutisse.
  // H1 (Sentinel, passe 3) : l'observateur n'emploie QUE des fonctions natives prises ici, avant
  // tout script du site : getters lus par descripteur, appels par Reflect.apply (jamais .call),
  // RegExp.prototype.exec, aucune méthode de chaîne. Le site ne peut plus les remplacer.
  // H2 : attachShadow est enveloppé, pour observer aussi chaque shadow root créé par script
  // (ouvert ou fermé). Le shadow root déclaratif et une boucle qui retarde l'observateur restent
  // au filet du moteur (cadre attaché sans pause = visite arrêtée) : c'est accepté.
  try {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined") return;
    var appel = Reflect.apply, desc = Object.getOwnPropertyDescriptor, definir = Object.defineProperty;
    var lire = function (proto, nom) { var d = desc(proto, nom); return d && d.get; };
    var E = Element.prototype, N = Node.prototype, F = DocumentFragment.prototype, MR = MutationRecord.prototype;
    var gNodeType = lire(N, "nodeType"), gLocalName = lire(E, "localName"), gAjoutes = lire(MR, "addedNodes");
    var gType = lire(MR, "type"), gCible = lire(MR, "target"), gLongueur = lire(NodeList.prototype, "length");
    var retirer = E.remove, attr = E.getAttribute, a = E.hasAttribute, qsaE = E.querySelectorAll, qsaF = F.querySelectorAll;
    var exec = RegExp.prototype.exec, MO = MutationObserver, observer = MutationObserver.prototype.observe, attache = E.attachShadow;
    var MEME_ORIGINE = /(^|[^a-z-])allow-same-origin([^a-z-]|$)/i, HTTP = /^https?:/i;
    var OPTIONS = { childList: true, subtree: true, attributes: true, attributeFilter: ["sandbox", "srcdoc", "src"] };
    var suspecte = function (el) {
      if (!el || appel(gNodeType, el, []) !== 1 || appel(gLocalName, el, []) !== "iframe" || !appel(a, el, ["sandbox"])) return false;
      if (appel(exec, MEME_ORIGINE, [appel(attr, el, ["sandbox"]) || ""]) !== null) return false;
      return appel(a, el, ["srcdoc"]) || appel(exec, HTTP, [appel(attr, el, ["src"]) || ""]) === null;
    };
    var nettoyer = function (n) {
      if (!n) return;
      if (suspecte(n)) { appel(retirer, n, []); return; }
      var t = appel(gNodeType, n, []);
      if (t !== 1 && t !== 11) return;
      var l = appel(t === 1 ? qsaE : qsaF, n, ["iframe[sandbox]"]), nb = appel(gLongueur, l, []);
      for (var j = 0; j < nb; j++) if (suspecte(l[j])) appel(retirer, l[j], []);
    };
    var mo = new MO(function (liste) {
      for (var i = 0; i < liste.length; i++) {
        var m = liste[i];
        if (appel(gType, m, []) === "attributes") { nettoyer(appel(gCible, m, [])); continue; }
        var ajoutes = appel(gAjoutes, m, []), nb = appel(gLongueur, ajoutes, []);
        for (var k = 0; k < nb; k++) nettoyer(ajoutes[k]);
      }
    });
    appel(observer, mo, [document, OPTIONS]);
    if (attache) {
      definir(E, "attachShadow", {
        configurable: false,
        writable: false,
        value: function attachShadow() {
          var racine = appel(attache, this, arguments);
          try { appel(observer, mo, [racine, OPTIONS]); } catch (e) {}
          return racine;
        },
      });
    }
  } catch (e) {}
})();`;

type ResultatAccueil = {
  outils: string[];
  maison: boolean;
  refus: string | null;
  lien: { texte: string; url: string } | null;
  defi: boolean;
};

const NOMS_OUTILS = new Set(OUTILS_CONSENTEMENT.map((o) => o.nom));

/**
 * Revérifie ici ce que le script de lecture a rendu (F2) : types, valeurs permises, longueurs.
 * Même dans un monde isolé, la page contrôle le DOM lu ; rien de ce qui en sort n'est cru tel quel.
 */
function lireResultatAccueil(brut: unknown): ResultatAccueil {
  const o = brut && typeof brut === "object" ? (brut as Record<string, unknown>) : {};
  const texte = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : null);
  let lien: ResultatAccueil["lien"] = null;
  if (o.lien && typeof o.lien === "object") {
    const l = o.lien as Record<string, unknown>;
    const adresse = texte(l.url, 500);
    try {
      if (adresse && /^https?:$/.test(new URL(adresse).protocol)) lien = { texte: texte(l.texte, 120) ?? "", url: adresse };
    } catch {
      lien = null;
    }
  }
  return {
    outils: Array.isArray(o.outils) ? o.outils.filter((x): x is string => typeof x === "string" && NOMS_OUTILS.has(x)).slice(0, 5) : [],
    maison: o.maison === true,
    refus: texte(o.refus, 60),
    lien,
    defi: o.defi === true,
  };
}

/**
 * Évalue `expression` dans un monde ISOLÉ du cadre principal (F2) : le site partage le DOM avec ce
 * monde, pas ses objets JavaScript. Il ne peut donc ni redéfinir `String.prototype.slice` ni
 * `RegExp` pour fausser la lecture. Valeur rendue par copie, délai de 3 s.
 */
async function evaluerIsole(page: Page, expression: string): Promise<unknown> {
  const session = await page.target().createCDPSession();
  try {
    const { frameTree } = await session.send("Page.getFrameTree");
    const { executionContextId } = await session.send("Page.createIsolatedWorld", {
      frameId: frameTree.frame.id,
      worldName: "verificateur-norvika",
    });
    const reponse = await session.send("Runtime.evaluate", {
      expression,
      contextId: executionContextId,
      returnByValue: true,
      timeout: 3_000,
    });
    return reponse.exceptionDetails ? null : (reponse.result.value ?? null);
  } finally {
    await session.detach().catch(() => undefined);
  }
}

/** Code d'erreur de Chrome dans un message (net::ERR_NAME_NOT_RESOLVED...). */
function erreurReseau(e: unknown): string {
  const message = e instanceof Error ? e.message : String(e);
  return /net::(ERR_[A-Z_]+)/.exec(message)?.[1] ?? (e instanceof Error && e.name === "TimeoutError" ? "TIMEOUT" : "AUTRE");
}

/** L'adresse en http répond-elle par une redirection vers https? Trois sauts au plus. */
async function sonderHttp(hote: string, garde: (h: string) => Promise<boolean>): Promise<Observations["https"]> {
  let adresse = `http://${hote}/`;
  for (let saut = 0; saut < 4; saut++) {
    let reponse: Response;
    try {
      reponse = await fetch(adresse, { redirect: "manual", signal: AbortSignal.timeout(5000) });
    } catch {
      return "inconnu";
    }
    await reponse.body?.cancel().catch(() => undefined);
    if (reponse.status < 300 || reponse.status >= 400) return "sans-redirection";
    const location = reponse.headers.get("location");
    if (!location) return "sans-redirection";
    let suivante: URL;
    try {
      suivante = new URL(location, adresse);
    } catch {
      return "inconnu";
    }
    if (suivante.protocol === "https:") return "redirige";
    if (suivante.protocol !== "http:" || !(await garde(suivante.hostname))) return "inconnu";
    adresse = suivante.href;
  }
  return "inconnu";
}

type Contexte = { navigateur: LiaisonNavigateur; attendre: (promesse: Promise<unknown>) => void };

async function contexte(): Promise<Contexte> {
  let env: Record<string, unknown> = {};
  let attendre: Contexte["attendre"] = () => undefined;
  try {
    const cf = await getCloudflareContext({ async: true });
    env = cf.env as unknown as Record<string, unknown>;
    attendre = (promesse) => cf.ctx.waitUntil(promesse);
  } catch {
    // Hors du Worker (next start sans OpenNext) : aucune liaison.
  }
  const navigateur = env.BROWSER as LiaisonNavigateur | undefined;
  if (!navigateur || typeof navigateur.fetch !== "function") throw new ErreurMoteur("indisponible", "liaison BROWSER absente");
  return { navigateur, attendre };
}

/**
 * Au plus MAX_SIMULTANES navigateurs à la fois, selon Browser Run. Ceinture seulement : la vraie
 * garde, atomique et fermée en cas de panne, est dans la base (verifier_debit_verificateur refuse
 * à 5 analyses de moins de 35 s, N3 de Sentinel). Si Browser Run ne répond pas, on s'y fie.
 */
async function verifierCapacite(navigateur: LiaisonNavigateur): Promise<void> {
  let actives: number | null = null;
  try {
    actives = (await puppeteer.limits(navigateur)).activeSessions.length;
  } catch {
    actives = null;
  }
  if (actives !== null && actives >= MAX_SIMULTANES) throw new ErreurMoteur("capacite", "SIMULTANES");
}

/** Lance le navigateur et traduit un refus de Browser Run (quota, trop de navigateurs à la fois). */
async function lancer(navigateur: LiaisonNavigateur): Promise<Browser> {
  try {
    return await puppeteer.launch(navigateur, { keep_alive: 60_000 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (/429|rate limit|too many|limit|quota/i.test(message)) throw new ErreurMoteur("capacite", "LANCEMENT");
    throw new ErreurMoteur("indisponible", "LANCEMENT");
  }
}

/** L'erreur rendue pour un arrêt décidé pendant la visite. */
function arret(motif: string): ErreurMoteur {
  // Rebinding : une adresse privée a vraiment été jointe. Le reste (cadre ou worker hors de la
  // barrière) : le site emploie un moyen que l'outil ne sait pas surveiller, donc pas d'analyse.
  return new ErreurMoteur(motif === "REBINDING" ? "refusee" : "incompatible", motif);
}

/**
 * M1 et le mandataire de Browser Run (essai du 2026-11-19, Chrome 152) : le navigateur distant
 * sort par un mandataire local, et CHAQUE réponse porte l'adresse de ce mandataire, jamais celle
 * du site. Cette paire exacte (bouclage IPv6, port 9001) n'arrête donc pas la visite ; toute autre
 * adresse réservée l'arrête, comme avant. Derrière ce mandataire, le contrôle de l'adresse réelle
 * revient à la garde DNS (chaque nom, avant chaque requête) et au réseau de Browser Run.
 * ⛔ Si Browser Run change d'adresse ou de port, chaque visite est refusée (REBINDING) : ajuster la
 *    paire ici, jamais élargir la règle (tout le bouclage, tout port, « la première adresse vue »).
 */
const MANDATAIRE_BROWSER_RUN = { ip: "::1", port: 9001 } as const;

function viaMandataire(adresse: { ip?: string; port?: number } | undefined): boolean {
  return adresse?.ip?.replace(/^\[|\]$/g, "") === MANDATAIRE_BROWSER_RUN.ip && adresse.port === MANDATAIRE_BROWSER_RUN.port;
}

const URL_DE_CHROME = /^(chrome|chrome-extension|devtools):/;
type CibleAttachee = { sessionId: string; waitingForDebugger: boolean; targetInfo: { type: string; url: string } };

/**
 * N2 de Sentinel (passe 2) : Puppeteer ne pose ses scripts dans un cadre hors processus que s'il
 * connaît déjà ce cadre. Une iframe sandbox srcdoc lui échappe, et Chrome l'attache SANS la mettre
 * en pause (waitingForDebugger = false, mesuré au banc v2) : ses scripts peuvent avoir tourné avant
 * qu'on puisse y toucher. Deux gestes :
 *   1. chaque nouvelle session CDP reçoit la barrière et le blocage ws:// AVANT que Puppeteer ne
 *      relance la cible (l'événement « sessionattached » de la connexion passe avant le sien) ;
 *   2. FILET FERMÉ : un cadre attaché sans pause, ou tout worker du site, arrête la visite (code
 *      « incompatible », aucun résultat). Une analyse refusée vaut mieux qu'un trou.
 * Limite connue : le filet arrête la visite, il n'empêche pas une première connexion déjà partie
 * d'un tel cadre. Sur Browser Run, le Local Network Access de Chrome 152 bloque en plus les
 * requêtes d'un site public vers une adresse locale.
 */
function surveillerCibles(connexion: Connection | undefined, principale: CDPSession | undefined, arreter: (motif: string) => void) {
  if (!connexion || !principale) {
    // Sans ces deux points d'écoute, aucune garantie : la visite ne se fait pas (fermé en cas de doute).
    throw new ErreurMoteur("indisponible", "SURVEILLANCE");
  }
  const surAttache = (e: CibleAttachee) => {
    const { type, url } = e.targetInfo;
    if (URL_DE_CHROME.test(url) || type === "page" || type === "tab" || type === "browser") return;
    if (type === "worker" || type === "shared_worker" || type === "service_worker") return arreter("WORKER");
    if (!e.waitingForDebugger) return arreter("CIBLE");
  };
  const ecouter = (session: CDPSession) => session.on("Target.attachedToTarget", (e: unknown) => surAttache(e as CibleAttachee));
  ecouter(principale);
  connexion.on("Target.attachedToTarget", (e: unknown) => surAttache(e as CibleAttachee));
  connexion.on("sessionattached", (session: CDPSession) => {
    // Envoyés ici, ces ordres passent AVANT le Runtime.runIfWaitingForDebugger de Puppeteer.
    void session.send("Page.addScriptToEvaluateOnNewDocument", { source: SCRIPT_BARRIERE, runImmediately: true }).catch(() => undefined);
    void session.send("Runtime.evaluate", { expression: SCRIPT_BARRIERE }).catch(() => undefined);
    void session.send("Network.setBlockedURLs", { urls: ["ws://*", "wss://*"] }).catch(() => undefined);
    ecouter(session);
  });
}

/** Un nom d'hôte sans « www. » : la politique de exemple.ca peut rediriger vers www.exemple.ca. */
const sansWww = (hote: string) => hote.toLowerCase().replace(/^www\./, "");

/** Les moments d'une visite, pour le filtre des requêtes (M2). */
type Moment = "accueil" | "entre" | "politique";

/**
 * Visite `url` et rend ce que le navigateur a vu. `url` a déjà passé normaliserAdresse ET
 * resoudrePublic (route), mais chaque requête repasse quand même par la garde : une redirection
 * peut mener ailleurs.
 */
export async function observer(url: URL): Promise<Observations> {
  const echeance = Date.now() + BUDGET_MS;
  const restant = () => echeance - Date.now();
  const garde = creerGardeReseau();
  const requetes: Requete[] = [];
  let moment: Moment = "accueil";
  let hotePolitique = "";
  let compte = 0;
  let motifArret: string | null = null;
  let browser: Browser | null = null;
  let minuterie: ReturnType<typeof setTimeout> | undefined;
  let terminer: () => void = () => undefined;
  const terminee = new Promise<void>((r) => (terminer = r));

  // La sonde http part en même temps que le navigateur : elle ne lui coûte rien.
  const sonde = sonderHttp(url.hostname, garde);

  try {
    const { navigateur, attendre } = await contexte();
    await verifierCapacite(navigateur);
    browser = await lancer(navigateur);
    const actif = browser;
    const arreter = (motif: string) => {
      if (motifArret) return;
      motifArret = motif;
      void actif.close().catch(() => undefined);
    };

    // F1 : si le visiteur coupe, la requête est annulée et le `finally` peut ne jamais tourner.
    // waitUntil garde le Worker en vie le temps de fermer le navigateur (sinon facturé 60 s).
    attendre(Promise.race([terminee, new Promise((r) => setTimeout(r, BUDGET_MS))]).then(() => actif.close().catch(() => undefined)));
    // Filet de sécurité : à l'échéance, le navigateur est fermé de force.
    minuterie = setTimeout(() => void actif.close().catch(() => undefined), Math.max(0, restant()));

    actif.on("targetcreated", (cible) => {
      const type = cible.type();
      // E2 : un worker partagé ou un service worker DU SITE ferait ses requêtes hors interception.
      // Ceux de Chrome lui-même (extensions intégrées, chrome-extension://) apparaissent à chaque
      // lancement, vu au banc d'essai : ils ne viennent pas du site et sont ignorés.
      if ((type === "service_worker" || type === "shared_worker") && !/^chrome(-extension)?:/.test(cible.url())) {
        return arreter("WORKER");
      }
      // Les autres cibles (cadres hors processus, workers dédiés) sont surveillées plus bas, à
      // l'attache CDP, là où Chrome dit si la cible attend avant son premier script.
      // Une fenêtre surgissante aurait ses propres requêtes, hors interception.
      if (type === "page" && cible.opener()) {
        void cible
          .page()
          .then((p) => p?.close())
          .catch(() => undefined);
      }
    });

    const page = await actif.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    await page.setUserAgent((await actif.userAgent()).replace(/HeadlessChrome/g, "Chrome"));
    await page.setExtraHTTPHeaders({ "Accept-Language": "fr-CA,fr;q=0.9,en;q=0.6" });
    await page.setBypassServiceWorker(true);
    // E2 : WebSocket bloqué au niveau réseau, puis retiré de la page avec les autres canaux.
    const reseau = await page.target().createCDPSession();
    await reseau.send("Network.enable");
    await reseau.send("Network.setBlockedURLs", { urls: ["ws://*", "wss://*"] });
    // N4 : aucune page prérendue (Puppeteer n'y pose pas ses scripts).
    await reseau.send("Page.setPrerenderingAllowed", { isAllowed: false }).catch(() => undefined);
    await page.evaluateOnNewDocument(SCRIPT_BARRIERE);
    surveillerCibles(reseau.connection(), (page as unknown as { _client?: () => CDPSession })._client?.(), arreter);
    // R1 : un Worker dédié apparaît comme une cible « other », que le filet du navigateur ne voit pas.
    page.on("workercreated", () => arreter("WORKER"));
    await page.setRequestInterception(true);
    page.on("request", (requete) => void filtrer(requete));
    // M1 : l'adresse IP réellement jointe par le navigateur. Notre DNS et le sien peuvent différer
    // (rebinding) : une réponse venue d'une adresse privée arrête tout, aussitôt. Seule exception :
    // le mandataire de Browser Run, à sa paire exacte (voir viaMandataire).
    page.on("response", (reponse) => {
      const adresse = reponse.remoteAddress();
      const ip = adresse?.ip;
      if (ip && !viaMandataire(adresse) && ipReservee(ip)) arreter("REBINDING");
    });

    async function filtrer(requete: HTTPRequest) {
      try {
        if (requete.isInterceptResolutionHandled()) return;
        let u: URL;
        try {
          u = new URL(requete.url());
        } catch {
          return await requete.abort("blockedbyclient");
        }
        if (u.protocol === "data:" || u.protocol === "blob:" || u.href === "about:blank") return await requete.continue();
        if (u.protocol !== "http:" && u.protocol !== "https:") return await requete.abort("blockedbyclient");
        if ((u.port && u.port !== "80" && u.port !== "443") || u.username || u.password) return await requete.abort("blockedbyclient");
        // M2 : plafond de requêtes, et rien entre l'accueil et la politique ; pendant la politique,
        // seulement son propre domaine (le document et ce qu'il charge de chez lui).
        compte += 1;
        // R2 : dès qu'un arrêt est décidé, plus rien ne part, même avant la fermeture.
        if (motifArret || compte > MAX_REQUETES || moment === "entre") return await requete.abort("blockedbyclient");
        if (moment === "politique" && sansWww(u.hostname) !== hotePolitique) return await requete.abort("blockedbyclient");
        if (moment === "accueil") requetes.push({ url: u.href.slice(0, 500), hote: u.hostname.toLowerCase(), type: requete.resourceType() });
        if (!(await garde(u.hostname))) return await requete.abort("blockedbyclient");
        // Les vidéos sont lourdes et ne disent rien de la Loi 25 : notées, puis coupées.
        if (requete.resourceType() === "media") return await requete.abort("blockedbyclient");
        return await requete.continue();
      } catch {
        // Page fermée pendant la décision (échéance, arrêt) : rien à faire.
      }
    }

    // --- 1. L'accueil -----------------------------------------------------------------------
    const adresseFinale = await ouvrirAccueil(page, url, restant);

    // --- 2. Huit secondes sans aucune interaction --------------------------------------------
    await new Promise((r) => setTimeout(r, Math.max(0, Math.min(OBSERVATION_MS, restant() - 3_000))));
    moment = "entre";
    if (motifArret) throw arret(motifArret);

    const temoins = await lireTemoins(page);
    const accueil = lireResultatAccueil(
      await evaluerIsole(
        page,
        `${SCRIPT_ACCUEIL}(${JSON.stringify({
          refus: TEXTE_REFUS.source,
          banniere: TEXTE_BANNIERE.source,
          politique: TEXTE_POLITIQUE.source,
          adressePolitique: ADRESSE_POLITIQUE.source,
          outils: OUTILS_CONSENTEMENT.map((o) => ({ nom: o.nom, selecteurs: o.selecteurs })),
          fournisseurs: POLITIQUES_DE_FOURNISSEURS,
        })})`,
      ),
    );
    if (accueil.defi) throw new ErreurMoteur("protege");

    // Un outil reconnu par le domaine de son script compte autant qu'un sélecteur dans la page.
    const outilParScript = OUTILS_CONSENTEMENT.find((o) =>
      o.domaines.some((d) => requetes.some((r) => r.hote === d || r.hote.endsWith(`.${d}`))),
    )?.nom;

    // --- 3. La politique ----------------------------------------------------------------------
    let politique: Observations["politique"] = null;
    if (accueil.lien) {
      hotePolitique = sansWww(new URL(accueil.lien.url).hostname);
      moment = "politique";
      politique = await lirePolitique(page, accueil.lien.url, adresseFinale, restant);
      moment = "entre";
    }
    if (motifArret) throw arret(motifArret);

    return {
      adresse: url.href,
      adresseFinale,
      temoins,
      requetes,
      banniere: { outil: accueil.outils[0] ?? outilParScript ?? null, maison: accueil.maison, refus: accueil.refus },
      lienPolitique: accueil.lien,
      politique,
      https: adresseFinale.startsWith("http://") ? "https-absent" : await sonde,
    };
  } catch (e) {
    if (motifArret) throw arret(motifArret);
    if (e instanceof ErreurMoteur) throw e;
    if (restant() <= 0) throw new ErreurMoteur("delai");
    throw new ErreurMoteur("inaccessible", erreurReseau(e));
  } finally {
    terminer();
    clearTimeout(minuterie);
    await browser?.close().catch(() => undefined);
  }
}

/**
 * Ouvre l'accueil et rend l'adresse atteinte. Sans protocole écrit, l'adresse est en https ; si
 * https ne répond pas du tout (certificat, connexion refusée), un seul essai en http, pour pouvoir
 * dire « votre site n'est pas en https » plutôt que « inaccessible ».
 */
async function ouvrirAccueil(page: Page, url: URL, restant: () => number): Promise<string> {
  const essayer = async (adresse: string) =>
    page.goto(adresse, {
      waitUntil: "domcontentloaded",
      timeout: Math.max(1_000, Math.min(DELAI_ACCUEIL_MS, restant() - OBSERVATION_MS - 4_000)),
    });

  let reponse;
  try {
    reponse = await essayer(url.href);
  } catch (e) {
    const code = erreurReseau(e);
    if (code === "ERR_BLOCKED_BY_CLIENT") throw new ErreurMoteur("refusee", code);
    const httpsEnPanne = /^ERR_(CERT_|SSL_|CONNECTION_REFUSED|CONNECTION_RESET|CONNECTION_CLOSED)/.test(code);
    if (url.protocol === "https:" && httpsEnPanne) {
      try {
        reponse = await essayer(url.href.replace(/^https:/, "http:"));
      } catch (e2) {
        throw new ErreurMoteur(erreurReseau(e2) === "ERR_BLOCKED_BY_CLIENT" ? "refusee" : "inaccessible", erreurReseau(e2));
      }
    } else if (code === "TIMEOUT" && page.url() !== "about:blank") {
      // Le document est arrivé mais un script retarde « DOMContentLoaded » : on observe quand même.
      reponse = null;
    } else {
      throw new ErreurMoteur("inaccessible", code);
    }
  }

  // Texte de Martin : « Visite refusée par le site (403, défi anti-robot) ». Un 401 ou un 403 sur
  // l'accueil d'un site public, c'est presque toujours une protection contre les robots.
  const statut = reponse?.status() ?? 200;
  if (statut === 401 || statut === 403 || reponse?.headers()["cf-mitigated"] === "challenge") {
    throw new ErreurMoteur("protege", `HTTP ${statut}`);
  }
  if (statut >= 400) throw new ErreurMoteur("inaccessible", `HTTP ${statut}`);
  return page.url();
}

/** Tous les témoins du navigateur, témoins tiers compris (le navigateur est neuf à chaque visite). */
async function lireTemoins(page: Page): Promise<Temoin[]> {
  const propres = (liste: { name?: unknown; domain?: unknown }[]) =>
    liste
      .filter((c) => typeof c.name === "string" && typeof c.domain === "string")
      .slice(0, MAX_TEMOINS)
      .map((c) => ({ nom: String(c.name).slice(0, 80), domaine: String(c.domain).slice(0, 120) }));
  try {
    const session = await page.target().createCDPSession();
    const { cookies } = await session.send("Network.getAllCookies");
    await session.detach().catch(() => undefined);
    return propres(cookies);
  } catch {
    return propres(await page.cookies().catch(() => []));
  }
}

/**
 * Ouvre la politique (deuxième et dernière page). Rend son code HTTP (null : pas de réponse dans le
 * délai) et son texte (null : PDF, page en erreur, ou page illisible). La vérification 3 distingue
 * « lien brisé » (à corriger) de « illisible » (à vérifier) avec ces deux valeurs.
 */
async function lirePolitique(
  page: Page,
  lien: string,
  accueil: string,
  restant: () => number,
): Promise<Observations["politique"]> {
  let cible: URL;
  try {
    cible = new URL(lien);
  } catch {
    return { url: lien, statut: null, texte: null };
  }
  if (cible.protocol !== "https:" && cible.protocol !== "http:") return { url: lien, statut: null, texte: null };
  const sansAncre = (a: string) => a.replace(/#.*$/, "");
  // F2 : le texte est relu dans un monde isolé, puis revérifié ici (type et longueur).
  const lireTexte = async () => {
    const brut = await evaluerIsole(page, `${SCRIPT_TEXTE}(${MAX_TEXTE_POLITIQUE})`);
    return typeof brut === "string" ? brut.slice(0, MAX_TEXTE_POLITIQUE) : "";
  };
  let statut: number | null = 200;
  try {
    // Une politique sur la même page (ancre, fenêtre) : aucune deuxième visite.
    if (sansAncre(cible.href) !== sansAncre(accueil)) {
      if (restant() < 2_500) return { url: cible.href, statut: null, texte: null };
      const reponse = await page.goto(cible.href, {
        waitUntil: "domcontentloaded",
        timeout: Math.max(1_000, Math.min(DELAI_POLITIQUE_MS, restant() - 1_000)),
      });
      statut = reponse?.status() ?? null;
      const type = reponse?.headers()["content-type"] ?? "text/html";
      if (statut === null || statut >= 400 || !/html/i.test(type)) return { url: page.url() || cible.href, statut, texte: null };
    }
    let texte = await lireTexte();
    // Une page bâtie en JavaScript peut être encore vide à « DOMContentLoaded » : une seconde de plus.
    if (texte.length < 500 && restant() > 1_500) {
      await new Promise((r) => setTimeout(r, 1_000));
      texte = await lireTexte();
    }
    return { url: page.url(), statut, texte };
  } catch {
    return { url: cible.href, statut: null, texte: null };
  }
}

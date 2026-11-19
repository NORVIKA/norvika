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
 * SÉCURITÉ (revue Sentinel) : chaque requête du navigateur, redirections comprises, passe par
 * l'interception et par la garde de lib/verificateur/adresse.ts (forme, puis DNS) AVANT de partir.
 * Refusé : tout ce qui n'est pas http(s), tout port autre que 80 et 443, toute adresse privée ou
 * réservée, tout nom local. Les fenêtres surgissantes sont neutralisées (window.open) et fermées,
 * les service workers contournés (sinon leurs requêtes échapperaient à l'interception).
 * Limites connues, notées pour Sentinel : les WebSockets ne passent pas par l'interception de
 * Puppeteer ; le rebinding DNS (voir resoudrePublic). Aucune réponse brute n'est rendue au
 * visiteur : seulement des signaux (noms de témoins, domaines, oui ou non).
 *
 * ⚠️ Le code exécuté DANS la page est une CHAÎNE (SCRIPT_ACCUEIL, SCRIPT_TEXTE), pas une fonction :
 * la construction (Next, puis esbuild d'OpenNext) réécrit les fonctions et peut y glisser des
 * aides (`__name`) qui n'existent pas dans la page. Une chaîne arrive telle quelle.
 */
import "server-only";

import puppeteer, { type Browser, type HTTPRequest, type Page } from "@cloudflare/puppeteer";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { creerGardeReseau } from "./adresse";
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
const MAX_REQUETES = 400;
const MAX_TEMOINS = 200;
const MAX_TEXTE_POLITIQUE = 200_000;

/** Pourquoi une visite n'a pas pu se faire. Le texte affiché vient du Studio, par ce code. */
export type CodeMoteur = "indisponible" | "capacite" | "inaccessible" | "refusee" | "protege" | "delai";

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

/** Texte lisible d'une page (la politique), plafonné. */
const SCRIPT_TEXTE = `(function (max) { return ((document.body && document.body.innerText) || "").slice(0, max); })`;

type ResultatAccueil = {
  outils: string[];
  maison: boolean;
  refus: string | null;
  lien: { texte: string; url: string } | null;
  defi: boolean;
};

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

async function liaison(): Promise<LiaisonNavigateur> {
  let env: Record<string, unknown> = {};
  try {
    env = (await getCloudflareContext({ async: true })).env as unknown as Record<string, unknown>;
  } catch {
    // Hors du Worker (next start sans OpenNext) : aucune liaison.
  }
  const navigateur = env.BROWSER as LiaisonNavigateur | undefined;
  if (!navigateur || typeof navigateur.fetch !== "function") throw new ErreurMoteur("indisponible", "liaison BROWSER absente");
  return navigateur;
}

/** Lance le navigateur et traduit un refus de Browser Run (quota, trop de navigateurs à la fois). */
async function lancer(navigateur: LiaisonNavigateur): Promise<Browser> {
  try {
    return await puppeteer.launch(navigateur, { keep_alive: 60_000 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (/429|rate limit|too many|limit|quota/i.test(message)) throw new ErreurMoteur("capacite", message.slice(0, 200));
    throw new ErreurMoteur("indisponible", message.slice(0, 200));
  }
}

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
  let enregistrer = true;
  let browser: Browser | null = null;
  let minuterie: ReturnType<typeof setTimeout> | undefined;

  // La sonde http part en même temps que le navigateur : elle ne lui coûte rien.
  const sonde = sonderHttp(url.hostname, garde);

  try {
    browser = await lancer(await liaison());
    const actif = browser;
    // Filet de sécurité : à l'échéance, le navigateur est fermé de force, ce qui fait échouer
    // l'étape en cours. Le `finally` ferme aussi, dans tous les autres cas.
    minuterie = setTimeout(() => void actif.close().catch(() => undefined), Math.max(0, restant()));

    // Une fenêtre surgissante ouverte par le site aurait ses propres requêtes, hors interception.
    actif.on("targetcreated", (cible) => {
      if (cible.type() !== "page" || !cible.opener()) return;
      void cible
        .page()
        .then((p) => p?.close())
        .catch(() => undefined);
    });

    const page = await actif.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    await page.setUserAgent((await actif.userAgent()).replace(/HeadlessChrome/g, "Chrome"));
    await page.setExtraHTTPHeaders({ "Accept-Language": "fr-CA,fr;q=0.9,en;q=0.6" });
    await page.setBypassServiceWorker(true);
    await page.evaluateOnNewDocument("window.open = function () { return null; };");
    await page.setRequestInterception(true);
    page.on("request", (requete) => void filtrer(requete));

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
        if (enregistrer && requetes.length < MAX_REQUETES) {
          requetes.push({ url: u.href.slice(0, 500), hote: u.hostname.toLowerCase(), type: requete.resourceType() });
        }
        if (!(await garde(u.hostname))) return await requete.abort("blockedbyclient");
        // Les vidéos sont lourdes et ne disent rien de la Loi 25 : notées, puis coupées.
        if (requete.resourceType() === "media") return await requete.abort("blockedbyclient");
        return await requete.continue();
      } catch {
        // Page fermée pendant la décision (échéance) : rien à faire.
      }
    }

    // --- 1. L'accueil -----------------------------------------------------------------------
    const adresseFinale = await ouvrirAccueil(page, url, restant);

    // --- 2. Huit secondes sans aucune interaction --------------------------------------------
    await new Promise((r) => setTimeout(r, Math.max(0, Math.min(OBSERVATION_MS, restant() - 3_000))));
    enregistrer = false;

    const temoins = await lireTemoins(page);
    const accueil = (await page.evaluate(
      `${SCRIPT_ACCUEIL}(${JSON.stringify({
        refus: TEXTE_REFUS.source,
        banniere: TEXTE_BANNIERE.source,
        politique: TEXTE_POLITIQUE.source,
        adressePolitique: ADRESSE_POLITIQUE.source,
        outils: OUTILS_CONSENTEMENT.map((o) => ({ nom: o.nom, selecteurs: o.selecteurs })),
        fournisseurs: POLITIQUES_DE_FOURNISSEURS,
      })})`,
    )) as ResultatAccueil;
    if (accueil.defi) throw new ErreurMoteur("protege");

    // Un outil reconnu par le domaine de son script compte autant qu'un sélecteur dans la page.
    const outilParScript = OUTILS_CONSENTEMENT.find((o) =>
      o.domaines.some((d) => requetes.some((r) => r.hote === d || r.hote.endsWith(`.${d}`))),
    )?.nom;

    // --- 3. La politique ----------------------------------------------------------------------
    const politique = accueil.lien ? await lirePolitique(page, accueil.lien.url, adresseFinale, restant) : null;

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
    if (e instanceof ErreurMoteur) throw e;
    if (restant() <= 0) throw new ErreurMoteur("delai");
    throw new ErreurMoteur("inaccessible", erreurReseau(e));
  } finally {
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
  try {
    const session = await page.target().createCDPSession();
    const { cookies } = (await session.send("Network.getAllCookies")) as { cookies: { name: string; domain: string }[] };
    await session.detach().catch(() => undefined);
    return cookies.slice(0, MAX_TEMOINS).map((c) => ({ nom: c.name.slice(0, 80), domaine: c.domain.slice(0, 120) }));
  } catch {
    const cookies = await page.cookies().catch(() => []);
    return cookies.slice(0, MAX_TEMOINS).map((c) => ({ nom: c.name.slice(0, 80), domaine: c.domain.slice(0, 120) }));
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
    let texte = (await page.evaluate(`${SCRIPT_TEXTE}(${MAX_TEXTE_POLITIQUE})`)) as string;
    // Une page bâtie en JavaScript peut être encore vide à « DOMContentLoaded » : une seconde de plus.
    if (texte.length < 500 && restant() > 1_500) {
      await new Promise((r) => setTimeout(r, 1_000));
      texte = (await page.evaluate(`${SCRIPT_TEXTE}(${MAX_TEXTE_POLITIQUE})`)) as string;
    }
    return { url: page.url(), statut, texte };
  } catch {
    return { url: cible.href, statut: null, texte: null };
  }
}

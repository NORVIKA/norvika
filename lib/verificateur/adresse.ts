/**
 * Vérificateur Loi 25 : l'adresse soumise par le visiteur, et la garde contre les réseaux privés.
 * SERVEUR SEULEMENT.
 *
 * ⛔ LE RISQUE : un serveur qui visite l'adresse que n'importe qui lui donne peut être dirigé vers un
 * réseau qu'il ne devrait jamais voir (127.0.0.1, 169.254.169.254, 10.x, l'outil de débogage du
 * navigateur lui-même). C'est la faille SSRF. Trois barrières, dans cet ordre :
 *   1. la forme (normaliserAdresse) : http ou https, ports 80 et 443, aucune adresse IP écrite en
 *      toutes lettres, aucun nom local (localhost, .local, .internal, .lan...), aucun identifiant ;
 *   2. la résolution (resoudrePublic) : le nom est résolu par DNS sur HTTPS, et UNE seule adresse
 *      privée ou réservée parmi les réponses suffit à refuser (localtest.me résout vers 127.0.0.1) ;
 *   3. dans le navigateur (lib/verificateur/moteur.ts) : chaque requête et chaque redirection repasse
 *      par les deux barrières précédentes avant de partir.
 *
 * Le drapeau `global_fetch_strictly_public` du Worker couvre `fetch()`, pas le navigateur distant :
 * d'où ce fichier.
 */

import { LONGUEUR_MAX_ADRESSE } from "./types";

export type AdresseValide = { ok: true; url: URL };
export type AdresseRefusee = { ok: false; code: CodeRefus };

/** Pourquoi une adresse est refusée. Le texte affiché au visiteur vient du Studio, par ce code. */
export type CodeRefus =
  | "vide"
  | "trop-longue"
  | "forme"
  | "protocole"
  | "port"
  | "identifiants"
  | "ip"
  | "nom-local"
  | "introuvable"
  | "privee";

/**
 * Suffixes qui ne désignent jamais un site public : noms réservés (RFC 6761, 6762, 8375, 2606) et
 * noms d'usage interne courants. Comparés au nom complet et à son dernier segment.
 */
const SUFFIXES_LOCAUX = [
  "localhost",
  "local",
  "localdomain",
  "internal",
  "intranet",
  "lan",
  "home",
  "home.arpa",
  "corp",
  "private",
  "priv",
  "test",
  "example",
  "invalid",
  "arpa",
  "onion",
];

/**
 * Normalise ce que le visiteur a tapé et applique la première barrière (la forme). Sans protocole,
 * on suppose https:// : c'est ce qu'un propriétaire de site colle le plus souvent (« monsite.ca »).
 * La résolution DNS vient ensuite (resoudrePublic), pour qu'une adresse mal formée ne coûte rien.
 */
export function normaliserAdresse(brute: string): AdresseValide | AdresseRefusee {
  const texte = brute.trim();
  if (!texte) return { ok: false, code: "vide" };
  if (texte.length > LONGUEUR_MAX_ADRESSE) return { ok: false, code: "trop-longue" };
  // Espaces, contrôles, caractères invisibles : une adresse n'en contient jamais.
  if (/[\s\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u2064\uFEFF]/.test(texte)) {
    return { ok: false, code: "forme" };
  }

  // Un protocole écrit (« ftp: », « file: », « javascript: ») est gardé tel quel pour être refusé ;
  // sans protocole, https:// est ajouté.
  const aUnProtocole = /^[a-z][a-z0-9+.-]*:/i.test(texte) && !/^[^:/]+:\d+(\/|$)/.test(texte);
  let url: URL;
  try {
    url = new URL(aUnProtocole ? texte : `https://${texte}`);
  } catch {
    return { ok: false, code: "forme" };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return { ok: false, code: "protocole" };
  if (url.username || url.password) return { ok: false, code: "identifiants" };
  // `URL` efface le port par défaut (443 en https, 80 en http) : un port restant est donc un autre
  // port, sauf 80 en https et 443 en http, permis.
  if (url.port && url.port !== "80" && url.port !== "443") return { ok: false, code: "port" };

  const verdict = verifierNomHote(url.hostname);
  if (verdict !== true) return { ok: false, code: verdict };

  // Seule l'ORIGINE est visitée (schéma et hôte) : le test porte sur l'accueil et la politique, et
  // le chemin ou les paramètres de l'adresse collée seraient un renseignement inutile envoyé à
  // Browser Run (ajustement de l'EFVP de Martin, 2026-11-18).
  return { ok: true, url: new URL(`${url.origin}/`) };
}

/**
 * Vrai si le nom d'hôte peut désigner un site public, sinon le code de refus. Sert aussi pour
 * chaque requête du navigateur (moteur.ts). `URL` a déjà converti les formes numériques d'IPv4
 * (2130706433, 0x7f.1, 0177.0.0.1) en notation pointée : un seul test les attrape toutes.
 */
export function verifierNomHote(hote: string): true | "ip" | "nom-local" | "forme" {
  const h = hote.toLowerCase().replace(/\.$/, "");
  if (!h || h.length > 253) return "forme";
  if (h.startsWith("[") || h.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return "ip";
  const segments = h.split(".");
  if (segments.length < 2) return "nom-local";
  if (segments.some((s) => !s || s.length > 63 || !/^[a-z0-9-]+$/.test(s) || s.startsWith("-") || s.endsWith("-"))) {
    return "forme";
  }
  const dernier = segments[segments.length - 1];
  // Le domaine de premier niveau est alphabétique (ca, com, quebec) ou internationalisé (xn--...).
  if (!/^[a-z]{2,63}$/.test(dernier) && !/^xn--[a-z0-9-]{1,59}$/.test(dernier)) return "forme";
  if (SUFFIXES_LOCAUX.some((s) => h === s || h.endsWith(`.${s}`))) return "nom-local";
  return true;
}

/* ------------------------------------------------------------------ adresses IP */

/** Une IPv4 en entier non signé, ou null si ce n'en est pas une (notation pointée stricte). */
function ipv4EnEntier(ip: string): number | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (!m) return null;
  const octets = m.slice(1).map(Number);
  if (octets.some((o) => o > 255)) return null;
  return ((octets[0] << 24) >>> 0) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
}

/** Plages IPv4 qui ne sont pas l'Internet public (IANA, registre des adresses à usage spécial). */
const PLAGES_V4_RESERVEES: [string, number][] = [
  ["0.0.0.0", 8], // « ce réseau »
  ["10.0.0.0", 8], // privé
  ["100.64.0.0", 10], // NAT des fournisseurs
  ["127.0.0.0", 8], // boucle locale
  ["169.254.0.0", 16], // lien local (métadonnées des nuages : 169.254.169.254)
  ["172.16.0.0", 12], // privé
  ["192.0.0.0", 24], // protocoles IETF
  ["192.0.2.0", 24], // documentation
  ["192.88.99.0", 24], // relais 6to4
  ["192.168.0.0", 16], // privé
  ["198.18.0.0", 15], // bancs d'essai
  ["198.51.100.0", 24], // documentation
  ["203.0.113.0", 24], // documentation
  ["224.0.0.0", 4], // multidiffusion
  ["240.0.0.0", 4], // réservé, et 255.255.255.255
];

function ipv4Reservee(entier: number): boolean {
  return PLAGES_V4_RESERVEES.some(([base, bits]) => {
    const b = ipv4EnEntier(base) as number;
    const masque = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return ((entier & masque) >>> 0) === ((b & masque) >>> 0);
  });
}

/** Une IPv6 en 8 groupes de 16 bits, ou null. Accepte la forme abrégée et une IPv4 finale. */
function ipv6EnGroupes(ip: string): number[] | null {
  let texte = ip.replace(/^\[|\]$/g, "").toLowerCase();
  const zone = texte.indexOf("%");
  if (zone >= 0) texte = texte.slice(0, zone);
  if (!/^[0-9a-f:.]+$/.test(texte)) return null;

  // Une IPv4 finale (::ffff:127.0.0.1) devient deux groupes.
  const v4 = /(\d{1,3}(?:\.\d{1,3}){3})$/.exec(texte);
  if (v4) {
    const entier = ipv4EnEntier(v4[1]);
    if (entier === null) return null;
    texte = `${texte.slice(0, -v4[1].length)}${(entier >>> 16).toString(16)}:${(entier & 0xffff).toString(16)}`;
  }

  const moities = texte.split("::");
  if (moities.length > 2) return null;
  const lire = (s: string) => (s ? s.split(":") : []);
  const debut = lire(moities[0]);
  const fin = moities.length === 2 ? lire(moities[1]) : [];
  const manquants = 8 - debut.length - fin.length;
  if (moities.length === 1 ? debut.length !== 8 : manquants < 1) return null;
  const groupes = [...debut, ...Array(moities.length === 2 ? manquants : 0).fill("0"), ...fin];
  if (groupes.length !== 8 || groupes.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return groupes.map((g) => parseInt(g, 16));
}

/**
 * Vrai si l'IPv6 n'est pas une adresse publique. Seule l'unidiffusion globale (2000::/3) passe,
 * moins ses plages spéciales ; une IPv4 enveloppée (::ffff:x, 64:ff9b::x) est jugée sur son IPv4.
 */
function ipv6Reservee(g: number[]): boolean {
  const tousZero = (debut: number, fin: number) => g.slice(debut, fin).every((x) => x === 0);
  // ::ffff:a.b.c.d (IPv4 mappée) et ::a.b.c.d (compatible, obsolète).
  if (tousZero(0, 5) && (g[5] === 0xffff || g[5] === 0)) {
    if (g[5] === 0 && g[6] === 0 && g[7] <= 1) return true; // :: et ::1
    return ipv4Reservee(((g[6] << 16) >>> 0) + g[7]);
  }
  if ((g[0] & 0xe000) !== 0x2000) return true; // hors 2000::/3 : fc00::/7, fe80::/10, ff00::/8, 64:ff9b::/96...
  if (g[0] === 0x2001 && g[1] < 0x0200) return true; // 2001::/23 : protocoles IETF, dont Teredo
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true; // documentation
  if (g[0] === 0x2002) return true; // 6to4 : l'IPv4 enveloppée pourrait être privée
  if (g[0] === 0x3fff && g[1] < 0x1000) return true; // documentation (RFC 9637)
  return false;
}

/** Vrai si l'adresse IP (v4 ou v6) est privée, locale ou réservée. Une forme illisible est refusée. */
export function ipReservee(ip: string): boolean {
  const v4 = ipv4EnEntier(ip);
  if (v4 !== null) return ipv4Reservee(v4);
  const v6 = ipv6EnGroupes(ip);
  if (v6 !== null) return ipv6Reservee(v6);
  return true;
}

/* ------------------------------------------------------------------ résolution DNS */

const DOH = "https://cloudflare-dns.com/dns-query";
const DELAI_DNS_MS = 3000;
/** Types d'enregistrement DNS : A (1), CNAME (5), AAAA (28). */
const TYPE_A = 1;
const TYPE_AAAA = 28;

type ReponseDoh = { Status?: number; Answer?: { type: number; data: string }[] };

async function interroger(nom: string, type: "A" | "AAAA"): Promise<string[] | null> {
  const params = new URLSearchParams({ name: nom, type });
  const reponse = await fetch(`${DOH}?${params.toString()}`, {
    headers: { accept: "application/dns-json" },
    signal: AbortSignal.timeout(DELAI_DNS_MS),
  });
  if (!reponse.ok) return null;
  const donnees = (await reponse.json()) as ReponseDoh;
  // 3 = NXDOMAIN (le nom n'existe pas) : une réponse, pas une panne.
  if (donnees.Status !== 0 && donnees.Status !== 3) return null;
  const voulu = type === "A" ? TYPE_A : TYPE_AAAA;
  return (donnees.Answer ?? []).filter((r) => r.type === voulu).map((r) => r.data);
}

export type Resolution = { ok: true; adresses: string[] } | { ok: false; code: "introuvable" | "privee" | "dns" };

/**
 * Deuxième barrière : résout le nom (A et AAAA) par DNS sur HTTPS et refuse si UNE réponse est
 * privée ou réservée. Les enregistrements CNAME sont suivis par le résolveur : seules les adresses
 * finales comptent. Une panne du résolveur refuse aussi (jamais une porte ouverte en silence).
 *
 * ⚠️ LIMITE CONNUE (rebinding DNS) : le navigateur distant fait sa propre résolution, quelques
 * millisecondes plus tard. Un domaine piégé qui répond une adresse publique ici puis une adresse
 * privée là-bas passerait. Les autres barrières restent : aucune réponse brute n'est rendue au
 * visiteur (seulement des signaux), et Chrome bloque par défaut les requêtes d'un site public vers
 * le réseau local (Local Network Access). Noté pour la revue de Sentinel.
 */
export async function resoudrePublic(hote: string): Promise<Resolution> {
  let a: string[] | null;
  let aaaa: string[] | null;
  try {
    [a, aaaa] = await Promise.all([interroger(hote, "A"), interroger(hote, "AAAA")]);
  } catch {
    return { ok: false, code: "dns" };
  }
  if (a === null || aaaa === null) return { ok: false, code: "dns" };
  const adresses = [...a, ...aaaa];
  if (!adresses.length) return { ok: false, code: "introuvable" };
  if (adresses.some(ipReservee)) return { ok: false, code: "privee" };
  return { ok: true, adresses };
}

/** Un nom d'hôte ou une adresse IP déjà en clair : verdict complet (forme puis DNS), avec cache. */
export function creerGardeReseau() {
  const cache = new Map<string, Promise<boolean>>();
  return function hotePermis(hote: string): Promise<boolean> {
    const h = hote.toLowerCase().replace(/\.$/, "");
    let verdict = cache.get(h);
    if (!verdict) {
      const forme = verifierNomHote(h);
      verdict =
        forme === "ip"
          ? Promise.resolve(!ipReservee(h.replace(/^\[|\]$/g, "")))
          : forme === true
            ? resoudrePublic(h).then((r) => r.ok)
            : Promise.resolve(false);
      cache.set(h, verdict);
    }
    return verdict;
  };
}

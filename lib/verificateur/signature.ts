import "server-only";

import type { Rapport } from "./types";

/**
 * Signature du rapport (2026-11-26). Le courriel peut maintenant être demandé APRÈS le résultat :
 * le navigateur doit donc renvoyer le rapport au serveur pour qu'il parte par courriel. Sans
 * protection, n'importe qui pourrait faire envoyer un faux rapport au nom de Norvika à l'adresse de
 * son choix, ce que la règle C7 de lib/verificateur/courriel.ts interdit. Le serveur signe donc le
 * rapport qu'il vient de calculer et refuse tout ce qui ne revient pas intact : le contenu du
 * courriel vient toujours du serveur, jamais du navigateur.
 *
 * HMAC-SHA256, clé DÉRIVÉE de RATE_LIMIT_SALT avec une étiquette propre (séparation des usages) :
 * aucun nouveau secret à poser sur le Worker, et le sel garde son usage d'origine, le hachage des
 * IP. Pour passer à un secret dédié plus tard, il suffit de changer `materiel()`.
 *
 * ⛔ Pas de repli sur un sel public : sans RATE_LIMIT_SALT (poste local), on ne signe RIEN et la
 *    demande après résultat ne s'offre pas. Un sel connu rendrait la contrefaçon triviale.
 * ⛔ La signature n'est pas à usage unique : rien n'est entreposé, donc rien à consommer. Le jeton
 *    expire après 30 minutes, et le plafond de 50 courriels par jour borne les abus. La route qui
 *    l'accepte exige aussi un jeton Turnstile frais.
 */

/** Étiquette de dérivation : change de clé si on change le format du jeton. */
const ETIQUETTE = "verificateur-rapport-v1";

/** Durée de validité du jeton : le temps de lire son résultat et de se décider. */
const DUREE_MS = 30 * 60 * 1000;

/** Garde-fou : un jeton plus gros que ça ne vient pas de nous. */
const TAILLE_MAX = 64 * 1024;

const encodeur = new TextEncoder();

function versBase64Url(octets: ArrayBuffer | Uint8Array): string {
  const vue = octets instanceof Uint8Array ? octets : new Uint8Array(octets);
  let binaire = "";
  for (const o of vue) binaire += String.fromCharCode(o);
  return btoa(binaire).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function depuisBase64Url(texte: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(texte)) return null;
  const base64 = texte.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(texte.length / 4) * 4, "=");
  try {
    const binaire = atob(base64);
    const octets = new Uint8Array(binaire.length);
    for (let i = 0; i < binaire.length; i += 1) octets[i] = binaire.charCodeAt(i);
    return octets;
  } catch {
    return null;
  }
}

/** La clé de signature, ou null quand le secret manque (poste local). */
async function cle(): Promise<CryptoKey | null> {
  const sel = process.env.RATE_LIMIT_SALT;
  if (!sel) return null;
  const materiel = await crypto.subtle.importKey("raw", encodeur.encode(sel), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const derivee = await crypto.subtle.sign("HMAC", materiel, encodeur.encode(ETIQUETTE));
  return crypto.subtle.importKey("raw", derivee, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

/**
 * Signe le rapport pour qu'il puisse revenir intact. Renvoie null quand le secret manque : l'appelant
 * n'offre alors pas la demande après résultat, plutôt que de signer avec une clé devinable.
 */
export async function signerRapport(rapport: Rapport): Promise<string | null> {
  const k = await cle();
  if (!k) return null;
  const charge = versBase64Url(encodeur.encode(JSON.stringify({ r: rapport, exp: Date.now() + DUREE_MS })));
  const signature = await crypto.subtle.sign("HMAC", k, encodeur.encode(charge));
  return `${charge}.${versBase64Url(signature)}`;
}

/**
 * Relit un jeton signé. Renvoie le rapport seulement si la signature est bonne ET le jeton pas
 * expiré ; null dans tous les autres cas, sans jamais dire lequel (ni au journal, ni à l'appelant).
 */
export async function lireRapportSigne(jeton: string): Promise<Rapport | null> {
  if (!jeton || jeton.length > TAILLE_MAX) return null;
  const point = jeton.indexOf(".");
  if (point <= 0 || point === jeton.length - 1) return null;
  const charge = jeton.slice(0, point);
  const signature = depuisBase64Url(jeton.slice(point + 1));
  const brut = depuisBase64Url(charge);
  if (!signature || !brut) return null;

  const k = await cle();
  if (!k) return null;
  // `verify` compare en temps constant : pas d'oracle temporel sur la signature.
  const valide = await crypto.subtle.verify("HMAC", k, signature as BufferSource, encodeur.encode(charge));
  if (!valide) return null;

  try {
    const lu = JSON.parse(new TextDecoder().decode(brut)) as { r?: Rapport; exp?: number };
    if (!lu || typeof lu.exp !== "number" || lu.exp < Date.now() || !lu.r) return null;
    return lu.r;
  } catch {
    return null;
  }
}

/**
 * VÉRIFICATION ANTI-ROBOT CÔTÉ SERVEUR (Cloudflare Turnstile). SERVEUR SEULEMENT.
 * Modèle : .builder/immuart/lib/anti-robot.ts (lui-même tiré de nelly-dufour, commit 36c3120).
 *
 * Les six points de la règle Turnstile (CLAUDE.md, décision William du 2026-10-11) :
 *   1. jeton vérifié ICI (siteverify) avant toute écriture et tout courriel : le widget seul ne
 *      protège rien ;
 *   2. secret absent = tout envoi refusé (503), jamais une porte ouverte en silence ;
 *   3. aucun accusé de réception au visiteur avant la vérification (les routes n'en envoient
 *      d'ailleurs aucun : un seul courriel, vers info@norvika.ca) ;
 *   4. widget « norvika.ca » du compte Cloudflare de Norvika (Managed, sans pré-autorisation),
 *      secret posé par `wrangler secret put TURNSTILE_SECRET_KEY`, jamais écrit sur le disque ;
 *   5. test bloquant avec les secrets de test : sans jeton 400, jeton refusé 403, jeton valide
 *      on arrive à l'enregistrement ;
 *   6. la politique de confidentialité mentionne Turnstile (section 8).
 *
 * ⛔ UN SECRET DE TEST (1x…, 2x…, 3x…) NE PASSE QU'EN LOCAL ET SUR workers.dev. Il fait valider
 * n'importe quel jeton : sur le vrai domaine, il fait refuser tout envoi (503).
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";

export { CHAMP_JETON } from "@/lib/anti-robot-commun";

const URL_VERIFICATION = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const PREFIXE_TEST = /^[123]x0{20,}/;
const DELAI_MS = 5000;

export type ResultatAntiRobot = { ok: true } | { ok: false; statut: 400 | 403 | 503; erreur: string };

const MESSAGES = {
  400: "La vérification anti-robot n'a pas eu lieu. Rechargez la page et réessayez.",
  403: "La vérification anti-robot a échoué. Réessayez, ou écrivez-nous à info@norvika.ca.",
  503: "Le formulaire est momentanément indisponible. Écrivez-nous à info@norvika.ca.",
} as const;

function refus(statut: 400 | 403 | 503): ResultatAntiRobot {
  return { ok: false, statut, erreur: MESSAGES[statut] };
}

async function secret(): Promise<string | undefined> {
  let valeur: string | undefined;
  try {
    valeur = ((await getCloudflareContext({ async: true })).env as Record<string, string | undefined>)
      .TURNSTILE_SECRET_KEY;
  } catch {
    // Hors du Worker (next dev, next start) : seulement process.env.
  }
  return valeur || process.env.TURNSTILE_SECRET_KEY || undefined;
}

/** Hôtes où un secret de test est toléré : le poste local et workers.dev. */
function hoteDeTest(hote: string): boolean {
  return /\.workers\.dev$/.test(hote) || hote === "localhost" || hote === "127.0.0.1";
}

export async function verifierAntiRobot(req: Request, jeton: string): Promise<ResultatAntiRobot> {
  if (!jeton || jeton.length > 2048) return refus(400);

  const cle = await secret();
  if (!cle) {
    console.error("[anti-robot] TURNSTILE_SECRET_KEY absent du Worker : tout envoi est refusé.");
    return refus(503);
  }
  const hote = (req.headers.get("host") ?? new URL(req.url).host).replace(/:\d+$/, "");
  if (PREFIXE_TEST.test(cle) && !hoteDeTest(hote)) {
    console.error("[anti-robot] TURNSTILE_SECRET_KEY est une clé de TEST sur le vrai domaine : tout envoi est refusé.");
    return refus(503);
  }

  const ip = req.headers.get("cf-connecting-ip");
  let reponse: Response;
  try {
    reponse = await fetch(URL_VERIFICATION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: cle, response: jeton, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(DELAI_MS),
    });
  } catch (erreur) {
    console.error("[anti-robot] Turnstile injoignable :", erreur instanceof Error ? erreur.name : "erreur");
    return refus(503);
  }

  let resultat: { success?: boolean; "error-codes"?: string[] } = {};
  try {
    resultat = (await reponse.json()) as typeof resultat;
  } catch {
    // Réponse illisible : traitée comme un refus.
  }
  if (resultat.success === true) return { ok: true };
  // Seulement les codes d'erreur de Cloudflare : jamais le jeton ni l'IP.
  console.warn("[anti-robot] jeton refusé :", (resultat["error-codes"] ?? []).join(", ") || `HTTP ${reponse.status}`);
  return refus(403);
}

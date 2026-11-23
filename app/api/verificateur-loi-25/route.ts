import { NextResponse } from "next/server";

import { CHAMP_JETON, verifierAntiRobot } from "@/lib/anti-robot";
import { champTexte, formeCourrielValide, ligneSimpleValide, lireCorpsJson } from "@/lib/garde-formulaire";
import { verifierDebitVerificateur } from "@/lib/rate-limit";
import { normaliserAdresse, recoitDuCourriel, resoudrePublic } from "@/lib/verificateur/adresse";
import { analyser } from "@/lib/verificateur/analyse";
import { domaineDuCourriel, envoyerRapport, type ResultatEnvoi } from "@/lib/verificateur/courriel";
import { ErreurMoteur, observer, type CodeMoteur } from "@/lib/verificateur/moteur";
import { lireTextesCourriel } from "@/lib/verificateur/textes-serveur";
import { CHAMP_ADRESSE, CHAMP_COURRIEL, CHAMP_SUIVI, LONGUEUR_MAX_COURRIEL, type ReponseVerificateur } from "@/lib/verificateur/types";

/**
 * Vérificateur Loi 25 (page /verificateur-loi-25) : visite le site soumis avec un vrai navigateur
 * et rend les écarts visibles de l'extérieur, en trois états (à corriger, à vérifier, en place).
 * ⛔ Jamais « conforme » ni « non conforme » dans la réponse : voir lib/verificateur/types.ts.
 *
 * Ordre, du moins cher au plus cher (même patron que /api/contact) :
 *   corps (32 Ko) → forme de l'adresse → forme du courriel → Turnstile → limite de débit → DNS
 *   → navigateur → courriel du rapport (facultatif).
 * Un robot ne consomme ni le quota d'une IP, ni une résolution DNS, ni un navigateur. Une adresse
 * refusée par le DNS consomme le quota : sinon la route servirait à sonder des réseaux gratuitement.
 *
 * Réponses d'erreur : { error, code }. `error` est un repli lisible ; la page affiche le texte du
 * Studio correspondant à `code` (zéro texte en dur à l'écran).
 * Rien n'est écrit dans nos bases (ni l'adresse soumise, ni le rapport) et le journal du Worker ne
 * note que le résultat chiffré, la durée et un code d'erreur, jamais l'adresse. ⚠️ Cloudflare, lui,
 * affiche les adresses visitées dans l'onglet « Runs » de Browser Run, pour une durée non
 * documentée (constat de Sentinel, 2026-11-19) : la mention de collecte et la politique le disent.
 *
 * Rapport par courriel (2026-11-23, lib/verificateur/courriel.ts) : facultatif, dans la MÊME requête,
 * écrit à partir du rapport calculé ici. Le courriel n'est ni enregistré ni journalisé (au journal :
 * l'état de l'envoi seulement). Turnstile, la limite par IP et les plafonds globaux bornent donc
 * aussi le nombre de courriels. Un échec d'envoi ne fait jamais échouer l'analyse.
 */

/** Le widget Turnstile du vérificateur (components/verificateur/Verificateur.tsx) et ses hôtes. */
const JETON_ATTENDU = { action: "verificateur", hotes: ["norvika.ca", "www.norvika.ca"] } as const;

// Analyse à la demande : jamais mise en cache, jamais prérendue.
export const dynamic = "force-dynamic";

const MESSAGES_ADRESSE: Record<string, string> = {
  vide: "Entrez l'adresse de votre site.",
  "trop-longue": "Cette adresse est trop longue.",
  forme: "Cette adresse ne semble pas valide. Exemple : monentreprise.ca",
  protocole: "Seules les adresses http et https peuvent être vérifiées.",
  port: "Seuls les ports standards (80 et 443) peuvent être vérifiés.",
  identifiants: "Retirez le nom d'utilisateur ou le mot de passe de l'adresse.",
  ip: "Entrez le nom de votre site (ex. monentreprise.ca), pas une adresse IP.",
  "nom-local": "Cette adresse ne désigne pas un site public.",
  introuvable: "Ce nom de domaine est introuvable. Vérifiez l'orthographe.",
  privee: "Cette adresse mène à un réseau privé : elle ne peut pas être vérifiée.",
  dns: "Le nom de domaine n'a pas pu être vérifié. Réessayez dans un instant.",
};

const MESSAGES_MOTEUR: Record<CodeMoteur, { statut: number; message: string }> = {
  indisponible: { statut: 503, message: "Le vérificateur est momentanément indisponible. Réessayez plus tard." },
  capacite: { statut: 503, message: "Le vérificateur a atteint sa limite pour le moment. Réessayez plus tard." },
  inaccessible: { statut: 502, message: "Votre site n'a pas répondu à notre navigateur." },
  refusee: { statut: 400, message: "Votre site redirige vers une adresse qui ne peut pas être vérifiée." },
  protege: { statut: 502, message: "Votre site a demandé une vérification anti-robot à notre navigateur." },
  delai: { statut: 504, message: "Votre site a pris trop de temps à répondre." },
  incompatible: { statut: 502, message: "Votre site emploie des éléments que notre outil ne peut pas analyser en sécurité." },
  "sans-https": { statut: 502, message: "Votre site ne répond pas en HTTPS, ou son certificat est invalide : notre navigateur s'arrête à l'avertissement de sécurité de Chrome." },
};

/** Le poste de développement (localhost, 127.0.0.1), jamais un domaine public. */
function hoteLocal(req: Request): boolean {
  const hote = (req.headers.get("host") ?? new URL(req.url).host).replace(/:\d+$/, "");
  return hote === "localhost" || hote === "127.0.0.1";
}

function refus(statut: number, error: string, code: string) {
  return NextResponse.json<ReponseVerificateur>({ ok: false, error, code }, { status: statut });
}

export async function POST(req: Request) {
  const debut = Date.now();
  const corps = await lireCorpsJson(req);
  if (!corps.ok) return refus(corps.statut, corps.erreur, "corps");

  const adresse = normaliserAdresse(champTexte(corps.donnees, CHAMP_ADRESSE));
  if (!adresse.ok) return refus(400, MESSAGES_ADRESSE[adresse.code], adresse.code);

  // Courriel facultatif : une faute de forme est refusée AVANT Turnstile et l'analyse, pour que la
  // personne la corrige sans perdre une de ses 3 analyses. La case n'a de sens qu'avec un courriel :
  // cochée sans courriel, elle est ignorée.
  const courriel = champTexte(corps.donnees, CHAMP_COURRIEL);
  if (courriel && (courriel.length > LONGUEUR_MAX_COURRIEL || !ligneSimpleValide(courriel) || !formeCourrielValide(courriel))) {
    return refus(400, "Cette adresse courriel ne semble pas valide.", "courriel");
  }
  const suivi = Boolean(courriel) && corps.donnees[CHAMP_SUIVI] === true;

  // Anti-robot AVANT la limite de débit et avant tout accès réseau (patron de /api/contact). Le jeton
  // doit venir du widget du vérificateur, sur norvika.ca (F5 de Sentinel).
  const antiRobot = await verifierAntiRobot(req, champTexte(corps.donnees, CHAMP_JETON), JETON_ATTENDU);
  if (!antiRobot.ok) return refus(antiRobot.statut, antiRobot.erreur, `anti-robot-${antiRobot.statut}`);

  // 3 analyses par IP (ou /64) par heure, et plafond GLOBAL de 200 par jour et 1 500 par mois
  // (Sentinel, E1). Fermé en cas de panne, et tant que la fonction SQL n'est pas créée.
  // Seule exception : le poste local (next dev, aperçu wrangler), qui n'a pas la clé Supabase. Le
  // nom d'hôte ne peut pas être forgé en production : Cloudflare n'achemine vers ce Worker que les
  // requêtes adressées à norvika.ca (même raisonnement que les clés de test Turnstile).
  const debit = hoteLocal(req) ? "ok" : await verifierDebitVerificateur(req);
  if (debit === "ip") return refus(429, "Vous avez lancé 3 vérifications dans la dernière heure.", "debit");
  if (debit === "quota") return refus(503, MESSAGES_MOTEUR.capacite.message, "capacite");
  if (debit === "panne") return refus(503, MESSAGES_MOTEUR.indisponible.message, "debit-panne");

  const resolution = await resoudrePublic(adresse.url.hostname);
  if (!resolution.ok) return refus(400, MESSAGES_ADRESSE[resolution.code], resolution.code);

  // Les textes du courriel (CDN de Sanity) et le MX du domaine de l'adresse (DNS sur HTTPS) se lisent
  // PENDANT l'analyse, pas après : le temps d'attente de la personne n'en est pas allongé.
  const textes = courriel ? lireTextesCourriel() : null;
  const domaineRecoit = courriel ? recoitDuCourriel(domaineDuCourriel(courriel)) : null;
  try {
    const observations = await observer(adresse.url);
    const rapport = analyser(observations, debut);
    // Ne lève jamais ; la ceinture en plus : une erreur d'envoi ne doit pas passer pour une panne d'analyse.
    const envoi = await envoyerRapport({ rapport, courriel, suivi, textes, domaineRecoit, local: hoteLocal(req) }).catch(
      (): ResultatEnvoi => ({ visiteur: "echec", interne: "aucun", motif: "resend" }),
    );
    // Au journal : l'état de l'envoi (envoye, simule, echec, aucun), JAMAIS l'adresse courriel.
    console.log(
      "[verificateur] analyse terminée",
      JSON.stringify({ ...rapport.synthese, duree: rapport.duree, courriel: envoi.visiteur, suivi: envoi.interne, motif: envoi.motif }),
    );
    return NextResponse.json<ReponseVerificateur>({ ok: true, rapport, envoi: envoi.visiteur }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const code: CodeMoteur = e instanceof ErreurMoteur ? e.code : "indisponible";
    // Au journal : le code d'erreur et un code technique court (net::ERR_..., HTTP 404), JAMAIS
    // l'adresse visitée ni un message libre qui pourrait la contenir (EFVP de Martin, 2026-11-18).
    const detail = e instanceof ErreurMoteur && /^(ERR_[A-Z_]+|HTTP \d{3}|TIMEOUT|AUTRE|WORKER|CIBLE|REBINDING|SIMULTANES|LANCEMENT|SURVEILLANCE)$/.test(e.message) ? e.message : undefined;
    console.warn("[verificateur] analyse impossible", JSON.stringify({ code, detail, duree: Date.now() - debut }));
    const { statut, message } = MESSAGES_MOTEUR[code];
    return refus(statut, message, code);
  }
}

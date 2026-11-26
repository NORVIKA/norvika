import { NextResponse } from "next/server";

import { CHAMP_JETON, verifierAntiRobot } from "@/lib/anti-robot";
import { champTexte, formeCourrielValide, ligneSimpleValide, lireCorpsJson } from "@/lib/garde-formulaire";
import { recoitDuCourriel } from "@/lib/verificateur/adresse";
import { domaineDuCourriel, envoyerRapport, type ResultatEnvoi } from "@/lib/verificateur/courriel";
import { lireRapportSigne } from "@/lib/verificateur/signature";
import { lireTextesCourriel } from "@/lib/verificateur/textes-serveur";
import {
  CHAMP_COURRIEL,
  CHAMP_JETON_RAPPORT,
  CHAMP_SUIVI,
  LONGUEUR_MAX_COURRIEL,
  type ReponseRapport,
} from "@/lib/verificateur/types";

/**
 * Envoi DIFFÉRÉ du rapport (2026-11-26). La page demande maintenant le courriel APRÈS le résultat :
 * quatre visiteurs sur cinq n'allaient pas jusqu'à lancer l'analyse quand le champ était dans le
 * formulaire, et aucun de ceux qui l'ont lancée n'a laissé son adresse.
 *
 * Aucune analyse n'est relancée ici : le rapport arrive SIGNÉ par la route voisine
 * (lib/verificateur/signature.ts) et n'est accepté que si la signature tient. C'est ce qui garde la
 * règle C7 de lib/verificateur/courriel.ts : le contenu du courriel vient toujours du serveur, et
 * personne ne peut faire partir un faux rapport au nom de Norvika.
 *
 * Ce qui borne les abus, dans l'ordre : forme du courriel, Turnstile (jeton frais du même widget),
 * signature et expiration de 30 minutes, puis le plafond de 50 courriels par jour appliqué par
 * envoyerRapport. Pas de limite par IP ici : elle vit sur l'analyse, qui est la ressource chère.
 *
 * Rien n'est enregistré : ni l'adresse courriel, ni le rapport, ni au journal (seul l'état d'envoi).
 */

/**
 * Le widget Turnstile du vérificateur. Même action et mêmes hôtes que la route voisine : c'est le
 * MÊME widget, réinitialisé par la page pour produire un deuxième jeton. À garder en phase avec
 * app/api/verificateur-loi-25/route.ts.
 */
const JETON_ATTENDU = { action: "verificateur", hotes: ["norvika.ca", "www.norvika.ca"] } as const;

export const dynamic = "force-dynamic";

/** Le poste de développement, jamais un domaine public (même règle que la route voisine). */
function hoteLocal(req: Request): boolean {
  const hote = (req.headers.get("host") ?? new URL(req.url).host).replace(/:\d+$/, "");
  return hote === "localhost" || hote === "127.0.0.1";
}

function refus(statut: number, error: string, code: string) {
  return NextResponse.json<ReponseRapport>({ ok: false, error, code }, { status: statut });
}

export async function POST(req: Request) {
  const corps = await lireCorpsJson(req);
  if (!corps.ok) return refus(corps.statut, corps.erreur, "corps");

  // Le courriel d'abord : une faute de forme se corrige sans rien consommer.
  const courriel = champTexte(corps.donnees, CHAMP_COURRIEL);
  if (!courriel || courriel.length > LONGUEUR_MAX_COURRIEL || !ligneSimpleValide(courriel) || !formeCourrielValide(courriel)) {
    return refus(400, "Cette adresse courriel ne semble pas valide.", "courriel");
  }
  const suivi = corps.donnees[CHAMP_SUIVI] === true;

  const antiRobot = await verifierAntiRobot(req, champTexte(corps.donnees, CHAMP_JETON), JETON_ATTENDU);
  if (!antiRobot.ok) return refus(antiRobot.statut, antiRobot.erreur, `anti-robot-${antiRobot.statut}`);

  // Le rapport n'est lu que de sa propre signature. Jeton absent, modifié, forgé ou expiré :
  // un seul et même refus, sans dire lequel.
  const rapport = await lireRapportSigne(champTexte(corps.donnees, CHAMP_JETON_RAPPORT));
  if (!rapport) return refus(400, "Ce résultat n'est plus valide. Relancez la vérification.", "jeton");

  const envoi = await envoyerRapport({
    rapport,
    courriel,
    suivi,
    textes: lireTextesCourriel(),
    domaineRecoit: recoitDuCourriel(domaineDuCourriel(courriel)),
    local: hoteLocal(req),
  }).catch((): ResultatEnvoi => ({ visiteur: "echec", interne: "aucun", motif: "resend" }));

  // Au journal : l'état de l'envoi, JAMAIS l'adresse courriel ni le site analysé.
  console.log("[verificateur] rapport différé", JSON.stringify({ courriel: envoi.visiteur, suivi: envoi.interne, motif: envoi.motif }));

  return NextResponse.json<ReponseRapport>({ ok: true, envoi: envoi.visiteur }, { headers: { "Cache-Control": "no-store" } });
}

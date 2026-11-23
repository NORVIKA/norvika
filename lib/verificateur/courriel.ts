import "server-only";

import { DESTINATAIRE, envoyerCourrielRapport, esc, EXPEDITEUR_RAPPORT, gabarit, ligne, lienCourriel } from "@/lib/courriel";
import { reserverCourrielsVerificateur, type ReserveCourriels } from "@/lib/rate-limit";

import { recoitDuCourriel } from "./adresse";
import { dateEtHeure, hote, phraseAccompagnement, pied, remplir, synthese, texteResultat } from "./textes";
import type { TextesCourriel } from "./textes-serveur";
import { VERIFICATIONS, type Etat, type EtatEnvoi, type Rapport } from "./types";

/**
 * Le rapport du vérificateur Loi 25 par courriel (décision de William, 2026-11-23). SERVEUR SEULEMENT.
 * Textes de Martin (contenu/verificateur-courriel-textes.md), lus dans le Studio ; les faits C1 à C9
 * de son tableau sont repérés ci-dessous par leur numéro.
 *
 * ⛔ C7 : le contenu vient du rapport que la route VIENT de calculer et des textes du Studio, jamais
 *    de données envoyées par le navigateur : personne ne peut faire partir un faux rapport au nom de
 *    Norvika. Tout ce qui vient de l'extérieur est échappé.
 * ⛔ Aucun texte libre du site analysé (texte du lien de politique, du bouton de refus, nom de
 *    témoin hors forme ordinaire) : un client de courriel rend cliquable une adresse écrite en texte,
 *    échapper le HTML ne suffit pas. Seul le domaine analysé reste (risque accepté par William).
 * ⛔ Jamais « conforme » : mêmes trois états et mêmes phrases que la page (lib/verificateur/textes.ts).
 * ⛔ C1 et C2 : rien n'est conservé (aucune écriture en base) ; au journal, l'état de l'envoi et le
 *    code HTTP de Resend, jamais l'adresse ni le corps d'une erreur de Resend.
 * ⛔ C4 : aucune image distante, aucun paramètre de suivi (ni dans l'appel à Resend, ni sur les liens).
 *
 * Deux courriels :
 *   1. à la personne, toujours si elle a inscrit une adresse (sollicité : exempté de consentement
 *      par la LCAP, Règlement DORS/2013-221, art. 3 b) ; réponse à info@norvika.ca (C9) ;
 *   2. la copie interne à info@norvika.ca (C6), SEULEMENT si la case est cochée, que la case était
 *      vraiment en ligne (interrupteur ET adresse postale) et que Resend a accepté le rapport : c'est
 *      la preuve du consentement (adresse, date, identifiant Resend, textes exacts de la demande).
 */

/** Préfixe FIXE de l'objet de la copie interne : le filtre Gmail de William s'y fie (C6). Jamais au Studio. */
export const PREFIXE_CONSENTEMENT = "[Vérificateur Loi 25] Consentement";

/** Couleurs du site (app/globals.css), en dur : un courriel ne lit pas les variables CSS. */
const C = {
  navy: "#0C192F",
  texte: "#3B4659",
  pale: "#5F6878",
  trait: "#E3E7EE",
  fond: "#F4F6FA",
  creme: "#F5F3EE",
  etat: {
    "a-corriger": { texte: "#B3261E", fond: "#FCEDEB" },
    "a-verifier": { texte: "#7A4A00", fond: "#FBF1DE" },
    "en-place": { texte: "#33496C", fond: "#EEF2FA" },
  } satisfies Record<Etat, { texte: string; fond: string }>,
};
const POLICE = "Helvetica, Arial, sans-serif";

export type Message = { objet: string; html: string; texte?: string };

function libellesEtats(t: TextesCourriel["t"]): Record<Etat, string> {
  return { "a-corriger": t.etatACorriger, "a-verifier": t.etatAVerifier, "en-place": t.etatEnPlace };
}

/** La demande de consentement telle qu'affichée sous la case : {adresse_postale} remplie. */
export function texteIdentification(textes: TextesCourriel): string {
  return remplir(textes.t.rapportCourriel!.caseIdentification, { adresse_postale: textes.adressePostale });
}

/** Le courriel à la personne qui a demandé le rapport. `consentement` : la case a été cochée ET comptée. */
export function courrielVisiteur(rapport: Rapport, textes: TextesCourriel, consentement: boolean): Message {
  const { t } = textes;
  const rc = t.rapportCourriel!;
  const etats = libellesEtats(t);
  const domaine = hote(rapport.adresseFinale);
  const n = rapport.synthese;
  const compte = (nombre: number, aucun: string, plusieurs: string, un?: string) =>
    nombre === 0 ? aucun : nombre === 1 && un ? un : plusieurs.replace("{n}", String(nombre));
  const apercu = remplir(rc.preEntete, {
    corriger: compte(n["a-corriger"], t.corrigerAucun, t.corrigerPlusieurs, t.corrigerUn),
    verifier: compte(n["a-verifier"], t.verifierAucun, t.verifierPlusieurs),
    enPlace: compte(n["en-place"], t.enPlaceAucun, t.enPlacePlusieurs),
  });
  const preEntete = apercu.charAt(0).toUpperCase() + apercu.slice(1);
  const intro = remplir(rc.intro, { domaine, ...dateEtHeure(rapport.date) });
  const phraseSynthese = synthese(rapport, t);
  const accompagnement = remplir(phraseAccompagnement(rapport, t), {});
  const appelTexte = n["a-corriger"] > 0 ? t.appelTexte : t.appelTexteSansCorrection;
  // Le premier paragraphe de l'avertissement complet de la page : celui que Martin reprend au courriel.
  const avertissement = t.avertissement[0] ?? t.avertissementCourt;
  const paragrapheCase = consentement ? rc.paragrapheAvecCase : rc.paragrapheSansCase;
  const lignesPied = [textes.nomLegal, textes.adressePostale, textes.courriel, "norvika.ca"].filter(Boolean);
  const lignes = VERIFICATIONS.map((id) => {
    const r = rapport.resultats.find((x) => x.id === id);
    // Mode courriel : aucun texte libre du site analysé n'entre dans le courriel.
    return r ? { nom: t[id].nom, article: t[id].article, etat: r.etat, texte: texteResultat(r, t[id], t, true) } : null;
  }).filter((l): l is { nom: string; article: string; etat: Etat; texte: string } => l !== null);

  const p = (contenu: string, style = "") =>
    `<p style="margin: 0; font-family: ${POLICE}; font-size: 15px; line-height: 1.6; color: ${C.texte}; ${style}">${contenu}</p>`;

  const points = lignes
    .map(
      (l) => `
            <tr>
              <td style="padding: 16px 0; border-top: 1px solid ${C.trait};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-family: ${POLICE}; font-size: 16px; line-height: 1.35; font-weight: bold; color: ${C.navy}; vertical-align: top;">${esc(l.nom)}</td>
                    <td align="right" style="padding-left: 12px; vertical-align: top; white-space: nowrap;">
                      <span style="display: inline-block; padding: 3px 10px; border-radius: 999px; background: ${C.etat[l.etat].fond}; color: ${C.etat[l.etat].texte}; font-family: ${POLICE}; font-size: 13px; line-height: 1.4; font-weight: bold;">${esc(etats[l.etat])}</span>
                    </td>
                  </tr>
                </table>
                ${p(esc(l.texte), "margin-top: 6px; font-size: 14.5px; line-height: 1.55;")}
                ${p(esc(l.article), `margin-top: 6px; font-size: 13px; color: ${C.pale};`)}
              </td>
            </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(remplir(rc.objet, { domaine }))}</title>
  </head>
  <body style="margin: 0; padding: 0; background: ${C.fond};">
    <div style="display: none; max-height: 0; overflow: hidden;">${esc(preEntete)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: ${C.fond};">
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #ffffff; border: 1px solid ${C.trait}; border-radius: 16px;">
            <tr>
              <td style="padding: 28px 28px 8px;">
                ${p(esc(textes.nom), `font-size: 17px; font-weight: bold; letter-spacing: -0.01em; color: ${C.navy};`)}
                ${p(esc(rc.salutation), "margin-top: 20px;")}
                ${p(esc(intro), "margin-top: 8px;")}
                <h1 style="margin: 18px 0 0; font-family: ${POLICE}; font-size: 22px; line-height: 1.25; letter-spacing: -0.02em; color: ${C.navy};">${esc(phraseSynthese)}</h1>
                ${p(esc(t.avertissementCourt), `margin-top: 10px; font-size: 14px; font-weight: bold; color: ${C.pale};`)}
                ${p(esc(accompagnement), "margin-top: 12px;")}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 28px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${points}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 28px 4px;">
                ${p(esc(t.invisibleTitre), `font-size: 16px; font-weight: bold; color: ${C.navy};`)}
                ${p(esc(rc.invisibleCourriel), "margin-top: 6px; font-size: 14.5px; line-height: 1.55;")}
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 28px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: ${C.navy}; border-radius: 14px;">
                  <tr>
                    <td style="padding: 24px;">
                      <p style="margin: 0; font-family: ${POLICE}; font-size: 18px; line-height: 1.3; font-weight: bold; color: #ffffff;">${esc(t.appelTitre)}</p>
                      <p style="margin: 8px 0 0; font-family: ${POLICE}; font-size: 15px; line-height: 1.6; color: ${C.creme};">${esc(appelTexte)}</p>
                      <p style="margin: 18px 0 0;"><a href="${esc(textes.lienRendezVous)}" style="display: inline-block; padding: 13px 22px; border-radius: 12px; background: ${C.creme}; color: ${C.navy}; font-family: ${POLICE}; font-size: 15px; font-weight: bold; text-decoration: none;">${esc(t.appelBouton)}</a></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 28px 28px;">
                ${p(esc(avertissement), `font-size: 13.5px; line-height: 1.55; color: ${C.pale};`)}
                ${p(esc(pied(rapport, t)), `margin-top: 10px; font-size: 13.5px; color: ${C.pale};`)}
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
            <tr>
              <td style="padding: 18px 28px 0; font-family: ${POLICE}; font-size: 12.5px; line-height: 1.6; color: ${C.pale};">
                ${esc(paragrapheCase)}<br><br>
                ${lignesPied.map(esc).join(" · ")}<br>
                ${esc(rc.libellePolitique)}&nbsp;: <a href="https://norvika.ca/politique-de-confidentialite" style="color: ${C.pale};">norvika.ca/politique-de-confidentialite</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const texte = [
    rc.salutation,
    "",
    intro,
    "",
    phraseSynthese,
    t.avertissementCourt,
    "",
    accompagnement,
    "",
    ...lignes.flatMap((l) => [`${etats[l.etat]} : ${l.nom}`, l.texte, l.article, ""]),
    t.invisibleTitre,
    rc.invisibleCourriel,
    "",
    t.appelTitre,
    appelTexte,
    `${t.appelBouton} : ${textes.lienRendezVous}`,
    "",
    avertissement,
    "",
    pied(rapport, t),
    "",
    paragrapheCase,
    "",
    lignesPied.join(" · "),
    `${rc.libellePolitique} : norvika.ca/politique-de-confidentialite`,
  ].join("\n");

  return { objet: remplir(rc.objet, { domaine }), html, texte };
}

/**
 * La copie interne (C6), seulement si la case est cochée et comptée, et que Resend a accepté le
 * rapport : la preuve du consentement (LCAP, art. 13). Libellés de Martin, en dur comme les autres
 * courriels internes (lib/courriel.ts) : seul William les lit. Aucune adresse IP.
 */
export function courrielInterne(rapport: Rapport, textes: TextesCourriel, courriel: string, idResend: string | null): Message {
  const rc = textes.t.rapportCourriel!;
  const domaine = hote(rapport.adresseFinale);
  const { date, heure } = dateEtHeure(rapport.date);
  const n = rapport.synthese;
  const lignes = [
    ligne("Courriel", lienCourriel(courriel)),
    ligne("Site analysé", esc(domaine)),
    ligne("Résultat", esc(`${n["a-corriger"]} à corriger, ${n["a-verifier"]} à vérifier, ${n["en-place"]} en place`)),
    ligne("Date", esc(`${date} à ${heure} (heure de Montréal), ${rapport.date}`)),
    ligne("Rapport envoyé", esc(`accepté par Resend, identifiant ${idResend ?? "non fourni par Resend"}`)),
  ];
  const citation = (etiquette: string, texte: string) => `
        <p style="margin: 20px 0 6px; color: #6b7280; font-size: 13px;">${esc(etiquette)}</p>
        <p style="margin: 0; padding: 12px 14px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; color: #111827; line-height: 1.5;">« ${esc(texte)} »</p>`;
  const bloc =
    citation("Texte de la case, tel qu’affiché :", rc.caseTexte) + citation("Texte sous la case, tel qu’affiché :", texteIdentification(textes));
  return {
    objet: `${PREFIXE_CONSENTEMENT} : ${domaine}`,
    html: gabarit({
      titre: "Consentement reçu par le vérificateur Loi 25",
      lignes,
      bloc,
      note: [
        "Avant d’écrire : signature avec l’adresse postale et la ligne de désabonnement.",
        "Désabonnement reçu : effacer ce courriel dans les 10 jours ouvrables (le jour même, idéalement).",
        "Sinon : effacé automatiquement après 24 mois.",
      ].join("<br>"),
    }),
  };
}

/** Le domaine d'une adresse courriel (après le dernier @), en minuscules. */
export function domaineDuCourriel(courriel: string): string {
  return courriel.slice(courriel.lastIndexOf("@") + 1).toLowerCase();
}

/** Pourquoi le rapport n'est pas parti : pour le journal, sans aucune donnée personnelle. */
export type MotifEchec = "textes" | "sans-mx" | "plafond" | "compteur" | "resend";

export type ResultatEnvoi = { visiteur: EtatEnvoi; interne: EtatEnvoi; motif?: MotifEchec };

/**
 * Envoie le rapport. Ne lève jamais. Appelé seulement APRÈS une analyse réussie : aucune analyse,
 * aucun courriel, aucune copie (C6). Dans l'ordre, du moins cher au plus cher :
 *   1. textes du Studio et interrupteurs (fonction fermée : rien ne part) ;
 *   2. le domaine de l'adresse reçoit-il du courriel (MX) ? Sinon, aucun appel à Resend. La
 *      question est posée par la route PENDANT l'analyse (`domaineRecoit`), pas après ;
 *   3. réserve dans le plafond PROPRE aux courriels (lib/rate-limit.ts), 1 ou 2 selon la copie ;
 *   4. Resend : le rapport, puis la copie interne seulement s'il est accepté.
 * `local` (next dev, aperçu wrangler sur localhost) : AUCUN courriel réel, même si une clé Resend
 * traîne sur le poste ; l'état rendu est « simule ». Le contrôle MX se fait quand même (lecture DNS
 * publique) ; le plafond, lui, vit dans Supabase, absent du poste local.
 * `reserver` : remplaçable par l'essai sans réseau (scripts/verificateur/essai-courriel.ts).
 */
export async function envoyerRapport({
  rapport,
  courriel,
  suivi,
  textes,
  domaineRecoit,
  local,
  reserver = reserverCourrielsVerificateur,
}: {
  rapport: Rapport;
  courriel: string;
  suivi: boolean;
  textes: Promise<TextesCourriel | null> | null;
  /** recoitDuCourriel(domaineDuCourriel(courriel)), lancé par la route en même temps que l'analyse. */
  domaineRecoit: Promise<boolean> | null;
  local: boolean;
  reserver?: (nombre: 1 | 2) => Promise<ReserveCourriels>;
}): Promise<ResultatEnvoi> {
  if (!courriel || !textes) return { visiteur: "aucun", interne: "aucun" };
  const lus = await textes;
  if (!lus) return { visiteur: "echec", interne: "aucun", motif: "textes" };
  const rc = lus.t.rapportCourriel;
  // Fonction fermée dans le Studio après la construction de la page : rien ne part.
  if (!rc?.afficher) return { visiteur: "aucun", interne: "aucun" };
  // C5 et C8 : la case ne compte que si elle était vraiment en ligne (interrupteur ET adresse postale,
  // lus ICI, au moment de l'envoi). Une page encore figée sur l'ancien réglage n'y change rien.
  const consentement = suivi && Boolean(rc.afficherCase) && Boolean(lus.adressePostale);

  // Une adresse dont le domaine ne reçoit pas de courriel ferait un rebond : aucun appel à Resend.
  if (!(await (domaineRecoit ?? recoitDuCourriel(domaineDuCourriel(courriel))))) {
    return { visiteur: "echec", interne: "aucun", motif: "sans-mx" };
  }

  const visiteur = courrielVisiteur(rapport, lus, consentement);
  if (local) {
    // Composés quand même : une erreur d'écriture se voit en local, pas en production.
    if (consentement) courrielInterne(rapport, lus, courriel, "essai-local");
    console.log("[verificateur] envoi simulé (poste local)", JSON.stringify({ interne: consentement }));
    return { visiteur: "simule", interne: consentement ? "simule" : "aucun" };
  }

  // Le plafond propre aux courriels, réservé AVANT Resend : le rapport, plus la copie s'il y en a une.
  const reserve = await reserver(consentement ? 2 : 1);
  if (reserve !== "ok") return { visiteur: "echec", interne: "aucun", motif: reserve === "plafond" ? "plafond" : "compteur" };

  const envoi = await envoyerCourrielRapport({ a: courriel, de: EXPEDITEUR_RAPPORT, repondreA: DESTINATAIRE, ...visiteur });
  // C6 : sans rapport accepté par Resend, aucune copie interne (la case ne compte pas).
  if (!envoi.ok) return { visiteur: "echec", interne: "aucun", motif: "resend" };
  if (!consentement) return { visiteur: "envoye", interne: "aucun" };
  const interne = courrielInterne(rapport, lus, courriel, envoi.id);
  const copie = await envoyerCourrielRapport({ a: DESTINATAIRE, repondreA: courriel, objet: interne.objet, html: interne.html });
  return { visiteur: "envoye", interne: copie.ok ? "envoye" : "echec" };
}

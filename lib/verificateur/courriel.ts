import "server-only";

import { DESTINATAIRE, envoyerCourrielRapport, esc, EXPEDITEUR_RAPPORT, gabarit, ligne, lienCourriel } from "@/lib/courriel";
import { reserverCourrielsVerificateur, type ReserveCourriels } from "@/lib/rate-limit";

import { recoitDuCourriel } from "./adresse";
import { nomTemoinReconnu } from "./analyse";
import { dateEtHeure, hote, phraseAccompagnement, pied, remplir, synthese, texteResultat, titreConstat } from "./textes";
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

/**
 * Couleurs de la maquette A (2026-11-26, approuvée par Lau). Elle est plus vive que celle du site
 * (bleu #2340E8 et lime au lieu du marine #0C192F) : c'est un choix assumé pour le courriel, pas
 * un oubli. Les états gardent les couleurs de la page.
 */
const A = {
  bleu: "#2340E8",
  lime: "#D8F35A",
  encre: "#14205C",
  texte: "#4A5684",
  fond: "#E9EEFF",
  trait: "#E6E9F2",
  doux: "#F3F6FF",
  pied: "#7A85A8",
  bordurePastille: "#C9D2F2",
  pastilleTexte: "#6A76A6",
};
// La police de la marque est impossible ici : il faudrait la charger depuis un serveur, donc une
// requête partante à l'ouverture (même règle que C4). Pile système : SF Pro, Segoe UI, Roboto.
const POLICE = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
/**
 * La signature, en dur comme le préfixe d'objet : deux phrases de marque, pas du contenu qui change
 * avec un résultat. ⚠️ À remonter au Studio au prochain déploiement du Studio (même lot que la ligne
 * du haut de la page), pour que William puisse les changer sans toucher au code.
 */
const SIGNATURE_NOM = "Will et Lau, Norvika";
const SIGNATURE_LIGNE = "Une question? Répondez à ce courriel, on le lit.";

/** Les deux images, servies par notre propre domaine : aucun tiers, aucun paramètre de suivi. */
const LOGO = "https://norvika.ca/images/courriel-logo.png";
const SIGNATURE = "https://norvika.ca/images/courriel-signature.jpg";

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
  // ⚠️ `rc.salutation` (« Bonjour, ») et `rc.intro` (« Voici le rapport demandé... ») ne paraissent
  //    plus depuis la refonte du 2026-11-26 : la maquette entre dans le résultat dès le titre, et la
  //    date de l'analyse est au pied (pied()). Les deux champs restent au Studio, inutilisés, le
  //    temps de confirmer la nouvelle allure ; à retirer du schéma ensuite.
  const phraseSynthese = synthese(rapport, t);
  const accompagnement = remplir(phraseAccompagnement(rapport, t), {});
  const appelTexte = n["a-corriger"] > 0 ? t.appelTexte : t.appelTexteSansCorrection;
  // ⛔ « Ce que ça peut coûter » (blocSanctions) n'est PLUS dans le courriel depuis la refonte du
  //    2026-11-26 : il faisait à lui seul un tiers de la longueur, et le courriel ne se lisait plus.
  //    Le bloc vit toujours sur la page du vérificateur, avec ses montants et sa source. Pour le
  //    remettre ici, reprendre `blocSanctions(rapport, t)` depuis ./textes.
  // Le premier paragraphe de l'avertissement complet de la page : celui que Martin reprend au courriel.
  const avertissement = t.avertissement[0] ?? t.avertissementCourt;
  const paragrapheCase = consentement ? rc.paragrapheAvecCase : rc.paragrapheSansCase;
  const lignesPied = [textes.nomLegal, textes.adressePostale, textes.courriel, "norvika.ca"].filter(Boolean);
  const lignes = VERIFICATIONS.map((id) => {
    const r = rapport.resultats.find((x) => x.id === id);
    if (!r) return null;
    // Mode courriel : aucun texte libre du site analysé n'entre dans le courriel. Les noms de témoins
    // se réduisent à leur nom connu (_ga, _fbp...) ; la page, elle, garde le nom complet.
    const preuves = r.preuves.map((p) =>
      p.type === "temoins" ? { ...p, valeurs: [...new Set(p.valeurs.map(nomTemoinReconnu).filter(Boolean))] } : p,
    );
    return {
      // `titre` dit ce qui a été vu pour ce cas ; `nom` reste le nom court de la vérification, qui
      // sert à la ligne « En place » (huit titres longs bout à bout ne se liraient pas).
      titre: titreConstat(r, t[id]) ?? t[id].nom,
      nom: t[id].nom,
      article: t[id].article,
      etat: r.etat,
      texte: texteResultat({ ...r, preuves }, t[id], t, true),
    };
  }).filter((l): l is { titre: string; nom: string; article: string; etat: Etat; texte: string } => l !== null);

  const p = (contenu: string, style = "") =>
    `<p style="margin: 0; font-size: 15px; line-height: 1.55; color: ${A.texte}; ${style}">${contenu}</p>`;

  /**
   * Un constat par ligne : pastille, nom du constat, puis le geste à faire (textes du Studio).
   * Seuls les constats qui demandent un geste sont détaillés ; ceux qui sont en place tiennent sur
   * une seule ligne, juste en dessous. C'est la maquette A : le courriel parle d'abord de ce qu'il
   * y a à faire.
   */
  const aRegler = lignes.filter((l) => l.etat !== "en-place");
  const enPlace = lignes.filter((l) => l.etat === "en-place");
  let rang = 0;
  const points = aRegler
    .map((l, i) => {
      const aCorriger = l.etat === "a-corriger";
      if (aCorriger) rang += 1;
      // Pastille pleine et numérotée pour « à corriger », pastille creuse « ? » pour « à vérifier ».
      const pastille = aCorriger
        ? `<div style="background: ${A.lime}; color: ${A.encre}; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; font-weight: bold; font-size: 12px;">${rang}</div>`
        : `<div style="border: 2px solid ${A.bordurePastille}; color: ${A.pastilleTexte}; width: 20px; height: 20px; line-height: 20px; text-align: center; border-radius: 50%; font-weight: bold; font-size: 12px;">?</div>`;
      // Pas de colonne d'état : « À vérifier » se dit dans le titre, le reste est à corriger.
      const titre = aCorriger ? l.titre : `${etats[l.etat]} : ${l.titre}`;
      const trait = i === aRegler.length - 1 ? "" : `border-bottom: 1px solid ${A.trait};`;
      return `
                <tr>
                  <td width="34" valign="top" style="padding: 16px 0;">${pastille}</td>
                  <td style="padding: 16px 0; ${trait}">
                    ${p(esc(titre), `font-size: 16px; font-weight: bold; color: ${A.encre};`)}
                    ${p(esc(l.texte), "margin-top: 4px;")}
                    ${l.article ? p(esc(l.article), `margin-top: 6px; font-size: 12px; color: ${A.pied};`) : ""}
                  </td>
                </tr>`;
    })
    .join("");

  // « En place : politique accessible, connexion sécurisée, ... » : les noms du Studio mis bout à
  // bout, première lettre en minuscule puisqu'ils suivent les deux points.
  const sansMajuscule = (nom: string) => nom.charAt(0).toLocaleLowerCase("fr-CA") + nom.slice(1);
  const blocEnPlace = enPlace.length
    ? `
              <p style="margin: 10px 0 0; padding: 14px 16px; background: ${A.doux}; border-radius: 12px; font-size: 14px; line-height: 1.5; color: ${A.texte};"><strong style="color: ${A.encre};">${esc(etats["en-place"])}&nbsp;:</strong> ${enPlace.map((l) => esc(sansMajuscule(l.nom))).join(", ")}</p>`
    : "";

  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(remplir(rc.objet, { domaine }))}</title>
    <style>@media (max-width: 520px) { .pad { padding-left: 20px !important; padding-right: 20px !important; } .titre { font-size: 26px !important; } }</style>
  </head>
  <body style="margin: 0; padding: 0; background: ${A.fond}; font-family: ${POLICE};">
    <div style="display: none; max-height: 0; overflow: hidden;">${esc(preEntete)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: ${A.fond};">
      <tr>
        <td align="center" style="padding: 28px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px;">
            <tr>
              <td style="padding: 0 6px 18px;"><img src="${LOGO}" width="84" alt="${esc(textes.nom)}" style="display: block; border: 0;"></td>
            </tr>
            <tr>
              <td class="pad" style="background: ${A.bleu}; border-radius: 22px 22px 0 0; padding: 32px 30px 30px;">
                <p class="titre" style="margin: 0; font-size: 30px; line-height: 1.15; font-weight: bold; letter-spacing: -0.02em; color: #ffffff;">${esc(phraseSynthese)}</p>
                <p style="margin: 12px 0 0; font-size: 16px; line-height: 1.5; color: #D3DBFF;">${esc(accompagnement)}</p>
              </td>
            </tr>
            <tr>
              <td class="pad" style="background: #ffffff; padding: 8px 30px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${points}
                </table>${blocEnPlace}
              </td>
            </tr>
            <tr>
              <td class="pad" style="background: #ffffff; border-radius: 0 0 22px 22px; padding: 28px 30px 32px;">
                ${p(esc(t.appelTitre), `font-size: 20px; font-weight: bold; letter-spacing: -0.01em; color: ${A.encre};`)}
                ${p(esc(appelTexte), "margin-top: 6px;")}
                <a href="${esc(textes.lienRendezVous)}" style="display: block; margin-top: 20px; padding: 17px; border-radius: 14px; background: ${A.bleu}; color: #ffffff; font-size: 16px; font-weight: bold; text-align: center; text-decoration: none;">${esc(t.appelBouton)}</a>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 22px;">
                  <tr>
                    <td width="64" style="width: 64px;"><img src="${SIGNATURE}" width="64" height="64" alt="${esc(SIGNATURE_NOM)}" style="display: block; width: 64px; height: 64px; border: 0; border-radius: 50%; background: ${A.bleu};"></td>
                    <td style="padding-left: 12px; font-size: 14px; line-height: 1.4; color: ${A.texte};"><strong style="color: ${A.encre};">${esc(SIGNATURE_NOM)}</strong><br>${esc(SIGNATURE_LIGNE)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding: 20px 30px 0; font-size: 12px; line-height: 1.6; color: ${A.pied};">
                ${esc(avertissement)}<br><br>
                <strong>${esc(t.invisibleTitre)}&nbsp;:</strong> ${esc(rc.invisibleCourriel)}<br><br>
                ${esc(pied(rapport, t))}<br><br>
                ${esc(paragrapheCase)}<br><br>
                ${lignesPied.map(esc).join(" · ")} · <a href="https://norvika.ca/politique-de-confidentialite" style="color: ${A.pied};">${esc(rc.libellePolitique)}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  // Même contenu, même ordre que le HTML : un client qui refuse le HTML lit la même chose.
  const texte = [
    phraseSynthese,
    "",
    accompagnement,
    "",
    ...aRegler.flatMap((l) => [`${l.etat === "a-corriger" ? "À corriger" : etats[l.etat]} : ${l.titre}`, l.texte, ...(l.article ? [l.article] : []), ""]),
    ...(enPlace.length ? [`${etats["en-place"]} : ${enPlace.map((l) => sansMajuscule(l.nom)).join(", ")}`, ""] : []),
    t.appelTitre,
    appelTexte,
    `${t.appelBouton} : ${textes.lienRendezVous}`,
    "",
    SIGNATURE_NOM,
    SIGNATURE_LIGNE,
    "",
    avertissement,
    "",
    `${t.invisibleTitre} : ${rc.invisibleCourriel}`,
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

import type { PageVerificateur, RapportCourriel, SanctionsVerificateur } from "@/lib/types-contenu";

/**
 * POSTE LOCAL SEULEMENT : les textes provisoires du rapport par courriel, tant qu'ils ne sont pas
 * semés dans le Studio. Sans eux, `next dev` (qui lit le Studio de production, en lecture seule)
 * n'afficherait pas le champ de courriel, et rien ne pourrait être essayé avant le semis.
 *
 * Trois verrous : `next dev` (NODE_ENV, remplacé par « production » à la construction, donc ce code
 * ne s'exécute jamais en ligne), la variable VERIFICATEUR_TEXTES_LOCAUX=1 donnée au lancement, et
 * un document du Studio qui n'a pas encore ce groupe (une fois semé, le Studio gagne toujours).
 * Source : studio/scripts/verificateur-courriel-textes.json, le même fichier que le semis (règle 5),
 * puis verificateur-mention-textes.json pour la mention par couches (plus bas).
 * Lu sur le disque, jamais importé : le site n'embarque rien du dossier studio/.
 */
export async function avecTextesLocaux<T extends Pick<PageVerificateur, "rapportCourriel" | "mentionResume" | "mentionRepliLibelle" | "sanctions" | "introRisque" | "erreurAntiRobotAbsent">>(
  page: T,
): Promise<T> {
  if (process.env.NODE_ENV !== "development") return page;
  if (process.env.VERIFICATEUR_TEXTES_LOCAUX !== "1") return page;
  const avecCourriel = page.rapportCourriel ? page : { ...page, rapportCourriel: await lireJson<RapportCourriel>("verificateur-courriel-textes.json") };
  const avecApres = await avecDemandeApres(avecCourriel);
  const avecMention = await avecLot1127(await avecMentionParCouches(avecApres));
  // « Ce que ça peut coûter » et la phrase sous l'introduction (2026-11-24) : verificateur-sanctions-
  // textes.json, même fichier que le semis verificateur-sanctions-semer.ts, champ par champ, tant que le
  // Studio ne les a pas.
  const locaux = await lireJson<{ introRisque: string; sanctions: SanctionsVerificateur }>("verificateur-sanctions-textes.json");
  return {
    ...avecMention,
    introRisque: avecMention.introRisque?.trim() ? avecMention.introRisque : locaux.introRisque,
    sanctions: avecMention.sanctions ?? locaux.sanctions,
  };
}

/**
 * Liste de Lau du 2026-11-27 : message « anti-robot pas prête » et signature du courriel, CHAMP PAR
 * CHAMP, tant que le Studio ne les a pas (studio/scripts/verificateur-lot-2026-11-27-textes.json, même
 * fichier que le semis verificateur-lot-2026-11-27-semer.ts).
 */
type TextesLot1127 = { erreurAntiRobotAbsent: string; signatureNom: string; signatureLigne: string };

async function avecLot1127<T extends Pick<PageVerificateur, "rapportCourriel" | "erreurAntiRobotAbsent">>(page: T): Promise<T> {
  const locaux = await lireJson<TextesLot1127>("verificateur-lot-2026-11-27-textes.json");
  const vide = (texte: string | null | undefined) => !texte?.trim();
  const rc = page.rapportCourriel;
  return {
    ...page,
    erreurAntiRobotAbsent: vide(page.erreurAntiRobotAbsent) ? locaux.erreurAntiRobotAbsent : page.erreurAntiRobotAbsent,
    rapportCourriel: rc
      ? {
          ...rc,
          signatureNom: vide(rc.signatureNom) ? locaux.signatureNom : rc.signatureNom,
          signatureLigne: vide(rc.signatureLigne) ? locaux.signatureLigne : rc.signatureLigne,
        }
      : rc,
  };
}

/**
 * Demande du courriel APRÈS le résultat (2026-11-26) : les trois champs, CHAMP PAR CHAMP, tant que
 * le Studio ne les a pas (studio/scripts/verificateur-apres-textes.json). Permet d'essayer le bloc
 * sur le poste local avant de l'allumer en ligne. Un champ déjà rempli au Studio gagne toujours.
 */
type TextesApres = { apresResultat: boolean; apresTitre: string; apresBouton: string };

async function avecDemandeApres<T extends Pick<PageVerificateur, "rapportCourriel">>(page: T): Promise<T> {
  if (!page.rapportCourriel) return page;
  const locaux = await lireJson<TextesApres>("verificateur-apres-textes.json");
  const rc = page.rapportCourriel;
  const vide = (texte: string | null | undefined) => !texte?.trim();
  return {
    ...page,
    rapportCourriel: {
      ...rc,
      apresResultat: rc.apresResultat ?? locaux.apresResultat,
      apresTitre: vide(rc.apresTitre) ? locaux.apresTitre : rc.apresTitre,
      apresBouton: vide(rc.apresBouton) ? locaux.apresBouton : rc.apresBouton,
    },
  };
}

/**
 * Mention par couches (2026-11-23) : la phrase visible et le libellé du repli, CHAMP PAR CHAMP, tant
 * que le Studio ne les a pas (studio/scripts/verificateur-mention-textes.json, même fichier que le
 * semis verificateur-mention-semer.ts). Un champ déjà rempli au Studio n'est jamais remplacé.
 */
type TextesMention = { mentionResume: string; mentionRepliLibelle: string; rapportCourriel: { mentionResume: string } };

async function avecMentionParCouches<T extends Pick<PageVerificateur, "rapportCourriel" | "mentionResume" | "mentionRepliLibelle">>(page: T): Promise<T> {
  const locaux = await lireJson<TextesMention>("verificateur-mention-textes.json");
  const vide = (texte: string | null | undefined) => !texte?.trim();
  return {
    ...page,
    mentionResume: vide(page.mentionResume) ? locaux.mentionResume : page.mentionResume,
    mentionRepliLibelle: vide(page.mentionRepliLibelle) ? locaux.mentionRepliLibelle : page.mentionRepliLibelle,
    rapportCourriel:
      page.rapportCourriel && vide(page.rapportCourriel.mentionResume)
        ? { ...page.rapportCourriel, mentionResume: locaux.rapportCourriel.mentionResume }
        : page.rapportCourriel,
  };
}

async function lireJson<T>(fichier: string): Promise<T> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  return JSON.parse(await readFile(join(process.cwd(), "studio/scripts", fichier), "utf8")) as T;
}

/**
 * L'adresse postale de « Infos de l'entreprise ». POSTE LOCAL SEULEMENT, mêmes verrous : tant que
 * le Studio ne l'a pas, celle qui sera semée (studio/scripts/verificateur-courriel-parametres.json,
 * même fichier que le semis). En ligne, la valeur du Studio, telle quelle.
 */
export async function adresseLocale(adresse: string | null | undefined): Promise<string> {
  const lue = (adresse ?? "").trim();
  if (process.env.NODE_ENV !== "development") return lue;
  if (process.env.VERIFICATEUR_TEXTES_LOCAUX !== "1" || lue) return lue;
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const brut = await readFile(join(process.cwd(), "studio/scripts/verificateur-courriel-parametres.json"), "utf8");
  return String((JSON.parse(brut) as { adressePostale?: unknown }).adressePostale ?? "").trim();
}

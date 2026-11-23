import type { PageVerificateur, RapportCourriel } from "@/lib/types-contenu";

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
export async function avecTextesLocaux<T extends Pick<PageVerificateur, "rapportCourriel" | "mentionResume" | "mentionRepliLibelle">>(
  page: T,
): Promise<T> {
  if (process.env.NODE_ENV !== "development") return page;
  if (process.env.VERIFICATEUR_TEXTES_LOCAUX !== "1") return page;
  const avecCourriel = page.rapportCourriel ? page : { ...page, rapportCourriel: await lireJson<RapportCourriel>("verificateur-courriel-textes.json") };
  return avecMentionParCouches(avecCourriel);
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

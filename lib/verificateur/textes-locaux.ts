import type { PageVerificateur, RapportCourriel } from "@/lib/types-contenu";

/**
 * POSTE LOCAL SEULEMENT : les textes provisoires du rapport par courriel, tant qu'ils ne sont pas
 * semés dans le Studio. Sans eux, `next dev` (qui lit le Studio de production, en lecture seule)
 * n'afficherait pas le champ de courriel, et rien ne pourrait être essayé avant le semis.
 *
 * Trois verrous : `next dev` (NODE_ENV, remplacé par « production » à la construction, donc ce code
 * ne s'exécute jamais en ligne), la variable VERIFICATEUR_TEXTES_LOCAUX=1 donnée au lancement, et
 * un document du Studio qui n'a pas encore ce groupe (une fois semé, le Studio gagne toujours).
 * Source : studio/scripts/verificateur-courriel-textes.json, le même fichier que le semis (règle 5).
 * Lu sur le disque, jamais importé : le site n'embarque rien du dossier studio/.
 */
export async function avecTextesLocaux<T extends Pick<PageVerificateur, "rapportCourriel">>(page: T): Promise<T> {
  if (process.env.NODE_ENV !== "development") return page;
  if (process.env.VERIFICATEUR_TEXTES_LOCAUX !== "1" || page.rapportCourriel) return page;
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const brut = await readFile(join(process.cwd(), "studio/scripts/verificateur-courriel-textes.json"), "utf8");
  return { ...page, rapportCourriel: JSON.parse(brut) as RapportCourriel };
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

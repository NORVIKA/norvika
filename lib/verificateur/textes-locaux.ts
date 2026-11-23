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
  const textes = JSON.parse(brut) as RapportCourriel;
  // La case est semée éteinte (elle attend l'adresse postale) : VERIFICATEUR_CASE_LOCALE=1 l'allume
  // sur le poste, pour l'essayer avant que William donne l'adresse.
  if (process.env.VERIFICATEUR_CASE_LOCALE === "1") textes.afficherCase = true;
  return { ...page, rapportCourriel: textes };
}

/**
 * POSTE LOCAL SEULEMENT, mêmes verrous : une adresse postale d'essai (VERIFICATEUR_ADRESSE_LOCALE)
 * tant que celle de « Infos de l'entreprise » est vide. Jamais lue en ligne.
 */
export function adresseLocale(adresse: string | null | undefined): string {
  const lue = (adresse ?? "").trim();
  if (process.env.NODE_ENV !== "development" || lue) return lue;
  return process.env.VERIFICATEUR_TEXTES_LOCAUX === "1" ? (process.env.VERIFICATEUR_ADRESSE_LOCALE ?? "").trim() : "";
}

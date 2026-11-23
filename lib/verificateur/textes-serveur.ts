import "server-only";

import { clientSanityExecution } from "@/lib/sanity";
import type { PageVerificateur } from "@/lib/types-contenu";
import { insecablesPartout, typographier } from "@/lib/typographie";

import { adresseLocale, avecTextesLocaux } from "./textes-locaux";

/**
 * Les textes du rapport par courriel, lus AU MOMENT DE L'ENVOI (la page, elle, est figée au build).
 * Une seule requête, au CDN de Sanity (client d'exécution) : le document du vérificateur et les
 * champs de « Infos de l'entreprise » que le courriel cite (nom, nom légal, adresse postale,
 * courriel, lien du rendez-vous). Mêmes corrections typographiques
 * que la page (apostrophes, espaces insécables).
 * Rend `null` si la lecture échoue : l'envoi passe alors en échec, l'analyse est rendue quand même.
 */
export type TextesCourriel = {
  t: PageVerificateur;
  nom: string;
  nomLegal: string;
  /** Vide tant que William ne l'a pas donnée : la case de consentement reste alors éteinte. */
  adressePostale: string;
  courriel: string;
  lienRendezVous: string;
};

const REQUETE = `{
  "t": *[_id == "pageVerificateurLoi25"][0],
  "parametres": *[_id == "parametres"][0]{ nom, nomLegal, adressePostale, courriel, lienRendezVous }
}`;

type Lu = {
  t: PageVerificateur | null;
  parametres: { nom?: string; nomLegal?: string; adressePostale?: string | null; courriel?: string; lienRendezVous?: string } | null;
};

export async function lireTextesCourriel(): Promise<TextesCourriel | null> {
  try {
    const lu = await clientSanityExecution.fetch<Lu>(REQUETE, {}, { signal: AbortSignal.timeout(5000) });
    if (!lu.t || !lu.parametres?.nomLegal || !lu.parametres.lienRendezVous) {
      console.error("[verificateur] textes du courriel incomplets dans le Studio.");
      return null;
    }
    const t = insecablesPartout(typographier(await avecTextesLocaux(lu.t)));
    return {
      t,
      nom: typographier(lu.parametres.nom ?? "Norvika"),
      nomLegal: typographier(lu.parametres.nomLegal),
      adressePostale: typographier(adresseLocale(lu.parametres.adressePostale)),
      courriel: lu.parametres.courriel || "info@norvika.ca",
      lienRendezVous: lu.parametres.lienRendezVous,
    };
  } catch (e) {
    console.error("[verificateur] textes du courriel illisibles :", e instanceof Error ? e.name : "erreur");
    return null;
  }
}

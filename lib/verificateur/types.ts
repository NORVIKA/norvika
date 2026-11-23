/**
 * Vérificateur Loi 25 : la forme du rapport échangé entre le serveur et la page. Fichier sans
 * dépendance serveur : la page l'importe.
 *
 * ⛔ RÈGLE CENTRALE (avis accepté par William le 2026-11-18) : jamais « conforme » ni « non
 * conforme », nulle part (texte, JSON, métadonnées). Un test automatique voit des signaux, pas la
 * conformité. Chaque vérification sort dans UN de trois états, et rien d'autre.
 */

/** Les trois états d'une vérification. */
export const ETATS = ["a-corriger", "a-verifier", "en-place"] as const;
export type Etat = (typeof ETATS)[number];

/**
 * Les huit vérifications de la V1, dans l'ordre d'affichage (tableau de
 * _admin/PROGRESSION-verificateur-loi25.md). L'identifiant est une affaire de code ; le nom, la
 * description et le texte de chaque état viennent du Studio (document « Vérificateur Loi 25 »).
 */
export const VERIFICATIONS = [
  "temoins",
  "banniere",
  "politique",
  "responsable",
  "transfert",
  "droits",
  "tiers",
  "https",
] as const;
export type IdVerification = (typeof VERIFICATIONS)[number];

/**
 * Une preuve : ce que le navigateur a réellement vu. `type` dit comment l'afficher ; `valeurs` est
 * une liste courte de textes bruts (noms de témoins, domaines, adresse d'une page, extrait court).
 * Jamais de HTML : la page les affiche comme du texte.
 */
export type Preuve = {
  type: "temoins" | "domaines" | "lien" | "extrait" | "manquants" | "note";
  valeurs: string[];
};

export type ResultatVerification = {
  id: IdVerification;
  etat: Etat;
  /** Variante du texte à afficher pour cet état (ex. « sans-politique »), lue dans le Studio. */
  cas: string;
  preuves: Preuve[];
};

export type Rapport = {
  /** L'adresse demandée, normalisée (ex. https://exemple.ca/). */
  adresse: string;
  /** L'adresse réellement atteinte après les redirections. */
  adresseFinale: string;
  /** La page de politique lue, si elle a été trouvée et ouverte. */
  politique: string | null;
  /** ISO 8601, heure du serveur. */
  date: string;
  /** Durée de l'analyse, en millisecondes. */
  duree: number;
  resultats: ResultatVerification[];
  synthese: Record<Etat, number>;
};

/**
 * Rapport par courriel (2026-11-23) : ce qu'il est advenu du courriel demandé par la personne.
 *   envoye : Resend l'a accepté ;   simule : poste local, aucun courriel réel (jamais en production) ;
 *   echec  : textes illisibles ou refus de Resend ;   aucun : pas de courriel demandé, ou fonction fermée.
 * L'analyse ne dépend jamais de l'envoi : un échec d'envoi rend quand même le rapport.
 */
export const ETATS_ENVOI = ["envoye", "simule", "echec", "aucun"] as const;
export type EtatEnvoi = (typeof ETATS_ENVOI)[number];

/** Réponse de la route /api/verificateur-loi-25. */
export type ReponseVerificateur = { ok: true; rapport: Rapport; envoi: EtatEnvoi } | { ok?: false; error: string; code?: string };

/** L'adresse de la page : une affaire de code, déclarée une fois (page, bloc de Sites web, pied de page, sitemap). */
export const CHEMIN_VERIFICATEUR = "/verificateur-loi-25";

/** Nom du champ de l'adresse dans le corps JSON. */
export const CHAMP_ADRESSE = "adresse";

/** Longueur maximale d'une adresse soumise. */
export const LONGUEUR_MAX_ADRESSE = 300;

/** Nom du champ facultatif du courriel qui reçoit le rapport. */
export const CHAMP_COURRIEL = "courriel";

/** Nom de la case facultative « Norvika peut m'écrire ensuite » : `true` seulement si elle est cochée. */
export const CHAMP_SUIVI = "suivi";

/** Longueur maximale d'une adresse courriel (RFC 5321). */
export const LONGUEUR_MAX_COURRIEL = 254;

/**
 * Garde-fous des formulaires publics (document de référence, phase 3 « Formulaire »
 * et phase 5 « Sécurité de base ») :
 *  - corps de requête limité à 32 Ko, refusé AVANT d'être lu au complet ;
 *  - champs d'une ligne (nom, courriel, téléphone) : saut de ligne et caractères
 *    invisibles REFUSÉS (un saut de ligne dans un champ qui finit dans l'objet ou
 *    les en-têtes d'un courriel est la base de l'injection d'en-têtes SMTP) ;
 *  - objet du courriel reconstruit en texte simple, nettoyé.
 */

export const TAILLE_MAX_CORPS = 32 * 1024;

// Contrôles C0 et C1, espaces sans chasse, marques de direction (bidi),
// séparateurs de ligne Unicode, BOM. Le message long garde \n, \r et \t.
const INVISIBLES = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u2064\uFEFF]/;
const INVISIBLES_SAUF_LIGNES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u2064\uFEFF]/;

/** Vrai si la valeur tient sur une ligne sans caractère invisible. */
export function ligneSimpleValide(valeur: string): boolean {
  return !INVISIBLES.test(valeur);
}

/** Vrai si le texte long ne contient que des caractères visibles, sauts de ligne permis. */
export function texteLongValide(valeur: string): boolean {
  return !INVISIBLES_SAUF_LIGNES.test(valeur);
}

/** Objet de courriel en texte simple : aucun contrôle, espaces réduits, 120 caractères. */
export function nettoyerObjet(valeur: string): string {
  return valeur
    .replace(new RegExp(INVISIBLES.source, "g"), " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export type CorpsLu = { ok: true; donnees: Record<string, unknown> } | { ok: false; statut: 400 | 413; erreur: string };

/**
 * Lit le corps JSON en refusant tout ce qui dépasse 32 Ko. L'en-tête
 * Content-Length est vérifié d'abord (refus immédiat), puis la taille réelle
 * (un client peut mentir sur l'en-tête ou l'omettre).
 */
export async function lireCorpsJson(req: Request): Promise<CorpsLu> {
  const annonce = Number(req.headers.get("content-length") ?? "0");
  if (annonce > TAILLE_MAX_CORPS) {
    return { ok: false, statut: 413, erreur: "Message trop long." };
  }
  const brut = await req.text().catch(() => "");
  if (new TextEncoder().encode(brut).length > TAILLE_MAX_CORPS) {
    return { ok: false, statut: 413, erreur: "Message trop long." };
  }
  try {
    const donnees: unknown = JSON.parse(brut);
    if (!donnees || typeof donnees !== "object" || Array.isArray(donnees)) {
      return { ok: false, statut: 400, erreur: "Corps invalide." };
    }
    return { ok: true, donnees: donnees as Record<string, unknown> };
  } catch {
    return { ok: false, statut: 400, erreur: "Corps invalide." };
  }
}

/** Valeur texte d'un champ, ou chaîne vide si absent ou d'un autre type. */
export function champTexte(donnees: Record<string, unknown>, nom: string): string {
  const v = donnees[nom];
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Valeurs PUBLIQUES de Turnstile, partagées par le navigateur et le serveur.
 * La clé secrète, elle, ne vit que dans les secrets du Worker (TURNSTILE_SECRET_KEY).
 */

/**
 * Clé de SITE du widget « norvika.ca » (compte Cloudflare de Norvika). Publique par conception :
 * elle est dans le HTML de chaque page qui porte un formulaire. Écrite ici plutôt que dans une
 * variable NEXT_PUBLIC_* : rien à recréer dans GitHub ou Cloudflare si le déploiement change.
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY la remplace seulement pour un essai local avec la clé de test
 * 1x00000000000000000000AA (le vrai widget refuse localhost).
 * Widget créé le 2026-11-15 : mode Managed, sans pré-autorisation, hôte norvika.ca (couvre www).
 */
export const CLE_SITE_TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAGCDyP8OW73U1k91";

/** Nom du champ du jeton : celui du champ caché que Turnstile pose dans le formulaire. */
export const CHAMP_JETON = "cf-turnstile-response";

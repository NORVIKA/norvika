/**
 * CONSENTEMENT AUX TÉMOINS (Loi 25, règle 0 Norvika) : ce qui est partagé entre le serveur
 * (app/layout.tsx) et le navigateur (components/site/Consentement.tsx).
 * Patron d'agence repris d'Immuart et de crossfit-sainte-foy (2026-11-13).
 *
 * Le principe, en une phrase : GA4 n'est PAS chargé tant que la personne n'a pas accepté la
 * catégorie « Analytique » dans la bannière CookieYes. Plus de mode « avancé » de Google (balise
 * chargée d'avance qui envoyait un page_view sans témoin à google-analytics.com dès l'arrivée, et
 * encore après « Tout rejeter », mesuré par Pixel le 2026-11-16) : rien ne part vers Google avant
 * le clic, comme le promet la section « Témoins » de la politique de confidentialité.
 */

/** Catégorie CookieYes qui couvre GA4 (« Analytique » dans la bannière). */
export const CATEGORIE_STATISTIQUES = "analytics";

/** Événements que CookieYes envoie sur `document`. */
export const EVENEMENT_BANNIERE_CHARGEE = "cookieyes_banner_load";
export const EVENEMENT_CONSENTEMENT = "cookieyes_consent_update";

/** Identifiant de mesure GA4 (G-XXXXXXXXXX), ou chaîne vide s'il est absent ou mal formé. */
export const idGaValide = (v: string | null | undefined): string => {
  const brut = (v ?? "").trim().toUpperCase();
  return /^G-[A-Z0-9]{4,}$/.test(brut) ? brut : "";
};

/**
 * Posé dans <head> quand GA4 est configuré : la file de Google existe, et l'état par défaut est
 * « refusé » partout. Si GA4 finit par se charger (après « Accepter »), il lit d'abord ce refus,
 * puis la mise à jour « accordé ». Aucun identifiant ni aucun chargement ici : rien ne part.
 */
export const SCRIPT_CONSENTEMENT_DEFAUT =
  "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}" +
  "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted'});" +
  "gtag('set','ads_data_redaction',true);";

/** Ce que CookieYes expose sur `window` (window.getCkyConsent). */
export type EtatCookieYes = { categories?: Record<string, boolean | string> };

declare global {
  interface Window {
    getCkyConsent?: () => EtatCookieYes;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

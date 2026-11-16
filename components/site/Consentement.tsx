"use client";

import { useEffect } from "react";

import { CATEGORIE_STATISTIQUES, EVENEMENT_BANNIERE_CHARGEE, EVENEMENT_CONSENTEMENT } from "@/lib/consentement";

const ID_BALISE = "ga4";
const TEMOINS_GA = /^(_ga|_gid|_gat)/;

/** La catégorie est-elle acceptée ? CookieYes répond par un booléen ou par « yes ». */
const accepte = (valeur: boolean | string | undefined) => valeur === true || valeur === "yes";

function allumer(id: string) {
  // Retrait annulé : GA4 se coupe par cet interrupteur, documenté par Google pour gtag.js.
  (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = false;
  window.gtag?.("consent", "update", { analytics_storage: "granted" });
  if (document.getElementById(ID_BALISE)) return;
  const balise = document.createElement("script");
  balise.id = ID_BALISE;
  balise.async = true;
  balise.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(balise);
  window.gtag?.("js", new Date());
  // Signaux Google et personnalisation publicitaire coupés : la politique dit « aucun témoin
  // publicitaire ». GA4 ne conserve pas les adresses IP (anonymisation intégrée).
  window.gtag?.("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false });
}

/** Retrait du consentement : plus rien ne part vers Google, et ses témoins sont effacés. */
function eteindre(id: string) {
  (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  const noms = document.cookie
    .split(";")
    .map((c) => (c.split("=")[0] ?? "").trim())
    .filter((n) => TEMOINS_GA.test(n));
  if (!noms.length) return;
  // GA4 pose ses témoins sur le domaine parent (.norvika.ca) : on essaie l'hôte et chaque parent.
  const parties = location.hostname.split(".");
  const domaines = ["", ...parties.slice(0, -1).map((_, i) => `; domain=.${parties.slice(i).join(".")}`)];
  for (const nom of noms) for (const domaine of domaines) document.cookie = `${nom}=; Max-Age=0; path=/${domaine}`;
}

/**
 * MESURE D'AUDIENCE (GA4), seulement après « Accepter » (Loi 25, règle 0 Norvika).
 * Écoute la bannière CookieYes : à son chargement (choix déjà fait lors d'une visite précédente),
 * et à chaque choix (accepter, refuser, changer d'avis par le bouton de retour de la bannière).
 * Sans identifiant GA4, ou si CookieYes ne démarre pas (bloqueur, hors du domaine norvika.ca),
 * rien ne se charge : la panne tombe du côté de la vie privée, jamais l'inverse.
 */
export function Consentement({ idGa }: { idGa: string }) {
  useEffect(() => {
    if (!idGa) return;
    const appliquer = (oui: boolean) => (oui ? allumer(idGa) : eteindre(idGa));

    const surChargement = (e: Event) => {
      const categories = (e as CustomEvent<{ categories?: Record<string, boolean | string> }>).detail?.categories;
      if (accepte(categories?.[CATEGORIE_STATISTIQUES])) appliquer(true);
    };
    const surChoix = (e: Event) => {
      const choix = (e as CustomEvent<{ accepted?: string[] }>).detail;
      appliquer(Boolean(choix?.accepted?.includes(CATEGORIE_STATISTIQUES)));
    };
    document.addEventListener(EVENEMENT_BANNIERE_CHARGEE, surChargement);
    document.addEventListener(EVENEMENT_CONSENTEMENT, surChoix);

    // CookieYes (synchrone, dans le <head>) a pu finir avant l'hydratation de React : on lit
    // l'état qu'il connaît déjà.
    if (accepte(window.getCkyConsent?.().categories?.[CATEGORIE_STATISTIQUES])) appliquer(true);

    return () => {
      document.removeEventListener(EVENEMENT_BANNIERE_CHARGEE, surChargement);
      document.removeEventListener(EVENEMENT_CONSENTEMENT, surChoix);
    };
  }, [idGa]);
  return null;
}

"use client";

import { useEffect, useRef } from "react";
import { CHAMP_JETON, CLE_SITE_TURNSTILE } from "@/lib/anti-robot-commun";

type ApiTurnstile = {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(id?: string): void;
  remove(id: string): void;
};
declare global {
  interface Window {
    turnstile?: ApiTurnstile;
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let chargement: Promise<ApiTurnstile> | null = null;

/**
 * Largeur sous laquelle la case passe en format compact (150 x 140) : le format « flexible »
 * (100 % de large, 65 de haut) exige au moins 300 px et déborderait sur un téléphone.
 */
const LARGEUR_FLEXIBLE = 300;

function chargerTurnstile(): Promise<ApiTurnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  chargement ??= new Promise((resoudre, rejeter) => {
    const balise = document.createElement("script");
    balise.src = SCRIPT;
    balise.async = true;
    balise.onload = () => (window.turnstile ? resoudre(window.turnstile) : rejeter(new Error("turnstile absent")));
    balise.onerror = () => {
      chargement = null;
      rejeter(new Error("script Turnstile non chargé"));
    };
    document.head.appendChild(balise);
  });
  return chargement;
}

/** Jeton Turnstile du formulaire, ou chaîne vide s'il n'est pas encore prêt. À lire AVANT tout await. */
export function lireJetonAntiRobot(formulaire: HTMLFormElement): string {
  const champ = formulaire.querySelector<HTMLInputElement>(`input[name="${CHAMP_JETON}"]`);
  return champ?.value ?? "";
}

/** Un jeton ne sert qu'une fois : à appeler après chaque envoi au serveur, réussi ou non. */
export function reinitialiserAntiRobot(formulaire: HTMLFormElement): void {
  const id = formulaire.querySelector<HTMLElement>(".zone-turnstile")?.dataset.widget;
  if (id) window.turnstile?.reset(id);
}

/**
 * VÉRIFICATION ANTI-ROBOT (Cloudflare Turnstile), côté navigateur. Modèle : immuart
 * (components/client/AntiRobot.tsx). Ce widget ne protège rien à lui seul : c'est la
 * vérification du jeton CÔTÉ SERVEUR (lib/anti-robot.ts) qui refuse l'envoi. Le widget pose son
 * jeton dans le champ caché `cf-turnstile-response` du formulaire ; le formulaire le lit avec
 * lireJetonAntiRobot() et l'ajoute à son envoi JSON.
 *
 * Chargé seulement quand le formulaire approche de l'écran (600 px d'avance) ou dès qu'on y
 * touche : le bandeau de contact est en bas de TOUTES les pages, et le script de Cloudflare n'a
 * pas à peser sur le premier affichage.
 *
 * INVISIBLE POUR PRESQUE TOUT LE MONDE (`interaction-only`, règle William du 2026-10-24) : la case
 * n'apparaît que si Cloudflare a un doute. Aucune place n'est réservée ; l'attribut `data-visible`
 * suit la hauteur réelle du widget pour ne créer l'écart sous la case que lorsqu'elle s'affiche.
 */
export function AntiRobot({ theme = "light", action = "formulaire" }: { theme?: "light" | "dark"; action?: string }) {
  const zone = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const conteneur = zone.current;
    if (!conteneur || !CLE_SITE_TURNSTILE) return;
    let actif = true;
    let lance = false;
    let idWidget: string | undefined;
    const formulaire = conteneur.closest("form");

    const lancer = () => {
      if (lance) return;
      lance = true;
      observateur?.disconnect();
      formulaire?.removeEventListener("focusin", lancer);
      formulaire?.removeEventListener("pointerdown", lancer);
      chargerTurnstile()
        .then((api) => {
          if (!actif) return;
          idWidget = api.render(conteneur, {
            sitekey: CLE_SITE_TURNSTILE,
            // Le serveur peut exiger cette action (le vérificateur Loi 25 le fait, F5 de Sentinel) :
            // un jeton obtenu sur un autre formulaire n'y sert alors à rien.
            action,
            language: "fr",
            theme,
            appearance: "interaction-only",
            size: conteneur.clientWidth >= LARGEUR_FLEXIBLE ? "flexible" : "compact",
            "refresh-expired": "auto",
            retry: "auto",
          });
          conteneur.dataset.widget = idWidget;
        })
        .catch(() => {
          // Script bloqué : le formulaire affiche un message qui donne le courriel.
        });
    };

    const taille =
      "ResizeObserver" in window
        ? new ResizeObserver(([entree]) =>
            conteneur.toggleAttribute("data-visible", (entree?.contentRect.height ?? 0) > 0),
          )
        : null;
    taille?.observe(conteneur);

    const observateur =
      "IntersectionObserver" in window
        ? new IntersectionObserver((entrees) => entrees.some((e) => e.isIntersecting) && lancer(), {
            rootMargin: "600px 0px",
          })
        : null;
    if (observateur) observateur.observe(conteneur);
    else lancer();
    formulaire?.addEventListener("focusin", lancer);
    formulaire?.addEventListener("pointerdown", lancer);

    return () => {
      actif = false;
      taille?.disconnect();
      observateur?.disconnect();
      formulaire?.removeEventListener("focusin", lancer);
      formulaire?.removeEventListener("pointerdown", lancer);
      if (idWidget) window.turnstile?.remove(idWidget);
    };
  }, [theme, action]);
  return <div ref={zone} className="zone-turnstile" />;
}

/** Message affiché quand le visiteur envoie avant que le jeton soit prêt (ou script bloqué). */
export const MESSAGE_JETON_ABSENT =
  "La vérification anti-robot n'est pas encore prête. Réessayez dans quelques secondes, ou écrivez-nous à info@norvika.ca.";

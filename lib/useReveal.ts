"use client";

import { useEffect } from "react";

/**
 * APPARITION AU DÉFILEMENT, déclarée une seule fois (règle d'agence 5). Avant le 2026-11-16, cinq
 * copies de cet observateur vivaient dans les pages et les composants, avec des seuils différents.
 *
 * Le contrat (app/globals.css, « Apparition au défilement ») :
 *  - le HTML livré ne cache rien : le premier écran est peint sans attendre le JavaScript ;
 *  - au démarrage, ce qui est SOUS l'écran reçoit `.nv-attente` (caché d'un coup, sans
 *    transition, donc sans clignotement visible), puis le perd en arrivant à l'écran (fondu) ;
 *  - ce qui est déjà à l'écran reste tel quel ; `[data-check]` reçoit `.is-in` (crochet dessiné) ;
 *  - `[data-reveal="hero"]` n'est jamais caché (son déplacement est en CSS pur).
 *
 * Un élément suivi par deux appelants (la page et un composant qui se révèle seul) n'est observé
 * qu'une fois : le premier qui le voit le garde.
 */

const suivis = new WeakSet<Element>();

export function suivreApparitions(elements: Iterable<HTMLElement>): () => void {
  const cibles = Array.from(elements).filter((el) => !suivis.has(el));
  if (!cibles.length) return () => {};
  cibles.forEach((el) => suivis.add(el));

  const montrer = (el: Element) => {
    el.classList.remove("nv-attente");
    el.classList.add("is-in");
  };

  if (!("IntersectionObserver" in window)) {
    cibles.forEach(montrer);
    return () => cibles.forEach((el) => suivis.delete(el));
  }

  const io = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((e) => {
        if (e.isIntersecting) {
          montrer(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );

  const hauteur = window.innerHeight;
  cibles.forEach((el) => {
    if (el.dataset.reveal === "hero" || el.getBoundingClientRect().top < hauteur) {
      montrer(el);
      return;
    }
    if (el.hasAttribute("data-reveal")) el.classList.add("nv-attente");
    io.observe(el);
  });

  return () => {
    io.disconnect();
    cibles.forEach((el) => suivis.delete(el));
  };
}

/** Suit tous les `[data-reveal]` et `[data-check]` de la page (ou du conteneur donné). */
export function useReveal(racine?: { current: HTMLElement | null }) {
  useEffect(() => {
    const parent: ParentNode = racine?.current ?? document;
    return suivreApparitions(parent.querySelectorAll<HTMLElement>("[data-reveal], [data-check]"));
  }, [racine]);
}

"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ContenuGlobal } from "@/lib/types-contenu";

/**
 * Le contenu partagé par toutes les pages (menu, pied de page, bloc de contact, infos de
 * l'entreprise), lu UNE fois dans Sanity par app/layout.tsx et transmis ici. L'en-tête, le pied
 * de page et les blocs communs le lisent sans qu'on le passe de page en page.
 */
const Contexte = createContext<ContenuGlobal | null>(null);

export function FournisseurContenu({ valeur, children }: { valeur: ContenuGlobal; children: ReactNode }) {
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useContenuGlobal(): ContenuGlobal {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error("useContenuGlobal : FournisseurContenu absent (app/layout.tsx).");
  return valeur;
}

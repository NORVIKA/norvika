"use client";

import Link from "next/link";

import { useContenuGlobal } from "@/components/site/ContenuGlobal";
import { adresseAbsolue } from "@/lib/adresse";

/**
 * LE fil d'Ariane du site, déclaré une fois (règle d'agence 5) : pages de services (fond sombre,
 * components/site/HeroService.tsx) et fiches des réalisations (fond clair).
 *
 * L'accueil est ajouté ici, depuis « Menu et pied de page » ; la dernière étape est la page où l'on
 * se trouve (non cliquable, `aria-current`). Les données structurées BreadcrumbList sont produites
 * à partir des MÊMES étapes : ce que Google lit est toujours ce qu'on voit.
 *
 * Le séparateur « › » est décoratif (aria-hidden) : les lecteurs d'écran annoncent une liste.
 */
export type EtapeFil = { libelle: string; lien: string };

export function FilAriane({ etapes, ton }: { etapes: EtapeFil[]; ton: "sombre" | "clair" }) {
  const { navigation } = useContenuGlobal();
  const toutes: EtapeFil[] = [{ libelle: navigation.filArianeAccueil, lien: "/" }, ...etapes];
  const derniere = toutes.length - 1;

  const donnees = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: toutes.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.libelle, item: adresseAbsolue(e.lien) })),
  };

  return (
    <>
      <nav aria-label={navigation.filArianeLibelle} className={`nv-fil nv-fil-${ton}`}>
        <ol>
          {toutes.map((e, i) => (
            <li key={e.lien}>
              {i > 0 ? (
                <span aria-hidden="true" className="nv-fil-sep">
                  ›
                </span>
              ) : null}
              {i < derniere ? <Link href={e.lien}>{e.libelle}</Link> : <span aria-current="page">{e.libelle}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees) }} />
    </>
  );
}

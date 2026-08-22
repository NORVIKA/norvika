"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * « Continuer la visite » : les autres pages du site, en bas de chaque page.
 *
 * Pourquoi ce bloc existe : avant lui, la page d'accueil ne menait qu'a cinq
 * destinations et n'avait AUCUN lien vers /formation ni /equipe. Les pages de
 * service, elles, ne menaient nulle part sauf le calendrier. Un visiteur qui
 * voulait comprendre l'offre devait passer par le menu, et un moteur de
 * recherche ne voyait presque aucun maillage entre les pages.
 *
 * Il rend la page courante non cliquable (on ne se lie pas a soi-meme) et
 * revele ses propres cartes, sans dependre de l'observateur de la page hote.
 */

type Page = { href: string; titre: string; texte: string };

const PAGES: Page[] = [
  {
    href: "/sites-web",
    titre: "Sites web",
    texte: "Un site clair, bâti sur mesure, qui vous appartient.",
  },
  {
    href: "/automatisation",
    titre: "Automatisation",
    texte: "Reprendre les heures que vos tâches répétitives vous prennent.",
  },
  {
    href: "/photo-et-video",
    titre: "Photo et vidéo",
    texte: "Des images qui montrent votre entreprise telle qu'elle est.",
  },
  {
    href: "/formation",
    titre: "Formation",
    texte: "On forme votre équipe sur place, pour qu'elle soit autonome.",
  },
  {
    href: "/realisations",
    titre: "Réalisations",
    texte: "Les entreprises d'ici qui nous font confiance, et ce qu'on a fait.",
  },
  {
    href: "/equipe",
    titre: "L'équipe",
    texte: "Laurianne et William, et notre façon de travailler.",
  },
];

export function AutresPages({
  courante,
  titre = "Continuer la visite",
}: {
  /** Chemin de la page affichee, pour ne pas se lier a elle-meme. */
  courante?: string;
  titre?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cibles = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      cibles.forEach((c) => c.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    cibles.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const pages = PAGES.filter((p) => p.href !== courante);

  return (
    <section
      ref={ref}
      style={{ borderTop: "1px solid rgba(12,25,47,.1)", background: "#fff" }}
    >
      <div
        className="nv-shell"
        style={{ maxWidth: 1240, margin: "0 auto", padding: "84px 32px" }}
      >
        <p
          data-reveal
          style={{
            margin: "0 0 34px",
            fontSize: 11.5,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "#33496C",
            fontWeight: 600,
          }}
        >
          {titre}
        </p>
        <div
          className="nv-liens-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {pages.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              data-reveal
              className="nv-card-hover"
              style={{
                display: "block",
                padding: "26px 26px 24px",
                borderRadius: 18,
                border: "1px solid rgba(12,25,47,.12)",
                background: "#fff",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 20,
                    letterSpacing: "-.02em",
                    color: "var(--navy)",
                  }}
                >
                  {p.titre}
                </span>
                <span aria-hidden="true" style={{ fontSize: 15, color: "#33496C" }}>
                  →
                </span>
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: 10,
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "rgba(12,25,47,.66)",
                }}
              >
                {p.texte}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

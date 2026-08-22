"use client";

import Link from "next/link";
import { LIEN_RDV } from "@/lib/liens";

/**
 * Entete des pages de service, VOLONTAIREMENT differente de celle de l'accueil.
 *
 * Le probleme : l'accueil et les quatre pages de service partageaient le meme
 * traitement (titre centre sur un degrade clair avec des halos). En arrivant sur
 * /sites-web, on avait l'impression d'etre encore sur l'accueil. Rien ne disait
 * « vous etes entre dans une section ».
 *
 * Ce qui change ici, et pourquoi :
 * - FOND SOMBRE. La rupture est immediate : on a change d'endroit.
 * - ALIGNE A GAUCHE, sur deux colonnes. L'accueil est centre ; l'oeil voit tout
 *   de suite que ce n'est pas la meme page.
 * - FIL D'ARIANE cliquable. On sait ou on est, et on peut remonter.
 * - LES SERVICES VOISINS en pied d'entete. La navigation entre services se fait
 *   sans repasser par le menu, ce qui est justement le parcours qu'on veut.
 */

const SERVICES = [
  { href: "/sites-web", titre: "Sites web" },
  { href: "/automatisation", titre: "Automatisation" },
  { href: "/photo-et-video", titre: "Photo et vidéo" },
  { href: "/formation", titre: "Formation" },
] as const;

export function HeroService({
  eyebrow,
  titre,
  texte,
  courante,
}: {
  eyebrow: string;
  titre: string;
  texte: string;
  /** Chemin de la page, pour marquer le service actif et le fil d'Ariane. */
  courante: string;
}) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#0C192F",
        color: "#F5F3EE",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -260,
          right: "-10%",
          width: 900,
          height: 700,
          background:
            "radial-gradient(ellipse, rgba(79,138,147,.20) 0%, rgba(79,138,147,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="nv-shell nv-hero-fil"
        style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "26px 32px 0" }}
      >
        <nav aria-label="Fil d'Ariane" style={{ fontSize: 13 }}>
          <Link href="/" style={{ color: "rgba(245,243,238,.62)" }}>
            Accueil
          </Link>
          <span aria-hidden="true" style={{ color: "rgba(245,243,238,.34)", padding: "0 8px" }}>
            ›
          </span>
          <span style={{ color: "#F5F3EE" }}>{eyebrow}</span>
        </nav>
      </div>

      <div
        className="nv-shell nv-hero-service"
        style={{
          position: "relative",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "44px 32px 30px",
          display: "grid",
          gridTemplateColumns: "1.15fr .85fr",
          gap: 54,
          alignItems: "end",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 11.5,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "rgba(245,243,238,.6)",
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(32px,4.2vw,56px)",
              lineHeight: 1.05,
              letterSpacing: "-.035em",
            }}
          >
            {titre}
          </h1>
        </div>

        <div>
          <p
            style={{
              margin: 0,
              fontSize: 17,
              lineHeight: 1.65,
              color: "rgba(245,243,238,.72)",
            }}
          >
            {texte}
          </p>
          <div style={{ margin: "26px 0 0", display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a
              href={LIEN_RDV}
              target="_blank"
              rel="noopener noreferrer"
              className="nv-btn-cream"
              style={{ padding: "14px 24px", borderRadius: 10, fontSize: 14.5, fontWeight: 600 }}
            >
              Réserver mes 30 minutes
            </a>
            <Link
              href="/diagnostic"
              style={{
                padding: "14px 22px",
                borderRadius: 10,
                border: "1px solid rgba(245,243,238,.28)",
                fontSize: 14.5,
                fontWeight: 600,
                color: "#F5F3EE",
              }}
            >
              Faire le quiz
            </Link>
          </div>
        </div>
      </div>

      {/* Passer d'un service a l'autre sans repasser par le menu. */}
      <div
        className="nv-shell nv-hero-onglets"
        style={{
          position: "relative",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 32px 0",
        }}
      >
        <nav
          aria-label="Nos services"
          className="nv-service-switch"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            borderTop: "1px solid rgba(245,243,238,.14)",
            paddingTop: 10,
          }}
        >
          {SERVICES.map((s) => {
            const actif = s.href === courante;
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={actif ? "page" : undefined}
                style={{
                  padding: "13px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: actif ? "#F5F3EE" : "rgba(245,243,238,.58)",
                  borderBottom: actif
                    ? "2px solid #F5F3EE"
                    : "2px solid transparent",
                }}
              >
                {s.titre}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

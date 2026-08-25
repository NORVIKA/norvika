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
  lienExtra,
}: {
  eyebrow: string;
  titre: string;
  texte: string;
  /** Chemin de la page, pour marquer le service actif et le fil d'Ariane. */
  courante: string;
  /**
   * Troisieme bouton, propre a une page. Sert au lien vers le portfolio sur
   * /photo-et-video : il vivait dans l'ancienne entete et serait parti avec
   * elle sans ce point d'accroche.
   */
  lienExtra?: { href: string; libelle: string };
}) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#081120",
        color: "#F5F3EE",
      }}
    >
      {/* La meme aurore que l'accueil : bleu electrique, turquoise, violet.
          Avant, cette entete n'avait qu'un seul halo turquoise a 20 %, donc
          pratiquement pas de couleur. Depuis que l'accueil en a, une entete
          grise ici ferait lire les pages de service comme un autre site.

          ⚠️ Volontairement PLUS SOBRE que l'accueil (opacites reduites d'un
          tiers, bande deux fois moins haute) : l'accueil est le moment fort,
          une page de service doit porter son contenu, pas rivaliser avec lui.

          ⚠️ Pas d'orange dans le contrepoint. Orange et turquoise sont
          opposes : partout ou ils se chevauchent, le melange vire au brun
          sale. Le violet est du meme bord froid que le bleu. */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <div
          style={{
            position: "absolute",
            top: "-58%",
            left: "-10%",
            width: 640,
            height: 640,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(53,87,212,.58) 0%, rgba(53,87,212,0) 68%)",
            filter: "blur(46px)",
            animation: "driftA 24s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-46%",
            left: "34%",
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(45,212,191,.40) 0%, rgba(45,212,191,0) 68%)",
            filter: "blur(52px)",
            animation: "driftB 29s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-34%",
            right: "-12%",
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,.42) 0%, rgba(168,85,247,0) 66%)",
            filter: "blur(50px)",
            animation: "driftA 33s ease-in-out infinite reverse",
          }}
        />
        {/* Le bas se rassombrit : les onglets de service et le trait qui les
            porte doivent rester lisibles, pas flotter dans la couleur. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(8,17,32,0) 34%, rgba(8,17,32,.82) 88%, #081120 100%)",
          }}
        />
      </div>

      <div
        className="nv-shell nv-hero-fil"
        style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "26px 32px 0" }}
      >
        <nav aria-label="Fil d'Ariane" style={{ fontSize: 13 }}>
          <Link href="/" style={{ color: "rgba(245,243,238,.8)" }}>
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
              color: "rgba(245,243,238,.78)",
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
              color: "rgba(245,243,238,.88)",
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
            {lienExtra ? (
              <a
                href={lienExtra.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "14px 22px",
                  borderRadius: 10,
                  border: "1px solid rgba(245,243,238,.28)",
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: "#F5F3EE",
                }}
              >
                {lienExtra.libelle}
              </a>
            ) : null}
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
                  color: actif ? "#F5F3EE" : "rgba(245,243,238,.74)",
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

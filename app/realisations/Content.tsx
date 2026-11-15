"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ClientLogoCard } from "@/components/site/ClientLogoCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useReveal } from "@/lib/useReveal";
import { AutresPages } from "@/components/site/AutresPages";
import { useContenuGlobal } from "@/components/site/ContenuGlobal";
import { categories, visible, type CategorieId, type PageRealisations, type Realisation } from "@/lib/types-contenu";

type CategoryId = CategorieId;


// Tout le texte vient de la page « Réalisations » du Studio ; les logos, des fiches des clients.
function Page({ page, realisations }: { page: PageRealisations; realisations: Realisation[] }) {
  useReveal();
  const { parametres } = useContenuGlobal();
  const CATEGORIES = categories(page);
  const CLIENTS = realisations;
  const [filter, setFilter] = useState<CategoryId | "all">("all");

  const clients =
    filter === "all"
      ? CLIENTS
      : CLIENTS.filter((c) => c.categories.includes(filter));

  return (
    <div style={{ position: "relative", overflowX: "hidden", background: "#fff" }}>
      <SiteHeader />

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#fff",
          borderBottom: "1px solid rgba(12,25,47,.1)",
        }}
      >
        <div
          className="nv-shell"
          style={{
            position: "relative",
            maxWidth: 920,
            margin: "0 auto",
            padding: "96px 32px 64px",
            textAlign: "center",
          }}
        >
          {/* Plus de sur-titre « Réalisations » au-dessus du grand titre (règle d'agence 1) :
              le titre suffit, la page se nomme dans le menu, l'onglet et le fil d'Ariane des fiches. */}
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(36px,4.8vw,64px)",
              lineHeight: 1.05,
              letterSpacing: "-.04em",
              color: "#0C192F",
            }}
          >
            {page.h1}{" "}
            <span style={{ color: "#33496C" }}>{page.h1Accent}</span>
          </h1>
          <p
            style={{
              margin: "28px auto 0",
              maxWidth: "58ch",
              fontSize: 18,
              lineHeight: 1.62,
              color: "rgba(12,25,47,.62)",
            }}
          >
            {page.intro}
          </p>
        </div>
      </section>

      <section style={{ background: "#fff", borderBottom: "1px solid rgba(12,25,47,.1)" }}>
        <div
          className="nv-shell"
          style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 32px 96px" }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
              marginBottom: 44,
            }}
          >
            {[
              { id: "all" as const, label: page.filtreTout },
              ...CATEGORIES.filter((cat) =>
                CLIENTS.some((cl) => cl.categories.includes(cat.id)),
              ),
            ].map((c) => {
              const active = filter === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(c.id as CategoryId | "all")}
                  className="nv-filtre"
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="nv-logo-grid">
            {clients.map((c) => (
              <ClientLogoCard key={c.slug} client={c} />
            ))}
          </div>


          {clients.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(12,25,47,.55)" }}>
              {page.aucun}
            </p>
          ) : null}
        </div>
      </section>

      {visible(page.portfolio) ? (
      <section style={{ background: "#0C192F", color: "#fff" }}>
        <div
          className="nv-shell"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "72px 32px",
            textAlign: "center",
          }}
        >
          <h2
            data-reveal
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(26px,3vw,38px)",
              letterSpacing: "-.03em",
              color: "#fff",
            }}
          >
            {page.portfolio.titre}
          </h2>
          <div style={{ marginTop: 26 }}>
            <a
              href={parametres.lienPortfolio}
              target="_blank"
              rel="noopener"
              className="nv-btn-contour-clair"
              style={{
                display: "inline-block",
                padding: "16px 22px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                ["--contour" as string]: "rgba(255,255,255,.55)",
              }}
            >
              {page.portfolio.bouton}
            </a>
          </div>
        </div>
      </section>
      ) : null}

      <AutresPages courante="/realisations" />
      <SiteFooter />
    </div>
  );
}

export default Page;

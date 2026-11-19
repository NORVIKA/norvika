"use client";

import Link from "next/link";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Roadmap, versRoadSteps } from "@/components/site/Roadmap";
import { AutresPages } from "@/components/site/AutresPages";
import { HeroService } from "@/components/site/HeroService";
import { visible, type PageSitesWeb, type PageVerificateur } from "@/lib/types-contenu";
import { CHEMIN_VERIFICATEUR } from "@/lib/verificateur/types";
import { useReveal } from "@/lib/useReveal";

// Tout le texte vient de la page « Sites web » du Studio ; le bloc du vérificateur Loi 25, de la page
// « Vérificateur Loi 25 » (il y vit tant que l'outil n'est pas en ligne : voir studio/schemas/verificateur.ts).
function Page({ page, annonceVerificateur }: { page: PageSitesWeb; annonceVerificateur: PageVerificateur["blocSitesWeb"] }) {
  useReveal();
  const ROAD_STEPS = versRoadSteps(page.parcours.etapes);

  const cardStyle: React.CSSProperties = {
    padding: "34px 30px",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,.8)",
    background: "linear-gradient(150deg, rgba(255,255,255,.72), rgba(255,255,255,.42))",
    backdropFilter: "blur(28px) saturate(180%)",
    WebkitBackdropFilter: "blur(28px) saturate(180%)",
    boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -46px rgba(12,25,47,.8)",
  };



  return (
    <div style={{ position: "relative", overflowX: "hidden", background: "#fff" }}>
      <SiteHeader />
      {/* Repère « contenu principal » (lecteurs d'écran) et cible du lien d'évitement de l'en-tête. */}
      <main id="contenu">

      <HeroService
        nom={page.nom}
        titre={page.h1}
        texte={page.heroTexte}
        courante="/sites-web"
      />

      {visible(page.reconnaissez) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-shell nv-grid"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "88px 32px",
            display: "grid",
            gridTemplateColumns: ".85fr 1.15fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(28px,3.4vw,44px)",
              lineHeight: 1.08,
              letterSpacing: "-.03em",
            }}
          >
            {page.reconnaissez.titre}
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              overflow: "hidden",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,.8)",
              background: "rgba(51,73,108,.14)",
              boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -46px rgba(12,25,47,.8)",
            }}
          >
            {page.reconnaissez.phrases.map((text, i) => (
              <div
                key={i}
                data-check
                style={{
                  margin: 0,
                  padding: "22px 26px",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  background: "linear-gradient(150deg, rgba(255,255,255,.82), rgba(255,255,255,.5))",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    border: "1px solid rgba(51,73,108,.4)",
                    background: "#F5F3EE",
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 12.5 L9.5 18 L20 6.5"
                      stroke="#33496C"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: "rgba(12,25,47,.74)" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {visible(page.parcours) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(28px,3.4vw,44px)",
              lineHeight: 1.08,
              letterSpacing: "-.03em",
            }}
          >
            {page.parcours.titre}
          </h2>

          <Roadmap steps={ROAD_STEPS} />
          </div>
      </section>
      ) : null}

      {visible(page.differemment) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2
            style={{
              margin: "0 0 44px",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(28px,3.4vw,44px)",
              lineHeight: 1.08,
              letterSpacing: "-.03em",
            }}
          >
            {page.differemment.titre}
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {page.differemment.cartes.map((item, i) => (
              <div key={i} style={cardStyle}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 21,
                    letterSpacing: "-.02em",
                  }}
                >
                  {item.titre}
                </h3>
                <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.66)" }}>{item.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {visible(annonceVerificateur) ? (
        <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
          <div className="nv-verif-cadre" style={{ paddingTop: 72, paddingBottom: 72 }}>
            <div className="nv-verif-annonce">
              <div>
                <h2>{annonceVerificateur.titre}</h2>
                <p>{annonceVerificateur.texte}</p>
              </div>
              <Link href={CHEMIN_VERIFICATEUR} className="nv-btn-cream">
                {annonceVerificateur.bouton}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <AutresPages courante="/sites-web" />
      </main>
      <SiteFooter />
    </div>
  );
}

export default Page;

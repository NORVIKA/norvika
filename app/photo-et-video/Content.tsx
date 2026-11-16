"use client";

import Link from "next/link";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Roadmap, versRoadSteps } from "@/components/site/Roadmap";
import { AutresPages } from "@/components/site/AutresPages";
import { HeroService } from "@/components/site/HeroService";
import { useContenuGlobal } from "@/components/site/ContenuGlobal";
import { visible, type PagePhotoVideo } from "@/lib/types-contenu";
import { useReveal } from "@/lib/useReveal";
const cardStyle: React.CSSProperties = {
  padding: "34px 30px",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,.8)",
  background: "linear-gradient(150deg, rgba(255,255,255,.72), rgba(255,255,255,.42))",
  backdropFilter: "blur(28px) saturate(180%)",
  WebkitBackdropFilter: "blur(28px) saturate(180%)",
  boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -46px rgba(12,25,47,.8)",
};

const cardH3: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 21,
  letterSpacing: "-.02em",
};

const cardP: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: 16,
  lineHeight: 1.62,
  color: "rgba(12,25,47,.66)",
};

// Tout le texte vient de la page « Photo et vidéo » du Studio.
function Page({ page }: { page: PagePhotoVideo }) {
  const { parametres } = useContenuGlobal();
  const ROAD_STEPS = versRoadSteps(page.parcours.etapes);
  const tournage = page.tournage.photo;
  useReveal();


  return (
    <div style={{ position: "relative", overflowX: "hidden", background: "#fff" }}>
      <SiteHeader />

      <HeroService
        nom={page.nom}
        titre={page.h1}
        texte={page.heroTexte}
        courante="/photo-et-video"
        lienExtra={
          page.heroLienTexte
            ? { href: parametres.lienPortfolio, libelle: page.heroLienTexte }
            : undefined
        }
      />

      {visible(page.reconnaissez) ? (
      <section
        style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#fff" }}
      >
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
              boxShadow:
                "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -46px rgba(12,25,47,.8)",
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
                  background:
                    "linear-gradient(150deg, rgba(255,255,255,.82), rgba(255,255,255,.5))",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                }}
              >
                <span
                  className="nv-check-box"
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
                    animationDelay: `${(i * 0.28).toFixed(2)}s`,
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      className="nv-check-draw"
                      d="M4 12.5 L9.5 18 L20 6.5"
                      stroke="#33496C"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ animationDelay: `${(i * 0.28 + 0.24).toFixed(2)}s` }}
                    />
                  </svg>

                </span>
                <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: "rgba(12,25,47,.74)" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {visible(page.capte) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
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
            {page.capte.titre}
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {page.capte.cartes.map((c) => (
              <div key={c.titre} style={cardStyle}>
                <h3 style={cardH3}>{c.titre}</h3>
                <p style={cardP}>{c.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {visible(page.parcours) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#fff" }}>
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
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
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
          <div className="nv-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {page.differemment.cartes.map((d) => (
              <div key={d.titre} style={cardStyle}>
                <h3 style={cardH3}>{d.titre}</h3>
                <p style={cardP}>{d.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {visible(page.tournage) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#fff" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <div
            className="nv-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,300px) 1fr",
              gap: 32,
              alignItems: "center",
              padding: 24,
              borderRadius: 24,
              border: "1px solid rgba(12,25,47,.1)",
              background: "#F5F3EE",
            }}
          >
            <img
              src={tournage.url}
              alt={tournage.alt ?? ""}
              loading="lazy"
              style={{ width: "100%", height: "auto", borderRadius: 18, display: "block" }}
            />
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(20px,2.2vw,26px)", lineHeight: 1.2, letterSpacing: "-.02em" }}>
                {page.tournage.titre}
              </p>
              <p style={{ margin: "14px 0 0", fontSize: 16.5, lineHeight: 1.65, color: "rgba(12,25,47,.66)" }}>
                {page.tournage.texte}
              </p>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      <AutresPages courante="/photo-et-video" />
      <SiteFooter />
    </div>
  );
}

export default Page;

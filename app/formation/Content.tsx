"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Roadmap, versRoadSteps } from "@/components/site/Roadmap";
import { useReveal } from "@/lib/useReveal";
import { AutresPages } from "@/components/site/AutresPages";
import { HeroService } from "@/components/site/HeroService";
import { visible, type PageFormation } from "@/lib/types-contenu";

// Tout le texte vient de la page « Formation » du Studio.
function Page({ page }: { page: PageFormation }) {
  const ROAD_STEPS = versRoadSteps(page.parcours.etapes);

  useReveal();

  return (
    <div style={{ position: "relative", overflowX: "hidden", background: "#fff" }}>
      <SiteHeader />

      <HeroService
        eyebrow={page.nom}
        titre={page.h1}
        texte={page.heroTexte}
        courante="/formation"
      />

      {visible(page.reconnaissez) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-grid nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "88px 32px", display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: 56, alignItems: "start" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
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
                data-reveal
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
                  className="nv-check-box"
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    border: "1px solid rgba(51,73,108,.34)",
                    background: "rgba(255,255,255,.7)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      className="nv-check-draw"
                      d="M5 12.5l4.4 4.4L19 7.6"
                      stroke="#33496C"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ animationDelay: `${i * 0.35 + 0.28}s` }}
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

      {visible(page.gains) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: "0 0 44px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            {page.gains.titre}
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {page.gains.cartes.map((item, i) => (
              <div
                key={i}
                data-reveal
                className="nv-card-hover"
                style={{
                  padding: "34px 30px",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,.8)",
                  background: "linear-gradient(150deg, rgba(255,255,255,.74), rgba(255,255,255,.44))",
                  backdropFilter: "blur(28px) saturate(180%)",
                  WebkitBackdropFilter: "blur(28px) saturate(180%)",
                  boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -46px rgba(12,25,47,.8)",
                }}
              >
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 21, letterSpacing: "-.02em" }}>
                  {item.titre}
                </h3>
                <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.66)" }}>{item.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {visible(page.enseigne) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: "0 0 44px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            {page.enseigne.titre}
          </h2>
          <div className="nv-grid nv-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {page.enseigne.liste.map((item, n) => (
              <div
                key={n}
                data-reveal
                className="nv-card-hover"
                style={{
                  padding: "34px 30px",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,.8)",
                  background: "linear-gradient(150deg, rgba(255,255,255,.72), rgba(255,255,255,.42))",
                  backdropFilter: "blur(28px) saturate(180%)",
                  WebkitBackdropFilter: "blur(28px) saturate(180%)",
                  boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -46px rgba(12,25,47,.8)",
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "rgba(12,25,47,.35)" }}>{String(n + 1).padStart(2, "0")}</span>
                <h3 style={{ margin: "12px 0 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 21, letterSpacing: "-.02em" }}>
                  {item.titre}
                </h3>
                <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.66)" }}>{item.texte}</p>
                <p style={{ margin: "18px 0 0", paddingTop: 16, borderTop: "1px solid rgba(12,25,47,.1)", fontSize: 15.5, lineHeight: 1.6, color: "rgba(12,25,47,.78)" }}>
                  <strong style={{ fontWeight: 600 }}>{page.enseigne.libelleApres}{" "}</strong>
                  {item.apres}
                </p>
              </div>
            ))}
          </div>




        </div>
      </section>
      ) : null}

      {visible(page.parcours) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            {page.parcours.titre}
          </h2>

          <Roadmap steps={ROAD_STEPS} />
          </div>
      </section>
      ) : null}

      {visible(page.differemment) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: "0 0 44px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            {page.differemment.titre}
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {page.differemment.cartes.map((item, i) => (
              <div
                key={i}
                data-reveal
                className="nv-card-hover"
                style={{
                  padding: "34px 30px",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,.8)",
                  background: "linear-gradient(150deg, rgba(255,255,255,.72), rgba(255,255,255,.42))",
                  backdropFilter: "blur(28px) saturate(180%)",
                  WebkitBackdropFilter: "blur(28px) saturate(180%)",
                  boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -46px rgba(12,25,47,.8)",
                }}
              >
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 21, letterSpacing: "-.02em" }}>
                  {item.titre}
                </h3>
                <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.66)" }}>{item.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      <AutresPages courante="/formation" />
      <SiteFooter />
    </div>
  );
}

export default Page;

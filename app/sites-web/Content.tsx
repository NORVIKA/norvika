"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Roadmap, type RoadStep } from "@/components/site/Roadmap";
import { LIEN_RDV } from "@/lib/liens";
import { AutresPages } from "@/components/site/AutresPages";
import { HeroService } from "@/components/site/HeroService";

const STEPS = [
  {
    title: "Un appel de 30 minutes",
    text: "On comprend votre entreprise, vos clients, ce que votre site doit accomplir. Gratuit, sans engagement.",
    x: 60,
    y: 150,
  },
  {
    title: "On conçoit votre site",
    text: "À partir de votre réalité, vos clients et ce que votre site doit accomplir. Pas de gabarit générique.",
    x: 392,
    y: 100,
  },
  {
    title: "Deux à trois semaines de construction",
    text: "On bâtit, on ajuste avec vous, on soigne les détails.",
    x: 784,
    y: 115,
  },
  {
    title: "Livraison et prise en main",
    text: "On vous montre comment tout fonctionne. Vous repartez autonome, avec un site qui vous appartient.",
    x: 1116,
    y: 74,
  },
];

const ROAD_STEPS: RoadStep[] = STEPS.map((e) => ({ label: e.title, title: e.title, body: e.text }));


function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-check]:not(.is-in)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-in");
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

function Page() {
  const containerRef = useReveal();

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
    <div ref={containerRef} style={{ position: "relative", overflowX: "hidden", background: "#fff" }}>
      <SiteHeader />

      <HeroService
        eyebrow="Sites web"
        titre="Un site qui vous ressemble, et qui travaille pour vous."
        texte="Pas de gabarit générique. On part de votre entreprise, on bâtit un site clair qui donne envie de vous contacter, et vous repartez en sachant comment il fonctionne."
        courante="/sites-web"
      />

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
            Vous vous reconnaissez?
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
            {[
              "Vous n'avez pas de site, et vos clients vous cherchent en ligne sans vous trouver.",
              "Votre site date, et il ne représente plus la qualité de votre travail.",
              "Votre site est correct, mais personne ne vous contacte à partir de là.",
              "Vous voulez un site à vous, sans mensualités qui n'en finissent plus.",
            ].map((text, i) => (
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
            Comment ça se passe
          </h2>

          <Roadmap steps={ROAD_STEPS} />
          </div>
      </section>

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
            Ce qu'on fait différemment
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {[
              { title: "Le site vous appartient.", text: "Aucun frais mensuel obligatoire, aucun contrat qui vous retient. Il est à vous, point." },
              {
                title: "Bâti sur mesure.",
                text: "Pas de forfait prédéfini: on monte le site autour de votre entreprise, avec ce dont vous avez besoin, rien de plus.",
              },
              {
                title: "Fait pour convertir.",
                text: "Un site clair, rapide, qui guide vos visiteurs vers la prochaine étape. Pas juste une belle vitrine.",
              },
              { title: "Prêt à évoluer.", text: "Quand vous voudrez ajouter une fonctionnalité ou connecter un outil, il pourra suivre." },
            ].map((item, i) => (
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
                  {item.title}
                </h3>
                <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.66)" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AutresPages courante="/sites-web" />
      <SiteFooter />
    </div>
  );
}

export default Page;

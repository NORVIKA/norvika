"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Roadmap, type RoadStep } from "@/components/site/Roadmap";
import { LIEN_RDV } from "@/lib/liens";
import { AutresPages } from "@/components/site/AutresPages";
import { HeroService } from "@/components/site/HeroService";
const tournage = { url: "/assets/img-1079.webp" };
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

const checks = [
  "Vos photos datent, ou elles viennent d'une banque d'images qui ne vous ressemble pas.",
  "Votre site et vos réseaux ont l'air amateurs à côté de la qualité de votre service.",
  "Vous avez un événement, un lancement, un nouveau local, et rien pour le montrer.",
  "Vous savez que l'image compte, mais vous n'avez ni le temps ni le réflexe de la soigner.",
];

const capte = [
  {
    title: "Votre équipe et vos lieux",
    text: "Portraits, ambiance, coulisses. Ce qui donne confiance avant même le premier appel.",
  },
  {
    title: "Vos produits et votre travail",
    text: "Ce que vous faites, montré comme il mérite de l'être.",
  },
  {
    title: "Vos événements",
    text: "Lancements, conférences, moments d'équipe. Ce qui se passe une fois, capté pour de bon.",
  },
  {
    title: "Vos contenus vidéo",
    text: "Courtes vidéos pour vos réseaux ou votre site, avec un message clair.",
  },
];

const differenciateurs = [
  {
    title: "On pense à l'utilité avant l'esthétique.",
    text: "Une belle photo qui ne sert à rien, c'est de l'argent perdu. On capte ce dont votre site et vos réseaux ont vraiment besoin.",
  },
  {
    title: "On connaît le reste de votre présence en ligne.",
    text: "On fait aussi des sites web: on sait exactement quelles images un site a besoin pour bien fonctionner.",
  },
  {
    title: "Les images sont à vous.",
    text: "Aucune licence limitée, aucun frais pour les réutiliser. Vous les avez, point.",
  },
];

const etapes = [
  {
    num: "01",
    label: "Un appel de 30 minutes",
    title: "Un appel de 30 minutes",
    text: "On comprend votre entreprise, à qui vous parlez et à quoi les images vont servir. Gratuit, sans engagement.",
  },
  {
    num: "02",
    label: "On planifie ensemble",
    title: "On planifie ensemble",
    text: "Lieux, moments, ce qu'on doit absolument capter. Vous n'avez rien à deviner.",
  },
  {
    num: "03",
    label: "On tourne, on capte",
    title: "On tourne, on capte",
    text: "Sur place, avec vous, sans mise en scène forcée. Ce qui compte, c'est que ça vous ressemble.",
  },
  {
    num: "04",
    label: "On livre, prêt à utiliser",
    title: "On livre, prêt à utiliser",
    text: "Des images pensées pour votre site, vos réseaux, vos soumissions. Elles sont à vous, sans restriction.",
  },
];

const ROAD_STEPS: RoadStep[] = etapes.map((e) => ({ num: e.num, label: e.label, title: e.title, body: e.text }));

const stepPositions = [
  { x: 60, y: 150 },
  { x: 324, y: 96 },
  { x: 852, y: 112 },
  { x: 1116, y: 74 },
];

function Page() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll<HTMLElement>(
      "[data-reveal], [data-check]",
    );
    if (!els || els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
          }
        });
      },
      { threshold: 0.2 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);


  return (
    <div
      ref={rootRef}
      style={{ position: "relative", overflowX: "hidden", background: "#fff" }}
    >
      <SiteHeader />

      <HeroService
        eyebrow="Photo et vidéo"
        titre="Ce que vos clients voient devrait être à la hauteur de ce que vous faites."
        texte="Votre travail parle de lui-même, quand on le montre bien. On capte votre entreprise telle qu'elle est: vraie, professionnelle, reconnaissable."
        courante="/photo-et-video"
        lienExtra={{
          href: "https://norvika.myportfolio.com/",
          libelle: "Voir notre portfolio →",
        }}
      />

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
              boxShadow:
                "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -46px rgba(12,25,47,.8)",
            }}
          >
            {checks.map((text, i) => (
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
            Ce qu'on capte
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {capte.map((c) => (
              <div key={c.title} style={cardStyle}>
                <h3 style={cardH3}>{c.title}</h3>
                <p style={cardP}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            Comment ça se passe
          </h2>

          <Roadmap steps={ROAD_STEPS} />
          </div>
      </section>

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
            Ce qu'on fait différemment
          </h2>
          <div className="nv-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {differenciateurs.map((d) => (
              <div key={d.title} style={cardStyle}>
                <h3 style={cardH3}>{d.title}</h3>
                <p style={cardP}>{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              alt="Un membre de l'équipe Norvika en tournage chez un client"
              loading="lazy"
              style={{ width: "100%", height: "auto", borderRadius: 18, display: "block" }}
            />
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(20px,2.2vw,26px)", lineHeight: 1.2, letterSpacing: "-.02em" }}>
                On tourne chez vous, dans votre vrai environnement.
              </p>
              <p style={{ margin: "14px 0 0", fontSize: 16.5, lineHeight: 1.65, color: "rgba(12,25,47,.66)" }}>
                On apporte l'équipement, on s'installe sur place et on capte votre entreprise telle
                qu'elle est. Pas de mise en scène forcée: des images qui vous ressemblent et qui
                servent réellement votre marque.
              </p>
            </div>
          </div>
        </div>
      </section>


      <AutresPages courante="/photo-et-video" />
      <SiteFooter />
    </div>
  );
}

export default Page;

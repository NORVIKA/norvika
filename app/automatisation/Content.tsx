"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Roadmap, type RoadStep } from "@/components/site/Roadmap";

const STEPS = [
  { title: "Un appel de 30 minutes", label: "Un appel de 30 minutes", desc: "On regarde ensemble comment votre entreprise fonctionne aujourd'hui. Gratuit, sans engagement, et vous repartez avec un document d'analyse." },
  { title: "On comprend vos façons de faire", label: "On comprend vos façons de faire", desc: "Vos outils actuels, vos étapes, où ça accroche. Avant de proposer quoi que ce soit." },
  { title: "On trouve ce qui vous convient", label: "On trouve ce qui vous convient", desc: "Parfois c'est un outil que vous avez déjà, mal utilisé. Parfois c'est de l'automatisation, parfois de l'IA. On choisit pour votre réalité, pas pour la mode." },
  { title: "On implante avec vous", label: "On implante avec vous", desc: "Petit à petit, sur vos propres comptes, avec votre équipe. Vous comprenez ce qui roule chez vous." },
  { title: "On reste à vos côtés", label: "On reste à vos côtés", desc: "Vos outils évoluent, votre entreprise aussi. On vous accompagne pour que la compréhension reste, et que le temps gagné reste aussi." },
];

const ROAD_STEPS: RoadStep[] = STEPS.map((e) => ({ label: e.label, title: e.title, body: e.desc }));


const CHECKS = [
  "Vous payez pour des logiciels que vous utilisez à moitié.",
  "Vous avez cinq outils, et rien ne se parle. Vous faites le pont vous-même, chaque jour.",
  "Vous savez que ça pourrait rouler mieux, mais vous ne savez pas par où commencer.",
  "Vous avez déjà essayé quelque chose, personne ne vous a expliqué, vous l'avez abandonné.",
];

const DIFFERENTLY = [
  { title: "On commence par ce que vous avez déjà.", desc: "Avant d'ajouter un outil, on regarde si ceux que vous payez font le travail. Souvent, la réponse est oui." },
  { title: "Vous comprenez, vous ne subissez pas.", desc: "On vous explique ce qui roule chez vous et pourquoi. Le but, c'est que vous soyez maître de vos outils, pas dépendant de nous." },
  { title: "Rien n'est hébergé chez nous.", desc: "Tout est implanté sur vos comptes. Si on part demain, ça continue de rouler." },
  { title: "Pas d'IA pour faire de l'IA.", desc: "Si le processus est mal organisé, ajouter de l'intelligence artificielle par-dessus rend juste ça plus compliqué. On règle l'ordre des choses d'abord." },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]:not(.is-in)");
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
}

function Page() {

  useReveal();

  return (
    <div style={{ position: "relative", overflowX: "hidden", background: "#fff" }}>
      <SiteHeader />

      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(12,25,47,.1)" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: "-20% -10% auto", height: 800, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "6%", left: "8%", width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle, rgba(51,73,108,.16) 0%, rgba(51,73,108,0) 68%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", top: "0%", left: "48%", width: 660, height: 660, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,138,147,.15) 0%, rgba(79,138,147,0) 68%)", filter: "blur(44px)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0) 40%, #ffffff 96%)" }} />
        </div>
        <div className="nv-shell" style={{ position: "relative", maxWidth: 920, margin: "0 auto", padding: "84px 32px 82px", textAlign: "center" }}>
          <p style={{ margin: "0 0 18px", fontSize: 11.5, letterSpacing: ".2em", textTransform: "uppercase", color: "#33496C", fontWeight: 600 }}>Automatisation</p>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(34px,4.4vw,58px)", lineHeight: 1.06, letterSpacing: "-.035em" }}>
            Vos outils devraient travailler pour vous. Pas l'inverse.
          </h1>
          <p style={{ margin: "26px auto 0", maxWidth: "62ch", fontSize: 18, lineHeight: 1.62, color: "rgba(12,25,47,.64)" }}>
            La plupart des entreprises ont déjà des outils. Le problème, c'est qu'elles ne les comprennent pas vraiment, alors elles compensent à la main. On vous aide à comprendre ce que vous avez, à choisir ce qui manque, et à retrouver du temps pour ce qui compte.
          </p>
          <div style={{ margin: "34px 0 0", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <Link href="/diagnostic" className="nv-btn-primary" style={{ padding: "16px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600 }}>
              Réserver mes 30 minutes
            </Link>
            <Link href="/diagnostic" style={{ padding: "16px 22px", borderRadius: 10, border: "1px solid rgba(12,25,47,.14)", fontSize: 15, fontWeight: 600, color: "rgba(12,25,47,.76)" }}>
              Faire le quiz →
            </Link>
          </div>
        </div>
      </section>

      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-grid nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "88px 32px", display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: 56, alignItems: "start" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
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
            {CHECKS.map((text, i) => (
              <div
                key={i}
                data-check
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
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    border: "1px solid rgba(51,73,108,.4)",
                    background: "#F5F3EE",
                    animationDelay: `${i * 0.35}s`,
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

      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            Comment ça se passe
          </h2>

          <Roadmap steps={ROAD_STEPS} />
          </div>
      </section>

      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: "0 0 44px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            Ce qu'on fait différemment
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {DIFFERENTLY.map((item, i) => (
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
                  {item.title}
                </h3>
                <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.66)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: "-10%", left: "40%", width: 620, height: 620, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(51,73,108,.12) 0%, rgba(51,73,108,0) 68%)", filter: "blur(40px)" }} />
        <div className="nv-grid nv-shell" style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "92px 32px", display: "grid", gridTemplateColumns: ".7fr 1.3fr", gap: 56, alignItems: "start" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            Un exemple simple
          </h2>
          <div
            style={{
              padding: "40px 44px",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,.8)",
              background: "linear-gradient(150deg, rgba(255,255,255,.74), rgba(255,255,255,.44))",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -40px rgba(12,25,47,.6)",
            }}
          >
            <p style={{ margin: 0, maxWidth: "68ch", fontSize: 17.5, lineHeight: 1.7, color: "rgba(12,25,47,.72)" }}>
              Un entrepreneur recevait ses demandes par courriel, sur Facebook et sur son site web, et passait ses soirées à tout retranscrire pour faire ses suivis. On a regardé son processus au complet, puis on a centralisé ses demandes au même endroit, avec les outils qu'il avait déjà. Maintenant, chaque demande est classée automatiquement, il sait lesquelles relancer, et il comprend comment ça marche. Rien de spectaculaire. Juste ses soirées qui lui appartiennent de nouveau.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export default Page;

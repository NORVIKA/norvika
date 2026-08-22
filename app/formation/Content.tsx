"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Roadmap, type RoadStep } from "@/components/site/Roadmap";
import { useReveal } from "@/lib/useReveal";
import { LIEN_RDV } from "@/lib/liens";

const CHECKS = [
  "Vous voulez publier des photos et des vidéos qui vous ressemblent, sans attendre un photographe à chaque fois.",
  "Vous avez un site, mais vous n'osez pas y toucher de peur de tout briser.",
  "Vous payez pour des outils que votre équipe utilise à moitié, parce que personne a jamais pris le temps d'expliquer.",
  "Vous voulez comprendre ce que l'automatisation ou l'IA peut faire pour vous, avant d'investir quoi que ce soit.",
];

const GAINS = [
  {
    title: "Vous arrêtez d'attendre.",
    desc: "Une photo à publier, une page à modifier, un outil à ajuster: vous le faites le jour même, au lieu d'ouvrir un ticket ou d'attendre une soumission.",
  },
  {
    title: "Vous arrêtez de payer pour la même chose.",
    desc: "Chaque fois que votre équipe sait faire elle-même, c'est une facture d'agence qui ne revient plus.",
  },
  {
    title: "Vous reprenez le contrôle.",
    desc: "Quand vous comprenez comment ça marche, vous savez ce qui vaut la peine d'acheter, ce qui ne sert à rien, et quand demander de l'aide.",
  },
  {
    title: "Votre équipe gagne en confiance.",
    desc: "Elle arrête de dire « je ne suis pas bonne là-dedans », et commence à dire « je m'en occupe ».",
  },
];

const TEACH = [
  {
    num: "01",
    title: "Vos photos et vidéos",
    desc: "Cadrer, éclairer, monter, publier. On apporte l'équipement pour la formation, vous apprenez sur du vrai matériel avant de décider quoi acheter.",
    after:
      "Votre équipe produit du contenu qui vous ressemble, au rythme qu'elle veut.",
  },
  {
    num: "02",
    title: "Votre site web",
    desc: "Comment le modifier, ajouter du contenu, comprendre ce qu'il fait pour vous.",
    after:
      "Un site que vous faites vivre vous-mêmes, au lieu d'un site qui vieillit parce que personne n'ose y toucher.",
  },
  {
    num: "03",
    title: "Vos outils numériques",
    desc: "Comment ils fonctionnent, comment les faire parler ensemble, lesquels vous utilisez à moitié.",
    after:
      "Souvent, vous réalisez que vous n'avez pas besoin d'un nouvel outil, juste de mieux utiliser ceux que vous payez déjà.",
  },
];

const STEPS = [
  {
    label: "Un appel de 30 minutes",
    title: "Un appel de 30 minutes",
    desc: "On comprend ce que votre équipe fait déjà, ce qu'elle aimerait faire, et où ça bloque. Gratuit, sans engagement.",
  },
  {
    label: "On bâtit la formation autour de vous",
    title: "On bâtit la formation autour de vous",
    desc: "Pas de contenu générique. On part de vos vraies situations et de ce que vous voulez être capables de faire après.",
  },
  {
    label: "On forme sur place",
    title: "On forme sur place, avec votre équipe",
    desc: "Une demi-journée, une journée ou deux, dans votre entreprise, en petit groupe ou en individuel. On pratique sur du vrai, pas sur des exemples.",
  },
  {
    label: "Vous repartez autonomes",
    title: "Vous repartez autonomes",
    desc: "Avec ce qu'il faut pour continuer sans nous. Et si vous voulez qu'on reste dans le décor, on en parle.",
  },
];

const ROAD_STEPS: RoadStep[] = STEPS.map((e) => ({ label: e.label, title: e.title, body: e.desc }));


const DIFFERENTLY = [
  {
    title: "On enseigne ce qu'on fait nous-mêmes.",
    desc: "On bâtit des sites, on tourne des vidéos, on implante des outils toutes les semaines. Vous apprenez notre pratique, pas de la théorie.",
  },
  {
    title: "On forme dans votre réalité.",
    desc: "Vos locaux, votre site, vos situations. Ce que vous apprenez le matin, vous l'appliquez l'après-midi.",
  },
  {
    title: "Souvent, c'est admissible à une aide.",
    desc: "Selon votre situation, la formation de vos employés peut être soutenue par Service Québec. On vous dit ce qui s'applique pendant l'appel.",
  },
  {
    title: "La formation, c'est parfois tout ce qu'il vous faut.",
    desc: "On préfère vous rendre autonomes que vous vendre un service dont vous n'avez pas besoin.",
  },
];


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
          <p style={{ margin: "0 0 18px", fontSize: 11.5, letterSpacing: ".2em", textTransform: "uppercase", color: "#33496C", fontWeight: 600 }}>Formation</p>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(34px,4.4vw,58px)", lineHeight: 1.06, letterSpacing: "-.035em" }}>
            Ce qui vous appartient, vous devriez le comprendre, pas juste le payer.
          </h1>
          <p style={{ margin: "26px auto 0", maxWidth: "62ch", fontSize: 18, lineHeight: 1.62, color: "rgba(12,25,47,.64)" }}>
            Votre site, vos photos, vos vidéos, vos outils: tout ça est à vous. Pourtant, vous dépendez souvent de quelqu'un d'autre pour y toucher. On forme votre équipe, sur place, pour qu'elle sache le faire elle-même.
          </p>
          <div style={{ margin: "34px 0 0", display: "flex", justifyContent: "center" }}>
            <a href={LIEN_RDV} className="nv-btn-primary" style={{ padding: "16px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600 }} target="_blank" rel="noopener noreferrer">
              Réserver mes 30 minutes
            </a>
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

      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: "0 0 44px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            Ce que vous gagnez, concrètement
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {GAINS.map((item, i) => (
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
                  {item.title}
                </h3>
                <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.66)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: "0 0 44px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            Trois choses qu'on peut vous montrer
          </h2>
          <div className="nv-grid nv-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TEACH.map((item) => (
              <div
                key={item.num}
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
                <span style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "rgba(12,25,47,.35)" }}>{item.num}</span>
                <h3 style={{ margin: "12px 0 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 21, letterSpacing: "-.02em" }}>
                  {item.title}
                </h3>
                <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.66)" }}>{item.desc}</p>
                <p style={{ margin: "18px 0 0", paddingTop: 16, borderTop: "1px solid rgba(12,25,47,.1)", fontSize: 15.5, lineHeight: 1.6, color: "rgba(12,25,47,.78)" }}>
                  <strong style={{ fontWeight: 600 }}>Après: </strong>
                  {item.after}
                </p>
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

      <SiteFooter />
    </div>
  );
}

export default Page;

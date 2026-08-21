"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useReveal } from "@/lib/useReveal";

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

const FRACS = [0, 1 / 3, 2 / 3, 1];

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

const ROAD_PATH =
  "M60 150 C 160 40, 250 40, 324 96 C 420 168, 500 172, 588 118 C 676 64, 760 62, 852 112 C 950 166, 1030 150, 1116 74";

function Page() {
  const [step, setStep] = useState(0);
  const userTouched = useRef(false);
  const roadRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [positions, setPositions] = useState<{ x: number; y: number; flip: boolean }[]>([]);
  const [pawn, setPawn] = useState({ x: 0, y: 0 });
  const [doneOffset, setDoneOffset] = useState({ length: 0, offset: 0 });

  useReveal();

  useEffect(() => {
    const layout = () => {
      const p = pathRef.current;
      const road = roadRef.current;
      if (!p || !road || !road.clientWidth) return;
      const sx = road.clientWidth / 1176;
      const L = p.getTotalLength();
      setPositions(
        FRACS.map((f) => {
          const pt = p.getPointAtLength(L * f);
          const ahead = p.getPointAtLength(Math.min(L, L * f + 26));
          const behind = p.getPointAtLength(Math.max(0, L * f - 26));
          return { x: pt.x * sx, y: pt.y, flip: ahead.y > pt.y || behind.y > pt.y };
        })
      );
      const cur = p.getPointAtLength(L * FRACS[step]!);
      setPawn({ x: cur.x * sx, y: cur.y });
      setDoneOffset({ length: L, offset: L * (1 - FRACS[step]!) });
    };
    layout();
    window.addEventListener("resize", layout);
    const t = setInterval(layout, 300);
    return () => {
      window.removeEventListener("resize", layout);
      clearInterval(t);
    };
  }, [step]);

  useEffect(() => {
    const auto = setInterval(() => {
      if (userTouched.current) return;
      setStep((s) => (s + 1) % FRACS.length);
    }, 4200);
    return () => clearInterval(auto);
  }, []);

  const activeColor = (i: number) =>
    step === i ? "#0C192F" : i < step ? "#33496C" : "rgba(12,25,47,.28)";

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
            <Link href="/diagnostic" className="nv-btn-primary" style={{ padding: "16px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600 }}>
              Réserver mes 30 minutes
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
        <div className="nv-shell nv-road-scroll" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            Comment ça se passe
          </h2>

          <div className="nv-road" ref={roadRef} style={{ position: "relative", margin: "96px 60px 0", height: 270 }}>
            <svg viewBox="0 0 1176 200" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 200 }} aria-hidden="true">
              <path d={ROAD_PATH} fill="none" stroke="rgba(12,25,47,.16)" strokeWidth="2" strokeLinecap="round" />
              <path
                ref={pathRef}
                d={ROAD_PATH}
                fill="none"
                stroke="#0C192F"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  transition: "stroke-dashoffset .8s cubic-bezier(.2,0,0,1)",
                  strokeDasharray: doneOffset.length,
                  strokeDashoffset: doneOffset.offset,
                }}
              />
            </svg>

            <div
              style={{
                position: "absolute",
                zIndex: 3,
                width: 30,
                height: 30,
                margin: "-15px 0 0 -15px",
                borderRadius: "50% 50% 50% 6px",
                transform: "rotate(-45deg)",
                background: "#0C192F",
                boxShadow: "0 10px 22px -8px rgba(12,25,47,.9), 0 0 0 6px rgba(255,255,255,.6)",
                left: pawn.x,
                top: pawn.y,
                transition: "left .75s cubic-bezier(.2,0,0,1), top .75s cubic-bezier(.2,0,0,1)",
              }}
            />

            {STEPS.map((s, i) => {
              const pos = positions[i] || { x: 0, y: 0, flip: false };
              return (
                <div
                  key={i}
                  onClick={() => {
                    userTouched.current = true;
                    setStep(i);
                  }}
                  style={{
                    position: "absolute",
                    width: 14,
                    transform: "translate(-50%,-50%)",
                    cursor: "pointer",
                    zIndex: 2,
                    left: pos.x,
                    top: pos.y,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: 14,
                      height: 14,
                      margin: "0 auto",
                      borderRadius: "50%",
                      background: activeColor(i),
                      boxShadow: "0 0 0 6px rgba(255,255,255,.85), 0 6px 16px -8px rgba(12,25,47,.9)",
                      transition: "background .3s cubic-bezier(.2,0,0,1)",
                    }}
                  />
                  <p
                    style={{
                      position: "absolute",
                      top: pos.flip ? -58 : 40,
                      left: "50%",
                      transform: "translateX(-50%)",
                      margin: 0,
                      width: 168,
                      padding: "5px 8px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,.72)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      textAlign: "center",
                      fontFamily: "var(--font-display)",
                      fontSize: 13.5,
                      letterSpacing: "-.01em",
                      color: activeColor(i),
                      transition: "color .3s cubic-bezier(.2,0,0,1)",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 28,
              padding: "32px 36px",
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,.85)",
              background: "linear-gradient(150deg, rgba(255,255,255,.78), rgba(255,255,255,.44))",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -44px rgba(12,25,47,.8)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "rgba(12,25,47,.35)" }}>
                {String(step + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-.02em" }}>
                  {STEPS[step]!.title}
                </h3>
                <p style={{ margin: "10px 0 0", maxWidth: "66ch", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.64)" }}>
                  {STEPS[step]!.desc}
                </p>
              </div>
            </div>
          </div>
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

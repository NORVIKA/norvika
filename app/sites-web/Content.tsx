"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

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

const FRACS = [0, 1 / 3, 2 / 3, 1];

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
  const [step, setStep] = useState(0);
  const userTouched = useRef(false);
  const containerRef = useReveal();

  useEffect(() => {
    const id = setInterval(() => {
      if (userTouched.current) return;
      setStep((s) => (s + 1) % FRACS.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const goTo = (i: number) => {
    userTouched.current = true;
    setStep(i);
  };

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

      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(12,25,47,.1)" }}>
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: "-20% -10% auto", height: 800, pointerEvents: "none" }}
        >
          <div
            style={{
              position: "absolute",
              top: "6%",
              left: "8%",
              width: 620,
              height: 620,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(51,73,108,.16) 0%, rgba(51,73,108,0) 68%)",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "0%",
              left: "48%",
              width: 660,
              height: 660,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(79,138,147,.15) 0%, rgba(79,138,147,0) 68%)",
              filter: "blur(44px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(255,255,255,0) 40%, #ffffff 96%)",
            }}
          />
        </div>
        <div className="nv-shell" style={{ position: "relative", maxWidth: 920, margin: "0 auto", padding: "84px 32px 82px", textAlign: "center" }}>
          <p style={{ margin: "0 0 18px", fontSize: 11.5, letterSpacing: ".2em", textTransform: "uppercase", color: "#33496C", fontWeight: 600 }}>
            Sites web
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(34px,4.4vw,58px)",
              lineHeight: 1.06,
              letterSpacing: "-.035em",
            }}
          >
            Un site qui vous ressemble, et qui travaille pour vous.
          </h1>
          <p style={{ margin: "26px auto 0", maxWidth: "60ch", fontSize: 18, lineHeight: 1.62, color: "rgba(12,25,47,.64)" }}>
            Pas de gabarit générique. On part de votre entreprise, on bâtit un site clair qui donne envie de vous contacter,
            et vous repartez en sachant comment il fonctionne.
          </p>
          <div style={{ margin: "34px 0 0", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <Link
              href="/diagnostic"
              className="nv-btn-primary"
              style={{ padding: "16px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600 }}
            >
              Réserver mes 30 minutes
            </Link>
            <Link
              href="/realisations"
              className="nv-cta-outline"
              style={{ padding: "16px 22px", borderRadius: 10, border: "1px solid", fontSize: 15, fontWeight: 600 }}
            >
              Voir nos réalisations →
            </Link>
          </div>
        </div>
      </section>

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
        <div className="nv-shell nv-road-scroll" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
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

          <div className="nv-road" style={{ position: "relative", margin: "96px 60px 0", height: 270 }}>
            <svg
              viewBox="0 0 1176 200"
              preserveAspectRatio="none"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 200 }}
              aria-hidden="true"
            >
              <path
                d="M60 150 C 160 40, 250 40, 324 96 C 420 168, 500 172, 588 118 C 676 64, 760 62, 852 112 C 950 166, 1030 150, 1116 74"
                fill="none"
                stroke="rgba(12,25,47,.16)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M60 150 C 160 40, 250 40, 324 96 C 420 168, 500 172, 588 118 C 676 64, 760 62, 852 112 C 950 166, 1030 150, 1116 74"
                fill="none"
                stroke="#0C192F"
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 * (1 - FRACS[step]!)}
                style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,0,0,1)" }}
              />
            </svg>

            <div
              style={{
                position: "absolute",
                zIndex: 3,
                width: 30,
                height: 30,
                left: `${(STEPS[step]!.x / 1176) * 100}%`,
                top: STEPS[step]!.y,
                margin: "-15px 0 0 -15px",
                borderRadius: "50% 50% 50% 6px",
                transform: "rotate(-45deg)",
                background: "#0C192F",
                boxShadow: "0 10px 22px -8px rgba(12,25,47,.9), 0 0 0 6px rgba(255,255,255,.6)",
                transition: "left .75s cubic-bezier(.2,0,0,1), top .75s cubic-bezier(.2,0,0,1)",
              }}
            />

            {STEPS.map((s, i) => {
              const color = step === i ? "#0C192F" : i < step ? "#33496C" : "rgba(12,25,47,.28)";
              const labelTop = s.y > 100 ? -58 : 40;
              return (
                <div
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    position: "absolute",
                    width: 14,
                    left: `${(s.x / 1176) * 100}%`,
                    top: s.y,
                    transform: "translate(-50%,-50%)",
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: 14,
                      height: 14,
                      margin: "0 auto",
                      borderRadius: "50%",
                      background: color,
                      boxShadow: "0 0 0 6px rgba(255,255,255,.85), 0 6px 16px -8px rgba(12,25,47,.9)",
                      transition: "background .3s cubic-bezier(.2,0,0,1)",
                    }}
                  />
                  <p
                    style={{
                      position: "absolute",
                      top: labelTop,
                      left: "50%",
                      transform: "translateX(-50%)",
                      margin: 0,
                      width: 170,
                      padding: "5px 8px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,.72)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      textAlign: "center",
                      fontFamily: "var(--font-display)",
                      fontSize: 13.5,
                      letterSpacing: "-.01em",
                      color,
                      transition: "color .3s cubic-bezier(.2,0,0,1)",
                    }}
                  >
                    {s.title}
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
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 22,
                    letterSpacing: "-.02em",
                  }}
                >
                  {STEPS[step]!.title}
                </h3>
                <p style={{ margin: "10px 0 0", maxWidth: "66ch", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.64)" }}>
                  {STEPS[step]!.text}
                </p>
              </div>
            </div>
          </div>
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

      <SiteFooter />
    </div>
  );
}

export default Page;

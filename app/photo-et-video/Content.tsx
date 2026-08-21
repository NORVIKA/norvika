"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
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

const stepPositions = [
  { x: 60, y: 150 },
  { x: 324, y: 96 },
  { x: 852, y: 112 },
  { x: 1116, y: 74 },
];

function Page() {
  const [step, setStep] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const userTouched = useRef(false);

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

  useEffect(() => {
    const id = setInterval(() => {
      if (userTouched.current) return;
      setStep((s) => (s + 1) % etapes.length);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  const goTo = (i: number) => {
    userTouched.current = true;
    setStep(i);
  };

  const progressPct = (step / (etapes.length - 1)) * 100;



  return (
    <div
      ref={rootRef}
      style={{ position: "relative", overflowX: "hidden", background: "#fff" }}
    >
      <SiteHeader />

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(12,25,47,.1)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-20% -10% auto",
            height: 800,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "6%",
              left: "8%",
              width: 620,
              height: 620,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(51,73,108,.16) 0%, rgba(51,73,108,0) 68%)",
              filter: "blur(40px)",
              animation: "driftA 22s ease-in-out infinite",
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
              background:
                "radial-gradient(circle, rgba(79,138,147,.15) 0%, rgba(79,138,147,0) 68%)",
              filter: "blur(44px)",
              animation: "driftB 27s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 40%, #ffffff 96%)",
            }}
          />
        </div>
        <div className="nv-shell"
          style={{
            position: "relative",
            maxWidth: 920,
            margin: "0 auto",
            padding: "84px 32px 82px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 18px",
              fontSize: 11.5,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "#33496C",
              fontWeight: 600,
            }}
          >
            Photo et vidéo
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(34px,4.4vw,58px)",
              lineHeight: 1.06,
              letterSpacing: "-.035em",
              textWrap: "balance",
            }}
          >
            Ce que vos clients voient devrait être à la hauteur de ce que vous
            faites.
          </h1>
          <p
            style={{
              margin: "26px auto 0",
              maxWidth: "60ch",
              fontSize: 18,
              lineHeight: 1.62,
              color: "rgba(12,25,47,.64)",
              textWrap: "pretty",
            }}
          >
            Votre travail parle de lui-même, quand on le montre bien. On
            capte votre entreprise telle qu'elle est: vraie, professionnelle,
            reconnaissable.
          </p>
          <div
            style={{
              margin: "34px 0 0",
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
            }}
          >
            <Link
              href="/diagnostic"
              className="nv-btn-primary"
              style={{
                padding: "16px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Réserver mes 30 minutes
            </Link>
            <a
              href="https://norvika.myportfolio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="nv-navlink"
              style={{
                padding: "16px 22px",
                borderRadius: 10,
                border: "1px solid rgba(12,25,47,.14)",
                fontSize: 15,
                fontWeight: 600,
                color: "rgba(12,25,47,.76)",
              }}
            >
              Voir notre portfolio photo et vidéo →
            </a>

          </div>
        </div>
      </section>

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
                strokeDasharray={1400}
                strokeDashoffset={1400 - (1400 * progressPct) / 100}
                style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,0,0,1)" }}
              />
            </svg>

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                zIndex: 3,
                width: 30,
                height: 30,
                top: stepPositions[step]!.y,
                left: `${(stepPositions[step]!.x / 1176) * 100}%`,
                margin: "-15px 0 0 -15px",
                borderRadius: "50% 50% 50% 6px",
                transform: "rotate(-45deg)",
                background: "#0C192F",
                boxShadow: "0 10px 22px -8px rgba(12,25,47,.9), 0 0 0 6px rgba(255,255,255,.6)",
                transition: "top .5s cubic-bezier(.2,0,0,1), left .5s cubic-bezier(.2,0,0,1)",
              }}
            />

            {etapes.map((e, i) => (
              <div
                key={e.num}
                className="nv-step-dot"
                onClick={() => goTo(i)}
                style={{
                  position: "absolute",
                  width: 14,
                  transform: "translate(-50%,-50%)",
                  top: stepPositions[i]!.y,
                  left: `${(stepPositions[i]!.x / 1176) * 100}%`,

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
                    background: i <= step ? "#0C192F" : "rgba(12,25,47,.25)",
                    boxShadow: "0 0 0 6px rgba(255,255,255,.85), 0 6px 16px -8px rgba(12,25,47,.9)",
                    transition: "background .3s cubic-bezier(.2,0,0,1)",
                  }}
                />
                <p
                  style={{
                    position: "absolute",
                    top: 40,
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
                    color: i <= step ? "#0C192F" : "rgba(12,25,47,.4)",
                    transition: "color .3s cubic-bezier(.2,0,0,1)",
                  }}
                >
                  {e.label}
                </p>
              </div>
            ))}
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
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  color: "rgba(12,25,47,.35)",
                }}
              >
                {etapes[step]!.num}
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
                  {etapes[step]!.title}
                </h3>
                <p
                  style={{
                    margin: "10px 0 0",
                    maxWidth: "66ch",
                    fontSize: 16,
                    lineHeight: 1.62,
                    color: "rgba(12,25,47,.64)",
                  }}
                >
                  {etapes[step]!.text}
                </p>
              </div>
            </div>
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


      <SiteFooter />
    </div>
  );
}

export default Page;

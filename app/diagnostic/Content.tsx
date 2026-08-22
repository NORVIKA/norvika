"use client";

import Link from "next/link";
import { useState } from "react";

import { SiteHeader } from "@/components/site/SiteHeader";
const logoStack = { url: "/assets/norvika-stack.svg" };
type Question = {
  t: string;
  s?: string;
  o: string[];
  m: string[];
  pts?: number[];
};

const QS: Question[] = [
  {
    t: "Commençons par votre site web. Vous en pensez quoi, honnêtement?",
    o: ["J'en ai pas", "Il fait vieux, il me ressemble plus", "Il est correct, mais il fait rien pour moi", "J'en suis fier"],
    m: ["Vous n'avez pas de site", "Votre site ne vous ressemble plus", "Votre site est correct, sans plus", "Vous êtes fier de votre site"],
  },
  {
    t: "Et combien de nouveaux clients vous contactent grâce à lui, dans un mois normal?",
    o: ["Aucun, ou franchement je sais pas", "Un ou deux", "Quelques-uns", "C'est ma principale source de clients"],
    m: [
      "presque personne ne vous contacte grâce à lui",
      "un ou deux clients par mois vous arrivent par là",
      "quelques clients par mois vous arrivent par là",
      "c'est votre principale source de clients",
    ],
  },
  {
    t: "Parlons de vos semaines. Combien d'heures partent dans des tâches qui reviennent tout le temps?",
    s: "Courriels, factures, rappels, retranscrire des infos d'une place à l'autre.",
    o: ["Moins de 3h, ça va", "3 à 8h", "8 à 15h", "Plus de 15h, ça me gruge"],
    m: ["moins de 3 heures par semaine", "3 à 8 heures par semaine", "8 à 15 heures par semaine", "plus de 15 heures par semaine"],
    pts: [0, 1, 2, 3],
  },
  {
    t: "Vos outils actuels, ceux que vous payez déjà. Vous diriez quoi?",
    o: ["Je les utilise à moitié, je compense à la main", "J'en ai plusieurs et rien se parle", "Ça roule correct", "Ça roule très bien"],
    m: [
      "vous utilisez vos outils à moitié en compensant à la main",
      "vos outils ne se parlent pas entre eux",
      "vos outils roulent correctement",
      "vos outils roulent bien",
    ],
  },
  {
    t: "Vos photos et vidéos, elles viennent d'où?",
    o: ["D'une banque d'images ou de mon cellulaire", "D'un photographe, mais ça date", "Récentes et professionnelles", "J'en ai pas vraiment"],
    m: [
      "Vos images viennent d'une banque ou d'un cellulaire",
      "Vos photos professionnelles datent",
      "Vos images sont récentes et professionnelles",
      "Vous n'avez presque pas d'images de votre entreprise",
    ],
    pts: [3, 2, 0, 3],
  },
  {
    t: "Un client compare votre entreprise à un compétiteur en ligne. Qui a l'air le plus crédible?",
    o: ["Le compétiteur, honnêtement", "Difficile à dire", "Moi, sans hésiter"],
    m: [
      "vous savez qu'un compétiteur a l'air plus crédible que vous",
      "vous n'êtes pas sûr d'avoir l'air plus crédible qu'un compétiteur",
      "vous avez l'air crédible en ligne",
    ],
    pts: [3, 1, 0],
  },
  {
    t: "Dernière question. Si on vous redonnait 10 heures par mois, vous les mettriez où?",
    o: ["Trouver des clients", "Mieux servir ceux que j'ai déjà", "Souffler un peu", "Développer de nouveaux projets"],
    m: ["trouver des clients", "mieux servir vos clients actuels", "souffler un peu", "développer de nouveaux projets"],
  },
];

function pts(qi: number, oi: number | undefined): number {
  if (oi == null) return 0;
  const q = QS[qi];
  if (!q) return 0;
  const val = q.pts ? q.pts[oi] : [3, 2, 1, 0][oi];
  return val ?? 0;
}

type Phase = "intro" | "quiz" | "result";

function Page() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [nom, setNom] = useState("");
  const [courriel, setCourriel] = useState("");
  const [sent, setSent] = useState(false);

  const start = () => {
    setPhase("quiz");
    setI(0);
    setAnswers([]);
  };
  const restart = () => {
    setPhase("intro");
    setI(0);
    setAnswers([]);
    setSent(false);
    setNom("");
    setCourriel("");
  };
  const back = () => setI(Math.max(0, i - 1));

  const pick = (oi: number) => {
    const next = answers.slice();
    next[i] = oi;
    setAnswers(next);
    if (i === QS.length - 1) {
      setPhase("result");
    } else {
      setI(i + 1);
    }
  };

  const scores = () => {
    const a = answers;
    return {
      site: pts(0, a[0]) + pts(1, a[1]),
      temps: pts(2, a[2]) + pts(3, a[3]),
      image: pts(4, a[4]) + pts(5, a[5]),
    };
  };

  const pilier = () => {
    const s = scores();
    const max = Math.max(s.site, s.temps, s.image);
    if (s.site + s.temps + s.image <= 3) return "aucun";
    if (s.site === max) return "site";
    if (s.temps === max) return "temps";
    return "image";
  };

  const mir = (qi: number) => {
    const oi = answers[qi];
    return oi == null ? "" : (QS[qi]?.m[oi] ?? "");
  };

  const submit = () => {
    if (nom.trim() && courriel.trim()) setSent(true);
  };

  const q = QS[i];
  const letters = ["A", "B", "C", "D"];
  const badges = ["#0C192F", "#33496C", "#4F8A93", "#6E9AA3"];

  let resTitle = "";
  let resMirror = "";
  let resUnlock = "";
  let resTransition = "";
  let approcheHref = "/";
  let volet = "";
  let bars: { label: string; pct: string; note: string; fill: string; labelColor: string }[] = [];
  let merci = "";
  let merciTexte = "";

  if (phase === "result") {
    const p = pilier();
    const q7 = mir(6);
    const s = scores();
    const note = (v: number) => (v >= 5 ? "à régler" : v >= 3 ? "à surveiller" : "solide");
    const mk = (key: string, label: string, v: number) => ({
      label,
      pct: Math.round((v / 6) * 100) + "%",
      note: note(v),
      fill: key === p ? "#4F8A93" : "rgba(245,243,238,.32)",
      labelColor: key === p ? "#F5F3EE" : "rgba(245,243,238,.5)",
    });
    bars = [mk("site", "Votre site", s.site), mk("temps", "Votre temps", s.temps), mk("image", "Votre image", s.image)];

    if (p === "aucun") {
      resTitle = "Honnêtement, ça a l'air de bien aller.";
      resMirror = "Votre site, vos outils et votre image tiennent la route. Ça arrive, pis c'est une bonne nouvelle.";
      resUnlock = "Si vous voulez qu'on regarde quand même ce qui pourrait aller plus loin, on est là.";
      resTransition = "Vous voulez mettre vos heures à " + q7 + ". Ça commence par un portrait complet de votre entreprise.";
      approcheHref = "/";
      volet = "votre entreprise";
    } else if (p === "site") {
      resTitle = "Ce qui vous freine le plus: votre site.";
      resMirror = mir(0) + ", et " + mir(1) + ". Le travail est là. C'est juste que personne ne le voit.";
      resUnlock = "La bonne nouvelle, c'est que ça se règle. Un site clair qui vous ressemble, c'est quelques semaines de travail, et après il est à vous.";
      resTransition = "Vous voulez mettre vos heures à " + q7 + ". Ça commence par un portrait complet de votre entreprise, pas juste de votre site.";
      approcheHref = "/sites-web";
      volet = "votre site";
    } else if (p === "temps") {
      resTitle = "Ce qui vous freine le plus: votre temps.";
      resMirror = "Vous perdez " + mir(2) + " dans des tâches qui reviennent tout le temps, et " + mir(3) + ". C'est pas un manque d'effort. C'est un manque de système.";
      resUnlock = "La bonne nouvelle, c'est que c'est souvent le frein le plus rapide à régler. Les outils existent déjà. Il faut juste les bons, et les comprendre.";
      resTransition = "Vous voulez mettre vos heures à " + q7 + ". Ça commence par un portrait complet de votre entreprise, pas juste de vos outils.";
      approcheHref = "/automatisation";
      volet = "votre temps";
    } else {
      resTitle = "Ce qui vous freine le plus: votre image.";
      resMirror = mir(4) + ", et " + mir(5) + ". Votre service est probablement meilleur que ce que vos clients voient.";
      resUnlock = "La bonne nouvelle, c'est que quelques bonnes images bien pensées changent l'impression au complet. Sur votre site, sur vos réseaux, partout.";
      resTransition = "Vous voulez mettre vos heures à " + q7 + ". Ça commence par un portrait complet de votre entreprise, pas juste de votre image.";
      approcheHref = "/photo-et-video";
      volet = "votre image";
    }
    const prenom = (nom || "").trim().split(/\s+/)[0] || "";
    merci = "Merci, " + prenom + ". C'est entre bonnes mains.";
    merciTexte = "On vous revient dans les prochains jours pour organiser votre analyse. D'ici là, jetez un oeil à comment on aborde " + volet + ".";
  }

  return (
    <div
      style={{
        position: "relative",
        overflowX: "hidden",
        background: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SiteHeader />

      <section style={{ position: "relative", overflow: "hidden", flex: 1, display: "flex" }}>
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: "-15% -10% auto", height: 1000, pointerEvents: "none" }}
        >
          <div
            style={{
              position: "absolute",
              top: "4%",
              left: "2%",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(51,73,108,.2) 0%, rgba(51,73,108,0) 68%)",
              filter: "blur(44px)",
              animation: "driftA 22s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-4%",
              left: "44%",
              width: 760,
              height: 760,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(79,138,147,.2) 0%, rgba(79,138,147,0) 68%)",
              filter: "blur(48px)",
              animation: "driftB 27s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(255,255,255,0) 50%, #ffffff 98%)",
            }}
          />
        </div>

        <div className="nv-shell" style={{ position: "relative", width: "100%", maxWidth: 960, margin: "0 auto", padding: "64px 32px 100px" }}>
          {phase === "intro" && (
            <div style={{ textAlign: "center", animation: "stepIn .5s cubic-bezier(.2,0,0,1) both" }}>
              <div style={{ margin: "0 auto 34px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50% 50% 50% 8px",
                    transform: "rotate(-45deg)",
                    background: "#0C192F",
                    animation: "popIn .5s cubic-bezier(.2,0,0,1) .05s both",
                  }}
                />
                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50% 50% 50% 8px",
                    transform: "rotate(-45deg)",
                    background: "#33496C",
                    animation: "popIn .5s cubic-bezier(.2,0,0,1) .18s both",
                  }}
                />
                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50% 50% 50% 8px",
                    transform: "rotate(-45deg)",
                    background: "#4F8A93",
                    animation: "popIn .5s cubic-bezier(.2,0,0,1) .31s both",
                  }}
                />
              </div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "clamp(34px,4.6vw,60px)",
                  lineHeight: 1.04,
                  letterSpacing: "-.035em",
                  textWrap: "balance",
                }}
              >
                On vous pose sept questions.
              </h1>
              <p
                style={{
                  margin: "24px auto 0",
                  maxWidth: "50ch",
                  fontSize: 18,
                  lineHeight: 1.62,
                  color: "rgba(12,25,47,.62)",
                  textWrap: "pretty",
                }}
              >
                Répondez comme vous le pensez, pas comme vous aimeriez que ce soit. C'est là que ça devient utile.
              </p>
              <div style={{ margin: "36px 0 0", display: "flex", justifyContent: "center" }}>
                <button onClick={start} className="nv-btn-primary-round" style={{ padding: "18px 40px" }}>
                  C'est parti
                </button>
              </div>
            </div>
          )}

          {phase === "quiz" && q && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {QS.map((_, k) => (
                  <span
                    key={k}
                    style={{
                      flex: 1,
                      height: 5,
                      borderRadius: 999,
                      background: k < i ? "#33496C" : k === i ? "#0C192F" : "rgba(12,25,47,.12)",
                      transition: "background .45s cubic-bezier(.2,0,0,1)",
                    }}
                  />
                ))}
                <span
                  style={{
                    marginLeft: 10,
                    fontFamily: "var(--font-display)",
                    fontSize: 12.5,
                    color: "rgba(12,25,47,.42)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {i + 1} / 7
                </span>
              </div>

              <div style={{ animation: "stepIn .45s cubic-bezier(.2,0,0,1) both" }}>
                {i === 4 && (
                  <div
                    style={{
                      margin: "34px 0 -18px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 16px",
                      borderRadius: 999,
                      background: "rgba(79,138,147,.14)",
                    }}
                  >
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#4F8A93" }} />
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 13.5,
                        letterSpacing: "-.01em",
                        color: "#33496C",
                      }}
                    >
                      Plus que trois. Vous êtes bon là-dedans.
                    </span>
                  </div>
                )}

                <div style={{ margin: "44px 0 0", display: "flex", alignItems: "flex-start", gap: 24 }}>
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(40px,5vw,64px)",
                      lineHeight: 0.9,
                      letterSpacing: "-.04em",
                      color: "rgba(12,25,47,.13)",
                    }}
                  >
                    {"0" + (i + 1)}
                  </span>
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "clamp(25px,3.1vw,38px)",
                        lineHeight: 1.12,
                        letterSpacing: "-.03em",
                        textWrap: "balance",
                      }}
                    >
                      {q.t}
                    </h2>
                    {q.s && (
                      <p style={{ margin: "14px 0 0", maxWidth: "56ch", fontSize: 16.5, lineHeight: 1.6, color: "rgba(12,25,47,.58)" }}>
                        {q.s}
                      </p>
                    )}
                  </div>
                </div>

                <div className="nv-grid" style={{ margin: "36px 0 0", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {q.o.map((label, oi) => (
                    <button key={oi} onClick={() => pick(oi)} className="nv-card-hover" style={optionStyle}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 30,
                          height: 30,
                          borderRadius: 10,
                          background: badges[oi],
                          fontFamily: "var(--font-display)",
                          fontSize: 13,
                          color: "#F5F3EE",
                        }}
                      >
                        {letters[oi]}
                      </span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {i > 0 && (
                  <button onClick={back} className="nv-link-fade" style={backLinkStyle}>
                    ← Revenir
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === "result" && (
            <div style={{ animation: "stepIn .5s cubic-bezier(.2,0,0,1) both" }}>
              <div
                style={{
                  padding: "44px 44px 40px",
                  borderRadius: 26,
                  background: "#0C192F",
                  color: "#F5F3EE",
                  boxShadow: "0 40px 80px -50px rgba(12,25,47,1)",
                }}
              >
                <p style={{ margin: "0 0 20px", fontSize: 11.5, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(245,243,238,.5)" }}>
                  Votre résultat
                </p>
                <h2
                  style={{
                    margin: 0,
                    maxWidth: "20ch",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "clamp(30px,4vw,50px)",
                    lineHeight: 1.04,
                    letterSpacing: "-.035em",
                    textWrap: "balance",
                  }}
                >
                  {resTitle}
                </h2>

                <div style={{ margin: "40px 0 0", display: "flex", flexDirection: "column", gap: 18 }}>
                  {bars.map((b, k) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <span
                        style={{
                          width: 96,
                          flexShrink: 0,
                          fontFamily: "var(--font-display)",
                          fontSize: 14,
                          letterSpacing: "-.01em",
                          color: b.labelColor,
                        }}
                      >
                        {b.label}
                      </span>
                      <span style={{ flex: 1, height: 12, borderRadius: 999, background: "rgba(245,243,238,.12)", overflow: "hidden" }}>
                        <span
                          style={{
                            display: "block",
                            height: "100%",
                            width: b.pct,
                            borderRadius: 999,
                            background: b.fill,
                            transition: "width .9s cubic-bezier(.2,0,0,1)",
                          }}
                        />
                      </span>
                      <span
                        style={{
                          width: 74,
                          flexShrink: 0,
                          textAlign: "right",
                          fontFamily: "var(--font-display)",
                          fontSize: 13,
                          color: b.labelColor,
                        }}
                      >
                        {b.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="nv-grid-3" style={{ margin: "16px 0 0", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={cardStyle}>
                  <p style={cardLabelStyle}>Ce qu'on voit</p>
                  <p style={cardTextStyle}>{resMirror}</p>
                </div>
                <div style={cardHighlightStyle}>
                  <p style={{ ...cardLabelStyle, color: "#33496C" }}>La bonne nouvelle</p>
                  <p style={cardTextStyle}>{resUnlock}</p>
                </div>
                <div style={cardStyle}>
                  <p style={cardLabelStyle}>La suite</p>
                  <p style={cardTextStyle}>{resTransition}</p>
                </div>
              </div>

              {!sent && (
                <div style={{ margin: "16px 0 0", padding: "38px 40px", borderRadius: 24, border: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
                  <h3
                    style={{
                      margin: 0,
                      maxWidth: "24ch",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "clamp(22px,2.5vw,30px)",
                      lineHeight: 1.12,
                      letterSpacing: "-.025em",
                    }}
                  >
                    Envoyez-moi une analyse globale de mon entreprise.
                  </h3>
                  <p style={{ margin: "16px 0 0", maxWidth: "62ch", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.62)" }}>
                    On regarde votre situation au complet, votre site, votre temps, votre image, et on vous revient personnellement avec ce qu'on ferait à votre place. Gratuit, sans engagement.
                  </p>
                  <div className="nv-grid" style={{ margin: "26px 0 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Nom complet"
                      style={inputStyle}
                    />
                    <input
                      value={courriel}
                      onChange={(e) => setCourriel(e.target.value)}
                      placeholder="Courriel"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ margin: "18px 0 0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
                    <button onClick={submit} className="nv-btn-primary-round" style={{ padding: "16px 32px", fontSize: 15 }}>
                      Recevoir mon analyse
                    </button>
                    <p style={{ margin: 0, maxWidth: "42ch", fontSize: 13.5, lineHeight: 1.55, color: "rgba(12,25,47,.5)" }}>
                      Une vraie personne vous répond. Aucun envoi automatisé, aucune relance à répétition.
                    </p>
                  </div>
                </div>
              )}

              {sent && (
                <div
                  style={{
                    margin: "16px 0 0",
                    padding: 40,
                    borderRadius: 24,
                    background: "#0C192F",
                    color: "#F5F3EE",
                    animation: "stepIn .45s cubic-bezier(.2,0,0,1) both",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: 40,
                      height: 40,
                      borderRadius: "50% 50% 50% 7px",
                      transform: "rotate(-45deg)",
                      background: "#4F8A93",
                      animation: "popIn .5s cubic-bezier(.2,0,0,1) .1s both",
                    }}
                  />
                  <h3
                    style={{
                      margin: "30px 0 0",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "clamp(24px,2.8vw,34px)",
                      lineHeight: 1.1,
                      letterSpacing: "-.025em",
                    }}
                  >
                    {merci}
                  </h3>
                  <p style={{ margin: "16px 0 0", maxWidth: "62ch", fontSize: 16, lineHeight: 1.65, color: "rgba(245,243,238,.7)" }}>
                    {merciTexte}
                  </p>
                  <Link href={approcheHref} className="nv-btn-cream" style={{ display: "inline-block", marginTop: 26, padding: "15px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600 }}>
                    Voir notre approche →
                  </Link>
                </div>
              )}

              <button onClick={restart} className="nv-link-fade" style={backLinkStyle}>
                Refaire le quiz
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="nv-shell" style={{ padding: "56px 32px 40px", borderTop: "1px solid rgba(12,25,47,.08)" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
          <img loading="lazy" decoding="async" src={logoStack.url} alt="Norvika" style={{ height: 78, width: "auto", display: "block" }} />
          <div style={{ fontSize: 12.5, color: "rgba(12,25,47,.45)" }}>© 2026 Norvika</div>
        </div>
      </footer>
    </div>
  );
}

const optionStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 112,
  padding: "24px 26px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  textAlign: "left",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,.85)",
  background: "linear-gradient(150deg, rgba(255,255,255,.86), rgba(255,255,255,.52))",
  backdropFilter: "blur(26px) saturate(180%)",
  WebkitBackdropFilter: "blur(26px) saturate(180%)",
  boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 26px 60px -46px rgba(12,25,47,.9)",
  fontFamily: "var(--font-body)",
  fontSize: 17,
  lineHeight: 1.45,
  color: "rgba(12,25,47,.84)",
  cursor: "pointer",
  transition: "transform .22s cubic-bezier(.2,0,0,1), border-color .22s, box-shadow .22s",
};

const backLinkStyle: React.CSSProperties = {
  margin: "30px 0 0",
  padding: 0,
  border: 0,
  background: "none",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  color: "rgba(12,25,47,.45)",
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  padding: "28px 26px",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,.85)",
  background: "linear-gradient(150deg, rgba(255,255,255,.84), rgba(255,255,255,.5))",
  backdropFilter: "blur(26px) saturate(180%)",
  WebkitBackdropFilter: "blur(26px) saturate(180%)",
  boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 28px 64px -46px rgba(12,25,47,.9)",
};

const cardHighlightStyle: React.CSSProperties = {
  padding: "28px 26px",
  borderRadius: 20,
  border: "1px solid rgba(79,138,147,.28)",
  background: "linear-gradient(150deg, rgba(79,138,147,.16), rgba(79,138,147,.06))",
  backdropFilter: "blur(26px) saturate(180%)",
  WebkitBackdropFilter: "blur(26px) saturate(180%)",
  boxShadow: "0 1px 0 rgba(255,255,255,.8) inset, 0 28px 64px -46px rgba(12,25,47,.9)",
};

const cardLabelStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 11,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "rgba(12,25,47,.4)",
};

const cardTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.6,
  color: "rgba(12,25,47,.78)",
};

const inputStyle: React.CSSProperties = {
  padding: "16px 18px",
  borderRadius: 12,
  border: "1px solid rgba(12,25,47,.14)",
  background: "#fff",
  color: "#0C192F",
  fontFamily: "var(--font-body)",
  fontSize: 15.5,
};

export default Page;

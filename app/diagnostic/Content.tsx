"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { AntiRobot, MESSAGE_JETON_ABSENT, attendreJetonAntiRobot, reinitialiserAntiRobot } from "@/components/site/AntiRobot";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useContenuGlobal } from "@/components/site/ContenuGlobal";
import { MentionCollecte } from "@/components/site/MentionCollecte";
import { MentionDroits } from "@/components/site/MentionDroits";
import { CHAMP_JETON } from "@/lib/anti-robot-commun";
import type { PageDiagnostic, Profil } from "@/lib/types-contenu";
/** Remplace {cle} dans un gabarit du Studio (ex. : « Merci, {prenom}. »). */
function remplir(gabarit: string, valeurs: Record<string, string>): string {
  return gabarit.replace(/\{(\w+)\}/g, (tout, cle: string) => (cle in valeurs ? valeurs[cle] : tout));
}

type Phase = "intro" | "quiz" | "result";

// Tout le texte (questions, réponses, résultats) vient de la page « Diagnostic » du Studio.
// Le calcul est celui d'avant : les points de chaque réponse sont maintenant écrits dans le
// Studio (0 à 3) au lieu d'un barème [3, 2, 1, 0] implicite dans le code.
function Page({ page }: { page: PageDiagnostic }) {
  // « Envoi en cours… » : le même libellé que le bandeau de contact (Studio, « Bloc de contact »).
  const { parametres, blocContact } = useContenuGlobal();
  const logoStack = parametres.logoPied;
  const QS = page.questions.map((q) => ({
    t: q.question,
    s: q.precision ?? undefined,
    o: q.reponses.map((r) => r.libelle),
    m: q.reponses.map((r) => r.miroir),
    pts: q.reponses.map((r) => r.points),
  }));
  const pts = (qi: number, oi: number | undefined): number => {
    if (oi == null) return 0;
    return QS[qi]?.pts[oi] ?? 0;
  };
  const [phase, setPhase] = useState<Phase>("intro");
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [nom, setNom] = useState("");
  const [courriel, setCourriel] = useState("");
  const [sent, setSent] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Clavier et lecteurs d'écran : à chaque étape, le focus va au titre qui vient d'apparaître
  // (la question, le résultat, le remerciement). Sans ça, il retombait sur <body> et il fallait
  // retraverser tout l'en-tête. Le titre porte tabIndex={-1} : focalisable par le code seulement.
  const titreEtape = useRef<HTMLHeadingElement>(null);
  const titreMerci = useRef<HTMLHeadingElement>(null);
  const aBouge = useRef(false);
  useEffect(() => {
    if (!aBouge.current) return; // pas au chargement de la page : seulement après un choix
    titreEtape.current?.focus();
  }, [phase, i]);
  useEffect(() => {
    if (sent) titreMerci.current?.focus();
  }, [sent]);

  const start = () => {
    aBouge.current = true;
    setPhase("quiz");
    setI(0);
    setAnswers([]);
  };
  const restart = () => {
    aBouge.current = false;
    setErreur(null);
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

  // Le résumé envoyé avec la demande d'analyse : le résultat, les trois barres, et chaque question
  // avec la réponse choisie, tels que la personne les a vus. Rempli seulement à l'écran du résultat.
  let resume: { resultat: string; barres: string[]; reponses: { question: string; reponse: string }[] } | null = null;

  // Envoi réel (avant le 2026-11-16, ce bouton affichait « Merci » sans rien envoyer).
  // Même chemin que les autres formulaires : /api/contact vérifie Turnstile côté serveur AVANT la
  // limite de débit, l'écriture dans Supabase et le courriel à info@norvika.ca.
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (envoi) return;
    setErreur(null);
    const formulaire = e.currentTarget;
    if (!nom.trim() || !courriel.trim()) {
      setErreur("Votre nom et votre courriel suffisent.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel.trim())) {
      setErreur("Ce courriel ne semble pas valide.");
      return;
    }
    setEnvoi(true);
    // Le jeton anti-robot naît quelques secondes après l'arrivée sur le formulaire : on l'attend,
    // le bouton montrant déjà l'envoi, plutôt que de refuser (voir attendreJetonAntiRobot).
    const jeton = await attendreJetonAntiRobot(formulaire);
    if (!jeton) {
      setEnvoi(false);
      setErreur(MESSAGE_JETON_ABSENT);
      return;
    }
    let messageErreur: string | null = null;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim(), courriel: courriel.trim(), diagnostic: resume, [CHAMP_JETON]: jeton }),
      });
      if (!res.ok) {
        // Le serveur explique lui-même le refus (champ invalide, anti-robot, trop d'envois).
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        messageErreur = data?.error ?? `Une erreur est survenue. Réessayez ou écrivez-nous à ${parametres.courriel}.`;
      }
    } catch {
      messageErreur = `Une erreur est survenue. Réessayez ou écrivez-nous à ${parametres.courriel}.`;
    }
    setEnvoi(false);
    reinitialiserAntiRobot(formulaire);
    if (messageErreur) {
      setErreur(messageErreur);
      return;
    }
    setSent(true);
  }

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
    const note = (v: number) => (v >= 5 ? page.noteHaute : v >= 3 ? page.noteMoyenne : page.noteBasse);
    const mk = (key: string, label: string, v: number) => ({
      label,
      pct: Math.round((v / 6) * 100) + "%",
      note: note(v),
      fill: key === p ? "#4F8A93" : "rgba(245,243,238,.32)",
      labelColor: key === p ? "#F5F3EE" : "rgba(245,243,238,.5)",
    });
    bars = [mk("site", page.barreSite, s.site), mk("temps", page.barreTemps, s.temps), mk("image", page.barreImage, s.image)];

    const profil: Profil =
      p === "aucun" ? page.profilAucun : p === "site" ? page.profilSite : p === "temps" ? page.profilTemps : page.profilImage;
    const reponses: Record<string, string> = {};
    QS.forEach((_, k) => {
      reponses[`reponse${k + 1}`] = mir(k);
    });
    resTitle = profil.titre;
    resMirror = remplir(profil.miroir, reponses);
    resUnlock = remplir(profil.bonneNouvelle, reponses);
    resTransition = remplir(profil.suite, { ...reponses, reponse7: q7 });
    approcheHref = profil.lien;
    volet = profil.volet;
    const prenom = (nom || "").trim().split(/\s+/)[0] || "";
    merci = remplir(page.merciTitre, { prenom });
    merciTexte = remplir(page.merciTexte, { volet });
    resume = {
      resultat: resTitle,
      barres: bars.map((b) => `${b.label} : ${b.pct} (${b.note})`),
      reponses: QS.map((question, k) => ({ question: question.t, reponse: question.o[answers[k] ?? -1] ?? "" })),
    };
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

      {/* Repère « contenu principal » et cible du lien d'évitement de l'en-tête. */}
      <main id="contenu" style={{ flex: 1, display: "flex" }}>
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
            <div style={{ textAlign: "center", animation: "nvHero .5s cubic-bezier(.2,0,0,1) both" }}>
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
                {page.h1}
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
                {page.intro}
              </p>
              <div style={{ margin: "36px 0 0", display: "flex", justifyContent: "center" }}>
                <button onClick={start} className="nv-btn-primary-round" style={{ padding: "18px 40px" }}>
                  {page.boutonDebut}
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
                    aria-hidden="true"
                    style={{
                      flex: 1,
                      height: 5,
                      borderRadius: 999,
                      background: k < i ? "#33496C" : k === i ? "#0C192F" : "rgba(12,25,47,.12)",
                      transition: "background .45s cubic-bezier(.2,0,0,1)",
                    }}
                  />
                ))}
                {/* Région « status » (aria-live polite) : la progression est annoncée à chaque question. */}
                <span
                  role="status"
                  style={{
                    marginLeft: 10,
                    fontFamily: "var(--font-display)",
                    fontSize: 12.5,
                    color: "rgba(12,25,47,.42)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {i + 1} / {QS.length}
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
                      {page.encouragement}
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
                      ref={titreEtape}
                      tabIndex={-1}
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
                    {page.boutonRetour}
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
                {/* Plus de sur-titre « Votre résultat » (règle d'agence 1) : arrivé au bout des sept
                    questions, le titre du profil se lit comme le résultat. */}
                <h2
                  ref={titreEtape}
                  tabIndex={-1}
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
                  <p style={cardLabelStyle}>{page.carteMiroir}</p>
                  <p style={cardTextStyle}>{resMirror}</p>
                </div>
                <div style={cardHighlightStyle}>
                  <p style={{ ...cardLabelStyle, color: "#33496C" }}>{page.carteBonneNouvelle}</p>
                  <p style={cardTextStyle}>{resUnlock}</p>
                </div>
                <div style={cardStyle}>
                  <p style={cardLabelStyle}>{page.carteSuite}</p>
                  <p style={cardTextStyle}>{resTransition}</p>
                </div>
              </div>

              {!sent && (
                <form
                  onSubmit={submit}
                  noValidate
                  style={{ margin: "16px 0 0", padding: "38px 40px", borderRadius: 24, border: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}
                >
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
                    {page.formTitre}
                  </h3>
                  <p style={{ margin: "16px 0 0", maxWidth: "62ch", fontSize: 16, lineHeight: 1.62, color: "rgba(12,25,47,.62)" }}>
                    {page.formTexte}
                  </p>
                  <div className="nv-grid" style={{ margin: "26px 0 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label style={{ display: "block" }}>
                      <span style={etiquetteStyle}>{page.formNom}</span>
                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        maxLength={100}
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        aria-invalid={erreur !== null && !nom.trim() ? true : undefined}
                        style={inputStyle}
                      />
                    </label>
                    <label style={{ display: "block" }}>
                      <span style={etiquetteStyle}>{page.formCourriel}</span>
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        maxLength={255}
                        value={courriel}
                        onChange={(e) => setCourriel(e.target.value)}
                        aria-invalid={erreur !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel.trim()) ? true : undefined}
                        style={inputStyle}
                      />
                    </label>
                  </div>
                  <AntiRobot />
                  {erreur && (
                    <p role="alert" style={{ margin: "16px 0 0", fontSize: 14.5, lineHeight: 1.5, fontWeight: 500, color: "var(--destructive)" }}>
                      {erreur}
                    </p>
                  )}
                  <div style={{ margin: "18px 0 0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
                    {/* aria-disabled plutôt que disabled : un bouton désactivé perd le focus, qui retombait sur
                        <body> après une erreur. Le double envoi est bloqué dans submit(). */}
                    <button
                      type="submit"
                      aria-disabled={envoi || undefined}
                      className="nv-btn-primary-round"
                      style={{ padding: "16px 32px", fontSize: 15, opacity: envoi ? 0.7 : 1 }}
                    >
                      {envoi ? blocContact.boutonEnvoi : page.formBouton}
                    </button>
                    <p style={{ margin: 0, maxWidth: "42ch", fontSize: 13.5, lineHeight: 1.55, color: "rgba(12,25,47,.5)" }}>
                      {page.formNote}
                    </p>
                  </div>
                  <div style={{ margin: "20px 0 0", color: "rgba(12,25,47,.68)" }}>
                    <MentionCollecte id="mention-collecte-diagnostic" />
                  </div>
                </form>
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
                    ref={titreMerci}
                    tabIndex={-1}
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
                    {page.boutonApproche}
                  </Link>
                </div>
              )}

              <button onClick={restart} className="nv-link-fade" style={backLinkStyle}>
                {page.boutonRefaire}
              </button>
            </div>
          )}
        </div>
      </section>
      </main>

      <footer className="nv-shell" style={{ padding: "56px 32px 40px", borderTop: "1px solid rgba(12,25,47,.08)" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
          <img loading="lazy" decoding="async" src={logoStack.url} alt={logoStack.alt ?? ""} style={{ height: 78, width: "auto", display: "block" }} />
          {/* .62 et non plus .45 : 4,97:1 de contraste sur blanc au lieu de 2,92:1 (WCAG AA). */}
          <div style={{ fontSize: 12.5, color: "rgba(12,25,47,.62)" }}>
            <MentionDroits court />
          </div>
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
  // .62 et non plus .45 : 4,97:1 de contraste sur blanc au lieu de 2,92:1 (WCAG AA).
  color: "rgba(12,25,47,.62)",
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

const etiquetteStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontSize: 14,
  fontWeight: 600,
  color: "#0C192F",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px 18px",
  borderRadius: 12,
  border: "1px solid rgba(12,25,47,.14)",
  background: "#fff",
  color: "#0C192F",
  fontFamily: "var(--font-body)",
  fontSize: 15.5,
};

export default Page;

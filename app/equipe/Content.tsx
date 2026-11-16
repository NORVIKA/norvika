"use client";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useReveal } from "@/lib/useReveal";
import { AutresPages } from "@/components/site/AutresPages";
import { positionFocale, visible, type Membre, type PageEquipe } from "@/lib/types-contenu";
// Tout le texte vient de la page « L'équipe » et des « Membres de l'équipe » du Studio.
function Page({ page, membres }: { page: PageEquipe; membres: Membre[] }) {
  useReveal();
  const PEOPLE = membres;
  const duoStudio = page.ensemble.photo;

  return (
    <div style={{ position: "relative", overflowX: "hidden", background: "#fff" }}>
      <SiteHeader />
      {/* Repère « contenu principal » (lecteurs d'écran) et cible du lien d'évitement de l'en-tête. */}
      <main id="contenu">

      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(12,25,47,.1)" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: "-20% -10% auto", height: 800, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "6%", left: "8%", width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle, rgba(51,73,108,.16) 0%, rgba(51,73,108,0) 68%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", top: "0%", left: "48%", width: 660, height: 660, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,138,147,.15) 0%, rgba(79,138,147,0) 68%)", filter: "blur(44px)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0) 40%, #ffffff 96%)" }} />
        </div>
        <div className="nv-shell" style={{ position: "relative", maxWidth: 920, margin: "0 auto", padding: "84px 32px 70px", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(34px,4.4vw,58px)", lineHeight: 1.06, letterSpacing: "-.035em" }}>
            {page.h1}
          </h1>
          <p style={{ margin: "26px auto 0", maxWidth: "60ch", fontSize: 18, lineHeight: 1.62, color: "rgba(12,25,47,.64)" }}>
            {page.intro}
          </p>
        </div>
      </section>

      {visible(page.origine) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-grid nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px", display: "grid", gridTemplateColumns: ".8fr 1.2fr", gap: 56, alignItems: "start" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            {page.origine.titre}
          </h2>
          <div data-reveal style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {page.origine.texte.map((p, i) => (
              <p key={i} style={{ margin: 0, maxWidth: "68ch", fontSize: 17, lineHeight: 1.7, color: "rgba(12,25,47,.7)" }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {visible(page.quiFaitQuoi) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: "0 0 44px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            {page.quiFaitQuoi.titre}
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {PEOPLE.map((p) => (
              <div
                key={p.nom}
                data-reveal
                className="nv-text-card"
                style={{
                  overflow: "hidden",
                  borderRadius: 22,
                  border: "1px solid rgba(255,255,255,.8)",
                  background: "linear-gradient(150deg, rgba(255,255,255,.76), rgba(255,255,255,.44))",
                  backdropFilter: "blur(28px) saturate(180%)",
                  WebkitBackdropFilter: "blur(28px) saturate(180%)",
                  boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -46px rgba(12,25,47,.8)",
                }}
              >
                <div style={{ padding: "30px 30px 36px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {p.photo ? (
                      <img
                        src={p.photo.url}
                        alt={p.nom}
                        loading="lazy"
                        style={{ width: 78, height: 78, flex: "0 0 auto", borderRadius: "50%", objectFit: "cover", objectPosition: positionFocale(p.photo, "center 22%"), display: "block" }}
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        style={{
                          width: 78,
                          height: 78,
                          flex: "0 0 auto",
                          borderRadius: "50%",
                          background: "rgba(12,25,47,.06)",
                          border: "1px dashed rgba(12,25,47,.2)",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 10.5,
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                          color: "rgba(12,25,47,.4)",
                          textAlign: "center",
                          lineHeight: 1.3,
                          padding: 6,
                        }}
                      >
                        {page.quiFaitQuoi.photoAVenir}
                      </div>
                    )}
                    <div>
                      <p style={{ margin: 0, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(12,25,47,.45)" }}>
                        {p.role}
                      </p>
                      <h3 style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, letterSpacing: "-.02em" }}>
                        {p.nom}
                      </h3>
                    </div>
                  </div>
                  <p style={{ margin: "18px 0 0", fontSize: 16, lineHeight: 1.66, color: "rgba(12,25,47,.68)" }}>{p.texte}</p>
                </div>

              </div>
            ))}
          </div>

          {visible(page.ensemble) ? (
          <div
            data-reveal
            className="nv-text-card"
            style={{
              marginTop: 20,
              padding: "34px 36px",
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,.8)",
              background: "linear-gradient(150deg, rgba(255,255,255,.76), rgba(255,255,255,.44))",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              boxShadow: "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -46px rgba(12,25,47,.8)",
            }}
          >
            <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,260px) 1fr", gap: 30, alignItems: "center" }}>
              <img
                src={duoStudio.url}
                alt={duoStudio.alt ?? ""}
                loading="lazy"
                style={{ width: "100%", height: "auto", borderRadius: 18, display: "block" }}
              />
              <div>
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, letterSpacing: "-.02em" }}>
                  {page.ensemble.titre}
                </h3>
                <p style={{ margin: "16px 0 0", maxWidth: "60ch", fontSize: 16.5, lineHeight: 1.68, color: "rgba(12,25,47,.68)" }}>
                  {page.ensemble.texte}
                </p>
              </div>
            </div>
          </div>
          ) : null}

        </div>
      </section>
      ) : null}

      {visible(page.croyances) ? (
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: "0 0 44px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            {page.croyances.titre}
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {page.croyances.cartes.map((item, i) => (
              <div
                key={i}
                data-reveal
               
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

      {visible(page.conclusion) ? (
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: "-10%", left: "40%", width: 620, height: 620, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(51,73,108,.12) 0%, rgba(51,73,108,0) 68%)", filter: "blur(40px)" }} />
        <div className="nv-grid nv-shell" style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "92px 32px", display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 56, alignItems: "start" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            {page.conclusion.titre}
          </h2>
          <p style={{ margin: 0, maxWidth: "64ch", fontSize: 17.5, lineHeight: 1.7, color: "rgba(12,25,47,.7)" }}>
            {page.conclusion.texte}
          </p>
        </div>
      </section>
      ) : null}

      <AutresPages courante="/equipe" />
      </main>
      <SiteFooter />
    </div>
  );
}

export default Page;

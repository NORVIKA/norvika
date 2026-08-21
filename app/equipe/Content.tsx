"use client";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useReveal } from "@/lib/useReveal";
const lauEtWill = { url: "/assets/lau-et-will-2.webp" };
const lauPortrait = { url: "/assets/lau-2.webp" };
const willPortrait = { url: "/assets/will.webp" };
const duoStudio = { url: "/assets/lau-et-will-2-2.webp" };
const ORIGIN = [
  "Norvika, à la base, c'était pas dans nos plans. On était déjà en affaires depuis quelques années, et on travaillait ensemble dans une agence où on faisait entre autres de la conception web. Un jour, on nous annonce que notre département ferme. On avait environ une semaine pour décider de la suite.",
  "On aurait pu retourner travailler ailleurs. Mais on s'est dit qu'on avait déjà les compétences, l'expérience, et surtout une façon de travailler qu'on voulait développer à notre manière. C'est là qu'on a créé Norvika.",
  "Au début, on a mis beaucoup d'énergie sur les sites web et la photo-vidéo, parce que c'était des besoins qu'on voyait constamment chez les entreprises autour de nous. Mais assez vite, on s'est rendu compte que le problème allait souvent plus loin. Un site, c'est une chose. Après, il faut avoir les bons outils, les connecter ensemble, les comprendre, puis être capable de les utiliser pour de vrai. C'est vers ça qu'on bâtit Norvika aujourd'hui.",
];

const PEOPLE = [
  {
    name: "Laurianne",
    role: "Direction, design et relation client",
    photo: lauPortrait.url,
    text: "C'est elle qui donne la direction. Elle mène l'appel de 30 minutes, évalue votre situation, et pense à ce que votre entreprise a vraiment besoin avant de penser à ce qu'on pourrait vous vendre. Elle conçoit le design de votre site, bâtit la stratégie de contenu, et reste votre point de contact du début à la fin. Si quelque chose accroche, c'est à elle que vous écrivez.",
  },
  {
    name: "William",
    role: "Développement, systèmes et technique",
    photo: willPortrait.url,
    text: "C'est lui qui fait que ça marche. Formé en programmation, il bâtit les sites, les intégrations, les systèmes, et il s'occupe de tout le côté technique de la photo, de la vidéo et du montage. Il aime les choses qui roulent proprement, sans surprise, et il prend le temps de vous expliquer comment ça fonctionne, pour que vous n'ayez pas besoin de lui à chaque fois.",
  },
];


const BELIEFS = [
  {
    title: "On part du problème, jamais du service.",
    desc: "On commence par comprendre ce qui vous freine. La solution vient après, et parfois c'est pas celle à laquelle vous pensiez.",
  },
  {
    title: "On règle le vrai problème avec vous, jamais à votre place.",
    desc: "Vous restez aux commandes. On vous montre comment ça marche, pour que ça vous appartienne vraiment.",
  },
  {
    title: "On dit les vraies affaires.",
    desc: "Si un outil n'est pas nécessaire, on vous le dit. Si un projet devrait attendre, on vous le dit aussi. On préfère perdre une vente que vous vendre quelque chose d'inutile.",
  },
  {
    title: "On tient nos engagements.",
    desc: "Ce qu'on promet, on le livre. Pas de surprise sur la facture, pas de surprise sur le délai.",
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
        <div className="nv-shell" style={{ position: "relative", maxWidth: 920, margin: "0 auto", padding: "84px 32px 70px", textAlign: "center" }}>
          <p style={{ margin: "0 0 18px", fontSize: 11.5, letterSpacing: ".2em", textTransform: "uppercase", color: "#33496C", fontWeight: 600 }}>L'équipe</p>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(34px,4.4vw,58px)", lineHeight: 1.06, letterSpacing: "-.035em" }}>
            On rattache l'humain à l'efficience.
          </h1>
          <p style={{ margin: "26px auto 0", maxWidth: "60ch", fontSize: 18, lineHeight: 1.62, color: "rgba(12,25,47,.64)" }}>
            Norvika, c'est Laurianne et William. Deux façons de penser qui se complètent, un même but: que la technologie vous serve, pas l'inverse.
          </p>
        </div>
      </section>

      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-grid nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px", display: "grid", gridTemplateColumns: ".8fr 1.2fr", gap: 56, alignItems: "start" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            Comment Norvika est née
          </h2>
          <div data-reveal style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {ORIGIN.map((p, i) => (
              <p key={i} style={{ margin: 0, maxWidth: "68ch", fontSize: 17, lineHeight: 1.7, color: "rgba(12,25,47,.7)" }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#EEF2FA" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: "0 0 44px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            Qui fait quoi
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {PEOPLE.map((p) => (
              <div
                key={p.name}
                data-reveal
                className="nv-card-hover nv-text-card"
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
                        src={p.photo}
                        alt={p.name}
                        loading="lazy"
                        style={{ width: 78, height: 78, flex: "0 0 auto", borderRadius: "50%", objectFit: "cover", objectPosition: "center 22%", display: "block" }}
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
                        Photo à venir
                      </div>
                    )}
                    <div>
                      <p style={{ margin: 0, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(12,25,47,.45)" }}>
                        {p.role}
                      </p>
                      <h3 style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, letterSpacing: "-.02em" }}>
                        {p.name}
                      </h3>
                    </div>
                  </div>
                  <p style={{ margin: "18px 0 0", fontSize: 16, lineHeight: 1.66, color: "rgba(12,25,47,.68)" }}>{p.text}</p>
                </div>

              </div>
            ))}
          </div>

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
                alt="Laurianne et William en studio"
                loading="lazy"
                style={{ width: "100%", height: "auto", borderRadius: 18, display: "block" }}
              />
              <div>
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, letterSpacing: "-.02em" }}>
                  Ensemble
                </h3>
                <p style={{ margin: "16px 0 0", maxWidth: "60ch", fontSize: 16.5, lineHeight: 1.68, color: "rgba(12,25,47,.68)" }}>
                  Elle voit où on va, il fait en sorte qu'on s'y rende. Elle pense au client et au résultat, il pense au système et à la fiabilité. Sur les tournages, sur les formations, sur les projets qui touchent à tout en même temps, on est deux, et c'est comme ça qu'on livre des projets qui tiennent la route.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "92px 32px" }}>
          <h2 style={{ margin: "0 0 44px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            Ce en quoi on croit
          </h2>
          <div className="nv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {BELIEFS.map((item, i) => (
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
        <div className="nv-grid nv-shell" style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "92px 32px", display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 56, alignItems: "start" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em" }}>
            La technologie devrait vous simplifier la vie. Pas vous en rajouter.
          </h2>
          <p style={{ margin: 0, maxWidth: "64ch", fontSize: 17.5, lineHeight: 1.7, color: "rgba(12,25,47,.7)" }}>
            Notre travail, c'est de vous redonner du temps pour ce qui compte: vos clients, votre équipe, vos soupers en famille. Pas en vous vendant des outils, mais en vous aidant à comprendre ceux qui vous conviennent, et à les faire rouler.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export default Page;

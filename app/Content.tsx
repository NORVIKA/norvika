"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useReveal } from "@/lib/useReveal";
import { Roadmap, type RoadStep } from "@/components/site/Roadmap";
import { LIEN_RDV } from "@/lib/liens";
import { AutresPages } from "@/components/site/AutresPages";
const lauEtWill = { url: "/assets/lau-et-will-2.webp" };
const logoDesjardins = { url: "/assets/logo-desjardins.webp" };
const logoAnytime = { url: "/assets/logo-anytime.webp" };
const logoSupergolf = { url: "/assets/logo-supergolf.webp" };
const SERVICES = [
  {
    num: "01",
    title: "Sites web",
    to: "/sites-web" as const,
    lead: "Un site clair, à la hauteur de votre travail.",
    more: "On vous en montre un aperçu avant même que vous décidiez quoi que ce soit. Et une fois livré, il est à vous: aucuns frais mensuels.",
  },
  {
    num: "02",
    title: "Automatisation",
    to: "/automatisation" as const,
    lead: "Une partie de vos semaines part dans des tâches qui vous font pas avancer.",
    more: "On trouve les bons outils pour votre réalité, on les intègre avec vous, et on vous accompagne jusqu'à ce que ça roule.",
  },
  {
    num: "03",
    title: "Photo et vidéo",
    to: "/photo-et-video" as const,
    lead: "Vos photos et vidéos ne rendent pas justice à ce que vous faites.",
    more: "On capte votre travail comme il mérite d'être vu.",
  },
  {
    num: "04",
    title: "Formation",
    to: "/formation" as const,
    lead: "Vos outils, vous aimeriez savoir les utiliser vous-mêmes.",
    more: "On forme votre équipe sur place, sur vos vraies situations. Vous repartez autonomes, pas dépendants de nous.",
  },
];

const ETAPES = [
  {
    num: "01",
    label: "Un court appel",
    title: "Un court appel",
    text: "30 minutes, gratuit, sans engagement. On regarde ensemble ce qui vous freine.",
  },
  {
    num: "02",
    label: "On comprend votre réalité",
    title: "On comprend votre réalité",
    text: "Vos façons de faire, vos outils actuels, ce qui vous gruge du temps. Avant de proposer quoi que ce soit.",
  },
  {
    num: "03",
    label: "On bâtit votre offre",
    title: "On bâtit votre offre",
    text: "Pas de catalogue: une proposition montée pour votre entreprise, avec les outils qui vous conviennent.",
  },
  {
    num: "04",
    label: "Vous voyez avant de décider",
    title: "Vous voyez avant de décider",
    text: "Un aperçu concret de ce qu'on ferait, entre vos mains, avant d'investir quoi que ce soit.",
  },
  {
    num: "05",
    label: "On reste à vos côtés",
    title: "On reste à vos côtés",
    text: "On implante avec vous, on ajuste, et on vous accompagne pour que ça continue d'avancer.",
  },
];

const AVIS = [
  {
    name: "Marie-Claire Huard",
    meta: "Pataphil · il y a 3 semaines",
    footer: "Marie-Claire Huard · Pataphil · 5,0 sur Google",
    lead: "Je recommande Norvika et Laurianne sans aucune hésitation!",
    body: [
      "Faire un site web pour Pataphil représentait beaucoup pour moi. Après 46 ans d'histoire, je voulais un site qui reflète vraiment notre personnalité et nos valeurs. Laurianne a su comprendre exactement ce que je voulais, parfois même avant que je sois capable de l'expliquer!",
      "Elle est à l'écoute, disponible, incroyablement patiente et très talentueuse. Chaque détail a été pensé avec soin, et tout au long du projet, je me suis sentie accompagnée et en confiance. Les échanges étaient rapides, simples et toujours agréables.",
      "Le résultat dépasse mes attentes. Notre site est beau, moderne, convivial et représente parfaitement l'image de Pataphil.",
      "Au-delà du résultat, c'est aussi l'expérience client qui mérite d'être soulignée. On sent que Laurianne aime ce qu'elle fait et qu'elle s'investit sincèrement dans les projets de ses clients.",
      "Merci, Laurianne, pour ton professionnalisme, ta créativité et ton immense patience. Ce fut un réel plaisir de travailler avec toi. Je recommande Norvika à tous ceux qui recherchent un service humain, personnalisé et un résultat à la hauteur de leurs attentes.",
    ],
  },
  {
    name: "Mélodie Colpron",
    meta: "Anytime Fitness · il y a 1 semaine",
    footer: "Mélodie Colpron · Anytime Fitness · 5,0 sur Google",
    lead: "Un énorme merci à Laurianne et toute son équipe pour leur excellent travail lors de notre party du 1er anniversaire d'ouverture!",
    body: [
      "Ils ont filmé plusieurs clips tout au long de l'événement et le résultat est tout simplement incroyable. L'équipe était professionnelle, dynamique et super agréable à côtoyer. Je recommande leurs services à 100% sans hésitation!",
    ],
  },
  {
    name: "Olee G",
    meta: "GARNO photographe · il y a 6 jours",
    footer: "Olee G · GARNO photographe · 5,0 sur Google",
    lead: "J'ai eu la chance de faire affaire avec cette équipe incroyable! Professionnelle, soucieux du détails et super facile à travailler avec. Si vous cherchez une équipe différente et motivé c'est les bons!",
    body: [],
  },
  {
    name: "DSM Sports Cards Collectors",
    meta: "Le roi des cartes · il y a 4 jours",
    footer: "DSM Sports Cards Collectors · Le roi des cartes · 5,0 sur Google",
    lead: "Excellant support, très bon travail et super bon rapport qualité/prix. réponses et solutions rapides!",
    body: ["Je recommande."],
  },
];

const ROAD_STEPS: RoadStep[] = ETAPES.map((e) => ({
  num: e.num,
  label: e.label,
  title: e.title,
  body: e.text,
}));

function Index() {
  useReveal();
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [avis, setAvis] = useState(0);
  const selected = AVIS[avis]!;

  return (
    <div
      style={{ position: "relative", overflowX: "hidden", background: "#fff" }}
    >
      <SiteHeader />

      {/* Hero */}
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
            inset: "-15% -10% auto",
            height: 1000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "8%",
              left: "4%",
              width: 680,
              height: 680,
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
              top: 0,
              left: "44%",
              width: 720,
              height: 720,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(79,138,147,.16) 0%, rgba(79,138,147,0) 68%)",
              filter: "blur(44px)",
              animation: "driftB 27s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 45%, #ffffff 96%)",
            }}
          />
        </div>
        <div className="nv-shell"
          style={{
            position: "relative",
            maxWidth: 900,
            margin: "0 auto",
            padding: "76px 32px 78px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h1
            data-reveal="hero"
            style={{
              margin: 0,
              fontSize: "clamp(40px,5.2vw,72px)",
              lineHeight: 1.04,
              letterSpacing: "-.035em",
              textWrap: "balance",
            }}
          >
            Vos courtiers des outils numériques.
          </h1>
          <p
            data-reveal="hero"
            style={{
              margin: "30px 0 0",
              maxWidth: "58ch",
              fontSize: 19,
              lineHeight: 1.62,
              color: "rgba(12,25,47,.64)",
            }}
          >
            Chaque entreprise est différente, la vôtre aussi. On prend le temps
            de comprendre votre réalité, pis on bâtit une offre qui vous
            ressemble.
          </p>
          <div
            data-reveal="hero"
            style={{
              margin: "40px 0 0",
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
            }}
          >
            <a
              href={LIEN_RDV}
              className="nv-btn-primary"
              style={{
                padding: "16px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
              }}
             target="_blank" rel="noopener noreferrer">
              Réserver mes 30 minutes
            </a>
            <Link
              href="/realisations"
              className="nv-btn-outline"
              style={{
                padding: "16px 22px",
                borderRadius: 10,
                border: "1px solid rgba(12,25,47,.14)",
                fontSize: 15,
                fontWeight: 600,
                color: "rgba(12,25,47,.76)",
              }}
            >
              Nos réalisations →
            </Link>
          </div>
        </div>
      </section>

      {/* Quiz band */}
      <section
        style={{
          borderBottom: "1px solid rgba(12,25,47,.1)",
          background: "#EEF2FA",
        }}
      >
        <div className="nv-shell nv-grid"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "76px 32px",
            display: "grid",
            gridTemplateColumns: "1.15fr .85fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <h2
              data-reveal
              style={{
                margin: 0,
                fontSize: "clamp(26px,3.2vw,40px)",
                lineHeight: 1.1,
                textWrap: "balance",
              }}
            >
              Est-ce que votre entreprise va bien, pour vrai?
            </h2>
            <p
              data-reveal
              style={{
                margin: "20px 0 0",
                maxWidth: "56ch",
                fontSize: 17.5,
                lineHeight: 1.62,
                color: "rgba(12,25,47,.64)",
              }}
            >
              Sept questions, deux minutes, aucune bonne ou mauvaise réponse.
              Juste un portrait honnête de ce qui vous freine en ce moment.
            </p>
          </div>
          <div
            data-reveal
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Link
              href="/diagnostic"
              className="nv-btn-primary"
              style={{
                padding: "17px 32px",
                borderRadius: 10,
                fontSize: 15.5,
                fontWeight: 600,
              }}
            >
              Faire le quiz
            </Link>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section
        style={{
          borderBottom: "1px solid rgba(12,25,47,.1)",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,.5), rgba(238,242,250,.8))",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
        }}
      >
        <div className="nv-shell"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "46px 32px 52px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
          }}
        >
          <p
            data-reveal
            style={{
              margin: 0,
              fontSize: 11.5,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "rgba(12,25,47,.4)",
              textAlign: "center",
            }}
          >
            Quelques entreprises avec qui nous avons collaboré
          </p>
          <div className="nv-grid-3"
            data-reveal
            style={{
              width: "100%",
              maxWidth: 780,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              alignItems: "stretch",
              overflow: "hidden",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,.8)",
              background:
                "linear-gradient(150deg, rgba(255,255,255,.7), rgba(255,255,255,.4))",
              backdropFilter: "blur(26px) saturate(180%)",
              WebkitBackdropFilter: "blur(26px) saturate(180%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,.95) inset, 0 26px 60px -44px rgba(12,25,47,.9)",
            }}
          >
            <div style={{ height: 82, overflow: "hidden" }}>
              <img loading="lazy" decoding="async"
                src={logoDesjardins.url}
                alt="Desjardins"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <div
              style={{
                height: 82,
                overflow: "hidden",
                borderLeft: "1px solid rgba(12,25,47,.08)",
                borderRight: "1px solid rgba(12,25,47,.08)",
              }}
            >
              <img loading="lazy" decoding="async"
                src={logoAnytime.url}
                alt="Anytime Fitness"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <div style={{ height: 82, overflow: "hidden" }}>
              <img loading="lazy" decoding="async"
                src={logoSupergolf.url}
                alt="Super Golf"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(12,25,47,.1)",
          background: "#fff",
        }}
      >
        <div className="nv-shell"
          style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 32px" }}
        >
          <div className="nv-grid"
            data-reveal
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 56,
              alignItems: "end",
              marginBottom: 56,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(28px,3.4vw,46px)",
                lineHeight: 1.08,
              }}
            >
              Ce qu'on fait, et pour régler quoi.
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.6,
                color: "rgba(12,25,47,.6)",
              }}
            >
              On part du problème, jamais du service. Cliquez sur une ligne pour
              voir le détail, ou ouvrez la page complète.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,.8)",
              background:
                "linear-gradient(150deg, rgba(255,255,255,.72), rgba(255,255,255,.42))",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -40px rgba(12,25,47,.6)",
            }}
          >
            {SERVICES.map((s, i) => (
              <div
                key={s.num}
                data-reveal
                className="nv-row nv-grid"
                onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                style={{
                  cursor: "pointer",
                  padding: "32px 24px",
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 1.1fr 120px",
                  gap: 24,
                  alignItems: "start",
                  borderTop:
                    i === 0 ? undefined : "1px solid rgba(12,25,47,.08)",
                  transition: "background .3s ease",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    color: "rgba(12,25,47,.35)",
                  }}
                >
                  {s.num}
                </span>
                <h3 style={{ margin: 0, fontSize: 26, letterSpacing: "-.02em" }}>
                  <Link href={s.to}>{s.title}</Link>
                </h3>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 16,
                      lineHeight: 1.62,
                      color: "rgba(12,25,47,.66)",
                    }}
                  >
                    {s.lead}
                  </p>
                  {open[i] && (
                    <>
                      <p
                        style={{
                          margin: "14px 0 0",
                          fontSize: 16,
                          lineHeight: 1.62,
                          color: "rgba(12,25,47,.66)",
                        }}
                      >
                        {s.more}
                      </p>
                      {/* « En savoir plus » ne fait qu'ouvrir la ligne : sans ce
                          lien, rien ne menait a la page du service depuis ici. */}
                      <Link
                        href={s.to}
                        onClick={(e) => e.stopPropagation()}
                        className="nv-link-fade"
                        style={{
                          display: "inline-block",
                          marginTop: 14,
                          fontSize: 14.5,
                          fontWeight: 600,
                          color: "#33496C",
                        }}
                      >
                        Voir la page {s.title} →
                      </Link>
                    </>
                  )}
                </div>
                <span
                  style={{
                    justifySelf: "end",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#33496C",
                  }}
                >
                  {open[i] ? "Réduire ↑" : "Le détail ↓"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(12,25,47,.1)",
          background: "#fff",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "10%",
            left: "30%",
            width: 640,
            height: 640,
            borderRadius: "50%",
            pointerEvents: "none",
            background:
              "radial-gradient(circle, rgba(51,73,108,.12) 0%, rgba(51,73,108,0) 68%)",
            filter: "blur(40px)",
            animation: "driftA 24s ease-in-out infinite",
          }}
        />
        <div className="nv-shell"
          style={{
            position: "relative",
            maxWidth: 1240,
            margin: "0 auto",
            padding: "96px 32px",
          }}
        >
          <p
            data-reveal
            style={{
              margin: "0 0 18px",
              fontSize: 11.5,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "#33496C",
              fontWeight: 600,
            }}
          >
            Comment ça marche
          </p>
          <h2
            data-reveal
            style={{
              margin: 0,
              maxWidth: "20ch",
              fontSize: "clamp(28px,3.4vw,46px)",
              lineHeight: 1.08,
            }}
          >
            On regarde votre cas, pas un cas type.
          </h2>
          <Roadmap steps={ROAD_STEPS} />
        </div>
      </section>

      {/* Fondateurs */}
      <section style={{ background: "#0C192F", color: "#F5F3EE" }}>
        <div className="nv-shell nv-grid"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "104px 32px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          <div data-reveal>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(28px,3.4vw,46px)",
                lineHeight: 1.08,
              }}
            >
              On rattache l'humain à l'efficience.
            </h2>
            <p
              style={{
                margin: "26px 0 0",
                maxWidth: "52ch",
                fontSize: 17,
                lineHeight: 1.66,
                color: "rgba(245,243,238,.68)",
              }}
            >
              Derrière Norvika, deux personnes qui prennent le temps de
              comprendre votre réalité avant de proposer quoi que ce soit. Pas
              une présence en ligne de plus à cocher sur une liste, une qui
              travaille vraiment pour vous.
            </p>
            <p
              style={{
                margin: "34px 0 0",
                fontSize: 11.5,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "rgba(245,243,238,.5)",
              }}
            >
              Fondateurs de Norvika
            </p>
          </div>
          <div
            data-reveal
            style={{
              position: "relative",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(245,243,238,.12)",
            }}
          >
            <img loading="lazy" decoding="async"
              src={lauEtWill.url}
              alt="Laurianne et William, cofondateurs de Norvika"
              style={{
                display: "block",
                width: "100%",
                height: 520,
                objectFit: "cover",
                objectPosition: "center 22%",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "auto 0 0 0",
                height: "50%",
                background:
                  "linear-gradient(to top, rgba(12,25,47,.85), rgba(12,25,47,0))",
              }}
            />
            <p
              style={{
                position: "absolute",
                left: 26,
                right: 26,
                bottom: 24,
                margin: 0,
                fontSize: 17,
                fontStyle: "italic",
                lineHeight: 1.5,
                color: "#F5F3EE",
              }}
            >
              « On règle le vrai problème avec vous, jamais à votre place. »
            </p>
          </div>
        </div>
      </section>

      {/* Avis Google */}
      <section
        id="realisations"
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(12,25,47,.1)",
          background: "#EEF2FA",
        }}
      >
        <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 32px" }}>
          <div
            data-reveal
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 40,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 11.5,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "#33496C",
                fontWeight: 600,
              }}
            >
              Avis Google
            </h2>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                color: "rgba(12,25,47,.55)",
              }}
            >
              <span style={{ color: "#33496C", letterSpacing: ".1em" }}>
                ★★★★★
              </span>{" "}
              5,0 sur 6 avis
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12.5,
                color: "rgba(12,25,47,.42)",
              }}
            >
              Choisissez un nom pour lire l'avis complet
            </span>
          </div>

          <div className="nv-grid"
            data-reveal
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              padding: "8px 32px 8px 36px",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,.8)",
              background:
                "linear-gradient(150deg, rgba(255,255,255,.72), rgba(255,255,255,.42))",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -40px rgba(12,25,47,.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid rgba(12,25,47,.1)",
              }}
            >
              {AVIS.map((a, i) => (
                <div
                  key={a.name}
                  className="nv-avis"
                  onClick={() => setAvis(i)}
                  style={{
                    cursor: "pointer",
                    padding: "22px 26px 22px 0",
                    borderBottom: "1px solid rgba(12,25,47,.08)",
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    transition: "padding-left .25s cubic-bezier(.2,0,0,1)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 12,
                      color: avis === i ? "#33496C" : "rgba(12,25,47,.18)",
                    }}
                  >
                    ●
                  </span>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: avis === i ? "#0C192F" : "rgba(12,25,47,.5)",
                      }}
                    >
                      {a.name}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 12.5,
                        color: "rgba(12,25,47,.45)",
                      }}
                    >
                      {a.meta}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                position: "relative",
                padding: "40px 0 40px 84px",
                minHeight: 420,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 14,
                  left: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: 96,
                  lineHeight: 1,
                  color: "rgba(51,73,108,.12)",
                }}
              >
                “
              </span>
              <div style={{ position: "relative" }}>
                <blockquote
                  style={{
                    margin: 0,
                    maxWidth: selected.body.length > 2 ? "62ch" : "56ch",
                    columnCount: selected.body.length > 2 ? 2 : 1,
                    columnGap: 44,
                    columnRule: "1px solid rgba(12,25,47,.08)",
                    fontSize: 15.5,
                    lineHeight: 1.72,
                    color: "rgba(12,25,47,.74)",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 14px",
                      fontFamily: "var(--font-display)",
                      fontSize: selected.body.length > 2 ? 21 : 24,
                      lineHeight: 1.4,
                      color: "#0C192F",
                    }}
                  >
                    {selected.lead}
                  </p>
                  {selected.body.map((p, i) => (
                    <p key={i} style={{ margin: "0 0 14px" }}>
                      {p}
                    </p>
                  ))}
                </blockquote>
              </div>
              <p
                style={{
                  margin: "36px 0 0",
                  fontSize: 12.5,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  color: "rgba(12,25,47,.42)",
                }}
              >
                {selected.footer}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic */}
      <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)" }}>
        <div className="nv-shell nv-grid"
          data-reveal
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "88px 32px",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 56,
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(26px,3vw,40px)",
                lineHeight: 1.1,
              }}
            >
              Est-ce que votre entreprise va bien, pour vrai?
            </h2>
            <p
              style={{
                margin: "20px 0 0",
                maxWidth: "58ch",
                fontSize: 17,
                lineHeight: 1.62,
                color: "rgba(12,25,47,.64)",
              }}
            >
              Sept questions, deux minutes, et vous saurez ce qui freine le plus
              votre entreprise en ce moment: votre site, votre temps ou votre
              image. Aucun courriel demandé.
            </p>
          </div>
          <Link
            href="/diagnostic"
            className="nv-btn-primary"
            style={{
              justifySelf: "end",
              padding: "18px 34px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 12px 34px rgba(12,25,47,.22)",
            }}
          >
            Faire le quiz
          </Link>
        </div>
      </section>

      <AutresPages courante="/" />
      <SiteFooter />
    </div>
  );
}

export default Index;

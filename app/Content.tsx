"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useReveal } from "@/lib/useReveal";
import { Roadmap, versRoadSteps } from "@/components/site/Roadmap";
import { AutresPages } from "@/components/site/AutresPages";
import { useContenuGlobal } from "@/components/site/ContenuGlobal";
import { positionFocale, visible, type Avis, type PageAccueil } from "@/lib/types-contenu";
import { Aimant } from "@/components/site/Aimant";
import { VideoYoutube } from "@/components/site/VideoYoutube";
import { BasculeAvantApres } from "@/components/site/BasculeAvantApres";
// Tout le texte vient de l'« Accueil » du Studio ; les services, de leurs pages de service ;
// les avis, des « Avis Google ».
//
// Bande de logos (choisie par William le 2026-08-24) : DEUX TRAITEMENTS, ET C'EST VOULU. Les
// logos détourés se posent directement sur la bande ; Desjardins et Anytime Fitness n'ont qu'un
// logo BLANC sur un bloc de couleur de marque, donc en pastille arrondie (« Sur une tuile de
// couleur » dans leur fiche). On ne recolore pas le logo d'une institution financière.
function Index({ page, avisListe }: { page: PageAccueil; avisListe: Avis[] }) {
  useReveal();
  const { parametres, navigation, services } = useContenuGlobal();
  const LIEN_RDV = parametres.lienRendezVous;
  const SERVICES = services.map((s, i) => ({
    num: String(i + 1).padStart(2, "0"),
    title: s.nom,
    to: s.chemin,
    lead: s.accroche,
    more: s.detail,
  }));
  const LOGOS_CLIENTS = page.logos.liste.map((l) => ({ src: l.logo.url, nom: l.nom, pastille: l.logoStyle === "brand" }));
  const ROAD_STEPS = versRoadSteps(page.parcours.etapes);
  const lauEtWill = page.fondateurs.photo;
  const AVIS = avisListe.map((a) => ({ name: a.nom, meta: a.contexte, footer: a.signature, lead: a.accroche, body: a.suite ?? [] }));
  const bascule = page.avantApres.realisation;
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [avis, setAvis] = useState(0);
  const selected = AVIS[avis] ?? AVIS[0];

  return (
    <div
      style={{ position: "relative", overflowX: "hidden", background: "#fff" }}
    >
      <SiteHeader />

      {/* Hero
          Fond sombre uni, sans decor. Il a porte un temps trois aurores
          colorees en degrade (bleu, turquoise, magenta) et les lames de la
          marque qui derivaient derriere le texte. Les deux ont ete retirees a
          la demande de Lau, qui voulait un fond simple. Le sombre reste : le
          texte creme et les boutons sont regles pour ce contraste-la. */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#081120",
          color: "#F5F3EE",
          borderBottom: "1px solid rgba(12,25,47,.1)",
        }}
      >
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
              color: "#FFFFFF",
            }}
          >
            {page.h1}
          </h1>
          <p
            data-reveal="hero"
            style={{
              margin: "30px 0 0",
              maxWidth: "58ch",
              fontSize: 19,
              lineHeight: 1.62,
              color: "rgba(245,243,238,.88)",
            }}
          >
            {page.heroTexte}
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
            <Aimant>
              <a
                href={LIEN_RDV}
                className="nv-btn-cream"
                style={{
                  padding: "16px 28px",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {navigation.boutonRendezVous}
              </a>
            </Aimant>
            <Link
              href="/realisations"
              className="nv-cream-hover"
              style={{
                padding: "16px 22px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {page.heroBoutonSecondaire}
            </Link>
          </div>
        </div>

      </section>

      {/* Vidéos
          Juste sous le hero, et non en bas de page : decision de Lau, « c'est
          une des premieres choses que les clients doivent voir ». Un client
          qui parle et un avant/apres convainquent plus vite qu'un paragraphe.
          La section ne ralentit pas l'accueil malgre sa position : les deux
          lecteurs ne chargent rien de YouTube tant que personne ne clique. */}
      {visible(page.videos) ? (
      <section
        style={{
          borderBottom: "1px solid rgba(12,25,47,.1)",
          background: "#fff",
        }}
      >
        <div
          className="nv-shell"
          style={{ maxWidth: 1040, margin: "0 auto", padding: "76px 32px 82px" }}
        >
          <div data-reveal style={{ textAlign: "center" }}>
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
              {page.videos.titre}
            </h2>
            <p
              style={{
                margin: "18px 0 40px",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(24px,2.8vw,34px)",
                lineHeight: 1.25,
                letterSpacing: "-.03em",
                color: "#0C192F",
              }}
            >
              {page.videos.sousTitre}
            </p>
          </div>
          {/* ⚠️ PAS `nv-grid` ICI. Cette classe force une seule colonne sous
              1024 px : les trois videos verticales s'empilaient et mettaient
              1500 px de defilement entre le hero et la suite de la page. La
              classe ci-dessous garde la rangee sur grand ecran et la
              transforme en carrousel sur telephone (voir globals.css). */}
          <div
            data-reveal
            className="nv-videos-rangee"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 280px))",
              justifyContent: "center",
              gap: 28,
            }}
          >
            {page.videos.liste.map((v) => ({ ...v, fiche: v.fiche ? `/realisations/${v.fiche}` : null })).map((v) => (
              <figure key={v.youtubeId} style={{ margin: 0 }}>
                <VideoYoutube
                  youtubeId={v.youtubeId}
                  titre={v.titre}
                  format="vertical"
                />
                {v.fiche ? (
                  <figcaption style={{ marginTop: 16, textAlign: "center" }}>
                    <Link
                      href={v.fiche}
                      className="nv-cta-outline"
                      style={{
                        display: "inline-block",
                        padding: "10px 16px",
                        borderRadius: 999,
                        border: "1px solid",
                        fontSize: 13.5,
                        fontWeight: 600,
                      }}
                    >
                      {page.videos.bouton}
                    </Link>
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {/* Avant / apres
          Les videos montrent des clients qui DISENT que c'etait bon ; la
          bascule MONTRE le resultat. Deux natures de preuve, d'ou leur
          voisinage. Un seul exemple, assume au singulier : au deuxieme
          client, le titre passera au pluriel. */}
      {visible(page.avantApres) ? (
      <section
        style={{
          borderBottom: "1px solid rgba(12,25,47,.1)",
          background: "#EEF2FA",
        }}
      >
        <div
          className="nv-shell"
          style={{ maxWidth: 1240, margin: "0 auto", padding: "76px 32px 82px" }}
        >
          <div data-reveal style={{ textAlign: "center" }}>
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
              {page.avantApres.titre}
            </h2>
            <p
              style={{
                margin: "18px 0 10px",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(24px,2.8vw,34px)",
                lineHeight: 1.25,
                letterSpacing: "-.03em",
                color: "#0C192F",
              }}
            >
              {page.avantApres.sousTitre}
            </p>
            <p
              style={{
                margin: "0 0 30px",
                fontSize: 16,
                lineHeight: 1.6,
                color: "rgba(12,25,47,.6)",
              }}
            >
              {page.avantApres.texte}
            </p>
          </div>
          <div data-reveal>
            <BasculeAvantApres
              avant={bascule.avantApres.avant}
              avant2x={bascule.avantApres.avant2x ?? undefined}
              apres={bascule.avantApres.apres}
              apres2x={bascule.avantApres.apres2x ?? undefined}
              alt={bascule.avantApres.alt}
              adresse={bascule.avantApres.adresse}
              libelleAvant={navigation.basculeAvant}
              libelleApres={navigation.basculeApres}
            />
            <p style={{ margin: "22px 0 0", textAlign: "center" }}>
              <Link
                href={`/realisations/${bascule.slug}`}
                className="nv-cta-outline"
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "1px solid",
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                {page.avantApres.bouton}
              </Link>
            </p>
          </div>
        </div>
      </section>
      ) : null}

      {/* Quiz band */}
      {visible(page.quiz) ? (
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
              {page.quiz.titre}
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
              {page.quiz.texte}
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
              {navigation.boutonQuiz}
            </Link>
          </div>
        </div>
      </section>
      ) : null}

      {/* Logos */}
      {visible(page.logos) ? (
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
            {page.logos.titre}
          </p>
          <div
            data-reveal
            className="nv-logos-bande"
            style={{ width: "100%", maxWidth: 900 }}
          >
            {LOGOS_CLIENTS.map((l, i) => (
              <span key={l.nom} className={i >= 4 ? "nv-logo-cache-mobile" : undefined}>
                <img
                  loading="lazy"
                  decoding="async"
                  src={l.src}
                  alt={l.nom}
                  title={l.nom}
                  className={l.pastille ? "nv-logo-pastille" : undefined}
                />
              </span>
            ))}
          </div>
          <Link
            href="/realisations"
            className="nv-link-fade"
            style={{
              fontSize: 14.5,
              fontWeight: 600,
              color: "#33496C",
            }}
          >
            {page.logos.lien}
          </Link>
        </div>
      </section>
      ) : null}

      {/* Services */}
      {visible(page.services) ? (
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
              {page.services.titre}
            </h2>
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
            {/* Toute la ligne ouvre le détail, comme avant, mais par un VRAI bouton (« Le détail »)
                dont la zone cliquable couvre la ligne (.nv-row-bouton::after) : joignable au clavier,
                annoncé ouvert ou fermé, et le survol vise ce bouton, pas un div (règle 10). Les liens
                de la ligne passent au-dessus de cette zone. */}
            {SERVICES.map((s, i) => (
              <div
                key={s.num}
                data-reveal
                className="nv-row nv-grid"
                style={{
                  padding: "32px 24px",
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 1.1fr 120px",
                  gap: 24,
                  alignItems: "start",
                  borderTop:
                    i === 0 ? undefined : "1px solid rgba(12,25,47,.08)",
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
                  <Link href={s.to} className="nv-lien">
                    {s.title}
                  </Link>
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
                        className="nv-link-fade"
                        style={{
                          display: "inline-block",
                          marginTop: 14,
                          fontSize: 14.5,
                          fontWeight: 600,
                          color: "#33496C",
                        }}
                      >
                        {page.services.lienPage} {s.title}
                      </Link>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className="nv-row-bouton"
                  aria-expanded={!!open[i]}
                  onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                >
                  {open[i] ? page.services.fermer : page.services.ouvrir}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {/* Comment ça marche */}
      {visible(page.parcours) ? (
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
          {/* Plus de sur-titre « Comment ça marche » (règle d'agence 1) : le titre et le parcours
              disent déjà ce que c'est. */}
          <h2
            data-reveal
            style={{
              margin: 0,
              maxWidth: "20ch",
              fontSize: "clamp(28px,3.4vw,46px)",
              lineHeight: 1.08,
            }}
          >
            {page.parcours.titre}
          </h2>
          <Roadmap steps={ROAD_STEPS} />
        </div>
      </section>
      ) : null}

      {/* Fondateurs */}
      {visible(page.fondateurs) ? (
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
              {page.fondateurs.titre}
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
              {page.fondateurs.texte}
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
              {page.fondateurs.legende}
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
              alt={lauEtWill.alt ?? ""}
              style={{
                display: "block",
                width: "100%",
                height: 520,
                objectFit: "cover",
                objectPosition: positionFocale(lauEtWill, "center 22%"),
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
              {page.fondateurs.citation}
            </p>
          </div>
        </div>
      </section>
      ) : null}

      {/* Avis Google */}
      {visible(page.avis) && selected ? (
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
              {page.avis.titre}
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
                {page.avis.etoiles}
              </span>{" "}
              {/* Pas de nombre d'avis ici. Il etait fige a « 6 » et la page en
                  montrait deja plus : un compteur ecrit en dur ment des le
                  prochain avis recu. « 5,0 sur Google » reste vrai tant que la
                  note l'est. */}
              {page.avis.note}
            </span>
          </div>

          <div className="nv-grid nv-avis-grille"
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
              {/* Chaque nom est un bouton (il choisit l'avis affiché à droite) : avant, un div
                  cliquable, injoignable au clavier, dont le survol ne visait pas un bouton (règle 10). */}
              {AVIS.map((a, i) => (
                <button
                  key={a.name}
                  type="button"
                  className="nv-avis"
                  aria-pressed={avis === i}
                  onClick={() => setAvis(i)}
                  style={{
                    padding: "22px 26px 22px 0",
                    borderBottom: "1px solid rgba(12,25,47,.08)",
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                  }}
                >
                  {/* Le point marque l'avis affiché (état réel, annoncé par aria-pressed). Dans un
                      bouton, seuls des éléments en ligne sont permis : des span en bloc remplacent
                      les div et p d'avant, même rendu. */}
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 12,
                      color: avis === i ? "#33496C" : "rgba(12,25,47,.18)",
                    }}
                  >
                    ●
                  </span>
                  <span style={{ display: "block", flex: 1 }}>
                    <span
                      style={{
                        display: "block",
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: avis === i ? "#0C192F" : "rgba(12,25,47,.5)",
                      }}
                    >
                      {a.name}
                    </span>
                    <span
                      style={{
                        display: "block",
                        margin: "4px 0 0",
                        fontSize: 12.5,
                        color: "rgba(12,25,47,.45)",
                      }}
                    >
                      {a.meta}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div
              className="nv-avis-corps"
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
                  // ⚠️ `columnCount` etait pose en style EN LIGNE, donc aucune
                  // media query ne pouvait le defaire : sur telephone, l'avis
                  // se coupait en deux colonnes de deux mots qui se
                  // chevauchaient. Le decoupage passe par une classe, qui
                  // retombe a une seule colonne sous 900 px.
                  className={selected.body.length > 2 ? "nv-avis-2col" : undefined}
                  style={{
                    margin: 0,
                    maxWidth: selected.body.length > 2 ? "62ch" : "56ch",
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
      ) : null}

      <AutresPages courante="/" />
      <SiteFooter />
    </div>
  );
}

export default Index;

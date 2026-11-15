"use client";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useReveal } from "@/lib/useReveal";
import { AutresPages } from "@/components/site/AutresPages";
import { useContenuGlobal } from "@/components/site/ContenuGlobal";
import { FilAriane } from "@/components/site/FilAriane";
import { categories, type PageRealisations, type Realisation } from "@/lib/types-contenu";
import { VideoYoutube } from "@/components/site/VideoYoutube";
import { BasculeAvantApres } from "@/components/site/BasculeAvantApres";


// Plus de petits titres numérotés « 01 · Le point de départ » et « 02 · Notre mandat » au-dessus
// des titres (règles d'agence 1 et 3) : ils redisaient « Le besoin » et « Ce qu'on a fait », et deux
// numéros ne font pas une suite (le résultat n'en avait pas).
const blockTitle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: "clamp(24px,2.6vw,34px)",
  letterSpacing: "-.03em",
};

const blockText: React.CSSProperties = {
  margin: "18px 0 0",
  fontSize: 18,
  lineHeight: 1.75,
  color: "rgba(12,25,47,.72)",
};

// Les textes de la fiche viennent de la réalisation (Studio) ; les libellés communs à toutes les
// fiches, de la page « Réalisations », onglet « Fiches des clients ».
export default function Page({ client, page }: { client: Realisation; page: PageRealisations }) {
  useReveal();
  const { parametres, navigation } = useContenuGlobal();
  const LIEN_RDV = parametres.lienRendezVous;
  const labelFor = (id: string) => categories(page).find((c) => c.id === id)?.label ?? id;
  const cover = client.couverture ? { url: client.couverture.url, alt: client.couverture.alt ?? "" } : null;

  return (
    <div style={{ position: "relative", overflowX: "hidden", background: "#fff" }}>
      <SiteHeader />

      <section
        style={{
          background: "#EEF2FA",
          borderBottom: "1px solid rgba(12,25,47,.1)",
        }}
      >
        <div
          className="nv-shell"
          style={{ maxWidth: 1000, margin: "0 auto", padding: "44px 32px 72px" }}
        >
          {/* Fil d'Ariane (Accueil, Réalisations, client) a la place de l'ancien bouton « Toutes les
              réalisations » : deux liens vers la meme liste, l'un au-dessus de l'autre, se repetaient.
              Il porte aussi les donnees structurees BreadcrumbList de la fiche. */}
          <FilAriane
            etapes={[
              { libelle: page.nom, lien: "/realisations" },
              { libelle: client.nom, lien: `/realisations/${client.slug}` },
            ]}
            ton="clair"
          />

          <div
            className="nv-grid"
            style={{
              marginTop: 34,
              display: "grid",
              gridTemplateColumns: "170px minmax(0,1fr)",
              gap: 34,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                minHeight: 130,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,.85)",
                background: "rgba(255,255,255,.85)",
                boxShadow: "0 24px 60px -46px rgba(12,25,47,.85)",
              }}
            >
              <img loading="lazy" decoding="async"
                src={client.logo.url}
                alt={client.nom}
                style={{
                  maxWidth: "100%",
                  maxHeight: 88,
                  objectFit: "contain",
                  borderRadius: client.logoStyle === "brand" ? 12 : 0,
                }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#33496C",
                  fontWeight: 600,
                }}
              >
                {client.secteur}
              </p>
              <h1
                style={{
                  margin: "12px 0 0",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "clamp(30px,3.8vw,48px)",
                  lineHeight: 1.08,
                  letterSpacing: "-.035em",
                }}
              >
                {client.nom}
              </h1>
              <p
                style={{
                  margin: "16px 0 0",
                  maxWidth: "52ch",
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: "rgba(12,25,47,.64)",
                }}
              >
                {client.resume}
              </p>
              <div
                style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8 }}
              >
                {client.categories.map((cat) => (
                  <span
                    key={cat}
                    style={{
                      padding: "7px 13px",
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#0C192F",
                      border: "1px solid rgba(12,25,47,.16)",
                      background: "rgba(255,255,255,.7)",
                    }}
                  >
                    {labelFor(cat)}
                  </span>
                ))}
              </div>
              {client.siteWeb ? (
                <div style={{ marginTop: 24 }}>
                  <a
                    href={client.siteWeb}
                    target="_blank"
                    rel="noopener"
                    className="nv-cta-outline"
                    style={{
                      display: "inline-block",
                      padding: "13px 20px",
                      borderRadius: 10,
                      border: "1px solid",
                      fontSize: 14.5,
                      fontWeight: 600,
                    }}
                  >
                    {page.ficheSite}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", borderBottom: "1px solid rgba(12,25,47,.1)" }}>
        <div
          className="nv-shell"
          style={{ maxWidth: 780, margin: "0 auto", padding: "78px 32px 88px" }}
        >
          <article data-reveal style={{ minWidth: 0 }}>
            <h2 style={blockTitle}>{page.ficheBesoinTitre}</h2>
            <p style={blockText}>{client.besoin}</p>
          </article>

          {cover ? (
            <figure
              data-reveal
              style={{
                margin: "44px 0 0",
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr)",
                gap: 14,
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 180,
                  maxHeight: 380,
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid rgba(12,25,47,.1)",
                  background: "#F5F3EE",
                }}
              >
                <img
                  src={cover.url}
                  alt={cover.alt}
                  loading="lazy"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
              <figcaption
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 13.5,
                  color: "rgba(12,25,47,.6)",
                }}
              >
                <span>{page.ficheApercu}</span>
                <a
                  href={parametres.lienPortfolio}
                  target="_blank"
                  rel="noopener"
                  className="nv-cta-outline"
                  style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    border: "1px solid",
                    fontSize: 13.5,
                    fontWeight: 600,
                  }}
                >
                  {page.ficheApercuBouton}
                </a>
              </figcaption>
            </figure>
          ) : null}

          <hr
            style={{
              margin: "52px 0",
              border: 0,
              borderTop: "1px solid rgba(12,25,47,.1)",
            }}
          />

          <article data-reveal style={{ minWidth: 0 }}>
            <h2 style={blockTitle}>{page.ficheMandatTitre}</h2>
            <p style={blockText}>{client.mandat}</p>
          </article>

          {client.avantApres ? (
            <figure data-reveal style={{ margin: "44px 0 0" }}>
              <BasculeAvantApres
                avant={client.avantApres.avant}
                avant2x={client.avantApres.avant2x ?? undefined}
                apres={client.avantApres.apres}
                apres2x={client.avantApres.apres2x ?? undefined}
                alt={client.avantApres.alt}
                adresse={client.avantApres.adresse}
                libelleAvant={navigation.basculeAvant}
                libelleApres={navigation.basculeApres}
              />
              <figcaption
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  fontSize: 13.5,
                  color: "rgba(12,25,47,.6)",
                }}
              >
                {client.avantApres.legende}
              </figcaption>
            </figure>
          ) : null}

          {client.video ? (
            <figure data-reveal style={{ margin: "44px 0 0" }}>
              <VideoYoutube
                youtubeId={client.video.youtubeId}
                titre={client.video.titre}
                format={client.video.format ?? undefined}
              />
              <figcaption
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  fontSize: 13.5,
                  color: "rgba(12,25,47,.6)",
                }}
              >
                {client.video.legende}
              </figcaption>
            </figure>
          ) : null}

          {client.resultat ? (
            <div
              data-reveal
              style={{
                marginTop: 52,
                padding: "34px 34px 36px",
                borderRadius: 22,
                background: "#F5F3EE",
                border: "1px solid rgba(12,25,47,.08)",
                borderLeft: "4px solid #0C192F",
              }}
            >
              {/* « Le résultat » était un petit libellé en capitales, SEUL repère de l'encadré : il est
                  promu en vrai titre (nuance de la règle d'agence 1), même niveau que « Le besoin ». */}
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, letterSpacing: "-.01em", color: "#33496C" }}>
                {page.ficheResultat}
              </h2>
              <p
                style={{
                  margin: "12px 0 0",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "clamp(19px,2.1vw,25px)",
                  lineHeight: 1.4,
                  letterSpacing: "-.02em",
                  color: "#0C192F",
                }}
              >
                {client.resultat}
              </p>
            </div>
          ) : null}
        </div>
      </section>


      <section style={{ background: "#EEF2FA" }}>
        <div
          className="nv-shell"
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "78px 32px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(26px,3vw,38px)",
              letterSpacing: "-.03em",
            }}
          >
            {page.ficheAppel}
          </h2>
          <div style={{ marginTop: 26 }}>
            <a
              href={LIEN_RDV}
              className="nv-btn-primary"
              style={{
                display: "inline-block",
                padding: "16px 26px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
              }}
             target="_blank" rel="noopener noreferrer">
              {navigation.boutonRendezVous}
            </a>
          </div>
        </div>
      </section>

      <AutresPages courante="/realisations" />
      <SiteFooter />
    </div>
  );
}

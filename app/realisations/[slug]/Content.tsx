"use client";

import Link from "next/link";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useReveal } from "@/lib/useReveal";
import { CATEGORIES, CLIENT_COVERS, getClient } from "@/lib/realisations";
import { LIEN_RDV } from "@/lib/liens";
import { AutresPages } from "@/components/site/AutresPages";

const labelFor = (id: string) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

const blockLabel: React.CSSProperties = {
  margin: 0,
  fontSize: 11.5,
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "#33496C",
  fontWeight: 600,
};

const blockTitle: React.CSSProperties = {
  margin: "10px 0 0",
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

export default function Page({ slug }: { slug: string }) {
  useReveal();
  const client = getClient(slug)!;
  const cover = CLIENT_COVERS[client.slug];

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
          <Link
            href="/realisations"
            className="nv-navlink"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            ← Toutes les réalisations
          </Link>

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
                src={client.logo}
                alt={client.name}
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
                {client.sector}
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
                {client.name}
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
                {client.summary}
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
              {client.website ? (
                <div style={{ marginTop: 24 }}>
                  <a
                    href={client.website}
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
                    Visiter le site →
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
            <p style={blockLabel}>01 · Le point de départ</p>
            <h2 style={blockTitle}>Le besoin</h2>
            <p style={blockText}>{client.context}</p>
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
                <span>Un aperçu du mandat.</span>
                <a
                  href="https://norvika.myportfolio.com/"
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
                  Voir le portfolio complet →
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
            <p style={blockLabel}>02 · Notre mandat</p>
            <h2 style={blockTitle}>Ce qu'on a fait</h2>
            <p style={blockText}>{client.work}</p>
          </article>

          {client.result ? (
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
              <p style={blockLabel}>Le résultat</p>
              <p
                style={{
                  margin: "14px 0 0",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "clamp(19px,2.1vw,25px)",
                  lineHeight: 1.4,
                  letterSpacing: "-.02em",
                  color: "#0C192F",
                }}
              >
                {client.result}
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
            Un projet comme celui-ci?
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
              Réserver mes 30 minutes
            </a>
          </div>
        </div>
      </section>

      <AutresPages courante="/realisations" />
      <SiteFooter />
    </div>
  );
}

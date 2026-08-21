"use client";

import Link from "next/link";

const logoStack = { url: "/assets/logo_stack_navy_new.webp" };
export function SiteFooter() {
  return (
    <>
      <section
        id="rdv"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#0C192F",
          color: "#F5F3EE",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            width: 900,
            height: 600,
            marginLeft: -450,
            background:
              "radial-gradient(ellipse, rgba(51,73,108,.28) 0%, rgba(51,73,108,0) 70%)",
          }}
        />
        <div className="nv-shell"
          style={{
            position: "relative",
            maxWidth: 1240,
            margin: "0 auto",
            padding: "130px 32px",
            textAlign: "center",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: 44,
              height: 1,
              margin: "0 auto 28px",
              background: "rgba(245,243,238,.4)",
            }}
          />
          <h2
            style={{
              margin: "0 auto",
              maxWidth: "20ch",
              fontSize: "clamp(30px,4vw,54px)",
              lineHeight: 1.08,
            }}
          >
            On regarde votre cas, gratuitement.
          </h2>
          <p
            style={{
              margin: "24px auto 0",
              maxWidth: "60ch",
              fontSize: 17,
              lineHeight: 1.65,
              color: "rgba(245,243,238,.7)",
            }}
          >
            30 minutes pour comprendre ce qui vous freine et vous dire,
            concrètement, ce qu'on ferait à votre place. Gratuit, sans
            engagement, et vous repartez avec un document d'analyse fait pour
            vous.
          </p>
          <Link
            href="/diagnostic"
            className="nv-btn-cream"
            style={{
              display: "inline-block",
              marginTop: 36,
              padding: "18px 36px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Réserver mes 30 minutes
          </Link>
        </div>
      </section>

      <footer className="nv-shell" style={{ padding: "72px 32px 44px" }}>
        <div className="nv-shell nv-grid-3"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr",
            gap: 40,
          }}
        >
          <div>
            <img
              src={logoStack.url}
              alt="Norvika"
              style={{ height: 78, width: "auto", display: "block" }}
            />
            <p
              style={{
                margin: "20px 0 0",
                maxWidth: "38ch",
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "rgba(12,25,47,.55)",
              }}
            >
              Présence numérique pour les entreprises et les travailleurs
              autonomes.
            </p>
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "rgba(12,25,47,.45)",
              }}
            >
              Services
            </p>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexDirection: "column",
                gap: 9,
                fontSize: 14.5,
              }}
            >
              <Link href="/sites-web">Sites web</Link>
              <Link href="/automatisation">Automatisation</Link>
              <Link href="/photo-et-video">Photo et vidéo</Link>
              <Link href="/formation">Formation</Link>
              <Link href="/realisations">Réalisations</Link>
              <Link href="/equipe">L'équipe</Link>
            </div>
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "rgba(12,25,47,.45)",
              }}
            >
              Contact
            </p>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexDirection: "column",
                gap: 9,
                fontSize: 14.5,
              }}
            >
              <a href="mailto:info@norvika.ca">info@norvika.ca</a>
              <Link href="/contact" style={{ color: "rgba(12,25,47,.55)" }}>
                Nous écrire
              </Link>
              <Link href="/diagnostic" style={{ color: "rgba(12,25,47,.55)" }}>
                Diagnostic gratuit
              </Link>
            </div>
          </div>
        </div>
        <div className="nv-shell"
          style={{
            maxWidth: 1240,
            margin: "44px auto 0",
            paddingTop: 22,
            borderTop: "1px solid rgba(12,25,47,.08)",
            fontSize: 12.5,
            color: "rgba(12,25,47,.45)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>© 2026 Norvika</span>
            <Link
              href="/politique-de-confidentialite"
              style={{ color: "rgba(12,25,47,.45)" }}
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

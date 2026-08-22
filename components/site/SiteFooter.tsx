"use client";

import Link from "next/link";
import { ContactCTA } from "@/components/site/ContactCTA";

const logoStack = { url: "/assets/logo_stack_navy_new.webp" };
export function SiteFooter() {
  return (
    <>
      <ContactCTA />

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
            <img loading="lazy" decoding="async"
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
                color: "rgba(12,25,47,.62)",
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
                color: "rgba(12,25,47,.62)",
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
                color: "rgba(12,25,47,.62)",
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
              <Link href="/contact" style={{ color: "rgba(12,25,47,.62)" }}>
                Nous écrire
              </Link>
              <Link href="/diagnostic" style={{ color: "rgba(12,25,47,.62)" }}>
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
            color: "rgba(12,25,47,.62)",
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
              style={{ color: "rgba(12,25,47,.62)" }}
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

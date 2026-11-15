"use client";

import Link from "next/link";

import { useState } from "react";
import { useContenuGlobal } from "@/components/site/ContenuGlobal";

// Lockup horizontal de la marque (l'icone et le mot NORVIKA cote a cote), en SVG :
// net a toutes les tailles. Le logo, les liens et le bouton viennent du Studio
// (« Infos de l'entreprise » et « Menu et pied de page »).
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { parametres, navigation } = useContenuGlobal();
  const wordmark = parametres.logoEntete;
  const links = navigation.liensMenu.map((l) => ({ to: l.lien, label: l.libelle }));
  const LIEN_RDV = parametres.lienRendezVous;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: "1px solid rgba(255,255,255,.7)",
        boxShadow:
          "0 1px 0 rgba(12,25,47,.05), 0 18px 40px -30px rgba(12,25,47,.45)",
        background:
          "linear-gradient(to bottom, rgba(255,255,255,.62), rgba(255,255,255,.38))",
        backdropFilter: "blur(34px) saturate(190%)",
        WebkitBackdropFilter: "blur(34px) saturate(190%)",
      }}
    >
      <div
        className="nv-shell nv-header-shell"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <img
            src={wordmark.url}
            alt={wordmark.alt ?? ""}
            width={158}
            height={26}
            style={{ height: 26, width: "auto", display: "block" }}
          />
        </Link>
        <nav
          className="nv-desktop-nav"
          style={{ display: "flex", gap: 30, fontSize: 14 }}
        >
          {links.map((l) => (
            <Link key={l.to} href={l.to} className="nv-navlink">
              {l.label}
            </Link>
          ))}
        </nav>
        <a
          href={LIEN_RDV}
          className="nv-btn-primary nv-header-cta"
          style={{
            padding: "11px 20px",
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 600,
          }}
         target="_blank" rel="noopener noreferrer">
          {navigation.boutonRendezVous}
        </a>
        <button
          type="button"
          className="nv-burger"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 42,
            height: 42,
            padding: 0,
            borderRadius: 10,
            border: "1px solid rgba(12,25,47,.14)",
            background: "rgba(255,255,255,.6)",
            cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="#0C192F"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="#0C192F"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <nav
          className="nv-burger-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "8px 18px 18px",
            borderTop: "1px solid rgba(12,25,47,.08)",
            background: "rgba(255,255,255,.92)",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              onClick={() => setOpen(false)}
              className="nv-navlink"
              style={{ padding: "12px 4px", fontSize: 16 }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={LIEN_RDV}
            onClick={() => setOpen(false)}
            className="nv-btn-primary"
            style={{
              marginTop: 8,
              padding: "14px 20px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textAlign: "center",
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {navigation.boutonRendezVous}
          </a>
        </nav>
      ) : null}
    </header>
  );
}

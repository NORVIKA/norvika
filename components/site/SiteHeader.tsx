"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { useContenuGlobal } from "@/components/site/ContenuGlobal";
import { LienTelephone } from "@/components/site/LienTelephone";

// Lockup horizontal de la marque (l'icone et le mot NORVIKA cote a cote), en SVG :
// net a toutes les tailles. Le logo, les liens et le bouton viennent du Studio
// (« Infos de l'entreprise » et « Menu et pied de page »).
// Telephone : dans le menu deroulant seulement (components/site/LienTelephone.tsx). Retire de la
// barre d'ordinateur le 2026-11-22, decision de William, pour faire place au lien du verificateur
// Loi 25 : avec le numero, un 7e lien passait la barre sur deux lignes des 1200 px. Le numero
// reste au pied de chaque page et sur /contact.
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const bouton = useRef<HTMLButtonElement>(null);
  const { parametres, navigation } = useContenuGlobal();

  // Menu de téléphone ouvert (constat 8 de Pixel) : Échap le ferme et rend le focus au bouton,
  // et la page ne défile plus derrière (patron « body scroll lock » du CLAUDE.md).
  useEffect(() => {
    if (!open) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      bouton.current?.focus();
    };
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", surTouche);
    return () => {
      document.body.style.overflow = avant;
      document.removeEventListener("keydown", surTouche);
    };
  }, [open]);
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
      {/* Lien d'évitement (WCAG 2.4.1) : premier arrêt du clavier sur chaque page, invisible tant
          qu'il n'a pas le focus. Il mène au <main id="contenu"> de la page. */}
      <a href="#contenu" className="nv-evitement">
        {navigation.lienEvitement}
      </a>
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
        <Link href="/" className="nv-logo-lien" style={{ display: "flex", alignItems: "center", gap: 11 }}>
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
        <div className="nv-header-actions">
          <a
            href={LIEN_RDV}
            className="nv-btn-primary nv-header-cta"
            style={{
              padding: "11px 20px",
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {navigation.boutonRendezVous}
          </a>
        </div>
        <button
          ref={bouton}
          type="button"
          className="nv-burger"
          aria-label={open ? navigation.menuFermer : navigation.menuOuvrir}
          aria-expanded={open}
          aria-controls={open ? "menu-mobile" : undefined}
          onClick={() => setOpen((o) => !o)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 42,
            height: 42,
            padding: 0,
            borderRadius: 10,
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
          id="menu-mobile"
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
          <LienTelephone onClick={() => setOpen(false)} />
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

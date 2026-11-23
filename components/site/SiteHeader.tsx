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
//
// BARRE FIXE, DEUX TONS (2026-11-23, demande de William, modele bfroz.com). Forme et couleurs :
// globals.css, « Barre du haut », declarees une seule fois. Ici, seulement l'etat :
//  - data-ton="video" (accueil seulement, `surVideo`) : transparente sur la video du haut de page
//    tant qu'on n'a pas descendu de plus de SEUIL_TON px ; au-dela, bleu marine (data-defile) ;
//  - sans data-ton : bleu marine des le depart (pages interieures). Une cale de la hauteur de la
//    barre la remplace dans le flux : le contenu ne bouge pas d'un pixel (CLS 0) ;
//  - data-cache : la barre glisse hors de l'ecran pendant qu'on descend, et revient des qu'on
//    remonte de SEUIL px. Jamais cachee en haut de page, menu ouvert, focus clavier dedans (CSS
//    :has(:focus-visible), plus le focusin ci-dessous), ni si l'appareil demande moins d'animations.
// Le defilement est lu par un ecouteur passif, regroupe par requestAnimationFrame, et ecrit
// directement des attributs sur la barre : aucun rendu React pendant qu'on defile.
// Sans JavaScript : sur l'accueil, la barre transparente defile avec la page (position absolute,
// tant que data-actif manque) au lieu de rester blanche sur fond blanc ; ailleurs, elle reste fixe.

/** Distance a parcourir dans le meme sens avant de cacher ou de rendre la barre : sous ce seuil,
 *  un tremblement du pave tactile la ferait clignoter. */
const SEUIL = 10;
/** Accueil : au-dela, la barre transparente devient bleu marine. Plus haut que la zone ou elle
 *  peut se cacher (sa propre hauteur, 60 px) : en descendant, elle sort encore transparente et
 *  change de ton hors de l'ecran, au lieu de virer au bleu pendant qu'elle glisse. */
const SEUIL_TON = 80;
const MOINS_DE_MOUVEMENT = "(prefers-reduced-motion: reduce)";

export function SiteHeader({ surVideo = false }: { surVideo?: boolean }) {
  const [open, setOpen] = useState(false);
  const bouton = useRef<HTMLButtonElement>(null);
  const barre = useRef<HTMLElement>(null);
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

  // Ton et position de la barre, selon le défilement.
  useEffect(() => {
    const el = barre.current;
    if (!el) return;
    const mouvement = window.matchMedia(MOINS_DE_MOUVEMENT);
    const poser = (nom: string, oui: boolean) => {
      if (oui) el.setAttribute(nom, "");
      else el.removeAttribute(nom);
    };

    let dernier = Math.max(0, window.scrollY);
    // Position où le sens du défilement a changé : le seuil se compte depuis là.
    let ancre = dernier;
    let sens = 0;
    let image = 0;

    const lire = () => {
      image = 0;
      // Le rebond de Safari en haut de page donne un scrollY négatif.
      const y = Math.max(0, window.scrollY);
      if (y !== dernier) {
        const s = y > dernier ? 1 : -1;
        if (s !== sens) {
          sens = s;
          ancre = dernier;
        }
        dernier = y;
      }
      poser("data-defile", y > SEUIL_TON);
      const hauteur = el.offsetHeight;
      if (y <= hauteur || mouvement.matches) poser("data-cache", false);
      else if (sens > 0 && y - ancre > SEUIL) poser("data-cache", true);
      else if (sens < 0 && ancre - y > SEUIL) poser("data-cache", false);
    };
    const surDefilement = () => {
      if (!image) image = window.requestAnimationFrame(lire);
    };
    // Le focus clavier entre dans la barre (lien d'évitement, Maj+Tab) : elle revient, et reste
    // là quand le focus en ressort, jusqu'au prochain mouvement vers le bas.
    const surFocus = () => {
      ancre = dernier;
      sens = 0;
      poser("data-cache", false);
    };

    lire();
    el.setAttribute("data-actif", "");
    window.addEventListener("scroll", surDefilement, { passive: true });
    el.addEventListener("focusin", surFocus);
    mouvement.addEventListener("change", lire);
    return () => {
      window.removeEventListener("scroll", surDefilement);
      el.removeEventListener("focusin", surFocus);
      mouvement.removeEventListener("change", lire);
      if (image) window.cancelAnimationFrame(image);
    };
  }, []);

  const wordmark = parametres.logoEntete;
  const links = navigation.liensMenu.map((l) => ({ to: l.lien, label: l.libelle }));
  const LIEN_RDV = parametres.lienRendezVous;

  return (
    <>
      {surVideo ? null : <div className="nv-entete-cale" aria-hidden="true" />}
      <header
        ref={barre}
        className="nv-entete"
        data-ton={surVideo ? "video" : undefined}
        data-menu={open ? "" : undefined}
      >
        {/* Lien d'évitement (WCAG 2.4.1) : premier arrêt du clavier sur chaque page, invisible tant
            qu'il n'a pas le focus. Il mène au <main id="contenu"> de la page. */}
        <a href="#contenu" className="nv-evitement">
          {navigation.lienEvitement}
        </a>
        <div className="nv-shell nv-header-shell">
          <Link href="/" className="nv-logo-lien">
            <img src={wordmark.url} alt={wordmark.alt ?? ""} width={158} height={26} />
          </Link>
          <nav className="nv-desktop-nav">
            {links.map((l) => (
              <Link key={l.to} href={l.to} className="nv-navlink">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="nv-header-actions">
            <a
              href={LIEN_RDV}
              className="nv-btn-cream nv-header-cta"
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
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {open ? (
          <nav id="menu-mobile" className="nv-burger-panel">
            {links.map((l) => (
              <Link key={l.to} href={l.to} onClick={() => setOpen(false)} className="nv-navlink">
                {l.label}
              </Link>
            ))}
            <LienTelephone onClick={() => setOpen(false)} />
            <a
              href={LIEN_RDV}
              onClick={() => setOpen(false)}
              className="nv-btn-cream nv-burger-cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              {navigation.boutonRendezVous}
            </a>
          </nav>
        ) : null}
      </header>
    </>
  );
}

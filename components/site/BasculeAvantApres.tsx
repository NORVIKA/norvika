"use client";

import { useRef, useState } from "react";

/**
 * Bascule Avant / Apres pour montrer une refonte.
 *
 * ⚠️ POURQUOI UNE BASCULE ET NON UNE GLISSIERE A BALAYAGE.
 * Le balayage a ete essaye puis retire : il coupe les deux sites en deux et on
 * ne voit jamais ni l'un ni l'autre au complet. Ici chaque version occupe tout
 * le cadre a son tour, donc l'ancien site a droit a la meme scene que le
 * nouveau. Quand l'ancien etait mauvais, c'est justement ce qu'on veut montrer.
 *
 * ⚠️ ON OUVRE SUR « AVANT », JAMAIS SUR « APRES ».
 * Dans ce sens-la, le visiteur arrive sur le vieux site, clique, et recoit le
 * nouveau : c'est une petite histoire. Dans l'autre sens, ce n'est qu'une
 * archive.
 *
 * Les deux captures sont des pages completes, donc tres hautes. Le cadre a
 * une hauteur fixe et defile a l'interieur, sinon il faudrait les reduire au
 * point de ne plus rien lire.
 */
export function BasculeAvantApres({
  avant,
  avant2x,
  apres,
  apres2x,
  alt,
}: {
  avant: string;
  /** Version haute densité, servie aux écrans Retina. */
  avant2x?: string;
  apres: string;
  apres2x?: string;
  /** Le site montre, pour les lecteurs d'ecran. */
  alt: string;
}) {
  const [vue, setVue] = useState<"avant" | "apres">("avant");
  const ecran = useRef<HTMLDivElement>(null);

  const changer = (v: "avant" | "apres") => {
    setVue(v);
    // Remettre en haut : sinon on bascule et on se retrouve au milieu de
    // l'autre page, sans savoir ou on est.
    ecran.current?.scrollTo({ top: 0 });
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={`Comparer avant et après: ${alt}`}
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 18,
        }}
      >
        {(["avant", "apres"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={vue === v}
            onClick={() => changer(v)}
            className={vue === v ? "nv-btn-primary" : "nv-cta-outline"}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid",
              borderColor: vue === v ? "#0C192F" : undefined,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {v === "avant" ? "Avant" : "Après"}
          </button>
        ))}
      </div>

      {/* La barre du navigateur. Elle n'est pas decorative : sans elle, une
          capture de site pleine page ressemble a une longue affiche. */}
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 13px",
          borderRadius: "14px 14px 0 0",
          background: "#DFE3EC",
        }}
      >
        <Pastille />
        <Pastille />
        <Pastille />
        <span
          style={{
            marginLeft: 10,
            padding: "5px 13px",
            borderRadius: 999,
            background: "#fff",
            fontSize: 11.5,
            color: "rgba(12,25,47,.55)",
          }}
        >
          crossfitsaintefoy.com
        </span>
      </div>

      <div
        ref={ecran}
        style={{
          // Grand volontairement : c'est la piece de demonstration de la page.
          // Le plafond a 760 px evite qu'elle depasse un portable de 900 px de
          // haut, ou on ne verrait plus ni les boutons ni le reste de la page.
          height: "clamp(420px, 72vh, 760px)",
          overflowY: "auto",
          borderRadius: "0 0 14px 14px",
          border: "1px solid rgba(12,25,47,.14)",
          borderTop: 0,
          background: "#fff",
        }}
      >
        {/* ⚠️ DEUX TAILLES, PAS UNE. Le cadre fait environ 1 180 px de large :
            sur un ecran Retina, cela demande 2 360 px reels. Servir seulement
            la version 1x donnait une capture floue. Servir seulement la 2x
            imposerait 420 Ko a tout le monde, y compris aux telephones. Le
            navigateur choisit selon l'ecran, et l'image n'est chargee que
            quand la section arrive a l'ecran. */}
        <img
          key={vue}
          src={vue === "avant" ? avant : apres}
          srcSet={
            vue === "avant"
              ? avant2x
                ? `${avant} 1240w, ${avant2x} 1440w`
                : undefined
              : apres2x
                ? `${apres} 1240w, ${apres2x} 2360w`
                : undefined
          }
          sizes="(min-width: 1304px) 1176px, (min-width: 820px) calc(100vw - 128px), calc(100vw - 64px)"
          alt={`${alt} — ${vue === "avant" ? "avant" : "après"} la refonte`}
          loading="lazy"
          style={{ width: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}

function Pastille() {
  return (
    <span
      style={{
        width: 9,
        height: 9,
        borderRadius: 999,
        background: "#BCC3D2",
        display: "block",
      }}
    />
  );
}

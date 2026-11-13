"use client";

import { useId, useState } from "react";

/**
 * Glissiere avant / apres, pour montrer une refonte.
 *
 * ⚠️ LES DEUX IMAGES DOIVENT AVOIR EXACTEMENT LE MEME CADRAGE.
 * Le principe du balayage ne tient que si les deux captures ont la meme
 * largeur, la meme hauteur et le meme point de depart (le haut de la page,
 * sans defiler). Deux captures prises a des tailles de fenetre differentes
 * donnent une comparaison qui ment, et le raccord saute aux yeux.
 *
 * La poignee est un `input[type=range]` rendu invisible mais pose par-dessus
 * tout le cadre : on garde la souris, le tactile, les fleches du clavier et la
 * lecture d'ecran sans ecrire une ligne de gestion d'evenements.
 */
export function AvantApres({
  avant,
  apres,
  alt,
  ratio = "1006 / 592",
}: {
  avant: string;
  apres: string;
  /** Ce que montrent les deux captures, pour les lecteurs d'ecran. */
  alt: string;
  ratio?: string;
}) {
  const [position, setPosition] = useState(45);
  const id = useId();

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(12,25,47,.12)",
        background: "#0C192F",
        userSelect: "none",
      }}
    >
      <img
        src={avant}
        alt={`${alt} — avant`}
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 0 0 ${position}%)`,
        }}
      >
        <img
          src={apres}
          alt=""
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <Etiquette cote="gauche" texte="Avant" />
      <Etiquette cote="droite" texte="Après" />

      {/* Le trait et la pastille. `pointer-events: none` : c'est la glissiere
          invisible en dessous qui recoit les clics, sur toute la surface. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${position}%`,
          width: 2,
          marginLeft: -1,
          background: "rgba(245,243,238,.95)",
          boxShadow: "0 0 18px rgba(12,25,47,.55)",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            width: 44,
            height: 44,
            borderRadius: 999,
            background: "rgba(245,243,238,.96)",
            boxShadow: "0 14px 30px -14px rgba(12,25,47,.9)",
            color: "#0C192F",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "-.05em",
          }}
        >
          ‹ ›
        </span>
      </div>

      <label htmlFor={id} className="nv-visuellement-cache">
        {`Comparer avant et après: ${alt}`}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="nv-avant-apres-poignee"
      />
    </div>
  );
}

function Etiquette({
  cote,
  texte,
}: {
  cote: "gauche" | "droite";
  texte: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        // En bas plutot qu'en haut : les deux captures ont leur entete en
        // haut, et l'etiquette venait se poser sur le logo du client.
        bottom: 14,
        [cote === "gauche" ? "left" : "right"]: 14,
        padding: "5px 11px",
        borderRadius: 999,
        background: "rgba(12,25,47,.62)",
        color: "#F5F3EE",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".16em",
        textTransform: "uppercase",
        pointerEvents: "none",
      }}
    >
      {texte}
    </span>
  );
}

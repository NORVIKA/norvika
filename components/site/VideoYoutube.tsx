"use client";

import { useState } from "react";

/**
 * Lecteur YouTube a chargement differe.
 *
 * ⚠️ POURQUOI UNE FACADE PLUTOT QU'UN IFRAME DIRECT
 * Un iframe YouTube pose en dur charge environ un demi-megaoctet de scripts
 * des l'ouverture de la page, pour une video que la plupart des visiteurs ne
 * regarderont pas. Ici, tant que personne ne clique, il n'y a qu'un panneau et
 * un bouton. L'iframe n'apparait qu'au clic, et le domaine est
 * youtube-nocookie.com : aucun cookie de suivi n'est depose avant la lecture,
 * donc rien a negocier avec la banniere de consentement.
 *
 * ⚠️ LA VIGNETTE VIENT DE YOUTUBE, ET LE NOM DE FICHIER COMPTE.
 * `hqdefault.jpg` et `maxresdefault.jpg` sont toujours en 16/9 : dans un cadre
 * vertical, ils donnent une image recadree ou cernee de bandes noires.
 * `oardefault.jpg` (original aspect ratio) rend la vraie image verticale du
 * Short, en 1080x1920. D'ou le choix selon le format. Ces vignettes obligent
 * `img-src https://i.ytimg.com` dans la CSP ; elles ne deposent pas de cookie.
 */
export function VideoYoutube({
  youtubeId,
  titre,
  format = "horizontal",
  largeurMax = 340,
}: {
  youtubeId: string;
  titre: string;
  format?: "vertical" | "horizontal";
  /** Largeur maximale d'une vidéo verticale, en pixels. Sans effet à l'horizontale. */
  largeurMax?: number;
}) {
  const [joue, setJoue] = useState(false);
  const vertical = format === "vertical";

  return (
    <div
      style={{
        position: "relative",
        margin: "0 auto",
        width: "100%",
        maxWidth: vertical ? largeurMax : "100%",
        aspectRatio: vertical ? "9 / 16" : "16 / 9",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(12,25,47,.1)",
        background: "#0C192F",
      }}
    >
      {joue ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={titre}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setJoue(true)}
          aria-label={`Lire la vidéo: ${titre}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            padding: 0,
            border: 0,
            cursor: "pointer",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/${
              vertical ? "oardefault" : "maxresdefault"
            }.jpg`}
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
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(12,25,47,.08), rgba(12,25,47,.4))",
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 68,
              height: 68,
              borderRadius: 999,
              background: "rgba(245,243,238,.94)",
              boxShadow: "0 18px 40px -18px rgba(12,25,47,.9)",
            }}
          >
            <span
              style={{
                width: 0,
                height: 0,
                marginLeft: 5,
                borderTop: "13px solid transparent",
                borderBottom: "13px solid transparent",
                borderLeft: "21px solid #0C192F",
              }}
            />
          </span>
        </button>
      )}
    </div>
  );
}

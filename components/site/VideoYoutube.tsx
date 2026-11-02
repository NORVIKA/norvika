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
 * ⚠️ PAS DE VIGNETTE YOUTUBE. On pourrait afficher i.ytimg.com en fond du
 * bouton, mais il faudrait ouvrir `img-src` a un domaine de plus dans la CSP,
 * et la vignette d'un Short est une image 16/9 qu'il faut recadrer pour un
 * cadre vertical. Un panneau sombre coute moins cher et ne casse pas.
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

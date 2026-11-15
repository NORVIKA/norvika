"use client";

import Link from "next/link";

import type { Realisation } from "@/lib/types-contenu";

export function ClientLogoCard({ client }: { client: Realisation }) {
  const scale = client.logoEchelle ?? 1;
  const isSquare = client.logoForme === "square";

  let media: React.ReactNode;

  if (client.logoStyle === "transparent") {
    media = (
      <img
        src={client.logo.url}
        alt={client.nom}
        loading="lazy"
        className="nv-logo-img"
        style={{
          maxHeight: (isSquare ? 62 : 46) * scale,
          maxWidth: `${(isSquare ? 62 : 100) * scale}%`,
        }}
      />
    );
  } else if (client.logoStyle === "round") {
    const size = 96 * (client.logoEchelle ? 1 : 1);
    media = (
      <span className="nv-logo-round" style={{ width: size, height: size }}>
        <img src={client.logo.url} alt={client.nom} loading="lazy" />
      </span>
    );
  } else if (client.logoStyle === "brand") {
    media = (
      <span
        className="nv-logo-tile"
        style={{
          width: isSquare ? 84 : 168,
          height: isSquare ? 84 : 74,
        }}
      >
        <img src={client.logo.url} alt={client.nom} loading="lazy" />
      </span>
    );
  } else {
    media = (
      <span
        className="nv-logo-tile nv-logo-tile-dark"
        style={{ width: isSquare ? 84 : 168, height: isSquare ? 84 : 74 }}
      >
        <img
          src={client.logo.url}
          alt={client.nom}
          loading="lazy"
          style={{ objectFit: "contain", padding: "10px 14px" }}
        />
      </span>
    );
  }

  return (
    <Link
      href={`/realisations/${client.slug}`}
      className="nv-logo-card"
    >
      <span className="nv-logo-zone">{media}</span>
      <span className="nv-logo-name">{client.nom}</span>
    </Link>
  );
}

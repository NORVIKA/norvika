import type { Metadata } from "next";

import type { Seo } from "./types-contenu";

/**
 * Les balises Google et de partage d'une page, depuis ses champs « Google et partage » du Studio.
 * Même forme que les métadonnées écrites à la main avant Sanity : titre absolu, description,
 * adresse canonique, Open Graph (titre et description de partage, sinon ceux de Google).
 */
export function metaPage(seo: Seo, chemin: string, options: { type?: "article" } = {}): Metadata {
  const image = seo.partageImage?.url;
  return {
    title: { absolute: seo.seoTitre },
    description: seo.seoDescription,
    alternates: { canonical: chemin },
    openGraph: {
      title: seo.partageTitre || seo.seoTitre,
      description: seo.partageDescription || seo.seoDescription,
      url: chemin,
      ...(options.type ? { type: options.type } : {}),
      ...(image ? { images: [image] } : {}),
    },
    ...(image ? { twitter: { card: "summary_large_image", images: [image] } } : {}),
  };
}

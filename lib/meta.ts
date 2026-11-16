import type { Metadata } from "next";

import type { Image, Parametres, Seo } from "./types-contenu";

/** Format des images de partage (Facebook, LinkedIn, Slack, iMessage) : 1200 x 630, ratio 1,91:1. */
const LARGEUR = 1200;
const HAUTEUR = 630;

/**
 * Une image de Sanity recadrée en 1200 x 630, par le CDN de Sanity (aucun fichier à fabriquer).
 * Le recadrage suit le point focal posé dans le Studio (« hotspot ») ; sans point focal, `repli` :
 * le centre (essayé sur les 9 couvertures du 2026-11-16 : meilleur que « entropy », qui gardait des
 * bras ou une machine plutôt que les visages), ou le haut pour une capture d'écran de site.
 * JPEG plutôt que WebP : certains robots de partage lisent mal le WebP.
 */
export function imagePartage(image: Image, repli: "center" | "top" = "center") {
  const params = new URLSearchParams({ w: String(LARGEUR), h: String(HAUTEUR), fit: "crop", fm: "jpg", q: "82" });
  if (image.hotspot) {
    params.set("crop", "focalpoint");
    params.set("fp-x", String(Math.round(image.hotspot.x * 1000) / 1000));
    params.set("fp-y", String(Math.round(image.hotspot.y * 1000) / 1000));
  } else {
    params.set("crop", repli);
  }
  return { url: `${image.url}?${params.toString()}`, width: LARGEUR, height: HAUTEUR, alt: image.alt ?? "" };
}

/**
 * Les balises Open Graph communes à toutes les pages. ⚠️ Next ne FUSIONNE PAS l'openGraph d'une
 * page avec celui du layout : il le REMPLACE en entier. Avant le 2026-11-16, chaque page perdait
 * ainsi l'image, le nom du site, la langue et le type (38 pages sur 39 sans image de partage,
 * constat 3 de Pixel). Toute page qui définit son openGraph passe donc par ici.
 */
export function partage(
  parametres: Parametres,
  {
    titre,
    description,
    chemin,
    image,
    type = "website",
  }: { titre: string; description: string; chemin: string; image: ReturnType<typeof imagePartage>; type?: "website" | "article" },
): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title: titre,
      description,
      url: chemin,
      siteName: parametres.nom,
      locale: "fr_CA",
      type,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: titre, description, images: [image.url] },
  };
}

/**
 * Les balises Google et de partage d'une page, depuis ses champs « Google et partage » du Studio :
 * titre absolu, description, adresse canonique, Open Graph (titre et description de partage, sinon
 * ceux de Google ; image de partage de la page, sinon celle d'« Infos de l'entreprise »).
 */
export function metaPage(seo: Seo, chemin: string, parametres: Parametres): Metadata {
  return {
    title: { absolute: seo.seoTitre },
    description: seo.seoDescription,
    alternates: { canonical: chemin },
    ...partage(parametres, {
      titre: seo.partageTitre || seo.seoTitre,
      description: seo.partageDescription || seo.seoDescription,
      chemin,
      image: imagePartage(seo.partageImage ?? parametres.imagePartage),
    }),
  };
}

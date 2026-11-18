import type { Image } from "./types-contenu";

/**
 * Les tailles de l'image d'attente de la vidéo du haut de l'accueil, DÉCLARÉES UNE FOIS : la route
 * qui les sert (app/fond-accueil/[fichier]/route.ts) et le composant qui les affiche
 * (components/site/FondVideo.tsx) lisent cette liste.
 *
 * ⚠️ POURQUOI SERVIES PAR NORVIKA.CA, ET PAS DIRECTEMENT PAR CDN.SANITY.IO
 * Cette image est l'élément LCP de l'accueil (le plus grand élément du premier écran). Lighthouse
 * mobile, mesuré le 2026-11-18 sur le build local (3 passes chaque fois) : venue de cdn.sanity.io,
 * elle dépendait du délai variable du CDN de Sanity (une taille pas encore en cache répondait en
 * 0,6 s) : LCP de 3,1 à 5,4 s, score de 79 à 93. Copiée au BUILD sur le domaine du site : LCP 3,1 s
 * et 93, stables. Avant la vidéo : 95-96, LCP 2,8 s, et l'élément LCP était le paragraphe.
 * Elle vient toujours du Studio : changer l'image dans Sanity la change ici à la publication suivante.
 *
 * Le nom du fichier porte l'identifiant de l'image, le point focal et la qualité : une nouvelle image ou un
 * nouveau recadrage donnent une nouvelle adresse, donc le cache d'un an ne sert jamais l'ancienne.
 *
 * ⚠️ SUR TÉLÉPHONE, UNE IMAGE FLOUE DE 350 OCTETS, ET C'EST VOULU (2026-11-18, accueil en ligne)
 * PageSpeed mobile en ligne, avec l'affiche nette comme élément LCP : 86 en médiane (82 à 96),
 * contre 98 avant la vidéo. Le « délai de rendu » de l'affiche y coûtait plus de 2 s. Chrome
 * (depuis la version 112) n'accepte pas comme élément LCP une image à faible entropie : moins de
 * 0,05 bit d'image par pixel affiché. 350 octets sur un haut de page de 412 x 528, c'est 0,013 :
 * l'élément LCP redevient le paragraphe, peint dès le premier rendu, comme avant la vidéo.
 * Sous le voile à 66 %, l'image agrandie se lit comme un flou d'ambiance, puis la vidéo arrive
 * en fondu par-dessus. L'affiche NETTE reste pour l'ordinateur, et pour les téléphones qui ont
 * demandé moins d'animations (ils n'auront jamais la vidéo : l'image est tout ce qu'ils verront).
 * ⛔ Ne pas grossir l'image floue au-delà d'environ 1 Ko : passé 0,05 bit par pixel sur le plus
 *    petit téléphone (environ 320 x 560), elle redevient l'élément LCP.
 */

export const CHEMIN_AFFICHE = "/fond-accueil";

/**
 * - `portrait` : recadrage vertical net pour les téléphones (point focal du Studio) ;
 * - `paysage` : l'image entière, nette, pour l'ordinateur et la tablette ;
 * - `flou` : le même recadrage vertical en 48 x 64, flouté, d'environ 350 octets (voir plus bas).
 */
export type RoleAffiche = "portrait" | "paysage" | "flou";

export type VarianteAffiche = {
  /** Nom du fichier servi sous /fond-accueil/. */
  fichier: string;
  largeur: number;
  role: RoleAffiche;
  /** L'adresse au CDN de Sanity, lue au build seulement. */
  source: string;
};

const PORTRAIT: readonly (readonly [number, number])[] = [
  [480, 640],
  [750, 1000],
  [810, 1080],
];
const PAYSAGE: readonly number[] = [960, 1440, 1920];
/** Qualité WebP. Elle fait partie du nom du fichier : la changer change l'adresse (cache d'un an). */
const QUALITE = 55;
const QUALITE_FLOU = 45;

/** Accepte seulement l'adresse d'une image du projet Sanity de Norvika. */
const ADRESSE_SANITY = /^https:\/\/cdn\.sanity\.io\/images\/k99pdqd1\/[a-z0-9_-]+\/([a-zA-Z0-9-]+)\.[a-z0-9]+$/;

export function variantesAffiche(image: Image | null | undefined): VarianteAffiche[] {
  const id = image?.url.match(ADRESSE_SANITY)?.[1];
  if (!image || !id) return [];
  const fx = image.hotspot?.x ?? 0.5;
  const fy = image.hotspot?.y ?? 0.5;
  const point = `${Math.round(fx * 100)}x${Math.round(fy * 100)}`;
  const parametres = (p: string) => `${image.url}?${p}&fm=webp&q=${QUALITE}`;
  const recadrage = `fit=crop&crop=focalpoint&fp-x=${fx}&fp-y=${fy}`;
  return [
    ...PORTRAIT.map(([w, h]) => ({
      fichier: `${id}-p${w}-${point}-q${QUALITE}.webp`,
      largeur: w,
      role: "portrait" as const,
      source: parametres(`w=${w}&h=${h}&${recadrage}`),
    })),
    ...PAYSAGE.map((w) => ({ fichier: `${id}-l${w}-q${QUALITE}.webp`, largeur: w, role: "paysage" as const, source: parametres(`w=${w}`) })),
    {
      fichier: `${id}-flou-${point}-q${QUALITE_FLOU}.webp`,
      largeur: 48,
      role: "flou" as const,
      source: `${image.url}?w=48&h=64&blur=10&${recadrage}&fm=webp&q=${QUALITE_FLOU}`,
    },
  ];
}

/** L'attribut srcset d'un groupe de tailles, en adresses du site. */
export function srcSetAffiche(variantes: VarianteAffiche[], role: RoleAffiche): string {
  return variantes
    .filter((v) => v.role === role)
    .map((v) => `${CHEMIN_AFFICHE}/${v.fichier} ${v.largeur}w`)
    .join(", ");
}

/**
 * Les vignettes des vidéos YouTube, servies par NORVIKA.CA et non par i.ytimg.com (2026-11-18).
 *
 * ⚠️ POURQUOI : avant, l'accueil chargeait 4 vignettes depuis i.ytimg.com dès l'arrivée, avant tout
 * clic. L'adresse IP de chaque visiteur partait donc chez Google (YouTube) sans qu'il ait rien
 * demandé, ce que notre propre vérificateur Loi 25 classe « à corriger » (point 7, services
 * externes chargés dès l'arrivée ; art. 8 et 17). Copiées AU BUILD sur le domaine du site (même
 * patron que l'image d'attente de l'accueil, lib/fond-video.ts), plus rien ne part chez Google
 * avant le clic sur lecture. Bonus : la version WebP de YouTube, de 30 à 40 % plus légère que le JPEG.
 *
 * Fichier sans dépendance serveur : le composant VideoYoutube (client) et la route
 * app/vignettes-youtube/[fichier]/route.ts lisent les mêmes noms.
 */

export const CHEMIN_VIGNETTES = "/vignettes-youtube";

export type FormatVideo = "vertical" | "horizontal";

/** Un identifiant YouTube : 11 caractères en pratique, jamais de barre oblique ni de point. */
export const ID_YOUTUBE_VALIDE = /^[A-Za-z0-9_-]{6,20}$/;

/** Le nom du fichier servi : l'identifiant et le format (la vignette n'est pas la même). */
export const fichierVignette = (youtubeId: string, format: FormatVideo) => `${youtubeId}-${format}`;

export const adresseVignette = (youtubeId: string, format: FormatVideo) => `${CHEMIN_VIGNETTES}/${fichierVignette(youtubeId, format)}`;

/**
 * Les adresses chez YouTube, essayées dans l'ordre au build. `oardefault` (format d'origine) rend la
 * vraie image verticale d'un Short ; `maxresdefault` est en 16/9. WebP d'abord, JPEG en repli.
 */
export function sourcesVignette(youtubeId: string, format: FormatVideo): string[] {
  const nom = format === "vertical" ? "oardefault" : "maxresdefault";
  return [`https://i.ytimg.com/vi_webp/${youtubeId}/${nom}.webp`, `https://i.ytimg.com/vi/${youtubeId}/${nom}.jpg`];
}

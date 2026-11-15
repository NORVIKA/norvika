/**
 * L'adresse du site, déclarée une fois. Fichier sans dépendance serveur : le fil d'Ariane (composant
 * « client ») s'en sert pour ses données structurées, le sitemap et /llms.txt aussi.
 */
export const BASE = "https://norvika.ca";

/** L'adresse absolue d'un chemin du site (l'accueil sans barre finale, comme partout ailleurs). */
export const adresseAbsolue = (chemin: string): string => (chemin === "/" ? BASE : `${BASE}${chemin}`);

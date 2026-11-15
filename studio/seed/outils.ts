/**
 * Outils du semis : écrire le contenu de départ lisiblement, puis le convertir au format Sanity
 * (clés de tableau, références, images à téléverser). Porté d'immuart/sanity/seed/outils.mjs.
 */
let compteur = 0
/** Clé stable d'un élément de tableau : le même semis donne les mêmes clés (rejouable). */
export const k = (prefixe = 'k') => `${prefixe}${(compteur++).toString(36)}`
export const remettreCles = () => {
  compteur = 0
}

export type ImageSemis = { _semisImage: string; alt?: string; hotspot?: { x: number; y: number } }

/** Une image de public/ à téléverser. Remplacée par une référence d'asset au semis. */
export const img = (fichier: string, alt?: string, hotspot?: { x: number; y: number }): ImageSemis => ({
  _semisImage: fichier,
  ...(alt !== undefined ? { alt } : {}),
  ...(hotspot ? { hotspot } : {}),
})

/** Une référence à un autre document (dans un tableau, elle porte sa clé). */
export const ref = (id: string) => ({ _type: 'reference', _ref: id, _key: k('r') })
export const refSeule = (id: string) => ({ _type: 'reference', _ref: id })

/** Ajoute _key et _type aux objets d'un tableau (Sanity l'exige). */
export function cles<T extends object>(tableau: T[], type?: string): (T & { _key: string })[] {
  return tableau.map((x) => ({ _key: k(), ...(type ? { _type: type } : {}), ...x }))
}

/** Une étape de parcours. `libelle` seulement s'il diffère du titre. */
export const etape = (titre: string, texte: string, libelle?: string) => ({
  _key: k('e'),
  _type: 'etape',
  titre,
  ...(libelle && libelle !== titre ? { libelle } : {}),
  texte,
})

export const carte = (titre: string, texte: string) => ({ _key: k('c'), _type: 'carte', titre, texte })

export type Document = { _id: string; _type: string; [cle: string]: unknown }

/**
 * IMPORT du contenu de départ de norvika.ca dans Sanity (projet k99pdqd1, jeu « production »).
 * Rejouable : identifiants de documents fixes, et une image déjà téléversée n'est pas recréée
 * (Sanity nomme un fichier par son empreinte : le même fichier donne le même identifiant).
 *
 *   cd studio && npx sanity exec scripts/semer.ts --with-user-token -- --essai       vérifie, n'écrit rien
 *   cd studio && npx sanity exec scripts/semer.ts --with-user-token                  crée ce qui manque
 *   cd studio && npx sanity exec scripts/semer.ts --with-user-token -- --remplacer   remplace tout
 *
 * ⚠️ Sans --remplacer, un document qui existe déjà n'est JAMAIS touché (createIfNotExists) : une
 *    modification faite dans le Studio ne peut pas être écrasée par erreur.
 * ⚠️ Authentification : la session du CLI Sanity de la personne connectée (--with-user-token).
 *    Aucun jeton d'écriture n'est créé, copié ni affiché.
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 *
 * Ce que fait le script :
 *   1. charge le contenu (seed/*.ts), repris mot pour mot du site d'avant ;
 *   2. REFUSE l'import si un texte contient un tiret cadratin ou demi-cadratin, une flèche ou le
 *      mot banni (mêmes règles que le Studio et que scripts/verifier-contenu.mjs) ;
 *   3. téléverse les images de public/ (une seule fois chacune) ;
 *   4. écrit tous les documents en UNE transaction.
 */
import { existsSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

import { getCliClient } from 'sanity/cli'

import * as accueil from '../seed/accueil'
import * as globaux from '../seed/globaux'
import type { Document } from '../seed/outils'
import * as pages from '../seed/pages'
import * as realisations from '../seed/realisations'
import * as services from '../seed/services'

const ID_PROJET = 'k99pdqd1'
const args = process.argv.slice(2)
const essai = args.includes('--essai')
const remplacer = args.includes('--remplacer')

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET) {
  console.error(`⛔ La configuration vise le projet ${client.config().projectId}, pas ${ID_PROJET} (Norvika). Rien n'est écrit.`)
  process.exit(1)
}

/* ------------------------------------------------------------ 1. le contenu */

const documents: Document[] = [
  globaux.parametres,
  globaux.navigation,
  globaux.blocContact,
  globaux.page404,
  services.pageSitesWeb,
  services.pageAutomatisation,
  services.pagePhotoVideo,
  services.pageFormation,
  pages.pageDiagnostic,
  pages.pageEquipe,
  ...pages.membres,
  pages.pageContact,
  pages.pageBienvenue,
  accueil.pageAccueil,
  ...accueil.avis,
  realisations.pageRealisations,
  ...realisations.realisations,
]

const ids = new Set<string>()
for (const d of documents) {
  if (ids.has(d._id)) throw new Error(`Identifiant en double : ${d._id}`)
  ids.add(d._id)
}

/* ------------------------------------------------------------ 2. garde-fous */

const FLECHES = /[←↑→↓↖↗↘↙⇐⇒⇠⇢➔➜➝➞➟➠⟵⟶⟹]/
const refus: string[] = []
function parcourir(valeur: unknown, chemin: string) {
  if (typeof valeur === 'string') {
    if (/^(https?:|mailto:|tel:|\/|#)/.test(valeur) || chemin.endsWith('_semisImage')) return
    if (/[—–]/.test(valeur)) refus.push(`${chemin} : tiret cadratin ou demi-cadratin : « ${valeur.slice(0, 80)} »`)
    if (FLECHES.test(valeur)) refus.push(`${chemin} : flèche`)
    if (/\bunivers\b/i.test(valeur)) refus.push(`${chemin} : mot banni`)
    return
  }
  if (Array.isArray(valeur)) valeur.forEach((v, i) => parcourir(v, `${chemin}[${i}]`))
  else if (valeur && typeof valeur === 'object') for (const [c, v] of Object.entries(valeur)) parcourir(v, `${chemin}.${c}`)
}
for (const d of documents) parcourir(d, d._id)
if (refus.length) {
  for (const r of refus) console.error(`  ✗ ${r}`)
  console.error(`⛔ ${refus.length} problème(s) dans le contenu : rien n'est importé.`)
  process.exit(1)
}

/* ------------------------------------------------------------ 3. images */

const RACINE_SITE = resolve(process.cwd(), '..')
const images = new Set<string>()
JSON.stringify(documents, (cle, v) => {
  if (cle === '_semisImage') images.add(v as string)
  return v
})
for (const f of images) {
  if (!existsSync(resolve(RACINE_SITE, f))) throw new Error(`Image introuvable : ${f}`)
}
console.log(`Contenu vérifié : ${documents.length} documents, ${images.size} images, aucun tiret long, aucune flèche, aucun mot banni.`)
if (essai) {
  console.log('Essai seulement : rien n’est écrit.')
  process.exit(0)
}

const televersees = new Map<string, string>()
async function televerser(relatif: string): Promise<string> {
  const deja = televersees.get(relatif)
  if (deja) return deja
  const tampon = readFileSync(resolve(RACINE_SITE, relatif))
  const asset = await client.assets.upload('image', tampon, { filename: basename(relatif) })
  televersees.set(relatif, asset._id)
  return asset._id
}

type Valeur = unknown
async function resoudre(valeur: Valeur): Promise<Valeur> {
  if (Array.isArray(valeur)) {
    const sortie = []
    for (const v of valeur) sortie.push(await resoudre(v))
    return sortie
  }
  if (!valeur || typeof valeur !== 'object') return valeur
  const objet = valeur as Record<string, unknown>
  if (typeof objet._semisImage === 'string') {
    const id = await televerser(objet._semisImage)
    const { _semisImage, hotspot, ...reste } = objet as { _semisImage: string; hotspot?: { x: number; y: number } }
    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: id },
      ...(hotspot ? { hotspot: { _type: 'sanity.imageHotspot', x: hotspot.x, y: hotspot.y, width: 1, height: 1 } } : {}),
      ...reste,
    }
  }
  const sortie: Record<string, unknown> = {}
  for (const [c, v] of Object.entries(objet)) sortie[c] = await resoudre(v)
  return sortie
}

const prets: Document[] = []
for (const d of documents) prets.push((await resoudre(d)) as Document)
console.log(`${televersees.size} images téléversées ou retrouvées.`)

/* ------------------------------------------------------------ 4. écriture */

const existants: string[] = await client.fetch('*[_id in $ids]._id', { ids: [...ids] })
const transaction = client.transaction()
for (const d of prets) {
  if (remplacer) transaction.createOrReplace(d)
  else transaction.createIfNotExists(d)
}
const resultat = await transaction.commit({ visibility: 'sync' })
const crees = prets.length - existants.length
console.log(
  remplacer
    ? `✅ ${prets.length} documents écrits (${existants.length} remplacés, ${crees} créés). Transaction ${resultat.transactionId}.`
    : `✅ ${crees} documents créés, ${existants.length} déjà présents laissés tels quels. Transaction ${resultat.transactionId}.`,
)

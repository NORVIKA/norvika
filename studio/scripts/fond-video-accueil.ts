/**
 * 2026-11-18 : pose la vidéo de fond du haut de l'accueil (champ « Vidéo de fond du haut de page »).
 * Téléverse les trois fichiers préparés hors du dépôt (le dépôt est public, et 100 Mo n'y ont pas leur
 * place), puis remplit `pageAccueil.heroVideo` en UNE transaction, publié et brouillon s'il existe.
 * Le code en production ne lit pas encore ce champ : rien ne change à l'écran avant le déploiement.
 *
 *   cd studio && npx sanity exec scripts/fond-video-accueil.ts --with-user-token -- --essai <1080p.mp4> <720p.mp4> <affiche.webp>
 *   cd studio && npx sanity exec scripts/fond-video-accueil.ts --with-user-token -- <1080p.mp4> <720p.mp4> <affiche.webp>
 *
 * Un fichier identique déjà téléversé n'est pas dupliqué (Sanity reconnaît son empreinte).
 * ⚠️ Chaque écriture dans « production » relance la publication du site (webhook) : une seule transaction.
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 */
import { createReadStream, statSync } from 'node:fs'
import { basename } from 'node:path'

import { getCliClient } from 'sanity/cli'

const ID_PROJET = 'k99pdqd1'
const ID_DOC = 'pageAccueil'
const args = process.argv.slice(2).filter((a) => a !== '--')
const essai = args.includes('--essai')
const [ordinateur, mobile, affiche] = args.filter((a) => !a.startsWith('--'))

if (!ordinateur || !mobile || !affiche) {
  console.error('⛔ Il faut les trois fichiers : <vidéo ordinateur> <vidéo téléphone> <affiche>.')
  process.exit(1)
}

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  console.error(`⛔ La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production. Rien n'est écrit.`)
  process.exit(1)
}

const FICHIERS = [
  { champ: 'ordinateur', chemin: ordinateur, type: 'file' as const, mime: 'video/mp4', maxOctets: 4_000_000 },
  { champ: 'mobile', chemin: mobile, type: 'file' as const, mime: 'video/mp4', maxOctets: 1_800_000 },
  { champ: 'affiche', chemin: affiche, type: 'image' as const, mime: 'image/webp', maxOctets: 80_000 },
]

for (const f of FICHIERS) {
  const octets = statSync(f.chemin).size
  console.log(`${f.champ.padEnd(10)} ${basename(f.chemin)} : ${octets} octets`)
  if (octets > f.maxOctets) {
    console.error(`⛔ ${basename(f.chemin)} dépasse ${f.maxOctets} octets. Rien n'est écrit.`)
    process.exit(1)
  }
}

const docs = await client.fetch<{ _id: string }[]>(`*[_id in $ids]{ _id }`, { ids: [ID_DOC, `drafts.${ID_DOC}`] })
if (!docs.some((d) => d._id === ID_DOC)) {
  console.error(`⛔ Le document publié ${ID_DOC} est introuvable. Rien n'est écrit.`)
  process.exit(1)
}
const cibles = docs.map((d) => d._id)

if (essai) {
  console.log(`Essai : 3 fichiers à téléverser, heroVideo à poser sur ${cibles.join(' et ')}. Rien n'est écrit.`)
  process.exit(0)
}

const refs: Record<string, string> = {}
for (const f of FICHIERS) {
  const asset = await client.assets.upload(f.type, createReadStream(f.chemin), { filename: basename(f.chemin), contentType: f.mime })
  refs[f.champ] = asset._id
  console.log(`téléversé ${f.champ.padEnd(10)} ${asset.url}`)
}

const ref = (id: string) => ({ _type: 'reference' as const, _ref: id })
const heroVideo = {
  afficher: true,
  ordinateur: { _type: 'file', asset: ref(refs.ordinateur) },
  mobile: { _type: 'file', asset: ref(refs.mobile) },
  // Point focal : les visages des deux clients, à gauche. Il choisit la bande gardée dans le
  // cadre vertical du téléphone (recadrage 3:4 par le CDN de Sanity).
  affiche: {
    _type: 'image',
    asset: ref(refs.affiche),
    hotspot: { _type: 'sanity.imageHotspot', x: 0.3, y: 0.42, width: 0.4, height: 0.6 },
    crop: { _type: 'sanity.imageCrop', top: 0, bottom: 0, left: 0, right: 0 },
  },
  boutonPause: 'Pause',
  boutonLecture: 'Lecture',
}

const transaction = client.transaction()
for (const id of cibles) transaction.patch(id, (p) => p.set({ heroVideo }))
await transaction.commit()
console.log(`heroVideo posé sur ${cibles.join(' et ')} (une transaction).`)

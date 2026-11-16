/**
 * Bloc F, 2026-11-16 (en UNE transaction) : pose les textes des champs ajoutés au Studio, et le point
 * focal de l'image de partage par défaut. Écritures ADDITIVES seulement (`setIfMissing`) : le code en
 * production (next16-migration, 52a8dfa) ne lit aucun de ces champs, il ignore donc ce changement.
 *   1. navigation.menuFermer, navigation.lienEvitement : bouton du menu ouvert, lien d'évitement ;
 *   2. page404.onglet : nom d'onglet de la page introuvable ;
 *   3. parametres.imagePartage.hotspot : point focal (visages) pour le recadrage 1200 x 630.
 *
 *   cd studio && npx sanity exec scripts/bloc-f-champs.ts --with-user-token -- --essai   montre, n'écrit rien
 *   cd studio && npx sanity exec scripts/bloc-f-champs.ts --with-user-token               écrit
 *
 * ⚠️ Chaque écriture dans « production » relance la publication du site (webhook) : une seule transaction.
 * ⚠️ Un brouillon ouvert dans le Studio reçoit les mêmes changements.
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 */
import { getCliClient } from 'sanity/cli'

const ID_PROJET = 'k99pdqd1'
const essai = process.argv.includes('--essai')

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  console.error(`⛔ La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production. Rien n'est écrit.`)
  process.exit(1)
}

/** Champs posés s'ils sont absents, par document. Les chemins avec un point visent un sous-champ. */
const POSER: Record<string, Record<string, unknown>> = {
  navigation: {
    menuFermer: 'Fermer le menu',
    lienEvitement: 'Aller au contenu',
  },
  page404: {
    onglet: 'Page introuvable | Norvika',
  },
  parametres: {
    // Photo des fondateurs (portrait 1350 x 1800) : la bande 1200 x 630 garde les deux visages.
    'imagePartage.hotspot': { _type: 'sanity.imageHotspot', x: 0.5, y: 0.25, width: 1, height: 1 },
    'imagePartage.crop': { _type: 'sanity.imageCrop', top: 0, bottom: 0, left: 0, right: 0 },
  },
}

const ids = Object.keys(POSER)
const docs = await client.fetch<{ _id: string; [cle: string]: unknown }[]>(
  `*[_id in $ids]{ _id, menuFermer, lienEvitement, onglet, "imagePartage.hotspot": imagePartage.hotspot, "imagePartage.crop": imagePartage.crop, "aImage": defined(imagePartage.asset) }`,
  { ids: [...ids, ...ids.map((id) => `drafts.${id}`)] },
)
const parId = new Map(docs.map((d) => [d._id, d]))
const manquants = ids.filter((id) => !parId.has(id))
if (manquants.length) {
  console.error(`⛔ Document(s) publié(s) introuvable(s) : ${manquants.join(', ')}. Rien n'est écrit.`)
  process.exit(1)
}

const transaction = client.transaction()
let ecritures = 0
for (const id of ids) {
  for (const cible of [id, `drafts.${id}`]) {
    const doc = parId.get(cible)
    if (!doc) continue
    if (id === 'parametres' && doc.aImage !== true) {
      console.log(`  = ${cible} : pas d'image de partage, point focal non posé`)
      continue
    }
    const aPoser = Object.fromEntries(Object.entries(POSER[id] ?? {}).filter(([c]) => doc[c] == null))
    if (!Object.keys(aPoser).length) {
      console.log(`  = ${cible} : rien à changer`)
      continue
    }
    console.log(`  + ${cible} : ${Object.entries(aPoser).map(([c, v]) => `${c} = ${JSON.stringify(v)}`).join(', ')}`)
    transaction.patch(cible, (p) => p.setIfMissing(aPoser))
    ecritures += 1
  }
}

if (!ecritures) {
  console.log('Rien à écrire.')
} else if (essai) {
  console.log(`\n--essai : ${ecritures} document(s) seraient modifiés. Rien n'est écrit.`)
} else {
  const resultat = await transaction.commit({ visibility: 'sync' })
  console.log(`\n✅ ${ecritures} document(s) modifié(s) en une transaction (${resultat.transactionId}).`)
}

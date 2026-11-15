/**
 * Nettoyage du 2026-11-15, suite du bloc D (en UNE transaction) :
 *   1. pose les libellés lus par les lecteurs d'écran, sortis du code (champs nouveaux, `setIfMissing`) ;
 *   2. vide `piedDroits`, `piedDroitsCourt` (navigation) et `ficheRetour` (pageRealisations), remplacés
 *      par « © année nom légal » et le fil d'Ariane, et que le code EN LIGNE ne lit plus (vérifié par
 *      `git grep` sur origin/next16-migration avant l'écriture).
 *
 *   cd studio && npx sanity exec scripts/bloc-d-nettoyage.ts --with-user-token -- --essai   montre, n'écrit rien
 *   cd studio && npx sanity exec scripts/bloc-d-nettoyage.ts --with-user-token               écrit
 *
 * ⚠️ Chaque écriture dans « production » relance la publication du site (webhook) : une seule transaction,
 *    et seulement des changements que le code en ligne tolère (champs nouveaux, champs qu'il ne lit plus).
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

const POSER: Record<string, Record<string, string>> = {
  navigation: {
    menuOuvrir: 'Ouvrir le menu',
    ongletsServices: 'Nos services',
    basculeComparer: 'Comparer avant et après :',
    basculeImageAvant: 'avant la refonte',
    basculeImageApres: 'après la refonte',
    videoLire: 'Lire la vidéo :',
    etapeLibelle: 'Étape',
  },
}
const VIDER: Record<string, string[]> = {
  navigation: ['piedDroits', 'piedDroitsCourt'],
  pageRealisations: ['ficheRetour'],
}

const ids = [...new Set([...Object.keys(POSER), ...Object.keys(VIDER)])]
const champs = [...new Set([...Object.values(POSER).flatMap(Object.keys), ...Object.values(VIDER).flat()])]
const docs = await client.fetch<{ _id: string; [cle: string]: unknown }[]>(`*[_id in $ids]{ _id, ${champs.join(', ')} }`, {
  ids: [...ids, ...ids.map((id) => `drafts.${id}`)],
})
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
    const aPoser = Object.fromEntries(Object.entries(POSER[id] ?? {}).filter(([c]) => doc[c] == null))
    const aVider = (VIDER[id] ?? []).filter((c) => doc[c] != null)
    if (!Object.keys(aPoser).length && !aVider.length) {
      console.log(`  = ${cible} : rien à changer`)
      continue
    }
    if (Object.keys(aPoser).length) console.log(`  + ${cible} : ${Object.entries(aPoser).map(([c, v]) => `${c} = « ${v} »`).join(', ')}`)
    if (aVider.length) console.log(`  - ${cible} : vide ${aVider.map((c) => `${c} (« ${String(doc[c])} »)`).join(', ')}`)
    transaction.patch(cible, (p) => {
      let patch = p
      if (Object.keys(aPoser).length) patch = patch.setIfMissing(aPoser)
      if (aVider.length) patch = patch.unset(aVider)
      return patch
    })
    ecritures += 1
  }
}

if (!ecritures) {
  console.log('Rien à écrire.')
} else if (essai) {
  console.log(`\nEssai : ${ecritures} document(s) modifié(s) en UNE transaction. Rien n'est écrit.`)
} else {
  const resultat = await transaction.commit({ visibility: 'sync' })
  console.log(`\n✅ ${ecritures} document(s) modifié(s) en une transaction (${resultat.transactionId}).`)
}

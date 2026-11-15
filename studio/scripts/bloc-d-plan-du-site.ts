/**
 * Valeurs de départ des champs ajoutés le 2026-11-15 (bloc D de la mise à niveau) : plan du site,
 * fil d'Ariane des fiches, téléphone de la barre du haut, « © année nom légal ».
 *
 *   cd studio && npx sanity exec scripts/bloc-d-plan-du-site.ts --with-user-token -- --essai   montre, n'écrit rien
 *   cd studio && npx sanity exec scripts/bloc-d-plan-du-site.ts --with-user-token               écrit
 *
 * ⚠️ Rejouable et sans écrasement : `setIfMissing` et `createIfNotExists`. Une valeur déjà saisie dans
 *    le Studio n'est jamais remplacée.
 * ⚠️ UNE transaction : chaque écriture dans le jeu « production » relance la publication du site
 *    (webhook « Reconstruire norvika.ca »). Ces champs sont NOUVEAUX : le code en ligne avant la fusion
 *    de la branche mise-a-niveau-2026-11 les ignore, donc la reconstruction donne le même site.
 * ⚠️ Un brouillon ouvert dans le Studio reçoit les mêmes valeurs : sinon, le publier effacerait les
 *    champs ajoutés ici.
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

/** Champs ajoutés aux documents existants (valeur posée seulement si le champ est vide). */
const AJOUTS: Record<string, Record<string, string>> = {
  parametres: { nomLegal: 'Norvika' },
  navigation: {
    piedMention: 'Québec et Rive-Sud de Montréal',
    piedPlanDuSite: 'Plan du site',
    enteteTelephone: 'Appeler Norvika au',
    filArianeLibelle: "Fil d'Ariane",
  },
  pageRealisations: { nom: 'Réalisations' },
  pageEquipe: { nom: "L'équipe" },
  pageDiagnostic: { nom: 'Diagnostic gratuit' },
  pageContact: { nom: 'Contact' },
}

/** La page « Plan du site », créée si elle n'existe pas. */
const PLAN_DU_SITE = {
  _id: 'pagePlanDuSite',
  _type: 'pagePlanDuSite',
  h1: 'Plan du site',
  intro: "Toutes les pages du site au même endroit, avec les entreprises qu'on a accompagnées.",
  titrePages: 'Les pages',
  titreRealisations: 'Les réalisations',
  seoTitre: 'Plan du site : toutes nos pages et réalisations | Norvika',
  seoDescription:
    "Toutes les pages de norvika.ca au même endroit : sites web, automatisation, photo et vidéo, formation, l'équipe, le diagnostic gratuit et nos réalisations.",
}

const ids = Object.keys(AJOUTS)
const existants = await client.fetch<{ _id: string; [cle: string]: unknown }[]>(
  `*[_id in $ids]{ _id, ${[...new Set(Object.values(AJOUTS).flatMap(Object.keys))].join(', ')} }`,
  { ids: [...ids, ...ids.map((id) => `drafts.${id}`), 'pagePlanDuSite', 'drafts.pagePlanDuSite'] },
)
const parId = new Map(existants.map((d) => [d._id, d]))

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
    const aPoser = Object.fromEntries(Object.entries(AJOUTS[id]).filter(([cle]) => doc[cle] == null))
    if (!Object.keys(aPoser).length) {
      console.log(`  = ${cible} : déjà rempli`)
      continue
    }
    console.log(`  + ${cible} : ${Object.entries(aPoser).map(([c, v]) => `${c} = « ${v} »`).join(', ')}`)
    transaction.patch(cible, (p) => p.setIfMissing(aPoser))
    ecritures += 1
  }
}
if (parId.has('pagePlanDuSite')) {
  console.log('  = pagePlanDuSite : existe déjà')
} else {
  console.log(`  + pagePlanDuSite : créée (${Object.keys(PLAN_DU_SITE).filter((c) => !c.startsWith('_')).join(', ')})`)
  transaction.createIfNotExists(PLAN_DU_SITE)
  ecritures += 1
}

if (!ecritures) {
  console.log('Rien à écrire.')
} else if (essai) {
  console.log(`\nEssai : ${ecritures} écriture(s) prévue(s) en UNE transaction. Rien n'est écrit.`)
} else {
  const resultat = await transaction.commit({ visibility: 'sync' })
  console.log(`\n✅ ${ecritures} écriture(s) en une transaction (${resultat.transactionId}).`)
}

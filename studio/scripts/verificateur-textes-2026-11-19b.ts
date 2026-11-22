/**
 * 2026-11-19 (passe 3 de Sentinel, restes de Pixel) : deux textes d'erreur sur la page
 * « Vérificateur Loi 25 », en UNE transaction, publié et brouillon s'il existe.
 *   - erreurVide : le champ est vide (avant, le message disait « adresse invalide ») ;
 *   - erreurIncompatible : le site emploie des moyens que l'outil ne peut pas surveiller ; l'analyse
 *     est arrêtée sans résultat. Avant, le visiteur voyait « indisponible », qui laisse croire à une
 *     panne. Texte de Mattew, à faire relire par Martin.
 * Un champ déjà rempli n'est jamais écrasé (correction faite dans le Studio).
 *
 *   cd studio && npx sanity exec scripts/verificateur-textes-2026-11-19b.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-textes-2026-11-19b.ts --with-user-token
 *
 * Le code en production ne lit pas ce document : rien ne change à l'écran avant la mise en ligne.
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 */
import { getCliClient } from 'sanity/cli'

import { verifierTexte } from '../schemas/regles'

const ID_PROJET = 'k99pdqd1'
const ID_DOC = 'pageVerificateurLoi25'
const essai = process.argv.includes('--essai')

const TEXTES = {
  erreurVide: "Inscrivez l'adresse de votre site, par exemple votreentreprise.ca.",
  erreurIncompatible:
    'Notre outil ne peut pas analyser ce site automatiquement en toute sécurité. Plutôt que de vous donner un résultat incomplet, nous préférons ne rien conclure. Écrivez-nous à info@norvika.ca : nous le vérifierons nous-mêmes.',
}

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  console.error(`⛔ La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production. Rien n'est écrit.`)
  process.exit(1)
}
for (const [cle, texte] of Object.entries(TEXTES)) {
  const verdict = verifierTexte(texte)
  if (verdict !== true) {
    console.error(`⛔ ${cle} refusé : ${verdict}`)
    process.exit(1)
  }
}

const docs = await client.fetch<{ _id: string; erreurVide?: string; erreurIncompatible?: string }[]>(
  '*[_id in $ids]{ _id, erreurVide, erreurIncompatible }',
  { ids: [ID_DOC, `drafts.${ID_DOC}`] },
)
if (!docs.some((d) => d._id === ID_DOC)) {
  console.error(`⛔ Le document publié ${ID_DOC} est introuvable. Rien n'est écrit.`)
  process.exit(1)
}
const ecritures = docs
  .map((d) => ({
    id: d._id,
    champs: Object.fromEntries(Object.entries(TEXTES).filter(([cle]) => !(d as Record<string, unknown>)[cle])),
  }))
  .filter((e) => Object.keys(e.champs).length)
if (!ecritures.length) {
  console.log('Les deux textes sont déjà en place : rien à écrire.')
  process.exit(0)
}
if (essai) {
  for (const e of ecritures) console.log(`Essai : ${e.id} recevrait ${Object.keys(e.champs).join(', ')}. Rien n'est écrit.`)
  process.exit(0)
}
const transaction = client.transaction()
for (const e of ecritures) transaction.patch(e.id, (p) => p.set(e.champs))
await transaction.commit()
console.log(`Écrit (une transaction) : ${ecritures.map((e) => `${e.id} (${Object.keys(e.champs).join(', ')})`).join(' ; ')}.`)

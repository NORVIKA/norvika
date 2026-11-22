/**
 * 2026-11-19 (site http seulement, 2e essai Browser Run) : un texte d'erreur sur la page
 * « Vérificateur Loi 25 », publié et brouillon s'il existe.
 *   - erreurSansHttps : le site répond seulement en http. Chrome le bloque derrière son
 *     avertissement « site non sécurisé » et ne charge jamais le http : rien à analyser. Avant, le
 *     visiteur lisait « Votre site redirige vers une adresse qui ne peut pas être vérifiée », qui
 *     est faux. Texte de Mattew, à faire relire par Martin.
 *   2026-11-21 : relu par Martin. « au même endroit que vos visiteurs » retiré (seul Chrome avertit
 *     par défaut, à la première visite, et le visiteur peut continuer) ; « maintenant » daté (défaut
 *     pour tous annoncé par Google le 2026-10-21, Chrome 154) ; cas du certificat invalide ajouté
 *     (il mène au même avertissement) ; HTTPS en capitales et action alignées sur le point « https ».
 * Un champ déjà rempli n'est jamais écrasé (correction faite dans le Studio).
 *
 *   cd studio && npx sanity exec scripts/verificateur-textes-2026-11-19c.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-textes-2026-11-19c.ts --with-user-token
 *
 * Le code en production ne lit pas ce champ avant la mise en ligne : rien ne change à l'écran avant.
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 */
import { getCliClient } from 'sanity/cli'

import { verifierTexte } from '../schemas/regles'

const ID_PROJET = 'k99pdqd1'
const ID_DOC = 'pageVerificateurLoi25'
const essai = process.argv.includes('--essai')

const TEXTES = {
  erreurSansHttps:
    "Votre site {domaine} ne répond pas en HTTPS, ou son certificat est expiré ou invalide. Depuis l'automne 2026, Chrome affiche par défaut un avertissement avant d'ouvrir pour la première fois un site sans HTTPS, et notre outil s'arrête à cet avertissement : nous ne pouvons rien analyser d'autre. Activez un certificat chez votre hébergeur (souvent sans frais), puis relancez la vérification.",
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

const docs = await client.fetch<{ _id: string; erreurSansHttps?: string }[]>('*[_id in $ids]{ _id, erreurSansHttps }', {
  ids: [ID_DOC, `drafts.${ID_DOC}`],
})
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
  console.log('Le texte est déjà en place : rien à écrire.')
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

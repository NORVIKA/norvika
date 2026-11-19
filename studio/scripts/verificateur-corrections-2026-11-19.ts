/**
 * 2026-11-19 : correction de Martin n° 1 (contenu/verificateur-loi25-textes.md, « Corrections
 * 2026-11-19 ») sur la page « Vérificateur Loi 25 » : la mention de collecte dit maintenant que
 * Cloudflare garde la liste des adresses visitées dans notre tableau de bord (onglet « Runs » de
 * Browser Run, constat de Sentinel). UNE transaction, publié et brouillon s'il existe.
 *
 *   cd studio && npx sanity exec scripts/verificateur-corrections-2026-11-19.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-corrections-2026-11-19.ts --with-user-token
 *
 * Le code en production ne lit pas ce document : rien ne change à l'écran avant la mise en ligne.
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 */
import { getCliClient } from 'sanity/cli'

import { verifierTexte } from '../schemas/regles'

const ID_PROJET = 'k99pdqd1'
const ID_DOC = 'pageVerificateurLoi25'
const essai = process.argv.includes('--essai')

const ANCIENNE_DEBUT = "Quand vous lancez une vérification, Norvika reçoit l'adresse entrée"
const NOUVELLE =
  "Quand vous lancez une vérification, Norvika reçoit l'adresse entrée et l'adresse IP de votre appareil. L'adresse sert seulement à faire l'analyse et n'est enregistrée dans aucune de nos bases de données. Cloudflare, qui fait l'analyse, garde toutefois la liste des adresses visitées dans notre tableau de bord, pour une durée qu'il ne précise pas. Votre adresse IP sert à limiter le nombre d'analyses : nous en gardons une forme brouillée au plus 24 heures, chez Supabase. Comme pour toute visite du site, elle reste aussi jusqu'à 7 jours dans les journaux techniques de Cloudflare, qui fait la vérification anti-robot. Ces fournisseurs peuvent traiter ces renseignements hors du Québec. Pour consulter ou faire corriger vos renseignements, ou retirer votre consentement : info@norvika.ca. Détails dans notre politique de confidentialité."

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  console.error(`⛔ La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production. Rien n'est écrit.`)
  process.exit(1)
}
const verdict = verifierTexte(NOUVELLE)
if (verdict !== true) {
  console.error(`⛔ Texte refusé : ${verdict}`)
  process.exit(1)
}

const docs = await client.fetch<{ _id: string; mentionCollecte?: string; mentionLien?: string }[]>(
  '*[_id in $ids]{ _id, mentionCollecte, mentionLien }',
  { ids: [ID_DOC, `drafts.${ID_DOC}`] },
)
if (!docs.some((d) => d._id === ID_DOC)) {
  console.error(`⛔ Le document publié ${ID_DOC} est introuvable. Rien n'est écrit.`)
  process.exit(1)
}
const cibles = docs.filter((d) => d.mentionCollecte !== NOUVELLE)
for (const d of cibles) {
  if (!d.mentionCollecte?.startsWith(ANCIENNE_DEBUT)) {
    console.error(`⛔ ${d._id} : la mention a été changée depuis le semis. Rien n'est écrit (à reprendre à la main dans le Studio).`)
    process.exit(1)
  }
  if (d.mentionLien && !NOUVELLE.includes(d.mentionLien)) {
    console.error(`⛔ ${d._id} : les mots du lien (« ${d.mentionLien} ») ne sont plus dans la mention. Rien n'est écrit.`)
    process.exit(1)
  }
}
if (!cibles.length) {
  console.log('La mention de collecte est déjà à jour : rien à écrire.')
  process.exit(0)
}
if (essai) {
  console.log(`Essai : mentionCollecte à remplacer sur ${cibles.map((d) => d._id).join(' et ')}. Rien n'est écrit.`)
  process.exit(0)
}
const transaction = client.transaction()
for (const d of cibles) transaction.patch(d._id, (p) => p.set({ mentionCollecte: NOUVELLE }))
await transaction.commit()
console.log(`mentionCollecte remplacée sur ${cibles.map((d) => d._id).join(' et ')} (une transaction).`)

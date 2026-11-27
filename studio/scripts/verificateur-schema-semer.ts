/**
 * 2026-11-27 : les trois textes du SCHÉMA de la page d'accueil, dans le rapport par courriel
 * (maquette A du 2026-11-26, « Courriel A - ordi.png » : le cadre blanc sous le titre, avec la
 * bannière de témoins dessinée en bas et les pastilles posées dessus). Le dessin était dans la
 * maquette approuvée mais n'avait jamais été construit : les pastilles numérotées de la liste ne
 * pointaient vers rien.
 *
 * ⚠️ Ce sont les mots d'un DESSIN générique, jamais le texte du site analysé : le courriel ne sort
 *    aucun texte libre du site visité (règle C7 de lib/verificateur/courriel.ts).
 *
 * Idempotent : un texte déjà présent n'est JAMAIS écrasé (une correction faite au Studio gagne).
 * `schemaLibelle` vide = aucun schéma dessiné, le courriel reste exactement comme avant.
 *
 *   cd studio && npx sanity exec scripts/verificateur-schema-semer.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-schema-semer.ts --with-user-token
 *
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 * ⚠️ L'écriture déclenche la reconstruction du site (webhook Sanity vers Cloudflare).
 */
import { getCliClient } from 'sanity/cli'

import { verifierTexte } from '../schemas/regles'

const ID_PROJET = 'k99pdqd1'
const ID_DOC = 'pageVerificateurLoi25'
const essai = process.argv.includes('--essai')

const VALEURS: Record<string, string> = {
  schemaLibelle: "Schéma de votre page d'accueil",
  schemaBanniere: 'Ce site utilise des témoins.',
  schemaBanniereBouton: 'Accepter',
}

function refuser(message: string): never {
  console.error(`⛔ ${message} Rien n'est écrit.`)
  process.exit(1)
}

for (const [cle, valeur] of Object.entries(VALEURS)) {
  if (!valeur.trim()) refuser(`${cle} : texte vide.`)
  const verdict = verifierTexte(valeur)
  if (verdict !== true) refuser(`${cle} refusé : ${verdict}`)
  if (/\{\w+\}/.test(valeur)) refuser(`${cle} : pas de {variable} dans le dessin, il ne cite rien du site analysé.`)
}

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  refuser(`La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production.`)
}

type Doc = { _id: string; rapportCourriel?: Record<string, string | undefined> | null }
const docs = await client.fetch<Doc[]>('*[_id in $ids]{ _id, rapportCourriel }', { ids: [ID_DOC, `drafts.${ID_DOC}`] })
if (!docs.some((d) => d._id === ID_DOC)) refuser(`Le document publié ${ID_DOC} est introuvable.`)

const vide = (v: unknown) => v === undefined || v === null || String(v).trim() === ''
const ecritures: { id: string; champs: Record<string, string> }[] = []

for (const doc of docs) {
  const rc = doc.rapportCourriel ?? {}
  const champs: Record<string, string> = {}
  for (const [cle, valeur] of Object.entries(VALEURS)) {
    if (vide(rc[cle])) champs[`rapportCourriel.${cle}`] = valeur
    else console.log(`${doc._id} : rapportCourriel.${cle} déjà rempli (« ${rc[cle]} »), laissé tel quel.`)
  }
  if (Object.keys(champs).length) ecritures.push({ id: doc._id, champs })
}

if (!ecritures.length) {
  console.log('Tout est déjà en place : rien à écrire.')
  process.exit(0)
}
for (const e of ecritures) {
  console.log(`\n${essai ? 'Essai : ' : ''}${e.id} :`)
  for (const [chemin, valeur] of Object.entries(e.champs)) console.log(`  ${chemin} = « ${valeur} »`)
}
if (essai) {
  console.log("\nEssai : rien n'est écrit.")
  process.exit(0)
}
const tx = client.transaction()
for (const e of ecritures) tx.patch(e.id, (p) => p.set(e.champs))
await tx.commit()
console.log(`\n✅ Écrit : ${ecritures.map((e) => e.id).join(', ')}.`)

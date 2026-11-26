/**
 * 2026-11-26 : demande du courriel APRÈS le résultat du vérificateur Loi 25. Document
 * « Vérificateur Loi 25 », publié et brouillon s'il existe :
 *   - rapportCourriel.apresTitre    le titre du bloc qui paraît sous le résultat ;
 *   - rapportCourriel.apresBouton   le texte de son bouton d'envoi.
 * Valeurs : verificateur-apres-textes.json (même dossier), source unique partagée avec le poste
 * local (lib/verificateur/textes-locaux.ts), comme pour la mention par couches.
 *
 * ⛔ L'INTERRUPTEUR `apresResultat` N'EST PAS SEMÉ : il se coche à la main dans le Studio, quand
 *    l'envoi a été essayé sur le vrai site. Tant qu'il est à off, ces deux textes ne paraissent
 *    nulle part et le formulaire garde son champ de courriel, exactement comme avant.
 *
 * Idempotent : un champ déjà rempli n'est JAMAIS écrasé (une correction faite dans le Studio gagne
 * toujours).
 *
 *   cd studio && npx sanity exec scripts/verificateur-apres-semer.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-apres-semer.ts --with-user-token
 *
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 * ⚠️ L'écriture déclenche la reconstruction du site (webhook Sanity vers Cloudflare).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { getCliClient } from 'sanity/cli'

import { verifierTexte } from '../schemas/regles'

const ID_PROJET = 'k99pdqd1'
const ID_DOC = 'pageVerificateurLoi25'
const essai = process.argv.includes('--essai')

function refuser(message: string): never {
  console.error(`⛔ ${message} Rien n'est écrit.`)
  process.exit(1)
}

// Lancé depuis studio/ (voir l'en-tête), comme les autres scripts.
const FICHIER = join(process.cwd(), 'scripts', 'verificateur-apres-textes.json')
if (!existsSync(FICHIER)) refuser(`${FICHIER} introuvable : lancer le script depuis le dossier studio/.`)
const brut = JSON.parse(readFileSync(FICHIER, 'utf8')) as Record<string, unknown>

/** Chemin dans le document → valeur du JSON. Un champ de trop dans le JSON arrête tout. */
const VALEURS: Record<string, unknown> = {
  'rapportCourriel.apresTitre': brut.apresTitre,
  'rapportCourriel.apresBouton': brut.apresBouton,
}
// `apresResultat` est dans le JSON pour le poste local seulement : il ne se sème pas (voir l'en-tête).
const CONNUS = ['apresResultat', 'apresTitre', 'apresBouton']
const inconnus = Object.keys(brut).filter((cle) => !CONNUS.includes(cle))
if (inconnus.length) refuser(`Champ(s) inconnu(s) du schéma dans le JSON : ${inconnus.join(', ')}.`)

for (const [chemin, valeur] of Object.entries(VALEURS)) {
  if (typeof valeur !== 'string' || !valeur.trim()) refuser(`${chemin} absent ou vide dans verificateur-apres-textes.json.`)
  const verdict = verifierTexte(valeur)
  if (verdict !== true) refuser(`${chemin} refusé : ${verdict}`)
  if (/\bconforme\b/i.test(valeur)) refuser(`${chemin} refusé : le mot « conforme » n'est jamais utilisé par le vérificateur.`)
}
// Le bloc ne doit pas se faire passer pour obligatoire : le courriel reste facultatif.
if (/\bobligatoire\b|\brequis\b/i.test(String(VALEURS['rapportCourriel.apresTitre']))) {
  refuser('apresTitre refusé : le courriel ne peut pas être présenté comme obligatoire.')
}

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  refuser(`La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production.`)
}

type Doc = { _id: string; rapportCourriel?: { apresTitre?: string | null; apresBouton?: string | null } | null }
const docs = await client.fetch<Doc[]>('*[_id in $ids]{ _id, rapportCourriel{ apresTitre, apresBouton } }', {
  ids: [ID_DOC, `drafts.${ID_DOC}`],
})
if (!docs.some((d) => d._id === ID_DOC)) refuser(`Le document publié ${ID_DOC} est introuvable.`)

const vide = (valeur: unknown) => valeur === undefined || valeur === null || String(valeur).trim() === ''
const actuel = (d: Doc, chemin: string): unknown =>
  chemin === 'rapportCourriel.apresTitre' ? d.rapportCourriel?.apresTitre : d.rapportCourriel?.apresBouton

const ecritures = docs
  .map((d) => {
    for (const chemin of Object.keys(VALEURS).filter((c) => !vide(actuel(d, c)))) {
      console.log(`${d._id} : ${chemin} déjà rempli (« ${String(actuel(d, chemin))} »), laissé tel quel.`)
    }
    return { id: d._id, champs: Object.fromEntries(Object.entries(VALEURS).filter(([chemin]) => vide(actuel(d, chemin)))) }
  })
  .filter((e) => Object.keys(e.champs).length)

if (!ecritures.length) {
  console.log('Tout est déjà en place : rien à écrire.')
  process.exit(0)
}
for (const e of ecritures) {
  console.log(`${essai ? 'Essai : ' : ''}${e.id} : ${Object.keys(e.champs).length} champ(s) à remplir :`)
  for (const [chemin, valeur] of Object.entries(e.champs)) console.log(`  ${chemin} = « ${String(valeur)} »`)
}
if (essai) {
  console.log("Essai : rien n'est écrit.")
  process.exit(0)
}
const transaction = client.transaction()
// Deux patchs à la suite : dans un même patch, Sanity applique `set` AVANT `setIfMissing`.
for (const e of ecritures) {
  transaction.patch(e.id, (p) => p.setIfMissing({ rapportCourriel: {} }))
  transaction.patch(e.id, (p) => p.set(e.champs))
}
await transaction.commit()
console.log(`✅ Écrit (une transaction) : ${ecritures.map((e) => e.id).join(', ')}.`)
console.log("   Reste à cocher « Demander le courriel APRÈS le résultat » dans le Studio, puis publier.")

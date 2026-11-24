/**
 * 2026-11-24 : « Ce que ça peut coûter » dans le vérificateur Loi 25 (demande de William ; montants,
 * sources et textes de Martin dans contenu/verificateur-loi25-textes.md, § « Montants des
 * sanctions »). Document « Vérificateur Loi 25 », publié et brouillon s'il existe : groupe `sanctions`
 * (afficher, titre, montants, notes, source) et la phrase `introRisque` sous l'introduction (sans
 * montant ; Martin recommande de l'afficher).
 * Valeurs : verificateur-sanctions-textes.json (même dossier), source unique partagée avec le poste
 * local (lib/verificateur/textes-locaux.ts).
 *
 * Idempotent : un groupe ou une phrase déjà présents ne sont JAMAIS écrasés (une correction faite dans le Studio gagne
 * toujours). Pour changer un texte semé : le Studio, pas ce script.
 *
 *   cd studio && npx sanity exec scripts/verificateur-sanctions-semer.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-sanctions-semer.ts --with-user-token
 *
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 * ⚠️ La publication déclenche la reconstruction du site (webhook Sanity vers Cloudflare).
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

const FICHIER = join(process.cwd(), 'scripts', 'verificateur-sanctions-textes.json')
if (!existsSync(FICHIER)) refuser(`${FICHIER} introuvable : lancer le script depuis le dossier studio/.`)
const fichier = JSON.parse(readFileSync(FICHIER, 'utf8')) as Record<string, unknown>
const inconnusRacine = Object.keys(fichier).filter((cle) => !['introRisque', 'sanctions'].includes(cle))
if (inconnusRacine.length) refuser(`Champ(s) inconnu(s) du schéma dans le JSON : ${inconnusRacine.join(', ')}.`)
const brut = (fichier.sanctions ?? {}) as Record<string, unknown>

const CHAMPS = ['afficher', 'titre', 'montants', 'notes', 'source', 'resume', 'repliLibelle']
const inconnus = Object.keys(brut).filter((cle) => !CHAMPS.includes(cle))
if (inconnus.length) refuser(`Champ(s) inconnu(s) du schéma dans le JSON : sanctions.${inconnus.join(', sanctions.')}.`)
const introRisque = typeof fichier.introRisque === 'string' ? fichier.introRisque.trim() : ''
if (!introRisque) refuser('introRisque absent ou vide dans verificateur-sanctions-textes.json.')
if (/\d[$%]/.test(introRisque)) refuser('introRisque ne porte aucun montant : les montants sont dans l’encadré.')

const chaine = (cle: string): string => {
  const v = brut[cle]
  if (typeof v !== 'string' || !v.trim()) refuser(`${cle} absent ou vide dans verificateur-sanctions-textes.json.`)
  return v.trim()
}
const liste = (cle: string, requise: boolean): string[] => {
  const v = brut[cle] ?? []
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string' || !x.trim())) refuser(`${cle} doit être une liste de phrases non vides.`)
  if (requise && v.length === 0) refuser(`${cle} ne peut pas être vide.`)
  return (v as string[]).map((x) => x.trim())
}

const sanctions = {
  afficher: brut.afficher === true,
  titre: chaine('titre'),
  montants: liste('montants', true),
  notes: liste('notes', false),
  source: chaine('source'),
  resume: chaine('resume'),
  repliLibelle: chaine('repliLibelle'),
}
// Condition de Martin pour les couches : la mise en garde et l'avis préalable restent visibles.
if (!/pas une estimation/i.test(sanctions.resume) || !/aviser|avis/i.test(sanctions.resume)) {
  refuser('resume doit garder « pas une estimation » et l’avis préalable de la Commission (condition de Martin).')
}

for (const texte of [introRisque, sanctions.titre, ...sanctions.montants, ...sanctions.notes, sanctions.source, sanctions.resume, sanctions.repliLibelle]) {
  const verdict = verifierTexte(texte)
  if (verdict !== true) refuser(`« ${texte} » refusé : ${verdict}`)
  if (/\bconforme\b/i.test(texte)) refuser(`« ${texte} » refusé : le mot « conforme » n'est jamais utilisé par le vérificateur.`)
  // Règle de William : aucun espace avant $ et %. Le gras des montants en dépend aussi.
  if (/\d[   ]+[$%]/.test(texte)) refuser(`« ${texte} » refusé : aucun espace avant $ ou %.`)
}
// Chaque ligne de la liste porte un montant (sinon elle n'a rien à faire dans « les montants »).
const sansMontant = sanctions.montants.filter((m) => !/\d[$%]/.test(m))
if (sansMontant.length) refuser(`Ligne(s) sans montant : ${sansMontant.join(' | ')}`)

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  refuser(`La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production.`)
}

type Doc = { _id: string; sanctions?: unknown; introRisque?: string | null }
const docs = await client.fetch<Doc[]>('*[_id in $ids]{ _id, sanctions, introRisque }', { ids: [ID_DOC, `drafts.${ID_DOC}`] })
if (!docs.some((d) => d._id === ID_DOC)) refuser(`Le document publié ${ID_DOC} est introuvable.`)

const ecritures = docs
  .map((d) => {
    if (d.sanctions) console.log(`${d._id} : « Ce que ça peut coûter » déjà présent, laissé tel quel.`)
    if (d.introRisque?.trim()) console.log(`${d._id} : introRisque déjà rempli, laissé tel quel.`)
    return { id: d._id, sanctions: !d.sanctions, intro: !d.introRisque?.trim() }
  })
  .filter((e) => e.sanctions || e.intro)
if (!ecritures.length) {
  console.log('Tout est déjà en place : rien à écrire.')
  process.exit(0)
}

for (const e of ecritures) console.log(`${essai ? 'Essai : ' : ''}${e.id} : ${[e.sanctions && 'sanctions', e.intro && 'introRisque'].filter(Boolean).join(' et ')} à écrire.`)
if (ecritures.some((e) => e.intro)) console.log(`  introRisque = « ${introRisque} »`)
console.log(`  afficher = ${sanctions.afficher}`)
console.log(`  titre    = « ${sanctions.titre} »`)
for (const m of sanctions.montants) console.log(`  montant  = « ${m} »`)
for (const n of sanctions.notes) console.log(`  note     = « ${n} »`)
console.log(`  source   = « ${sanctions.source} »`)
if (essai) {
  console.log("Essai : rien n'est écrit.")
  process.exit(0)
}
const transaction = client.transaction()
for (const e of ecritures) {
  if (e.sanctions) transaction.patch(e.id, (p) => p.setIfMissing({ sanctions }))
  if (e.intro) transaction.patch(e.id, (p) => p.set({ introRisque }))
}
await transaction.commit()
console.log(`✅ Écrit (une transaction) : ${ecritures.map((e) => e.id).join(', ')}.`)

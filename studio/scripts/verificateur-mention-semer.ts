/**
 * 2026-11-23 : mention par couches du vérificateur Loi 25 (demande de William, avis et textes de
 * Martin dans contenu/verificateur-courriel-textes.md, § « Mention par couches », phrase raccourcie
 * par Jarvis). Document « Vérificateur Loi 25 », publié et brouillon s'il existe :
 *   - mentionResume                  la phrase visible sous le bouton, fonction courriel fermée ;
 *   - mentionRepliLibelle            le libellé du repli qui contient les mentions complètes ;
 *   - rapportCourriel.mentionResume  la même phrase, avec le courriel, quand la fonction est ouverte.
 * Valeurs : verificateur-mention-textes.json (même dossier), source unique partagée avec le poste
 * local (lib/verificateur/textes-locaux.ts).
 *
 * Idempotent : un champ déjà rempli n'est JAMAIS écrasé (une correction faite dans le Studio gagne
 * toujours). Les mentions complètes ne sont pas touchées : elles passent dans le repli telles quelles.
 * Sans ces champs, le site garde les mentions dépliées : semer avant ou après la mise en ligne du code
 * ne cache jamais rien sans phrase visible.
 *
 *   cd studio && npx sanity exec scripts/verificateur-mention-semer.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-mention-semer.ts --with-user-token
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

// Lancé depuis studio/ (voir l'en-tête), comme les autres scripts.
const FICHIER = join(process.cwd(), 'scripts', 'verificateur-mention-textes.json')
if (!existsSync(FICHIER)) refuser(`${FICHIER} introuvable : lancer le script depuis le dossier studio/.`)
const brut = JSON.parse(readFileSync(FICHIER, 'utf8')) as Record<string, unknown>
const groupe = (brut.rapportCourriel ?? {}) as Record<string, unknown>

/** Chemin dans le document → valeur du JSON. Un oubli ou un champ de trop arrête tout. */
const VALEURS: Record<string, unknown> = {
  mentionResume: brut.mentionResume,
  mentionRepliLibelle: brut.mentionRepliLibelle,
  'rapportCourriel.mentionResume': groupe.mentionResume,
}
const inconnus = [
  ...Object.keys(brut).filter((cle) => !['mentionResume', 'mentionRepliLibelle', 'rapportCourriel'].includes(cle)),
  ...Object.keys(groupe).filter((cle) => cle !== 'mentionResume').map((cle) => `rapportCourriel.${cle}`),
]
if (inconnus.length) refuser(`Champ(s) inconnu(s) du schéma dans le JSON : ${inconnus.join(', ')}.`)

for (const [chemin, valeur] of Object.entries(VALEURS)) {
  if (typeof valeur !== 'string' || !valeur.trim()) refuser(`${chemin} absent ou vide dans verificateur-mention-textes.json.`)
  const verdict = verifierTexte(valeur)
  if (verdict !== true) refuser(`${chemin} refusé : ${verdict}`)
  if (/\bconforme\b/i.test(valeur)) refuser(`${chemin} refusé : le mot « conforme » n'est jamais utilisé par le vérificateur.`)
}
// La loi veut le renvoi aux droits au premier niveau : c'est le libellé du repli qui le fait.
if (!/\bdroits\b/i.test(String(VALEURS.mentionRepliLibelle))) refuser('mentionRepliLibelle doit renvoyer aux droits (« vos droits »).')
// Les deux phrases ne diffèrent que par le courriel : la version « avec » doit le nommer.
if (!/courriel/i.test(String(VALEURS['rapportCourriel.mentionResume']))) refuser('rapportCourriel.mentionResume doit parler du courriel.')
if (/courriel/i.test(String(VALEURS.mentionResume))) refuser('mentionResume (fonction courriel fermée) ne doit pas parler du courriel.')

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  refuser(`La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production.`)
}

type Doc = { _id: string; mentionResume?: string | null; mentionRepliLibelle?: string | null; rapportCourriel?: { mentionResume?: string | null } | null }
const docs = await client.fetch<Doc[]>('*[_id in $ids]{ _id, mentionResume, mentionRepliLibelle, rapportCourriel{ mentionResume } }', {
  ids: [ID_DOC, `drafts.${ID_DOC}`],
})
if (!docs.some((d) => d._id === ID_DOC)) refuser(`Le document publié ${ID_DOC} est introuvable.`)

const vide = (valeur: unknown) => valeur === undefined || valeur === null || String(valeur).trim() === ''
const actuel = (d: Doc, chemin: string): unknown =>
  chemin === 'rapportCourriel.mentionResume' ? d.rapportCourriel?.mentionResume : d[chemin as 'mentionResume' | 'mentionRepliLibelle']

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
  if ('rapportCourriel.mentionResume' in e.champs) transaction.patch(e.id, (p) => p.setIfMissing({ rapportCourriel: {} }))
  transaction.patch(e.id, (p) => p.set(e.champs))
}
await transaction.commit()
console.log(`✅ Écrit (une transaction) : ${ecritures.map((e) => e.id).join(', ')}.`)

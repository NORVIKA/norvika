/**
 * 2026-11-27 : liste de Lau pour William, points 2, 4 et 5. Document « Vérificateur Loi 25 », publié et
 * brouillon s'il existe :
 *   - erreurAntiRobotAbsent           message quand le NAVIGATEUR n'a pas eu de jeton anti-robot (15 s
 *                                     d'attente, ou script de Cloudflare bloqué), distinct du refus du
 *                                     serveur (erreurAntiRobot) : on saura lequel des deux arrive ;
 *   - rapportCourriel.signatureNom    signature du courriel, sortie du code ;
 *   - rapportCourriel.signatureLigne  la ligne sous le nom ;
 *   - erreurAntiRobot (refus du SERVEUR) : remplacé SEULEMENT s'il contient encore, au mot près, le
 *     texte « pas encore prête » mis le 2026-11-27 au matin, écrit pour le jeton absent. Ce cas a
 *     maintenant son propre champ, et « attendez deux secondes » ne répond pas à un refus du serveur ;
 *   - rapportCourriel.salutation et rapportCourriel.intro RETIRÉS : ils ne paraissent plus dans le
 *     courriel depuis la refonte du 2026-11-26, et le schéma ne les a plus.
 * Valeurs : verificateur-lot-2026-11-27-textes.json (même dossier), source unique partagée avec le poste
 * local (lib/verificateur/textes-locaux.ts).
 *
 * Idempotent : un champ déjà rempli n'est JAMAIS écrasé (une correction faite dans le Studio gagne
 * toujours) ; un champ déjà retiré n'est pas retouché.
 *
 *   cd studio && npx sanity exec scripts/verificateur-lot-2026-11-27-semer.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-lot-2026-11-27-semer.ts --with-user-token
 *
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 * ⚠️ L'écriture déclenche la reconstruction du site (webhook Sanity vers Cloudflare).
 * ⚠️ Ordre : déployer le Studio d'abord (sinon il affiche les champs semés comme inconnus), puis ce
 *    script, puis le code. Le code tient aussi sans le semis : il retombe sur les valeurs d'avant.
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

const FICHIER = join(process.cwd(), 'scripts', 'verificateur-lot-2026-11-27-textes.json')
if (!existsSync(FICHIER)) refuser(`${FICHIER} introuvable : lancer le script depuis le dossier studio/.`)
const brut = JSON.parse(readFileSync(FICHIER, 'utf8')) as Record<string, unknown>

/** Chemin dans le document → valeur du JSON. Un champ de trop dans le JSON arrête tout. */
const VALEURS: Record<string, unknown> = {
  erreurAntiRobotAbsent: brut.erreurAntiRobotAbsent,
  'rapportCourriel.signatureNom': brut.signatureNom,
  'rapportCourriel.signatureLigne': brut.signatureLigne,
}
const RETIRES = ['rapportCourriel.salutation', 'rapportCourriel.intro']
/** Remplacé seulement si l'ancien texte est encore là, au mot près (une autre correction gagne). */
const CORRECTION = {
  chemin: 'erreurAntiRobot',
  avant:
    "La vérification anti-robot n'est pas encore prête. Attendez deux secondes et cliquez de nouveau, sans recharger la page. Si ça bloque encore, écrivez-nous à info@norvika.ca.",
  apres: "La vérification anti-robot n'a pas abouti. Rechargez la page pour réessayer, ou écrivez-nous à info@norvika.ca.",
}
const inconnus = Object.keys(brut).filter((cle) => !['erreurAntiRobotAbsent', 'signatureNom', 'signatureLigne'].includes(cle))
if (inconnus.length) refuser(`Champ(s) inconnu(s) du schéma dans le JSON : ${inconnus.join(', ')}.`)

for (const [chemin, valeur] of Object.entries(VALEURS)) {
  if (typeof valeur !== 'string' || !valeur.trim()) refuser(`${chemin} absent ou vide dans verificateur-lot-2026-11-27-textes.json.`)
  const verdict = verifierTexte(valeur)
  if (verdict !== true) refuser(`${chemin} refusé : ${verdict}`)
  if (/\bconforme\b/i.test(valeur)) refuser(`${chemin} refusé : le mot « conforme » n'est jamais utilisé par le vérificateur.`)
}

{
  const verdict = verifierTexte(CORRECTION.apres)
  if (verdict !== true) refuser(`${CORRECTION.chemin} refusé : ${verdict}`)
}

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  refuser(`La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production.`)
}

type Doc = {
  _id: string
  erreurAntiRobot?: string | null
  erreurAntiRobotAbsent?: string | null
  rapportCourriel?: { signatureNom?: string | null; signatureLigne?: string | null; salutation?: unknown; intro?: unknown } | null
}
const docs = await client.fetch<Doc[]>(
  '*[_id in $ids]{ _id, erreurAntiRobot, erreurAntiRobotAbsent, rapportCourriel{ signatureNom, signatureLigne, salutation, intro } }',
  { ids: [ID_DOC, `drafts.${ID_DOC}`] },
)
if (!docs.some((d) => d._id === ID_DOC)) refuser(`Le document publié ${ID_DOC} est introuvable.`)

const lire = (d: Doc, chemin: string): unknown =>
  chemin.split('.').reduce<unknown>((objet, cle) => (objet as Record<string, unknown> | null | undefined)?.[cle], d)
const vide = (valeur: unknown) => valeur === undefined || valeur === null || String(valeur).trim() === ''

const ecritures = docs
  .map((d) => {
    for (const chemin of Object.keys(VALEURS).filter((c) => !vide(lire(d, c)))) {
      console.log(`${d._id} : ${chemin} déjà rempli (« ${String(lire(d, chemin))} »), laissé tel quel.`)
    }
    const champs = Object.fromEntries(Object.entries(VALEURS).filter(([chemin]) => vide(lire(d, chemin))))
    if (d.erreurAntiRobot === CORRECTION.avant) champs[CORRECTION.chemin] = CORRECTION.apres
    else console.log(`${d._id} : ${CORRECTION.chemin} n'est plus le texte du 27 au matin, laissé tel quel.`)
    return {
      id: d._id,
      champs,
      retraits: RETIRES.filter((chemin) => lire(d, chemin) !== undefined && lire(d, chemin) !== null),
    }
  })
  .filter((e) => Object.keys(e.champs).length || e.retraits.length)

if (!ecritures.length) {
  console.log('Tout est déjà en place : rien à écrire.')
  process.exit(0)
}
for (const e of ecritures) {
  console.log(`${essai ? 'Essai : ' : ''}${e.id} :`)
  for (const [chemin, valeur] of Object.entries(e.champs)) console.log(`  remplir ${chemin} = « ${String(valeur)} »`)
  for (const chemin of e.retraits) console.log(`  retirer ${chemin}`)
}
if (essai) {
  console.log("Essai : rien n'est écrit.")
  process.exit(0)
}
const transaction = client.transaction()
// Patchs séparés : dans un même patch, Sanity applique `set` AVANT `setIfMissing`.
for (const e of ecritures) {
  transaction.patch(e.id, (p) => p.setIfMissing({ rapportCourriel: {} }))
  if (Object.keys(e.champs).length) transaction.patch(e.id, (p) => p.set(e.champs))
  if (e.retraits.length) transaction.patch(e.id, (p) => p.unset(e.retraits))
}
await transaction.commit()
console.log(`✅ Écrit (une transaction) : ${ecritures.map((e) => e.id).join(', ')}.`)

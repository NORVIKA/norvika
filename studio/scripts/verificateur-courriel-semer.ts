/**
 * 2026-11-23 : rapport par courriel du vérificateur Loi 25 (décision de William du 2026-11-23).
 * Document « Vérificateur Loi 25 », publié et brouillon s'il existe :
 *   1. le groupe « Rapport par courriel » (champ rapportCourriel), textes de Martin
 *      (contenu/verificateur-courriel-textes.md), recopiés MOT POUR MOT dans
 *      verificateur-courriel-textes.json (même dossier), source unique partagée avec le poste local
 *      (lib/verificateur/textes-locaux.ts) ;
 *   2. les trois textes de la V1 qui disaient « sans courriel » (section 1, « Textes V1 à corriger ») :
 *      remplacés SEULEMENT s'ils contiennent encore l'ancienne phrase exacte ;
 * et dans « Infos de l'entreprise » (parametres), publié et brouillon s'il existe :
 *   3. l'adresse postale de Norvika inc. (Registraire des entreprises, lue par Jarvis le 2026-11-23),
 *      verificateur-courriel-parametres.json, SEULEMENT si le champ est vide. Elle est exigée dans la
 *      demande de consentement elle-même (DORS/2012-36, art. 4 d).
 *
 * Idempotent : un champ du groupe déjà rempli n'est jamais écrasé (une correction faite dans le
 * Studio gagne toujours) ; une phrase de la V1 déjà corrigée n'est pas retouchée.
 * Interrupteurs semés : afficher = true (le rapport), afficherCase = true (la case : l'adresse postale
 * existe). Le serveur exige toujours les deux, interrupteur ET adresse, au moment de l'envoi.
 * ⚠️ Les phrases de la V1 annoncent « courriel facultatif » : à semer avec la mise en ligne du code,
 *    pas avant (le code en production n'a pas encore de champ de courriel).
 *
 *   cd studio && npx sanity exec scripts/verificateur-courriel-semer.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-courriel-semer.ts --with-user-token
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

// Lancé depuis studio/ (voir l'en-tête), comme les autres scripts.
const FICHIER = join(process.cwd(), 'scripts', 'verificateur-courriel-textes.json')
if (!existsSync(FICHIER)) {
  console.error(`⛔ ${FICHIER} introuvable : lancer le script depuis le dossier studio/. Rien n'est écrit.`)
  process.exit(1)
}
const TEXTES = JSON.parse(readFileSync(FICHIER, 'utf8')) as Record<string, string | boolean>
const FICHIER_PARAMETRES = join(process.cwd(), 'scripts', 'verificateur-courriel-parametres.json')
if (!existsSync(FICHIER_PARAMETRES)) {
  console.error(`⛔ ${FICHIER_PARAMETRES} introuvable. Rien n'est écrit.`)
  process.exit(1)
}
const ADRESSE_POSTALE = String((JSON.parse(readFileSync(FICHIER_PARAMETRES, 'utf8')) as { adressePostale?: unknown }).adressePostale ?? '').trim()

/** Les champs du schéma (studio/schemas/verificateur.ts, rapportCourriel) : un oubli arrête tout. */
const INTERRUPTEURS = ['afficher', 'afficherCase'] as const
const CHAMPS = [
  ...INTERRUPTEURS,
  'champLibelle',
  'champExemple',
  'champAide',
  'caseTexte',
  'caseIdentification',
  'mention',
  'mentionSansCase',
  'erreurCourriel',
  'envoiReussi',
  'envoiEchec',
  'envoiEchecCase',
  'sansResultat',
  'objet',
  'preEntete',
  'invisibleCourriel',
  'paragrapheSansCase',
  'paragrapheAvecCase',
  'libellePolitique',
] as const

/** Textes de la V1 à corriger (Martin, section 1) : chemin, ancienne phrase exacte, nouvelle. */
const CORRECTIONS_V1 = [
  {
    chemin: 'seoDescription',
    avant: '8 vérifications, résultat immédiat, sans courriel.',
    apres: '8 vérifications, résultat immédiat, courriel facultatif.',
  },
  {
    chemin: 'blocSitesWeb.texte',
    avant: 'Résultat immédiat, sans courriel.',
    apres: 'Résultat immédiat, courriel facultatif.',
  },
  {
    chemin: 'intro',
    avant: "Le résultat s'affiche en 20 secondes environ, sans vous demander de courriel.",
    apres: "Le résultat s'affiche en 20 secondes environ ; votre courriel est facultatif.",
  },
] as const

function refuser(message: string): never {
  console.error(`⛔ ${message} Rien n'est écrit.`)
  process.exit(1)
}

function verifier(cle: string, valeur: string) {
  const verdict = verifierTexte(valeur)
  if (verdict !== true) refuser(`${cle} refusé : ${verdict}`)
  if (/\bconforme\b/i.test(valeur)) refuser(`${cle} refusé : le mot « conforme » n'est jamais utilisé par le vérificateur.`)
}

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  refuser(`La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production.`)
}

for (const cle of CHAMPS) {
  const valeur = TEXTES[cle]
  const interrupteur = (INTERRUPTEURS as readonly string[]).includes(cle)
  if (interrupteur ? typeof valeur !== 'boolean' : typeof valeur !== 'string' || !valeur.trim()) {
    refuser(`${cle} absent ou vide dans verificateur-courriel-textes.json.`)
  }
  if (typeof valeur === 'string') verifier(cle, valeur)
}
const inconnus = Object.keys(TEXTES).filter((cle) => !(CHAMPS as readonly string[]).includes(cle))
if (inconnus.length) refuser(`Champ(s) inconnu(s) du schéma dans le JSON : ${inconnus.join(', ')}.`)
if (!String(TEXTES.caseIdentification).includes('{adresse_postale}')) refuser('caseIdentification doit garder {adresse_postale}.')
for (const c of CORRECTIONS_V1) verifier(c.chemin, c.apres)
if (!ADRESSE_POSTALE) refuser('adressePostale absente ou vide dans verificateur-courriel-parametres.json.')
verifier('adressePostale', ADRESSE_POSTALE)

type Doc = { _id: string; rapportCourriel?: Record<string, unknown> | null; seoDescription?: string; intro?: string; blocSitesWeb?: { texte?: string } }
const docs = await client.fetch<Doc[]>('*[_id in $ids]{ _id, rapportCourriel, seoDescription, intro, blocSitesWeb }', {
  ids: [ID_DOC, `drafts.${ID_DOC}`],
})
if (!docs.some((d) => d._id === ID_DOC)) refuser(`Le document publié ${ID_DOC} est introuvable.`)

function lire(doc: Doc, chemin: string): string | undefined {
  const valeur = chemin.split('.').reduce<unknown>((objet, cle) => (objet as Record<string, unknown> | undefined)?.[cle], doc)
  return typeof valeur === 'string' ? valeur : undefined
}

const ecritures = docs
  .map((d) => {
    const groupe = Object.fromEntries(
      CHAMPS.filter((cle) => {
        const actuel = d.rapportCourriel?.[cle]
        return actuel === undefined || actuel === null || actuel === ''
      }).map((cle) => [`rapportCourriel.${cle}`, TEXTES[cle]]),
    )
    const v1: Record<string, string> = {}
    for (const c of CORRECTIONS_V1) {
      const actuel = lire(d, c.chemin)
      if (actuel?.includes(c.avant)) v1[c.chemin] = actuel.replace(c.avant, c.apres)
      else if (!actuel?.includes(c.apres)) console.warn(`${d._id} : ${c.chemin} n'a ni l'ancienne ni la nouvelle phrase. Laissé tel quel, à revoir dans le Studio.`)
    }
    return { id: d._id, groupe, v1 }
  })
  .filter((e) => Object.keys(e.groupe).length || Object.keys(e.v1).length)

const parametres = await client.fetch<{ _id: string; adressePostale?: string | null }[]>('*[_id in $ids]{ _id, adressePostale }', {
  ids: ['parametres', 'drafts.parametres'],
})
if (!parametres.some((d) => d._id === 'parametres')) refuser('Le document publié parametres (Infos de l’entreprise) est introuvable.')
const adresses = parametres.filter((d) => !String(d.adressePostale ?? '').trim()).map((d) => d._id)
for (const d of parametres.filter((x) => String(x.adressePostale ?? '').trim())) {
  console.log(`${d._id} : adresse postale déjà remplie (« ${d.adressePostale} »), laissée telle quelle.`)
}

if (!ecritures.length && !adresses.length) {
  console.log('Tout est déjà en place : rien à écrire.')
  process.exit(0)
}
for (const e of ecritures) {
  console.log(
    `${essai ? 'Essai : ' : ''}${e.id} : ${Object.keys(e.groupe).length} champ(s) du groupe (dont afficher = ${String(e.groupe['rapportCourriel.afficher'] ?? 'déjà rempli')}, afficherCase = ${String(e.groupe['rapportCourriel.afficherCase'] ?? 'déjà rempli')}), phrases V1 : ${Object.keys(e.v1).join(', ') || 'aucune'}.`,
  )
}
for (const id of adresses) console.log(`${essai ? 'Essai : ' : ''}${id} : adresse postale « ${ADRESSE_POSTALE} ».`)
if (essai) {
  console.log("Essai : rien n'est écrit.")
  process.exit(0)
}
const transaction = client.transaction()
// Deux patchs à la suite : dans un même patch, Sanity applique `set` AVANT `setIfMissing`.
for (const e of ecritures) {
  transaction.patch(e.id, (p) => p.setIfMissing({ rapportCourriel: {} }))
  transaction.patch(e.id, (p) => p.set({ ...e.groupe, ...e.v1 }))
}
for (const id of adresses) transaction.patch(id, (p) => p.set({ adressePostale: ADRESSE_POSTALE }))
await transaction.commit()
console.log(`✅ Écrit (une transaction) : ${[...ecritures.map((e) => e.id), ...adresses].join(', ')}.`)

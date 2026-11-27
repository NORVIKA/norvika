/**
 * 2026-11-26 : les CONSTATS du vérificateur Loi 25, document « Vérificateur Loi 25 ».
 *
 * Pourquoi : le rapport par courriel titrait chaque point avec le nom de sa vérification, qui dit ce
 * qui est VÉRIFIÉ et pas ce qui a été TROUVÉ. Un site sans bouton de refus recevait donc un point
 * intitulé « Bannière avec un vrai choix de refuser », suivi de trois ou quatre phrases : le titre
 * disait le contraire du problème. Chaque cas reçoit donc deux choses :
 *   - un TITRE COURT (champ « <cas>Titre », nouveau) : ce que l'outil a vu, en quelques mots. Il
 *     devient le titre du point dans le courriel, et la première ligne du résultat sur la page ;
 *   - son TEXTE resserré : ce qu'il reste à faire, puisque le constat est maintenant dans le titre.
 *
 * Deux prudences, parce que ce script touche à des textes déjà écrits :
 *   - un titre déjà rempli n'est JAMAIS écrasé (comme les autres semis) ;
 *   - un texte n'est remplacé que s'il est encore MOT POUR MOT celui que ce fichier connaît
 *     (« avant » dans verificateur-constats-textes.json). Retouché au Studio depuis, il est laissé
 *     tel quel et le script le dit. Une correction faite dans le Studio gagne toujours.
 *
 * Le champ `politiqueIllisible` (phrase commune aux points 4, 5 et 6) n'est pas touché : une seule
 * phrase courte, déjà lisible.
 *
 *   cd studio && npx sanity exec scripts/verificateur-constats-semer.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-constats-semer.ts --with-user-token
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
const LONGUEUR_MAX_TITRE = 60
const essai = process.argv.includes('--essai')

function refuser(message: string): never {
  console.error(`⛔ ${message} Rien n'est écrit.`)
  process.exit(1)
}

/** Un cas : son titre court (absent pour une phrase d'ajout), son texte, et le texte attendu avant. */
type Cas = { titre?: string; texte: string; avant: string }

// Lancé depuis studio/ (voir l'en-tête), comme les autres scripts.
const FICHIER = join(process.cwd(), 'scripts', 'verificateur-constats-textes.json')
if (!existsSync(FICHIER)) refuser(`${FICHIER} introuvable : lancer le script depuis le dossier studio/.`)
const VOULU = JSON.parse(readFileSync(FICHIER, 'utf8')) as Record<string, Record<string, Cas>>

/* ---------------------------------------------------------------- les textes, avant d'ouvrir Sanity */
for (const [verif, cas] of Object.entries(VOULU)) {
  for (const [cle, c] of Object.entries(cas)) {
    const ou = `${verif}.${cle}`
    if (!c.texte?.trim()) refuser(`${ou} : texte vide.`)
    if (!c.avant?.trim()) refuser(`${ou} : « avant » vide, le garde-fou ne pourrait pas jouer.`)
    for (const [quoi, valeur] of [
      ['texte', c.texte],
      ['titre', c.titre ?? ''],
    ] as const) {
      if (!valeur) continue
      const verdict = verifierTexte(valeur)
      if (verdict !== true) refuser(`${ou} (${quoi}) refusé : ${verdict}`)
      if (/\bconformes?\b/i.test(valeur)) refuser(`${ou} (${quoi}) refusé : le mot « conforme » n'est jamais utilisé par le vérificateur.`)
    }
    if (c.titre) {
      if (/\{\w+\}/.test(c.titre)) refuser(`${ou} : pas de {variable} dans un titre court (le courriel ne sort aucun texte du site analysé).`)
      if (c.titre.length > LONGUEUR_MAX_TITRE) refuser(`${ou} : titre de ${c.titre.length} caractères, ${LONGUEUR_MAX_TITRE} au plus.`)
      if (/^(à corriger|à vérifier|en place)\b/i.test(c.titre)) refuser(`${ou} : le titre ne répète pas l'état, le courriel l'écrit déjà devant.`)
    }
  }
}

/* ---------------------------------------------------------------- Sanity */
const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  refuser(`La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production.`)
}

type Doc = { _id: string } & Record<string, Record<string, string | undefined> | string | undefined>
const verifs = Object.keys(VOULU)
const docs = await client.fetch<Doc[]>(`*[_id in $ids]{ _id, ${verifs.join(', ')} }`, {
  ids: [ID_DOC, `drafts.${ID_DOC}`],
})
if (!docs.some((d) => d._id === ID_DOC)) refuser(`Le document publié ${ID_DOC} est introuvable.`)

const vide = (valeur: unknown) => valeur === undefined || valeur === null || String(valeur).trim() === ''
/** Les espaces et les apostrophes ne doivent pas faire échouer la comparaison du garde-fou. */
const pareil = (a: unknown, b: unknown) =>
  String(a ?? '')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim() ===
  String(b ?? '')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const ecritures: { id: string; champs: Record<string, string> }[] = []
const laisses: string[] = []

for (const doc of docs) {
  const champs: Record<string, string> = {}
  for (const [verif, cas] of Object.entries(VOULU)) {
    const actuel = (doc[verif] ?? {}) as Record<string, string | undefined>
    for (const [cle, c] of Object.entries(cas)) {
      const ou = `${doc._id} : ${verif}.${cle}`
      // 1. Le titre court : nouveau champ, jamais écrasé.
      if (c.titre) {
        if (vide(actuel[`${cle}Titre`])) champs[`${verif}.${cle}Titre`] = c.titre
        else laisses.push(`${ou}Titre déjà rempli (« ${actuel[`${cle}Titre`]} »), laissé tel quel.`)
      }
      // 2. Le texte : remplacé seulement s'il est encore celui que ce fichier connaît.
      if (pareil(actuel[cle], c.texte)) continue
      if (pareil(actuel[cle], c.avant)) champs[`${verif}.${cle}`] = c.texte
      else laisses.push(`${ou} : texte retouché au Studio depuis, laissé tel quel (« ${String(actuel[cle] ?? '').slice(0, 70)}… »).`)
    }
  }
  if (Object.keys(champs).length) ecritures.push({ id: doc._id, champs })
}

for (const ligne of laisses) console.log(ligne)
if (!ecritures.length) {
  console.log('Tout est déjà en place : rien à écrire.')
  process.exit(0)
}
for (const e of ecritures) {
  console.log(`\n${essai ? 'Essai : ' : ''}${e.id} : ${Object.keys(e.champs).length} champ(s) à écrire :`)
  for (const [chemin, valeur] of Object.entries(e.champs)) console.log(`  ${chemin} = « ${valeur} »`)
}
if (essai) {
  console.log("\nEssai : rien n'est écrit.")
  process.exit(0)
}
const transaction = client.transaction()
for (const e of ecritures) transaction.patch(e.id, (p) => p.set(e.champs))
await transaction.commit()
console.log(`\n✅ Écrit (une transaction) : ${ecritures.map((e) => e.id).join(', ')}.`)
console.log('   Le site se reconstruit tout seul. Le Studio, lui, montrera les champs « titre court »')
console.log('   après son prochain déploiement (cd studio && npm run deploy).')

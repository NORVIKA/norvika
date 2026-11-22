/**
 * 2026-11-22 : lien « Test Loi 25 » au menu du haut (document « Menu et pied de page »), en dernier,
 * publié et brouillon s'il existe. Décision de William, avec le retrait du téléphone de la barre
 * d'ordinateur (commit e3aa1e3) : sans ce retrait, un 7e lien passait la barre sur deux lignes.
 * Libellé court voulu : un libellé plus long ne tient sur une ligne qu'à partir de 1145 à 1190 px
 * (voir app/globals.css, bascule du menu à 1179 px). Le pied de page ne le répète pas sous
 * « Services » : il a déjà son lien en bas.
 * Un lien déjà présent vers le vérificateur n'est jamais ajouté deux fois.
 *
 *   cd studio && npx sanity exec scripts/menu-verificateur-2026-11-22.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/menu-verificateur-2026-11-22.ts --with-user-token
 *
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 * ⚠️ La publication déclenche la reconstruction du site (webhook Sanity vers Cloudflare).
 */
import { getCliClient } from 'sanity/cli'

const ID_PROJET = 'k99pdqd1'
const CHEMIN = '/verificateur-loi-25'
const LIEN = { _key: 'verificateur-loi-25', _type: 'lienMenu', libelle: 'Test Loi 25', lien: CHEMIN }
const essai = process.argv.includes('--essai')

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  console.error(`⛔ La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production. Rien n'est écrit.`)
  process.exit(1)
}

for (const id of ['navigation', 'drafts.navigation']) {
  const doc = await client.getDocument(id)
  if (!doc) {
    console.log(`${id} : absent, rien à faire.`)
    continue
  }
  const liens = (doc.liensMenu ?? []) as Array<{ lien?: string; libelle?: string }>
  if (liens.some((l) => l.lien === CHEMIN)) {
    console.log(`${id} : le menu a déjà un lien vers ${CHEMIN}, rien n'est ajouté.`)
    continue
  }
  console.log(`${id} : ${liens.map((l) => l.libelle).join(' | ')} + « ${LIEN.libelle} »${essai ? ' (essai, rien n\'est écrit)' : ''}`)
  if (!essai) {
    await client.patch(id).setIfMissing({ liensMenu: [] }).append('liensMenu', [LIEN]).commit()
    console.log(`✅ ${id} : lien ajouté.`)
  }
}

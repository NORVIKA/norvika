/**
 * Retire l'adresse postale de « Infos de l'entreprise » (document `parametres`, publié et brouillon).
 *
 * Décision de William, 2026-11-23 : il ne veut pas que son adresse paraisse sur le site. Sans adresse,
 * la case de consentement du vérificateur Loi 25 se cache d'elle-même (contrôle de la page ET du
 * serveur), la politique retire ses passages « (case) », et le pied du rapport par courriel ne la cite
 * plus. Le rapport lui-même continue de partir. Pour rallumer la case : remplir le champ dans le Studio
 * avec une adresse que William accepte de publier (une case postale, par exemple).
 *
 *   cd studio && npx sanity exec scripts/adresse-postale-retirer.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/adresse-postale-retirer.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli'

const PROJET = 'k99pdqd1'
const essai = process.argv.includes('--essai')
const client = getCliClient({ apiVersion: '2024-01-01' })

if (client.config().projectId !== PROJET) {
  console.error(`⛔ Projet ${client.config().projectId} : ce script ne vise que ${PROJET}. Rien n'est écrit.`)
  process.exit(1)
}

const ids = ['parametres', 'drafts.parametres']
const docs = await client.fetch<{ _id: string; adressePostale?: string }[]>(
  '*[_id in $ids]{ _id, adressePostale }',
  { ids },
)
const aRetirer = docs.filter((d) => (d.adressePostale ?? '').trim() !== '')

if (aRetirer.length === 0) {
  console.log('Rien à retirer : aucune adresse postale dans le Studio.')
  process.exit(0)
}
for (const d of aRetirer) console.log(`${essai ? 'Essai : ' : ''}${d._id} : adresse postale retirée.`)
if (essai) {
  console.log("Essai : rien n'est écrit.")
  process.exit(0)
}

const tx = client.transaction()
for (const d of aRetirer) tx.patch(d._id, (p) => p.unset(['adressePostale']))
await tx.commit()
console.log(`✅ Écrit (une transaction) : ${aRetirer.map((d) => d._id).join(', ')}.`)

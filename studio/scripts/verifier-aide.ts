/**
 * Garde-fou : aucun champ du Studio sans aide en dessous (doc Norvika, phase 4). Parcourt tous les
 * champs à toute profondeur. Sortie 1 s'il en manque une.
 *   npx sanity exec scripts/verifier-aide.ts
 */
import { typesDuSchema } from '../schemas'

type Champ = { name?: string; title?: string; description?: string; hidden?: unknown; fields?: Champ[]; of?: Champ[] }
const manquants: string[] = []

function parcourir(champ: Champ, chemin: string, racine: boolean) {
  const ici = chemin ? `${chemin}.${champ.name ?? '?'}` : (champ.name ?? '?')
  if (!racine && champ.name && champ.hidden !== true && !String(champ.description ?? '').trim()) manquants.push(ici)
  champ.fields?.forEach((c) => parcourir(c, ici, false))
  champ.of?.forEach((m) => m.fields?.forEach((c) => parcourir(c, ici, false)))
}

for (const t of typesDuSchema as unknown as Champ[]) parcourir(t, '', true)
if (manquants.length) {
  console.error(`⛔ ${manquants.length} champ(s) sans aide :\n  ${manquants.join('\n  ')}`)
  process.exit(1)
}
console.log('Chaque champ porte son aide.')

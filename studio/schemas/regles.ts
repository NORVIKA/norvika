/**
 * Les règles de contenu de Norvika, appliquées par le Studio AVANT la publication : les mêmes que
 * scripts/semer.ts et ../scripts/verifier-contenu.mjs (le semis, le site rendu, le Studio refusent
 * la même chose). Une règle qui change ici change dans les trois. Porté d'Immuart.
 * L'apostrophe droite n'est PAS refusée ici : le site la rend typographique à l'affichage
 * (lib/typographie.ts), donc le client peut taper ' comme il en a l'habitude.
 */
import type { Rule, SchemaTypeDefinition } from 'sanity'

const TIRETS = /[—–]/
const FLECHES = /[←↑→↓↖↗↘↙⇐⇒⇠⇢➔➜➝➞➟➠⟵⟶⟹]/
const MOT_BANNI = /\bunivers\b/i
const A_CONFIRMER = /\[À CONFIRMER/

/** Erreur (bloque la publication) ou `true`. */
export function verifierTexte(texte: string): true | string {
  if (TIRETS.test(texte)) return 'Tiret long (— ou –) interdit sur le site : remplacez-le par une virgule, un point ou deux-points.'
  if (FLECHES.test(texte)) return 'Les flèches sont interdites dans le texte du site : le texte du bouton ou du lien suffit.'
  if (MOT_BANNI.test(texte)) return 'Le mot « univers » n’est pas utilisé sur le site : choisissez un autre mot.'
  return true
}

/** Avertissement (ne bloque pas) : une information qui reste à confirmer. */
export function verifierAConfirmer(texte: string): true | string {
  return A_CONFIRMER.test(texte) ? 'Information à confirmer : remplacez la partie entre crochets avant de publier.' : true
}

type Bloc = { _type?: string; children?: { text?: string }[] }

/** Tout le texte d'un champ de texte riche, bout à bout. */
function texteDesBlocs(valeur: unknown): string {
  if (!Array.isArray(valeur)) return ''
  return (valeur as Bloc[])
    .filter((b) => b?._type === 'block')
    .map((b) => (b.children ?? []).map((c) => c.text ?? '').join(''))
    .join('\n')
}

type Validation = (rule: Rule) => unknown
type Definition = {
  type?: string
  validation?: Validation
  fields?: Definition[]
  of?: Definition[]
  [cle: string]: unknown
}

function gardesTexte(rule: Rule): Rule[] {
  return [
    rule.custom((v: unknown) => (typeof v === 'string' ? verifierTexte(v) : true)).error(),
    rule.custom((v: unknown) => (typeof v === 'string' ? verifierAConfirmer(v) : true)).warning(),
  ]
}

function gardesBlocs(rule: Rule): Rule[] {
  return [
    rule.custom((v: unknown) => verifierTexte(texteDesBlocs(v))).error(),
    rule.custom((v: unknown) => verifierAConfirmer(texteDesBlocs(v))).warning(),
  ]
}

function combiner(avant: Validation | undefined, gardes: (rule: Rule) => Rule[]): Validation {
  return (rule) => {
    const existantes = avant ? avant(rule) : []
    return [...(Array.isArray(existantes) ? existantes : [existantes]), ...gardes(rule)]
  }
}

/**
 * Pose les gardes sur TOUS les champs de texte d'un type, à toute profondeur (objets, tableaux,
 * sections) : aucun champ ne peut être oublié en ajoutant un champ plus tard.
 */
function garder(def: Definition): Definition {
  const sortie: Definition = { ...def }
  if (def.type === 'string' || def.type === 'text') sortie.validation = combiner(def.validation, gardesTexte)
  if (def.type === 'array' && def.of?.some((m) => m.type === 'block')) sortie.validation = combiner(def.validation, gardesBlocs)
  if (def.fields) sortie.fields = def.fields.map(garder)
  if (def.of) sortie.of = def.of.map((m) => (m.type === 'block' ? m : garder(m)))
  return sortie
}

export function appliquerGardes(types: SchemaTypeDefinition[]): SchemaTypeDefinition[] {
  return types.map((t) => garder(t as unknown as Definition) as unknown as SchemaTypeDefinition)
}

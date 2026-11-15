/**
 * Les champs qui reviennent partout, DÉCLARÉS UNE FOIS (règle d'agence 5) : textes, liens, photos,
 * titres Google, étapes, listes. Chaque champ porte son aide en français, sans jargon : c'est ce
 * que le client lit sous le champ (scripts/verifier-aide.ts refuse un champ sans aide).
 * Modèle : immuart/sanity/schemas/champs.ts.
 */
import { defineArrayMember, defineField } from 'sanity'

import { AVIS_TITRE_PROTEGE, estProtege, idPublie, TITRES_PROTEGES } from '../titres-proteges'

type Options = { requis?: boolean; group?: string; rows?: number; hidden?: boolean }

/* ---------------------------------------------------------------- textes */

/** Une ligne de texte (titre, bouton, libellé). */
export function ligne(name: string, title: string, description: string, o: Options = {}) {
  return defineField({
    name,
    title,
    type: 'string',
    description,
    group: o.group,
    hidden: o.hidden,
    validation: (r) => (o.requis === false ? r : r.required().error('Ce texte s’affiche sur le site : il ne peut pas être vide.')),
  })
}

/** Un paragraphe (plusieurs lignes). */
export function paragraphe(name: string, title: string, description: string, o: Options = {}) {
  return defineField({
    name,
    title,
    type: 'text',
    rows: o.rows ?? 3,
    description,
    group: o.group,
    hidden: o.hidden,
    validation: (r) => (o.requis === false ? r : r.required().error('Ce texte s’affiche sur le site : il ne peut pas être vide.')),
  })
}

/** Plusieurs paragraphes à la suite, un par case. */
export function paragraphes(name: string, title: string, description: string, o: Options = {}) {
  return defineField({
    name,
    title,
    type: 'array',
    description,
    group: o.group,
    of: [defineArrayMember({ type: 'text', rows: 4 })],
    validation: (r) => (o.requis === false ? r : r.min(1).error('Ajoutez au moins un paragraphe.')),
  })
}

/** Une liste de phrases courtes (ex. : les cases « Vous vous reconnaissez? »). */
export function phrases(name: string, title: string, description: string, o: Options = {}) {
  return defineField({
    name,
    title,
    type: 'array',
    description,
    group: o.group,
    of: [defineArrayMember({ type: 'text', rows: 2 })],
    validation: (r) => r.min(1).error('Ajoutez au moins une phrase.'),
  })
}

/** L'interrupteur qui masque une section sans la supprimer. */
export function afficher(description = 'Décochez pour retirer cette section du site sans perdre son contenu. Recochez pour la remettre.') {
  return defineField({ name: 'afficher', title: 'Afficher cette section', type: 'boolean', initialValue: true, description })
}

/* ---------------------------------------------------------------- liens */

const LIEN_VALIDE = /^(\/|#|https?:\/\/|mailto:|tel:)/
export const AIDE_LIEN = 'Une page du site commence par « / » (ex. : /contact). Un autre site commence par « https:// ».'

export function lien(name = 'lien', title = 'Adresse du lien', description = AIDE_LIEN, o: Options = {}) {
  return defineField({
    name,
    title,
    type: 'string',
    description,
    group: o.group,
    validation: (r) => [
      ...(o.requis === false ? [] : [r.required().error('Indiquez où mène ce lien.')]),
      r.custom((v) => (!v || LIEN_VALIDE.test(v) ? true : 'Commencez par « / » pour une page du site, ou par « https:// » pour un autre site.')),
    ],
  })
}

/* ---------------------------------------------------------------- photos */

const AIDE_ALT =
  'Décrivez ce qu’on voit, en une phrase courte (ex. : « Laurianne et William en studio »). Google et les personnes aveugles lisent ce texte.'

/** Une photo : point focal réglable et description obligatoire. */
export function photo(name: string, title: string, description: string, o: Options & { alt?: boolean } = {}) {
  return defineField({
    name,
    title,
    type: 'image',
    description: `${description} Le point focal (le cercle dans l’aperçu) choisit la partie gardée quand la photo est recadrée, sur téléphone surtout.`,
    group: o.group,
    options: { hotspot: true },
    validation: (r) => (o.requis === false ? r : r.required().error('Ajoutez une image.')),
    fields:
      o.alt === false
        ? []
        : [
            defineField({
              name: 'alt',
              title: 'Description de l’image',
              type: 'string',
              description: AIDE_ALT,
              validation: (r) =>
                r.custom((v, contexte) => {
                  const parent = contexte.parent as { asset?: unknown } | undefined
                  return parent?.asset && !String(v ?? '').trim() ? 'Obligatoire : décrivez l’image en une phrase.' : true
                }),
            }),
          ],
  })
}

/* ---------------------------------------------------------------- blocs répétés */

/** Une étape du parcours animé (« Comment ça se passe »). */
export const etape = defineArrayMember({
  type: 'object',
  name: 'etape',
  title: 'Étape',
  fields: [
    ligne('titre', 'Titre de l’étape', 'Affiché en gras dans la carte sous le parcours (ex. : « Un appel de 30 minutes »).'),
    ligne(
      'libelle',
      'Libellé court sur le parcours',
      'Le petit texte posé sur le parcours, au-dessus du point. Laissez vide pour reprendre le titre de l’étape.',
      { requis: false },
    ),
    paragraphe('texte', 'Texte de l’étape', 'Une ou deux phrases qui expliquent ce qui se passe à cette étape.'),
  ],
  preview: { select: { title: 'titre', subtitle: 'texte' } },
})

export function etapes(name = 'etapes', title = 'Étapes', description = 'Les étapes du parcours, dans l’ordre. Glissez une étape pour la déplacer.') {
  return defineField({ name, title, type: 'array', description, of: [etape], validation: (r) => r.min(2).error('Le parcours a besoin d’au moins deux étapes.') })
}

/** Une carte : un titre en gras et un texte. */
export const carte = defineArrayMember({
  type: 'object',
  name: 'carte',
  title: 'Carte',
  fields: [
    ligne('titre', 'Titre de la carte', 'La phrase en gras en haut de la carte.'),
    paragraphe('texte', 'Texte de la carte', 'Une à trois phrases sous le titre.'),
  ],
  preview: { select: { title: 'titre', subtitle: 'texte' } },
})

export function cartes(name = 'cartes', title = 'Cartes', description = 'Les cartes de la section, dans l’ordre d’affichage.') {
  return defineField({ name, title, type: 'array', description, of: [carte], validation: (r) => r.min(1).error('Ajoutez au moins une carte.') })
}

/** Section « titre + liste de phrases » (ex. : « Vous vous reconnaissez? »). */
export function sectionListe(name: string, title: string, description: string, aideTitre: string, aidePhrases: string, group?: string) {
  return defineField({
    name,
    title,
    type: 'object',
    description,
    group,
    options: { collapsible: true, collapsed: false },
    fields: [afficher(), ligne('titre', 'Titre de la section', aideTitre), phrases('phrases', 'Phrases', aidePhrases)],
  })
}

/** Section « titre + cartes ». */
export function sectionCartes(name: string, title: string, description: string, aideTitre: string, group?: string) {
  return defineField({
    name,
    title,
    type: 'object',
    description,
    group,
    options: { collapsible: true, collapsed: false },
    fields: [afficher(), ligne('titre', 'Titre de la section', aideTitre), cartes()],
  })
}

/** Section « titre + parcours d'étapes ». */
export function sectionEtapes(name: string, title: string, description: string, aideTitre: string, group?: string) {
  return defineField({
    name,
    title,
    type: 'object',
    description,
    group,
    options: { collapsible: true, collapsed: false },
    fields: [afficher(), ligne('titre', 'Titre de la section', aideTitre), etapes()],
  })
}

/* ---------------------------------------------------------------- Google */

/**
 * Titre et description dans Google, avec les limites du processus Norvika (titre 50 à 60
 * caractères, description 150 à 160). Les limites AVERTISSENT sans bloquer : plusieurs titres en
 * ligne le 2026-11-14 sont hors limites, et un refus empêcherait de republier la page.
 * Sur une page protégée, le titre est verrouillé (voir titres-proteges.ts).
 */
export function champsGoogle(group = 'google') {
  return [
    defineField({
      name: 'seoTitre',
      title: 'Titre dans Google',
      type: 'string',
      group,
      description: 'Le titre bleu dans les résultats de Google et le nom de l’onglet du navigateur. Idéalement entre 50 et 60 caractères.',
      readOnly: ({ document }) => estProtege(document?._id) && !document?.deverrouillerTitres,
      validation: (r) => [
        r.required().error('Le titre dans Google est obligatoire.'),
        r.max(60).warning('Plus de 60 caractères : Google coupera la fin du titre.'),
        r.min(50).warning('Moins de 50 caractères : il reste de la place pour décrire la page.'),
        r
          .custom((v, contexte) => {
            const original = TITRES_PROTEGES[idPublie(contexte.document?._id)]?.seoTitre
            return original && v !== original ? AVIS_TITRE_PROTEGE : true
          })
          .warning(),
      ],
    }),
    defineField({
      name: 'seoDescription',
      title: 'Description dans Google',
      type: 'text',
      rows: 3,
      group,
      description: 'Le court texte gris sous le titre, dans Google. Idéalement entre 150 et 160 caractères : dites ce que la personne trouvera sur la page.',
      validation: (r) => [
        r.required().error('La description dans Google est obligatoire.'),
        r.max(160).warning('Plus de 160 caractères : Google coupera la fin.'),
        r.min(150).warning('Moins de 150 caractères : Google risque d’inventer sa propre description.'),
      ],
    }),
    defineField({
      name: 'partageTitre',
      title: 'Titre quand la page est partagée',
      type: 'string',
      group,
      description: 'Le titre affiché quand on partage la page sur Facebook, LinkedIn ou par message. Laissez vide pour reprendre le titre dans Google.',
    }),
    defineField({
      name: 'partageDescription',
      title: 'Description quand la page est partagée',
      type: 'text',
      rows: 2,
      group,
      description: 'Le texte sous le titre, dans un partage. Laissez vide pour reprendre la description dans Google.',
    }),
    photo('partageImage', 'Image de partage', 'L’image qui accompagne la page quand on la partage. Laissez vide pour ne pas en imposer une.', {
      group,
      requis: false,
    }),
  ]
}

/** La case qui déverrouille les titres d'une page protégée (visible sur ces pages seulement). */
export function deverrouillage(group?: string) {
  return defineField({
    name: 'deverrouillerTitres',
    title: 'Déverrouiller les titres',
    type: 'boolean',
    group,
    initialValue: false,
    description:
      'Le titre dans Google et le grand titre de cette page aident les gens à la trouver. Cochez seulement si vous voulez vraiment les changer : un nouveau titre peut faire perdre des visites.',
    hidden: ({ document }) => !estProtege(document?._id),
  })
}

/** Un champ du grand titre (H1). Sur une page protégée : verrou et avertissement. */
export function grandTitre(name: string, title: string, description: string, group?: string) {
  return defineField({
    name,
    title,
    type: 'string',
    group,
    description,
    readOnly: ({ document }) => estProtege(document?._id) && !document?.deverrouillerTitres,
    validation: (r) => [
      r.required().error('Le grand titre est obligatoire.'),
      r
        .custom((v, contexte) => {
          const original = TITRES_PROTEGES[idPublie(contexte.document?._id)]?.h1?.[name]
          return original !== undefined && v !== original ? AVIS_TITRE_PROTEGE : true
        })
        .warning(),
    ],
  })
}

/** Les onglets communs d'une page. */
export const GROUPES_PAGE = [
  { name: 'contenu', title: 'Contenu', default: true },
  { name: 'google', title: 'Google et partage' },
]

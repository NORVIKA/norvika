/**
 * Ce qui se répète : les réalisations (une fiche par client), les membres de l'équipe, les avis
 * Google. Ces documents se créent, se modifient et se suppriment librement depuis le Studio.
 */
import { defineArrayMember, defineField, defineType } from 'sanity'

import { lien, ligne, paragraphe, photo } from './champs'

const ordre = (description = 'Le plus petit chiffre s’affiche en premier (1, 2, 3...).') =>
  defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number', description, validation: (r) => r.required().integer().min(0) })

const afficherDoc = (description: string) => defineField({ name: 'afficher', title: 'Afficher sur le site', type: 'boolean', initialValue: true, description })

export const CATEGORIES = [
  { title: 'Site web', value: 'site-web' },
  { title: 'Photo et vidéo', value: 'photo-video' },
  { title: 'Automatisation', value: 'automatisation' },
  { title: 'Formation', value: 'formation' },
]

export const realisation = defineType({
  name: 'realisation',
  title: 'Réalisation',
  type: 'document',
  groups: [
    { name: 'fiche', title: 'Fiche', default: true },
    { name: 'logo', title: 'Logo' },
    { name: 'medias', title: 'Photo, vidéo, avant / après' },
  ],
  fields: [
    ligne('nom', 'Nom du client', 'Affiché sous le logo, en grand titre de la fiche et dans le titre Google de la fiche.', { group: 'fiche' }),
    defineField({
      name: 'slug',
      title: 'Adresse de la fiche',
      type: 'slug',
      group: 'fiche',
      description: 'La fin de l’adresse : norvika.ca/realisations/… Ne la changez pas une fois la fiche en ligne : l’ancienne adresse ne mènerait plus nulle part.',
      options: { source: 'nom', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    { ...ordre('La place du client dans la grille des réalisations (1 = premier).'), group: 'fiche' },
    ligne('secteur', 'Secteur', 'Le petit texte au-dessus du nom, sur la fiche (ex. : « Institution financière »).', { group: 'fiche' }),
    defineField({
      name: 'categories',
      title: 'Services rendus',
      type: 'array',
      group: 'fiche',
      description: 'Les services faits pour ce client. Ils servent aux filtres de la page Réalisations et s’affichent sur la fiche.',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: CATEGORIES },
      validation: (r) => r.min(1).error('Choisissez au moins un service.'),
    }),
    lien('siteWeb', 'Site du client', 'L’adresse du site du client, si on peut le visiter (commence par « https:// »). Laissez vide sinon.', {
      group: 'fiche',
      requis: false,
    }),
    paragraphe('resume', 'Résumé', 'Une ou deux phrases sous le nom. Sert aussi de description dans Google.', { group: 'fiche', rows: 2 }),
    paragraphe('besoin', 'Le besoin', 'Le point de départ : ce que le client vivait, ce qu’il lui fallait.', { group: 'fiche', rows: 6 }),
    paragraphe('mandat', 'Ce qu’on a fait', 'Le travail fait, concrètement.', { group: 'fiche', rows: 6 }),
    paragraphe('resultat', 'Le résultat', 'Une phrase sur l’effet du mandat. Laissez vide pour ne pas afficher la case.', { group: 'fiche', rows: 2, requis: false }),
    photo('logo', 'Logo', 'Le logo du client, de préférence sur fond transparent. Le nom du client sert de description.', { group: 'logo', alt: false }),
    defineField({
      name: 'logoStyle',
      title: 'Présentation du logo',
      type: 'string',
      group: 'logo',
      description: 'Comment le logo est posé dans la grille : seul sur le fond, sur une tuile de sa couleur, sur une tuile foncée, ou dans un cercle.',
      options: {
        list: [
          { title: 'Seul, sur fond transparent', value: 'transparent' },
          { title: 'Sur une tuile de couleur (logo blanc)', value: 'brand' },
          { title: 'Sur une tuile foncée', value: 'dark' },
          { title: 'Dans un cercle', value: 'round' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logoForme',
      title: 'Forme du logo',
      type: 'string',
      group: 'logo',
      description: 'Large (plus large que haut) ou carré.',
      options: { list: [{ title: 'Large', value: 'wide' }, { title: 'Carré', value: 'square' }], layout: 'radio', direction: 'horizontal' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logoEchelle',
      title: 'Agrandissement du logo',
      type: 'number',
      group: 'logo',
      description: 'Pour un logo qui paraît trop petit à côté des autres (ex. : 1,3 = 30 % plus grand). Laissez vide pour la taille normale.',
      validation: (r) => r.min(0.5).max(3),
    }),
    photo('couverture', 'Photo du mandat', 'Une photo affichée entre « Le besoin » et « Ce qu’on a fait ». Laissez vide pour ne pas en afficher.', {
      group: 'medias',
      requis: false,
    }),
    defineField({
      name: 'avantApres',
      title: 'Avant / après du site',
      type: 'object',
      group: 'medias',
      description: 'Deux captures de la page complète, avant et après la refonte. Laissez vide pour ne pas afficher la bascule.',
      options: { collapsible: true, collapsed: true },
      fields: [
        photo('avant', 'Capture avant', 'La page complète de l’ancien site.', { alt: false, requis: false }),
        photo('avant2x', 'Capture avant, haute définition', 'La même capture en double taille, pour les écrans très nets. Facultative.', { alt: false, requis: false }),
        photo('apres', 'Capture après', 'La page complète du nouveau site.', { alt: false, requis: false }),
        photo('apres2x', 'Capture après, haute définition', 'La même capture en double taille. Facultative.', { alt: false, requis: false }),
        ligne('alt', 'Ce que montrent les captures', 'Lu par les lecteurs d’écran (ex. : « La page d’accueil de CrossFit Sainte-Foy »).', { requis: false }),
        ligne('adresse', 'Adresse affichée dans la barre', 'L’adresse du site, dans la fausse barre de navigateur au-dessus des captures.', { requis: false }),
        paragraphe('legende', 'Légende', 'La phrase sous la bascule.', { requis: false, rows: 2 }),
      ],
    }),
    defineField({
      name: 'video',
      title: 'Vidéo',
      type: 'object',
      group: 'medias',
      description: 'Une vidéo YouTube montrée sur la fiche, chargée seulement au clic. Laissez vide pour ne pas en afficher.',
      options: { collapsible: true, collapsed: true },
      fields: [
        ligne('youtubeId', 'Identifiant YouTube', 'Les caractères après « v= » ou après « shorts/ » dans l’adresse de la vidéo.', { requis: false }),
        ligne('titre', 'Titre de la vidéo', 'Lu par les lecteurs d’écran.', { requis: false }),
        paragraphe('legende', 'Légende', 'La phrase sous la vidéo.', { requis: false, rows: 2 }),
        defineField({
          name: 'format',
          title: 'Format',
          type: 'string',
          description: 'Vertical pour un Short (téléphone), horizontal pour une vidéo classique.',
          options: { list: [{ title: 'Horizontal', value: 'horizontal' }, { title: 'Vertical', value: 'vertical' }], layout: 'radio', direction: 'horizontal' },
        }),
      ],
    }),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'nom', subtitle: 'secteur', media: 'logo' } },
})

export const membre = defineType({
  name: 'membre',
  title: 'Membre de l’équipe',
  type: 'document',
  fields: [
    ligne('nom', 'Prénom', 'Affiché en grand sur la carte du membre.'),
    ligne('role', 'Rôle', 'Le petit texte en capitales au-dessus du prénom.'),
    photo('photo', 'Photo', 'Un portrait, affiché dans un cercle. Le prénom sert de description.', { alt: false, requis: false }),
    paragraphe('texte', 'Présentation', 'Ce que fait la personne, en quelques phrases.', { rows: 5 }),
    ordre(),
    afficherDoc('Décochez pour retirer la carte du site sans la supprimer.'),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'nom', subtitle: 'role', media: 'photo' } },
})

export const avis = defineType({
  name: 'avis',
  title: 'Avis Google',
  type: 'document',
  fields: [
    ligne('nom', 'Nom de la personne', 'Tel qu’affiché sur Google.'),
    ligne('contexte', 'Sous le nom', 'L’entreprise et le moment de l’avis (ex. : « Pataphil · il y a 3 semaines »).'),
    ligne('signature', 'Signature sous l’avis', 'La ligne en capitales sous l’avis ouvert (ex. : « Marie-Claire Huard · Pataphil · 5,0 sur Google »).'),
    paragraphe('accroche', 'Première phrase', 'La première phrase de l’avis, en gros.', { rows: 3 }),
    defineField({
      name: 'suite',
      title: 'Suite de l’avis',
      type: 'array',
      description: 'Les autres paragraphes de l’avis, un par case. Laissez vide pour un avis court.',
      of: [defineArrayMember({ type: 'text', rows: 4 })],
    }),
    paragraphe('extraitGoogle', 'Extrait lu par Google', 'Une version courte de l’avis, lue par Google (invisible à l’écran). Laissez vide pour ne pas l’envoyer à Google.', {
      requis: false,
      rows: 2,
    }),
    ordre(),
    afficherDoc('Décochez pour retirer l’avis du site sans le supprimer.'),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'nom', subtitle: 'contexte' } },
})

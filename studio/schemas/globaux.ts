/**
 * Ce qui revient sur toutes les pages, déclaré à UN seul endroit : les infos de l'entreprise,
 * le menu et le pied de page, le bloc de contact du bas de chaque page, la page introuvable.
 */
import { defineArrayMember, defineField, defineType } from 'sanity'

import { ligne, lien, paragraphe, photo } from './champs'

export const parametres = defineType({
  name: 'parametres',
  title: 'Infos de l’entreprise',
  type: 'document',
  groups: [
    { name: 'coordonnees', title: 'Coordonnées', default: true },
    { name: 'google', title: 'Google et partage' },
    { name: 'logos', title: 'Logos' },
  ],
  fields: [
    ligne('nom', 'Nom de l’entreprise', 'Le nom affiché à Google et dans les partages (ex. : « Norvika »).', { group: 'coordonnees' }),
    ligne('nomLegal', 'Nom légal', 'Nom légal exact, affiché après le © dans le pied de page.', { group: 'coordonnees' }),
    paragraphe(
      'description',
      'Phrase de présentation',
      'Une phrase qui dit ce que fait l’entreprise. Affichée sous le logo du pied de page et lue par Google.',
      { group: 'coordonnees', rows: 2 },
    ),
    defineField({
      name: 'courriel',
      title: 'Courriel',
      type: 'string',
      group: 'coordonnees',
      description: 'L’adresse affichée dans le pied de page et sur la page Contact. Les liens « Écrivez-nous » s’en servent.',
      validation: (r) => r.required().email().error('Indiquez une adresse courriel valide.'),
    }),
    ligne(
      'telephone',
      'Téléphone',
      'Tel qu’il doit s’afficher (ex. : « 438 522 4275 »). Affiché dans la barre du haut et sur la page Contact ; le lien d’appel est fait automatiquement.',
      { group: 'coordonnees' },
    ),
    lien('lienRendezVous', 'Lien du calendrier de rendez-vous', 'L’adresse de la page où l’on réserve un appel de 30 minutes. Tous les boutons « Réserver mes 30 minutes » y mènent.', {
      group: 'coordonnees',
    }),
    lien('lienPortfolio', 'Lien du portfolio photo et vidéo', 'L’adresse du portfolio complet, ouvert par les boutons « Voir le portfolio ».', { group: 'coordonnees' }),
    defineField({
      name: 'zonesDesservies',
      title: 'Régions desservies (pour Google)',
      type: 'array',
      group: 'google',
      description: 'Invisibles à l’écran, lues par Google pour les recherches locales. La ville la plus importante en premier.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'zone',
          title: 'Région',
          fields: [
            ligne('nom', 'Nom de la région', 'Ex. : « Québec », « Rive-Sud de Montréal ».'),
            defineField({
              name: 'type',
              title: 'Sorte de région',
              type: 'string',
              description: 'Une ville, une région administrative, ou un secteur sans limite officielle.',
              options: {
                list: [
                  { title: 'Ville', value: 'City' },
                  { title: 'Région administrative', value: 'AdministrativeArea' },
                  { title: 'Secteur', value: 'Place' },
                ],
              },
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: 'nom', subtitle: 'type' } },
        }),
      ],
    }),
    defineField({
      name: 'typesDeService',
      title: 'Services offerts (pour Google)',
      type: 'array',
      group: 'google',
      description: 'Invisibles à l’écran, lus par Google (ex. : « Création de sites web »).',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'fondateurs',
      title: 'Fondateurs (pour Google)',
      type: 'array',
      group: 'google',
      description: 'Les noms complets des fondateurs, lus par Google. Invisibles à l’écran.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    ligne('noteGoogle', 'Note Google', 'La note moyenne de la fiche Google, avec un point (ex. : « 5.0 »). Lue par Google, invisible à l’écran.', {
      group: 'google',
    }),
    ligne('nombreAvisGoogle', 'Nombre d’avis Google', 'Le nombre d’avis de la fiche Google (ex. : « 6 »). À tenir à jour avec la fiche.', { group: 'google' }),
    ligne('seoTitreDefaut', 'Titre dans Google par défaut', 'Utilisé par les pages qui n’ont pas leur propre titre (ex. : la page introuvable).', { group: 'google' }),
    paragraphe('seoDescriptionDefaut', 'Description dans Google par défaut', 'Utilisée par les pages qui n’ont pas leur propre description.', {
      group: 'google',
    }),
    photo('imagePartage', 'Image de partage par défaut', 'L’image montrée quand on partage une page qui n’a pas la sienne.', { group: 'google' }),
    photo('logoEntete', 'Logo de la barre du haut', 'Le logo horizontal (icône et nom côte à côte), en SVG de préférence.', { group: 'logos' }),
    photo('logoPied', 'Logo du pied de page', 'Le logo empilé (icône au-dessus du nom), en SVG de préférence.', { group: 'logos' }),
  ],
  preview: { prepare: () => ({ title: 'Infos de l’entreprise' }) },
})

const lienMenu = defineArrayMember({
  type: 'object',
  name: 'lienMenu',
  title: 'Lien',
  fields: [ligne('libelle', 'Texte du lien', 'Ce qui est écrit dans le menu (court).'), lien()],
  preview: { select: { title: 'libelle', subtitle: 'lien' } },
})

export const navigation = defineType({
  name: 'navigation',
  title: 'Menu et pied de page',
  type: 'document',
  groups: [
    { name: 'menu', title: 'Menu', default: true },
    { name: 'pied', title: 'Pied de page' },
    { name: 'suite', title: 'Continuer la visite' },
    { name: 'boutons', title: 'Boutons communs' },
  ],
  fields: [
    defineField({
      name: 'liensMenu',
      title: 'Liens du menu',
      type: 'array',
      group: 'menu',
      description: 'Les pages du menu du haut, dans l’ordre. La même liste s’affiche dans le pied de page, sous « Services ».',
      of: [lienMenu],
      validation: (r) => r.min(1),
    }),
    ligne('boutonRendezVous', 'Texte du bouton de rendez-vous', 'Le bouton qui ouvre le calendrier, dans le menu et sur les pages (ex. : « Réserver mes 30 minutes »).', {
      group: 'boutons',
    }),
    ligne('boutonQuiz', 'Texte du bouton du quiz', 'Le bouton qui mène au diagnostic, en haut des pages de services (ex. : « Faire le quiz »).', { group: 'boutons' }),
    ligne('basculeAvant', 'Bouton « avant » de la bascule', 'Le bouton qui montre l’ancien site, dans la bascule avant / après (ex. : « Avant »).', { group: 'boutons' }),
    ligne('basculeApres', 'Bouton « après » de la bascule', 'Le bouton qui montre le nouveau site, dans la bascule avant / après (ex. : « Après »).', { group: 'boutons' }),
    ligne(
      'filArianeAccueil',
      'Nom de l’accueil',
      'Le premier lien du fil d’Ariane (pages de services, fiches des réalisations) et le nom de l’accueil dans le plan du site (ex. : « Accueil »).',
      { group: 'boutons' },
    ),
    ligne(
      'filArianeLibelle',
      'Nom du fil d’Ariane (lecteurs d’écran)',
      'Invisible à l’écran : ce que les lecteurs d’écran annoncent avant le fil d’Ariane (ex. : « Fil d’Ariane »).',
      { group: 'boutons' },
    ),
    ligne(
      'enteteTelephone',
      'Devant le téléphone (lecteurs d’écran)',
      'Invisible à l’écran : lu juste avant le numéro de la barre du haut par les lecteurs d’écran (ex. : « Appeler Norvika au »). Le numéro se change dans « Infos de l’entreprise ».',
      { group: 'menu' },
    ),
    // Libellés lus par les lecteurs d'écran (invisibles à l'écran), déclarés ici plutôt que dans le code
    // (zéro texte en dur, 2026-11-15).
    ligne('menuOuvrir', 'Bouton du menu (lecteurs d’écran)', 'Invisible à l’écran : le nom du bouton à trois traits qui ouvre le menu sur téléphone (ex. : « Ouvrir le menu »).', {
      group: 'menu',
    }),
    ligne(
      'ongletsServices',
      'Onglets des services (lecteurs d’écran)',
      'Invisible à l’écran : le nom de la rangée d’onglets sous le haut des pages de services (ex. : « Nos services »).',
      { group: 'boutons' },
    ),
    ligne(
      'basculeComparer',
      'Bascule avant / après (lecteurs d’écran)',
      'Invisible à l’écran : lu avant la description de l’image, sur les boutons « avant » et « après » (ex. : « Comparer avant et après : »).',
      { group: 'boutons' },
    ),
    ligne('basculeImageAvant', 'Fin de la description de l’image « avant »', 'Invisible à l’écran : ajoutée après la description de la capture, côté avant (ex. : « avant la refonte »).', {
      group: 'boutons',
    }),
    ligne('basculeImageApres', 'Fin de la description de l’image « après »', 'Invisible à l’écran : ajoutée après la description de la capture, côté après (ex. : « après la refonte »).', {
      group: 'boutons',
    }),
    ligne('videoLire', 'Bouton des vidéos (lecteurs d’écran)', 'Invisible à l’écran : lu avant le titre de la vidéo, sur l’image qui lance la lecture (ex. : « Lire la vidéo : »).', {
      group: 'boutons',
    }),
    ligne('etapeLibelle', 'Points du parcours (lecteurs d’écran)', 'Invisible à l’écran : lu avant le numéro de chaque point du parcours animé (ex. : « Étape »).', {
      group: 'boutons',
    }),
    ligne('piedTitreServices', 'Titre de la colonne des pages', 'Au-dessus de la liste des pages, dans le pied de page (ex. : « Services »).', { group: 'pied' }),
    ligne('piedTitreContact', 'Titre de la colonne contact', 'Au-dessus du courriel, dans le pied de page (ex. : « Contact »).', { group: 'pied' }),
    defineField({
      name: 'piedLiensContact',
      title: 'Liens sous le courriel',
      type: 'array',
      group: 'pied',
      description: 'Les liens affichés sous le courriel, dans le pied de page (ex. : « Nous écrire »).',
      of: [lienMenu],
    }),
    ligne(
      'piedMention',
      'Mention après le nom légal',
      'Le texte en petit après « © année nom légal », en bas à gauche du pied de page (ex. : « Québec et Rive-Sud de Montréal »). L’année est calculée automatiquement et le nom légal se change dans « Infos de l’entreprise ». Laissez vide pour n’afficher que le nom.',
      { group: 'pied', requis: false },
    ),
    ligne('piedPolitique', 'Texte du lien vers la politique', 'Le lien vers la politique de confidentialité, en bas à droite. Sert aussi de nom à cette page dans le plan du site.', {
      group: 'pied',
    }),
    ligne('piedPlanDuSite', 'Texte du lien vers le plan du site', 'Le lien vers le plan du site, en bas à droite à côté de la politique (ex. : « Plan du site »).', { group: 'pied' }),
    ligne('suiteTitre', 'Titre du bloc', 'Au-dessus des cartes qui mènent aux autres pages, en bas de chaque page (ex. : « Continuer la visite »).', {
      group: 'suite',
    }),
    defineField({
      name: 'suitePages',
      title: 'Cartes vers les autres pages',
      type: 'array',
      group: 'suite',
      description: 'Une carte par page. La page où l’on se trouve est retirée automatiquement de la liste.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'cartePage',
          title: 'Carte',
          fields: [
            ligne('titre', 'Titre de la carte', 'Le nom de la page (ex. : « Sites web »).'),
            paragraphe('texte', 'Texte de la carte', 'Une phrase qui donne envie d’ouvrir la page.', { rows: 2 }),
            lien(),
          ],
          preview: { select: { title: 'titre', subtitle: 'lien' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Menu et pied de page' }) },
})

export const blocContact = defineType({
  name: 'blocContact',
  title: 'Bloc de contact (bas de chaque page)',
  type: 'document',
  fields: [
    ligne('titre', 'Titre', 'Le grand titre du bloc foncé, en bas de chaque page (ex. : « On regarde votre cas, gratuitement. »).'),
    paragraphe('texte', 'Texte', 'Le paragraphe sous le titre, avant le lien vers le calendrier.'),
    ligne('lienTexte', 'Texte du lien vers le calendrier', 'Le lien à la fin du paragraphe (ex. : « Réservez vos 30 minutes »).'),
    ligne('apresLien', 'Après le lien', 'La ponctuation ou les mots qui suivent le lien (ex. : un point).'),
    ligne('champNom', 'Étiquette du champ Nom', 'Au-dessus de la case du nom.'),
    ligne('champCourriel', 'Étiquette du champ Courriel', 'Au-dessus de la case du courriel.'),
    ligne('champMessage', 'Étiquette du champ Message', 'Au-dessus de la grande case du message.'),
    ligne('bouton', 'Texte du bouton d’envoi', 'Ex. : « Envoyer ».'),
    ligne('boutonEnvoi', 'Texte du bouton pendant l’envoi', 'Affiché pendant que le message part (ex. : « Envoi en cours… »).'),
    ligne('merciTitre', 'Message de remerciement', 'Affiché à la place du formulaire une fois le message envoyé.'),
    paragraphe('merciTexte', 'Texte sous le remerciement', 'Ce qui se passe ensuite, en une phrase.', { rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'Bloc de contact' }) },
})

export const page404 = defineType({
  name: 'page404',
  title: 'Page introuvable',
  type: 'document',
  fields: [
    ligne('surtitre', 'Ancien petit texte au-dessus du titre (retiré)', 'Retiré du site le 2026-11-15 (règle d’agence 1 : pas de petit titre au-dessus d’un titre). Caché ici en attendant d’être vidé.', { hidden: true, requis: false }),
    ligne('titre', 'Titre', 'Le grand titre de la page introuvable.'),
    paragraphe('texte', 'Texte', 'Ce que la personne peut faire maintenant.'),
    ligne('boutonAccueil', 'Bouton vers l’accueil', 'Le texte du premier bouton.'),
    ligne('boutonRealisations', 'Bouton vers les réalisations', 'Le texte du second bouton.'),
    ligne('realisationTitre', 'Titre d’une réalisation introuvable', 'Affiché quand l’adresse d’une fiche de réalisation n’existe pas.'),
    ligne('realisationBouton', 'Bouton d’une réalisation introuvable', 'Le bouton qui ramène à la liste des réalisations.'),
    ligne('realisationOnglet', 'Nom d’onglet d’une réalisation introuvable', 'Le titre de l’onglet du navigateur sur une fiche qui n’existe pas.'),
  ],
  preview: { prepare: () => ({ title: 'Page introuvable' }) },
})


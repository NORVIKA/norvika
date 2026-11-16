/**
 * Un document par page du site. Les pages ne se créent ni ne se suppriment depuis le Studio :
 * leur adresse, leurs redirections et le menu se règlent avec Norvika (SANS_CREATION, index.ts).
 * Chaque section porte un interrupteur « Afficher cette section ».
 */
import { defineArrayMember, defineField, defineType, type FieldDefinition } from 'sanity'

import {
  afficher,
  cartes,
  champsGoogle,
  deverrouillage,
  etapes,
  grandTitre,
  GROUPES_PAGE,
  ligne,
  paragraphe,
  paragraphes,
  photo,
  sectionCartes,
  sectionEtapes,
  sectionListe,
} from './champs'

/** Une section en objet repliable. */
function section(name: string, title: string, description: string, fields: FieldDefinition[], group = 'contenu') {
  return defineField({ name, title, type: 'object', description, group, options: { collapsible: true, collapsed: false }, fields: [afficher(), ...fields] })
}

/**
 * Le nom court d'une page, DÉCLARÉ UNE FOIS : plan du site, fil d'Ariane et fichier llms.txt lu par
 * les assistants IA. Les pages de services ont déjà le leur (« Nom du service »), sous le même nom
 * de champ, pour que le code lise `nom` partout.
 */
function nomPage(exemple: string) {
  return ligne(
    'nom',
    'Nom de la page',
    `Le nom court de la page, dans le plan du site, le fil d’Ariane et le fichier lu par les assistants IA (ex. : « ${exemple} »).`,
    { group: 'contenu' },
  )
}

const AIDE_RECONNAISSEZ = 'La section des cases cochées, juste sous le haut de la page.'
const AIDE_PHRASES = 'Une situation par case, écrite comme le client la vit. Elles se cochent une à une à l’écran.'

/* ================================================================ Accueil */

export const pageAccueil = defineType({
  name: 'pageAccueil',
  title: 'Accueil',
  type: 'document',
  groups: GROUPES_PAGE,
  fields: [
    deverrouillage('contenu'),
    grandTitre('h1', 'Grand titre', 'Le titre en gros, en haut de l’accueil (un seul par page).', 'contenu'),
    paragraphe('heroTexte', 'Texte sous le grand titre', 'Deux ou trois phrases qui disent ce que vous faites et pour qui.', { group: 'contenu' }),
    ligne('heroBoutonSecondaire', 'Second bouton', 'Le bouton à côté de « Réserver mes 30 minutes ». Il mène aux réalisations.', { group: 'contenu' }),
    section('videos', 'Vidéos de clients', 'Les témoignages vidéo, juste sous le haut de la page.', [
      ligne('titre', 'Ancien petit titre en capitales (retiré)', 'Retiré du site le 2026-11-16 (règle d’agence 1 : pas de petit titre au-dessus d’un titre). Caché ici en attendant d’être vidé.', { hidden: true, requis: false }),
      ligne('sousTitre', 'Titre de la section', 'La phrase en gros au-dessus des vidéos (ex. : « Nos clients en parlent mieux que nous. »).'),
      ligne('bouton', 'Texte du bouton sous chaque vidéo', 'Le bouton qui mène à la fiche du client (ex. : « Voir la réalisation »).'),
      defineField({
        name: 'liste',
        title: 'Vidéos',
        type: 'array',
        description: 'Les vidéos YouTube, dans l’ordre. Rien ne se charge de YouTube avant que la personne clique.',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'video',
            title: 'Vidéo',
            fields: [
              ligne('youtubeId', 'Identifiant YouTube', 'Les caractères après « v= » ou après « shorts/ » dans l’adresse de la vidéo (ex. : « RSq7pu-hRjs »).'),
              ligne('titre', 'Titre de la vidéo', 'Lu par les lecteurs d’écran et affiché au survol (ex. : « Témoignage d’André et Jen »).'),
              defineField({
                name: 'realisation',
                title: 'Fiche du client',
                type: 'reference',
                to: [{ type: 'realisation' }],
                description: 'La réalisation ouverte par le bouton sous la vidéo. Laissez vide pour ne pas afficher de bouton.',
              }),
            ],
            preview: { select: { title: 'titre', subtitle: 'youtubeId' } },
          }),
        ],
      }),
    ]),
    section('avantApres', 'Avant / après', 'La bascule qui montre un site avant et après la refonte.', [
      ligne('titre', 'Ancien petit titre en capitales (retiré)', 'Retiré du site le 2026-11-16 (règle d’agence 1 : pas de petit titre au-dessus d’un titre). Caché ici en attendant d’être vidé.', { hidden: true, requis: false }),
      ligne('sousTitre', 'Titre de la section', 'La phrase en gros au-dessus de la bascule (ex. : « Ce qu’une refonte change. »).'),
      ligne('texte', 'Texte', 'Une phrase qui présente le client montré.'),
      defineField({
        name: 'realisation',
        title: 'Réalisation montrée',
        type: 'reference',
        to: [{ type: 'realisation' }],
        description: 'La réalisation dont on montre l’avant et l’après. Elle doit avoir ses deux captures (section « Avant / après » de sa fiche).',
        validation: (r) => r.required(),
      }),
      ligne('bouton', 'Texte du bouton', 'Le bouton sous la bascule, qui mène à la fiche (ex. : « Voir la réalisation »).'),
    ]),
    section('quiz', 'Bandeau du quiz', 'Le bandeau qui invite à faire le diagnostic. Le texte du bouton se change dans « Menu et pied de page ».', [
      ligne('titre', 'Titre', 'La question posée au visiteur.'),
      paragraphe('texte', 'Texte', 'Une ou deux phrases sous le titre.'),
    ]),
    section('logos', 'Bande de logos', 'Les logos de quelques clients, sous le bandeau du quiz.', [
      ligne('titre', 'Phrase au-dessus des logos', 'Le petit texte en capitales.'),
      defineField({
        name: 'realisations',
        title: 'Clients montrés',
        type: 'array',
        description: 'Les logos viennent des fiches de réalisation. Sur téléphone, seuls les quatre premiers s’affichent.',
        of: [defineArrayMember({ type: 'reference', to: [{ type: 'realisation' }] })],
      }),
      ligne('lien', 'Texte du lien sous les logos', 'Le lien vers la page des réalisations.'),
    ]),
    section('services', 'Services', 'La liste des quatre services. Le nom, la phrase et le détail de chaque service se changent dans sa page de service, onglet « Accueil et menu ».', [
      ligne('titre', 'Titre de la section', 'Le titre au-dessus de la liste.'),
      ligne('ouvrir', 'Texte pour ouvrir une ligne', 'À droite de chaque service fermé (ex. : « Le détail »).'),
      ligne('fermer', 'Texte pour fermer une ligne', 'À droite d’un service ouvert (ex. : « Réduire »).'),
      ligne('lienPage', 'Début du lien vers la page', 'Suivi du nom du service, dans une ligne ouverte (ex. : « Voir la page »).'),
    ]),
    section('parcours', 'Comment ça marche', 'Le parcours animé de la démarche.', [
      ligne('surtitre', 'Ancien petit titre (retiré)', 'Retiré du site le 2026-11-15 (règle d’agence 1 : pas de petit titre au-dessus d’un titre). Caché ici en attendant d’être vidé.', { hidden: true, requis: false }),
      ligne('titre', 'Titre de la section', 'Le titre du parcours.'),
      etapes(),
    ]),
    section('fondateurs', 'Fondateurs', 'Le bloc foncé avec la photo des fondateurs.', [
      ligne('titre', 'Titre', 'Le titre du bloc.'),
      paragraphe('texte', 'Texte', 'Le paragraphe sous le titre.'),
      ligne('legende', 'Petite ligne sous le texte', 'Le texte en capitales sous le paragraphe.'),
      photo('photo', 'Photo', 'La photo des fondateurs, à droite.'),
      ligne('citation', 'Citation sur la photo', 'La phrase en italique posée sur le bas de la photo, avec ses guillemets.'),
    ]),
    section('avis', 'Avis Google', 'Les avis. Chaque avis se change dans « Avis Google » du menu de gauche.', [
      ligne('titre', 'Titre de la section', 'Le petit titre en capitales.'),
      ligne('etoiles', 'Étoiles', 'Les étoiles affichées à côté du titre.'),
      ligne('note', 'Note', 'Le texte à côté des étoiles (ex. : « 5,0 sur Google »). Pas de nombre d’avis : il serait faux au prochain avis reçu.'),
    ]),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Accueil' }) },
})

/* ================================================================ Pages de services */

/** Les champs communs aux quatre pages de services. */
function champsService(): FieldDefinition[] {
  return [
    deverrouillage('contenu'),
    ligne('nom', 'Nom du service', 'Le nom court, affiché dans le fil d’Ariane, dans les onglets des services et dans le plan du site (ex. : « Sites web »).', { group: 'menu' }),
    defineField({
      name: 'ordre',
      title: 'Ordre d’affichage',
      type: 'number',
      group: 'menu',
      description: 'La place du service dans la liste de l’accueil et dans les onglets (1 = premier).',
      validation: (r) => r.required().integer().min(1),
    }),
    ligne('accroche', 'Phrase sur l’accueil', 'La phrase affichée pour ce service dans la liste de l’accueil.', { group: 'menu' }),
    paragraphe('detail', 'Détail sur l’accueil', 'Le texte qui apparaît quand on ouvre la ligne du service sur l’accueil.', { group: 'menu' }),
    ligne('schemaNom', 'Nom du service pour Google', 'Le nom complet du service, lu par Google (invisible à l’écran).', { group: 'google' }),
    ligne('schemaType', 'Catégorie du service pour Google', 'La catégorie générale du service, lue par Google (invisible à l’écran).', { group: 'google' }),
    grandTitre('h1', 'Grand titre', 'Le titre en gros, en haut de la page (un seul par page).', 'contenu'),
    paragraphe('heroTexte', 'Texte sous le grand titre', 'Deux ou trois phrases à droite du grand titre.', { group: 'contenu' }),
  ]
}

const GROUPES_SERVICE = [...GROUPES_PAGE, { name: 'menu', title: 'Accueil et menu' }]

export const pageSitesWeb = defineType({
  name: 'pageSitesWeb',
  title: 'Sites web',
  type: 'document',
  groups: GROUPES_SERVICE,
  fields: [
    ...champsService(),
    sectionListe('reconnaissez', 'Vous vous reconnaissez?', AIDE_RECONNAISSEZ, 'Ex. : « Vous vous reconnaissez? »', AIDE_PHRASES, 'contenu'),
    sectionEtapes('parcours', 'Comment ça se passe', 'Le parcours animé des étapes.', 'Ex. : « Comment ça se passe ».', 'contenu'),
    sectionCartes('differemment', 'Ce qu’on fait différemment', 'Les cartes en deux colonnes.', 'Ex. : « Ce qu’on fait différemment ».', 'contenu'),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Sites web' }) },
})

export const pageAutomatisation = defineType({
  name: 'pageAutomatisation',
  title: 'Automatisation',
  type: 'document',
  groups: GROUPES_SERVICE,
  fields: [
    ...champsService(),
    sectionListe('reconnaissez', 'Vous vous reconnaissez?', AIDE_RECONNAISSEZ, 'Ex. : « Vous vous reconnaissez? »', AIDE_PHRASES, 'contenu'),
    sectionEtapes('parcours', 'Comment ça se passe', 'Le parcours animé des étapes.', 'Ex. : « Comment ça se passe ».', 'contenu'),
    sectionCartes('differemment', 'Ce qu’on fait différemment', 'Les cartes en deux colonnes.', 'Ex. : « Ce qu’on fait différemment ».', 'contenu'),
    section('exemple', 'Un exemple simple', 'Le récit d’un cas réel, en bas de la page.', [
      ligne('titre', 'Titre', 'Le titre à gauche du récit.'),
      paragraphe('texte', 'Récit', 'Le cas raconté en quelques phrases.', { rows: 6 }),
    ]),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Automatisation' }) },
})

export const pagePhotoVideo = defineType({
  name: 'pagePhotoVideo',
  title: 'Photo et vidéo',
  type: 'document',
  groups: GROUPES_SERVICE,
  fields: [
    ...champsService(),
    ligne(
      'heroLienTexte',
      'Troisième bouton (portfolio)',
      'Le bouton qui ouvre le portfolio, à côté de « Faire le quiz ». Son adresse se change dans « Infos de l’entreprise ». Laissez vide pour le retirer.',
      { group: 'contenu', requis: false },
    ),
    sectionListe('reconnaissez', 'Vous vous reconnaissez?', AIDE_RECONNAISSEZ, 'Ex. : « Vous vous reconnaissez? »', AIDE_PHRASES, 'contenu'),
    sectionCartes('capte', 'Ce qu’on capte', 'Les cartes en deux colonnes, sous les cases cochées.', 'Ex. : « Ce qu’on capte ».', 'contenu'),
    sectionEtapes('parcours', 'Comment ça se passe', 'Le parcours animé des étapes.', 'Ex. : « Comment ça se passe ».', 'contenu'),
    sectionCartes('differemment', 'Ce qu’on fait différemment', 'Les cartes en trois colonnes.', 'Ex. : « Ce qu’on fait différemment ».', 'contenu'),
    section('tournage', 'Photo de tournage', 'La photo et le texte en bas de la page.', [
      photo('photo', 'Photo', 'Une photo de tournage chez un client.'),
      ligne('titre', 'Titre', 'La phrase en gras à côté de la photo.'),
      paragraphe('texte', 'Texte', 'Le paragraphe sous le titre.'),
    ]),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Photo et vidéo' }) },
})

export const pageFormation = defineType({
  name: 'pageFormation',
  title: 'Formation',
  type: 'document',
  groups: GROUPES_SERVICE,
  fields: [
    ...champsService(),
    sectionListe('reconnaissez', 'Vous vous reconnaissez?', AIDE_RECONNAISSEZ, 'Ex. : « Vous vous reconnaissez? »', AIDE_PHRASES, 'contenu'),
    sectionCartes('gains', 'Ce que vous gagnez', 'Les cartes en deux colonnes, sous les cases cochées.', 'Ex. : « Ce que vous gagnez, concrètement ».', 'contenu'),
    section('enseigne', 'Ce qu’on peut vous montrer', 'Les cartes en trois colonnes, avec le résultat « Après ».', [
      ligne('titre', 'Titre de la section', 'Ex. : « Trois choses qu’on peut vous montrer ».'),
      ligne('libelleApres', 'Mot devant le résultat', 'Le mot en gras devant le résultat de chaque carte (ex. : « Après: »).'),
      defineField({
        name: 'liste',
        title: 'Cartes',
        type: 'array',
        description: 'Une carte par sujet, numérotées automatiquement dans l’ordre.',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'sujet',
            title: 'Sujet',
            fields: [
              ligne('titre', 'Titre', 'Le sujet de la formation.'),
              paragraphe('texte', 'Ce qu’on enseigne', 'Ce que la formation couvre.'),
              paragraphe('apres', 'Le résultat', 'Ce que l’équipe sait faire après, affiché sous le trait.'),
            ],
            preview: { select: { title: 'titre', subtitle: 'texte' } },
          }),
        ],
      }),
    ]),
    sectionEtapes('parcours', 'Comment ça se passe', 'Le parcours animé des étapes.', 'Ex. : « Comment ça se passe ».', 'contenu'),
    sectionCartes('differemment', 'Ce qu’on fait différemment', 'Les cartes en deux colonnes.', 'Ex. : « Ce qu’on fait différemment ».', 'contenu'),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Formation' }) },
})

/* ================================================================ Diagnostic */

const AIDE_GABARIT =
  'Les mots entre accolades sont remplacés par les réponses : {reponse1} à {reponse7} reprennent la « phrase miroir » de la réponse choisie à chaque question.'

const profil = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: 'object',
    description,
    options: { collapsible: true, collapsed: true },
    fields: [
      ligne('titre', 'Titre du résultat', 'Le grand titre du résultat.'),
      paragraphe('miroir', 'Ce qu’on voit', `La première carte. ${AIDE_GABARIT}`),
      paragraphe('bonneNouvelle', 'La bonne nouvelle', 'La carte du milieu, mise en évidence.'),
      paragraphe('suite', 'La suite', `La troisième carte. ${AIDE_GABARIT}`),
      ligne('volet', 'Le sujet, dans le remerciement', 'Remplace {volet} dans le texte de remerciement (ex. : « votre site »).'),
      defineField({
        name: 'lien',
        title: 'Page ouverte par « Voir notre approche »',
        type: 'string',
        description: 'Une page du site, commençant par « / » (ex. : /sites-web).',
        validation: (r) => r.required().regex(/^\//, { name: 'page du site' }),
      }),
    ],
  })

export const pageDiagnostic = defineType({
  name: 'pageDiagnostic',
  title: 'Diagnostic (quiz)',
  type: 'document',
  groups: [...GROUPES_PAGE, { name: 'questions', title: 'Questions' }, { name: 'resultats', title: 'Résultats' }],
  fields: [
    deverrouillage('contenu'),
    nomPage('Diagnostic gratuit'),
    grandTitre('h1', 'Grand titre', 'Le titre de l’écran d’accueil du quiz.', 'contenu'),
    paragraphe('intro', 'Texte d’accueil', 'La phrase sous le titre, avant de commencer.', { group: 'contenu' }),
    ligne('boutonDebut', 'Bouton pour commencer', 'Ex. : « C’est parti ».', { group: 'contenu' }),
    ligne('encouragement', 'Encouragement à la 5e question', 'Le petit message affiché au-dessus de la cinquième question.', { group: 'questions' }),
    ligne('boutonRetour', 'Lien pour revenir en arrière', 'Sous les réponses, à partir de la 2e question (ex. : « Revenir »).', { group: 'questions' }),
    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      group: 'questions',
      description:
        'Les sept questions, dans l’ordre. Le calcul du résultat suit cet ordre : questions 1 et 2 = le site, 3 et 4 = le temps, 5 et 6 = l’image, 7 = ce que la personne ferait de son temps. Changez les textes, pas l’ordre ni le nombre.',
      validation: (r) => r.length(7).error('Le calcul du résultat repose sur exactement sept questions.'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'question',
          title: 'Question',
          fields: [
            ligne('question', 'Question', 'La question, telle qu’elle s’affiche.'),
            paragraphe('precision', 'Précision', 'Une phrase d’exemple sous la question. Laissez vide si inutile.', { requis: false, rows: 2 }),
            defineField({
              name: 'reponses',
              title: 'Réponses',
              type: 'array',
              description: 'De deux à quatre réponses, affichées A, B, C, D.',
              validation: (r) => r.min(2).max(4),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'reponse',
                  title: 'Réponse',
                  fields: [
                    ligne('libelle', 'Réponse', 'Ce que la personne clique.'),
                    ligne('miroir', 'Phrase miroir', 'La même réponse reformulée, reprise dans le résultat (voir {reponse1} à {reponse7}).'),
                    defineField({
                      name: 'points',
                      title: 'Points',
                      type: 'number',
                      description: 'De 0 (tout va bien) à 3 (gros frein). Sert à trouver ce qui freine le plus.',
                      validation: (r) => r.required().integer().min(0).max(3),
                    }),
                  ],
                  preview: { select: { title: 'libelle', subtitle: 'miroir' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
    }),
    ligne('resultatSurtitre', 'Ancien petit titre du résultat (retiré)', 'Retiré du site le 2026-11-15 (règle d’agence 1 : pas de petit titre au-dessus d’un titre). Caché ici en attendant d’être vidé.', { group: 'resultats', hidden: true, requis: false }),
    ligne('barreSite', 'Barre 1', 'Le nom de la première barre (ex. : « Votre site »).', { group: 'resultats' }),
    ligne('barreTemps', 'Barre 2', 'Le nom de la deuxième barre (ex. : « Votre temps »).', { group: 'resultats' }),
    ligne('barreImage', 'Barre 3', 'Le nom de la troisième barre (ex. : « Votre image »).', { group: 'resultats' }),
    ligne('noteHaute', 'Note d’un gros frein', 'À droite d’une barre de 5 points ou plus (ex. : « à régler »).', { group: 'resultats' }),
    ligne('noteMoyenne', 'Note d’un frein moyen', 'À droite d’une barre de 3 ou 4 points (ex. : « à surveiller »).', { group: 'resultats' }),
    ligne('noteBasse', 'Note sans frein', 'À droite d’une barre de 0 à 2 points (ex. : « solide »).', { group: 'resultats' }),
    ligne('carteMiroir', 'Titre de la 1re carte', 'Ex. : « Ce qu’on voit ».', { group: 'resultats' }),
    ligne('carteBonneNouvelle', 'Titre de la 2e carte', 'Ex. : « La bonne nouvelle ».', { group: 'resultats' }),
    ligne('carteSuite', 'Titre de la 3e carte', 'Ex. : « La suite ».', { group: 'resultats' }),
    { ...profil('profilSite', 'Résultat : le site freine le plus', 'Quand les questions 1 et 2 donnent le plus de points.'), group: 'resultats' },
    { ...profil('profilTemps', 'Résultat : le temps freine le plus', 'Quand les questions 3 et 4 donnent le plus de points.'), group: 'resultats' },
    { ...profil('profilImage', 'Résultat : l’image freine le plus', 'Quand les questions 5 et 6 donnent le plus de points.'), group: 'resultats' },
    { ...profil('profilAucun', 'Résultat : tout va bien', 'Quand le total des six premières questions est de 3 points ou moins.'), group: 'resultats' },
    ligne('formTitre', 'Titre du formulaire', 'L’offre d’analyse, sous les cartes du résultat.', { group: 'resultats' }),
    paragraphe('formTexte', 'Texte du formulaire', 'Ce que la personne recevra.', { group: 'resultats' }),
    ligne('formNom', 'Exemple dans la case du nom', 'Le texte pâle dans la case vide (ex. : « Nom complet »).', { group: 'resultats' }),
    ligne('formCourriel', 'Exemple dans la case du courriel', 'Le texte pâle dans la case vide (ex. : « Courriel »).', { group: 'resultats' }),
    ligne('formBouton', 'Bouton du formulaire', 'Ex. : « Recevoir mon analyse ».', { group: 'resultats' }),
    paragraphe('formNote', 'Petite note à côté du bouton', 'Ce qui rassure la personne.', { group: 'resultats', rows: 2 }),
    ligne('merciTitre', 'Remerciement', 'Affiché une fois le formulaire envoyé. {prenom} est remplacé par le prénom de la personne.', { group: 'resultats' }),
    paragraphe('merciTexte', 'Texte du remerciement', '{volet} est remplacé par le sujet du résultat (ex. : « votre site »).', { group: 'resultats', rows: 2 }),
    ligne('boutonApproche', 'Bouton après le remerciement', 'Mène à la page du service qui freine le plus (ex. : « Voir notre approche »).', { group: 'resultats' }),
    ligne('boutonRefaire', 'Lien pour recommencer', 'Sous le résultat (ex. : « Refaire le quiz »).', { group: 'resultats' }),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Diagnostic (quiz)' }) },
})

/* ================================================================ Équipe */

export const pageEquipe = defineType({
  name: 'pageEquipe',
  title: 'L’équipe',
  type: 'document',
  groups: GROUPES_PAGE,
  fields: [
    deverrouillage('contenu'),
    nomPage('L’équipe'),
    grandTitre('h1', 'Grand titre', 'Le titre en gros, en haut de la page.', 'contenu'),
    paragraphe('intro', 'Texte sous le grand titre', 'Une ou deux phrases de présentation.', { group: 'contenu' }),
    section('origine', 'Comment Norvika est née', 'Le récit des débuts.', [
      ligne('titre', 'Titre', 'Le titre à gauche du récit.'),
      paragraphes('texte', 'Récit', 'Un paragraphe par case, dans l’ordre.'),
    ]),
    section('quiFaitQuoi', 'Qui fait quoi', 'Les cartes des membres. Chaque membre se change dans « Membres de l’équipe ».', [
      ligne('titre', 'Titre', 'Le titre au-dessus des cartes.'),
      ligne('photoAVenir', 'Texte sans photo', 'Affiché dans le cercle d’un membre qui n’a pas encore de photo.'),
    ]),
    section('ensemble', 'Ensemble', 'La carte avec la photo des deux fondateurs.', [
      photo('photo', 'Photo', 'La photo à gauche de la carte.'),
      ligne('titre', 'Titre', 'Le titre de la carte.'),
      paragraphe('texte', 'Texte', 'Le paragraphe de la carte.', { rows: 4 }),
    ]),
    defineField({ ...sectionCartes('croyances', 'Ce en quoi on croit', 'Les valeurs, en cartes.', 'Ex. : « Ce en quoi on croit ».'), group: 'contenu' }),
    section('conclusion', 'Conclusion', 'Le bloc de fin de page.', [ligne('titre', 'Titre', 'Le titre à gauche.'), paragraphe('texte', 'Texte', 'Le paragraphe à droite.')]),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'L’équipe' }) },
})

/* ================================================================ Réalisations */

export const pageRealisations = defineType({
  name: 'pageRealisations',
  title: 'Réalisations',
  type: 'document',
  groups: [...GROUPES_PAGE, { name: 'fiche', title: 'Fiches des clients' }],
  fields: [
    deverrouillage('contenu'),
    nomPage('Réalisations'),
    ligne('surtitre', 'Ancien petit titre (retiré)', 'Retiré du site le 2026-11-15 (règle d’agence 1 : pas de petit titre au-dessus d’un titre). Caché ici en attendant d’être vidé.', { group: 'contenu', hidden: true, requis: false }),
    grandTitre('h1', 'Grand titre, début', 'La partie du grand titre en noir (ex. : « Ils nous font »).', 'contenu'),
    grandTitre('h1Accent', 'Grand titre, fin en couleur', 'La fin du grand titre, en bleu (ex. : « confiance. »).', 'contenu'),
    paragraphe('intro', 'Texte sous le grand titre', 'Une phrase qui explique comment utiliser la page.', { group: 'contenu' }),
    ligne('filtreTout', 'Premier filtre', 'Le filtre qui montre tous les clients (ex. : « Tout »).', { group: 'contenu' }),
    defineField({
      name: 'categories',
      title: 'Noms des filtres',
      type: 'object',
      group: 'contenu',
      description: 'Les noms des services, affichés dans les filtres et sur les fiches. Un filtre sans client ne s’affiche pas.',
      fields: [
        ligne('siteWeb', 'Site web', 'Le nom du filtre des sites web.'),
        ligne('photoVideo', 'Photo et vidéo', 'Le nom du filtre photo et vidéo.'),
        ligne('automatisation', 'Automatisation', 'Le nom du filtre automatisation.'),
        ligne('formation', 'Formation', 'Le nom du filtre formation.'),
      ],
    }),
    ligne('aucun', 'Message quand un filtre est vide', 'Affiché si aucun client ne correspond au filtre choisi.', { group: 'contenu' }),
    section('portfolio', 'Bandeau du portfolio', 'Le bandeau foncé sous les logos. L’adresse du portfolio se change dans « Infos de l’entreprise ».', [
      ligne('titre', 'Titre', 'Le titre du bandeau.'),
      ligne('bouton', 'Texte du bouton', 'Le bouton qui ouvre le portfolio.'),
    ]),
    ligne('ficheSite', 'Bouton vers le site du client', 'Affiché si la fiche a l’adresse du site du client (ex. : « Visiter le site »).', { group: 'fiche' }),
    ligne('ficheBesoinSurtitre', 'Ancien petit titre du besoin (retiré)', 'Retiré du site le 2026-11-15 (règle d’agence 1 : pas de petit titre au-dessus d’un titre). Caché ici en attendant d’être vidé.', { group: 'fiche', hidden: true, requis: false }),
    ligne('ficheBesoinTitre', 'Titre du besoin', 'Ex. : « Le besoin ».', { group: 'fiche' }),
    ligne('ficheApercu', 'Légende de la photo du mandat', 'Sous la photo de couverture (ex. : « Un aperçu du mandat. »).', { group: 'fiche' }),
    ligne('ficheApercuBouton', 'Bouton sous la photo du mandat', 'Ouvre le portfolio (ex. : « Voir le portfolio complet »).', { group: 'fiche' }),
    ligne('ficheMandatSurtitre', 'Ancien petit titre du mandat (retiré)', 'Retiré du site le 2026-11-15 (règle d’agence 1 : pas de petit titre au-dessus d’un titre). Caché ici en attendant d’être vidé.', { group: 'fiche', hidden: true, requis: false }),
    ligne('ficheMandatTitre', 'Titre du mandat', 'Ex. : « Ce qu’on a fait ».', { group: 'fiche' }),
    ligne('ficheResultat', 'Titre du résultat', 'Le titre de l’encadré du résultat, en bas de chaque fiche (ex. : « Le résultat »).', { group: 'fiche' }),
    ligne('ficheAppel', 'Titre du bandeau de fin', 'Au-dessus du bouton de rendez-vous, en bas de chaque fiche.', { group: 'fiche' }),
    ligne('ficheOnglet', 'Fin du titre dans Google', 'Ajoutée après le nom du client dans le titre de chaque fiche (ex. : « | Réalisations Norvika »).', { group: 'fiche' }),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Réalisations' }) },
})

/* ================================================================ Contact */

export const pageContact = defineType({
  name: 'pageContact',
  title: 'Contact',
  type: 'document',
  groups: [...GROUPES_PAGE, { name: 'formulaire', title: 'Formulaire' }],
  fields: [
    deverrouillage('contenu'),
    nomPage('Contact'),
    grandTitre('h1', 'Grand titre', 'Le titre en gros, à gauche du formulaire.', 'contenu'),
    paragraphe('intro', 'Texte sous le grand titre', 'Une ou deux phrases d’invitation.', { group: 'contenu' }),
    ligne('libelleCourriel', 'Étiquette du courriel', 'Au-dessus de l’adresse courriel (ex. : « Courriel »). L’adresse se change dans « Infos de l’entreprise ».', {
      group: 'contenu',
    }),
    ligne('libelleTelephone', 'Étiquette du téléphone', 'Au-dessus du numéro (ex. : « Téléphone »).', { group: 'contenu' }),
    ligne('libelleRendezVous', 'Étiquette du rendez-vous', 'Au-dessus du lien du calendrier (ex. : « Prendre rendez-vous »).', { group: 'contenu' }),
    ligne('lienRendezVous', 'Texte du lien du calendrier', 'Ex. : « Réserver un appel de 30 min ».', { group: 'contenu' }),
    ligne('champNom', 'Étiquette du nom', 'Au-dessus de la case du nom.', { group: 'formulaire' }),
    ligne('champCourriel', 'Étiquette du courriel', 'Au-dessus de la case du courriel.', { group: 'formulaire' }),
    ligne('champTelephone', 'Étiquette du téléphone', 'Au-dessus de la case du téléphone.', { group: 'formulaire' }),
    ligne('champMessage', 'Étiquette du message', 'Au-dessus de la grande case du message.', { group: 'formulaire' }),
    ligne('bouton', 'Texte du bouton', 'Ex. : « Envoyer le message ».', { group: 'formulaire' }),
    ligne('boutonEnvoi', 'Texte pendant l’envoi', 'Ex. : « Envoi en cours… ».', { group: 'formulaire' }),
    ligne('merciTitre', 'Message de remerciement', 'Affiché à la place du formulaire une fois le message envoyé.', { group: 'formulaire' }),
    paragraphe('merciTexte', 'Texte sous le remerciement', 'Ce qui se passe ensuite.', { group: 'formulaire', rows: 2 }),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Contact' }) },
})

/* ================================================================ Plan du site */

export const pagePlanDuSite = defineType({
  name: 'pagePlanDuSite',
  title: 'Plan du site',
  type: 'document',
  groups: GROUPES_PAGE,
  fields: [
    grandTitre('h1', 'Grand titre', 'Le titre en haut du plan du site.', 'contenu'),
    paragraphe('intro', 'Texte sous le grand titre', 'Une phrase qui dit ce que la page contient.', { group: 'contenu', rows: 2 }),
    ligne(
      'titrePages',
      'Titre de la liste des pages',
      'Au-dessus de la liste des pages (ex. : « Les pages »). La liste se fait toute seule, avec le nom de chaque page. Sert aussi de titre dans le fichier lu par les assistants IA.',
      { group: 'contenu' },
    ),
    ligne(
      'titreRealisations',
      'Titre de la liste des réalisations',
      'Au-dessus de la liste des fiches des clients (ex. : « Les réalisations »). Une fiche publiée s’y ajoute toute seule. Sert aussi de titre dans le fichier lu par les assistants IA.',
      { group: 'contenu' },
    ),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Plan du site' }) },
})

/* ================================================================ Bienvenue */

export const pageBienvenue = defineType({
  name: 'pageBienvenue',
  title: 'Bienvenue (nouveaux clients)',
  type: 'document',
  groups: [...GROUPES_PAGE, { name: 'formulaire', title: 'Formulaire' }],
  fields: [
    deverrouillage('contenu'),
    grandTitre('h1', 'Grand titre', 'Le titre en haut de la page d’accueil des nouveaux clients. Cette page est cachée de Google.', 'contenu'),
    paragraphe('intro', 'Texte sous le grand titre', 'Ce que la page explique.', { group: 'contenu' }),
    ligne('formTitre', 'Titre du formulaire', 'Au-dessus du formulaire de coordonnées.', { group: 'formulaire' }),
    ligne('champPrenom', 'Étiquette du prénom', 'Au-dessus de la case du prénom.', { group: 'formulaire' }),
    ligne('champCourriel', 'Étiquette du courriel', 'Au-dessus de la case du courriel.', { group: 'formulaire' }),
    ligne('champTelephone', 'Étiquette du téléphone', 'Au-dessus de la case du téléphone.', { group: 'formulaire' }),
    ligne('bouton', 'Texte du bouton', 'Ex. : « Envoyer ».', { group: 'formulaire' }),
    ligne('boutonEnvoi', 'Texte pendant l’envoi', 'Ex. : « Envoi en cours… ».', { group: 'formulaire' }),
    ligne('merciTitre', 'Message de remerciement', 'Affiché une fois les coordonnées envoyées.', { group: 'formulaire' }),
    paragraphe('merciTexte', 'Texte sous le remerciement', 'Ce qui se passe ensuite.', { group: 'formulaire', rows: 2 }),
    section('outils', 'Les outils', 'Les outils expliqués simplement.', [
      ligne('titre', 'Titre', 'Le titre de la section.'),
      paragraphe('texte', 'Texte', 'Le paragraphe sous le titre.'),
      cartes('liste', 'Outils', 'Un outil par carte : son nom en titre, son rôle en texte.'),
      paragraphe('propriete', 'Encadré sous les outils', 'Le message sur la propriété des comptes.'),
    ]),
    section('etapes', 'Les étapes', 'Les étapes du projet, numérotées automatiquement.', [
      ligne('titre', 'Titre', 'Le titre de la section.'),
      cartes('liste', 'Étapes', 'Une étape par carte, dans l’ordre.'),
    ]),
    section('paiement', 'Le paiement', 'Comment se fait le paiement.', [ligne('titre', 'Titre', 'Le titre de la section.'), paragraphe('texte', 'Texte', 'Les modalités de paiement.')]),
    section('contact', 'Nous joindre', 'Le bloc foncé de fin de page. Le courriel et le téléphone se changent dans « Infos de l’entreprise ».', [
      ligne('titre', 'Titre', 'Le titre du bloc.'),
      paragraphe('texte', 'Texte', 'La phrase sous le titre.'),
      ligne('libelleCourriel', 'Devant le courriel', 'Ex. : « Courriel : ».'),
      ligne('libelleTelephone', 'Devant le téléphone', 'Ex. : « Téléphone : ».'),
    ]),
    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Bienvenue (nouveaux clients)' }) },
})

/**
 * Page « Vérificateur Loi 25 » (/verificateur-loi-25) : tous ses textes, y compris le bloc qui
 * l'annonce dans la page Sites web et le lien du pied de page.
 *
 * Pourquoi le bloc de Sites web et le lien du pied vivent ICI et pas dans « Sites web » et « Menu
 * et pied de page » : tant que l'outil n'est pas en ligne, le code en production rend déjà ces deux
 * documents (le pied de page affiche tous les liens de sa liste). Un nouveau document, lui, n'est lu
 * par aucune page en production : le semer ne change rien à l'écran avant la mise en ligne.
 *
 * ⛔ RÈGLE CENTRALE (avis accepté par William le 2026-11-18) : jamais « conforme » ni « non
 * conforme ». Chaque vérification sort en « à corriger », « à vérifier » ou « en place ». Textes
 * rédigés par Martin (contenu/verificateur-loi25-textes.md) : un changement de fond repasse par lui.
 */
import { defineField, defineType, type FieldDefinition } from 'sanity'

import { afficher, champsGoogle, GROUPES_PAGE, grandTitre, ligne, paragraphe, paragraphes, phrases } from './champs'

const AIDE_VARIABLES =
  'Les mots entre accolades sont remplacés par ce que l’outil a vu (ex. : {services} devient « Google Analytics, Meta »). Gardez-les tels quels.'

/** Un texte affiché selon le résultat d'une vérification. */
const etat = (name: string, title: string, quand: string, rows = 3) =>
  paragraphe(name, title, `${quand} ${AIDE_VARIABLES}`, { rows })

/** Une des huit vérifications : son nom, pourquoi elle compte, l'article, et un texte par cas. */
function verification(name: string, title: string, description: string, textes: FieldDefinition[]) {
  return defineField({
    name,
    title,
    type: 'object',
    group: 'verifications',
    description,
    options: { collapsible: true, collapsed: true },
    fields: [
      ligne('nom', 'Nom de la vérification', 'Le titre de la ligne dans le résultat.'),
      paragraphe('pourquoi', 'Pourquoi ça compte', 'Affiché quand la personne ouvre « Pourquoi ça compte » sous la ligne.', { rows: 3 }),
      ligne('article', 'Article de loi', 'Ex. : « Art. 8.1 et 14 ».'),
      ...textes,
    ],
  })
}

const GROUPES = [
  GROUPES_PAGE[0],
  { name: 'analyse', title: 'Analyse et erreurs' },
  { name: 'resultat', title: 'Résultat' },
  { name: 'verifications', title: 'Les 8 vérifications' },
  { name: 'ailleurs', title: 'Sites web et pied de page' },
  GROUPES_PAGE[1],
]

export const pageVerificateurLoi25 = defineType({
  name: 'pageVerificateurLoi25',
  title: 'Vérificateur Loi 25',
  type: 'document',
  groups: GROUPES,
  fields: [
    /* ---------------------------------------------------------------- la page */
    ligne(
      'nom',
      'Nom de la page',
      'Le nom court de la page, dans le plan du site, le fil d’Ariane et le fichier lu par les assistants IA (ex. : « Vérificateur Loi 25 »).',
      { group: 'contenu' },
    ),
    grandTitre('h1', 'Grand titre', 'Le titre en gros, en haut de la page (un seul par page).', 'contenu'),
    paragraphe('intro', 'Texte sous le grand titre', 'Ce que fait l’outil, en deux ou trois phrases.', { group: 'contenu', rows: 4 }),
    paragraphe(
      'introRisque',
      'Phrase sur les sanctions (facultative)',
      'Affichée sous le texte d’introduction si elle est remplie. Aucun montant : ils visent les grandes entreprises et font peur sans informer. Laissez vide pour la retirer.',
      { group: 'contenu', requis: false, rows: 2 },
    ),
    ligne('champLibelle', 'Étiquette du champ', 'Au-dessus de la case de l’adresse (ex. : « Adresse de votre site »).', { group: 'contenu' }),
    ligne('champExemple', 'Exemple dans le champ', 'Le texte pâle dans la case vide (ex. : « exemple.ca »).', { group: 'contenu' }),
    ligne('bouton', 'Texte du bouton', 'Ex. : « Lancer la vérification ».', { group: 'contenu' }),
    paragraphe(
      'mentionCollecte',
      'Mention de collecte sous le champ',
      'Texte légal (Loi 25, art. 8) rédigé par Martin. Ne pas le raccourcir sans lui : il décrit ce que l’outil recueille vraiment.',
      { group: 'contenu', rows: 6 },
    ),
    ligne(
      'mentionLien',
      'Mots du lien vers la politique',
      'Les mots de la mention de collecte qui deviennent un lien vers la politique de confidentialité. Ils doivent apparaître tels quels dans la mention.',
      { group: 'contenu' },
    ),
    ligne(
      'listeTitre',
      'Titre de la liste des vérifications',
      'Au-dessus des huit vérifications, avant toute analyse (ex. : « Les 8 points vérifiés »). Pendant l’analyse et après, il est remplacé par le titre d’analyse puis par la phrase de synthèse.',
      { group: 'contenu' },
    ),
    ligne('invisibleTitre', 'Titre « ce que le test ne voit pas »', 'Le titre de la section sous le formulaire.', { group: 'contenu' }),
    paragraphe('invisibleTexte', 'Texte avant la liste', 'La phrase au-dessus de la liste.', { group: 'contenu', rows: 2 }),
    phrases('invisibleListe', 'Ce que le test ne peut pas voir', 'Un élément par case, dans l’ordre.', { group: 'contenu' }),
    paragraphes('avertissement', 'Avertissement complet', 'Sous les résultats. Un paragraphe par case.', { group: 'contenu' }),
    ligne('appelTitre', 'Titre de l’invitation', 'Le titre du bloc foncé sous le résultat.', { group: 'contenu' }),
    paragraphe('appelTexte', 'Texte de l’invitation', 'Quand le résultat a au moins un point à corriger (et avant toute analyse).', { group: 'contenu', rows: 2 }),
    paragraphe('appelTexteSansCorrection', 'Texte de l’invitation, aucun point à corriger', 'Quand le résultat n’a aucun point à corriger.', {
      group: 'contenu',
      rows: 2,
    }),
    ligne('appelBouton', 'Bouton de l’invitation', 'Ouvre le calendrier (adresse dans « Infos de l’entreprise ») (ex. : « Réserver 30 minutes »).', {
      group: 'contenu',
    }),

    /* ---------------------------------------------------------------- pendant l'analyse, erreurs */
    ligne('analyseTitre', 'Titre pendant l’analyse', 'Remplace le résultat pendant les 10 à 20 secondes de l’analyse (ex. : « Analyse en cours »).', {
      group: 'analyse',
    }),
    paragraphe('analyseTexte', 'Texte pendant l’analyse', 'La phrase sous le titre.', { group: 'analyse', rows: 2 }),
    phrases('analyseEtapes', 'Ce que fait l’outil', 'Une étape par case, affichées pendant l’analyse. Elles décrivent le travail, sans être cochées une à une.', {
      group: 'analyse',
    }),
    ligne('analyseAnnonce', 'Annonce pour les lecteurs d’écran', 'Lue une seule fois au début de l’analyse (ex. : « Analyse en cours, comptez de 10 à 20 secondes. »).', {
      group: 'analyse',
    }),
    ...(
      [
        ['erreurAdresse', 'Adresse invalide', 'L’adresse ne ressemble pas à celle d’un site web.'],
        ['erreurPrivee', 'Adresse privée ou locale', 'L’adresse mène à un réseau privé ou local.'],
        ['erreurInjoignable', 'Site injoignable', 'Le site ne répond pas, ou le nom de domaine n’existe pas. {domaine} est remplacé par le nom du site.'],
        ['erreurRefusee', 'Visite refusée par le site', 'Le site a bloqué la visite automatique (protection contre les robots).'],
        ['erreurDelai', 'Analyse expirée', 'L’analyse a dépassé 30 secondes.'],
        ['erreurLimite', 'Limite atteinte', 'Trois analyses dans la dernière heure depuis le même appareil.'],
        ['erreurAntiRobot', 'Vérification anti-robot échouée', 'La vérification anti-robot n’a pas abouti.'],
        ['erreurIndisponible', 'Vérificateur indisponible', 'Panne, quota de Cloudflare atteint, trop d’analyses en même temps.'],
      ] as const
    ).map(([name, title, quand]) => paragraphe(name, title, `Message affiché quand : ${quand.charAt(0).toLowerCase()}${quand.slice(1)}`, { group: 'analyse', rows: 2 })),

    /* ---------------------------------------------------------------- le résultat */
    ligne('etatACorriger', 'Nom de l’état « à corriger »', 'L’étiquette sur chaque ligne (ex. : « À corriger »).', { group: 'resultat' }),
    ligne('etatAVerifier', 'Nom de l’état « à vérifier »', 'Ex. : « À vérifier ».', { group: 'resultat' }),
    ligne('etatEnPlace', 'Nom de l’état « en place »', 'Ex. : « En place ».', { group: 'resultat' }),
    ligne(
      'synthese',
      'Phrase de synthèse',
      'La grande phrase en haut du résultat. {domaine} : le site ; {corriger}, {verifier} et {enPlace} : les trois comptes ci-dessous, déjà accordés.',
      { group: 'resultat' },
    ),
    ...(
      [
        ['corrigerAucun', 'Aucun point à corriger', 'aucun point à corriger'],
        ['corrigerUn', 'Un point à corriger', '1 point à corriger'],
        ['corrigerPlusieurs', 'Plusieurs points à corriger', '{n} points à corriger'],
        ['verifierAucun', 'Aucun à vérifier', 'aucun à vérifier'],
        ['verifierPlusieurs', 'Un ou plusieurs à vérifier', '{n} à vérifier'],
        ['enPlaceAucun', 'Aucun en place', 'aucun en place'],
        ['enPlacePlusieurs', 'Un ou plusieurs en place', '{n} en place'],
      ] as const
    ).map(([name, title, exemple]) =>
      ligne(name, `Compte : ${title.toLowerCase()}`, `Remplace son compte dans la phrase de synthèse (ex. : « ${exemple} »). {n} est remplacé par le nombre.`, {
        group: 'resultat',
      }),
    ),
    ligne('avertissementCourt', 'Avertissement court', 'Toujours sous la phrase de synthèse (ex. : « Test automatique, pas un avis juridique. »).', {
      group: 'resultat',
    }),
    paragraphe('phraseCorriger', 'Accompagnement : au moins un point à corriger', 'Sous l’avertissement court.', { group: 'resultat', rows: 2 }),
    paragraphe('phraseVerifier', 'Accompagnement : rien à corriger, au moins un à vérifier', 'Sous l’avertissement court.', { group: 'resultat', rows: 2 }),
    paragraphe('phraseTout', 'Accompagnement : tout est en place', 'Sous l’avertissement court.', { group: 'resultat', rows: 2 }),
    paragraphe('phrasePartielle', 'Accompagnement : tout est à vérifier', 'Quand les huit points sont à vérifier (site très lourd ou protégé).', {
      group: 'resultat',
      rows: 2,
    }),
    paragraphe(
      'phraseRedirection',
      'Redirection vers un autre domaine',
      'Quand l’adresse entrée mène à un autre domaine. {adresse_entree} et {domaine_final} sont remplacés.',
      { group: 'resultat', rows: 2 },
    ),
    paragraphe(
      'politiqueIllisible',
      'Points 4 à 6 quand la politique ne se lit pas',
      'Remplace le texte du responsable, du transfert hors du Québec et des droits quand la politique a été trouvée mais n’a pas pu être lue.',
      { group: 'resultat', rows: 2 },
    ),
    ligne('libellePourquoi', 'Bouton « Pourquoi ça compte »', 'Sous chaque ligne : ouvre l’explication et l’article de loi.', { group: 'resultat' }),
    ligne('libelleTemoins', 'Titre de la liste des témoins', 'Au-dessus des noms des témoins vus (ex. : « Témoins déposés avant tout clic »).', { group: 'resultat' }),
    ligne('libelleDomaines', 'Titre de la liste des domaines', 'Au-dessus des domaines contactés (ex. : « Domaines contactés avant tout clic »).', {
      group: 'resultat',
    }),
    ligne('droitAcces', 'Nom du droit d’accès', 'Remplace {droits_manquants} (ex. : « le droit d’accès »).', { group: 'resultat' }),
    ligne('droitRectification', 'Nom du droit de rectification', 'Ex. : « le droit de rectification ».', { group: 'resultat' }),
    ligne('droitRetrait', 'Nom du retrait du consentement', 'Ex. : « le retrait du consentement ».', { group: 'resultat' }),
    ligne('piedResultat', 'Pied du résultat', '{domaine}, {date} et {heure} sont remplacés (ex. : « Analyse de exemple.ca le 18 novembre 2026 à 14 h 05. »).', {
      group: 'resultat',
    }),
    ligne('boutonRefaire', 'Lien pour vérifier une autre adresse', 'Sous le résultat (ex. : « Vérifier une autre adresse »).', { group: 'resultat' }),

    /* ---------------------------------------------------------------- les 8 vérifications */
    verification('temoins', '1. Témoins de suivi', 'Témoins de mesure ou de publicité déposés, et données envoyées, avant tout clic.', [
      etat('enPlace', 'En place', 'Aucun témoin de suivi, rien envoyé à un outil de mesure ou de publicité.'),
      etat('aCorriger', 'À corriger', 'Un témoin de suivi est déposé sans clic. {temoins} : les témoins ; {services} : les outils.'),
      etat('aVerifier', 'À vérifier', 'Aucun témoin, mais des envois vers un outil de mesure. {services} : les outils.', 4),
    ]),
    verification('banniere', '2. Bannière de consentement', 'La bannière, et un bouton pour refuser au premier écran.', [
      etat('enPlace', 'En place', 'Une bannière avec un bouton de refus au premier écran. {outil} : l’outil reconnu ; {libelle_refus} : le texte du bouton.'),
      etat('ajoutSansBlocage', 'Ajout quand la bannière ne bloque rien', 'Ajouté au texte « En place » quand des témoins de suivi sont déposés malgré la bannière.', 2),
      etat('enPlaceSansTraceur', 'En place, sans traceur', 'Aucune bannière, et aucun témoin de suivi à faire accepter.'),
      etat('aCorrigerSansRefus', 'À corriger, bannière sans refus', 'Une bannière sans bouton de refus au premier écran. {outil} : l’outil reconnu.'),
      etat('aCorrigerAbsente', 'À corriger, aucune bannière', 'Des outils de suivi, et aucune bannière.'),
      etat('aVerifier', 'À vérifier', 'Ce qui ressemble à une bannière, sans outil reconnu ni bouton de refus.'),
    ]),
    verification('politique', '3. Politique de confidentialité', 'Un lien vers la politique sur la page d’accueil, et la page qui s’ouvre.', [
      etat('enPlace', 'En place', 'Le lien est trouvé et la page s’ouvre. {libelle_lien} : le texte du lien.'),
      etat('aCorrigerAbsente', 'À corriger, aucun lien', 'Aucun lien vers une politique sur l’accueil.'),
      etat('aCorrigerLienBrise', 'À corriger, lien brisé', 'Le lien mène à une page en erreur. {libelle_lien} : le texte du lien ; {code} : le code d’erreur.'),
      etat('aVerifier', 'À vérifier', 'Le lien est trouvé, mais la page ne se lit pas (PDF, page trop lente).'),
    ]),
    ...(
      [
        ['responsable', '4. Responsable de la protection', 'Le titre du responsable et un moyen de le joindre, dans la politique.'],
        ['transfert', '5. Hors du Québec', 'La mention que des renseignements peuvent être traités hors du Québec.'],
        ['droits', '6. Droits des personnes', 'Les droits d’accès, de rectification et de retrait du consentement.'],
      ] as const
    ).map(([name, title, description]) =>
      verification(name, title, description, [
        etat('enPlace', 'En place', 'La politique contient ce qu’on cherche.'),
        etat('aCorriger', 'À corriger', 'La politique a été lue et ne le contient pas.'),
        etat('aCorrigerSansPolitique', 'À corriger, sans politique', 'Aucune politique trouvée, ou son lien est brisé.'),
        etat(
          'aVerifier',
          'À vérifier',
          name === 'droits' ? 'Une partie seulement des droits. {droits_manquants} : les droits non trouvés.' : 'Un signal partiel, à vérifier par la personne.',
        ),
      ]),
    ),
    verification('tiers', '7. Services externes', 'Polices Google, YouTube, Vimeo, Google Maps, réseaux sociaux chargés dès l’arrivée.', [
      etat('enPlace', 'En place', 'Aucun des services surveillés chargé avant un clic.'),
      etat('aCorriger', 'À corriger', 'Des services chargés dès l’arrivée, que la politique ne nomme pas. {services} : ces services.'),
      etat('aVerifier', 'À vérifier', 'Des services chargés dès l’arrivée, que la politique semble nommer. {services} : ces services.'),
    ]),
    verification('https', '8. HTTPS', 'Le site répond en https, et l’adresse en http y mène.', [
      etat('enPlace', 'En place', 'HTTPS, et l’adresse en http:// y redirige.'),
      etat('aCorrigerSansHttps', 'À corriger, pas de HTTPS', 'Le site ne répond pas en HTTPS, ou son certificat est invalide.'),
      etat('aCorrigerSansRedirection', 'À corriger, pas de redirection', 'L’adresse en http:// reste accessible sans passer en https://.'),
      etat('aVerifier', 'À vérifier', 'HTTPS, mais la redirection depuis http:// n’a pas pu être confirmée.'),
    ]),

    /* ---------------------------------------------------------------- ailleurs sur le site */
    defineField({
      name: 'blocSitesWeb',
      title: 'Bloc dans la page Sites web',
      type: 'object',
      group: 'ailleurs',
      description: 'Le bloc qui annonce l’outil dans la page Sites web, avant les autres pages.',
      options: { collapsible: true, collapsed: false },
      fields: [
        afficher(),
        ligne('titre', 'Titre', 'Le titre du bloc.'),
        paragraphe('texte', 'Texte', 'Une ou deux phrases.', { rows: 3 }),
        ligne('bouton', 'Texte du bouton', 'Le bouton qui ouvre le vérificateur (ex. : « Lancer le vérificateur »).'),
      ],
    }),
    ligne('lienPied', 'Lien du pied de page', 'Le lien vers le vérificateur, en bas de chaque page, à côté de la politique (ex. : « Vérificateur Loi 25 »).', {
      group: 'ailleurs',
    }),

    ...champsGoogle(),
  ],
  preview: { prepare: () => ({ title: 'Vérificateur Loi 25' }) },
})

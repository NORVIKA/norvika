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
 * Groupe « Rapport par courriel » (2026-11-23) : textes provisoires de Mattew, définitifs par Martin
 * (contenu/verificateur-courriel-textes.md), semés par scripts/verificateur-courriel-semer.ts.
 * Mention par couches (2026-11-23) : phrase visible et libellé du repli (mentionResume,
 * mentionRepliLibelle, rapportCourriel.mentionResume), semés par scripts/verificateur-mention-semer.ts.
 * « Ce que ça peut coûter » (2026-11-24, demande de William) : groupe `sanctions`, textes et sources
 * de Martin (contenu/verificateur-loi25-textes.md, § « Montants des sanctions »), semés par
 * scripts/verificateur-sanctions-semer.ts. Affiché seulement si au moins un point est à corriger.
 */
import { defineField, defineType, type FieldDefinition } from 'sanity'

import { afficher, champsGoogle, GROUPES_PAGE, grandTitre, ligne, paragraphe, paragraphes, phrases } from './champs'

const AIDE_TITRE =
  'En quelques mots, ce que l’outil a vu, sans juger : « Aucun bouton pour refuser », pas « Vous n’êtes pas en règle ». Sert de titre à ce point dans le rapport par courriel, et de première ligne sur la page. Vide : le nom de la vérification sert de titre.'

const AIDE_VARIABLES =
  'Les mots entre accolades sont remplacés par ce que l’outil a vu (ex. : {services} devient « Google Analytics, Meta »). Gardez-les tels quels.'

/** Un texte affiché selon le résultat d'une vérification. */
const etat = (name: string, title: string, quand: string, rows = 3) =>
  paragraphe(name, title, `${quand} ${AIDE_VARIABLES}`, { rows })

/**
 * Les cas qui N'ONT PAS de titre court à eux : ce sont des phrases ajoutées à la fin d'un autre cas
 * (« enPlace+ajoutSansBlocage » dans lib/verificateur/analyse.ts), pas un constat autonome. Le titre
 * affiché est alors celui du cas de tête.
 */
const CAS_SANS_TITRE = ['ajoutSansBlocage']

/**
 * Le titre court d'un cas (2026-11-26) : la phrase qui dit, en quelques mots, ce que l'outil a vu.
 * Le courriel du rapport s'en sert comme titre de chaque point. Le nom de la vérification ne peut
 * pas jouer ce rôle : il dit ce qui est VÉRIFIÉ, pas ce qui a été TROUVÉ. Un site sans bouton de
 * refus recevait un point intitulé « Bannière avec un vrai choix de refuser », qui se lit comme une
 * bonne nouvelle. Sur la page, le nom reste le titre de la ligne (les huit points s'affichent avant
 * l'analyse) et le titre court vient en tête du texte du résultat.
 * JAMAIS de {variable} : le titre paraît dans le courriel, où aucun texte pris sur le site analysé
 * ne sort (règle de lib/verificateur/courriel.ts).
 * Facultatif : tant qu'il est vide, le nom de la vérification sert de titre, comme avant.
 */
function titreConstat(champ: FieldDefinition) {
  return defineField({
    ...ligne(`${champ.name}Titre`, `${String(champ.title)} : titre court`, AIDE_TITRE, { requis: false }),
    validation: (r) =>
      r.custom((valeur) => {
        const texte = String(valeur ?? '')
        if (/\{\w+\}/.test(texte)) return 'Pas de {variable} dans un titre court : elles restent dans le texte en dessous.'
        if (texte.length > 60) return 'Titre trop long : 60 caractères au plus, pour qu\u2019il tienne sur une ligne dans le courriel.'
        return true
      }),
  })
}

/** Une des huit vérifications : son nom, pourquoi elle compte, l'article, et un titre + un texte par cas. */
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
      // Chaque cas arrive avec son titre court juste au-dessus de son texte.
      ...textes.flatMap((champ) => (CAS_SANS_TITRE.includes(String(champ.name)) ? [champ] : [titreConstat(champ), champ])),
    ],
  })
}

const GROUPES = [
  GROUPES_PAGE[0],
  { name: 'analyse', title: 'Analyse et erreurs' },
  { name: 'resultat', title: 'Résultat' },
  { name: 'verifications', title: 'Les 8 vérifications' },
  { name: 'courriel', title: 'Rapport par courriel' },
  { name: 'ailleurs', title: 'Sites web et pied de page' },
  GROUPES_PAGE[1],
]

/**
 * Un texte du rapport par courriel : obligatoire seulement quand l'envoi est activé (une case vide
 * ne bloque pas la publication tant que l'interrupteur est éteint). `variable` : une {variable} que
 * le texte doit garder (ex. {adresse_postale}, sans laquelle la demande de consentement serait illégale).
 */
/**
 * Les deux textes du bloc « après résultat » (2026-11-26). Comme texteCourriel(), mais exigés par
 * l'interrupteur `apresResultat` et non par `afficher` : tant que le bloc n'est pas allumé, les
 * laisser vides n'est pas une erreur, et le formulaire garde son champ de courriel.
 */
function texteApres(name: string, title: string, description: string) {
  return defineField({
    ...ligne(name, title, description, { requis: false }),
    validation: (r) =>
      r.custom((valeur, contexte) => {
        const texte = String(valeur ?? '').trim()
        if ((contexte.parent as { apresResultat?: boolean } | undefined)?.apresResultat && !texte)
          return 'Ce texte paraît sous le résultat quand la demande différée est cochée : il ne peut pas être vide.'
        return true
      }),
  })
}

function texteCourriel(name: string, title: string, description: string, o: { rows?: number; variable?: string } = {}) {
  const base = o.rows
    ? paragraphe(name, title, description, { requis: false, rows: o.rows })
    : ligne(name, title, description, { requis: false })
  return defineField({
    ...base,
    validation: (r) =>
      r.custom((valeur, contexte) => {
        const texte = String(valeur ?? '').trim()
        if ((contexte.parent as { afficher?: boolean } | undefined)?.afficher && !texte)
          return 'Ce texte s’affiche quand l’envoi par courriel est activé : il ne peut pas être vide.'
        if (texte && o.variable && !texte.includes(`{${o.variable}}`)) return `Gardez {${o.variable}} tel quel dans ce texte.`
        return true
      }),
  })
}

/** Obligatoire seulement quand le bloc est allumé : une case vide ne bloque rien tant qu'il est éteint. */
const siAffiche = (message: string) => (valeur: unknown, contexte: { parent?: unknown }) => {
  const allume = (contexte.parent as { afficher?: boolean } | undefined)?.afficher
  const vide = Array.isArray(valeur) ? valeur.every((x) => !String(x ?? '').trim()) : !String(valeur ?? '').trim()
  return allume && vide ? message : true
}

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
      'mentionResume',
      'Phrase visible sous le bouton',
      'Toujours affichée sous le bouton (Loi 25, art. 8) : ce que Norvika reçoit, à quoi ça sert, et que nos fournisseurs peuvent traiter ces renseignements hors du Québec. Les mentions complètes sont dans le repli juste en dessous. Quand l’envoi par courriel est offert, c’est la phrase du groupe « Rapport par courriel » qui s’affiche à la place. Vide : pas de repli, les mentions complètes restent affichées en entier. Texte de Martin : un changement de fond repasse par lui.',
      { group: 'contenu', requis: false, rows: 3 },
    ),
    ligne(
      'mentionRepliLibelle',
      'Libellé du repli des mentions',
      'Le texte cliquable sous la phrase visible, qui ouvre les mentions complètes (ex. : « Détails, durées et vos droits »). Il fait le renvoi aux droits que la loi veut au premier coup d’œil : gardez « vos droits ». Le repli est fermé à l’arrivée, mais son texte reste dans la page (Google, lecteurs d’écran). Vide : les mentions complètes restent affichées en entier.',
      { group: 'contenu', requis: false },
    ),
    paragraphe(
      'mentionCollecte',
      'Mention de collecte sous le champ',
      'Texte légal (Loi 25, art. 8) rédigé par Martin, dans le repli sous la phrase visible (affiché en entier s’il n’y a pas de repli). Ne pas le raccourcir sans lui : il décrit ce que l’outil recueille vraiment.',
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
        ['erreurVide', 'Champ vide', 'La personne a lancé la vérification sans inscrire d’adresse.'],
        ['erreurAdresse', 'Adresse invalide', 'L’adresse ne ressemble pas à celle d’un site web.'],
        ['erreurPrivee', 'Adresse privée ou locale', 'L’adresse mène à un réseau privé ou local.'],
        ['erreurInjoignable', 'Site injoignable', 'Le site ne répond pas, ou le nom de domaine n’existe pas. {domaine} est remplacé par le nom du site.'],
        ['erreurRefusee', 'Visite refusée par le site', 'Le site a bloqué la visite automatique (protection contre les robots).'],
        ['erreurDelai', 'Analyse expirée', 'L’analyse a dépassé 30 secondes.'],
        ['erreurLimite', 'Limite atteinte', 'Trois analyses dans la dernière heure depuis le même appareil.'],
        ['erreurAntiRobot', 'Vérification anti-robot refusée', 'Notre serveur a refusé la vérification anti-robot (jeton expiré, déjà utilisé ou rejeté par Cloudflare).'],
        [
          'erreurAntiRobotAbsent',
          'Vérification anti-robot pas prête',
          'Le navigateur n’a pas reçu son jeton anti-robot après 15 secondes d’attente, ou le script de Cloudflare a été bloqué (bloqueur de publicité, réseau d’entreprise). Rien n’a été envoyé au serveur. Un message distinct de « refusée » : c’est ce qui permet de savoir lequel des deux arrive.',
        ],
        ['erreurIndisponible', 'Vérificateur indisponible', 'Panne, quota de Cloudflare atteint, trop d’analyses en même temps.'],
        [
          'erreurIncompatible',
          'Analyse impossible pour ce site',
          'Le site emploie des moyens que l’outil ne peut pas surveiller en sécurité : l’analyse est arrêtée, sans résultat. Ce n’est pas une panne, réessayer ne changera rien.',
        ],
        [
          'erreurSansHttps',
          'Site sans HTTPS',
          'Le site ne répond pas en HTTPS, ou son certificat est expiré ou invalide. Notre outil s’arrête à l’avertissement de sécurité de Chrome : rien ne peut être analysé. {domaine} est remplacé par le nom du site.',
        ],
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
    defineField({
      name: 'sanctions',
      title: 'Ce que ça peut coûter',
      type: 'object',
      group: 'resultat',
      description:
        'Un encadré sous les huit lignes, juste avant l’invitation, et dans le rapport par courriel : les montants prévus par la loi. Il ne paraît QUE si au moins un point est à corriger. Textes et sources de Martin (contenu/verificateur-loi25-textes.md) : un montant ou un article ne change jamais sans lui.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'afficher',
          title: 'Afficher l’encadré',
          type: 'boolean',
          initialValue: false,
          description: 'Décochez pour retirer l’encadré de la page et du courriel, sans perdre ces textes. Le changement paraît en ligne après la reconstruction du site (quelques minutes).',
        }),
        defineField({
          ...ligne('titre', 'Titre de l’encadré', 'Ex. : « Ce que la loi prévoit comme sanctions ».', { requis: false }),
          validation: (r) => r.custom(siAffiche('L’encadré est affiché : il lui faut un titre.')),
        }),
        defineField({
          ...phrases('montants', 'Les montants', 'Une ligne par sanction. Les montants (15 000$, 2%) passent en gras tout seuls ; écrivez-les sans espace avant $ et %.'),
          validation: (r) => r.custom(siAffiche('L’encadré est affiché : ajoutez au moins une ligne.')),
        }),
        paragraphes('notes', 'Sous la liste', 'Ce que ces montants veulent dire, et quoi faire. Un paragraphe par case.', { requis: false }),
        ligne('source', 'Source', 'Les articles de loi, en petit (ex. : « Loi sur le privé, art. 90.12, 91 et 93.1 »).', { requis: false }),
        paragraphe(
          'resume',
          'Phrase visible sous la liste',
          'Sur la page seulement : affichée sous les montants, et « Sous la liste » et « Source » passent dans un repli fermé. Elle doit garder la mise en garde (« pas une estimation pour votre site »). Vide : pas de repli, tout reste affiché. Le courriel affiche toujours tout.',
          { requis: false, rows: 2 },
        ),
        ligne('repliLibelle', 'Libellé du repli', 'Le texte cliquable qui ouvre « Sous la liste » et « Source » (ex. : « Détails et sources »). Vide : pas de repli.', {
          requis: false,
        }),
      ],
    }),

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

    /* ---------------------------------------------------------------- rapport par courriel */
    defineField({
      name: 'rapportCourriel',
      title: 'Rapport par courriel',
      type: 'object',
      group: 'courriel',
      description:
        'Un champ facultatif sous l’adresse du site : la personne peut recevoir son rapport par courriel et, si la case est en ligne, accepter que Norvika lui écrive ensuite. Le résultat s’affiche à l’écran dans tous les cas. Textes de Martin (contenu/verificateur-courriel-textes.md) : un changement de fond repasse par lui.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'afficher',
          title: 'Offrir l’envoi du rapport par courriel',
          type: 'boolean',
          initialValue: false,
          description:
            'Décochez pour retirer le champ de courriel (et la case) : le formulaire redevient une seule case d’adresse, sans perdre ces textes. La politique de confidentialité suit toute seule. Le changement paraît en ligne après la reconstruction du site (quelques minutes).',
        }),
        defineField({
          name: 'afficherCase',
          title: 'Afficher la case « Norvika peut m’écrire »',
          type: 'boolean',
          initialValue: false,
          description:
            'La case de consentement, sous le champ de courriel. Elle ne paraît JAMAIS tant que l’adresse postale est vide dans « Infos de l’entreprise », même cochée ici : la loi exige l’adresse postale dans la demande elle-même. La politique de confidentialité suit toute seule.',
        }),
        defineField({
          name: 'apresResultat',
          title: 'Demander le courriel APRÈS le résultat',
          type: 'boolean',
          initialValue: false,
          description:
            'Décoché : le champ de courriel est dans le formulaire, avant l’analyse. Coché : il en sort et reparaît sous le résultat, une fois que la personne a vu ses signaux. Le formulaire ne demande alors plus que l’adresse du site. Ne fait rien tant que les deux textes ci-dessous sont vides.',
        }),
        texteApres('apresTitre', 'Titre du bloc sous le résultat', 'La phrase qui invite à recevoir le rapport (ex. : « Recevez ce rapport par courriel »). Vide : le bloc ne paraît pas, même si l’interrupteur est coché.'),
        texteApres('apresBouton', 'Bouton du bloc sous le résultat', 'Le texte du bouton d’envoi (ex. : « Envoyer mon rapport »). Vide : le bloc ne paraît pas, même si l’interrupteur est coché.'),
        /* Le schéma de la page d'accueil dans le courriel (maquette A, construit le 2026-11-27).
           Un DESSIN générique, jamais une capture ni un texte du site analysé : le courriel ne sort
           aucun texte libre du site visité. Le cadre ne montre que ce qui a été relevé, et il ne
           paraît pas du tout si aucun point repérable sur la page d'accueil n'est à signaler. */
        ligne(
          'schemaLibelle',
          'Schéma : titre du cadre',
          'Le petit titre gris au-dessus du dessin de la page d’accueil, dans le courriel (ex. : « Schéma de votre page d’accueil »). Vide : aucun schéma n’est dessiné, le courriel garde seulement la liste.',
          { requis: false },
        ),
        ligne(
          'schemaBanniere',
          'Schéma : texte de la bannière dessinée',
          'Le texte de la fausse bannière de témoins, en bas du dessin (ex. : « Ce site utilise des témoins. »). Générique : jamais le vrai texte du site analysé. La bannière n’est dessinée que si le site en a vraiment une.',
          { requis: false },
        ),
        ligne(
          'schemaBanniereBouton',
          'Schéma : bouton de la bannière dessinée',
          'Le bouton de la fausse bannière (ex. : « Accepter »). Vide : la bannière est dessinée sans bouton.',
          { requis: false },
        ),
        texteCourriel('champLibelle', 'Étiquette du champ de courriel', 'Au-dessus du champ (ex. : « Votre courriel (facultatif) »). Le mot « facultatif » doit rester : le courriel ne peut pas être exigé.'),
        texteCourriel('champExemple', 'Exemple dans le champ', 'Le texte pâle dans le champ vide (ex. : « vous@exemple.ca »).'),
        texteCourriel('champAide', 'Aide sous le champ', 'Sous le champ de courriel : à quoi il sert, et que le résultat s’affiche quand même.', { rows: 2 }),
        texteCourriel(
          'caseTexte',
          'Texte de la case de consentement',
          'Le libellé de la case, jamais cochée d’avance ; elle paraît dès qu’une adresse courriel est inscrite. Ce texte exact est recopié dans le courriel que Norvika reçoit : c’est la preuve du consentement. Le changer change ce que la personne accepte.',
          { rows: 3 },
        ),
        texteCourriel(
          'caseIdentification',
          'Texte sous la case',
          'Fait partie de la demande de consentement : qui la fait, son adresse postale et comment retirer son consentement. {adresse_postale} est remplacé par l’adresse de « Infos de l’entreprise ».',
          { rows: 4, variable: 'adresse_postale' },
        ),
        texteCourriel(
          'mention',
          'Mention de collecte du courriel (case en ligne)',
          'Dans le repli sous la phrase visible, après la mention de l’adresse du site (Loi 25, art. 8), quand la case est en ligne. Les mots « politique de confidentialité » deviennent un lien.',
          { rows: 8 },
        ),
        texteCourriel(
          'mentionSansCase',
          'Mention de collecte du courriel (sans la case)',
          'La même mention, sans les phrases sur la case, tant que la case n’est pas en ligne.',
          { rows: 6 },
        ),
        paragraphe(
          'mentionResume',
          'Phrase visible sous le bouton (avec le courriel)',
          'Remplace la « Phrase visible sous le bouton » de l’onglet Contenu quand l’envoi par courriel est offert : la même phrase, avec ce que devient le courriel (facultatif, sert à envoyer le rapport). Les deux mentions de courriel ci-dessus vont dans le repli. Vide alors que l’envoi est offert : pas de repli, toutes les mentions restent affichées en entier. Texte de Martin : un changement de fond repasse par lui.',
          { requis: false, rows: 3 },
        ),
        texteCourriel('erreurCourriel', 'Message : courriel invalide', 'Sous le champ, quand l’adresse courriel n’a pas une forme valide. L’analyse n’est pas lancée.', { rows: 2 }),
        texteCourriel('envoiReussi', 'Message : rapport envoyé', 'Sous le résultat. {courriel} est remplacé par l’adresse.', { rows: 2 }),
        texteCourriel(
          'envoiEchec',
          'Message : envoi impossible',
          'Sous le résultat, quand le courriel n’a pas pu partir, quelle qu’en soit la raison (adresse qui ne reçoit pas de courriel, limite du jour, panne) : un seul message, qui ne dit jamais laquelle. Le résultat reste affiché.',
          { rows: 3 },
        ),
        texteCourriel('envoiEchecCase', 'Ajout à l’envoi impossible, case cochée', 'Ajouté au message précédent quand la case était cochée : sans rapport parti, la case ne compte pas.', { rows: 2 }),
        texteCourriel('sansResultat', 'Ajout quand l’analyse n’a pas de résultat', 'Ajouté au message d’erreur (site injoignable, délai…) quand un courriel était entré.', { rows: 2 }),
        texteCourriel('objet', 'Objet du courriel', '{domaine} est remplacé par le site analysé (ex. : « Votre rapport Loi 25 pour {domaine} »).'),
        texteCourriel(
          'preEntete',
          'Texte d’aperçu du courriel',
          'La ligne grise que la boîte de réception montre après l’objet. {corriger}, {verifier} et {enPlace} : les comptes de la phrase de synthèse, déjà accordés.',
          { rows: 2 },
        ),
        texteCourriel('signatureNom', 'Signature : nom', 'En bas du courriel, à côté de la photo (ex. : « Will et Lau, Norvika »). Sert aussi de texte de remplacement de la photo.'),
        texteCourriel('signatureLigne', 'Signature : ligne sous le nom', 'Ex. : « Une question? Répondez à ce courriel, on le lit. »'),
        texteCourriel(
          'invisibleCourriel',
          'Ce que le test ne voit pas (courriel)',
          'Sous les huit points, après le titre « Ce que ce test ne peut pas voir » de la page. Version courte du courriel.',
          { rows: 4 },
        ),
        texteCourriel('paragrapheSansCase', 'Pourquoi ce courriel (case non cochée)', 'Avant le pied du courriel, quand la case n’a pas été cochée.', { rows: 4 }),
        texteCourriel(
          'paragrapheAvecCase',
          'Pourquoi ce courriel (case cochée)',
          'Avant le pied du courriel, quand la case a été cochée : il tient lieu de confirmation (« si ce n’est pas vous, répondez désabonnement »).',
          { rows: 5 },
        ),
        texteCourriel('libellePolitique', 'Libellé du lien vers la politique', 'Au pied du courriel, devant l’adresse de la politique (ex. : « Politique de confidentialité »).'),
      ],
    }),

    /* ---------------------------------------------------------------- ailleurs sur le site */
    defineField({
      name: 'blocSitesWeb',
      title: 'Bloc d’annonce (Sites web et accueil)',
      type: 'object',
      group: 'ailleurs',
      description: 'Le bloc qui annonce l’outil. Le même texte paraît dans la page Sites web (avant les autres pages) et sur l’accueil (après les services).',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          ...afficher('Décochez pour retirer le bloc de la page Sites web sans perdre son texte.'),
          title: 'Afficher dans la page Sites web',
        }),
        defineField({
          name: 'afficherAccueil',
          title: 'Afficher sur l’accueil',
          type: 'boolean',
          initialValue: true,
          description: 'Décochez pour retirer le bloc de l’accueil sans perdre son texte.',
        }),
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

/**
 * 2026-11-18 : crée le document « Vérificateur Loi 25 » (pageVerificateurLoi25) avec les textes de
 * Martin (contenu/verificateur-loi25-textes.md, STATUT : prêt). UNE transaction, et seulement si le
 * document n'existe pas encore (createIfNotExists) : une correction faite dans le Studio n'est
 * jamais écrasée.
 *
 *   cd studio && npx sanity exec scripts/verificateur-semer.ts --with-user-token -- --essai
 *   cd studio && npx sanity exec scripts/verificateur-semer.ts --with-user-token
 *
 * ⚠️ Chaque écriture dans « production » relance la publication du site (webhook). Le code en
 *    production ne lit PAS ce type de document (ni page, ni sitemap, ni menu, ni plan du site, ni
 *    llms.txt) : rien ne change à l'écran avant la mise en ligne du vérificateur.
 * ⚠️ Projet de NORVIKA. Le script s'arrête si la configuration vise un autre projet.
 * Textes marqués « Mattew » ci-dessous : absents du fichier de Martin (libellés d'interface), à
 * faire relire par lui.
 */
import { getCliClient } from 'sanity/cli'

import { verifierTexte } from '../schemas/regles'

const ID_PROJET = 'k99pdqd1'
const ID_DOC = 'pageVerificateurLoi25'
const essai = process.argv.includes('--essai')

const client = getCliClient({ apiVersion: '2025-02-19' })
if (client.config().projectId !== ID_PROJET || client.config().dataset !== 'production') {
  console.error(`⛔ La configuration vise ${client.config().projectId}/${client.config().dataset}, pas ${ID_PROJET}/production. Rien n'est écrit.`)
  process.exit(1)
}

const doc = {
  _id: ID_DOC,
  _type: ID_DOC,

  /* La page (Martin, section 1) */
  nom: 'Vérificateur Loi 25',
  h1: 'Vérificateur Loi 25 pour votre site web',
  intro:
    "Entrez l'adresse de votre site. Notre outil le visite comme le ferait un nouveau visiteur, sans cliquer sur rien, puis lit votre politique de confidentialité et relève 8 signaux que la Loi 25 rend visibles de l'extérieur. Le résultat s'affiche en 20 secondes environ, sans vous demander de courriel.",
  // introRisque : phrase facultative de Martin, laissée vide (décision de William).
  champLibelle: 'Adresse de votre site',
  champExemple: 'exemple.ca',
  bouton: 'Lancer la vérification',
  // Corrigée le 2026-11-19 (Martin, correction n° 1) : voir scripts/verificateur-corrections-2026-11-19.ts.
  mentionCollecte:
    "Quand vous lancez une vérification, Norvika reçoit l'adresse entrée et l'adresse IP de votre appareil. L'adresse sert seulement à faire l'analyse et n'est enregistrée dans aucune de nos bases de données. Cloudflare, qui fait l'analyse, garde toutefois la liste des adresses visitées dans notre tableau de bord, pour une durée qu'il ne précise pas. Votre adresse IP sert à limiter le nombre d'analyses : nous en gardons une forme brouillée au plus 24 heures, chez Supabase. Comme pour toute visite du site, elle reste aussi jusqu'à 7 jours dans les journaux techniques de Cloudflare, qui fait la vérification anti-robot. Ces fournisseurs peuvent traiter ces renseignements hors du Québec. Pour consulter ou faire corriger vos renseignements, ou retirer votre consentement : info@norvika.ca. Détails dans notre politique de confidentialité.",
  mentionLien: 'politique de confidentialité',
  listeTitre: 'Les 8 points vérifiés', // Mattew
  invisibleTitre: 'Ce que ce test ne peut pas voir',
  invisibleTexte: 'La Loi 25 demande aussi des documents et des pratiques internes. Aucun test automatique ne peut les constater de l’extérieur :',
  invisibleListe: [
    'Votre évaluation des facteurs relatifs à la vie privée (EFVP), exigée avant de communiquer des renseignements hors du Québec et pour tout projet de système informatique ou de service en ligne qui en recueille (art. 3.3 et 17).',
    'Votre registre des incidents de confidentialité, où chaque incident doit être consigné (art. 3.8).',
    'Vos politiques et pratiques de gouvernance : conservation et destruction des renseignements, rôles du personnel, traitement des plaintes. Un résumé doit en être publié sur votre site, mais ce test ne l’évalue pas (art. 3.2).',
    'La façon dont votre personnel connaît ses responsabilités envers les renseignements qu’il manipule.',
    'Ce qui se passe après un clic sur « Refuser » ou « Accepter » : le test ne clique jamais. Faites l’essai vous-même en navigation privée.',
    'Vos autres pages et vos formulaires, dont la mention de collecte qui doit accompagner chaque formulaire (art. 8).',
  ],
  avertissement: [
    "Ce test est automatique. Il relève des signaux visibles de l'extérieur, sur votre page d'accueil et dans votre politique de confidentialité, au moment de l'analyse. Il ne juge pas si votre entreprise respecte la Loi 25 : un résultat sans point à corriger est un bon signe, pas une attestation. Ce n'est pas un avis juridique ; pour une question sur votre situation, consultez un avocat.",
    "Certains outils de bannière changent leur affichage selon le pays du visiteur. Notre visite, faite depuis le réseau de Cloudflare, peut donc ne pas voir exactement ce que voit un visiteur du Québec.",
    'Les articles cités sont ceux de la Loi sur la protection des renseignements personnels dans le secteur privé, modifiée par la Loi 25.',
  ],
  appelTitre: 'Passer du résultat aux corrections',
  appelTexte: 'En 30 minutes, on regarde votre résultat avec vous, on vous dit quoi corriger en premier et ce que ça demande.',
  appelTexteSansCorrection: 'Aucun point à corriger ici. Il reste les documents que ce test ne voit pas : en 30 minutes, on en fait le tour avec vous.',
  appelBouton: 'Réserver 30 minutes',

  /* Pendant l'analyse, erreurs (Martin, sections 1 et 3) */
  analyseTitre: 'Analyse en cours',
  analyseTexte: 'Nous visitons votre site comme un nouveau visiteur, sans cliquer sur rien. Comptez de 10 à 20 secondes.',
  analyseEtapes: [
    "Ouverture de votre page d'accueil",
    'Relevé des témoins déposés avant tout clic',
    'Recherche de la bannière de consentement',
    'Lecture de votre politique de confidentialité',
    'Préparation du résultat',
  ],
  analyseAnnonce: 'Analyse en cours, comptez de 10 à 20 secondes.',
  erreurVide: "Inscrivez l'adresse de votre site, par exemple votreentreprise.ca.", // Pixel et Mattew, 2026-11-19
  erreurAdresse: 'Cette adresse ne ressemble pas à une adresse de site web. Entrez-la sous la forme exemple.ca ou https://www.exemple.ca.',
  erreurPrivee: 'Nous analysons seulement les sites publics. Cette adresse mène à un réseau privé ou local.',
  erreurInjoignable: "Nous n'avons pas pu joindre {domaine}. Vérifiez l'adresse (avec ou sans www) et que le site est en ligne, puis réessayez.",
  erreurRefusee:
    "Votre site a refusé notre visite automatique, sans doute par sa protection contre les robots. Ce n'est pas un défaut au sens de la Loi 25. Pour le faire vérifier quand même, réservez 30 minutes : on le regardera avec vous.",
  erreurDelai: "L'analyse a dépassé 30 secondes et a été arrêtée. Votre site est peut-être lent ou très chargé. Réessayez dans quelques minutes.",
  erreurLimite: 'Vous avez lancé 3 vérifications dans la dernière heure. Réessayez un peu plus tard.',
  erreurAntiRobot: "La vérification anti-robot n'a pas abouti. Rechargez la page et réessayez.",
  erreurIndisponible: 'Le vérificateur est indisponible pour le moment. Réessayez plus tard, ou écrivez-nous à info@norvika.ca.',
  erreurIncompatible: 'Notre outil ne peut pas analyser ce site automatiquement en toute sécurité. Plutôt que de vous donner un résultat incomplet, nous préférons ne rien conclure. Écrivez-nous à info@norvika.ca : nous le vérifierons nous-mêmes.', // Mattew, 2026-11-19, à faire relire par Martin

  /* Le résultat (Martin, section 3 ; libellés d'état et de preuve : Mattew) */
  etatACorriger: 'À corriger',
  etatAVerifier: 'À vérifier',
  etatEnPlace: 'En place',
  synthese: '{domaine} : {corriger}, {verifier}, {enPlace}.',
  corrigerAucun: 'aucun point à corriger',
  corrigerUn: '1 point à corriger',
  corrigerPlusieurs: '{n} points à corriger',
  verifierAucun: 'aucun à vérifier',
  verifierPlusieurs: '{n} à vérifier',
  enPlaceAucun: 'aucun en place',
  enPlacePlusieurs: '{n} en place',
  avertissementCourt: 'Test automatique, pas un avis juridique.',
  phraseCorriger: 'Commencez par les points à corriger : ce sont des signaux que la Loi 25 rend visibles, et ils manquent sur votre site.',
  phraseVerifier: "Aucun point à corriger parmi ce que nous pouvons voir. Les points à vérifier demandent un coup d'œil de votre part.",
  phraseTout:
    "Les 8 signaux que nous vérifions sont en place. C'est un bon départ, pas une attestation : la loi demande aussi des documents qu'aucun test automatique ne peut voir.",
  phrasePartielle:
    'Nous avons pu ouvrir votre site, sans en lire assez pour trancher. Ça arrive avec les sites très lourds en JavaScript ou protégés contre les robots. Les points ci-dessous sont à vérifier à la main.',
  phraseRedirection: '{adresse_entree} mène à {domaine_final}. Le résultat porte sur {domaine_final}.',
  politiqueIllisible: "Nous n'avons pas pu lire votre politique de confidentialité : ce point est à vérifier vous-même.", // Mattew
  libellePourquoi: 'Pourquoi ça compte',
  libelleTemoins: 'Témoins déposés avant tout clic', // Mattew
  libelleDomaines: 'Domaines contactés avant tout clic', // Mattew
  droitAcces: "le droit d'accès",
  droitRectification: 'le droit de rectification',
  droitRetrait: 'le retrait du consentement',
  piedResultat: 'Analyse de {domaine} le {date} à {heure}. Le résultat peut changer si votre site change.',
  boutonRefaire: 'Vérifier une autre adresse', // Mattew

  /* Les 8 vérifications (Martin, section 2) */
  temoins: {
    nom: 'Témoins de suivi avant le consentement',
    pourquoi:
      "Les outils qui suivent ou profilent un visiteur, comme Google Analytics ou le pixel Meta, ne peuvent pas être activés par défaut : c'est le visiteur qui doit les activer. Un témoin déposé dès l'arrivée est le manquement le plus facile à constater de l'extérieur.",
    article: 'Art. 8.1 et 14',
    enPlace:
      "Pendant les 8 secondes de notre visite, sans aucun clic, votre site n'a déposé aucun témoin de suivi que nous reconnaissons et n'a rien envoyé à un outil de mesure ou de publicité connu.",
    aCorriger:
      "Votre site dépose {temoins} ({services}) dès l'arrivée, avant tout clic. Réglez vos outils pour qu'ils se chargent seulement après un clic sur « Accepter » dans votre bannière, puis relancez le test.",
    aVerifier:
      "Aucun témoin de suivi connu, mais votre site envoie déjà des données à {services} avant tout clic. Même sans témoin, ces envois transmettent l'adresse IP et des informations sur l'appareil. Vérifiez la configuration : par exemple, le mode consentement de Google en version « de base » n'envoie rien avant l'accord, la version « avancée », oui.",
  },
  banniere: {
    nom: 'Bannière avec un vrai choix de refuser',
    pourquoi:
      "Un consentement doit être libre. Refuser doit donc être aussi simple qu'accepter : la Commission d'accès à l'information indique que le nombre de clics pour consentir ou refuser devrait être équivalent.",
    article: 'Art. 8.1 et 14 ; lignes directrices 2023-1 de la CAI',
    enPlace: "Une bannière {outil} s'affiche dès l'arrivée, avec un bouton « {libelle_refus} » au même niveau que le bouton pour accepter.",
    ajoutSansBlocage: 'Attention : elle ne bloque pas vos outils de mesure (voir les témoins de suivi plus haut).',
    enPlaceSansTraceur:
      "Aucune bannière, et c'est cohérent : votre site ne dépose aucun témoin de suivi à faire accepter. Si vous ajoutez un jour Google Analytics ou un pixel publicitaire, une bannière deviendra nécessaire.",
    aCorrigerSansRefus:
      "Votre bannière {outil} s'affiche, mais aucun bouton pour refuser n'apparaît au premier écran. Dans les réglages de votre bannière, ajoutez un bouton « Tout refuser » à côté de « Accepter », de même taille et de même apparence.",
    aCorrigerAbsente:
      "Votre site dépose des témoins de suivi, mais aucune bannière de consentement n'apparaît. Installez une bannière (CookieYes, Cookiebot ou l'équivalent) qui bloque vos outils de mesure jusqu'au clic sur « Accepter » et offre « Refuser » au même niveau.",
    aVerifier:
      "Nous avons repéré ce qui ressemble à une bannière, sans pouvoir confirmer l'outil ni la présence d'un bouton pour refuser. Ouvrez votre site en navigation privée et regardez si « Refuser » est offert dès le premier écran.",
  },
  politique: {
    nom: 'Politique de confidentialité accessible',
    pourquoi:
      'Une entreprise qui recueille des renseignements par son site doit y publier une politique de confidentialité en termes simples et clairs. Un lien dans le pied de page la rend accessible depuis chaque page.',
    article: 'Art. 8.2',
    enPlace: "Votre page d'accueil a un lien vers votre politique (« {libelle_lien} »), et la page s'ouvre.",
    aCorrigerAbsente:
      "Nous n'avons trouvé aucun lien vers une politique de confidentialité sur votre page d'accueil. Publiez une page « Politique de confidentialité » et mettez son lien dans le pied de page, pour qu'il apparaisse sur toutes les pages.",
    aCorrigerLienBrise: "Le lien « {libelle_lien} » mène à une page qui ne s'ouvre pas (erreur {code}). Corrigez l'adresse du lien ou republiez la page.",
    aVerifier:
      'Nous avons trouvé un lien vers votre politique, sans pouvoir la lire (document PDF, page trop lente ou contenu chargé autrement). Les trois points qui la lisent (responsable, hors du Québec, droits) sont donc à vérifier vous-même.',
  },
  responsable: {
    nom: 'Responsable de la protection des renseignements',
    pourquoi:
      "La loi exige de publier sur votre site le titre et les coordonnées de la personne responsable de la protection des renseignements personnels. C'est à elle que vos clients s'adressent pour consulter, corriger ou retirer leurs renseignements.",
    article: 'Art. 3.1',
    enPlace: 'Votre politique désigne un responsable de la protection des renseignements personnels et donne un moyen de le joindre.',
    aCorriger:
      "Votre politique ne désigne pas de responsable de la protection des renseignements personnels. Ajoutez son titre et un courriel ou un téléphone pour le joindre. Par défaut, c'est la personne qui a la plus haute autorité dans l'entreprise ; elle peut déléguer ce rôle par écrit.",
    aCorrigerSansPolitique:
      "Sans politique de confidentialité, nous n'avons trouvé aucun responsable désigné. Nommez-le dans la politique à publier : son titre, et un courriel ou un téléphone pour le joindre.",
    aVerifier:
      "Votre politique parle d'un responsable, mais nous n'y avons pas trouvé à la fois son titre et un moyen de le joindre. Vérifiez que les deux y sont, écrits en clair : un courriel masqué par un script ne se lit pas toujours.",
  },
  transfert: {
    nom: 'Renseignements traités hors du Québec',
    pourquoi:
      "Votre hébergeur, votre outil d'infolettre ou Google Analytics traitent souvent les renseignements aux États-Unis ou ailleurs. La loi exige d'en informer les gens au moment de la collecte et d'évaluer chaque communication hors du Québec avant de la faire.",
    article: 'Art. 8 et 17',
    enPlace: "Votre politique dit que des renseignements peuvent être communiqués ou conservés à l'extérieur du Québec. Gardez la liste de vos fournisseurs à jour quand vous en changez.",
    aCorriger:
      'Votre politique ne dit pas que des renseignements peuvent sortir du Québec. Ajoutez la liste de vos fournisseurs (hébergement, courriel, statistiques), le rôle de chacun, et le fait qu’ils peuvent traiter les renseignements hors du Québec.',
    aCorrigerSansPolitique:
      'Sans politique de confidentialité, rien n’informe vos visiteurs que leurs renseignements peuvent sortir du Québec. Prévoyez une section sur vos fournisseurs dans la politique à publier.',
    aVerifier:
      "Votre politique nomme des fournisseurs ou parle d'hébergement, sans dire clairement que les renseignements peuvent être traités hors du Québec. Vérifiez la formulation, et que chaque fournisseur utilisé y figure.",
  },
  droits: {
    nom: 'Droits des personnes expliqués',
    pourquoi:
      'Vos clients peuvent consulter les renseignements que vous détenez sur eux, les faire corriger et retirer leur consentement. Votre politique doit leur dire comment faire et à qui écrire.',
    article: 'Art. 8, 27 et 28',
    enPlace: "Votre politique explique les droits d'accès, de rectification et de retrait du consentement.",
    aCorriger:
      "Votre politique n'explique pas les droits de vos clients. Ajoutez une section « Vos droits » qui nomme l'accès, la rectification et le retrait du consentement, et qui dit à qui écrire pour les exercer.",
    aCorrigerSansPolitique:
      'Sans politique de confidentialité, vos clients ne savent pas comment consulter, corriger ou retirer leurs renseignements. Prévoyez une section « Vos droits » dans la politique à publier.',
    aVerifier:
      "Votre politique mentionne certains droits, mais nous n'y avons pas trouvé : {droits_manquants}. Vérifiez qu'elle explique l'accès, la rectification et le retrait du consentement, et à qui écrire pour les exercer.",
  },
  tiers: {
    nom: "Services externes chargés dès l'arrivée",
    pourquoi:
      "Une police Google Fonts, une vidéo YouTube intégrée ou un bouton de réseau social se chargent depuis les serveurs de ces entreprises, souvent hors du Québec. Dès l'arrivée, ils reçoivent l'adresse IP du visiteur, qui peut permettre de l'identifier. Votre politique doit en informer les gens, et plusieurs de ces services peuvent attendre un clic.",
    article: 'Art. 8 et 17',
    enPlace:
      "Votre page d'accueil ne charge, avant un clic, aucun des services externes que nous surveillons (polices Google, YouTube, Vimeo, Google Maps, réseaux sociaux).",
    aCorriger:
      "Votre page d'accueil charge {services} dès l'arrivée, et votre politique n'en parle pas. Nommez ces services dans votre politique, ou faites-les charger seulement au besoin : police hébergée sur votre propre site, vidéo ou carte qui se charge au clic.",
    aVerifier:
      "Votre page d'accueil charge {services} dès l'arrivée. Votre politique semble les nommer : vérifiez qu'elle dit à quoi ils servent et qu'ils peuvent recevoir l'adresse IP des visiteurs hors du Québec.",
  },
  https: {
    nom: 'Connexion sécurisée (HTTPS)',
    pourquoi:
      'La loi exige des mesures de sécurité raisonnables pour protéger les renseignements. Sans HTTPS, ce qu’un visiteur tape dans un formulaire voyage en clair sur Internet.',
    article: 'Art. 10',
    enPlace: 'Votre site répond en HTTPS avec un certificat valide, et l’adresse en http:// mène automatiquement à la version sécurisée.',
    aCorrigerSansHttps: 'Votre site ne répond pas en HTTPS, ou son certificat est expiré ou invalide. Activez un certificat chez votre hébergeur : la plupart l’offrent sans frais.',
    aCorrigerSansRedirection:
      'Votre site répond en HTTPS, mais l’adresse en http:// reste accessible sans passer à la version sécurisée. Activez la redirection automatique vers HTTPS chez votre hébergeur.',
    aVerifier:
      'Votre site répond en HTTPS, mais nous n’avons pas pu confirmer que l’adresse en http:// y mène. Tapez votre adresse avec http:// dans un navigateur et vérifiez qu’elle passe en https://.',
  },

  /* Ailleurs sur le site */
  blocSitesWeb: {
    afficher: true,
    titre: 'Testez votre site selon la Loi 25',
    texte:
      "Entrez l'adresse de votre site : en 20 secondes environ, notre vérificateur relève 8 signaux de la Loi 25, comme les témoins déposés avant le consentement ou la présence d'un responsable de la protection des renseignements. Résultat immédiat, sans courriel.",
    bouton: 'Lancer le vérificateur',
  },
  lienPied: 'Vérificateur Loi 25', // Mattew

  /* Google et partage (Martin, section 1) */
  seoTitre: 'Vérificateur Loi 25 gratuit pour votre site web | Norvika',
  seoDescription:
    'Testez votre site web selon la Loi 25 en 20 secondes : témoins de suivi, bannière, politique de confidentialité, responsable. 8 vérifications, résultat immédiat, sans courriel.',
}

// Les mêmes règles que le Studio (tirets longs, flèches, mot banni) : refus avant toute écriture.
const fautes: string[] = []
;(function verifier(valeur: unknown, chemin: string) {
  if (typeof valeur === 'string') {
    const verdict = verifierTexte(valeur)
    if (verdict !== true) fautes.push(`${chemin} : ${verdict}`)
  } else if (Array.isArray(valeur)) valeur.forEach((v, i) => verifier(v, `${chemin}[${i}]`))
  else if (valeur && typeof valeur === 'object') Object.entries(valeur).forEach(([k, v]) => verifier(v, chemin ? `${chemin}.${k}` : k))
})(doc, '')
if (fautes.length) {
  console.error(`⛔ ${fautes.length} texte(s) refusé(s) :\n  ${fautes.join('\n  ')}`)
  process.exit(1)
}

const existe = await client.fetch<number>('count(*[_id in $ids])', { ids: [ID_DOC, `drafts.${ID_DOC}`] })
if (existe) {
  console.log(`Le document ${ID_DOC} existe déjà : rien n'est écrit (les corrections se font dans le Studio).`)
  process.exit(0)
}
if (essai) {
  console.log(`Essai : ${ID_DOC} serait créé (${Object.keys(doc).length - 2} champs). Rien n'est écrit.`)
  process.exit(0)
}
await client.transaction().createIfNotExists(doc).commit()
console.log(`${ID_DOC} créé (une transaction).`)

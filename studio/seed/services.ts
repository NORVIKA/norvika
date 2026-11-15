/**
 * Contenu de départ des quatre pages de services. SOURCE : app/<page>/Content.tsx et page.tsx
 * (commit 73cf3df), plus les lignes « SERVICES » de app/Content.tsx (accroche et détail sur
 * l'accueil). Repris MOT POUR MOT.
 */
import { TITRES_PROTEGES } from '../titres-proteges'
import { carte, etape, img, k, type Document } from './outils'

const t = (id: string) => ({ seoTitre: TITRES_PROTEGES[id].seoTitre, h1: TITRES_PROTEGES[id].h1.h1 })
const liste = (titre: string, phrases: string[]) => ({ afficher: true, titre, phrases })
const sCartes = (titre: string, cs: ReturnType<typeof carte>[]) => ({ afficher: true, titre, cartes: cs })
const sEtapes = (titre: string, es: ReturnType<typeof etape>[]) => ({ afficher: true, titre, etapes: es })

export const pageSitesWeb: Document = {
  _id: 'pageSitesWeb',
  _type: 'pageSitesWeb',
  nom: 'Sites web',
  ordre: 1,
  accroche: 'Un site clair, à la hauteur de votre travail.',
  detail: 'On vous en montre un aperçu avant même que vous décidiez quoi que ce soit. Et une fois livré, il est à vous: aucuns frais mensuels.',
  schemaNom: 'Création de sites web sur mesure',
  schemaType: 'Création de sites web',
  ...t('pageSitesWeb'),
  heroTexte:
    'Pas de gabarit générique. On part de votre entreprise, on bâtit un site clair qui donne envie de vous contacter, et vous repartez en sachant comment il fonctionne.',
  reconnaissez: liste('Vous vous reconnaissez?', [
    "Vous n'avez pas de site, et vos clients vous cherchent en ligne sans vous trouver.",
    "Votre site date, et il ne représente plus la qualité de votre travail.",
    "Votre site est correct, mais personne ne vous contacte à partir de là.",
    "Vous voulez un site à vous, sans mensualités qui n'en finissent plus.",
  ]),
  parcours: sEtapes('Comment ça se passe', [
    etape('Un appel de 30 minutes', 'On comprend votre entreprise, vos clients, ce que votre site doit accomplir. Gratuit, sans engagement.'),
    etape('On conçoit votre site', 'À partir de votre réalité, vos clients et ce que votre site doit accomplir. Pas de gabarit générique.'),
    etape('Deux à trois semaines de construction', 'On bâtit, on ajuste avec vous, on soigne les détails.'),
    etape('Livraison et prise en main', 'On vous montre comment tout fonctionne. Vous repartez autonome, avec un site qui vous appartient.'),
  ]),
  differemment: sCartes("Ce qu'on fait différemment", [
    carte('Le site vous appartient.', 'Aucun frais mensuel obligatoire, aucun contrat qui vous retient. Il est à vous, point.'),
    carte('Bâti sur mesure.', 'Pas de forfait prédéfini: on monte le site autour de votre entreprise, avec ce dont vous avez besoin, rien de plus.'),
    carte('Fait pour convertir.', 'Un site clair, rapide, qui guide vos visiteurs vers la prochaine étape. Pas juste une belle vitrine.'),
    carte('Prêt à évoluer.', 'Quand vous voudrez ajouter une fonctionnalité ou connecter un outil, il pourra suivre.'),
  ]),
  seoDescription:
    'Création de sites web sur mesure pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province. Sans gabarit générique, conçus pour convertir vos visiteurs en clients.',
}

export const pageAutomatisation: Document = {
  _id: 'pageAutomatisation',
  _type: 'pageAutomatisation',
  nom: 'Automatisation',
  ordre: 2,
  accroche: 'Une partie de vos semaines part dans des tâches qui vous font pas avancer.',
  detail: "On trouve les bons outils pour votre réalité, on les intègre avec vous, et on vous accompagne jusqu'à ce que ça roule.",
  schemaNom: 'Automatisation pour PME',
  schemaType: 'Automatisation',
  ...t('pageAutomatisation'),
  heroTexte:
    "La plupart des entreprises ont déjà des outils. Le problème, c'est qu'elles ne les comprennent pas vraiment, alors elles compensent à la main. On vous aide à comprendre ce que vous avez, à choisir ce qui manque, et à retrouver du temps pour ce qui compte.",
  reconnaissez: liste('Vous vous reconnaissez?', [
    'Vous payez pour des logiciels que vous utilisez à moitié.',
    'Vous avez cinq outils, et rien ne se parle. Vous faites le pont vous-même, chaque jour.',
    'Vous savez que ça pourrait rouler mieux, mais vous ne savez pas par où commencer.',
    "Vous avez déjà essayé quelque chose, personne ne vous a expliqué, vous l'avez abandonné.",
  ]),
  parcours: sEtapes('Comment ça se passe', [
    etape(
      'Un appel de 30 minutes',
      "On regarde ensemble comment votre entreprise fonctionne aujourd'hui. Gratuit, sans engagement, et vous repartez avec un document d'analyse.",
    ),
    etape('On comprend vos façons de faire', 'Vos outils actuels, vos étapes, où ça accroche. Avant de proposer quoi que ce soit.'),
    etape(
      'On trouve ce qui vous convient',
      "Parfois c'est un outil que vous avez déjà, mal utilisé. Parfois c'est de l'automatisation, parfois de l'IA. On choisit pour votre réalité, pas pour la mode.",
    ),
    etape('On implante avec vous', 'Petit à petit, sur vos propres comptes, avec votre équipe. Vous comprenez ce qui roule chez vous.'),
    etape(
      'On reste à vos côtés',
      'Vos outils évoluent, votre entreprise aussi. On vous accompagne pour que la compréhension reste, et que le temps gagné reste aussi.',
    ),
  ]),
  differemment: sCartes("Ce qu'on fait différemment", [
    carte("On commence par ce que vous avez déjà.", "Avant d'ajouter un outil, on regarde si ceux que vous payez font le travail. Souvent, la réponse est oui."),
    carte(
      'Vous comprenez, vous ne subissez pas.',
      "On vous explique ce qui roule chez vous et pourquoi. Le but, c'est que vous soyez maître de vos outils, pas dépendant de nous.",
    ),
    carte("Rien n'est hébergé chez nous.", 'Tout est implanté sur vos comptes. Si on part demain, ça continue de rouler.'),
    carte(
      "Pas d'IA pour faire de l'IA.",
      "Si le processus est mal organisé, ajouter de l'intelligence artificielle par-dessus rend juste ça plus compliqué. On règle l'ordre des choses d'abord.",
    ),
  ]),
  exemple: {
    afficher: true,
    titre: 'Un exemple simple',
    texte:
      "Un entrepreneur recevait ses demandes par courriel, sur Facebook et sur son site web, et passait ses soirées à tout retranscrire pour faire ses suivis. On a regardé son processus au complet, puis on a centralisé ses demandes au même endroit, avec les outils qu'il avait déjà. Maintenant, chaque demande est classée automatiquement, il sait lesquelles relancer, et il comprend comment ça marche. Rien de spectaculaire. Juste ses soirées qui lui appartiennent de nouveau.",
  },
  seoDescription:
    'Automatisation pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province : on vous aide à comprendre vos outils, choisir ce qui manque, et retrouver du temps pour ce qui compte.',
}

export const pagePhotoVideo: Document = {
  _id: 'pagePhotoVideo',
  _type: 'pagePhotoVideo',
  nom: 'Photo et vidéo',
  ordre: 3,
  accroche: 'Vos photos et vidéos ne rendent pas justice à ce que vous faites.',
  detail: "On capte votre travail comme il mérite d'être vu.",
  schemaNom: "Photo et vidéo d'entreprise",
  schemaType: 'Photo et vidéo',
  ...t('pagePhotoVideo'),
  heroTexte:
    "Votre travail parle de lui-même, quand on le montre bien. On capte votre entreprise telle qu'elle est: vraie, professionnelle, reconnaissable.",
  heroLienTexte: 'Voir notre portfolio',
  reconnaissez: liste('Vous vous reconnaissez?', [
    "Vos photos datent, ou elles viennent d'une banque d'images qui ne vous ressemble pas.",
    "Votre site et vos réseaux ont l'air amateurs à côté de la qualité de votre service.",
    'Vous avez un événement, un lancement, un nouveau local, et rien pour le montrer.',
    "Vous savez que l'image compte, mais vous n'avez ni le temps ni le réflexe de la soigner.",
  ]),
  capte: sCartes("Ce qu'on capte", [
    carte('Votre équipe et vos lieux', 'Portraits, ambiance, coulisses. Ce qui donne confiance avant même le premier appel.'),
    carte('Vos produits et votre travail', "Ce que vous faites, montré comme il mérite de l'être."),
    carte('Vos événements', "Lancements, conférences, moments d'équipe. Ce qui se passe une fois, capté pour de bon."),
    carte('Vos contenus vidéo', 'Courtes vidéos pour vos réseaux ou votre site, avec un message clair.'),
  ]),
  parcours: sEtapes('Comment ça se passe', [
    etape('Un appel de 30 minutes', "On comprend votre entreprise, à qui vous parlez et à quoi les images vont servir. Gratuit, sans engagement."),
    etape('On planifie ensemble', "Lieux, moments, ce qu'on doit absolument capter. Vous n'avez rien à deviner."),
    etape('On tourne, on capte', "Sur place, avec vous, sans mise en scène forcée. Ce qui compte, c'est que ça vous ressemble."),
    etape('On livre, prêt à utiliser', 'Des images pensées pour votre site, vos réseaux, vos soumissions. Elles sont à vous, sans restriction.'),
  ]),
  differemment: sCartes("Ce qu'on fait différemment", [
    carte(
      "On pense à l'utilité avant l'esthétique.",
      "Une belle photo qui ne sert à rien, c'est de l'argent perdu. On capte ce dont votre site et vos réseaux ont vraiment besoin.",
    ),
    carte(
      'On connaît le reste de votre présence en ligne.',
      'On fait aussi des sites web: on sait exactement quelles images un site a besoin pour bien fonctionner.',
    ),
    carte('Les images sont à vous.', 'Aucune licence limitée, aucun frais pour les réutiliser. Vous les avez, point.'),
  ]),
  tournage: {
    afficher: true,
    photo: img('public/assets/img-1079.webp', "Un membre de l'équipe Norvika en tournage chez un client"),
    titre: 'On tourne chez vous, dans votre vrai environnement.',
    texte:
      "On apporte l'équipement, on s'installe sur place et on capte votre entreprise telle qu'elle est. Pas de mise en scène forcée: des images qui vous ressemblent et qui servent réellement votre marque.",
  },
  seoDescription:
    "Photo et vidéo pour les entreprises de la ville de Québec, de la Rive-Sud de Montréal et de partout en province : des images qui montrent votre entreprise telle qu'elle est, vraie, professionnelle et reconnaissable.",
}

export const pageFormation: Document = {
  _id: 'pageFormation',
  _type: 'pageFormation',
  nom: 'Formation',
  ordre: 4,
  accroche: 'Vos outils, vous aimeriez savoir les utiliser vous-mêmes.',
  detail: 'On forme votre équipe sur place, sur vos vraies situations. Vous repartez autonomes, pas dépendants de nous.',
  schemaNom: 'Formation aux outils numériques',
  schemaType: 'Formation',
  ...t('pageFormation'),
  heroTexte:
    "Votre site, vos photos, vos vidéos, vos outils: tout ça est à vous. Pourtant, vous dépendez souvent de quelqu'un d'autre pour y toucher. On forme votre équipe, sur place, pour qu'elle sache le faire elle-même.",
  reconnaissez: liste('Vous vous reconnaissez?', [
    'Vous voulez publier des photos et des vidéos qui vous ressemblent, sans attendre un photographe à chaque fois.',
    "Vous avez un site, mais vous n'osez pas y toucher de peur de tout briser.",
    "Vous payez pour des outils que votre équipe utilise à moitié, parce que personne a jamais pris le temps d'expliquer.",
    "Vous voulez comprendre ce que l'automatisation ou l'IA peut faire pour vous, avant d'investir quoi que ce soit.",
  ]),
  gains: sCartes('Ce que vous gagnez, concrètement', [
    carte(
      "Vous arrêtez d'attendre.",
      "Une photo à publier, une page à modifier, un outil à ajuster: vous le faites le jour même, au lieu d'ouvrir un ticket ou d'attendre une soumission.",
    ),
    carte('Vous arrêtez de payer pour la même chose.', "Chaque fois que votre équipe sait faire elle-même, c'est une facture d'agence qui ne revient plus."),
    carte(
      'Vous reprenez le contrôle.',
      "Quand vous comprenez comment ça marche, vous savez ce qui vaut la peine d'acheter, ce qui ne sert à rien, et quand demander de l'aide.",
    ),
    carte('Votre équipe gagne en confiance.', 'Elle arrête de dire « je ne suis pas bonne là-dedans », et commence à dire « je m\'en occupe ».'),
  ]),
  enseigne: {
    afficher: true,
    titre: "Trois choses qu'on peut vous montrer",
    libelleApres: 'Après:',
    liste: [
      {
        _key: k('s'),
        _type: 'sujet',
        titre: 'Vos photos et vidéos',
        texte: "Cadrer, éclairer, monter, publier. On apporte l'équipement pour la formation, vous apprenez sur du vrai matériel avant de décider quoi acheter.",
        apres: "Votre équipe produit du contenu qui vous ressemble, au rythme qu'elle veut.",
      },
      {
        _key: k('s'),
        _type: 'sujet',
        titre: 'Votre site web',
        texte: "Comment le modifier, ajouter du contenu, comprendre ce qu'il fait pour vous.",
        apres: "Un site que vous faites vivre vous-mêmes, au lieu d'un site qui vieillit parce que personne n'ose y toucher.",
      },
      {
        _key: k('s'),
        _type: 'sujet',
        titre: 'Vos outils numériques',
        texte: 'Comment ils fonctionnent, comment les faire parler ensemble, lesquels vous utilisez à moitié.',
        apres: "Souvent, vous réalisez que vous n'avez pas besoin d'un nouvel outil, juste de mieux utiliser ceux que vous payez déjà.",
      },
    ],
  },
  parcours: sEtapes('Comment ça se passe', [
    etape('Un appel de 30 minutes', "On comprend ce que votre équipe fait déjà, ce qu'elle aimerait faire, et où ça bloque. Gratuit, sans engagement."),
    etape(
      'On bâtit la formation autour de vous',
      'Pas de contenu générique. On part de vos vraies situations et de ce que vous voulez être capables de faire après.',
    ),
    etape(
      'On forme sur place, avec votre équipe',
      'Une demi-journée, une journée ou deux, dans votre entreprise, en petit groupe ou en individuel. On pratique sur du vrai, pas sur des exemples.',
      'On forme sur place',
    ),
    etape('Vous repartez autonomes', "Avec ce qu'il faut pour continuer sans nous. Et si vous voulez qu'on reste dans le décor, on en parle."),
  ]),
  differemment: sCartes("Ce qu'on fait différemment", [
    carte(
      "On enseigne ce qu'on fait nous-mêmes.",
      'On bâtit des sites, on tourne des vidéos, on implante des outils toutes les semaines. Vous apprenez notre pratique, pas de la théorie.',
    ),
    carte('On forme dans votre réalité.', "Vos locaux, votre site, vos situations. Ce que vous apprenez le matin, vous l'appliquez l'après-midi."),
    carte(
      "Souvent, c'est admissible à une aide.",
      "Selon votre situation, la formation de vos employés peut être soutenue par Service Québec. On vous dit ce qui s'applique pendant l'appel.",
    ),
    carte(
      "La formation, c'est parfois tout ce qu'il vous faut.",
      "On préfère vous rendre autonomes que vous vendre un service dont vous n'avez pas besoin.",
    ),
  ]),
  seoDescription:
    'On forme votre équipe sur place: photo et vidéo, site web, outils numériques. Pour que ce qui vous appartient, vous sachiez le faire vous-mêmes.',
  partageDescription: 'On forme votre équipe sur place: photo et vidéo, site web, outils numériques. Autonomes après, pas dépendants.',
}

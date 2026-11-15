/**
 * Contenu de départ du diagnostic, de L'équipe, de Contact et de Bienvenue.
 * SOURCE : app/<page>/Content.tsx, page.tsx et les formulaires (commit 73cf3df), MOT POUR MOT.
 */
import { TITRES_PROTEGES } from '../titres-proteges'
import { carte, img, k, type Document } from './outils'

const t = (id: string) => ({ seoTitre: TITRES_PROTEGES[id].seoTitre, h1: TITRES_PROTEGES[id].h1.h1 })

/** Une question du diagnostic : réponses, phrases miroir et points, dans l'ordre. */
function question(q: string, reponses: string[], miroirs: string[], points: number[], precision?: string) {
  return {
    _key: k('q'),
    _type: 'question',
    question: q,
    ...(precision ? { precision } : {}),
    reponses: reponses.map((libelle, i) => ({ _key: k('o'), _type: 'reponse', libelle, miroir: miroirs[i], points: points[i] })),
  }
}
// Points par défaut du code d'origine : [3, 2, 1, 0] dans l'ordre des réponses.
const DEFAUT = [3, 2, 1, 0]

export const pageDiagnostic: Document = {
  _id: 'pageDiagnostic',
  _type: 'pageDiagnostic',
  ...t('pageDiagnostic'),
  intro: "Répondez comme vous le pensez, pas comme vous aimeriez que ce soit. C'est là que ça devient utile.",
  boutonDebut: "C'est parti",
  encouragement: 'Plus que trois. Vous êtes bon là-dedans.',
  boutonRetour: 'Revenir',
  questions: [
    question(
      'Commençons par votre site web. Vous en pensez quoi, honnêtement?',
      ["J'en ai pas", 'Il fait vieux, il me ressemble plus', 'Il est correct, mais il fait rien pour moi', "J'en suis fier"],
      ["Vous n'avez pas de site", 'Votre site ne vous ressemble plus', 'Votre site est correct, sans plus', 'Vous êtes fier de votre site'],
      DEFAUT,
    ),
    question(
      'Et combien de nouveaux clients vous contactent grâce à lui, dans un mois normal?',
      ['Aucun, ou franchement je sais pas', 'Un ou deux', 'Quelques-uns', "C'est ma principale source de clients"],
      [
        'presque personne ne vous contacte grâce à lui',
        'un ou deux clients par mois vous arrivent par là',
        'quelques clients par mois vous arrivent par là',
        "c'est votre principale source de clients",
      ],
      DEFAUT,
    ),
    question(
      "Parlons de vos semaines. Combien d'heures partent dans des tâches qui reviennent tout le temps?",
      ['Moins de 3h, ça va', '3 à 8h', '8 à 15h', 'Plus de 15h, ça me gruge'],
      ['moins de 3 heures par semaine', '3 à 8 heures par semaine', '8 à 15 heures par semaine', 'plus de 15 heures par semaine'],
      [0, 1, 2, 3],
      "Courriels, factures, rappels, retranscrire des infos d'une place à l'autre.",
    ),
    question(
      'Vos outils actuels, ceux que vous payez déjà. Vous diriez quoi?',
      ['Je les utilise à moitié, je compense à la main', "J'en ai plusieurs et rien se parle", 'Ça roule correct', 'Ça roule très bien'],
      [
        'vous utilisez vos outils à moitié en compensant à la main',
        'vos outils ne se parlent pas entre eux',
        'vos outils roulent correctement',
        'vos outils roulent bien',
      ],
      DEFAUT,
    ),
    question(
      "Vos photos et vidéos, elles viennent d'où?",
      ["D'une banque d'images ou de mon cellulaire", "D'un photographe, mais ça date", 'Récentes et professionnelles', "J'en ai pas vraiment"],
      [
        "Vos images viennent d'une banque ou d'un cellulaire",
        'Vos photos professionnelles datent',
        'Vos images sont récentes et professionnelles',
        "Vous n'avez presque pas d'images de votre entreprise",
      ],
      [3, 2, 0, 3],
    ),
    question(
      "Un client compare votre entreprise à un compétiteur en ligne. Qui a l'air le plus crédible?",
      ['Le compétiteur, honnêtement', 'Difficile à dire', 'Moi, sans hésiter'],
      [
        "vous savez qu'un compétiteur a l'air plus crédible que vous",
        "vous n'êtes pas sûr d'avoir l'air plus crédible qu'un compétiteur",
        "vous avez l'air crédible en ligne",
      ],
      [3, 1, 0],
    ),
    question(
      'Dernière question. Si on vous redonnait 10 heures par mois, vous les mettriez où?',
      ['Trouver des clients', "Mieux servir ceux que j'ai déjà", 'Souffler un peu', 'Développer de nouveaux projets'],
      ['trouver des clients', 'mieux servir vos clients actuels', 'souffler un peu', 'développer de nouveaux projets'],
      DEFAUT,
    ),
  ],
  resultatSurtitre: 'Votre résultat',
  barreSite: 'Votre site',
  barreTemps: 'Votre temps',
  barreImage: 'Votre image',
  noteHaute: 'à régler',
  noteMoyenne: 'à surveiller',
  noteBasse: 'solide',
  carteMiroir: "Ce qu'on voit",
  carteBonneNouvelle: 'La bonne nouvelle',
  carteSuite: 'La suite',
  profilAucun: {
    titre: "Honnêtement, ça a l'air de bien aller.",
    miroir: "Votre site, vos outils et votre image tiennent la route. Ça arrive, pis c'est une bonne nouvelle.",
    bonneNouvelle: "Si vous voulez qu'on regarde quand même ce qui pourrait aller plus loin, on est là.",
    suite: 'Vous voulez mettre vos heures à {reponse7}. Ça commence par un portrait complet de votre entreprise.',
    volet: 'votre entreprise',
    lien: '/',
  },
  profilSite: {
    titre: 'Ce qui vous freine le plus: votre site.',
    miroir: "{reponse1}, et {reponse2}. Le travail est là. C'est juste que personne ne le voit.",
    bonneNouvelle:
      "La bonne nouvelle, c'est que ça se règle. Un site clair qui vous ressemble, c'est quelques semaines de travail, et après il est à vous.",
    suite: 'Vous voulez mettre vos heures à {reponse7}. Ça commence par un portrait complet de votre entreprise, pas juste de votre site.',
    volet: 'votre site',
    lien: '/sites-web',
  },
  profilTemps: {
    titre: 'Ce qui vous freine le plus: votre temps.',
    miroir:
      "Vous perdez {reponse3} dans des tâches qui reviennent tout le temps, et {reponse4}. C'est pas un manque d'effort. C'est un manque de système.",
    bonneNouvelle:
      "La bonne nouvelle, c'est que c'est souvent le frein le plus rapide à régler. Les outils existent déjà. Il faut juste les bons, et les comprendre.",
    suite: 'Vous voulez mettre vos heures à {reponse7}. Ça commence par un portrait complet de votre entreprise, pas juste de vos outils.',
    volet: 'votre temps',
    lien: '/automatisation',
  },
  profilImage: {
    titre: 'Ce qui vous freine le plus: votre image.',
    miroir: '{reponse5}, et {reponse6}. Votre service est probablement meilleur que ce que vos clients voient.',
    bonneNouvelle:
      "La bonne nouvelle, c'est que quelques bonnes images bien pensées changent l'impression au complet. Sur votre site, sur vos réseaux, partout.",
    suite: 'Vous voulez mettre vos heures à {reponse7}. Ça commence par un portrait complet de votre entreprise, pas juste de votre image.',
    volet: 'votre image',
    lien: '/photo-et-video',
  },
  formTitre: 'Envoyez-moi une analyse globale de mon entreprise.',
  formTexte:
    "On regarde votre situation au complet, votre site, votre temps, votre image, et on vous revient personnellement avec ce qu'on ferait à votre place. Gratuit, sans engagement.",
  formNom: 'Nom complet',
  formCourriel: 'Courriel',
  formBouton: 'Recevoir mon analyse',
  formNote: 'Une vraie personne vous répond. Aucun envoi automatisé, aucune relance à répétition.',
  merciTitre: "Merci, {prenom}. C'est entre bonnes mains.",
  merciTexte: "On vous revient dans les prochains jours pour organiser votre analyse. D'ici là, jetez un oeil à comment on aborde {volet}.",
  boutonApproche: 'Voir notre approche',
  boutonRefaire: 'Refaire le quiz',
  seoDescription: 'Répondez à sept questions pour découvrir ce qui freine le plus votre entreprise: votre site, votre temps ou votre image.',
}

export const pageEquipe: Document = {
  _id: 'pageEquipe',
  _type: 'pageEquipe',
  ...t('pageEquipe'),
  intro: "Norvika, c'est Laurianne et William. Deux façons de penser qui se complètent, un même but: que la technologie vous serve, pas l'inverse.",
  origine: {
    afficher: true,
    titre: 'Comment Norvika est née',
    texte: [
      "Norvika, à la base, c'était pas dans nos plans. On était déjà en affaires depuis quelques années, et on travaillait ensemble dans une agence où on faisait entre autres de la conception web. Un jour, on nous annonce que notre département ferme. On avait environ une semaine pour décider de la suite.",
      "On aurait pu retourner travailler ailleurs. Mais on s'est dit qu'on avait déjà les compétences, l'expérience, et surtout une façon de travailler qu'on voulait développer à notre manière. C'est là qu'on a créé Norvika.",
      "Au début, on a mis beaucoup d'énergie sur les sites web et la photo-vidéo, parce que c'était des besoins qu'on voyait constamment chez les entreprises autour de nous. Mais assez vite, on s'est rendu compte que le problème allait souvent plus loin. Un site, c'est une chose. Après, il faut avoir les bons outils, les connecter ensemble, les comprendre, puis être capable de les utiliser pour de vrai. C'est vers ça qu'on bâtit Norvika aujourd'hui.",
    ],
  },
  quiFaitQuoi: { afficher: true, titre: 'Qui fait quoi', photoAVenir: 'Photo à venir' },
  ensemble: {
    afficher: true,
    photo: img('public/assets/lau-et-will-2-2.webp', 'Laurianne et William en studio'),
    titre: 'Ensemble',
    texte:
      "Elle voit où on va, il fait en sorte qu'on s'y rende. Elle pense au client et au résultat, il pense au système et à la fiabilité. Sur les tournages, sur les formations, sur les projets qui touchent à tout en même temps, on est deux, et c'est comme ça qu'on livre des projets qui tiennent la route.",
  },
  croyances: {
    afficher: true,
    titre: 'Ce en quoi on croit',
    cartes: [
      carte(
        'On part du problème, jamais du service.',
        "On commence par comprendre ce qui vous freine. La solution vient après, et parfois c'est pas celle à laquelle vous pensiez.",
      ),
      carte(
        'On règle le vrai problème avec vous, jamais à votre place.',
        'Vous restez aux commandes. On vous montre comment ça marche, pour que ça vous appartienne vraiment.',
      ),
      carte(
        'On dit les vraies affaires.',
        "Si un outil n'est pas nécessaire, on vous le dit. Si un projet devrait attendre, on vous le dit aussi. On préfère perdre une vente que vous vendre quelque chose d'inutile.",
      ),
      carte('On tient nos engagements.', 'Ce qu\'on promet, on le livre. Pas de surprise sur la facture, pas de surprise sur le délai.'),
    ],
  },
  conclusion: {
    afficher: true,
    titre: 'La technologie devrait vous simplifier la vie. Pas vous en rajouter.',
    texte:
      "Notre travail, c'est de vous redonner du temps pour ce qui compte: vos clients, votre équipe, vos soupers en famille. Pas en vous vendant des outils, mais en vous aidant à comprendre ceux qui vous conviennent, et à les faire rouler.",
  },
  seoDescription:
    "Norvika, c'est Laurianne et William. Deux façons de penser qui se complètent, un même but: que la technologie vous serve, pas l'inverse.",
  partageDescription: "Norvika, c'est Laurianne et William. On rattache l'humain à l'efficience.",
  partageImage: img('public/assets/lau-et-will-2.webp', 'Laurianne Plouffe et William Simard, fondateurs de Norvika'),
}

export const membres: Document[] = [
  {
    _id: 'membre-laurianne',
    _type: 'membre',
    nom: 'Laurianne',
    role: 'Direction, design et relation client',
    photo: img('public/assets/lau-2.webp', undefined, { x: 0.5, y: 0.22 }),
    texte:
      "C'est elle qui donne la direction. Elle mène l'appel de 30 minutes, évalue votre situation, et pense à ce que votre entreprise a vraiment besoin avant de penser à ce qu'on pourrait vous vendre. Elle conçoit le design de votre site, bâtit la stratégie de contenu, et reste votre point de contact du début à la fin. Si quelque chose accroche, c'est à elle que vous écrivez.",
    ordre: 1,
    afficher: true,
  },
  {
    _id: 'membre-william',
    _type: 'membre',
    nom: 'William',
    role: 'Développement, systèmes et technique',
    photo: img('public/assets/will.webp', undefined, { x: 0.5, y: 0.22 }),
    texte:
      "C'est lui qui fait que ça marche. Formé en programmation, il bâtit les sites, les intégrations, les systèmes, et il s'occupe de tout le côté technique de la photo, de la vidéo et du montage. Il aime les choses qui roulent proprement, sans surprise, et il prend le temps de vous expliquer comment ça fonctionne, pour que vous n'ayez pas besoin de lui à chaque fois.",
    ordre: 2,
    afficher: true,
  },
]

export const pageContact: Document = {
  _id: 'pageContact',
  _type: 'pageContact',
  ...t('pageContact'),
  intro: "Une question, un projet, ou juste l'envie d'en parler ? Écrivez-nous et on vous revient rapidement.",
  libelleCourriel: 'Courriel',
  libelleTelephone: 'Téléphone',
  libelleRendezVous: 'Prendre rendez-vous',
  lienRendezVous: 'Réserver un appel de 30 min',
  champNom: 'Nom',
  champCourriel: 'Courriel',
  champTelephone: 'Téléphone (facultatif)',
  champMessage: 'Message',
  bouton: 'Envoyer le message',
  boutonEnvoi: 'Envoi en cours…',
  merciTitre: 'Merci, votre message est parti.',
  merciTexte: 'On vous revient rapidement, par courriel ou par téléphone.',
  seoDescription: 'Parlez-nous de votre projet. On vous répond rapidement, par courriel ou par téléphone.',
}

export const pageBienvenue: Document = {
  _id: 'pageBienvenue',
  _type: 'pageBienvenue',
  ...t('pageBienvenue'),
  intro:
    "On s'occupe de presque tout. Ce guide vous explique chaque étape en mots simples, pour que vous sachiez ce qui s'en vient, sans stress. Vous n'avez pas besoin d'être à l'aise avec la technologie, c'est notre travail.",
  formTitre: 'Pour commencer, laissez-nous vos coordonnées.',
  champPrenom: 'Prénom',
  champCourriel: 'Courriel',
  champTelephone: 'Numéro de téléphone',
  bouton: 'Envoyer',
  boutonEnvoi: 'Envoi en cours…',
  merciTitre: 'Merci, on vous revient sous peu.',
  merciTexte: 'Vous recevrez un courriel ou un appel pour planifier la suite.',
  outils: {
    afficher: true,
    titre: "Les outils qu'on va utiliser, expliqués simplement.",
    texte:
      'Pendant le projet, vous allez voir passer quelques noms. Pas de panique. Voici ce que chacun fait, et on crée tous ces comptes avec vous, étape par étape. Vous ne serez jamais laissé tout seul devant un écran.',
    liste: [
      carte(
        'GoDaddy',
        "C'est l'adresse de votre site, ce que les gens tapent pour vous trouver, par exemple votrecommerce.com. Comme l'adresse civique de votre commerce.",
      ),
      carte(
        'GitHub',
        "C'est l'endroit sécurisé où le code de votre site est gardé, avec tout son historique. Comme un coffre-fort qui contient les plans de votre site.",
      ),
      carte('Supabase', "C'est la mémoire de votre site, ce qui garde les informations comme les réservations, les formulaires et les contenus."),
      carte('Vercel', "C'est ce qui garde votre site en ligne en tout temps et le fait charger vite. Comme le terrain qui accueille votre site et le garde allumé."),
    ],
    propriete:
      "Ces comptes sont à vous. Votre site, votre domaine et vos données vous appartiennent. Vous n'êtes jamais pris en otage, et vous pouvez partir avec si un jour vous le souhaitez.",
  },
  etapes: {
    afficher: true,
    titre: "Ce qui s'en vient, étape par étape.",
    liste: [
      carte('Vos coordonnées', 'Vous remplissez le formulaire ci-dessus.'),
      carte('On crée vos comptes ensemble', 'On configure GoDaddy, GitHub, Supabase et Vercel avec vous.'),
      carte('Le dépôt pour lancer', 'Un dépôt de 25 % confirme le projet et on se met au travail. On vous envoie les détails par courriel.'),
      carte('On monte votre site', "On s'occupe de tout, vous n'avez rien à gérer."),
      carte('Vous le voyez et vous approuvez', "On ajuste jusqu'à ce que vous soyez satisfait."),
      carte('Le solde et la mise en ligne', 'Vous réglez le reste (75 %), puis votre site devient public à votre adresse.'),
    ],
  },
  paiement: {
    afficher: true,
    titre: 'Le paiement, simple et sans surprise.',
    texte:
      'Vous payez en deux fois. Un dépôt de 25 % au début pour lancer le projet, puis le solde de 75 % à la fin, une fois que votre site vous plaît et avant la mise en ligne. On vous envoie tous les détails et le moyen de paiement par courriel, à chaque étape. Rien de compliqué, rien à faire sur cette page.',
  },
  contact: {
    afficher: true,
    titre: 'Une question ? On est là.',
    texte: "Écrivez-nous ou appelez-nous n'importe quand, on vous accompagne du début à la fin.",
    libelleCourriel: 'Courriel :',
    libelleTelephone: 'Téléphone :',
  },
  seoDescription: "Guide d'accueil pour les nouveaux clients de sites web Norvika. Étapes simples, expliquées sans jargon.",
}

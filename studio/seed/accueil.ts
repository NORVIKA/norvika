/**
 * Contenu de départ de l'accueil et des avis Google. SOURCE : app/Content.tsx, app/page.tsx et
 * le JSON-LD de app/layout.tsx (commit 73cf3df), MOT POUR MOT.
 */
import { TITRES_PROTEGES } from '../titres-proteges'
import { etape, img, k, ref, refSeule, type Document } from './outils'

const R = (slug: string) => `realisation-${slug}`

export const pageAccueil: Document = {
  _id: 'pageAccueil',
  _type: 'pageAccueil',
  seoTitre: TITRES_PROTEGES.pageAccueil.seoTitre,
  h1: TITRES_PROTEGES.pageAccueil.h1.h1,
  heroTexte: 'Chaque entreprise est différente, la vôtre aussi. On prend le temps de comprendre votre réalité, pis on bâtit une offre qui vous ressemble.',
  heroBoutonSecondaire: 'Nos réalisations',
  videos: {
    afficher: true,
    titre: 'En vidéo',
    sousTitre: 'Nos clients en parlent mieux que nous.',
    bouton: 'Voir la réalisation',
    liste: [
      { youtubeId: 'RSq7pu-hRjs', titre: "Témoignage d'André et Jen", realisation: refSeule(R('bar-le-vox')) },
      { youtubeId: '9g_IWhFRhIo', titre: "Témoignage d'Ékip Jeunesse", realisation: refSeule(R('ekip-jeunesse')) },
      { youtubeId: 'zAKFvYKTxfQ', titre: 'Nelly Dufour, avant et après', realisation: refSeule(R('nelly-dufour')) },
      { youtubeId: 'iUQmSeDHcAk', titre: 'Témoignage de la Taverne du Collectionneur', realisation: refSeule(R('taverne-du-collectionneur')) },
    ].map((v) => ({ _key: k('v'), _type: 'video', ...v })),
  },
  avantApres: {
    afficher: true,
    titre: 'Avant / après',
    sousTitre: "Ce qu'une refonte change.",
    texte: 'Le gym CrossFit Sainte-Foy, avant et après son nouveau site.',
    realisation: refSeule(R('crossfit-sainte-foy')),
    bouton: 'Voir la réalisation',
  },
  quiz: {
    afficher: true,
    titre: 'Est-ce que votre entreprise va bien, pour vrai?',
    texte: 'Sept questions, deux minutes, aucune bonne ou mauvaise réponse. Juste un portrait honnête de ce qui vous freine en ce moment.',
  },
  logos: {
    afficher: true,
    titre: 'Quelques entreprises avec qui nous avons collaboré',
    realisations: ['desjardins', 'anytime-fitness', 'enfin-libre', 'le-roi-des-cartes', 'titan-diamond-tools'].map((s) => ref(R(s))),
    lien: 'Voir toutes nos réalisations',
  },
  services: { afficher: true, titre: "Ce qu'on fait, et pour régler quoi.", ouvrir: 'Le détail', fermer: 'Réduire', lienPage: 'Voir la page' },
  parcours: {
    afficher: true,
    surtitre: 'Comment ça marche',
    titre: 'On regarde votre cas, pas un cas type.',
    etapes: [
      etape('Un court appel', '30 minutes, gratuit, sans engagement. On regarde ensemble ce qui vous freine.'),
      etape('On comprend votre réalité', 'Vos façons de faire, vos outils actuels, ce qui vous gruge du temps. Avant de proposer quoi que ce soit.'),
      etape('On bâtit votre offre', 'Pas de catalogue: une proposition montée pour votre entreprise, avec les outils qui vous conviennent.'),
      etape('Vous voyez avant de décider', "Un aperçu concret de ce qu'on ferait, entre vos mains, avant d'investir quoi que ce soit."),
      etape('On reste à vos côtés', "On implante avec vous, on ajuste, et on vous accompagne pour que ça continue d'avancer."),
    ],
  },
  fondateurs: {
    afficher: true,
    titre: "On rattache l'humain à l'efficience.",
    texte:
      'Derrière Norvika, deux personnes qui prennent le temps de comprendre votre réalité avant de proposer quoi que ce soit. Pas une présence en ligne de plus à cocher sur une liste, une qui travaille vraiment pour vous.',
    legende: 'Fondateurs de Norvika',
    photo: img('public/assets/lau-et-will-2.webp', 'Laurianne et William, cofondateurs de Norvika', { x: 0.5, y: 0.22 }),
    citation: '« On règle le vrai problème avec vous, jamais à votre place. »',
  },
  avis: { afficher: true, titre: 'Avis Google', etoiles: '★★★★★', note: '5,0 sur Google' },
  seoDescription:
    'Sites web, automatisation, photo et vidéo pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province. On comprend votre réalité, puis on bâtit une offre qui vous ressemble.',
  partageDescription: 'Sites web, automatisation, photo et vidéo. 30 minutes gratuites pour comprendre ce qui vous freine.',
}

type Avis = { nom: string; contexte: string; signature: string; accroche: string; suite: string[]; extraitGoogle?: string }

const AVIS: Avis[] = [
  {
    nom: 'Marie-Claire Huard',
    contexte: 'Pataphil · il y a 3 semaines',
    signature: 'Marie-Claire Huard · Pataphil · 5,0 sur Google',
    accroche: 'Je recommande Norvika et Laurianne sans aucune hésitation!',
    suite: [
      "Faire un site web pour Pataphil représentait beaucoup pour moi. Après 46 ans d'histoire, je voulais un site qui reflète vraiment notre personnalité et nos valeurs. Laurianne a su comprendre exactement ce que je voulais, parfois même avant que je sois capable de l'expliquer!",
      "Elle est à l'écoute, disponible, incroyablement patiente et très talentueuse. Chaque détail a été pensé avec soin, et tout au long du projet, je me suis sentie accompagnée et en confiance. Les échanges étaient rapides, simples et toujours agréables.",
      "Le résultat dépasse mes attentes. Notre site est beau, moderne, convivial et représente parfaitement l'image de Pataphil.",
      "Au-delà du résultat, c'est aussi l'expérience client qui mérite d'être soulignée. On sent que Laurianne aime ce qu'elle fait et qu'elle s'investit sincèrement dans les projets de ses clients.",
      'Merci, Laurianne, pour ton professionnalisme, ta créativité et ton immense patience. Ce fut un réel plaisir de travailler avec toi. Je recommande Norvika à tous ceux qui recherchent un service humain, personnalisé et un résultat à la hauteur de leurs attentes.',
    ],
    extraitGoogle:
      'Je recommande Norvika et Laurianne sans aucune hésitation. Un service humain, personnalisé et un résultat à la hauteur de nos attentes.',
  },
  {
    nom: 'Mélodie Colpron',
    contexte: 'Anytime Fitness · il y a 1 semaine',
    signature: 'Mélodie Colpron · Anytime Fitness · 5,0 sur Google',
    accroche: "Un énorme merci à Laurianne et toute son équipe pour leur excellent travail lors de notre party du 1er anniversaire d'ouverture!",
    suite: [
      "Ils ont filmé plusieurs clips tout au long de l'événement et le résultat est tout simplement incroyable. L'équipe était professionnelle, dynamique et super agréable à côtoyer. Je recommande leurs services à 100% sans hésitation!",
    ],
    extraitGoogle: 'Une équipe professionnelle, dynamique et super agréable. Je recommande leurs services à 100 pour cent.',
  },
  {
    nom: 'Olee G',
    contexte: 'GARNO photographe · il y a 6 jours',
    signature: 'Olee G · GARNO photographe · 5,0 sur Google',
    accroche:
      "J'ai eu la chance de faire affaire avec cette équipe incroyable! Professionnelle, soucieux du détails et super facile à travailler avec. Si vous cherchez une équipe différente et motivé c'est les bons!",
    suite: [],
  },
  {
    nom: 'DSM Sports Cards Collectors',
    contexte: 'Le roi des cartes · il y a 4 jours',
    signature: 'DSM Sports Cards Collectors · Le roi des cartes · 5,0 sur Google',
    accroche: 'Excellant support, très bon travail et super bon rapport qualité/prix. réponses et solutions rapides!',
    suite: ['Je recommande.'],
  },
  {
    nom: 'François Timmons',
    contexte: 'Bistro de la Gare · cette semaine',
    signature: 'François Timmons · Bistro de la Gare · 5,0 sur Google',
    accroche: 'Super travail!! Très professionnel. Je suis vraiment très heureux de mon nouveau site web!!',
    suite: [],
  },
  {
    nom: 'Théo Chastenay',
    contexte: 'il y a 4 semaines',
    signature: 'Théo Chastenay · 5,0 sur Google',
    accroche: 'Laurianne et Will! Deux machines de guerre digne du film Terminator! Service exceptionnel et ils savent rendre des comptes! Je vous recommande à 100%!',
    suite: [],
  },
  {
    nom: 'Martin Desbiens',
    contexte: 'TPM Hobby & Collection · il y a 10 semaines',
    signature: 'Martin Desbiens · TPM Hobby & Collection · 5,0 sur Google',
    accroche: "Excellent service. À l'écoute de nos besoins. Vous ne vous tromper pas avec Norvika.",
    suite: [],
  },
]

const idAvis = (nom: string) =>
  `avis-${nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`

export const avis: Document[] = AVIS.map((a, i) => ({
  _id: idAvis(a.nom),
  _type: 'avis',
  nom: a.nom,
  contexte: a.contexte,
  signature: a.signature,
  accroche: a.accroche,
  suite: a.suite,
  ...(a.extraitGoogle ? { extraitGoogle: a.extraitGoogle } : {}),
  ordre: i + 1,
  afficher: true,
}))

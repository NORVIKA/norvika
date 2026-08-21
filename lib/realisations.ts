const coverAnytime = { url: "/assets/cover-anytime.webp" };
const coverCracheur = { url: "/assets/cover-cracheur.webp" };
const coverDesjardins = { url: "/assets/cover-desjardins.webp" };
const coverEnfinLibre = { url: "/assets/cover-enfinlibre.webp" };
const coverLoud = { url: "/assets/cover-loud.webp" };
const coverLylou = { url: "/assets/cover-lylou.webp" };
const coverQg = { url: "/assets/cover-qg.webp" };
const coverSuperGolf = { url: "/assets/cover-supergolf.webp" };
const coverTitan = { url: "/assets/cover-titan.webp" };
const anytime = { url: "/assets/client-anytimefitness.webp" };
const cracheur = { url: "/assets/clean-cracheur-de-feu.webp" };
const enfinLibre = { url: "/assets/clean-enfin-libre.webp" };
const garno = { url: "/assets/clean-garno.webp" };
const garage = { url: "/assets/client-garage-la-touche-finale.webp" };
const roiDesCartes = { url: "/assets/clean-le-roi-des-cartes.webp" };
const lylou = { url: "/assets/clean-lylou-desserts-glaces.webp" };
const opelai = { url: "/assets/client-opelai.webp" };
const pataphil = { url: "/assets/pataphil-original.webp" };
const piment = { url: "/assets/clean-piment-szechuan.webp" };
const qgBeloeil = { url: "/assets/clean-qg-du-vieux-beloeil.webp" };
const secrets = { url: "/assets/clean-secrets-jamais-dits.webp" };
const titan = { url: "/assets/clean-titan-diamond-tools.webp" };
const allies = { url: "/assets/clean-agence-allies.webp" };
const desjardins = { url: "/assets/client-desjardins.webp" };
const taverne = { url: "/assets/clean2-taverne.webp" };
const ekip = { url: "/assets/client-ekip-jeunesse.svg" };
const brandLoud = { url: "/assets/brand-loud.webp" };
const brandSuperGolf = { url: "/assets/brand-super-golf.webp" };
const brandHackcell = { url: "/assets/brand-hackcell.webp" };
const vergerLegault = { url: "/assets/clean-verger-legault.webp" };
const snackEnMasse = { url: "/assets/snack-en-masse.webp" };
export type CategoryId = "site-web" | "photo-video" | "automatisation" | "formation";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "site-web", label: "Site web" },
  { id: "photo-video", label: "Photo et vidéo" },
  { id: "automatisation", label: "Automatisation" },
  { id: "formation", label: "Formation" },
];

export type Client = {
  slug: string;
  name: string;
  logo: string;
  logoStyle: "transparent" | "brand" | "dark" | "round";
  logoShape: "wide" | "square";
  logoScale?: number;
  sector: string;
  categories: CategoryId[];
  website?: string;
  /** Ligne de contexte (optionnelle) */
  summary: string;
  /** Le besoin */
  context: string;
  /** Ce qu'on a fait */
  work: string;
  /** Le résultat */
  result?: string;
};

export const CLIENTS: Client[] = [
  {
    slug: "desjardins",
    name: "Desjardins",
    logo: desjardins.url,
    logoStyle: "brand",
    logoShape: "wide",
    sector: "Institution financière",
    categories: ["photo-video"],
    summary:
      "La première remise de bourses de Desjardins destinée aux CPE. Un moment qui n'arrive qu'une fois.",
    context:
      "Desjardins organisait sa toute première remise de bourses destinée aux CPE. Une soirée pensée pour souligner le travail des éducatrices de différents centres de la petite enfance, réunies dans une même salle avec les partenaires de l'événement. Une première édition, ça se prépare pendant des mois et ça se vit en quelques heures. Il fallait des images à la hauteur du moment: pour les éducatrices qui voudraient s'en souvenir, pour les partenaires qui voudraient le partager, et pour Desjardins qui voudrait le faire rayonner bien après la soirée.",
    work:
      "On a couvert la soirée au complet, en photo et en vidéo: l'accueil, les discours, la remise des bourses, les réactions, les moments entre les tables. On travaille de façon discrète, pour capter ce qui se passe sans le mettre en scène. Les images ont été livrées triées, retouchées et prêtes à diffuser, sur les réseaux, à l'interne ou dans les communications de Desjardins.",
    result:
      "Une première édition documentée comme il faut, avec des images que l'équipe peut réutiliser pour annoncer la prochaine.",
  },
  {
    slug: "anytime-fitness",
    name: "Anytime Fitness",
    logo: anytime.url,
    logoStyle: "brand",
    logoShape: "wide",
    sector: "Centre d'entraînement",
    categories: ["photo-video"],
    summary:
      "Un an d'ouverture, ça se célèbre.",
    context:
      "Un an après l'ouverture, l'équipe voulait célébrer avec ses membres, et garder une trace de ce moment-là. Une année de gym, c'est des centaines de personnes qui ont pris l'habitude de venir, une équipe qui a tenu le rythme, et une communauté qui commence à exister pour vrai. La fête du premier anniversaire était l'occasion de le montrer. Mais un événement d'un soir, sans images, disparaît le lendemain. Il fallait de quoi le faire vivre sur les réseaux, l'envoyer aux membres, et le montrer à ceux qui hésitent encore à s'inscrire.",
    work:
      "On était sur place pour capter la soirée en photo et en vidéo: l'ambiance, les membres, l'équipe, les moments spontanés. Le but n'était pas de faire des portraits posés, mais de montrer ce que ça a l'air, un gym où le monde a du plaisir à être. Les images ont été livrées prêtes à publier, en formats adaptés aux réseaux et à l'affichage en succursale.",
    result:
      "Un anniversaire qui continue de travailler pour le gym longtemps après la dernière photo.",
  },
  {
    slug: "enfin-libre",
    name: "Enfin Libre",
    logo: enfinLibre.url,
    logoStyle: "transparent",
    logoShape: "wide",
    sector: "Formation en e-commerce",
    categories: ["photo-video"],
    summary:
      "Un des plus grands mouvements francophones d'accompagnement en e-commerce, avec des milliers de membres au Canada et dans la francophonie.",
    context:
      "Enfin Libre est un des plus grands mouvements francophones d'accompagnement en e-commerce, avec des milliers de membres au Canada et dans la francophonie. Quand ils réunissent leur communauté au Québec, l'énergie dans la salle est réelle, et c'est exactement ce que la vidéo et la photo doivent transmettre à ceux qui n'y étaient pas. Ils avaient besoin d'une équipe capable de suivre le rythme d'une journée de conférences: les présentations sur scène, les échanges dans la salle, les moments de réseautage, sans jamais rien manquer.",
    work:
      "On a couvert la conférence au complet, en photo et en vidéo, du début à la fin. Sur scène pour les présentations, dans la salle pour les réactions, entre les blocs pour les rencontres. On livre du matériel pensé pour être utilisé: des photos pour les réseaux et les communications, de la vidéo pour faire vivre l'événement en ligne et donner envie d'être là la prochaine fois.",
    result:
      "Une conférence documentée avec le niveau d'énergie qu'elle avait vraiment.",
  },
  {
    slug: "le-roi-des-cartes",
    name: "Roi des Cartes",
    logo: roiDesCartes.url,
    logoStyle: "transparent",
    logoShape: "wide",
    sector: "Boutique de cartes à collectionner",
    categories: ["site-web"],
    website: "https://leroidescartes.ca/",
    summary:
      "Une boutique de cartes à collectionner à remettre au goût du jour.",
    context:
      "Une boutique de cartes à collectionner vit sur son inventaire et sur la confiance de ses clients. Roi des Cartes avait déjà une boutique Shopify, mais elle avait vieilli: la navigation était moins claire qu'elle aurait dû l'être, l'expérience ne reflétait plus le sérieux de la boutique, et pour un collectionneur qui compare plusieurs vendeurs, ces détails-là font la différence entre acheter ici ou ailleurs. Il fallait remettre la boutique au niveau, sans tout casser et sans interrompre les ventes.",
    work:
      "On a refait la boutique Shopify au complet: structure plus claire, navigation pensée pour un client qui cherche une carte précise, pages produits plus propres, et un ensemble plus rapide. Tout ça en gardant l'inventaire et le fonctionnement existant, pour que la transition se fasse sans friction pour l'équipe.",
    result:
      "Une boutique qui inspire confiance dès la première visite, plus simple à parcourir et faite pour vendre.",
  },
  {
    slug: "opelai",
    name: "OPelaï",
    logo: opelai.url,
    logoStyle: "brand",
    logoShape: "wide",
    sector: "Festival, Otterburn Park",
    categories: ["photo-video"],
    summary:
      "Le premier festival de musique électronique en bordure du Richelieu, lancé par un OBNL de la région.",
    context:
      "OPelaï, c'est le premier festival de musique électronique en bordure du Richelieu, lancé par un OBNL de la région. Une première édition, ça veut dire partir de zéro: personne ne connaît le nom, il n'y a pas d'images des années précédentes, et il faut convaincre le monde de se déplacer pour quelque chose qu'ils n'ont jamais vu. Le besoin était double: faire connaître l'événement avant qu'il arrive, et capter la journée pour que la deuxième édition parte avec de vraies images dans les mains.",
    work:
      "Avant le festival, on a produit du contenu pour les réseaux, pour donner un visage à l'événement et remplir la place. Le jour même, on était sur le site pour capter la journée en vidéo: la scène, les artistes, le public, l'ambiance au bord de l'eau. Le tout livré prêt à diffuser.",
    result:
      "Une première édition qui existe maintenant en images, et une base solide pour vendre la prochaine.",
  },
  {
    slug: "titan-diamond-tools",
    name: "Titan Diamond Tools",
    logo: titan.url,
    logoStyle: "transparent",
    logoShape: "wide",
    sector: "Outils industriels",
    categories: ["photo-video"],
    summary:
      "Des outils industriels à vendre par l'image.",
    context:
      "Dans le domaine des outils industriels, la qualité du produit se voit dans le détail. Titan Diamond Tools vend des outils spécialisés, à des clients qui savent exactement ce qu'ils cherchent et qui veulent voir le produit clairement avant d'acheter. Les photos existantes ne rendaient pas justice aux produits, et pour une entreprise qui vend en ligne et par catalogue, une mauvaise photo, c'est une vente qui n'arrive pas. Il fallait des images précises, propres, cohérentes d'un produit à l'autre.",
    work:
      "On a fait une séance photo complète des produits, avec un traitement uniforme pour que toute la gamme ait la même signature visuelle. Fond neutre, éclairage qui met les détails en valeur, angles pensés pour montrer ce que l'acheteur veut voir. Les images ont été livrées en formats prêts pour le site web, les catalogues et les fiches produits.",
    result:
      "Une gamme de produits qui a l'air aussi sérieuse qu'elle l'est.",
  },
  {
    slug: "ekip-jeunesse",
    name: "Ékip Jeunesse",
    logo: ekip.url,
    logoStyle: "transparent",
    logoShape: "square",
    logoScale: 1.3,
    sector: "Organisme jeunesse",
    categories: ["formation"],
    summary:
      "Un organisme jeunesse qui voulait prendre le contrôle de son contenu.",
    context:
      "Ékip Jeunesse voulait être présent sur les réseaux, avec du contenu photo et vidéo qui leur ressemble. Mais faire appel à une agence à chaque publication, ce n'était ni réaliste ni souhaitable pour un organisme jeunesse. Ce qu'ils voulaient, c'était devenir autonomes: comprendre comment faire une bonne photo, une bonne vidéo, un bon montage. Pas une formation générique en ligne. Quelque chose de bâti pour eux, sur place, avec leur réalité.",
    work:
      "Deux jours de formation privée sur mesure, dans leurs locaux. On a fourni tout l'équipement nécessaire pour la formation, pour qu'ils puissent apprendre sur du vrai matériel avant de décider quoi acheter. On a couvert ce dont ils avaient vraiment besoin: cadrage, lumière, prise de vue, montage simple, publication sur les réseaux. On a pratiqué sur du vrai contenu, pas sur des exemples.",
    result:
      "Ils produisent maintenant leur propre contenu, sans dépendre de personne.",
  },
  {
    slug: "taverne-du-collectionneur",
    name: "Taverne du Collectionneur",
    logo: taverne.url,
    logoStyle: "dark",
    logoShape: "wide",
    sector: "Boutique de cartes à collectionner",
    categories: ["site-web"],
    website: "https://taverneducollectionneur.com/",
    summary:
      "Une boutique spécialisée en cartes à collectionner, avec un inventaire qui bouge tous les jours.",
    context:
      "Une boutique de cartes à collectionner gère un inventaire qui change tous les jours, en magasin et en ligne en même temps. La Taverne du Collectionneur avait une boutique Shopify qui méritait une refonte: navigation moins claire qu'elle aurait dû l'être, présentation qui ne reflétait plus le sérieux de la boutique. Et pour un collectionneur qui compare plusieurs vendeurs, ces détails-là font la différence. Le tout devait continuer de rouler avec BinderPOS, le système de gestion d'inventaire de la boutique, sans rien casser dans le quotidien de l'équipe.",
    work:
      "On a refait la boutique Shopify au complet: structure plus claire, navigation pensée pour un client qui cherche une carte précise, pages produits plus propres, ensemble plus rapide. On a travaillé avec BinderPOS pour que la refonte s'intègre à ce que l'équipe utilise déjà, sans changer leurs façons de faire.",
    result:
      "Une boutique qui inspire confiance dès la première visite, plus simple à parcourir, faite pour vendre.",
  },
  {
    slug: "hackcell",
    name: "HackCell",
    logo: brandHackcell.url,
    logoStyle: "brand",
    logoShape: "wide",
    sector: "Accompagnement et coaching",
    categories: ["photo-video"],
    summary:
      "Une sortie médiatique à transformer en présence en ligne.",
    context:
      "Axel, président de HackCell, sortait de l'émission Les Traîtres. Une exposition télé, ça ouvre une fenêtre: pendant quelques semaines, beaucoup de gens cherchent votre nom, regardent ce que vous faites, et se font une idée. Si à ce moment-là il n'y a rien à trouver, ou rien qui reflète le sérieux du travail, l'attention passe et ne revient pas. Le besoin était de mettre Axel en lumière au bon moment, avec du contenu qui montre qui il est vraiment, au-delà de l'émission: son expertise, sa façon de penser, ce que HackCell fait pour ses clients.",
    work:
      "On a bâti une stratégie de contenu autour de cette sortie: les thèmes à aborder, l'ordre de publication, le ton, pour transformer la curiosité du public en intérêt réel pour HackCell. Puis on a produit les vidéos en format court, pensées pour Instagram et TikTok: tournage, montage, sous-titres, prêtes à publier au rythme de la fenêtre médiatique.",
    result:
      "Une présence en ligne qui a capté l'attention au moment où elle était là, et qui reflète le niveau d'Axel et de HackCell.",
  },
  {
    slug: "pataphil",
    name: "Pataphil",
    logo: pataphil.url,
    logoStyle: "round",
    logoShape: "square",
    logoScale: 1.9,
    sector: "Commerce",
    categories: ["site-web"],
    website: "https://www.pataphil.ca/",
    summary:
      "Une entreprise avec 46 ans d'histoire, et aucune présence en ligne pour le raconter.",
    context:
      "Pataphil, c'est 46 ans d'histoire. Une entreprise qui a traversé quatre décennies sur la force de son travail et du bouche-à-oreille, mais qui n'avait aucune présence en ligne pour le raconter. Aujourd'hui, un client qui entend parler de vous cherche votre nom sur son téléphone avant même de vous appeler. Ne rien trouver, c'est un doute qui s'installe. Il fallait un site qui fasse honneur à l'histoire de l'entreprise, sans être compliqué à gérer pour des gens qui n'ont jamais eu à le faire.",
    work:
      "On a bâti un premier site clair, à l'image de l'entreprise: qui ils sont, ce qu'ils font, comment les joindre, sans jargon et sans surcharge. On a pris le temps de leur montrer comment il fonctionne, pour qu'ils puissent le faire vivre eux-mêmes. Comme le disait la propriétaire, après 46 ans d'histoire, le résultat est à la hauteur.",
    result:
      "Une entreprise qui existe enfin en ligne, comme elle existe depuis longtemps dans son milieu.",
  },
  {
    slug: "lylou",
    name: "Lylou",
    logo: lylou.url,
    logoStyle: "transparent",
    logoShape: "square",
    sector: "Marque",
    categories: ["photo-video"],
    summary:
      "Une marque de desserts glacés qui démarre et qui doit se faire connaître.",
    context:
      "Lylou est une marque de desserts glacés qui démarre. Et une marque qui démarre a un problème simple: personne ne la connaît encore. Pour un produit gourmand, ça se joue avec des images. Un dessert glacé bien photographié, ça donne envie en une seconde. Mal photographié, ça donne rien du tout. Il fallait bâtir cette première impression visuelle à partir de zéro, avec des images qui font saliver et un style cohérent, pour que chaque publication renforce la précédente.",
    work:
      "On a produit du contenu photo et vidéo pensé pour les réseaux: les produits, les textures, les couleurs, avec une direction visuelle qui donne à la marque l'air d'exister depuis longtemps même en démarrant. Le tout livré prêt à publier.",
    result:
      "Une base d'images solide pour se faire connaître, et un style reconnaissable dès les premières publications.",
  },
  {
    slug: "verger-francois-legault",
    name: "Verger François Legault",
    logo: vergerLegault.url,
    logoStyle: "transparent",
    logoShape: "square",
    logoScale: 1.1,
    sector: "Verger, Mont-Saint-Hilaire",
    categories: ["site-web"],
    website: "https://www.vergerfrancoislegault.ca/",
    summary:
      "Un verger sur le flanc sud du mont Saint-Hilaire, spécialisé dans la Honeycrisp, où on cueille ses pommes tranquille.",
    context:
      "Sur le flanc sud du mont Saint-Hilaire, le Verger François Legault se spécialise dans la Honeycrisp et offre une cueillette tranquille, sans cohue. Mais le verger n'avait aucun site web, et son propriétaire n'avait ni le temps ni l'envie de devenir expert en numérique pour en avoir un. Le problème était concret: chaque automne, des familles cherchent un verger sur Google, comparent les options en deux minutes, et vont là où l'information est claire. Sans site, le verger passait sous le radar de gens qui l'auraient adoré.",
    work:
      "On a bâti un premier site simple, avec exactement ce qu'un visiteur veut savoir avant de se déplacer: les variétés, les dates et les heures d'ouverture, comment s'y rendre, ce qui est sur place. Rien de plus, rien de compliqué. Livré prêt à utiliser, avec une prise en main pour que le propriétaire puisse mettre à jour l'essentiel lui-même chaque saison.",
    result:
      "Un verger qui apparaît maintenant quand on le cherche, avec un site qui lui ressemble.",
  },
  {
    slug: "loud",
    name: "LOUD Conférence",
    logo: brandLoud.url,
    logoStyle: "brand",
    logoShape: "wide",
    sector: "Événement",
    categories: ["photo-video"],
    summary:
      "Une journée conférence-formation à sa première édition, sans archives, sans images.",
    context:
      "LOUD, c'est la première édition d'une journée conférence-formation où on vient se transformer: des conférences qui forment, brassent des idées, bousculent les perspectives, et laissent avec des outils concrets en culture de performance, création de contenu et storytelling de marque. Une première édition, c'est un pari: des mois de préparation, une salle à remplir, et aucune image des années précédentes pour montrer à quoi ça ressemble. Il fallait capter la première pour bâtir la deuxième.",
    work:
      "On a couvert la journée au complet en photo et en vidéo: la scène, les conférenciers, la salle, les échanges pendant les pauses, l'énergie de l'ensemble. On livre du matériel prêt à utiliser: des photos pour les réseaux et les communications, de la vidéo montée pour raconter l'événement et donner envie d'être là la prochaine fois.",
    result:
      "Une première édition qui existe en images, et une base solide pour annoncer la suivante.",
  },
  {
    slug: "super-golf",
    name: "Super Golf",
    logo: brandSuperGolf.url,
    logoStyle: "brand",
    logoShape: "wide",
    sector: "Restauration",
    categories: ["photo-video"],
    summary:
      "Un menu à mettre en valeur.",
    context:
      "Un menu, ça se lit avec les yeux avant de se lire avec les mots. Super Golf voulait des photos de ses plats qui donnent faim, pour son menu et sa présence en ligne. Le problème avec les photos de nourriture, c'est qu'elles pardonnent rien: une mauvaise lumière, un mauvais angle, et le plat le plus délicieux a l'air ordinaire. Il fallait des images qui montrent les plats tels qu'ils arrivent à la table, en mieux éclairés.",
    work:
      "On a fait une séance photo des plats sur place, avec un traitement cohérent d'un plat à l'autre pour que le menu ait une signature visuelle unifiée. Les images ont été livrées prêtes pour le menu imprimé, le site et les réseaux.",
    result:
      "Un menu qui donne envie avant même la première bouchée.",
  },
  {
    slug: "qg-du-vieux-beloeil",
    name: "Quartier Général du Vieux-Beloeil",
    logo: qgBeloeil.url,
    logoStyle: "transparent",
    logoShape: "square",
    sector: "Restaurant, Beloeil",
    categories: ["photo-video"],
    summary:
      "Un restaurant du Vieux-Beloeil avec une identité forte sur place.",
    context:
      "Le QG du Vieux-Beloeil est un restaurant qui a de la personnalité, dans un secteur où les options ne manquent pas. Sur les réseaux, un restaurant se juge en une image: si ce qu'on voit en ligne ne donne pas envie, on va ailleurs. L'équipe voulait une présence sur les réseaux à la hauteur de l'endroit, avec du contenu régulier qui montre l'ambiance, les plats, l'équipe, ce qui fait qu'on a envie d'y aller. Sans que ça leur prenne du temps qu'ils n'ont pas.",
    work:
      "On a produit du contenu photo et vidéo pensé pour nourrir leurs réseaux: les plats, l'ambiance, les moments qui donnent envie de réserver. Du contenu qui ressemble au restaurant, pas à une banque d'images. Livré prêt à publier, en formats adaptés.",
    result:
      "Une présence en ligne qui reflète enfin ce que les clients vivent sur place.",
  },
  {
    slug: "secrets-jamais-dits",
    name: "Secrets Jamais Dits",
    logo: secrets.url,
    logoStyle: "transparent",
    logoShape: "square",
    sector: "Série de contenu",
    categories: ["photo-video"],
    summary:
      "Une série de contenu produite avec MAtv, à sa deuxième saison.",
    context:
      "Secrets Jamais Dits en était à sa saison 2, produite avec MAtv. Autour de la série, il y avait des partenaires à mettre en valeur, avec des capsules à créer de A à Z. Et il y avait le contenu de la saison déjà tourné, qui méritait de vivre sur les réseaux en format court, pour que chaque épisode trouve son public. Deux besoins distincts: produire des capsules partenaires soignées, et transformer du matériel existant en reels qui accrochent.",
    work:
      "On a tourné et monté les capsules partenaires, pensées pour mettre chaque partenaire en valeur dans l'esprit de la série. En parallèle, on a monté les reels à partir des images tournées par MAtv: découpage, rythme, sous-titres, formats prêts à publier.",
    result:
      "Des partenaires bien servis, et une saison 2 qui circule sur les réseaux au lieu de rester dans la grille horaire.",
  },
  {
    slug: "agence-allies",
    name: "Agence Alliés",
    logo: allies.url,
    logoStyle: "transparent",
    logoShape: "wide",
    sector: "Agence",
    categories: ["photo-video"],
    summary:
      "Une agence qui voulait montrer son équipe et son savoir-faire.",
    context:
      "Agence Alliés voulait de la vidéo pour son site web, et montrer l'envers du décor d'un photoshoot avec ses employés. L'idée: faire voir l'équipe au travail, l'ambiance, la façon de faire, plutôt que juste le résultat final. Pour une agence, c'est souvent ça qui convainc un client: pas le portfolio, mais le sentiment de savoir avec qui on va travailler. Il fallait capter ça sans le mettre en scène.",
    work:
      "On a tourné la vidéo pour le site web, et couvert le photoshoot en behind the scenes: les préparatifs, les échanges, les moments d'équipe. Le tout monté et livré prêt à intégrer au site et à publier sur les réseaux.",
    result:
      "Une agence qui montre qui elle est, pas juste ce qu'elle produit.",
  },
  {
    slug: "garage-la-touche-finale",
    name: "Garage La Touche Finale",
    logo: garage.url,
    logoStyle: "brand",
    logoShape: "square",
    sector: "Garage",
    categories: ["site-web"],
    website: "https://garagelatouchefinale.ca/",
    summary:
      "Un garage qui roule au bouche-à-oreille, invisible pour ceux qui cherchent en ligne.",
    context:
      "Le Garage La Touche Finale roulait au bouche-à-oreille, et roulait bien. Mais il n'avait aucun site web, ce qui veut dire qu'il était invisible pour tous ceux qui cherchent un garage sur leur téléphone. Et c'est de plus en plus de monde: quelqu'un qui vient de déménager, quelqu'un dont le garage habituel est fermé, quelqu'un qui compare avant d'appeler. Sans site, ces clients-là allaient ailleurs sans même savoir que le garage existait.",
    work:
      "On a bâti un site clair qui répond aux trois questions qu'un client de garage se pose: qu'est-ce que vous faites, où êtes-vous, comment je vous rejoins. Pas de fioritures, pas de pages inutiles: l'essentiel, bien présenté, facile à trouver sur cellulaire. Livré prêt à utiliser.",
    result:
      "Un garage qui existe maintenant en ligne, pour tous ceux qui ne l'auraient jamais trouvé autrement.",
  },
  {
    slug: "garno",
    name: "Garno Photographe",
    logo: garno.url,
    logoStyle: "transparent",
    logoShape: "wide",
    logoScale: 0.92,
    sector: "Photographe",
    categories: ["photo-video"],
    summary:
      "Un photographe qui voulait montrer son processus.",
    context:
      "Garno est photographe, et préparait un photoshoot avec un DJ. Il voulait en montrer l'envers du décor: la préparation, l'ambiance, la façon de travailler. Pour un photographe, c'est un contenu précieux: ça montre le processus derrière les images, ça donne de la matière pour les réseaux, et ça fait voir aux futurs clients à quoi ressemble une séance avec lui. Mais on ne peut pas photographier et se filmer en même temps. Il fallait quelqu'un pour capter pendant qu'il travaillait.",
    work:
      "On a couvert le photoshoot en vidéo, en mode behind the scenes: discret, en mouvement, sans jamais interférer avec la séance. Le tout monté et livré prêt à publier.",
    result:
      "Un contenu qui montre le photographe au travail, et qui vend son approche mieux qu'une description.",
  },
  {
    slug: "cracheur-de-feu",
    name: "Le Cracheur de Feu",
    logo: cracheur.url,
    logoStyle: "transparent",
    logoShape: "square",
    sector: "Restaurant, Beloeil",
    categories: ["photo-video"],
    summary:
      "Une smokehouse au bord de la rivière Richelieu, avec une terrasse à trois paliers et une vue sur le mont Saint-Hilaire.",
    context:
      "Le Cracheur de Feu est une smokehouse au bord de la rivière Richelieu, avec une terrasse à trois paliers et une vue directe sur le mont Saint-Hilaire. L'été, cette terrasse-là est l'atout numéro un du restaurant. Le besoin était simple à dire, moins simple à faire: la remplir tout l'été. Ça passe par les réseaux, avec du contenu qui montre ce que les gens viennent chercher: la vue, l'ambiance, un verre au soleil au bord de l'eau. Il fallait que le monde ait envie d'y être avant même d'y avoir mis les pieds.",
    work:
      "On a produit du contenu photo et vidéo pour les réseaux, centré sur ce qui fait venir le monde: la terrasse, la vue, l'ambiance, les plats qui sortent du fumoir. Du contenu régulier, prêt à publier, pensé pour donner envie de réserver.",
    result:
      "Une terrasse qui existe en ligne comme elle existe sur place.",
  },
  {
    slug: "piment-szechuan",
    name: "Le Piment Szechuan",
    logo: piment.url,
    logoStyle: "transparent",
    logoShape: "wide",
    logoScale: 1.05,
    sector: "Restaurant, McMasterville",
    categories: ["site-web"],
    website: "https://lepimentszechuan.com/",
    summary:
      "Une institution de la cuisine sichuanaise sur la Rive-Sud, qui affiche complet les soirs de fin de semaine.",
    context:
      "Le Piment Szechuan est une institution de la cuisine sichuanaise sur la Rive-Sud, qui affiche complet les soirs de fin de semaine. Mais son site web datait, et il ne reflétait plus l'expérience qu'on vit sur place. En plus, la commande en ligne était moins simple qu'elle aurait dû l'être, alors que c'est un canal de vente à part entière pour un restaurant. Le double besoin: un site qui donne envie de réserver, et une commande en ligne qu'on trouve et qu'on complète en quelques clics.",
    work:
      "On a refait le site au complet, avec deux priorités: montrer le restaurant tel qu'il est aujourd'hui, et rendre la commande en ligne évidente dès la première page. Structure claire, navigation simple sur cellulaire, et une prise en main pour que l'équipe puisse mettre le menu à jour elle-même.",
    result:
      "Un site qui travaille pour le restaurant, en salle comme en livraison.",
  },
  {
    slug: "snack-en-masse",
    name: "Snack en Masse",
    logo: snackEnMasse.url,
    logoStyle: "brand",
    logoShape: "wide",
    sector: "Bonbons exotiques",
    categories: ["photo-video"],
    summary:
      "Des boîtes thématiques de bonbons exotiques, photographiées pour donner envie d'ouvrir.",
    context:
      "Snack en Masse est une startup qui propose des bonbons exotiques dans des boîtes thématiques, pensées comme des expériences à partager. Pour un produit gourmand et visuel, les images font tout: une bonne photo de bonbons colorés dans une belle boîte, ça donne envie immédiatement. Une mauvaise photo, et le produit a l'air banal. L'entreprise avait besoin d'images qui montrent à la fois le produit et l'expérience: ce que contient la boîte, comment elle s'ouvre, l'ambiance autour.",
    work:
      "On a fait une séance photo produits et lifestyle: les boîtes seules, les bonbons à l'intérieur, les mains qui découvrent le contenu, les moments de dégustation. Le tout dans un traitement lumineux et coloré qui correspond à l'identité de la marque, avec des images livrées prêtes pour le site, les réseaux et les publicités.",
    result:
      "Une base d'images qui donne envie d'ouvrir la boîte avant même d'y avoir touché.",
  },
];

export function getClient(slug: string) {
  return CLIENTS.find((c) => c.slug === slug);
}

/** Photo « teaser » affichée sur la page détail (facultatif) */
export const CLIENT_COVERS: Record<string, { url: string; alt: string }> = {
  desjardins: { url: coverDesjardins.url, alt: "Remise de bourses Desjardins captée par Norvika" },
  "anytime-fitness": { url: coverAnytime.url, alt: "Fête du premier anniversaire chez Anytime Fitness" },
  "enfin-libre": { url: coverEnfinLibre.url, alt: "Conférence Enfin Libre sur scène" },
  "titan-diamond-tools": { url: coverTitan.url, alt: "Lame diamantée Titan Diamond Tools en studio" },
  lylou: { url: coverLylou.url, alt: "Enfant avec un popsicle chez Lylou desserts glacés" },
  loud: { url: coverLoud.url, alt: "Conférencier sur scène lors d'un événement LOUD" },
  "super-golf": { url: coverSuperGolf.url, alt: "Burgers et frites du menu Super Golf" },
  "qg-du-vieux-beloeil": { url: coverQg.url, alt: "Extraction d'espresso au QG du Vieux Beloeil" },
  "cracheur-de-feu": { url: coverCracheur.url, alt: "Verre de vin et plats au Cracheur de feu" },
};

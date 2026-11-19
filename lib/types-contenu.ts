/**
 * La forme du contenu lu dans Sanity (voir lib/contenu.ts pour la requête). Fichier sans
 * dépendance serveur : les composants « client » importent ces types.
 */

export type Image = {
  url: string;
  alt?: string | null;
  largeur?: number | null;
  hauteur?: number | null;
  hotspot?: { x: number; y: number } | null;
};

export type Lien = { libelle: string; lien: string };
export type Carte = { titre: string; texte: string };
export type Etape = { titre: string; libelle?: string | null; texte: string };

export type Seo = {
  seoTitre: string;
  seoDescription: string;
  partageTitre?: string | null;
  partageDescription?: string | null;
  partageImage?: Image | null;
};

/** Un document de page : ses champs Google, et sa date de dernière modification (sitemap). */
export type DocumentPage = Seo & { _updatedAt: string };

export type SectionListe = { afficher?: boolean | null; titre: string; phrases: string[] };
export type SectionCartes = { afficher?: boolean | null; titre: string; cartes: Carte[] };
export type SectionEtapes = { afficher?: boolean | null; titre: string; etapes: Etape[] };

/* ---------------------------------------------------------------- global */

export type Parametres = {
  nom: string;
  /** Affiché après le © du pied de page. */
  nomLegal: string;
  description: string;
  courriel: string;
  telephone: string;
  lienRendezVous: string;
  lienPortfolio: string;
  zonesDesservies: { type: string; nom: string }[];
  typesDeService: string[];
  fondateurs: string[];
  noteGoogle: string;
  nombreAvisGoogle: string;
  seoTitreDefaut: string;
  seoDescriptionDefaut: string;
  imagePartage: Image;
  logoEntete: Image;
  logoPied: Image;
};

export type Navigation = {
  liensMenu: Lien[];
  boutonRendezVous: string;
  boutonQuiz: string;
  /** Premier lien du fil d'Ariane, et nom de l'accueil dans le plan du site. */
  filArianeAccueil: string;
  /** Nom du fil d'Ariane annoncé par les lecteurs d'écran. */
  filArianeLibelle: string;
  /** Lu avant le numéro de la barre du haut par les lecteurs d'écran (« Appeler Norvika au »). */
  enteteTelephone: string;
  /** Libellés lus par les lecteurs d'écran (invisibles à l'écran). */
  menuOuvrir: string;
  /** Le même bouton, menu ouvert (« Fermer le menu »). */
  menuFermer: string;
  /** Premier lien de chaque page, visible au clavier seulement (« Aller au contenu »). */
  lienEvitement: string;
  ongletsServices: string;
  basculeComparer: string;
  basculeImageAvant: string;
  basculeImageApres: string;
  videoLire: string;
  etapeLibelle: string;
  basculeAvant: string;
  basculeApres: string;
  piedTitreServices: string;
  piedTitreContact: string;
  piedLiensContact: Lien[];
  /** Après « © année nom légal », en bas du pied de page (facultatif). */
  piedMention?: string | null;
  piedPolitique: string;
  piedPlanDuSite: string;
  suiteTitre: string;
  suitePages: (Carte & { lien: string })[];
};

export type BlocContact = {
  titre: string;
  texte: string;
  lienTexte: string;
  apresLien: string;
  champNom: string;
  champCourriel: string;
  champMessage: string;
  bouton: string;
  boutonEnvoi: string;
  merciTitre: string;
  merciTexte: string;
};

export type Page404 = {
  /** Titre de l'onglet du navigateur sur la page introuvable. */
  onglet: string;
  titre: string;
  texte: string;
  boutonAccueil: string;
  boutonRealisations: string;
  realisationTitre: string;
  realisationBouton: string;
  realisationOnglet: string;
};

/** Un service tel que listé sur l'accueil et dans les onglets des pages de services. */
export type ServiceResume = { nom: string; chemin: string; accroche: string; detail: string };

/** Ce que toutes les pages partagent : passé une fois par app/layout.tsx (ContenuGlobal). */
export type ContenuGlobal = {
  parametres: Parametres;
  navigation: Navigation;
  blocContact: BlocContact;
  page404: Page404;
  services: ServiceResume[];
  /** L'année du © au pied de page, calculée au moment de la construction (heure du Québec). */
  annee: number;
  /** Le lien du pied de page vers le vérificateur Loi 25 (son texte vit dans la page du vérificateur). */
  lienVerificateur: string;
};

/* ---------------------------------------------------------------- réalisations */

export type CategorieId = "site-web" | "photo-video" | "automatisation" | "formation";

export type AvantApres = {
  avant: string;
  avant2x?: string | null;
  apres: string;
  apres2x?: string | null;
  alt: string;
  adresse: string;
  legende?: string | null;
};

export type Realisation = {
  _updatedAt: string;
  slug: string;
  nom: string;
  secteur: string;
  categories: CategorieId[];
  siteWeb?: string | null;
  resume: string;
  besoin: string;
  mandat: string;
  resultat?: string | null;
  logo: Image;
  logoStyle: "transparent" | "brand" | "dark" | "round";
  logoForme: "wide" | "square";
  logoEchelle?: number | null;
  couverture?: Image | null;
  avantApres?: AvantApres | null;
  video?: { youtubeId: string; titre: string; legende: string; format?: "vertical" | "horizontal" | null } | null;
};

/* ---------------------------------------------------------------- pages */

export type PageService = DocumentPage & {
  nom: string;
  schemaNom: string;
  schemaType: string;
  h1: string;
  heroTexte: string;
};

export type PageSitesWeb = PageService & { reconnaissez: SectionListe; parcours: SectionEtapes; differemment: SectionCartes };
export type PageAutomatisation = PageService & {
  reconnaissez: SectionListe;
  parcours: SectionEtapes;
  differemment: SectionCartes;
  exemple: { afficher?: boolean | null; titre: string; texte: string };
};
export type PagePhotoVideo = PageService & {
  heroLienTexte?: string | null;
  reconnaissez: SectionListe;
  capte: SectionCartes;
  parcours: SectionEtapes;
  differemment: SectionCartes;
  tournage: { afficher?: boolean | null; photo: Image; titre: string; texte: string };
};
export type PageFormation = PageService & {
  reconnaissez: SectionListe;
  gains: SectionCartes;
  enseigne: { afficher?: boolean | null; titre: string; libelleApres: string; liste: { titre: string; texte: string; apres: string }[] };
  parcours: SectionEtapes;
  differemment: SectionCartes;
};

export type Avis = { _updatedAt: string; nom: string; contexte: string; signature: string; accroche: string; suite: string[] | null; extraitGoogle?: string | null };

/** La vidéo de fond du haut de l'accueil. Tout est facultatif : sans vidéo ni image, le fond reste uni. */
export type FondVideo = {
  afficher?: boolean | null;
  /** Adresses des fichiers MP4 (cdn.sanity.io). */
  ordinateur?: string | null;
  mobile?: string | null;
  affiche?: Image | null;
  boutonPause?: string | null;
  boutonLecture?: string | null;
};

export type PageAccueil = DocumentPage & {
  h1: string;
  heroTexte: string;
  heroBoutonSecondaire: string;
  heroVideo?: FondVideo | null;
  videos: { afficher?: boolean | null; titre: string; sousTitre: string; bouton: string; liste: { youtubeId: string; titre: string; fiche?: string | null }[] };
  avantApres: { afficher?: boolean | null; titre: string; sousTitre: string; texte: string; bouton: string; realisation: { slug: string; avantApres: AvantApres } };
  quiz: { afficher?: boolean | null; titre: string; texte: string };
  logos: { afficher?: boolean | null; titre: string; lien: string; liste: { nom: string; logoStyle: string; logo: Image }[] };
  services: { afficher?: boolean | null; titre: string; ouvrir: string; fermer: string; lienPage: string };
  parcours: { afficher?: boolean | null; titre: string; etapes: Etape[] };
  fondateurs: { afficher?: boolean | null; titre: string; texte: string; legende: string; photo: Image; citation: string };
  avis: { afficher?: boolean | null; titre: string; etoiles: string; note: string };
};

type Reponse = { libelle: string; miroir: string; points: number };
export type Profil = { titre: string; miroir: string; bonneNouvelle: string; suite: string; volet: string; lien: string };

export type PageDiagnostic = DocumentPage & {
  nom: string;
  h1: string;
  intro: string;
  boutonDebut: string;
  encouragement: string;
  boutonRetour: string;
  questions: { question: string; precision?: string | null; reponses: Reponse[] }[];
  barreSite: string;
  barreTemps: string;
  barreImage: string;
  noteHaute: string;
  noteMoyenne: string;
  noteBasse: string;
  carteMiroir: string;
  carteBonneNouvelle: string;
  carteSuite: string;
  profilSite: Profil;
  profilTemps: Profil;
  profilImage: Profil;
  profilAucun: Profil;
  formTitre: string;
  formTexte: string;
  formNom: string;
  formCourriel: string;
  formBouton: string;
  formNote: string;
  merciTitre: string;
  merciTexte: string;
  boutonApproche: string;
  boutonRefaire: string;
};

export type Membre = { _updatedAt: string; nom: string; role: string; photo?: Image | null; texte: string };

export type PageEquipe = DocumentPage & {
  nom: string;
  h1: string;
  intro: string;
  origine: { afficher?: boolean | null; titre: string; texte: string[] };
  quiFaitQuoi: { afficher?: boolean | null; titre: string; photoAVenir: string };
  ensemble: { afficher?: boolean | null; photo: Image; titre: string; texte: string };
  croyances: SectionCartes;
  conclusion: { afficher?: boolean | null; titre: string; texte: string };
};

export type PageRealisations = DocumentPage & {
  nom: string;
  h1: string;
  h1Accent: string;
  intro: string;
  filtreTout: string;
  categories: { siteWeb: string; photoVideo: string; automatisation: string; formation: string };
  aucun: string;
  portfolio: { afficher?: boolean | null; titre: string; bouton: string };
  ficheSite: string;
  ficheBesoinTitre: string;
  ficheApercu: string;
  ficheApercuBouton: string;
  ficheMandatTitre: string;
  ficheResultat: string;
  ficheAppel: string;
  ficheOnglet: string;
};

export type PageContact = DocumentPage & {
  nom: string;
  h1: string;
  intro: string;
  libelleCourriel: string;
  libelleTelephone: string;
  libelleRendezVous: string;
  lienRendezVous: string;
  champNom: string;
  champCourriel: string;
  champTelephone: string;
  champMessage: string;
  bouton: string;
  boutonEnvoi: string;
  merciTitre: string;
  merciTexte: string;
};

export type PagePlanDuSite = DocumentPage & {
  h1: string;
  intro: string;
  titrePages: string;
  titreRealisations: string;
};

export type PageBienvenue = DocumentPage & {
  h1: string;
  intro: string;
  formTitre: string;
  champPrenom: string;
  champCourriel: string;
  champTelephone: string;
  bouton: string;
  boutonEnvoi: string;
  merciTitre: string;
  merciTexte: string;
  outils: { afficher?: boolean | null; titre: string; texte: string; liste: Carte[]; propriete: string };
  etapes: { afficher?: boolean | null; titre: string; liste: Carte[] };
  paiement: { afficher?: boolean | null; titre: string; texte: string };
  contact: { afficher?: boolean | null; titre: string; texte: string; libelleCourriel: string; libelleTelephone: string };
};

/** Une section s'affiche sauf si l'interrupteur « Afficher cette section » est décoché. */
export const visible = (s: { afficher?: boolean | null } | null | undefined): boolean => !!s && s.afficher !== false;

/** Position du point focal d'une image, pour object-position (repli : la valeur d'avant). */
export function positionFocale(image: Image | null | undefined, repli: string): string {
  const h = image?.hotspot;
  return h ? `${Math.round(h.x * 1000) / 10}% ${Math.round(h.y * 1000) / 10}%` : repli;
}

/** Les filtres des réalisations, dans l'ordre d'avant, avec les noms du Studio. */
export function categories(page: PageRealisations): { id: CategorieId; label: string }[] {
  return [
    { id: "site-web", label: page.categories.siteWeb },
    { id: "photo-video", label: page.categories.photoVideo },
    { id: "automatisation", label: page.categories.automatisation },
    { id: "formation", label: page.categories.formation },
  ];
}

/* ---------------------------------------------------------------- vérificateur Loi 25 */

/** Les textes d'une vérification : nom, pourquoi, article, puis un texte par cas (voir lib/verificateur/types.ts). */
export type TextesVerification = { nom: string; pourquoi: string; article: string } & Record<string, string | undefined>;

export type PageVerificateur = DocumentPage & {
  nom: string;
  h1: string;
  intro: string;
  introRisque?: string | null;
  champLibelle: string;
  champExemple: string;
  bouton: string;
  mentionCollecte: string;
  mentionLien: string;
  listeTitre: string;
  invisibleTitre: string;
  invisibleTexte: string;
  invisibleListe: string[];
  avertissement: string[];
  appelTitre: string;
  appelTexte: string;
  appelTexteSansCorrection: string;
  appelBouton: string;
  analyseTitre: string;
  analyseTexte: string;
  analyseEtapes: string[];
  analyseAnnonce: string;
  erreurAdresse: string;
  erreurPrivee: string;
  erreurInjoignable: string;
  erreurRefusee: string;
  erreurDelai: string;
  erreurLimite: string;
  erreurAntiRobot: string;
  erreurIndisponible: string;
  etatACorriger: string;
  etatAVerifier: string;
  etatEnPlace: string;
  synthese: string;
  corrigerAucun: string;
  corrigerUn: string;
  corrigerPlusieurs: string;
  verifierAucun: string;
  verifierPlusieurs: string;
  enPlaceAucun: string;
  enPlacePlusieurs: string;
  avertissementCourt: string;
  phraseCorriger: string;
  phraseVerifier: string;
  phraseTout: string;
  phrasePartielle: string;
  phraseRedirection: string;
  politiqueIllisible: string;
  libellePourquoi: string;
  libelleTemoins: string;
  libelleDomaines: string;
  droitAcces: string;
  droitRectification: string;
  droitRetrait: string;
  piedResultat: string;
  boutonRefaire: string;
  temoins: TextesVerification;
  banniere: TextesVerification;
  politique: TextesVerification;
  responsable: TextesVerification;
  transfert: TextesVerification;
  droits: TextesVerification;
  tiers: TextesVerification;
  https: TextesVerification;
  blocSitesWeb: { afficher?: boolean | null; titre: string; texte: string; bouton: string };
  lienPied: string;
};

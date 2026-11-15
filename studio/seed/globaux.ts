/**
 * Contenu de départ des documents uniques communs à toutes les pages.
 * SOURCE : le texte en ligne sur norvika.ca le 2026-11-14 (code de la branche next16-migration,
 * commit 73cf3df), repris MOT POUR MOT. Toute différence avec le site d'avant est un défaut.
 */
import { cles, img, type Document } from './outils'

export const parametres: Document = {
  _id: 'parametres',
  _type: 'parametres',
  nom: 'Norvika',
  description: 'Présence numérique pour les entreprises et les travailleurs autonomes.',
  courriel: 'info@norvika.ca',
  telephone: '438 522 4275',
  lienRendezVous: 'https://calendar.app.google/W5SS5UmnJCTLXhw8A',
  lienPortfolio: 'https://norvika.myportfolio.com/',
  zonesDesservies: cles(
    [
      { type: 'City', nom: 'Québec' },
      { type: 'Place', nom: 'Rive-Sud de Montréal' },
      { type: 'AdministrativeArea', nom: 'Montérégie' },
      { type: 'AdministrativeArea', nom: 'Québec' },
    ],
    'zone',
  ),
  typesDeService: ['Création de sites web', 'Automatisation', 'Photo et vidéo', 'Formation'],
  fondateurs: ['Laurianne Plouffe', 'William Simard'],
  noteGoogle: '5.0',
  nombreAvisGoogle: '6',
  seoTitreDefaut: 'Norvika · Vos courtiers des outils numériques',
  seoDescriptionDefaut:
    'Sites web, automatisation, photo et vidéo pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province. On comprend votre réalité, puis on bâtit une offre qui vous ressemble.',
  imagePartage: img('public/assets/lau-et-will-2.webp', 'Laurianne Plouffe et William Simard, fondateurs de Norvika'),
  logoEntete: img('public/assets/norvika-horizontal.svg', 'Norvika'),
  logoPied: img('public/assets/norvika-stack.svg', 'Norvika'),
}

export const navigation: Document = {
  _id: 'navigation',
  _type: 'navigation',
  liensMenu: cles(
    [
      { libelle: 'Sites web', lien: '/sites-web' },
      { libelle: 'Automatisation', lien: '/automatisation' },
      { libelle: 'Photo et vidéo', lien: '/photo-et-video' },
      { libelle: 'Formation', lien: '/formation' },
      { libelle: 'Réalisations', lien: '/realisations' },
      { libelle: "L'équipe", lien: '/equipe' },
    ],
    'lienMenu',
  ),
  boutonRendezVous: 'Réserver mes 30 minutes',
  boutonQuiz: 'Faire le quiz',
  filArianeAccueil: 'Accueil',
  piedTitreServices: 'Services',
  piedTitreContact: 'Contact',
  piedLiensContact: cles(
    [
      { libelle: 'Nous écrire', lien: '/contact' },
      { libelle: 'Diagnostic gratuit', lien: '/diagnostic' },
    ],
    'lienMenu',
  ),
  piedDroits: '© 2026 Norvika · Québec et Rive-Sud de Montréal',
  piedDroitsCourt: '© 2026 Norvika',
  piedPolitique: 'Politique de confidentialité',
  suiteTitre: 'Continuer la visite',
  suitePages: cles(
    [
      { titre: 'Sites web', texte: 'Un site clair, bâti sur mesure, qui vous appartient.', lien: '/sites-web' },
      { titre: 'Automatisation', texte: 'Reprendre les heures que vos tâches répétitives vous prennent.', lien: '/automatisation' },
      { titre: 'Photo et vidéo', texte: "Des images qui montrent votre entreprise telle qu'elle est.", lien: '/photo-et-video' },
      { titre: 'Formation', texte: "On forme votre équipe sur place, pour qu'elle soit autonome.", lien: '/formation' },
      { titre: 'Réalisations', texte: "Les entreprises d'ici qui nous font confiance, et ce qu'on a fait.", lien: '/realisations' },
      { titre: "L'équipe", texte: 'Laurianne et William, et notre façon de travailler.', lien: '/equipe' },
    ],
    'cartePage',
  ),
}

export const blocContact: Document = {
  _id: 'blocContact',
  _type: 'blocContact',
  titre: 'On regarde votre cas, gratuitement.',
  texte:
    'Dites-nous en deux lignes ce qui vous freine. On vous revient vite, par courriel ou par téléphone, avec une première piste concrète. Vous préférez un appel tout de suite ?',
  lienTexte: 'Réservez vos 30 minutes',
  apresLien: '.',
  champNom: 'Nom',
  champCourriel: 'Courriel',
  champMessage: 'En quelques mots, ce qui vous freine',
  bouton: 'Envoyer',
  boutonEnvoi: 'Envoi en cours…',
  merciTitre: 'Merci, votre message est parti.',
  merciTexte: 'On vous revient rapidement, par courriel ou par téléphone.',
}

export const page404: Document = {
  _id: 'page404',
  _type: 'page404',
  surtitre: 'Erreur 404',
  titre: "Cette page n'existe pas.",
  texte: "Elle a peut-être été déplacée ou renommée. Reprenez à l'accueil, ou regardez ce qu'on fait pour d'autres entreprises d'ici.",
  boutonAccueil: "Retour à l'accueil",
  boutonRealisations: 'Voir nos réalisations',
  realisationTitre: "Cette réalisation n'existe pas.",
  realisationBouton: 'Retour aux réalisations',
  realisationOnglet: 'Réalisation introuvable | Norvika',
}


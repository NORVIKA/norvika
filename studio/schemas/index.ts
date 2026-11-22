import { avis, membre, realisation } from './collections'
import { blocContact, navigation, page404, parametres } from './globaux'
import {
  pageAccueil,
  pageAutomatisation,
  pageBienvenue,
  pageContact,
  pageDiagnostic,
  pageEquipe,
  pageFormation,
  pagePhotoVideo,
  pagePlanDuSite,
  pageRealisations,
  pageSitesWeb,
} from './pages'
import { appliquerGardes } from './regles'
import { pageVerificateurLoi25 } from './verificateur'

/** Tous les types du Studio, avec les gardes de contenu posées sur chaque champ de texte. */
export const typesDuSchema = appliquerGardes([
  pageAccueil,
  pageSitesWeb,
  pageAutomatisation,
  pagePhotoVideo,
  pageFormation,
  pageDiagnostic,
  pageVerificateurLoi25,
  pageEquipe,
  pageRealisations,
  pageContact,
  pagePlanDuSite,
  pageBienvenue,
  page404,
  parametres,
  navigation,
  blocContact,
  realisation,
  membre,
  avis,
])

/**
 * Un seul exemplaire de ces documents : ni création, ni suppression, ni duplication, ni dépublication.
 * L'identifiant du document est le nom de son type (ex. : « pageAccueil »).
 * Les pages se créent et se suppriment avec Norvika (adresse, redirections, menu).
 */
export const SANS_CREATION = [
  'pageAccueil',
  'pageSitesWeb',
  'pageAutomatisation',
  'pagePhotoVideo',
  'pageFormation',
  'pageDiagnostic',
  'pageVerificateurLoi25',
  'pageEquipe',
  'pageRealisations',
  'pageContact',
  'pagePlanDuSite',
  'pageBienvenue',
  'page404',
  'parametres',
  'navigation',
  'blocContact',
]

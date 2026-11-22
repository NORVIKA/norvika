/**
 * Le menu du Studio, dans l'ordre où on pense au site : l'accueil, les services, les autres pages,
 * puis ce qui se répète (réalisations, équipe, avis), puis ce qui revient sur toutes les pages.
 */
import { CaseIcon } from '@sanity/icons/Case'
import { CommentIcon } from '@sanity/icons/Comment'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { DocumentsIcon } from '@sanity/icons/Documents'
import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { FolderIcon } from '@sanity/icons/Folder'
import { HomeIcon } from '@sanity/icons/Home'
import { InfoOutlineIcon } from '@sanity/icons/InfoOutline'
import { MenuIcon } from '@sanity/icons/Menu'
import { SearchIcon } from '@sanity/icons/Search'
import { StarIcon } from '@sanity/icons/Star'
import { UserIcon } from '@sanity/icons/User'
import { UsersIcon } from '@sanity/icons/Users'
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import type { ComponentType } from 'react'
import type { StructureBuilder, StructureResolver } from 'sanity/structure'

/** Un document unique : l'identifiant est le nom du type. */
const unique = (S: StructureBuilder, type: string, titre: string, icone: ComponentType) =>
  S.listItem().id(type).title(titre).icon(icone).child(S.document().schemaType(type).documentId(type).title(titre))

/** Une liste triée par « Ordre d'affichage ». */
const enOrdre = (S: StructureBuilder, type: string, titre: string, icone: ComponentType) =>
  S.listItem().id(type).title(titre).icon(icone).child(S.documentTypeList(type).title(titre).defaultOrdering([{ field: 'ordre', direction: 'asc' }]))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenu du site')
    .items([
      unique(S, 'pageAccueil', 'Accueil', HomeIcon),
      S.listItem()
        .id('services')
        .title('Pages de services')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Pages de services')
            .items([
              unique(S, 'pageSitesWeb', 'Sites web', DocumentTextIcon),
              unique(S, 'pageAutomatisation', 'Automatisation', DocumentTextIcon),
              unique(S, 'pagePhotoVideo', 'Photo et vidéo', DocumentTextIcon),
              unique(S, 'pageFormation', 'Formation', DocumentTextIcon),
            ]),
        ),
      S.listItem()
        .id('realisations')
        .title('Réalisations')
        .icon(CaseIcon)
        .child(
          S.list()
            .title('Réalisations')
            .items([enOrdre(S, 'realisation', 'Fiches des clients', CaseIcon), unique(S, 'pageRealisations', 'Textes de la page Réalisations', DocumentTextIcon)]),
        ),
      S.listItem()
        .id('equipe')
        .title('L’équipe')
        .icon(UsersIcon)
        .child(S.list().title('L’équipe').items([enOrdre(S, 'membre', 'Membres de l’équipe', UserIcon), unique(S, 'pageEquipe', 'Textes de la page L’équipe', DocumentTextIcon)])),
      enOrdre(S, 'avis', 'Avis Google', StarIcon),
      S.listItem()
        .id('autres-pages')
        .title('Autres pages')
        .icon(FolderIcon)
        .child(
          S.list()
            .title('Autres pages')
            .items([
              unique(S, 'pageDiagnostic', 'Diagnostic (quiz)', SearchIcon),
              unique(S, 'pageVerificateurLoi25', 'Vérificateur Loi 25', CheckmarkCircleIcon),
              unique(S, 'pageContact', 'Contact', EnvelopeIcon),
              unique(S, 'pagePlanDuSite', 'Plan du site', DocumentTextIcon),
              unique(S, 'pageBienvenue', 'Bienvenue (nouveaux clients)', DocumentTextIcon),
              unique(S, 'page404', 'Page introuvable', DocumentTextIcon),
            ]),
        ),
      S.divider(),
      unique(S, 'blocContact', 'Bloc de contact (bas de chaque page)', CommentIcon),
      unique(S, 'navigation', 'Menu et pied de page', MenuIcon),
      unique(S, 'parametres', 'Infos de l’entreprise', InfoOutlineIcon),
    ])


/**
 * Contenu de départ des réalisations et de la page Réalisations.
 * SOURCE des fiches : realisations.json, COPIE MACHINE de lib/realisations.ts (aucune
 * retranscription à la main). Les libellés de la page et des fiches viennent de
 * app/realisations/Content.tsx et app/realisations/[slug]/Content.tsx, MOT POUR MOT.
 */
import { TITRES_PROTEGES } from '../titres-proteges'
import { img, type Document } from './outils'
import donnees from './realisations.json'

type Client = {
  slug: string
  name: string
  logo: string
  logoStyle: string
  logoShape: string
  logoScale?: number
  sector: string
  categories: string[]
  website?: string
  summary: string
  context: string
  work: string
  result?: string
  avantApres?: { avant: string; avant2x?: string; apres: string; apres2x?: string; alt: string; legende: string }
  video?: { youtubeId: string; titre: string; legende: string; format?: string }
}

const fichier = (url: string) => `public${url}`
const couvertures = donnees.CLIENT_COVERS as Record<string, { url: string; alt: string }>

export const realisations: Document[] = (donnees.CLIENTS as Client[]).map((c, i) => {
  const couverture = couvertures[c.slug]
  return {
    _id: `realisation-${c.slug}`,
    _type: 'realisation',
    nom: c.name,
    slug: { _type: 'slug', current: c.slug },
    ordre: i + 1,
    secteur: c.sector,
    categories: c.categories,
    ...(c.website ? { siteWeb: c.website } : {}),
    resume: c.summary,
    besoin: c.context,
    mandat: c.work,
    ...(c.result ? { resultat: c.result } : {}),
    logo: img(fichier(c.logo)),
    logoStyle: c.logoStyle,
    logoForme: c.logoShape,
    ...(c.logoScale !== undefined ? { logoEchelle: c.logoScale } : {}),
    ...(couverture ? { couverture: img(fichier(couverture.url), couverture.alt) } : {}),
    ...(c.avantApres
      ? {
          avantApres: {
            avant: img(fichier(c.avantApres.avant)),
            ...(c.avantApres.avant2x ? { avant2x: img(fichier(c.avantApres.avant2x)) } : {}),
            apres: img(fichier(c.avantApres.apres)),
            ...(c.avantApres.apres2x ? { apres2x: img(fichier(c.avantApres.apres2x)) } : {}),
            alt: c.avantApres.alt,
            // L'adresse affichée dans la barre de la bascule était écrite dans le composant
            // (components/site/BasculeAvantApres.tsx) : la seule bascule du site est celle de CrossFit.
            adresse: 'crossfitsaintefoy.com',
            legende: c.avantApres.legende,
          },
        }
      : {}),
    ...(c.video
      ? { video: { youtubeId: c.video.youtubeId, titre: c.video.titre, legende: c.video.legende, ...(c.video.format ? { format: c.video.format } : {}) } }
      : {}),
  }
})

const libelle = (id: string) => (donnees.CATEGORIES as { id: string; label: string }[]).find((c) => c.id === id)!.label

export const pageRealisations: Document = {
  _id: 'pageRealisations',
  _type: 'pageRealisations',
  seoTitre: TITRES_PROTEGES.pageRealisations.seoTitre,
  nom: 'Réalisations',
  surtitre: 'Réalisations',
  h1: TITRES_PROTEGES.pageRealisations.h1.h1,
  h1Accent: TITRES_PROTEGES.pageRealisations.h1.h1Accent,
  intro: 'Filtrez par service et cliquez sur un logo pour voir ce que nous avons fait pour ce client.',
  filtreTout: 'Tout',
  categories: {
    siteWeb: libelle('site-web'),
    photoVideo: libelle('photo-video'),
    automatisation: libelle('automatisation'),
    formation: libelle('formation'),
  },
  aucun: 'Aucune réalisation dans cette catégorie pour le moment.',
  portfolio: { afficher: true, titre: 'Notre portfolio photo et vidéo complet', bouton: 'Voir le portfolio' },
  ficheSite: 'Visiter le site',
  ficheBesoinSurtitre: '01 · Le point de départ',
  ficheBesoinTitre: 'Le besoin',
  ficheApercu: 'Un aperçu du mandat.',
  ficheApercuBouton: 'Voir le portfolio complet',
  ficheMandatSurtitre: '02 · Notre mandat',
  ficheMandatTitre: "Ce qu'on a fait",
  ficheResultat: 'Le résultat',
  ficheAppel: 'Un projet comme celui-ci?',
  ficheOnglet: '| Réalisations Norvika',
  seoDescription:
    'Les entreprises de la ville de Québec, de la Rive-Sud de Montréal et de partout en province qui nous font confiance : sites web, photo et vidéo, automatisation et formation. Cliquez sur un logo pour voir le mandat.',
  partageDescription:
    'Les entreprises de la ville de Québec, de la Rive-Sud de Montréal et de partout en province qui nous font confiance : sites web, photo et vidéo, automatisation et formation.',
}

/**
 * TITRES PROTÉGÉS de norvika.ca. Règle Norvika du 2026-10-07 (SKILL_ADMIN) : double vérification,
 * sans jamais bloquer (le propriétaire du site garde la main).
 *   1. le titre Google et le grand titre (H1) sont en lecture seule tant que la case
 *      « Déverrouiller les titres » n'est pas cochée ;
 *   2. un avertissement jaune s'affiche si le titre diffère de celui-ci (la publication reste permise).
 *
 * Toutes les pages publiques sont protégées : aucune donnée de Search Console n'a été relevée pour
 * norvika.ca, donc aucune page n'est présumée sans visites. Valeurs = titres en ligne le 2026-11-14,
 * avant l'import dans Sanity. Le semis (scripts/semer.ts) lit ses titres ICI : déclarés une fois.
 *
 * Fichier en TypeScript pur, sans import de `sanity` : il peut être lu par le Studio et par le semis.
 */
export type TitresPage = {
  /** Le titre bleu dans Google (balise <title>). */
  seoTitre: string
  /** Les champs qui forment le grand titre (H1), par nom de champ. */
  h1: Record<string, string>
}

export const TITRES_PROTEGES: Record<string, TitresPage> = {
  pageAccueil: {
    seoTitre: 'Norvika · Vos courtiers des outils numériques',
    h1: { h1: 'Vos courtiers des outils numériques.' },
  },
  pageSitesWeb: {
    seoTitre: 'Sites web sur mesure à Québec | Norvika',
    h1: { h1: 'Un site qui vous ressemble, et qui travaille pour vous.' },
  },
  pageAutomatisation: {
    seoTitre: 'Automatisation pour PME à Québec | Norvika',
    h1: { h1: "Vos outils devraient travailler pour vous. Pas l'inverse." },
  },
  pagePhotoVideo: {
    seoTitre: "Photo et vidéo d'entreprise à Québec | Norvika",
    h1: { h1: 'Ce que vos clients voient devrait être à la hauteur de ce que vous faites.' },
  },
  pageFormation: {
    seoTitre: 'Formation | Norvika',
    h1: { h1: 'Ce qui vous appartient, vous devriez le comprendre, pas juste le payer.' },
  },
  pageDiagnostic: {
    seoTitre: 'Diagnostic gratuit | Norvika',
    h1: { h1: 'On vous pose sept questions.' },
  },
  pageEquipe: {
    seoTitre: "L'équipe | Norvika",
    h1: { h1: "On rattache l'humain à l'efficience." },
  },
  pageRealisations: {
    seoTitre: 'Nos réalisations | Norvika',
    h1: { h1: 'Ils nous font', h1Accent: 'confiance.' },
  },
  pageContact: {
    seoTitre: 'Contact | Norvika',
    h1: { h1: 'Parlons de votre projet.' },
  },
  pageBienvenue: {
    seoTitre: 'Bienvenue : espace client Norvika | Norvika',
    h1: { h1: "Bienvenue. Voici comment on va s'y prendre." },
  },
}

/** L'identifiant publié d'un document, que le Studio montre le brouillon ou une version. */
export function idPublie(id: string | undefined): string {
  return (id ?? '').replace(/^(drafts|versions\.[^.]+)\./, '')
}

export function estProtege(id: string | undefined): boolean {
  return idPublie(id) in TITRES_PROTEGES
}

export const AVIS_TITRE_PROTEGE =
  'Ce titre sert déjà à trouver la page dans Google. Le changer peut faire perdre des visites : en cas de doute, demandez à Norvika.'

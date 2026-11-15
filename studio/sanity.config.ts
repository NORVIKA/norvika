/**
 * Le Studio de norvika.ca, hébergé par Sanity sur https://norvika.sanity.studio. 100 % en français.
 * Rien dans le site n'importe ce dossier : `sanity` et ses centaines de paquets restent hors des
 * publications du site (norme Norvika du 2026-10-29, SKILL_ADMIN).
 *
 * ⚠️ L'identifiant du projet est écrit ici en clair, jamais lu de process.env : le paquet navigateur
 *    du Studio n'inline que les variables SANITY_STUDIO_*. Une valeur NEXT_PUBLIC_* y resterait vide,
 *    et le Studio en ligne mourrait sur « Configuration must contain projectId » (vécu sur
 *    nelly-dufour). L'identifiant et le jeu de données sont publics.
 * ⚠️ Projet de NORVIKA (organisation ohmk37dig). Le compte connecté voit aussi le projet d'un
 *    client : ne jamais changer cet identifiant pour un autre.
 */
import { frFRLocale } from '@sanity/locale-fr-fr'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { actions } from './actions'
import { SANS_CREATION, typesDuSchema } from './schemas'
import { structure } from './structure'

export const ID_PROJET = 'k99pdqd1'
export const JEU_DE_DONNEES = 'production'

export default defineConfig({
  name: 'norvika',
  title: 'Norvika',
  projectId: ID_PROJET,
  dataset: JEU_DE_DONNEES,
  plugins: [structureTool({ title: 'Contenu', structure }), frFRLocale()],
  // Publication au fil de l'eau : pas de lots ni de publications planifiées (onglet non traduit).
  releases: { enabled: false },
  scheduledDrafts: { enabled: false },
  schema: {
    types: typesDuSchema,
    // Les pages et les documents uniques ne se créent pas depuis le Studio.
    templates: (precedents) => precedents.filter((t) => !SANS_CREATION.includes(t.schemaType)),
  },
  document: {
    actions,
    newDocumentOptions: (precedentes) => precedentes.filter((o) => !SANS_CREATION.includes(o.templateId)),
  },
})

/**
 * Configuration du CLI de Sanity (sanity build, sanity deploy, sanity exec).
 * Le Studio part sur https://norvika.sanity.studio (studioHost).
 *
 * ⚠️ Projet de NORVIKA (k99pdqd1, organisation ohmk37dig). Toute commande vise CE projet.
 */
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: { projectId: 'k99pdqd1', dataset: 'production' },
  studioHost: 'norvika',
  // Aucune mise à jour automatique du Studio hébergé : la version est celle du package.json,
  // testée ici avant le déploiement. (appId à ajouter après le premier `sanity deploy`.)
  deployment: { autoUpdates: false },
})

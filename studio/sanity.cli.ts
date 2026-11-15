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
  // testée ici avant le déploiement. appId : premier `sanity deploy`, 2026-11-14.
  deployment: { autoUpdates: false, appId: 'q1cr9znyhi2qz6l1tt90abv6' },
})

"use client";

// Déclenche un redéploiement du site après une modification de contenu dans /admin.
//
// Pourquoi : les pages publiques sont en ISR (prérendues au build). Un changement
// enregistré dans Supabase n'apparaît en ligne qu'après un nouveau déploiement.
// Cette fonction appelle la route serveur /api/admin/redeploy, qui déclenche le
// Deploy Hook Cloudflare Pages (rebuild + redeploy, ~2 min). Le site reste 100%
// statique/ISR : aucun impact sur la vitesse pour les visiteurs.
//
// Anti-rafale (debounce) : plusieurs sauvegardes rapprochées (ex. l'admin édite
// les textes, puis les couleurs, puis les infos en quelques secondes) sont
// COALESCÉES en UN seul déploiement. Le minuteur vit au niveau du module, donc il
// survit à la navigation côté client entre les pages /admin (le JS n'est pas
// rechargé). Chaque appel repousse l'échéance ; le fetch part une seule fois,
// DEBOUNCE_MS après la dernière sauvegarde.

const DEBOUNCE_MS = 8000;

let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * Programme un redéploiement (debounced). À appeler après CHAQUE sauvegarde de
 * contenu réussie dans l'admin.
 */
export function scheduleRedeploy(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    // fire-and-forget : on n'attend pas la fin du build, juste le déclenchement.
    fetch("/api/admin/redeploy", { method: "POST" }).catch(() => {
      // silencieux : l'échec du déclenchement ne doit pas casser l'UX admin.
      // Le contenu est déjà sauvegardé dans Supabase ; au pire, le prochain
      // déploiement (autre sauvegarde ou push) le publiera.
    });
  }, DEBOUNCE_MS);
}

import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Configuration OpenNext pour Cloudflare Workers.
//
// ⚠️ LE RÉGLAGE CI-DESSOUS N'EST PAS OPTIONNEL. Sans lui, OpenNext utilise le
// cache incrémental « dummy » : il ne stocke rien et répond toujours « absent ».
// Conséquence, CHAQUE visite reconstruirait le HTML de la page au lieu de servir
// la version pré-rendue au build. C'est exactement la charge par rendu qui fait
// tomber un Worker en erreur 1102, et ça ne se voit pas en test à faible trafic.
//
// `staticAssetsIncrementalCache` lit le HTML pré-rendu depuis les Static Assets
// de Cloudflare. Il est EN LECTURE SEULE, donc aucune revalidation à l'exécution,
// ce qui convient à norvika.ca : toutes les pages publiques sortent du build en
// statique (○). Il ne demande ni bucket R2, ni KV, ni D1 : rien à provisionner,
// rien à payer, rien à surveiller.
//
// ⚠️ Le jour où une page aura besoin d'ISR (revalidation à l'exécution), il
// faudra passer à `r2IncrementalCache` ou `kvIncrementalCache` et créer la
// ressource correspondante. Garder ce cache-ci ferait servir du HTML figé.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});

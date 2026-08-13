import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Configuration OpenNext pour Cloudflare Workers.
//
// Config minimale, comme le CRM : norvika.ca est un site vitrine rendu
// statiquement pour l'essentiel, plus quelques routes dynamiques (formulaire de
// contact, /admin). Il n'y a pas d'ISR à cacher, donc pas besoin de cache
// incrémental R2 pour l'instant.
//
// ⚠️ À revoir si on active l'ISR (`revalidate`) sur des pages : sans réglage,
// OpenNext utilise le cache « dummy » qui ne stocke rien, et chaque requête
// reconstruirait le HTML. C'est la charge par rendu qui fait tomber un Worker
// en erreur 1102.
export default defineCloudflareConfig({});

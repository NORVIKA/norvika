# Déploiement — Site Norvika

Site vitrine Next.js 14 (App Router) + Supabase, hébergé sur **Cloudflare Pages**
via l'adaptateur `@cloudflare/next-on-pages`.

## Architecture de publication

- Les pages publiques sont en **ISR** (`export const revalidate = 3600`) : prérendues
  au build, servies en cache edge. Aucun impact vitesse (100 % statique côté visiteur).
- Le contenu (textes, images, couleurs, infos) est édité dans **/admin** et stocké
  dans **Supabase**. Un changement n'apparaît en public **qu'après un redéploiement**
  (le build re-prérend les pages avec le contenu Supabase à jour).
- **Auto-publication** : après chaque sauvegarde dans /admin, le site déclenche un
  **Deploy Hook Cloudflare Pages** → rebuild + redeploy en ~2 min, tout seul.

## Cible d'hébergement (setup Git-connecté)

- **Repo GitHub** : `NORVIKA/norvika` (repo dédié au site, distinct du cerveau).
- **Projet Cloudflare Pages** : connecté à ce repo (intégration Git), branche de
  production `main` → auto-déploiement à chaque `git push`.
- **Build command** : `npm run pages:build`
  (= `npx @cloudflare/next-on-pages && node scripts/fix-index-route.mjs`)
- **Output directory** : `.vercel/output/static`
- **Node version** : `22`

## Variables d'environnement (dans Cloudflare Pages → Settings → Variables)

| Nom | Type | Valeur |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | `https://uddxvrogkknypneghkkw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | clé anon Supabase |
| `SUPABASE_SERVICE_KEY` | Secret | service role Supabase (upload images) |
| `RESEND_API_KEY` | Secret | clé Resend (formulaire contact) |
| `CLOUDFLARE_DEPLOY_HOOK_URL` | Secret | URL du Deploy Hook (voir plus bas) |

> ⚠️ Aucun secret dans le repo. `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY` et
> `CLOUDFLARE_DEPLOY_HOOK_URL` ne sont **jamais** préfixés `NEXT_PUBLIC_`.

## Boucle d'auto-publication (comment ça marche)

1. William modifie du contenu dans `/admin` et clique **Sauvegarder**.
2. L'éditeur écrit dans Supabase, puis appelle `scheduleRedeploy()`
   (`lib/redeploy-client.ts`), qui **debounce 8 s** (plusieurs sauvegardes
   rapprochées = 1 seul déploiement).
3. Au bout des 8 s, un `POST /api/admin/redeploy` part.
4. La route (`app/api/admin/redeploy/route.ts`) vérifie que l'admin est authentifié,
   puis `POST` sur `CLOUDFLARE_DEPLOY_HOOK_URL`.
5. Cloudflare Pages rebuild `main` et redéploie. Le contenu est en ligne en ~2 min.

## Mise à jour du code

```bash
git add .
git commit -m "..."
git push origin main
# → Cloudflare Pages redéploie automatiquement (intégration Git).
```

## Fichiers clés

- `lib/redeploy-client.ts` — helper client debounced (déclenche le redéploiement).
- `app/api/admin/redeploy/route.ts` — route serveur auth-gated → Deploy Hook.
- `wrangler.toml` — `pages_build_output_dir` + vars publiques.
- `scripts/fix-index-route.mjs` — patch post-build next-on-pages (route `/`).

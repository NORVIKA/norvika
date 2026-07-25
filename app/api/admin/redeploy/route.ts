import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Déclenche un redéploiement Cloudflare Pages via le Deploy Hook.
//
// Appelée par /admin après une sauvegarde de contenu (voir lib/redeploy-client.ts).
// L'URL du Deploy Hook est un SECRET : elle vit uniquement côté serveur, dans la
// variable d'environnement CLOUDFLARE_DEPLOY_HOOK_URL (jamais NEXT_PUBLIC_, jamais
// dans le repo). Configurée dans les variables du projet Cloudflare Pages.
export async function POST() {
  // 1. Ne déclencher un build QUE pour un admin authentifié (mêmes règles que
  //    /api/admin/upload). Empêche un tiers de forcer des rebuilds (coût / abus).
  const authClient = createSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // 2. Lire le Deploy Hook côté serveur.
  const hook = process.env.CLOUDFLARE_DEPLOY_HOOK_URL;
  if (!hook) {
    // Le contenu est déjà sauvegardé dans Supabase ; seul l'auto-publication est
    // indisponible tant que la variable n'est pas configurée.
    return NextResponse.json(
      { error: "Deploy hook non configuré (CLOUDFLARE_DEPLOY_HOOK_URL)" },
      { status: 503 }
    );
  }

  // 3. Déclencher le build (fire-and-forget côté Cloudflare, ~2 min).
  try {
    const res = await fetch(hook, { method: "POST" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Le Deploy Hook a répondu " + res.status },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Impossible de joindre le Deploy Hook" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

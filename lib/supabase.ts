import { createBrowserClient } from "@supabase/ssr";

// ⚠️ CONSTRUIT A LA DEMANDE, PAS AU CHARGEMENT DU MODULE.
// `createBrowserClient` leve si l'URL ou la cle manquent. A l'import, cette
// erreur ne passe par aucun try/catch : elle casse la construction complete,
// meme pour les pages qui n'ont rien a voir avec Supabase. Vecu dans l'action
// GitHub, sur /_not-found.
//
// ⚠️ Les variables NEXT_PUBLIC_* sont FIGEES DANS LE CODE au moment de la
// construction. Si l'action GitHub construit sans elles, /admin part en ligne
// avec une adresse vide et la connexion ne marche plus. Elles doivent donc etre
// definies dans les variables du depot. Ce ne sont pas des secrets : elles
// partent de toute facon dans le navigateur, la protection vient des regles RLS.
let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !cle) {
    throw new Error(
      "Supabase n'est pas configure : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY manquent au moment de la construction."
    );
  }
  client = createBrowserClient(url, cle);
  return client;
}

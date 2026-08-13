import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Next 16 : cookies() est asynchrone, donc cette fabrique le devient aussi.
// La compatibilité synchrone temporaire de Next 15 a été retirée en 16.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

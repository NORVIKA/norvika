import "server-only";
import { createClient } from "@supabase/supabase-js";
import { defaultContent, defaultSiteInfo, defaultColors, defaultImages } from "./content";

// Duree de revalidation (ISR). Les pages publiques sont prerenderees et servies
// en cache a l'edge Cloudflare (cf-cache-status: HIT), ce qui evite de reveiller
// le Worker a chaque requete (anti-1102). Le contenu se rafraichit au redeploiement.
const REVALIDATE = 3600;

// Client de LECTURE publique : anon key, SANS cookies (pas de next/headers), pour
// que les pages qui l'utilisent restent prerenderables. Les requetes .select()
// (GET) passent par le fetch de Next avec revalidation, donc cacheables.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
    global: {
      fetch: (input: RequestInfo | URL, init: RequestInit = {}) => {
        // Retirer un eventuel `cache: 'no-store'` pose par supabase-js, puis
        // rendre la requete cacheable via l'ISR de Next.
        const { cache: _cache, ...rest } = init;
        return fetch(input, { ...rest, next: { revalidate: REVALIDATE } });
      },
    },
  }
);

export async function getSiteData() {
  try {
    const [contentRes, infoRes, colorsRes] = await Promise.all([
      supabase.from("site_content").select("key, value"),
      supabase.from("site_info").select("key, value"),
      supabase.from("site_colors").select("key, value"),
    ]);

    const content = { ...defaultContent };
    const images = { ...defaultImages };
    contentRes.data?.forEach(({ key, value }) => {
      if (!value) return;
      if (key.startsWith("img_")) {
        // Les images sont stockées dans site_content avec un préfixe img_
        images[key.slice(4)] = value;
      } else {
        content[key] = value;
      }
    });

    const siteInfo = { ...defaultSiteInfo };
    infoRes.data?.forEach(({ key, value }) => {
      if (value) siteInfo[key] = value;
    });

    const colors = { ...defaultColors };
    colorsRes.data?.forEach(({ key, value }) => {
      if (value) colors[key] = value;
    });

    return { content, siteInfo, colors, images };
  } catch {
    return {
      content: defaultContent,
      siteInfo: defaultSiteInfo,
      colors: defaultColors,
      images: defaultImages,
    };
  }
}

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultContent, defaultSiteInfo, defaultColors, defaultImages } from "./content";

// Le contenu est fige au moment de la construction, pas revalide a l'execution.
//
// ⚠️ C'ETAIT 3600, et c'est ce chiffre qui cassait l'affichage du site.
// Une revalidation par fetch remonte jusqu'a la page : la page devenait ISR et
// Next la declarait perimee au bout d'une heure. Or notre cache incrementiel est
// en LECTURE SEULE (open-next.config.ts), donc rien ne pouvait jamais etre
// reecrit : la page restait perimee pour de bon, et Next annoncait alors
// « stale-while-revalidate=2592000 », ce qui autorise un navigateur a afficher
// une page vieille de 30 jours sans rien verifier. Cette vieille page reclamait
// des fichiers CSS supprimes par le dernier deploiement, d'ou le site sans ses
// couleurs tant qu'on ne rafraichissait pas.
//
// `false` = mis en cache indefiniment, donc page VRAIMENT statique. Le contenu
// se rafraichit au redeploiement, ce qui etait deja le seul comportement reel :
// c'est ce que fait le bouton Publier de /admin.
const REVALIDATE = false as const;

// Client de LECTURE publique : anon key, SANS cookies (pas de next/headers), pour
// que les pages qui l'utilisent restent prerenderables. Les requetes .select()
// (GET) passent par le fetch de Next avec revalidation, donc cacheables.
//
// ⚠️ CONSTRUIT A LA DEMANDE, PAS AU CHARGEMENT DU MODULE.
// `createClient` leve « supabaseUrl is required » si la variable est absente, et
// une erreur levee a l'import ne passe par aucun try/catch : elle casse la
// construction entiere. C'est arrive dans l'action GitHub, ou aucune variable
// Supabase n'est definie. La construction ne DOIT pas dependre de ces variables :
// getSiteData() a des valeurs par defaut faites pour ca. En les lisant a
// l'interieur d'une fonction, l'absence redevient un cas normal.
function clientLecture(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !cle || !url.startsWith("http")) return null;

  return createClient(url, cle, {
    auth: { persistSession: false },
    global: {
      fetch: (input: RequestInfo | URL, init: RequestInit = {}) => {
        // Retirer un eventuel `cache: 'no-store'` pose par supabase-js, puis
        // rendre la requete cacheable au moment de la construction.
        const { cache: _cache, ...rest } = init;
        return fetch(input, { ...rest, next: { revalidate: REVALIDATE } });
      },
    },
  });
}

export async function getSiteData() {
  const supabase = clientLecture();
  if (!supabase) {
    // Pas de base joignable (construction en CI, variables absentes) : on sert
    // les valeurs par defaut, qui sont celles de la base.
    return {
      content: { ...defaultContent },
      siteInfo: { ...defaultSiteInfo },
      colors: { ...defaultColors },
      images: { ...defaultImages },
    };
  }

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

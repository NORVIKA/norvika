import "server-only";
import { createSupabaseServerClient } from "./supabase-server";
import { defaultContent, defaultSiteInfo, defaultColors, defaultImages } from "./content";

export async function getSiteData() {
  try {
    const supabase = createSupabaseServerClient();

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

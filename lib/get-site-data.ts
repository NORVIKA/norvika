import "server-only";
import { createSupabaseServerClient } from "./supabase-server";
import { defaultContent, defaultSiteInfo, defaultColors } from "./content";

export async function getSiteData() {
  try {
    const supabase = createSupabaseServerClient();

    const [contentRes, infoRes, colorsRes] = await Promise.all([
      supabase.from("site_content").select("key, value"),
      supabase.from("site_info").select("key, value"),
      supabase.from("site_colors").select("key, value"),
    ]);

    const content = { ...defaultContent };
    contentRes.data?.forEach(({ key, value }) => {
      if (value) content[key] = value;
    });

    const siteInfo = { ...defaultSiteInfo };
    infoRes.data?.forEach(({ key, value }) => {
      if (value) siteInfo[key] = value;
    });

    const colors = { ...defaultColors };
    colorsRes.data?.forEach(({ key, value }) => {
      if (value) colors[key] = value;
    });

    return { content, siteInfo, colors };
  } catch {
    return {
      content: defaultContent,
      siteInfo: defaultSiteInfo,
      colors: defaultColors,
    };
  }
}

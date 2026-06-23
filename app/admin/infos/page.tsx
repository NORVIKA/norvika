import { createSupabaseServerClient } from "@/lib/supabase-server";
import { defaultSiteInfo } from "@/lib/content";
import { InfosEditor } from "./InfosEditor";

export const dynamic = "force-dynamic";

export default async function InfosPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("site_info").select("key, value");

  const siteInfo = { ...defaultSiteInfo };
  data?.forEach(({ key, value }) => { if (value) siteInfo[key] = value; });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Mes informations</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">Coordonnées et liens affichés sur le site.</p>
      <div className="mt-8">
        <InfosEditor initialInfo={siteInfo} />
      </div>
    </div>
  );
}

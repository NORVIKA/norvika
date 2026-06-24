import { createSupabaseServerClient } from "@/lib/supabase-server";
import { defaultContent } from "@/lib/content";
import { TextesEditor } from "./TextesEditor";

export const dynamic = "force-dynamic";

export default async function TextesPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("site_content").select("key, value");

  const content = { ...defaultContent };
  data?.forEach(({ key, value }) => {
    if (value && !key.startsWith("img_")) content[key] = value;
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Mes textes</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Modifiez les textes affichés sur le site. Les changements sont visibles immédiatement.
      </p>
      <div className="mt-8">
        <TextesEditor initialContent={content} />
      </div>
    </div>
  );
}

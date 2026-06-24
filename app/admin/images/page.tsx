import { createSupabaseServerClient } from "@/lib/supabase-server";
import { defaultImages, IMAGE_FIELDS } from "@/lib/content";
import { ImagesEditor } from "./ImagesEditor";

export const dynamic = "force-dynamic";

export default async function ImagesPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("site_content").select("key, value").like("key", "img_%");

  const images = { ...defaultImages };
  data?.forEach(({ key, value }) => {
    if (value) images[key.slice(4)] = value;
  });

  const fields = IMAGE_FIELDS.map((f) => ({ ...f, url: images[f.key] }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Mes images</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Remplacez les images du site. Formats acceptés : PNG, JPG, WebP, SVG (max 10 Mo). Le
        changement est visible en ligne en quelques secondes.
      </p>
      <div className="mt-8">
        <ImagesEditor fields={fields} />
      </div>
    </div>
  );
}

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { defaultColors } from "@/lib/content";
import { CouleursEditor } from "./CouleursEditor";

export const dynamic = "force-dynamic";

const COLOR_LABELS: Record<string, string> = {
  primary: "Couleur principale (navy)",
  brand: "Couleur accent (bleu)",
  background: "Arrière-plan",
  foreground: "Texte principal",
  cream: "Sections crème",
  accent: "Hover cards",
};

export default async function CouleursPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("site_colors").select("key, value");

  const colors = { ...defaultColors };
  data?.forEach(({ key, value }) => { if (value) colors[key] = value; });

  const colorEntries = Object.entries(colors).map(([key, value]) => ({
    key,
    value,
    label: COLOR_LABELS[key] ?? key,
  }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Mes couleurs</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Modifiez la palette de couleurs du site. Utilisez des codes hexadécimaux (#1b2a47).
      </p>
      <div className="mt-8">
        <CouleursEditor initialColors={colorEntries} />
      </div>
    </div>
  );
}

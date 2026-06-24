import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { defaultImages } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function POST(req: Request) {
  // 1. Vérifier que l'utilisateur est un admin authentifié
  const authClient = createSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // 2. Lire le fichier + la clé d'image
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const key = formData.get("key") as string | null;

  if (!file || !key) {
    return NextResponse.json({ error: "Fichier ou clé manquant" }, { status: 400 });
  }
  if (!(key in defaultImages)) {
    return NextResponse.json({ error: "Clé d'image inconnue" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Format non supporté (PNG, JPG, WebP, SVG)" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Image trop lourde (max 10 Mo)" }, { status: 400 });
  }

  // 3. Upload via la service key (bypass RLS), nom horodaté pour casser le cache
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );

  const ext = EXT[file.type];
  const path = `${key}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await service.storage
    .from("site-images")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = service.storage.from("site-images").getPublicUrl(path);

  // 4. Enregistrer l'URL dans site_content (clé img_<key>)
  const { error: dbErr } = await service
    .from("site_content")
    .upsert({ key: `img_${key}`, value: publicUrl, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl });
}

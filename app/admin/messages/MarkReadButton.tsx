"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  async function mark() {
    await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    router.refresh();
  }
  return (
    <button onClick={mark} className="mt-2 text-xs font-medium text-[var(--brand)] hover:underline">
      Marquer comme lu
    </button>
  );
}

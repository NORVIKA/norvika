"use client";

import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await getSupabase().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-full border border-[var(--hairline)] bg-[var(--cream)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--hairline)] hover:text-[var(--foreground)]"
    >
      Se déconnecter
    </button>
  );
}

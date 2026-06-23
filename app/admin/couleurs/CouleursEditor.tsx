"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface ColorEntry { key: string; value: string; label: string; }

export function CouleursEditor({ initialColors }: { initialColors: ColorEntry[] }) {
  const [colors, setColors] = useState(initialColors);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(key: string, value: string) {
    setColors((c) => c.map((e) => (e.key === key ? { ...e, value } : e)));
  }

  async function save() {
    setSaving(true);
    setSuccess(false);
    const upserts = colors.map(({ key, value, label }) => ({ key, value, label }));
    const { error } = await supabase.from("site_colors").upsert(upserts, { onConflict: "key" });
    setSaving(false);
    if (!error) { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
  }

  return (
    <div>
      <div className="rounded-2xl border border-[var(--hairline)] bg-white p-6">
        <div className="space-y-5">
          {colors.map((c) => (
            <div key={c.key} className="flex items-center gap-4">
              <input
                type="color"
                value={c.value}
                onChange={(e) => update(c.key, e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-md border border-[var(--hairline)] bg-transparent p-0.5"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--foreground)]">{c.label}</p>
                <input
                  type="text"
                  value={c.value}
                  onChange={(e) => update(c.key, e.target.value)}
                  className="mt-1 block w-full rounded-md border border-[var(--hairline)] px-3 py-1.5 text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-60"
        >
          {saving ? "Sauvegarde…" : "Sauvegarder"}
        </button>
        {success && <p className="text-sm font-medium text-green-600">✓ Sauvegardé</p>}
      </div>
    </div>
  );
}

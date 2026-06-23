"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const FIELDS = [
  { key: "nom", label: "Nom de l'entreprise" },
  { key: "email", label: "Courriel de contact" },
  { key: "telephone", label: "Numéro de téléphone" },
  { key: "lien_rdv", label: "Lien prise de rendez-vous (Google Calendar)" },
  { key: "lien_portfolio", label: "Lien portfolio (Adobe Portfolio)" },
  { key: "description", label: "Description (footer)" },
];

export function InfosEditor({ initialInfo }: { initialInfo: Record<string, string> }) {
  const [info, setInfo] = useState(initialInfo);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function save() {
    setSaving(true);
    setSuccess(false);
    const upserts = Object.entries(info).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("site_info").upsert(upserts, { onConflict: "key" });
    setSaving(false);
    if (!error) { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
  }

  return (
    <div>
      <div className="rounded-2xl border border-[var(--hairline)] bg-white p-6 space-y-5">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-sm font-medium text-[var(--foreground)]">{f.label}</span>
            <input
              type="text"
              value={info[f.key] ?? ""}
              onChange={(e) => setInfo((i) => ({ ...i, [f.key]: e.target.value }))}
              className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            />
          </label>
        ))}
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

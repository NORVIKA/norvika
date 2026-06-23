"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const SECTIONS = [
  {
    titre: "Page Accueil",
    champs: [
      { key: "hero_titre", label: "Titre principal (H1)", type: "textarea" },
      { key: "hero_sous_titre", label: "Sous-titre hero", type: "textarea" },
      { key: "pilliers_titre", label: "Titre section trois solutions", type: "text" },
      { key: "about_titre", label: "Titre section Pourquoi Norvika", type: "text" },
      { key: "about_texte", label: "Texte section Pourquoi Norvika", type: "textarea" },
      { key: "cta_principal_titre", label: "Titre CTA final", type: "text" },
      { key: "cta_principal_sous_titre", label: "Sous-titre CTA final", type: "textarea" },
    ],
  },
  {
    titre: "Page Sites web",
    champs: [
      { key: "sites_hero_titre", label: "Titre (H1)", type: "text" },
      { key: "sites_hero_sous_titre", label: "Sous-titre", type: "textarea" },
      { key: "sites_offre_prix", label: "Prix de départ", type: "text" },
      { key: "sites_cta_titre", label: "Titre CTA final", type: "text" },
    ],
  },
  {
    titre: "Page Automatisation",
    champs: [
      { key: "auto_hero_titre", label: "Titre (H1)", type: "text" },
      { key: "auto_hero_sous_titre", label: "Sous-titre", type: "textarea" },
      { key: "auto_pattern_titre", label: "Titre section Le pattern", type: "text" },
      { key: "auto_pattern_texte", label: "Texte section Le pattern", type: "textarea" },
      { key: "auto_cta_titre", label: "Titre CTA final", type: "text" },
    ],
  },
  {
    titre: "Page Photo et vidéo",
    champs: [
      { key: "photo_hero_titre", label: "Titre (H1)", type: "text" },
      { key: "photo_hero_sous_titre", label: "Sous-titre", type: "textarea" },
      { key: "photo_cta_titre", label: "Titre CTA final", type: "text" },
    ],
  },
];

interface Props {
  initialContent: Record<string, string>;
}

export function TextesEditor({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function save() {
    setSaving(true);
    setSuccess(false);

    const upserts = Object.entries(content).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("site_content")
      .upsert(upserts, { onConflict: "key" });

    setSaving(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div className="space-y-10">
      {SECTIONS.map((section) => (
        <div key={section.titre} className="rounded-2xl border border-[var(--hairline)] bg-white p-6">
          <h2 className="text-base font-semibold text-[var(--foreground)]">{section.titre}</h2>
          <div className="mt-5 space-y-5">
            {section.champs.map((champ) => (
              <label key={champ.key} className="block">
                <span className="text-sm font-medium text-[var(--foreground)]">{champ.label}</span>
                {champ.type === "textarea" ? (
                  <textarea
                    value={content[champ.key] ?? ""}
                    onChange={(e) => setContent((c) => ({ ...c, [champ.key]: e.target.value }))}
                    rows={3}
                    className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                ) : (
                  <input
                    type="text"
                    value={content[champ.key] ?? ""}
                    onChange={(e) => setContent((c) => ({ ...c, [champ.key]: e.target.value }))}
                    className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-60"
        >
          {saving ? "Sauvegarde en cours…" : "Sauvegarder"}
        </button>
        {success && <p className="text-sm font-medium text-green-600">✓ Sauvegardé avec succès</p>}
      </div>
    </div>
  );
}

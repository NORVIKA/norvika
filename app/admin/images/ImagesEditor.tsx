"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Field {
  key: string;
  label: string;
  hint: string;
  url: string;
}

export function ImagesEditor({ fields }: { fields: Field[] }) {
  const router = useRouter();
  const [urls, setUrls] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.url]))
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function handleFile(key: string, file: File) {
    setBusy(key);
    setError(null);
    setDone(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("key", key);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec de l'upload");
      setUrls((u) => ({ ...u, [key]: json.url }));
      setDone(key);
      router.refresh();
      setTimeout(() => setDone(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}
      {fields.map((f) => (
        <div key={f.key} className="rounded-2xl border border-[var(--hairline)] bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Aperçu */}
            <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--cream)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urls[f.key]}
                alt={f.label}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {/* Infos + bouton */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--foreground)]">{f.label}</p>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{f.hint}</p>
              <div className="mt-3 flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--primary)]/90">
                  {busy === f.key ? "Envoi en cours…" : "Changer l'image"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    disabled={busy !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(f.key, file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {done === f.key && (
                  <span className="text-xs font-medium text-green-600">✓ Mise à jour</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

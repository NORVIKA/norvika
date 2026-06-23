"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

let attempts = 0;
let lockUntil = 0;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);

    if (Date.now() < lockUntil) {
      const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
      setErreur(`Trop de tentatives. Réessayez dans ${remaining} secondes.`);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      attempts++;
      if (attempts >= 5) {
        lockUntil = Date.now() + 5 * 60 * 1000;
        attempts = 0;
        setErreur("Trop de tentatives. Accès bloqué pour 5 minutes.");
      } else {
        setErreur("Courriel ou mot de passe incorrect.");
      }
      return;
    }

    attempts = 0;
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Administration</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Norvika — Accès réservé</p>
        </div>
        <form onSubmit={onSubmit} className="rounded-2xl border border-[var(--hairline)] bg-white p-8 shadow-sm">
          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Courriel</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">Mot de passe</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
              />
            </label>
          </div>
          {erreur && <p className="mt-4 text-sm text-[var(--destructive)]">{erreur}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-[var(--primary)] py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { AntiRobot, MESSAGE_JETON_ABSENT, lireJetonAntiRobot, reinitialiserAntiRobot } from "@/components/site/AntiRobot";
import { MentionCollecte } from "@/components/site/MentionCollecte";
import { CHAMP_JETON } from "@/lib/anti-robot-commun";

export function LeadForm() {
  const [prenom, setPrenom] = useState("");
  const [courriel, setCourriel] = useState("");
  const [telephone, setTelephone] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    const formulaire = e.currentTarget;
    const jeton = lireJetonAntiRobot(formulaire);

    if (!prenom.trim() || !courriel.trim() || !telephone.trim()) {
      setErreur("Tous les champs sont requis.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel)) {
      setErreur("Courriel invalide.");
      return;
    }
    if (!jeton) {
      setErreur(MESSAGE_JETON_ABSENT);
      return;
    }

    setEnvoi(true);
    // Passe par une route serveur (validation + limitation de débit) plutôt
    // que d'insérer directement dans Supabase depuis le navigateur.
    let messageErreur: string | null = null;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: prenom.trim(),
          courriel: courriel.trim(),
          telephone: telephone.trim(),
          [CHAMP_JETON]: jeton,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        messageErreur =
          data?.error ??
          "Une erreur est survenue. Veuillez réessayer ou nous écrire à info@norvika.ca.";
      }
    } catch {
      messageErreur =
        "Une erreur est survenue. Veuillez réessayer ou nous écrire à info@norvika.ca.";
    }
    setEnvoi(false);
    reinitialiserAntiRobot(formulaire);

    if (messageErreur) {
      setErreur(messageErreur);
      return;
    }

    setEnvoye(true);
    setPrenom("");
    setCourriel("");
    setTelephone("");
  }

  if (envoye) {
    return (
      <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--cream)] p-8 md:p-10">
        <p className="text-lg font-medium text-[var(--foreground)]">Merci, on vous revient sous peu.</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Vous recevrez un courriel ou un appel pour planifier la suite.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[var(--hairline)] bg-[var(--background)] p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-[var(--foreground)]">Prénom</span>
          <input
            type="text"
            required
            maxLength={100}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--foreground)]">Courriel</span>
          <input
            type="email"
            required
            maxLength={255}
            value={courriel}
            onChange={(e) => setCourriel(e.target.value)}
            className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-[var(--foreground)] md:whitespace-nowrap">Numéro de téléphone</span>
          <input
            type="tel"
            required
            maxLength={50}
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
      </div>
      <AntiRobot />
      {erreur && <p className="mt-4 text-sm text-[var(--destructive)]">{erreur}</p>}
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={envoi}
          className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-60"
        >
          {envoi ? "Envoi en cours…" : "Envoyer"}
        </button>
      </div>
      <div className="mt-5 text-[var(--muted-foreground)]">
        <MentionCollecte id="mention-collecte-bienvenue" />
      </div>
    </form>
  );
}

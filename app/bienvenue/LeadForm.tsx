"use client";

import { useState, type FormEvent } from "react";
import { AntiRobot, MESSAGE_JETON_ABSENT, attendreJetonAntiRobot, reinitialiserAntiRobot } from "@/components/site/AntiRobot";
import { MentionCollecte } from "@/components/site/MentionCollecte";
import { CHAMP_JETON } from "@/lib/anti-robot-commun";
import type { PageBienvenue } from "@/lib/types-contenu";

// Étiquettes, bouton et remerciement : page « Bienvenue » du Studio. Les messages d'erreur restent
// ici (exception de la phase 4 : ils suivent la logique de validation).
export function LeadForm({ t }: { t: PageBienvenue }) {
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

    if (!prenom.trim() || !courriel.trim() || !telephone.trim()) {
      setErreur("Tous les champs sont requis.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel)) {
      setErreur("Courriel invalide.");
      return;
    }
    setEnvoi(true);
    // Le jeton anti-robot naît quelques secondes après l'arrivée sur le formulaire : on l'attend,
    // le bouton montrant déjà l'envoi, plutôt que de refuser (voir attendreJetonAntiRobot).
    const jeton = await attendreJetonAntiRobot(formulaire);
    if (!jeton) {
      setEnvoi(false);
      setErreur(MESSAGE_JETON_ABSENT);
      return;
    }
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
        <p className="text-lg font-medium text-[var(--foreground)]">{t.merciTitre}</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {t.merciTexte}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[var(--hairline)] bg-[var(--background)] p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-[var(--foreground)]">{t.champPrenom}</span>
          <input
            type="text"
            autoComplete="given-name"
            required
            maxLength={100}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--foreground)]">{t.champCourriel}</span>
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            value={courriel}
            onChange={(e) => setCourriel(e.target.value)}
            className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)]"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-[var(--foreground)] md:whitespace-nowrap">{t.champTelephone}</span>
          <input
            type="tel"
            autoComplete="tel"
            required
            maxLength={50}
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)]"
          />
        </label>
      </div>
      <AntiRobot />
      {erreur && <p role="alert" className="mt-4 text-sm text-[var(--destructive)]">{erreur}</p>}
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={envoi}
          className="inline-flex items-center justify-center rounded-full nv-btn-primary px-7 py-3.5 text-sm font-bold transition-colors disabled:opacity-60"
        >
          {envoi ? t.boutonEnvoi : t.bouton}
        </button>
      </div>
      <div className="mt-5 text-[var(--muted-foreground)]">
        <MentionCollecte id="mention-collecte-bienvenue" />
      </div>
    </form>
  );
}

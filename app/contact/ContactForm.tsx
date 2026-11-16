"use client";

import { useState, type FormEvent } from "react";
import { AntiRobot, MESSAGE_JETON_ABSENT, lireJetonAntiRobot, reinitialiserAntiRobot } from "@/components/site/AntiRobot";
import { MentionCollecte } from "@/components/site/MentionCollecte";
import { CHAMP_JETON } from "@/lib/anti-robot-commun";
import type { PageContact } from "@/lib/types-contenu";

// Étiquettes, bouton et remerciement : page « Contact » du Studio. Les messages d'erreur restent
// ici (exception de la phase 4 : ils suivent la logique de validation).
export function ContactForm({ email, t }: { email: string; t: PageContact }) {
  const [nom, setNom] = useState("");
  const [courriel, setCourriel] = useState("");
  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    const formulaire = e.currentTarget;
    const jeton = lireJetonAntiRobot(formulaire);

    if (!nom.trim() || !courriel.trim() || !message.trim()) {
      setErreur("Le nom, le courriel et le message sont requis.");
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
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, courriel, telephone, message, [CHAMP_JETON]: jeton }),
    }).catch(() => null);
    setEnvoi(false);
    reinitialiserAntiRobot(formulaire);

    if (!res) {
      setErreur(`Une erreur est survenue. Réessayez ou écrivez-nous à ${email}.`);
      return;
    }

    if (!res.ok) {
      // Le serveur explique lui-même le refus (champ invalide, ou trop de
      // soumissions dans la dernière heure). On l'affiche tel quel.
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setErreur(data?.error ?? `Une erreur est survenue. Réessayez ou écrivez-nous à ${email}.`);
      return;
    }

    setEnvoye(true);
    setNom("");
    setCourriel("");
    setTelephone("");
    setMessage("");
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
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[var(--foreground)]">{t.champNom}</span>
          <input
            type="text"
            required
            maxLength={100}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--foreground)]">{t.champCourriel}</span>
          <input
            type="email"
            required
            maxLength={255}
            value={courriel}
            onChange={(e) => setCourriel(e.target.value)}
            className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)]"
          />
        </label>
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-medium text-[var(--foreground)]">{t.champTelephone}</span>
        <input
          type="tel"
          maxLength={50}
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)]"
        />
      </label>
      <label className="mt-5 block">
        <span className="text-sm font-medium text-[var(--foreground)]">{t.champMessage}</span>
        <textarea
          required
          rows={5}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)]"
        />
      </label>
      <AntiRobot />
      {erreur && <p className="mt-4 text-sm text-[var(--destructive)]">{erreur}</p>}
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={envoi}
          className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-60"
        >
          {envoi ? t.boutonEnvoi : t.bouton}
        </button>
      </div>
      <div className="mt-5 text-[var(--muted-foreground)]">
        <MentionCollecte id="mention-collecte-contact" />
      </div>
    </form>
  );
}

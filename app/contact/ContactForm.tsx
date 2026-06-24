"use client";

import { useState, type FormEvent } from "react";

export function ContactForm({ email }: { email: string }) {
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

    if (!nom.trim() || !courriel.trim() || !message.trim()) {
      setErreur("Le nom, le courriel et le message sont requis.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel)) {
      setErreur("Courriel invalide.");
      return;
    }

    setEnvoi(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, courriel, telephone, message }),
    });
    setEnvoi(false);

    if (!res.ok) {
      setErreur(`Une erreur est survenue. Réessayez ou écrivez-nous à ${email}.`);
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
        <p className="text-lg font-medium text-[var(--foreground)]">Merci, votre message est parti.</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          On vous revient rapidement, par courriel ou par téléphone.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[var(--hairline)] bg-[var(--background)] p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[var(--foreground)]">Nom</span>
          <input
            type="text"
            required
            maxLength={100}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
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
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-medium text-[var(--foreground)]">Téléphone (facultatif)</span>
        <input
          type="tel"
          maxLength={50}
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
      </label>
      <label className="mt-5 block">
        <span className="text-sm font-medium text-[var(--foreground)]">Message</span>
        <textarea
          required
          rows={5}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 block w-full rounded-md border border-[var(--hairline)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
      </label>
      {erreur && <p className="mt-4 text-sm text-[var(--destructive)]">{erreur}</p>}
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={envoi}
          className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-60"
        >
          {envoi ? "Envoi en cours…" : "Envoyer le message"}
        </button>
        <p className="text-sm text-[var(--muted-foreground)]">
          Vos données sont utilisées uniquement pour répondre à votre message.
        </p>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

/**
 * Bandeau de fin de page (present sur TOUTES les pages via SiteFooter).
 *
 * Avant : une seule porte de sortie, un bouton vers le calendrier. Beaucoup de
 * visiteurs ne veulent pas « reserver un appel » du premier coup, mais
 * ecriraient deux lignes. On offre donc les deux : un formulaire court, direct,
 * et le calendrier en second choix. C'est la conversion qu'on vise ici.
 *
 * Le formulaire poste sur /api/contact (validation + limitation de debit + clef
 * service cote serveur). Il n'insere jamais dans la base depuis le navigateur.
 */

const champ: React.CSSProperties = {
  width: "100%",
  marginTop: 8,
  padding: "13px 15px",
  borderRadius: 11,
  border: "1px solid rgba(245,243,238,.24)",
  background: "rgba(245,243,238,.06)",
  color: "#F5F3EE",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  outline: "none",
};
const etiquette: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(245,243,238,.86)",
};

export function ContactCTA() {
  const [nom, setNom] = useState("");
  const [courriel, setCourriel] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [champErreur, setChampErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  const courrielValide = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    if (!nom.trim() || !courriel.trim() || !message.trim()) {
      setErreur("Votre nom, votre courriel et un mot suffisent.");
      return;
    }
    if (!courrielValide(courriel)) {
      setErreur("Ce courriel ne semble pas valide.");
      return;
    }
    setEnvoi(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, courriel, message }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setErreur(
          data?.error ??
            "Une erreur est survenue. Écrivez-nous à info@norvika.ca.",
        );
        setEnvoi(false);
        return;
      }
    } catch {
      setErreur("Une erreur est survenue. Écrivez-nous à info@norvika.ca.");
      setEnvoi(false);
      return;
    }
    setEnvoi(false);
    setEnvoye(true);
    setNom("");
    setCourriel("");
    setMessage("");
  }

  return (
    <section
      id="rdv"
      style={{ position: "relative", overflow: "hidden", background: "#0C192F", color: "#F5F3EE" }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          width: 900,
          height: 600,
          marginLeft: -450,
          background:
            "radial-gradient(ellipse, rgba(51,73,108,.28) 0%, rgba(51,73,108,0) 70%)",
        }}
      />
      <div
        className="nv-shell nv-cta-grid"
        style={{
          position: "relative",
          maxWidth: 1160,
          margin: "0 auto",
          padding: "104px 32px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          alignItems: "center",
        }}
      >
        <div>
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: 44,
              height: 1,
              margin: "0 0 26px",
              background: "rgba(245,243,238,.4)",
            }}
          />
          <h2 style={{ margin: 0, fontSize: "clamp(30px,3.6vw,50px)", lineHeight: 1.08 }}>
            On regarde votre cas, gratuitement.
          </h2>
          <p
            style={{
              margin: "22px 0 0",
              maxWidth: "48ch",
              fontSize: 17,
              lineHeight: 1.65,
              color: "rgba(245,243,238,.72)",
            }}
          >
            Dites-nous en deux lignes ce qui vous freine. On vous revient vite,
            par courriel ou par téléphone, avec une première piste concrète.
            Vous préférez un appel tout de suite ?{" "}
            <Link
              href="/diagnostic"
              style={{ color: "#F5F3EE", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Réservez vos 30 minutes
            </Link>
            .
          </p>
        </div>

        {envoye ? (
          <div
            role="status"
            style={{
              borderRadius: 18,
              border: "1px solid rgba(245,243,238,.24)",
              background: "rgba(245,243,238,.06)",
              padding: "34px 30px",
            }}
          >
            <p style={{ margin: 0, fontSize: 19, fontWeight: 600 }}>
              Merci, votre message est parti.
            </p>
            <p style={{ margin: "10px 0 0", fontSize: 15, color: "rgba(245,243,238,.72)" }}>
              On vous revient rapidement, par courriel ou par téléphone.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div
              className="nv-cta-fields"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
            >
              <label style={etiquette}>
                Nom
                <input
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="name"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  style={champ}
                />
              </label>
              <label style={etiquette}>
                Courriel
                <input
                  type="email"
                  required
                  maxLength={255}
                  autoComplete="email"
                  value={courriel}
                  onBlur={() =>
                    setChampErreur(
                      courriel && !courrielValide(courriel)
                        ? "Ce courriel ne semble pas valide."
                        : null,
                    )
                  }
                  onChange={(e) => setCourriel(e.target.value)}
                  aria-invalid={!!champErreur}
                  style={champ}
                />
              </label>
            </div>
            {champErreur && (
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "#ffd7cf" }}>{champErreur}</p>
            )}
            <label style={{ ...etiquette, marginTop: 14 }}>
              En quelques mots, ce qui vous freine
              <textarea
                required
                rows={3}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ ...champ, resize: "vertical", minHeight: 84 }}
              />
            </label>
            {erreur && (
              <p role="alert" style={{ margin: "12px 0 0", fontSize: 14, color: "#ffd7cf" }}>
                {erreur}
              </p>
            )}
            <button
              type="submit"
              disabled={envoi}
              className="nv-btn-cream"
              style={{
                marginTop: 18,
                width: "100%",
                padding: "15px 24px",
                borderRadius: 11,
                border: 0,
                fontFamily: "var(--font-body)",
                fontSize: 15,
                fontWeight: 600,
                cursor: envoi ? "default" : "pointer",
                opacity: envoi ? 0.7 : 1,
              }}
            >
              {envoi ? "Envoi en cours…" : "Envoyer"}
            </button>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, color: "rgba(245,243,238,.55)" }}>
              Vos données servent uniquement à répondre à votre message.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

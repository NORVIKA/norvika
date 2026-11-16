/**
 * Courriel INTERNE vers info@norvika.ca, après un formulaire du site. SERVEUR SEULEMENT.
 *
 * Déclaré une seule fois (règle d'agence 5) : /api/contact (bandeau, page Contact, quiz
 * /diagnostic) et /api/lead (/bienvenue) l'utilisent. Aucun courriel ne part vers le visiteur :
 * pas d'accusé de réception (règle Turnstile 3), donc rien qu'un robot puisse détourner.
 *
 * API REST de Resend, sans SDK : un seul fetch, compatible avec le Worker.
 */
import { nettoyerObjet } from "@/lib/garde-formulaire";

export const DESTINATAIRE = "info@norvika.ca";
const EXPEDITEUR = "Norvika Contact <contact@norvika.ca>";

/** Le courriel est du HTML : tout ce qui vient du visiteur y est échappé. */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Une ligne « étiquette : valeur » du tableau du courriel. Valeur déjà échappée. */
export function ligne(etiquette: string, valeurHtml: string): string {
  return `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 120px; vertical-align: top;">${esc(etiquette)}</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${valeurHtml}</td>
          </tr>`;
}

/** Le lien mailto du courriel du visiteur, échappé. */
export function lienCourriel(courriel: string): string {
  return `<a href="mailto:${esc(courriel)}" style="color: #3557d4;">${esc(courriel)}</a>`;
}

/** Gabarit commun : un titre, un tableau de lignes, un bloc libre, une note de bas. */
export function gabarit({ titre, lignes, bloc, note }: { titre: string; lignes: string[]; bloc?: string; note: string }): string {
  return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f9fa; border-radius: 8px;">
        <h2 style="color: #19243a; margin-bottom: 24px;">${esc(titre)}</h2>
        <table style="width: 100%; border-collapse: collapse;">${lignes.join("")}
        </table>${bloc ?? ""}
        <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">${note}</p>
      </div>`;
}

/**
 * Envoie le courriel. Ne lève jamais : le message est déjà enregistré dans Supabase quand on
 * arrive ici, donc un échec d'envoi se journalise sans faire échouer la demande du visiteur.
 */
export async function envoyerCourrielInterne({
  objet,
  html,
  repondreA,
}: {
  objet: string;
  html: string;
  repondreA: string;
}): Promise<boolean> {
  try {
    const reponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EXPEDITEUR,
        to: [DESTINATAIRE],
        reply_to: repondreA,
        // Texte simple, pas du HTML : l'échapper afficherait « &amp; » dans l'objet.
        subject: nettoyerObjet(objet),
        html,
      }),
    });
    if (!reponse.ok) {
      console.error("Resend :", reponse.status, await reponse.text());
      return false;
    }
    return true;
  } catch (erreur) {
    console.error("Resend injoignable :", erreur instanceof Error ? erreur.name : "erreur");
    return false;
  }
}

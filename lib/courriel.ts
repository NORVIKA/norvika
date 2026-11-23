/**
 * Envoi de courriel par Resend, après un formulaire du site. SERVEUR SEULEMENT.
 *
 * Déclaré une seule fois (règle d'agence 5) : /api/contact (bandeau, page Contact, quiz
 * /diagnostic) et /api/lead (/bienvenue) envoient un courriel INTERNE vers info@norvika.ca ; ces
 * formulaires n'envoient aucun accusé de réception (règle Turnstile 3).
 * Seule exception, le vérificateur Loi 25 (2026-11-23) : le rapport part vers l'adresse que la
 * personne a inscrite, APRÈS Turnstile, la limite de débit et l'analyse, et son contenu est écrit
 * par le serveur à partir du rapport qu'il vient de calculer (lib/verificateur/courriel.ts).
 *
 * API REST de Resend, sans SDK : un seul fetch, compatible avec le Worker.
 */
import { nettoyerObjet } from "@/lib/garde-formulaire";

export const DESTINATAIRE = "info@norvika.ca";
/** Domaine vérifié dans Resend : toute adresse d'expédition reste sur contact@norvika.ca. */
const EXPEDITEUR = "Norvika Contact <contact@norvika.ca>";
/** Le rapport du vérificateur, vu par la personne qui l'a demandé : « Norvika », sans « Contact ». */
export const EXPEDITEUR_RAPPORT = "Norvika <contact@norvika.ca>";

/** Au-delà, Resend est jugé injoignable : la réponse au visiteur n'attend pas plus. */
const DELAI_ENVOI_MS = 6000;

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

type Envoi = {
  a: string;
  de?: string;
  objet: string;
  html: string;
  /** Version texte du même message (lecteurs de courriel sans HTML, filtres anti-pourriel). */
  texte?: string;
  repondreA: string;
};

/**
 * L'appel à Resend, déclaré une fois. Ne lève jamais. Aucun paramètre de suivi des ouvertures ou
 * des clics n'est envoyé : le suivi reste celui du domaine dans Resend, désactivé (fait C4 de Martin).
 * `journal` : « complet » (statut et corps de l'erreur, le comportement des formulaires internes,
 * inchangé) ou « statut » (le code HTTP seulement : le corps d'une erreur de Resend peut citer
 * l'adresse du destinataire, qui ne doit jamais paraître au journal, fait C2).
 */
async function appelerResend(
  { a, de = EXPEDITEUR, objet, html, texte, repondreA }: Envoi,
  { journal, delaiMs }: { journal: "complet" | "statut"; delaiMs?: number },
): Promise<{ ok: boolean; id: string | null }> {
  try {
    const reponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: de,
        to: [a],
        reply_to: repondreA,
        // Texte simple, pas du HTML : l'échapper afficherait « &amp; » dans l'objet.
        subject: nettoyerObjet(objet),
        html,
        ...(texte ? { text: texte } : {}),
      }),
      ...(delaiMs ? { signal: AbortSignal.timeout(delaiMs) } : {}),
    });
    if (!reponse.ok) {
      if (journal === "complet") console.error("Resend :", reponse.status, await reponse.text());
      else console.error("Resend :", reponse.status);
      return { ok: false, id: null };
    }
    const corps = (await reponse.json().catch(() => null)) as { id?: unknown } | null;
    return { ok: true, id: typeof corps?.id === "string" ? corps.id.slice(0, 80) : null };
  } catch (erreur) {
    console.error("Resend injoignable :", erreur instanceof Error ? erreur.name : "erreur");
    return { ok: false, id: null };
  }
}

/**
 * Le courriel INTERNE des formulaires, vers info@norvika.ca. Ne lève jamais : le message est déjà
 * enregistré dans Supabase quand on arrive ici, donc un échec d'envoi se journalise sans faire
 * échouer la demande du visiteur.
 */
export async function envoyerCourrielInterne({ objet, html, repondreA }: { objet: string; html: string; repondreA: string }): Promise<boolean> {
  return (await appelerResend({ a: DESTINATAIRE, objet, html, repondreA }, { journal: "complet" })).ok;
}

/**
 * Le rapport du vérificateur Loi 25 et sa copie interne (lib/verificateur/courriel.ts). Au journal :
 * le code HTTP seulement. Délai court : la personne attend sa réponse. Rend l'identifiant Resend,
 * cité dans la copie interne comme preuve que le rapport est parti.
 */
export async function envoyerCourrielRapport(envoi: Envoi): Promise<{ ok: boolean; id: string | null }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Resend : RESEND_API_KEY absent, aucun courriel envoyé.");
    return { ok: false, id: null };
  }
  return appelerResend(envoi, { journal: "statut", delaiMs: DELAI_ENVOI_MS });
}

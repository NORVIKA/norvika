import { NextResponse } from "next/server";
import { supabaseService, verifierDebit } from "@/lib/rate-limit";
import { CHAMP_JETON, verifierAntiRobot } from "@/lib/anti-robot";
import { champTexte, ligneSimpleValide, lireCorpsJson, nettoyerObjet, texteLongValide } from "@/lib/garde-formulaire";

const TO_EMAIL = "info@norvika.ca";

const MAX = { nom: 100, courriel: 255, telephone: 50, message: 5000 } as const;

/** Le courriel de notification est du HTML : le contenu visiteur y est échappé. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Formulaire : jamais mis en cache, jamais prerendu.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const corps = await lireCorpsJson(req);
  if (!corps.ok) {
    return NextResponse.json({ error: corps.erreur }, { status: corps.statut });
  }

  const nom = champTexte(corps.donnees, "nom");
  const courriel = champTexte(corps.donnees, "courriel");
  const telephone = champTexte(corps.donnees, "telephone");
  const message = champTexte(corps.donnees, "message");

  if (!nom || !courriel || !message) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel)) {
    return NextResponse.json({ error: "Courriel invalide." }, { status: 400 });
  }
  if (
    nom.length > MAX.nom ||
    courriel.length > MAX.courriel ||
    telephone.length > MAX.telephone ||
    message.length > MAX.message
  ) {
    return NextResponse.json({ error: "Un des champs est trop long." }, { status: 400 });
  }
  // Champs d'une ligne : un saut de ligne ou un caractère invisible est refusé,
  // jamais « nettoyé » en silence (c'est la signature d'une tentative d'injection).
  if (![nom, courriel, telephone].every(ligneSimpleValide) || !texteLongValide(message)) {
    return NextResponse.json({ error: "Un des champs contient des caractères non permis." }, { status: 400 });
  }

  // Limitation de débit : 3 soumissions par IP par heure.
  // Anti-robot (Turnstile) AVANT la limite de débit, l'écriture et le courriel :
  // un robot ne doit ni consommer le quota d'une IP, ni écrire dans la base.
  const antiRobot = await verifierAntiRobot(req, champTexte(corps.donnees, CHAMP_JETON));
  if (!antiRobot.ok) {
    return NextResponse.json({ error: antiRobot.erreur }, { status: antiRobot.statut });
  }

  const debit = await verifierDebit(req, "contact");
  if (!debit.permis) {
    return NextResponse.json({ error: debit.raison }, { status: 429 });
  }

  // Clé service_role, jamais exposée au navigateur. L'insertion ne dépend
  // donc plus de la politique RLS d'insertion publique, qui peut être
  // retirée (section 5 de migration_retention_ratelimit.sql).
  const supabase = supabaseService();

  // Save to Supabase
  const { error: dbError } = await supabase.from("contact_messages").insert({
    name: nom,
    email: courriel,
    phone: telephone,
    message,
  });

  if (dbError) {
    return NextResponse.json({ error: "Erreur lors de la sauvegarde." }, { status: 500 });
  }

  // Send email via Resend REST API (compatible edge runtime, sans SDK)
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Norvika Contact <contact@norvika.ca>",
      to: [TO_EMAIL],
      reply_to: courriel,
      // Texte simple, pas du HTML : l'échapper afficherait « &amp; » dans l'objet.
      subject: nettoyerObjet(`Nouveau message de ${nom}, Norvika`),
      html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f9fa; border-radius: 8px;">
        <h2 style="color: #19243a; margin-bottom: 24px;">Nouveau message via norvika.ca</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 120px;">Nom</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${esc(nom)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Courriel</td>
            <td style="padding: 8px 0;"><a href="mailto:${esc(courriel)}" style="color: #3557d4;">${esc(courriel)}</a></td>
          </tr>
          ${telephone ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Téléphone</td>
            <td style="padding: 8px 0; color: #111827;">${esc(telephone)}</td>
          </tr>` : ""}
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #ffffff; border-radius: 6px; border-left: 3px solid #3557d4;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Message</p>
          <p style="color: #111827; white-space: pre-wrap; margin: 0;">${esc(message)}</p>
        </div>
        <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
          Ce message a été envoyé depuis le formulaire de contact de norvika.ca.<br>
          Répondez directement à cet email pour répondre à ${esc(nom)}.
        </p>
      </div>
    `,
    }),
  });

  if (!emailRes.ok) {
    // Message saved to DB even if email fails, log but don't fail the request
    console.error("Resend error:", await emailRes.text());
  }

  return NextResponse.json({ ok: true });
}

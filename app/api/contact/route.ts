import { NextResponse } from "next/server";
import { supabaseService, verifierDebit } from "@/lib/rate-limit";

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

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const { nom, courriel, telephone, message } = body as {
    nom?: string;
    courriel?: string;
    telephone?: string;
    message?: string;
  };

  if (!nom?.trim() || !courriel?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel)) {
    return NextResponse.json({ error: "Courriel invalide." }, { status: 400 });
  }
  if (
    nom.trim().length > MAX.nom ||
    courriel.trim().length > MAX.courriel ||
    (telephone?.trim().length ?? 0) > MAX.telephone ||
    message.trim().length > MAX.message
  ) {
    return NextResponse.json({ error: "Un des champs est trop long." }, { status: 400 });
  }

  // Limitation de débit : 3 soumissions par IP par heure.
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
    name: nom.trim(),
    email: courriel.trim(),
    phone: telephone?.trim() || "",
    message: message.trim(),
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
      reply_to: courriel.trim(),
      subject: `Nouveau message de ${esc(nom.trim())}, Norvika`,
      html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f9fa; border-radius: 8px;">
        <h2 style="color: #19243a; margin-bottom: 24px;">Nouveau message via norvika.ca</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 120px;">Nom</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${esc(nom.trim())}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Courriel</td>
            <td style="padding: 8px 0;"><a href="mailto:${esc(courriel.trim())}" style="color: #3557d4;">${esc(courriel.trim())}</a></td>
          </tr>
          ${telephone?.trim() ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Téléphone</td>
            <td style="padding: 8px 0; color: #111827;">${esc(telephone.trim())}</td>
          </tr>` : ""}
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #ffffff; border-radius: 6px; border-left: 3px solid #3557d4;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Message</p>
          <p style="color: #111827; white-space: pre-wrap; margin: 0;">${esc(message.trim())}</p>
        </div>
        <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
          Ce message a été envoyé depuis le formulaire de contact de norvika.ca.<br>
          Répondez directement à cet email pour répondre à ${esc(nom.trim())}.
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

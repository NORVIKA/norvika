import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = "info@norvika.ca";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps invalide." }, { status: 400 });

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

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

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

  // Send email via Resend
  const { error: emailError } = await resend.emails.send({
    from: "Norvika Contact <onboarding@resend.dev>",
    to: [TO_EMAIL],
    replyTo: courriel.trim(),
    subject: `Nouveau message de ${nom.trim()} — Norvika`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f9fa; border-radius: 8px;">
        <h2 style="color: #19243a; margin-bottom: 24px;">Nouveau message via norvika.ca</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 120px;">Nom</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${nom.trim()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Courriel</td>
            <td style="padding: 8px 0;"><a href="mailto:${courriel.trim()}" style="color: #3557d4;">${courriel.trim()}</a></td>
          </tr>
          ${telephone?.trim() ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Téléphone</td>
            <td style="padding: 8px 0; color: #111827;">${telephone.trim()}</td>
          </tr>` : ""}
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #ffffff; border-radius: 6px; border-left: 3px solid #3557d4;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Message</p>
          <p style="color: #111827; white-space: pre-wrap; margin: 0;">${message.trim()}</p>
        </div>
        <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
          Ce message a été envoyé depuis le formulaire de contact de norvika.ca.<br>
          Répondez directement à cet email pour répondre à ${nom.trim()}.
        </p>
      </div>
    `,
  });

  if (emailError) {
    // Message saved to DB even if email fails — log but don't fail the request
    console.error("Resend error:", emailError);
  }

  return NextResponse.json({ ok: true });
}

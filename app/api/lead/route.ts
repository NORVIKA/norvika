import { NextResponse } from "next/server";
import { supabaseService, verifierDebit } from "@/lib/rate-limit";

/**
 * Formulaire « Espace client » de /bienvenue.
 *
 * Avant : LeadForm.tsx insérait DIRECTEMENT dans client_leads depuis le
 * navigateur avec la clé anonyme. Aucune validation serveur, aucune
 * limitation de débit possible, la protection reposant entièrement sur la
 * politique RLS d'insertion publique.
 *
 * Maintenant : le navigateur poste ici, le serveur valide, limite le débit,
 * puis insère avec la clé service_role (jamais exposée au navigateur).
 */

const MAX = { prenom: 100, courriel: 255, telephone: 50 } as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const { prenom, courriel, telephone } = body as {
    prenom?: string;
    courriel?: string;
    telephone?: string;
  };

  if (!prenom?.trim() || !courriel?.trim() || !telephone?.trim()) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel)) {
    return NextResponse.json({ error: "Courriel invalide." }, { status: 400 });
  }
  if (
    prenom.trim().length > MAX.prenom ||
    courriel.trim().length > MAX.courriel ||
    telephone.trim().length > MAX.telephone
  ) {
    return NextResponse.json({ error: "Un des champs est trop long." }, { status: 400 });
  }

  const debit = await verifierDebit(req, "lead");
  if (!debit.permis) {
    return NextResponse.json({ error: debit.raison }, { status: 429 });
  }

  const { error } = await supabaseService().from("client_leads").insert({
    prenom: prenom.trim(),
    courriel: courriel.trim(),
    telephone: telephone.trim(),
  });

  if (error) {
    console.error("Insertion client_leads:", error.message);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

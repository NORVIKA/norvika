import { NextResponse } from "next/server";
import { supabaseService, verifierDebit } from "@/lib/rate-limit";
import { CHAMP_JETON, verifierAntiRobot } from "@/lib/anti-robot";
import { envoyerCourrielInterne, esc, gabarit, ligne, lienCourriel } from "@/lib/courriel";
import { champTexte, formeCourrielValide, ligneSimpleValide, lireCorpsJson } from "@/lib/garde-formulaire";

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
 *
 * Depuis le 2026-11-16, un courriel part AUSSI vers info@norvika.ca : le /admin du site, seul
 * endroit où ces prospects se lisaient, a été retiré (audit de sécurité du bloc F). Même modèle
 * que /api/contact : l'écriture d'abord, le courriel ensuite, aucun accusé au visiteur.
 */

const MAX = { prenom: 100, courriel: 255, telephone: 50 } as const;

// Formulaire : jamais mis en cache, jamais prerendu.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const corps = await lireCorpsJson(req);
  if (!corps.ok) {
    return NextResponse.json({ error: corps.erreur }, { status: corps.statut });
  }

  const prenom = champTexte(corps.donnees, "prenom");
  const courriel = champTexte(corps.donnees, "courriel");
  const telephone = champTexte(corps.donnees, "telephone");

  if (!prenom || !courriel || !telephone) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }
  if (!formeCourrielValide(courriel)) {
    return NextResponse.json({ error: "Courriel invalide." }, { status: 400 });
  }
  if (prenom.length > MAX.prenom || courriel.length > MAX.courriel || telephone.length > MAX.telephone) {
    return NextResponse.json({ error: "Un des champs est trop long." }, { status: 400 });
  }
  if (![prenom, courriel, telephone].every(ligneSimpleValide)) {
    return NextResponse.json({ error: "Un des champs contient des caractères non permis." }, { status: 400 });
  }

  // Anti-robot (Turnstile) AVANT la limite de débit, l'écriture et le courriel :
  // un robot ne doit ni consommer le quota d'une IP, ni écrire dans la base.
  const antiRobot = await verifierAntiRobot(req, champTexte(corps.donnees, CHAMP_JETON));
  if (!antiRobot.ok) {
    return NextResponse.json({ error: antiRobot.erreur }, { status: antiRobot.statut });
  }

  const debit = await verifierDebit(req, "lead");
  if (!debit.permis) {
    return NextResponse.json({ error: debit.raison }, { status: 429 });
  }

  const { error } = await supabaseService().from("client_leads").insert({
    prenom,
    courriel,
    telephone,
  });

  if (error) {
    console.error("Insertion client_leads:", error.message);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde." }, { status: 500 });
  }

  await envoyerCourrielInterne({
    objet: `Nouveau client sur /bienvenue : ${prenom}, Norvika`,
    repondreA: courriel,
    html: gabarit({
      titre: "Nouveau client, formulaire Espace client",
      lignes: [ligne("Prénom", esc(prenom)), ligne("Courriel", lienCourriel(courriel)), ligne("Téléphone", esc(telephone))],
      note: `Envoyé depuis norvika.ca/bienvenue (page cachée, remise aux nouveaux clients). Aussi enregistré dans Supabase, table client_leads.<br>Répondez directement à ce courriel pour écrire à ${esc(prenom)}.`,
    }),
  });

  return NextResponse.json({ ok: true });
}

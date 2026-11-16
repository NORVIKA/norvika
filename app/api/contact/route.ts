import { NextResponse } from "next/server";
import { supabaseService, verifierDebit } from "@/lib/rate-limit";
import { CHAMP_JETON, verifierAntiRobot } from "@/lib/anti-robot";
import { envoyerCourrielInterne, esc, gabarit, ligne, lienCourriel } from "@/lib/courriel";
import { champTexte, ligneSimpleValide, lireCorpsJson, texteLongValide } from "@/lib/garde-formulaire";

/**
 * Formulaires de contact du site : bandeau du bas de page, page /contact, et la fin du quiz
 * /diagnostic (« Envoyez-moi une analyse globale de mon entreprise »).
 *
 * Le quiz passe par ICI plutôt que par une troisième route : c'est un message de contact avec du
 * contexte (nom, courriel, réponses, résultat), qui finit dans la même table, chez le même
 * destinataire, derrière les mêmes protections. /api/lead, lui, sert l'accueil des nouveaux clients
 * (/bienvenue) et exige un téléphone que le quiz ne demande pas.
 *
 * Ordre, le même pour les deux : corps (32 Ko) → champs → Turnstile → limite de débit → écriture
 * → courriel. Le quiz a son propre compteur (« diagnostic ») : avoir écrit par le bandeau ne doit
 * pas empêcher de recevoir son analyse.
 */

const MAX = { nom: 100, courriel: 255, telephone: 50, message: 5000 } as const;
/** Quiz : 7 questions aujourd'hui, de la marge si le Studio en ajoute. */
const MAX_DIAGNOSTIC = { lignes: 12, ligne: 300 } as const;

type Diagnostic = { resultat: string; barres: string[]; reponses: { question: string; reponse: string }[] };

/** Lit et valide le résumé du quiz. `null` si absent, `"invalide"` s'il ne respecte pas les limites. */
function lireDiagnostic(brut: unknown): Diagnostic | null | "invalide" {
  if (brut == null) return null;
  if (typeof brut !== "object" || Array.isArray(brut)) return "invalide";
  const d = brut as Record<string, unknown>;
  const texte = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const valide = (v: string) => v.length > 0 && v.length <= MAX_DIAGNOSTIC.ligne && ligneSimpleValide(v);

  const resultat = texte(d.resultat);
  const barres = Array.isArray(d.barres) ? d.barres.map(texte) : [];
  const reponses = Array.isArray(d.reponses)
    ? d.reponses.map((r) => {
        const o = r && typeof r === "object" ? (r as Record<string, unknown>) : {};
        return { question: texte(o.question), reponse: texte(o.reponse) };
      })
    : [];

  if (!valide(resultat)) return "invalide";
  if (barres.length > MAX_DIAGNOSTIC.lignes || !barres.every(valide)) return "invalide";
  if (!reponses.length || reponses.length > MAX_DIAGNOSTIC.lignes) return "invalide";
  if (!reponses.every((r) => valide(r.question) && valide(r.reponse))) return "invalide";
  return { resultat, barres, reponses };
}

/** Le résumé du quiz en texte, tel qu'il est enregistré dans contact_messages.message. */
function texteDiagnostic(d: Diagnostic): string {
  return [
    `Diagnostic : ${d.resultat}`,
    ...d.barres,
    "",
    ...d.reponses.map((r, i) => `${i + 1}. ${r.question}\n   ${r.reponse}`),
  ].join("\n");
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
  const diagnostic = lireDiagnostic(corps.donnees.diagnostic);
  if (diagnostic === "invalide") {
    return NextResponse.json({ error: "Le résumé du diagnostic est invalide. Rechargez la page et réessayez." }, { status: 400 });
  }
  // Le quiz n'a pas de champ « message » : le message, c'est le résumé de ses réponses.
  const message = diagnostic ? texteDiagnostic(diagnostic) : champTexte(corps.donnees, "message");

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

  // Anti-robot (Turnstile) AVANT la limite de débit, l'écriture et le courriel :
  // un robot ne doit ni consommer le quota d'une IP, ni écrire dans la base.
  const antiRobot = await verifierAntiRobot(req, champTexte(corps.donnees, CHAMP_JETON));
  if (!antiRobot.ok) {
    return NextResponse.json({ error: antiRobot.erreur }, { status: antiRobot.statut });
  }

  // Limitation de débit : 3 soumissions par IP par heure, par formulaire.
  const debit = await verifierDebit(req, diagnostic ? "diagnostic" : "contact");
  if (!debit.permis) {
    return NextResponse.json({ error: debit.raison }, { status: 429 });
  }

  // Clé service_role, jamais exposée au navigateur : l'insertion ne dépend d'aucune politique RLS.
  const { error: dbError } = await supabaseService().from("contact_messages").insert({
    name: nom,
    email: courriel,
    phone: telephone,
    message,
  });

  if (dbError) {
    console.error("Insertion contact_messages:", dbError.message);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde." }, { status: 500 });
  }

  const lignes = [ligne("Nom", esc(nom)), ligne("Courriel", lienCourriel(courriel))];
  if (telephone) lignes.push(ligne("Téléphone", esc(telephone)));

  if (diagnostic) {
    lignes.push(ligne("Résultat", esc(diagnostic.resultat)));
    diagnostic.barres.forEach((b) => lignes.push(ligne("", esc(b))));
    await envoyerCourrielInterne({
      objet: `Diagnostic de ${nom}, Norvika`,
      repondreA: courriel,
      html: gabarit({
        titre: "Demande d’analyse globale (quiz /diagnostic)",
        lignes,
        bloc: `
        <div style="margin-top: 20px; padding: 16px; background: #ffffff; border-radius: 6px; border-left: 3px solid #3557d4;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Réponses au quiz</p>
          <ol style="color: #111827; margin: 0; padding-left: 20px;">${diagnostic.reponses
            .map(
              (r) => `
            <li style="margin: 0 0 10px;"><span style="color: #6b7280;">${esc(r.question)}</span><br>${esc(r.reponse)}</li>`,
            )
            .join("")}
          </ol>
        </div>`,
        note: `Envoyé depuis le quiz de norvika.ca/diagnostic. La personne attend une analyse personnalisée.<br>Répondez directement à ce courriel pour écrire à ${esc(nom)}.`,
      }),
    });
    return NextResponse.json({ ok: true });
  }

  await envoyerCourrielInterne({
    objet: `Nouveau message de ${nom}, Norvika`,
    repondreA: courriel,
    html: gabarit({
      titre: "Nouveau message via norvika.ca",
      lignes,
      bloc: `
        <div style="margin-top: 20px; padding: 16px; background: #ffffff; border-radius: 6px; border-left: 3px solid #3557d4;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Message</p>
          <p style="color: #111827; white-space: pre-wrap; margin: 0;">${esc(message)}</p>
        </div>`,
      note: `Ce message a été envoyé depuis le formulaire de contact de norvika.ca.<br>Répondez directement à ce courriel pour répondre à ${esc(nom)}.`,
    }),
  });

  return NextResponse.json({ ok: true });
}

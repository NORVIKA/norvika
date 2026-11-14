import Link from "next/link";
import type { CSSProperties } from "react";

/**
 * Mention de collecte, sous CHAQUE formulaire (Loi 25, art. 8 ; CHECKLIST-LOI25 C3).
 * Elle couvre : les fins, les moyens, les fournisseurs et le traitement hors du
 * Québec, les droits d'accès et de rectification, le retrait du consentement.
 * Avant le 2026-11-14, les formulaires disaient seulement « vos données servent
 * à répondre à votre message », ce qui ne couvrait ni les tiers ni les droits.
 *
 * Déclarée une seule fois (règle design 5) : les trois formulaires l'importent.
 * Lisible, jamais en gris pâle minuscule : la couleur vient du parent.
 */
export function MentionCollecte({ id, style }: { id?: string; style?: CSSProperties }) {
  return (
    <p id={id} style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, ...style }}>
      Norvika recueille ces renseignements par ce formulaire pour répondre à votre demande et en faire
      le suivi, rien d’autre. Ils sont conservés chez Supabase et passent par Cloudflare (site),
      Resend (envoi du courriel) et Google (notre messagerie), qui peuvent les traiter hors du Québec.
      Vous pouvez en tout temps les consulter, les faire corriger ou supprimer, ou retirer votre
      consentement, en écrivant à info@norvika.ca. Détails dans notre{" "}
      <Link href="/politique-de-confidentialite" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
        politique de confidentialité
      </Link>
      .
    </p>
  );
}

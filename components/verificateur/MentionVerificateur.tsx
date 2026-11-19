import Link from "next/link";

/**
 * Mention de collecte du vérificateur Loi 25 (art. 8), sous le champ d'adresse. Texte de Martin,
 * dans le Studio ; les mots `lien` (« politique de confidentialité ») deviennent le lien vers notre
 * politique. Même taille et même couleur lisible que la mention des autres formulaires
 * (components/site/MentionCollecte.tsx) : jamais en gris pâle minuscule.
 */
export function MentionVerificateur({ id, texte, lien }: { id: string; texte: string; lien: string }) {
  const position = lien ? texte.lastIndexOf(lien) : -1;
  return (
    <p id={id} style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
      {position < 0 ? (
        texte
      ) : (
        <>
          {texte.slice(0, position)}
          <Link href="/politique-de-confidentialite" className="nv-lien-texte" style={{ color: "inherit" }}>
            {lien}
          </Link>
          {texte.slice(position + lien.length)}
        </>
      )}
    </p>
  );
}

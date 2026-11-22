"use client";

import { useContenuGlobal } from "@/components/site/ContenuGlobal";
import { lienTelephone } from "@/lib/telephone";

/**
 * Le numéro de téléphone du menu déroulant (téléphone et tablette). Il n'est plus dans la barre
 * d'ordinateur depuis le 2026-11-22 (décision de William : place au lien du vérificateur Loi 25).
 *
 * Le numéro visible EST le texte du lien (pas d'icône à deviner). Les lecteurs d'écran entendent
 * « Appeler Norvika au 438 522 4275 » : le texte visible est contenu dans le nom accessible
 * (WCAG 2.5.3). Numéro : « Infos de l'entreprise » ; phrase : « Menu et pied de page ».
 */
export function LienTelephone({ onClick }: { onClick?: () => void }) {
  const { parametres, navigation } = useContenuGlobal();
  return (
    <a
      href={lienTelephone(parametres.telephone)}
      aria-label={`${navigation.enteteTelephone} ${parametres.telephone}`}
      className="nv-tel nv-tel-panneau"
      onClick={onClick}
    >
      {parametres.telephone}
    </a>
  );
}

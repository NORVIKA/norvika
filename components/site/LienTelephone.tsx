"use client";

import { useContenuGlobal } from "@/components/site/ContenuGlobal";
import { lienTelephone } from "@/lib/telephone";

/**
 * Le numéro de téléphone de la barre du haut, déclaré une fois pour ses deux places : à droite du
 * menu sur ordinateur (`entete`), dans le menu déroulant sur téléphone et tablette (`panneau`).
 *
 * Le numéro visible EST le texte du lien (pas d'icône à deviner). Les lecteurs d'écran entendent
 * « Appeler Norvika au 438 522 4275 » : le texte visible est contenu dans le nom accessible
 * (WCAG 2.5.3). Numéro : « Infos de l'entreprise » ; phrase : « Menu et pied de page ».
 */
export function LienTelephone({ variante, onClick }: { variante: "entete" | "panneau"; onClick?: () => void }) {
  const { parametres, navigation } = useContenuGlobal();
  return (
    <a
      href={lienTelephone(parametres.telephone)}
      aria-label={`${navigation.enteteTelephone} ${parametres.telephone}`}
      className={variante === "entete" ? "nv-tel nv-tel-entete" : "nv-tel nv-tel-panneau"}
      onClick={onClick}
    >
      {parametres.telephone}
    </a>
  );
}

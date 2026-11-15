"use client";

import { useContenuGlobal } from "@/components/site/ContenuGlobal";

/**
 * « © année nom légal » du pied de page, déclaré une fois : pied de page complet (avec la mention
 * qui suit, ex. « Québec et Rive-Sud de Montréal ») et pied réduit du quiz (`court`).
 * L'année est calculée au build (lib/contenu.ts), jamais écrite à la main ; le nom légal vient de
 * « Infos de l'entreprise », la mention de « Menu et pied de page ».
 */
export function MentionDroits({ court = false }: { court?: boolean }) {
  const { parametres, navigation, annee } = useContenuGlobal();
  const mention = !court && navigation.piedMention ? ` · ${navigation.piedMention}` : "";
  return <>{`© ${annee} ${parametres.nomLegal}${mention}`}</>;
}

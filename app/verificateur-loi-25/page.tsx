import type { Metadata } from "next";

import { SiteShell } from "@/components/site/SiteShell";
import { Verificateur } from "@/components/verificateur/Verificateur";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";
import { insecablesPartout } from "@/lib/typographie";
import { CHEMIN_VERIFICATEUR } from "@/lib/verificateur/types";

/**
 * Vérificateur Loi 25. La page est STATIQUE (○) : textes de la page « Vérificateur Loi 25 » du
 * Studio, figés au build. Seule l'analyse est dynamique (route /api/verificateur-loi-25).
 * Sans JavaScript, la page montre déjà les huit points vérifiés et leur « pourquoi ».
 */
export async function generateMetadata(): Promise<Metadata> {
  const { verificateur, parametres } = await obtenirContenu();
  return metaPage(verificateur, CHEMIN_VERIFICATEUR, parametres);
}

// Même raison que dans app/layout.tsx : page statique, rebâtie à chaque publication du Studio.
export const dynamic = "force-static";

export default async function PageVerificateur() {
  const { verificateur, parametres } = await obtenirContenu();
  return (
    <SiteShell>
      <Verificateur t={insecablesPartout(verificateur)} lienRendezVous={parametres.lienRendezVous} />
    </SiteShell>
  );
}

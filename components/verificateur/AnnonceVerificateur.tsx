import Link from "next/link";

import type { PageVerificateur } from "@/lib/types-contenu";
import { CHEMIN_VERIFICATEUR } from "@/lib/verificateur/types";

/**
 * Le bloc qui annonce le vérificateur Loi 25, déclaré une seule fois (règle 5) : page Sites web
 * et accueil (ajouté sur l'accueil le 2026-11-22, à la demande de William, qui ne trouvait pas
 * l'outil). Même texte aux deux endroits : il vient du bloc « Annonce » de la page
 * « Vérificateur Loi 25 » du Studio. Chaque page décide seule si elle l'affiche.
 */
export function AnnonceVerificateur({ annonce }: { annonce: PageVerificateur["blocSitesWeb"] }) {
  return (
    <section style={{ borderBottom: "1px solid rgba(12,25,47,.1)", background: "#ffffff" }}>
      {/* Le conteneur des autres sections (nv-shell), pas celui de la page de l'outil : ses marges
          suivent celles des sections voisines à chaque largeur (24 px en tablette, 18 au téléphone). */}
      <div className="nv-shell" style={{ maxWidth: 1240, margin: "0 auto", padding: "72px 32px" }}>
        <div className="nv-verif-annonce">
          <div>
            <h2>{annonce.titre}</h2>
            <p>{annonce.texte}</p>
          </div>
          <Link href={CHEMIN_VERIFICATEUR} className="nv-btn-cream">
            {annonce.bouton}
          </Link>
        </div>
      </div>
    </section>
  );
}

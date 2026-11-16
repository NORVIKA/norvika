import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/site/SiteShell";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";
import { pagesDuSite } from "@/lib/pages-du-site";
import { apostrophes } from "@/lib/typographie";

/**
 * Plan du site (document de référence vitrine, phase 3 : « page plan du site liée au pied de page »).
 * Textes : page « Plan du site » du Studio. Liste : lib/pages-du-site.ts (la même que le sitemap et
 * /llms.txt), avec le nom et la description dans Google de chaque page ; les fiches des réalisations
 * s'ajoutent toutes seules, en ordre alphabétique (on cherche un nom, on ne lit pas un classement).
 */
export async function generateMetadata(): Promise<Metadata> {
  const { planDuSite, parametres } = await obtenirContenu();
  return metaPage(planDuSite, "/plan-du-site", parametres);
}

// Même raison que dans app/layout.tsx : page statique, rebâtie à chaque publication du Studio.
export const dynamic = "force-static";

export default async function PlanDuSitePage() {
  const contenu = await obtenirContenu();
  const { planDuSite: t } = contenu;
  const pages = pagesDuSite(contenu);
  const fiches = [...contenu.realisations].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  return (
    <SiteShell>
      <section className="nv-plan-entete">
        <div className="nv-plan-cadre">
          <h1>{t.h1}</h1>
          <p>{t.intro}</p>
        </div>
      </section>

      <div className="nv-plan-cadre nv-plan-corps">
        <section aria-labelledby="plan-pages">
          <h2 id="plan-pages">{t.titrePages}</h2>
          <ul className="nv-plan-pages">
            {pages.map((p) => (
              <li key={p.chemin}>
                <Link href={p.chemin} className="nv-plan-lien">
                  {p.nom}
                </Link>
                {/* La description dans Google garde ce qui a été écrit dans le Studio : les
                    apostrophes deviennent typographiques à l'affichage seulement. */}
                {p.description ? <p>{apostrophes(p.description)}</p> : null}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="plan-realisations">
          <h2 id="plan-realisations">{t.titreRealisations}</h2>
          <ul className="nv-plan-fiches">
            {fiches.map((r) => (
              <li key={r.slug}>
                <Link href={`/realisations/${r.slug}`} className="nv-plan-lien">
                  {r.nom}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SiteShell>
  );
}

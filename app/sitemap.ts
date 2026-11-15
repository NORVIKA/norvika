import type { MetadataRoute } from "next";
import { obtenirContenu } from "@/lib/contenu";
import { adresseAbsolue as adresse } from "@/lib/adresse";
import { pagePlanDuSite, pagesDuSite } from "@/lib/pages-du-site";

// Pages et fiches : la liste unique de lib/pages-du-site.ts. Une fiche publiée dans le Studio entre au
// sitemap à la publication. Dates : la vraie dernière modification dans Sanity (`_updatedAt`), et non
// plus l'heure du build (avant le 2026-11-15, Google voyait toutes les pages changer à chaque
// publication, ce qui lui apprend à ignorer la date).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contenu = await obtenirContenu();

  const pages: MetadataRoute.Sitemap = [...pagesDuSite(contenu), pagePlanDuSite(contenu)]
    .filter((p) => !p.cacheeDeGoogle)
    .map((p) => ({
      url: adresse(p.chemin),
      ...(p.modifie ? { lastModified: p.modifie } : {}),
      changeFrequency: p.frequence,
      priority: p.priorite,
    }));

  const realisations: MetadataRoute.Sitemap = contenu.realisations.map((c) => ({
    url: adresse(`/realisations/${c.slug}`),
    lastModified: c._updatedAt,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...pages, ...realisations];
}

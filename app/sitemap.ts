import type { MetadataRoute } from "next";
import { CLIENTS } from "@/lib/realisations";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://norvika.ca";
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/sites-web`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/automatisation`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/photo-et-video`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/formation`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/realisations`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/equipe`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/diagnostic`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];

  const realisations: MetadataRoute.Sitemap = CLIENTS.map((c) => ({
    url: `${base}/realisations/${c.slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...pages, ...realisations];
}

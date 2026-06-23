import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://norvika.ca";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/sites-web`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/automatisation`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/photo-video`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/bienvenue`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/politique-de-confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}

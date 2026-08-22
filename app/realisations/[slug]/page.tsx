import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CLIENTS, getClient } from "@/lib/realisations";
import Content from "./Content";

// Les 20+ fiches sont connues au build : on les prerend toutes pour que le
// Worker serve du HTML deja pret au lieu de le rebatir a chaque visite.
export function generateStaticParams() {
  return CLIENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const client = getClient(slug);
  if (!client) {
    return { title: { absolute: "Réalisation introuvable | Norvika" }, robots: { index: false } };
  }
  const title = `${client.name} | Réalisations Norvika`;
  return {
    title: { absolute: title },
    description: client.summary,
    alternates: { canonical: `/realisations/${client.slug}` },
    openGraph: {
      title,
      description: client.summary,
      type: "article",
      url: `/realisations/${client.slug}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();

  // Fil d'Ariane structuré : aide Google et les moteurs IA à situer la page
  // dans le site (Accueil > Réalisations > Client).
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://norvika.ca" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Réalisations",
        item: "https://norvika.ca/realisations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: client.name,
        item: `https://norvika.ca/realisations/${client.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Content slug={slug} />
    </>
  );
}

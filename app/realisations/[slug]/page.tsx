import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenirContenu } from "@/lib/contenu";
import Content from "./Content";

// Les fiches sont connues au build (une par réalisation du Studio) : on les prerend toutes pour
// que le Worker serve du HTML deja pret au lieu de le rebatir a chaque visite.
export async function generateStaticParams() {
  const { realisations } = await obtenirContenu();
  return realisations.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { realisations, realisationsPage, page404 } = await obtenirContenu();
  const client = realisations.find((c) => c.slug === slug);
  if (!client) {
    return { title: { absolute: page404.realisationOnglet }, robots: { index: false } };
  }
  const title = `${client.nom} ${realisationsPage.ficheOnglet}`;
  return {
    title: { absolute: title },
    description: client.resume,
    alternates: { canonical: `/realisations/${client.slug}` },
    openGraph: {
      title,
      description: client.resume,
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
  const { realisations, realisationsPage, navigation } = await obtenirContenu();
  const client = realisations.find((c) => c.slug === slug);
  if (!client) notFound();

  // Fil d'Ariane structuré : aide Google et les moteurs IA à situer la page
  // dans le site (Accueil > Réalisations > Client).
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: navigation.filArianeAccueil, item: "https://norvika.ca" },
      {
        "@type": "ListItem",
        position: 2,
        name: realisationsPage.surtitre,
        item: "https://norvika.ca/realisations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: client.nom,
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
      <Content client={client} page={realisationsPage} />
    </>
  );
}

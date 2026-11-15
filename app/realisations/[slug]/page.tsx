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
  const { realisations, realisationsPage } = await obtenirContenu();
  const client = realisations.find((c) => c.slug === slug);
  if (!client) notFound();

  // Le fil d'Ariane visible et ses données structurées (BreadcrumbList) sont produits ensemble par
  // components/site/FilAriane.tsx, dans la fiche : ce que Google lit est ce qu'on voit.
  return <Content client={client} page={realisationsPage} />;
}

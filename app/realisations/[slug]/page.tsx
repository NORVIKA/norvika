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
  if (!getClient(slug)) notFound();
  return <Content slug={slug} />;
}

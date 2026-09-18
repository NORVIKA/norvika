import type { Metadata } from "next";
import Content from "./Content";
import SchemaService from "@/components/site/SchemaService";

export const metadata: Metadata = {
  title: { absolute: "Photo et vidéo d'entreprise à Québec | Norvika" },
  description: "Photo et vidéo pour les entreprises de la ville de Québec, de la Rive-Sud de Montréal et de partout en province : des images qui montrent votre entreprise telle qu'elle est, vraie, professionnelle et reconnaissable.",
  alternates: { canonical: "/photo-et-video" },
  openGraph: { title: "Photo et vidéo d'entreprise à Québec | Norvika", description: "Photo et vidéo pour les entreprises de la ville de Québec, de la Rive-Sud de Montréal et de partout en province : des images qui montrent votre entreprise telle qu'elle est, vraie, professionnelle et reconnaissable.", url: "/photo-et-video" },
};

export default function Page() {
  return (
    <>
      <SchemaService nom="Photo et vidéo d'entreprise" type="Photo et vidéo" description="Photo et vidéo pour les entreprises de la ville de Québec, de la Rive-Sud de Montréal et de partout en province : des images qui montrent votre entreprise telle qu'elle est, vraie, professionnelle et reconnaissable." chemin="/photo-et-video" />
      <Content />
    </>
  );
}

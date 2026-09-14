import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Photo et vidéo pour entreprises à Beloeil et sur la Rive-Sud | Norvika" },
  description: "Photo et vidéo pour les entreprises de Beloeil, de la Rive-Sud de Montréal et du Québec : des images qui montrent votre entreprise telle qu'elle est, vraie, professionnelle et reconnaissable.",
  alternates: { canonical: "/photo-et-video" },
  openGraph: { title: "Photo et vidéo pour entreprises à Beloeil et sur la Rive-Sud | Norvika", description: "Photo et vidéo pour les entreprises de Beloeil, de la Rive-Sud de Montréal et du Québec : des images qui montrent votre entreprise telle qu'elle est, vraie, professionnelle et reconnaissable.", url: "/photo-et-video" },
};

export default function Page() {
  return <Content />;
}

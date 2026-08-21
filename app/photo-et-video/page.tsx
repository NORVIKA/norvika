import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Photo et vidéo professionnelles | Norvika" },
  description: "Des photos et vidéos qui montrent votre entreprise telle qu'elle est: vraie, professionnelle et reconnaissable.",
  alternates: { canonical: "/photo-et-video" },
  openGraph: { title: "Photo et vidéo professionnelles | Norvika", description: "Des photos et vidéos qui montrent votre entreprise telle qu'elle est: vraie, professionnelle et reconnaissable.", url: "/photo-et-video" },
};

export default function Page() {
  return <Content />;
}

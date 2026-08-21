import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Formation | Norvika" },
  description: "On forme votre équipe sur place: photo et vidéo, site web, outils numériques. Pour que ce qui vous appartient, vous sachiez le faire vous-mêmes.",
  alternates: { canonical: "/formation" },
  openGraph: { title: "Formation | Norvika", description: "On forme votre équipe sur place: photo et vidéo, site web, outils numériques. Autonomes après, pas dépendants.", url: "/formation" },
};

export default function Page() {
  return <Content />;
}

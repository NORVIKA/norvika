import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Nos réalisations | Norvika" },
  description: "Les entreprises de la ville de Québec, de la Rive-Sud de Montréal et de partout en province qui nous font confiance : sites web, photo et vidéo, automatisation et formation. Cliquez sur un logo pour voir le mandat.",
  alternates: { canonical: "/realisations" },
  openGraph: { title: "Nos réalisations | Norvika", description: "Les entreprises de la ville de Québec, de la Rive-Sud de Montréal et de partout en province qui nous font confiance : sites web, photo et vidéo, automatisation et formation.", url: "/realisations" },
};

export default function Page() {
  return <Content />;
}

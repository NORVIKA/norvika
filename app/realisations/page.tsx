import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Réalisations : sites web et vidéo pour PME de la Rive-Sud | Norvika" },
  description: "Les entreprises de Beloeil, de la Rive-Sud de Montréal et d'ailleurs au Québec qui nous font confiance : sites web, photo et vidéo, automatisation et formation. Cliquez sur un logo pour voir le mandat.",
  alternates: { canonical: "/realisations" },
  openGraph: { title: "Réalisations : sites web et vidéo pour PME de la Rive-Sud | Norvika", description: "Les entreprises de Beloeil, de la Rive-Sud de Montréal et d'ailleurs au Québec qui nous font confiance : sites web, photo et vidéo, automatisation et formation.", url: "/realisations" },
};

export default function Page() {
  return <Content />;
}

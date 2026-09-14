import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Création de sites web à Beloeil et sur la Rive-Sud | Norvika" },
  description: "Création de sites web sur mesure pour les PME de Beloeil, de la Rive-Sud de Montréal et de partout au Québec. Sans gabarit générique, conçus pour convertir vos visiteurs en clients.",
  alternates: { canonical: "/sites-web" },
  openGraph: { title: "Création de sites web à Beloeil et sur la Rive-Sud | Norvika", description: "Création de sites web sur mesure pour les PME de Beloeil, de la Rive-Sud de Montréal et de partout au Québec. Sans gabarit générique, conçus pour convertir vos visiteurs en clients.", url: "/sites-web" },
};

export default function Page() {
  return <Content />;
}

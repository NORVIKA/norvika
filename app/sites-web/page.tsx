import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Sites web sur mesure à Québec | Norvika" },
  description: "Création de sites web sur mesure pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province. Sans gabarit générique, conçus pour convertir vos visiteurs en clients.",
  alternates: { canonical: "/sites-web" },
  openGraph: { title: "Sites web sur mesure à Québec | Norvika", description: "Création de sites web sur mesure pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province. Sans gabarit générique, conçus pour convertir vos visiteurs en clients.", url: "/sites-web" },
};

export default function Page() {
  return <Content />;
}

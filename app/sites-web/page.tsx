import type { Metadata } from "next";
import Content from "./Content";
import SchemaService from "@/components/site/SchemaService";

export const metadata: Metadata = {
  title: { absolute: "Sites web sur mesure à Québec | Norvika" },
  description: "Création de sites web sur mesure pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province. Sans gabarit générique, conçus pour convertir vos visiteurs en clients.",
  alternates: { canonical: "/sites-web" },
  openGraph: { title: "Sites web sur mesure à Québec | Norvika", description: "Création de sites web sur mesure pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province. Sans gabarit générique, conçus pour convertir vos visiteurs en clients.", url: "/sites-web" },
};

export default function Page() {
  return (
    <>
      <SchemaService nom="Création de sites web sur mesure" type="Création de sites web" description="Création de sites web sur mesure pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province. Sans gabarit générique, conçus pour convertir vos visiteurs en clients." chemin="/sites-web" />
      <Content />
    </>
  );
}

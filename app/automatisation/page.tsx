import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Automatisation pour PME à Québec | Norvika" },
  description: "Automatisation pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province : on vous aide à comprendre vos outils, choisir ce qui manque, et retrouver du temps pour ce qui compte.",
  alternates: { canonical: "/automatisation" },
  openGraph: { title: "Automatisation pour PME à Québec | Norvika", description: "Automatisation pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province : on vous aide à comprendre vos outils, choisir ce qui manque, et retrouver du temps pour ce qui compte.", url: "/automatisation" },
};

export default function Page() {
  return <Content />;
}

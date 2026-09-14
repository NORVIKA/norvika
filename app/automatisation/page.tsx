import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Automatisation pour les PME de Beloeil et de la Rive-Sud | Norvika" },
  description: "Automatisation pour les PME de Beloeil, de la Rive-Sud de Montréal et de partout au Québec : on vous aide à comprendre vos outils, choisir ce qui manque, et retrouver du temps pour ce qui compte.",
  alternates: { canonical: "/automatisation" },
  openGraph: { title: "Automatisation pour les PME de Beloeil et de la Rive-Sud | Norvika", description: "Automatisation pour les PME de Beloeil, de la Rive-Sud de Montréal et de partout au Québec : on vous aide à comprendre vos outils, choisir ce qui manque, et retrouver du temps pour ce qui compte.", url: "/automatisation" },
};

export default function Page() {
  return <Content />;
}

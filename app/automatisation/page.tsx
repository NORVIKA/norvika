import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Automatisation | Norvika" },
  description: "On vous aide à comprendre vos outils, choisir ce qui manque, et retrouver du temps pour ce qui compte.",
  alternates: { canonical: "/automatisation" },
  openGraph: { title: "Automatisation | Norvika", description: "On vous aide à comprendre vos outils, choisir ce qui manque, et retrouver du temps pour ce qui compte.", url: "/automatisation" },
};

export default function Page() {
  return <Content />;
}

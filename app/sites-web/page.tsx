import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Sites web sur mesure | Norvika" },
  description: "Un site qui vous ressemble et qui travaille pour vous. Sites web sur mesure, sans gabarit générique, conçus pour convertir vos visiteurs en clients.",
  alternates: { canonical: "/sites-web" },
  openGraph: { title: "Sites web sur mesure | Norvika", description: "Un site qui vous ressemble et qui travaille pour vous. Sites web sur mesure, sans gabarit générique, conçus pour convertir vos visiteurs en clients.", url: "/sites-web" },
};

export default function Page() {
  return <Content />;
}

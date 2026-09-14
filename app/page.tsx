import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Norvika · Vos courtiers des outils numériques" },
  description:
    "Sites web, automatisation, photo et vidéo pour les PME de la ville de Québec, de la Rive-Sud de Montréal et de partout en province. On comprend votre réalité, puis on bâtit une offre qui vous ressemble.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Norvika · Vos courtiers des outils numériques",
    description:
      "Sites web, automatisation, photo et vidéo. 30 minutes gratuites pour comprendre ce qui vous freine.",
    url: "/",
  },
};

export default function Page() {
  return <Content />;
}

import type { Metadata } from "next";
import Content from "./Content";

const OG_IMAGE = "/assets/lau-et-will-2.webp";

export const metadata: Metadata = {
  title: { absolute: "L'équipe | Norvika" },
  description:
    "Norvika, c'est Laurianne et William. Deux façons de penser qui se complètent, un même but: que la technologie vous serve, pas l'inverse.",
  alternates: { canonical: "/equipe" },
  openGraph: {
    title: "L'équipe | Norvika",
    description:
      "Norvika, c'est Laurianne et William. On rattache l'humain à l'efficience.",
    url: "/equipe",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function Page() {
  return <Content />;
}

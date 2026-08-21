import type { Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: { absolute: "Diagnostic gratuit | Norvika" },
  description: "Répondez à sept questions pour découvrir ce qui freine le plus votre entreprise: votre site, votre temps ou votre image.",
  alternates: { canonical: "/diagnostic" },
  openGraph: { title: "Diagnostic gratuit | Norvika", description: "Répondez à sept questions pour découvrir ce qui freine le plus votre entreprise: votre site, votre temps ou votre image.", url: "/diagnostic" },
};

export default function Page() {
  return <Content />;
}

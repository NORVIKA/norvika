import type { Metadata } from "next";
import Content from "./Content";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const { accueil, parametres } = await obtenirContenu();
  return metaPage(accueil, "/", parametres);
}

export default async function Page() {
  const { accueil, avis } = await obtenirContenu();
  return <Content page={accueil} avisListe={avis} />;
}

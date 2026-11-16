import type { Metadata } from "next";
import Content from "./Content";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const { realisationsPage, parametres } = await obtenirContenu();
  return metaPage(realisationsPage, "/realisations", parametres);
}

export default async function Page() {
  const { realisationsPage, realisations } = await obtenirContenu();
  return <Content page={realisationsPage} realisations={realisations} />;
}

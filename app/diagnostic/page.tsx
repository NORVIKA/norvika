import type { Metadata } from "next";
import Content from "./Content";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const { diagnostic, parametres } = await obtenirContenu();
  return metaPage(diagnostic, "/diagnostic", parametres);
}

export default async function Page() {
  const { diagnostic } = await obtenirContenu();
  return <Content page={diagnostic} />;
}

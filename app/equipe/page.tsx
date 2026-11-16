import type { Metadata } from "next";
import Content from "./Content";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const { equipe, parametres } = await obtenirContenu();
  return metaPage(equipe, "/equipe", parametres);
}

export default async function Page() {
  const { equipe, membres } = await obtenirContenu();
  return <Content page={equipe} membres={membres} />;
}

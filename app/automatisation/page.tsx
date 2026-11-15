import type { Metadata } from "next";
import Content from "./Content";
import SchemaService from "@/components/site/SchemaService";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const { automatisation } = await obtenirContenu();
  return metaPage(automatisation, "/automatisation");
}

export default async function Page() {
  const { automatisation, parametres } = await obtenirContenu();
  return (
    <>
      <SchemaService
        nom={automatisation.schemaNom}
        type={automatisation.schemaType}
        description={automatisation.seoDescription}
        chemin="/automatisation"
        parametres={parametres}
      />
      <Content page={automatisation} />
    </>
  );
}

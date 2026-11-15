import type { Metadata } from "next";
import Content from "./Content";
import SchemaService from "@/components/site/SchemaService";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const { formation } = await obtenirContenu();
  return metaPage(formation, "/formation");
}

export default async function Page() {
  const { formation, parametres } = await obtenirContenu();
  return (
    <>
      <SchemaService
        nom={formation.schemaNom}
        type={formation.schemaType}
        description={formation.seoDescription}
        chemin="/formation"
        parametres={parametres}
      />
      <Content page={formation} />
    </>
  );
}

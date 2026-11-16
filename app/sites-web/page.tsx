import type { Metadata } from "next";
import Content from "./Content";
import SchemaService from "@/components/site/SchemaService";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const { sitesWeb, parametres } = await obtenirContenu();
  return metaPage(sitesWeb, "/sites-web", parametres);
}

export default async function Page() {
  const { sitesWeb, parametres } = await obtenirContenu();
  return (
    <>
      <SchemaService
        nom={sitesWeb.schemaNom}
        type={sitesWeb.schemaType}
        description={sitesWeb.seoDescription}
        chemin="/sites-web"
        parametres={parametres}
      />
      <Content page={sitesWeb} />
    </>
  );
}

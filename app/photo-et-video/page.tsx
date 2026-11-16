import type { Metadata } from "next";
import Content from "./Content";
import SchemaService from "@/components/site/SchemaService";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const { photoVideo, parametres } = await obtenirContenu();
  return metaPage(photoVideo, "/photo-et-video", parametres);
}

export default async function Page() {
  const { photoVideo, parametres } = await obtenirContenu();
  return (
    <>
      <SchemaService
        nom={photoVideo.schemaNom}
        type={photoVideo.schemaType}
        description={photoVideo.seoDescription}
        chemin="/photo-et-video"
        parametres={parametres}
      />
      <Content page={photoVideo} />
    </>
  );
}

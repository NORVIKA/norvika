import { obtenirContenu } from "@/lib/contenu";
import { variantesAffiche } from "@/lib/fond-video";

/**
 * /fond-accueil/<fichier>.webp : l'image d'attente de la vidéo du haut de l'accueil, copiée du CDN de
 * Sanity AU BUILD, puis servie par le site lui-même (pourquoi : lib/fond-video.ts). Aucune image en
 * dur : la liste des fichiers vient de l'« Accueil » du Studio, à chaque publication.
 *
 * ⛔ Une copie ratée ARRÊTE la construction (même règle que la lecture du contenu, lib/contenu.ts) :
 *    mieux vaut un déploiement refusé qu'un accueil dont l'image principale répond 404.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

async function variantes() {
  const { accueil } = await obtenirContenu();
  return variantesAffiche(accueil.heroVideo?.affiche);
}

export async function generateStaticParams() {
  return (await variantes()).map((v) => ({ fichier: v.fichier }));
}

export async function GET(_requete: Request, { params }: { params: Promise<{ fichier: string }> }) {
  const { fichier } = await params;
  const variante = (await variantes()).find((v) => v.fichier === fichier);
  if (!variante) return new Response(null, { status: 404 });

  const reponse = await fetch(variante.source);
  const type = reponse.headers.get("content-type") ?? "";
  if (!reponse.ok || !type.startsWith("image/")) {
    throw new Error(`Image d'attente de l'accueil : ${variante.source} a répondu ${reponse.status} (${type}).`);
  }
  return new Response(await reponse.arrayBuffer(), {
    headers: {
      "Content-Type": type,
      // Le nom change avec l'image et son point focal (lib/fond-video.ts) : un an, sans revérifier.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

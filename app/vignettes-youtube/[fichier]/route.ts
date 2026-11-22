import { obtenirContenu } from "@/lib/contenu";
import { fichierVignette, ID_YOUTUBE_VALIDE, sourcesVignette, type FormatVideo } from "@/lib/vignettes-youtube";

/**
 * /vignettes-youtube/<id>-<format> : la vignette d'une vidéo YouTube, copiée de i.ytimg.com AU BUILD
 * puis servie par le site lui-même (pourquoi : lib/vignettes-youtube.ts). La liste vient du Studio :
 * les vidéos de l'accueil (verticales) et celles des fiches de réalisation (leur format).
 *
 * ⛔ Une copie ratée ARRÊTE la construction (même règle que app/fond-accueil) : mieux vaut un
 *    déploiement refusé qu'une vidéo sans image.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

async function videos(): Promise<{ youtubeId: string; format: FormatVideo }[]> {
  const { accueil, realisations } = await obtenirContenu();
  const toutes = [
    // L'accueil affiche ses vidéos en vertical (app/Content.tsx).
    ...(accueil.videos?.liste ?? []).map((v) => ({ youtubeId: v.youtubeId, format: "vertical" as const })),
    ...realisations.flatMap((r) => (r.video ? [{ youtubeId: r.video.youtubeId, format: r.video.format ?? ("horizontal" as const) }] : [])),
  ].filter((v) => ID_YOUTUBE_VALIDE.test(v.youtubeId));
  return [...new Map(toutes.map((v) => [fichierVignette(v.youtubeId, v.format), v])).values()];
}

export async function generateStaticParams() {
  return (await videos()).map((v) => ({ fichier: fichierVignette(v.youtubeId, v.format) }));
}

export async function GET(_requete: Request, { params }: { params: Promise<{ fichier: string }> }) {
  const { fichier } = await params;
  const video = (await videos()).find((v) => fichierVignette(v.youtubeId, v.format) === fichier);
  if (!video) return new Response(null, { status: 404 });

  for (const source of sourcesVignette(video.youtubeId, video.format)) {
    const reponse = await fetch(source);
    const type = reponse.headers.get("content-type") ?? "";
    if (!reponse.ok || !type.startsWith("image/")) continue;
    return new Response(await reponse.arrayBuffer(), {
      headers: {
        "Content-Type": type,
        // Le nom ne change pas si YouTube change sa vignette (rare) : une semaine, puis on revérifie.
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=604800",
      },
    });
  }
  throw new Error(`Vignette YouTube ${fichier} : aucune source n'a répondu une image.`);
}

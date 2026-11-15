import { obtenirContenu } from "@/lib/contenu";
import { adresseAbsolue as adresse } from "@/lib/adresse";
import { pagesDuSite } from "@/lib/pages-du-site";
import { apostrophes } from "@/lib/typographie";

/**
 * /llms.txt : le résumé du site pour les assistants IA (format https://llmstxt.org), GÉNÉRÉ depuis
 * Sanity au build, jamais écrit à la main (CLAUDE.md § SEO). Aucun texte ici : le nom et la
 * description viennent de « Infos de l'entreprise », les titres de section de la page « Plan du
 * site », chaque page de sa propre fiche (nom, description dans Google), chaque réalisation de la
 * sienne. Même liste que le sitemap et le plan du site (lib/pages-du-site.ts).
 *
 * Bonus, pas promesse : la très grande majorité des llms.txt ne reçoivent aucune requête (Ahrefs,
 * mai 2026). Le SEO classique et la fiche Google restent la base.
 */
export const dynamic = "force-static";

/**
 * Une ligne de liste Markdown : les crochets et les sauts de ligne casseraient le format. Apostrophes
 * typographiques partout, y compris dans les descriptions dans Google (gardées telles quelles ailleurs).
 */
const nettoyer = (texte: string) => apostrophes(texte.replace(/\s+/g, " ").replace(/[[\]]/g, "").trim());

export async function GET() {
  const contenu = await obtenirContenu();
  const { parametres, planDuSite, realisations } = contenu;

  const pages = pagesDuSite(contenu)
    .filter((p) => !p.cacheeDeGoogle)
    .map((p) => `- [${nettoyer(p.nom)}](${adresse(p.chemin)})${p.description ? `: ${nettoyer(p.description)}` : ""}`);

  const fiches = realisations.map(
    (r) => `- [${nettoyer(r.nom)}](${adresse(`/realisations/${r.slug}`)}): ${nettoyer(r.resume)} (${nettoyer(r.secteur)})`,
  );

  const corps = [
    `# ${nettoyer(parametres.nom)}`,
    "",
    `> ${nettoyer(parametres.description)}`,
    "",
    `## ${nettoyer(planDuSite.titrePages)}`,
    "",
    ...pages,
    "",
    `## ${nettoyer(planDuSite.titreRealisations)}`,
    "",
    ...fiches,
    "",
  ].join("\n");

  return new Response(corps, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

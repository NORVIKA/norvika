// robots.txt ecrit a la main plutot que via `MetadataRoute.Robots`, parce que
// l'API de Next ne sait pas emettre la directive `Content-Signal`, qui n'est pas
// dans la norme robots.txt.
//
// ⚠️ CE FICHIER N'EST PAS SEUL A DECIDER. Tant que le reglage Cloudflare
// « robots.txt setting » (Security Settings > Bot traffic) est actif, Cloudflare
// FUSIONNE son propre bloc par-dessus, avec un `Disallow: /` pour GPTBot,
// ClaudeBot, Google-Extended, CCBot et compagnie. Autrement dit : ce qui suit ne
// s'applique vraiment qu'une fois ce reglage desactive dans le tableau de bord.
//
// L'intention exprimee ici : on accepte d'etre indexe et cite, y compris par les
// assistants IA (`search=yes`, `ai-input=yes`), on refuse de servir de matiere
// d'entrainement (`ai-train=no`), et on accepte l'extrait avec lien de retour
// (`use=reference`).
export const dynamic = "force-static";

const BODY = `# Norvika
# Nos preferences d'usage du contenu, au format Content Signals
# (https://contentsignals.org). En clair : indexez-nous et citez-nous,
# n'entrainez pas de modele sur notre contenu.

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference
Allow: /
Disallow: /admin
Disallow: /admin/

Sitemap: https://norvika.ca/sitemap.xml
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

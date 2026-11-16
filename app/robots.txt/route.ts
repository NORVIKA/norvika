// robots.txt ecrit a la main plutot que via `MetadataRoute.Robots`, parce que
// l'API de Next ne sait pas emettre la directive `Content-Signal`, qui n'est pas
// dans la norme robots.txt.
//
// ROBOTS DES IA AUTORISES, entrainement compris (decision William du 2026-10-21,
// CLAUDE.md § SEO) : une PME veut etre citee par ChatGPT, Perplexity, Claude et
// Gemini, et bloquer l'entrainement bloque aussi les robots mixtes (recherche +
// entrainement). Avant le 2026-11-14, ce fichier disait encore `ai-train=no`.
//
// ⚠️ CE FICHIER N'EST PAS SEUL A DECIDER. Tant que le reglage Cloudflare
// « Manage your robots.txt » (Security > Settings) est actif, Cloudflare
// FUSIONNE son propre bloc par-dessus, avec un `Disallow: /` pour GPTBot,
// ClaudeBot, Google-Extended, CCBot et compagnie. Ce qui suit ne s'applique
// vraiment qu'une fois ce reglage desactive dans le tableau de bord, et
// AI Crawl Control regle sur « Allow ».
export const dynamic = "force-static";

const ROBOTS_IA = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "GoogleOther",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
  "meta-externalagent",
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
];

const REGLES = `Allow: /
Disallow: /api/`;

const BODY = `# Norvika
# Nos preferences d'usage du contenu, au format Content Signals
# (https://contentsignals.org). En clair : indexez-nous, citez-nous, et les
# assistants IA peuvent apprendre de notre contenu.

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
${REGLES}

# Robots des assistants IA, autorises explicitement.
${ROBOTS_IA.map((r) => `User-agent: ${r}`).join("\n")}
${REGLES}

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

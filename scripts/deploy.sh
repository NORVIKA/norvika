#!/usr/bin/env bash
# Déploiement de norvika.ca sur Cloudflare Workers (@opennextjs/cloudflare).
#
# ⚠️ POURQUOI CE SCRIPT EXISTE (incident 2026-09-07) :
# OpenNext génère .open-next/cloudflare/next-env.mjs à partir des fichiers
# .env* / .dev.vars, l'embarque dans le Worker, et le charge dans process.env au
# démarrage. Deux consequences :
#   1. un secret liste dans .env.local part EN CLAIR dans le code deploye, et
#      `wrangler secret put` ne le protege pas ;
#   2. une REFERENCE op:// listee dans .env.local ECRASE la vraie liaison du
#      Worker au runtime. C'est ce qui rendait le formulaire de contact muet :
#      RESEND_API_KEY valait la chaine « op://... » au lieu de la cle.
# D'ou la regle : .env.local ne contient que des NEXT_PUBLIC_*, les secrets
# vivent sur le Worker (wrangler secret) et leurs references dans .env.secrets.
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

CF_SECRETS_FILE="${CF_SECRETS_FILE:-../../.secrets/.env}"
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ -f "$CF_SECRETS_FILE" ]; then
  set -a; . "$CF_SECRETS_FILE"; set +a
fi
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { echo "ERREUR: CLOUDFLARE_API_TOKEN manquant." >&2; exit 1; }

echo "→ opennextjs-cloudflare build…"
npx opennextjs-cloudflare build

echo "→ garde-fou : aucun secret dans le bundle…"
node -e '
const fs = require("fs");
const f = ".open-next/cloudflare/next-env.mjs";
if (!fs.existsSync(f)) { console.log("  (pas de next-env.mjs)"); process.exit(0); }
const c = fs.readFileSync(f, "utf8");
const fuites = new Set();
for (const m of c.matchAll(/"([A-Z][A-Z0-9_]{2,})"\s*:\s*"([^"]*)"/g)) {
  if (!m[1].startsWith("NEXT_PUBLIC_") && m[2].length > 0) fuites.add(m[1]);
}
if (fuites.size) {
  console.error("  ARRET : ces cles partent dans le bundle deploye :");
  for (const k of fuites) console.error("    - " + k);
  console.error("  Sors-les de .env.local (seules les NEXT_PUBLIC_* y ont leur place).");
  process.exit(1);
}
console.log("  OK : seules les cles NEXT_PUBLIC_* sont embarquees.");
'

echo "→ wrangler deploy…"
npx wrangler deploy
echo ""
echo "Terminé. Vérifie le formulaire de contact, pas seulement le code HTTP de la page."

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

# --- 0. Alerte d'échec (Workers Builds, 2026-11-15, modèle bistro-de-la-gare) -----------
# Sous Workers Builds, si ce script s'arrête en erreur, un message part dans #alerte de
# Norvika (secret de build SLACK_ALERTES_WEBHOOK ; sans lui, rien ne part et le build échoue
# quand même). Angle mort : un échec AVANT ce script (clonage, installation, délai de
# 20 minutes) ne déclenche rien ; il se voit dans l'historique des builds du Worker.
alerte_echec() {
  local code=$?
  if [ "$code" -eq 0 ] || [ "${WORKERS_CI:-}" != "1" ]; then return 0; fi
  if [ -z "${SLACK_ALERTES_WEBHOOK:-}" ]; then echo "Pas de webhook d'alerte : aucune alerte envoyée."; return 0; fi
  local prefixe="" sha="${WORKERS_CI_COMMIT_SHA:-inconnu}"
  if [ "${SIMULATION_ECHEC:-}" = "1" ]; then prefixe="[SIMULATION, rien à faire] "; fi
  local msg="${prefixe}norvika.ca : la reconstruction a ÉCHOUÉ (commit ${sha:0:7}, build ${WORKERS_CI_BUILD_UUID:-inconnu}). Le site en ligne n'a pas changé. Journal : Cloudflare de Norvika, Workers & Pages, norvika, Deployments."
  node -e 'process.stdout.write(JSON.stringify({ text: process.argv[1] }))' "$msg" \
    | curl -sS -X POST -H "Content-Type: application/json" --data @- "$SLACK_ALERTES_WEBHOOK" >/dev/null \
    && echo "Alerte envoyée." || echo "L'alerte n'a pas pu partir."
}
trap alerte_echec EXIT

# Test de l'alerte : un commit dont le message contient [simuler-echec] fait échouer le build
# AVANT toute construction. Rien n'est déployé, et l'alerte part avec « SIMULATION ».
# ⚠️ Pousser AUSSITÔT un commit normal après : le Deploy Hook reconstruit le dernier commit, et
# chaque « Publier » échouerait exprès tant que c'est le commit de test.
if [ "${WORKERS_CI:-}" = "1" ] && git log -1 --format=%s 2>/dev/null | grep -qF "[simuler-echec]"; then
  SIMULATION_ECHEC=1
  echo "SIMULATION : échec volontaire demandé par le message du commit, pour tester l'alerte."
  exit 1
fi

# Deux façons de lancer ce script :
# - Workers Builds (WORKERS_CI=1, depuis le 2026-11-15) : c'est LA voie normale. Cloudflare
#   construit à chaque push sur next16-migration et à chaque appel du Deploy Hook (webhook
#   Sanity). Il authentifie lui-même wrangler avec le jeton « Workers Builds » du profil
#   info@norvika.ca : aucun jeton à fournir ici, et un jeton VIDE exporté masquerait le sien.
# - Sur le Mac, en dépannage : le jeton vient de l'environnement ou de CF_SECRETS_FILE.
if [ "${WORKERS_CI:-}" != "1" ]; then
  CF_SECRETS_FILE="${CF_SECRETS_FILE:-../../.secrets/.env}"
  if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ -f "$CF_SECRETS_FILE" ]; then
    set -a; . "$CF_SECRETS_FILE"; set +a
  fi
  [ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { echo "ERREUR: CLOUDFLARE_API_TOKEN manquant." >&2; exit 1; }
fi

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

echo "→ garde-fou : aucune clé Turnstile de TEST dans le site construit…"
# F3 de Sentinel (vérificateur Loi 25, 2026-11-19) : un build local fait avec
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA (essais) laisse cette clé dans les
# fichiers du navigateur. Envoyée en ligne, elle ferait refuser TOUS les formulaires (403).
# Les clés de test de Cloudflare commencent par 1x, 2x ou 3x suivis de zéros.
if grep -rqE '\b[123]x0{20,}[A-Z]{2}\b' .open-next/assets 2>/dev/null; then
  echo "  ARRET : une clé Turnstile de test est dans .open-next/assets." >&2
  echo "  Reconstruis sans NEXT_PUBLIC_TURNSTILE_SITE_KEY (la vraie clé est dans lib/anti-robot-commun.ts)." >&2
  exit 1
fi
echo "  OK : aucune clé de test."

echo "→ wrangler deploy…"
npx wrangler deploy
echo ""
echo "Terminé. Vérifie le formulaire de contact, pas seulement le code HTTP de la page."

#!/usr/bin/env bash
# Déploie le Studio sur https://norvika.sanity.studio, puis PROUVE qu'il s'ouvre.
# Porté de crossfit-sainte-foy/studio/scripts/deployer.sh.
#
#   cd studio && npm run deploy          (session du CLI Sanity de la personne connectée)
#
# Un Studio peut se déployer « avec succès » et mourir au chargement (« Configuration must contain
# projectId ») : on lit donc le paquet réellement servi (sans session, grâce à l'en-tête
# Sec-Fetch-Dest) et on y cherche l'identifiant du projet.
set -euo pipefail
cd "$(dirname "$0")/.."

HOTE="https://norvika.sanity.studio"
PROJET="k99pdqd1"

[ -d node_modules ] || npm ci --no-audit --no-fund

echo "==> Aide sous chaque champ"
npx sanity exec scripts/verifier-aide.ts

echo "==> Schéma"
npx sanity schema validate

echo "==> Déploiement du Studio"
npx sanity deploy --yes

echo "==> Vérification du paquet servi"
INDEX="$(curl -s -m 20 -H 'Sec-Fetch-Dest: iframe' "$HOTE/")"
PAQUET="$(printf '%s' "$INDEX" | grep -oE '/static/sanity-[A-Za-z0-9_-]+\.js' | head -1 || true)"
if [ -z "$PAQUET" ]; then
  echo "⛔ Aucun paquet sanity-*.js dans l'index de $HOTE : le Studio n'est pas servi." >&2
  exit 1
fi
CODE="$(curl -s -m 30 -H 'Sec-Fetch-Dest: script' "$HOTE$PAQUET")"
if ! printf '%s' "$CODE" | grep -q "$PROJET"; then
  echo "⛔ Le paquet servi ($PAQUET) ne contient pas l'identifiant $PROJET : le Studio ne s'ouvrira pas." >&2
  exit 1
fi
echo "✅ Studio en ligne : $HOTE (paquet $PAQUET, projet $PROJET présent)."
echo "   Reste humain : se connecter et ouvrir un document."

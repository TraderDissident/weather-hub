#!/bin/zsh
# Publie la version courante sur GitHub Pages après les contrôles.
# Avant : node tools/version/monter.mjs --correctif|--nouveaute -m "…" (numéro partout, journal, version.json).
# tools/version/monter.mjs est une copie diffusée par le socle (~/Developer/socle) : ne pas la modifier ici.
# Jamais de numéro écrit à la main (Matt, 20/11/2026).
set -e
cd "${0:A:h}/.."
tools/check.sh
VERSION=$(sed -n "s/^SM.VERSION = '\(.*\)';/\1/p" docs/js/config.js)
git add -A
git commit -m "Weather Hub $VERSION" || true
git tag "v$VERSION" 2>/dev/null || true
git push origin main
git push origin "v$VERSION"
echo "Publié : $VERSION. GitHub Pages met une à deux minutes à se mettre à jour."

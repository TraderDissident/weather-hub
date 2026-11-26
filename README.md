# Weather Hub

Application web de météo pour un vieil iPad sous iOS 12, installée sur l'écran d'accueil et laissée allumée comme station météo. Ciel animé selon l'heure réelle du lieu et le temps qu'il y fait, aucune publicité, aucun compte.

Adresse : https://traderdissident.github.io/station-meteo/

## Installer sur l'iPad

1. Ouvrir **Safari** (pas Chrome) à l'adresse ci-dessus.
2. Bouton Partager, puis **Sur l'écran d'accueil**, puis **Ajouter**.
3. Lancer l'app depuis sa nouvelle icône « Météo » : elle s'ouvre en plein écran.

Les lieux et réglages se choisissent dans l'app installée : elle ne partage pas son stockage avec Safari.

Si Safari a disparu de l'écran d'accueil : balayer vers le bas et chercher « Safari », ou le réautoriser dans Réglages, Temps d'écran, Restrictions relatives au contenu et à la confidentialité, Apps autorisées.

## Régler l'iPad pour un affichage permanent

- Réglages, Luminosité et affichage, **Verrouillage automatique : Jamais**.
- Laisser l'iPad branché.
- Facultatif : Réglages, Accessibilité, **Accès guidé**, pour rester dans l'app.

## Utiliser

- Glisser à gauche ou à droite pour changer de lieu.
- Bouton épingle (en haut à gauche) : lieux. Rechercher une ville, l'ajouter, changer l'ordre, choisir le lieu de démarrage (étoile).
- Bouton roue (en haut à droite) : réglages. Défilement automatique des lieux, atténuation la nuit, animations, secondes, langue.
- Toucher un jour de la liste des 10 jours pour voir ses heures.
- Bouton globe (en haut à droite) : carte du monde avec le jour et la nuit, l'heure et la météo de chaque ville. Sous la carte, choisir le style (Nature, Satellite, Épuré, Atlas, Néon), la vue (Carte ou Globe, à faire tourner au doigt) et l'affichage (Horloges ou Météo). Toucher une ville ouvre sa page.
- Réglages, Diagnostic : état de l'app, journal des erreurs, démonstration du ciel. En cas de souci, une photo de cet écran suffit.

## Démonstration

Ajouter `?demo=` à l'adresse, avec un moment et un temps séparés par une virgule :

- Moments : `nuit`, `aube`, `lever`, `matin`, `midi`, `soir`, `coucher`, `crepuscule`, ou `cycle` (une journée en 60 s).
- Temps : `clair`, `voile`, `nuageux`, `couvert`, `brouillard`, `bruine`, `pluie`, `averse`, `orage`, `neige`, `grele`.

Exemple : `index.html?demo=crepuscule,clair`

## Développer

- `tools/serve.sh` : sert l'app sur http://localhost:8765.
- `tools/check.sh` : contrôles bloquants (JavaScript ES2017 et CSS compris par Safari 12, levers et couchers comparés à Open-Meteo, codes météo, version).
- `tools/publier.sh` : contrôles puis envoi sur GitHub Pages.

Le code n'a ni dépendance ni étape de compilation : `docs/` est publié tel quel. Tout ce qui y est écrit doit tourner sur Safari 12 ; la liste des interdits est dans `PLAN.md` (section 4.1) et dans `tools/check.js`.

À chaque publication : `node tools/version/monter.mjs --correctif -m "Ce qui change"` (`--nouveaute` pour le chiffre du milieu), puis `tools/publier.sh`. La commande monte `SM.VERSION`, tous les `?v=`, le cache de `sw.js`, écrit l'entrée de `CHANGELOG.md` et `docs/version.json`. Jamais de numéro écrit à la main (règle du 20/11/2026 ; `tools/version/monter.mjs` est l'outil du socle `~/Developer/socle`, diffusé ici et piloté par `version.config.json` : ne pas le modifier dans ce dépôt) ; `check.sh` refuse une version qui n'est pas la même partout, et `publier.sh` pose l'étiquette `vX.Y.Z`.

## Données

Prévisions, qualité de l'air et recherche de lieux : [Open-Meteo](https://open-meteo.com), gratuit pour un usage personnel, licence CC BY 4.0. Soleil et lune calculés sur place.

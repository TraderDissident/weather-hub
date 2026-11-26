# Weather Hub (ex-Station Météo) · plan de développement

Application web de météo pour un iPad mini sous iOS 12.5.8, posé à demeure et utilisé comme station météo. Plan rédigé le 16/11/2026, à exécuter par Opus.

## 1. Objectif

Une page web installée sur l'écran d'accueil de l'iPad, qui s'ouvre en plein écran et affiche en continu la météo d'un lieu choisi dans une liste, sans aucune publicité, avec un ciel animé qui suit l'heure réelle du lieu (nuit, aube, jour, crépuscule) et le temps qu'il y fait.

Demandes initiales, à respecter telles quelles :

- Application complète, de A à Z, et belle. Inspiration : la capture fournie (ciel plein écran, grand cadran rond avec la température, bande des jours, bande des heures avec l'heure courante dans une pastille blanche).
- Portrait et paysage, bascule automatique.
- Animée selon le moment (jour, nuit, aube, crépuscule), calculé pour le lieu affiché et l'heure qu'il y est.
- Unités fixes : °C, mm, km/h (donc aussi hPa et km). Pas de réglage d'unités.
- Pas de géolocalisation. Une liste de lieux gérée à la main. Lieux d'essai et lieux par défaut : Dublin, Paris, Moscou.

S'inspirer ne veut pas dire recopier : icônes, fonds et mise en page sont les nôtres. Les fonds sont dessinés par le code, aucune photo.

## 2. Ce qui a été vérifié le 16/11/2026

| Sujet | Constat |
|---|---|
| App native | Impossible : Xcode 27.2 ne cible pas en dessous d'iOS 15. D'où la voie web. |
| Données | Open-Meteo répond sans compte ni clé pour Dublin, Paris, Moscou, avec `access-control-allow-origin: *` (appel direct depuis la page possible). |
| Prévisions | Un seul appel renvoie l'instant présent, 12 pas de 15 min, 240 heures, 10 jours. Poids : 25 ko. |
| Recherche de lieux | `geocoding-api.open-meteo.com` avec `language=fr` renvoie « Moscou, Russie » avec latitude, longitude et fuseau. |
| Qualité de l'air | `air-quality-api.open-meteo.com` renvoie l'indice européen, PM10, PM2,5, NO2, O3, pollens. |
| Certificats | Les trois services et GitHub Pages présentent une chaîne Let's Encrypt qui remonte à ISRG Root X1, racine connue d'iOS depuis la version 10. TLS 1.2 accepté. |
| Radar | RainViewer gratuit ne donne plus que 13 images du passé, aucune prévision, aucun satellite. |
| Outils du Mac | node 24, python 3.14, `gh` installé. Connexion `gh` non vérifiée (délai dépassé sous bac à sable). |

**Non vérifié, et c'est le risque numéro un** : que l'iPad lui-même accepte ces certificats et que ses performances suffisent. Rien ne peut le prouver depuis le Mac. C'est l'objet de la phase 0.

## 3. Décisions

Prises par défaut, modifiables avant le démarrage :

1. **Hébergement** : GitHub Pages, dépôt public `weather-hub` (ex-`station-meteo`, renommé le 26/11/2026), dossier publié `docs/`. Le dépôt ne contient rien de personnel : les lieux choisis restent dans l'iPad. (Un compte gratuit ne publie pas de Pages depuis un dépôt privé.)
2. **Nom sous l'icône** : « Météo ».
3. **Langue** : français et anglais, selon la langue de l'iPad, anglais par défaut. Réglage pour forcer.
4. **Radar de pluie** : hors version 1 (voir section 12).
5. **Aucune dépendance, aucune étape de compilation** : HTML, CSS et JavaScript écrits à la main, servis tels quels.

## 4. L'appareil et ses contraintes

iOS 12.5.8 n'existe que sur des appareils à puce A7 (iPad mini 2 ou 3) : 1 Go de mémoire, écran 2048 × 1536, soit 1024 × 768 points, densité 2. Le moteur est celui de Safari 12.1.

### 4.1 Ce que Safari 12 ne comprend pas

Interdits dans tout le code. `tools/check.sh` les refuse (section 10).

**JavaScript** : syntaxe ES2017 au maximum.

- Interdits de syntaxe : `?.`, `??`, `??=`, champs de classe, `#privé`, `await` au premier niveau, séparateurs `1_000`.
- Interdits d'API : `Array.prototype.at`, `flatMap` hors 12.1 (éviter), `Object.fromEntries`, `String.prototype.replaceAll`, `matchAll`, `Promise.allSettled`, `Promise.any`, `globalThis`, `BigInt`, `structuredClone`, `ResizeObserver`, `Element.animate`, `Intl.RelativeTimeFormat`, `Intl.ListFormat`, `navigator.wakeLock`, `AbortController` pour annuler un `fetch` (utiliser un délai par `Promise.race`).
- Pas de modules ES : scripts classiques, chacun dans une fonction auto-appelée, rattachés à un objet global unique `SM`.
- Ne jamais écrire `new Date('2026-11-16T15:30')` : Safari 12 lit cette forme en UTC. Demander les heures en secondes Unix (`timeformat=unixtime`).

**CSS**

- Interdits : `gap` dans un flex (autorisé dans une grille), `inset`, `clamp()`, `aspect-ratio`, `:is`, `:where`, `:has`, `:focus-visible`, unités `dvh` `svh` `lvh`, requêtes de conteneur, `color-mix`, imbrication, `overscroll-behavior`, `scroll-behavior`.
- À préfixer : `-webkit-backdrop-filter`, `-webkit-mask-image`, `position: -webkit-sticky`.
- Défilement fluide : `-webkit-overflow-scrolling: touch` sur chaque zone défilante.
- Autorisés et utiles : grilles, variables CSS, `min()` et `max()`, `env(safe-area-inset-*)`, animations et transformations 3D, `font-variant-numeric: tabular-nums`.

### 4.2 Particularités du mode écran d'accueil sur iOS 12

- Balises : `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style=black-translucent`, `apple-mobile-web-app-title=Météo`, `viewport` avec `viewport-fit=cover`.
- La barre d'état (heure, Wi-Fi, batterie) reste visible par-dessus la page : réserver `max(20px, env(safe-area-inset-top))` en haut.
- Après une rotation, `100vh` et `innerHeight` sont parfois faux. Racine en `position: fixed` avec `top/right/bottom/left: 0`, et nouvelle mesure 300 ms après `orientationchange` et `resize`.
- Le stockage de l'app d'écran d'accueil est séparé de celui de Safari : les lieux se choisissent dans l'app installée.
- L'app peut être rechargée par iOS quand on y revient : l'état (lieu affiché, réglages) est relu depuis `localStorage` à chaque démarrage.
- Bloquer le zoom par pincement (`gesturestart`) et le double appui, bloquer le rebond de la page entière.
- Une page web ne peut ni empêcher la veille ni régler la luminosité : voir section 8.

### 4.3 Budget de performance (A7)

- Une seule toile (`canvas`) pour les particules, à la densité 1 (1024 × 768), plafonnée à 30 images par seconde, **arrêtée** quand il n'y a ni pluie ni neige et quand la page est masquée.
- Le ciel est un dégradé CSS recalculé une fois par minute, avec un fondu entre deux calques. Aucun calcul par image.
- Les nuages sont des éléments animés en CSS par `translate3d` (travail du processeur graphique), textures de 512 px au plus, 14 nuages au plus.
- Pas de flou d'arrière-plan sur de grandes surfaces, pas d'ombre ni de filtre animés. Les panneaux sont des aplats translucides.
- 250 gouttes ou 150 flocons au plus, dans un réservoir réutilisé (aucune allocation par image).
- Qualité automatique : si la cadence moyenne passe sous 20 images par seconde pendant 10 s, diviser les particules par deux, puis retirer les nuages secondaires.

## 5. Données

Source unique : Open-Meteo (gratuit pour usage personnel, mention de la source obligatoire, à placer dans « À propos »).

**Prévisions**, un appel par lieu :

```
https://api.open-meteo.com/v1/forecast
  ?latitude=…&longitude=…&timezone=auto&timeformat=unixtime
  &forecast_days=10&forecast_minutely_15=12&wind_speed_unit=kmh
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m
  &minutely_15=precipitation,weather_code
  &hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day,dew_point_2m,pressure_msl,relative_humidity_2m,snowfall
  &daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,precipitation_hours,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,snowfall_sum
```

Cette liste de paramètres a été testée telle quelle (sans `timeformat=unixtime`, à ajouter et à revérifier).

**Qualité de l'air** : `https://air-quality-api.open-meteo.com/v1/air-quality` avec `current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,alder_pollen,birch_pollen,grass_pollen`. Les pollens ne couvrent que l'Europe et la saison : masquer la tuile quand les valeurs sont nulles ou absentes (Moscou est le cas d'essai).

**Recherche de lieux** : `https://geocoding-api.open-meteo.com/v1/search?name=…&count=8&language=fr`. Afficher nom, région, pays pour lever les homonymes. Enregistrer nom, latitude, longitude, fuseau.

**Heure** : tout se calcule en secondes Unix. L'affichage passe par `Intl.DateTimeFormat` avec le `timeZone` renvoyé par l'API (pris en charge par Safari 12), repli sur `utc_offset_seconds`.

**Rythme** : lieu affiché rafraîchi toutes les 10 min, qualité de l'air toutes les 30 min, autres lieux à l'affichage s'ils datent de plus de 10 min. Soit quelques centaines d'appels par jour pour une limite gratuite de 10 000.

**Codes météo** : table WMO complète (0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99) vers trois choses : libellé fr/en, icône, scène animée.

**Calculs locaux**, sans réseau :

- Position du soleil (hauteur et azimut) par les formules de la NOAA, à partir de la latitude, de la longitude et de l'heure. C'est elle qui pilote le ciel, pas `is_day`.
- Phase et éclairement de la lune, position approchée (précision du degré suffisante).
- Tendance de la pression sur 3 h, d'après les valeurs horaires.

## 6. Fonctions de la version 1

### Écran principal, un par lieu

Glisser à gauche ou à droite change de lieu, avec des points de repère.

1. **En-tête** : nom du lieu, grande horloge à l'heure du lieu, date.
2. **Cadran** : température, ressenti, libellé du temps, maximum et minimum du jour, icône, précipitations en mm et probabilité, vent (flèche, km/h, rafales).
3. **Phrase de synthèse** tirée des données : « Pluie faible dans 20 min », « Pluie jusqu'à 17 h », « Pas de pluie avant ce soir ».
4. **Pluie dans les 3 heures** : 12 barres d'un quart d'heure, affichées seulement quand il va pleuvoir.
5. **Heure par heure, 48 h** : bande défilante avec icône, température, probabilité de pluie, mm, vent ; courbe de température ; repères du lever et du coucher ; heure courante dans une pastille.
6. **Jour par jour, 10 jours** : icône, minimum et maximum avec une barre d'amplitude, mm, probabilité, vent maximal. Toucher un jour montre ses heures.
7. **Détails**, en tuiles : vent (rose des vents) et rafales, humidité, point de rosée, pression en hPa avec tendance, visibilité en km, indice UV avec niveau, couverture nuageuse, lever et coucher avec l'arc du soleil et sa position, durée du jour, lune (phase et pourcentage), qualité de l'air (indice européen et polluants), pollens.
8. **Avis calculés** : bandeau discret pour gel, rafales de 60 km/h et plus, fortes pluies, neige, orage, forte chaleur, UV élevé, air dégradé. Ce ne sont pas des vigilances officielles : libellés factuels (« Rafales à 72 km/h cette nuit »), jamais de couleur de vigilance.

### Écran Lieux

Liste, recherche par nom, ajout, suppression, monter et descendre, lieu de démarrage. Livrée avec Dublin, Paris, Moscou.

### Écran Réglages

- Carrousel automatique entre les lieux : arrêté, 30 s, 1 min, 5 min.
- Veille nocturne : arrêtée, automatique, horaires.
- Animations : automatiques, réduites, coupées.
- Secondes sur l'horloge.
- Langue : automatique, français, anglais.
- À propos : version, source des données, écran de diagnostic.

## 7. Interface

- **Référence de dessin** : 1024 × 768 en paysage, 768 × 1024 en portrait. La page doit aussi rester correcte sur un Mac et un iPhone, pour les essais.
- **Échelle** : la taille de base est calculée à partir du plus petit côté de l'écran, tout le reste en `rem`.
- **Paysage** : deux colonnes. À gauche le lieu, l'horloge et le cadran. À droite la synthèse, les heures, les jours, les détails. L'essentiel tient sans défiler, les détails complets défilent.
- **Portrait** : en-tête et cadran en haut (environ 40 % de la hauteur), puis heures, jours, détails en défilement.
- **Bascule** : par requêtes `orientation`, sans rechargement, sans perte de position.
- **Typographie** : police du système (`-apple-system`), grands chiffres en graisse fine, chiffres à largeur fixe pour l'horloge.
- **Lisibilité** : texte blanc sur panneaux sombres translucides, dont l'opacité monte quand le ciel est clair (jour de neige, brouillard). Contraste minimal de 4,5 pour le petit texte dans le pire cas.
- **Lecture à distance** : température, heure et libellé lisibles à 3 mètres.
- **Icônes** : un jeu SVG maison d'une vingtaine de dessins, variantes jour et nuit.
- **Icône d'écran d'accueil** : 152, 167 et 180 px. Images de lancement 1536 × 2048 et 2048 × 1536.

## 8. Ciel animé

Calques, du fond vers l'avant :

1. **Dégradé du ciel**, piloté par la hauteur du soleil `h`, par interpolation continue entre des paliers :

   | `h` | Moment |
   |---|---|
   | ≤ −18° | nuit noire |
   | −18° à −12° | crépuscule astronomique |
   | −12° à −6° | crépuscule nautique, bleu profond |
   | −6° à 0° | crépuscule civil, bande colorée à l'horizon |
   | 0° à 6° | heure dorée |
   | > 6° | jour, bleu de plus en plus franc |

   Aube et crépuscule se distinguent par le sens de variation de `h` : tons rosés et froids le matin, orangés et rouges le soir. La lueur se place du côté de l'azimut du soleil (est à gauche, ouest à droite). Ce calcul vaut pour toute latitude, y compris les longs crépuscules de Moscou et de Dublin.

2. **Astres** : soleil placé selon azimut et hauteur, avec halo. Lune avec sa vraie phase. Étoiles qui scintillent, estompées par la couverture nuageuse.
3. **Nuages** : nombre selon la couverture, vitesse et sens selon le vent, teinte selon la lumière (roses au couchant, gris sous la pluie, sombres la nuit).
4. **Précipitations** : bruine, pluie, averses, neige, grêle, intensité selon les mm/h, inclinaison selon le vent. Éclairs pour les codes d'orage. Nappes de brouillard.
5. **Relief** au bas de l'écran : deux ou trois silhouettes de collines générées à partir du nom du lieu (chaque lieu a son horizon), teintées par la lumière ambiante.

Le temps module le dégradé : couverture nuageuse vers le gris, pluie plus sombre, orage très sombre et violacé, brouillard délavé, neige claire.

**Mode démonstration**, indispensable aux essais : forcer l'heure solaire et le temps (`?demo=aube,pluie` et un panneau dans le diagnostic), et faire défiler 24 h en 60 s.

## 9. Fonctionnement en station

- **Réseau absent** : garder les dernières données, afficher « Mis à jour à 15:30 », badge discret au-delà d'une heure, prévisions marquées périmées au-delà de trois. Nouvelles tentatives à 30 s, 1 min, 2 min, 5 min.
- **Reprise** : `visibilitychange`, `pageshow` et `online` déclenchent un rafraîchissement immédiat.
- **Service worker** : met en cache la coquille de l'app (versionnée), jamais les réponses météo. L'app doit fonctionner sans lui.
- **Rechargement quotidien** à 4 h, heure de l'iPad, pour repartir d'une mémoire propre, seulement si le réseau répond.
- **Veille nocturne** : voile noir de 0 à 70 % la nuit, un appui rend la pleine lumière 30 s.
- **Diagnostic** : `window.onerror` et rejets de promesses consignés (100 dernières lignes dans `localStorage`), avec moteur, taille d'écran, cadence d'affichage, dernier appel réseau. C'est le seul moyen de déboguer : l'inspecteur de Safari 27 ne se branche pas sur iOS 12. Une photo de cet écran suffit pour transmettre l'état.
- **Réglages de l'iPad**, à documenter dans le guide : Verrouillage automatique sur Jamais, iPad branché, Accès guidé en option.

## 10. Organisation du code

```
WeatherHub/
  PLAN.md  README.md  CHANGELOG.md
  docs/                      ← dossier publié
    index.html  sw.js  manifest.webmanifest
    css/app.css
    js/  compat.js  config.js  i18n.js  store.js  api.js  astro.js
         codes.js  icons.js  sky.js  clouds.js  particles.js
         charts.js  ui.js  places.js  settings.js  diag.js  app.js
    img/                     ← icônes et images de lancement
    sonde.html               ← phase 0
  tools/
    serve.sh                 ← serveur local pour les essais
    check.sh                 ← contrôles de compatibilité
    publier.sh               ← contrôles, version, journal, envoi
    captures/                ← captures des scènes
```

`tools/check.sh`, bloquant avant toute publication :

- chaque fichier JavaScript analysé par `acorn` en ES2017 ;
- recherche des API et des propriétés CSS interdites de la section 4.1 ;
- tests de `astro.js` contre des valeurs connues : lever et coucher à Dublin, Paris, Moscou, comparés à ceux que renvoie l'API, écart toléré de 3 min ;
- tests de la table des codes météo (aucun code sans libellé, icône et scène).

Version dans `config.js` et `CHANGELOG.md` à chaque publication, affichée dans « À propos ».

## 11. Phases

Chaque phase se termine par un résultat que l'on peut constater.

**Phase 0 · Sonde sur l'iPad** (avant tout le reste)
Créer le dépôt, activer Pages, publier `sonde.html` : elle affiche le moteur, la taille d'écran, appelle les trois services et montre leur réponse ou l'erreur, puis mesure la cadence avec 250 particules et 10 nuages pendant 20 s.
*Constat attendu* : photo de l'iPad montrant trois appels réussis et la cadence. **Arrêt obligatoire ici** : si un appel échoue (certificat), basculer sur le repli de la section 13 avant de continuer.

**Phase 1 · Socle**
Structure, `compat`, `store`, `api`, `i18n`, heure du lieu, `check.sh`. Page brute qui affiche les vraies données des trois lieux dans les deux orientations.

**Phase 2 · Interface**
Cadran, synthèse, pluie dans les 3 h, heures, jours, détails, avis, écran Lieux, écran Réglages, icônes.

**Phase 3 · Ciel animé**
`astro`, dégradés, astres, nuages, précipitations, éclairs, brouillard, relief, mode démonstration.

**Phase 4 · Station**
Rafraîchissement, hors ligne, service worker, rechargement quotidien, veille nocturne, carrousel, diagnostic.

**Phase 5 · Finitions et livraison**
Mesures sur l'iPad, réglage de la qualité automatique, icône et images de lancement, publication, guide d'installation dans `README.md`.

## 12. Vérification

1. `tools/check.sh` sans erreur.
2. Sur le Mac, dans le navigateur intégré, aux tailles 1024 × 768 et 768 × 1024 : capture de chaque scène du mode démonstration (nuit claire, aube, jour clair, jour couvert, pluie, orage, neige, brouillard, crépuscule) dans les deux orientations, rangées dans `tools/captures/`.
3. Données réelles de Dublin, Paris et Moscou comparées à la réponse brute de l'API : température, vent, lever, coucher, heure locale.
4. Coupure du réseau, puis retour : l'affichage tient, puis se remet à jour.
5. Endurance : 24 h d'affichage, puis lecture du diagnostic (aucune erreur, cadence stable).
6. **Sur l'iPad lui-même** : c'est la seule preuve qui compte pour iOS 12. Liste de contrôle fournie à la livraison (installation, plein écran, rotation, changement de lieu, ajout d'un lieu, une nuit complète allumé).

Ne rien déclarer « vérifié sur l'iPad » sans photo ou constat fait sur l'appareil.

## 13. Risques et replis

| Risque | Repli |
|---|---|
| L'iPad refuse le certificat d'Open-Meteo | Relais très simple (Cloudflare Worker gratuit) qui retransmet les appels, ou autre source (MET Norway). Décision après la phase 0. |
| Animations trop lourdes pour l'A7 | Qualité automatique, puis niveaux « réduites » et « coupées ». Le ciel en dégradé seul reste beau. |
| Service worker capricieux en mode écran d'accueil | L'app fonctionne sans lui. Il ne sert qu'à démarrer sans réseau. |
| Safari introuvable sur l'iPad | La page fonctionne dans Chrome, avec sa barre d'adresse. |
| Fuite de mémoire sur plusieurs jours | Rechargement quotidien à 4 h. |

## 14. Hors version 1

- Radar de pluie : la source gratuite ne donne que deux heures de passé et il faudrait une bibliothèque de cartes, lourde pour cet iPad.
- Vigilances officielles de Météo-France : elles demandent un compte et une clé.
- Notifications, widgets, géolocalisation.

## 15. Terminé veut dire

- L'app est en ligne, installée sur l'écran d'accueil de l'iPad, en plein écran.
- Dublin, Paris et Moscou affichent des données justes, à leur heure locale, avec le ciel correspondant.
- Portrait et paysage sont tous deux soignés.
- Une nuit complète allumée sans erreur au diagnostic.
- `README.md` explique l'installation et les réglages de l'iPad, `CHANGELOG.md` est à jour.

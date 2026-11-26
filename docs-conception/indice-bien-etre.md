# Indice de bien-être météo sur 10 — document de conception

Document de travail pour Weather Hub (ex-Station Météo). Rien n'est développé. Rien n'est publié. Les barèmes ci-dessous sont une proposition à discuter.

## Résumé

1. La note part du **confort thermique** (température ressentie). Ta zone idéale, 22 à 27 °C ressentis, vaut 10. Elle perd 1 point tous les 5 °C côté froid et 1 point tous les 2 °C côté chaud, jusqu'à 0 sous −23 °C et à partir de 45 °C.
2. Chaque **gêne** retire ensuite un pourcentage de cette base : pluie (jusqu'à −60 %), vent (−40 %), air pollué (−40 %), ciel couvert ou brouillard (−20 %), moiteur (−10 %), UV (−10 %).
3. Des **plafonds** bloquent la note quand il y a un danger : orage (3 au plus), grêle (2), tempête (1 à 5), canicule à 40 °C et plus (3), air extrêmement mauvais (3).
4. Je recommande cette formule « base thermique × gênes » plutôt que la moyenne pondérée évoquée au départ. Avec la moyenne pondérée, un ciel bleu à −28 °C obtient 5,8 sur 10 et une pluie froide et ventée à 5 °C obtient 5,4. Avec la formule recommandée : 0 et 1,9.
5. La différence sec / humide est bien visible : 35 °C à 20 % d'humidité donne 5,7 ; 35 °C à 80 % donne 0. Elle vient de la température ressentie, qui tient déjà compte de l'humidité et du vent.
6. Tout se calcule avec les données que l'app reçoit déjà. Aucune requête n'est à ajouter.
7. La note se calcule **maintenant** (tous les critères) et **heure par heure sur 10 jours** (tous les critères sauf la qualité de l'air, qui n'est reçue que pour l'instant présent). La note **du jour** se fait en moyennant les heures de la journée.
8. Pour les heures à venir, le ressenti n'est pas fourni : il faut le recalculer. J'ai retrouvé la formule exacte d'Open-Meteo et je l'ai vérifiée sur des valeurs réelles (écart de 0,1 °C au plus).
9. Vingt cas concrets sont calculés de bout en bout à la fin du document. Ils sont cohérents avec les tableaux, car tableaux et cas sortent du même script.
10. Chaque critère a une note entière. La note finale garde une décimale. Elle atteint vraiment 10 quand le ressenti est dans ta zone et qu'aucune gêne n'est présente.
11. Une page à curseurs, `docs-conception/reglages-indice.html`, permet d'essayer les réglages et de voir la note en direct.
12. Ce qui te revient : la sévérité côté froid, le poids de chaque gêne, les plafonds, les libellés, et quelques options listées en fin de document.
13. Non vérifié : le barème détaillé du Holiday Climate Index (article inaccessible), et quelques points signalés par la mention **« non vérifié »** dans le texte.

---

## 1. Données disponibles (lues dans `docs/js/api.js`)

L'app fait deux requêtes par lieu : prévisions et qualité de l'air.

| Bloc | Champs reçus | Portée |
|---|---|---|
| Actuel (`current`) | `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `is_day`, `precipitation`, `weather_code`, `cloud_cover`, `pressure_msl`, `wind_speed_10m`, `wind_direction_10m`, `wind_gusts_10m` | l'instant présent |
| Quart d'heure (`minutely_15`) | `precipitation`, `weather_code` | 12 pas, soit 3 heures |
| Horaire (`hourly`) | `temperature_2m`, `precipitation_probability`, `precipitation`, `weather_code`, `visibility`, `wind_speed_10m`, `wind_direction_10m`, `wind_gusts_10m`, `uv_index`, `is_day`, `dew_point_2m`, `pressure_msl`, `snowfall` | 10 jours, 240 heures |
| Journalier (`daily`) | `weather_code`, `temperature_2m_max`, `temperature_2m_min`, `sunrise`, `sunset`, `daylight_duration`, `uv_index_max`, `precipitation_sum`, `precipitation_probability_max`, `wind_speed_10m_max`, `wind_direction_10m_dominant` | 10 jours |
| Qualité de l'air (`current`) | `european_aqi`, `pm10`, `pm2_5`, `nitrogen_dioxide`, `ozone`, pollens d'aulne, de bouleau, de graminées | l'instant présent seulement |

Ce qui manque, et comment on s'en passe :

| Manque | Conséquence | Solution sans nouvelle requête |
|---|---|---|
| Ressenti horaire | pas de note thermique directe pour les heures à venir | on le recalcule (formule au § 2.1) avec température, point de rosée et vent horaires |
| Humidité horaire | — | on la déduit de la température et du point de rosée (formule de Magnus) |
| Point de rosée actuel | — | on le déduit de la température et de l'humidité actuelles |
| Couverture nuageuse horaire | ciel moins précis pour les heures à venir | on utilise le code météo : 0 dégagé, 1 peu nuageux, 2 partiellement nuageux, 3 couvert |
| UV actuel | — | on prend l'UV horaire de l'heure en cours |
| Qualité de l'air horaire | pas de critère « air » pour les heures et jours à venir | critère neutre (aucun retrait) hors de l'instant présent |
| Humidité, ressenti et rafales journaliers | pas de note du jour fiable avec le seul bloc journalier | on moyenne les notes horaires de la journée |

Champ utilisé par chaque critère :

| Critère | Maintenant | Heure par heure | Jour |
|---|---|---|---|
| Thermique | `apparent_temperature` (actuel) | ressenti recalculé : `temperature_2m`, `dew_point_2m`, `wind_speed_10m` | moyenne des heures |
| Moiteur | point de rosée déduit de `temperature_2m` et `relative_humidity_2m` | `dew_point_2m` | moyenne des heures |
| Pluie et neige | `precipitation`, `weather_code`, et le bloc quart d'heure | `precipitation`, `precipitation_probability`, `weather_code`, `snowfall` | moyenne des heures (secours : `precipitation_sum`, `precipitation_probability_max`) |
| Ciel | `cloud_cover`, `weather_code`, `is_day`, `visibility` de l'heure en cours | `weather_code`, `visibility`, `is_day` | moyenne des heures |
| Vent | `wind_speed_10m`, `wind_gusts_10m` | les mêmes champs horaires | moyenne des heures (secours : `wind_speed_10m_max`) |
| UV | `uv_index` de l'heure en cours | `uv_index` | moyenne des heures (secours : `uv_index_max`) |
| Air | `european_aqi` (détail : `pm2_5`, `pm10`, `ozone`, `nitrogen_dioxide`) | non disponible | non disponible |

Champs non utilisés par la note : pression, direction du vent, pollens, durée du jour. Les heures de lever et de coucher servent à délimiter « la journée ».

**Réponse à la question « heure par heure et jour par jour ? »** Oui pour les deux. Heure par heure : six critères sur sept, sur 10 jours. Jour par jour : en moyennant les notes des heures de jour (du lever au coucher, ou de 8 h à 20 h, à choisir). Le bloc journalier seul ne suffit pas : il n'a ni humidité ni ressenti.

---

## 2. Les critères, tranche par tranche

Chaque critère reçoit une note de 0 à 10. Une borne appartient à la tranche du dessus : « 27 à 29 » veut dire de 27,0 à 28,9.

### 2.1 Confort thermique (température ressentie)

Source : la température ressentie d'Open-Meteo. C'est une variante de la formule de Steadman, celle du service météo australien. Formule lue dans le code public d'Open-Meteo, puis vérifiée sur 5 villes en direct le 18 novembre 2026 (écart de 0,1 °C au plus) :

```
vent2m   = vent à 10 m (en m/s) × 0,75
e        = humidité / 100 × 6,105 × exp(17,27 × T / (237,7 + T))      (pression de vapeur, hPa)
Q        = max(0 ; 0,1 × (rayonnement solaire − 550))                 (W/m²)
ressenti = T + 0,348 × e − 0,70 × vent2m + 0,70 × Q / (vent2m + 10) − 4,25
```

Trois choses à savoir :

- L'humidité fait monter le ressenti. Le vent le fait baisser. C'est pour cela que 35 °C sec et 35 °C humide ne donnent pas la même note.
- Le terme solaire ne joue qu'en plein soleil fort (plus de 550 W/m²). Il ajoute alors jusqu'à 3 °C environ. L'app ne reçoit pas le rayonnement : le ressenti recalculé pour les heures à venir est donc un ressenti **à l'ombre**. Le ressenti actuel, lui, vient d'Open-Meteo et contient le soleil.
- La formule ôte 4,25 °C d'office. Par temps doux, sec et calme, le ressenti est donc un peu plus bas que la température de l'air (24 °C à 50 % d'humidité et vent léger : ressenti 23,8 °C).

| Ressenti | Note | | Ressenti | Note |
|---|---|---|---|---|
| **22 à 27 °C** | **10** | | **22 à 27 °C** | **10** |
| 17 à 22 °C | 9 | | 27 à 29 °C | 9 |
| 12 à 17 °C | 8 | | 29 à 31 °C | 8 |
| 7 à 12 °C | 7 | | 31 à 33 °C | 7 |
| 2 à 7 °C | 6 | | 33 à 35 °C | 6 |
| −3 à 2 °C | 5 | | 35 à 37 °C | 5 |
| −8 à −3 °C | 4 | | 37 à 39 °C | 4 |
| −13 à −8 °C | 3 | | 39 à 41 °C | 3 |
| −18 à −13 °C | 2 | | 41 à 43 °C | 2 |
| −23 à −18 °C | 1 | | 43 à 45 °C | 1 |
| moins de −23 °C | 0 | | 45 °C et plus | 0 |

La règle tient en une phrase : 10 dans la zone idéale, puis 1 point perdu tous les 5 °C côté froid et tous les 2 °C côté chaud. La pente est plus douce côté froid, parce qu'on se protège du froid en s'habillant, pas de la chaleur. Les quatre nombres (22, 27, 5 et 2) sont réglables dans la page à curseurs. C'est un choix discutable (voir § 8).

Repères des indices existants, pour situer ces tranches :

| Indice | Repères | Vérifié ? |
|---|---|---|
| UTCI (classes de stress thermique) | pas de stress de 9 à 26 ; chaleur modérée 26 à 32 ; forte 32 à 38 ; très forte 38 à 46 ; extrême au-dessus de 46 ; froid léger 0 à 9 ; modéré −13 à 0 ; fort −27 à −13 ; très fort −40 à −27 ; extrême sous −40 | oui (documentation thermofeel, Agence européenne pour l'environnement) |
| Heat Index (États-Unis) | prudence 27 à 32 °C ; grande prudence 32 à 41 ; danger 41 à 54 ; danger extrême au-dessus de 54. Formule valable à partir de 27 °C et 40 % d'humidité | oui (Wikipédia) |
| Humidex (Canada) | 20 à 29 peu d'inconfort ; 30 à 39 un certain inconfort ; 40 à 45 grand inconfort ; plus de 45 dangereux. Formule : T + 0,5555 × (e − 10) | oui (Wikipédia) |
| Refroidissement éolien (Canada) | 0 à −9 risque faible ; −10 à −27 modéré ; −28 à −39 élevé, gelure en 10 à 30 minutes ; −40 à −47 très élevé, 5 à 10 minutes ; −48 à −54 grave, 2 à 5 minutes ; −55 et moins extrême, moins de 2 minutes | oui (site du gouvernement du Canada) |

L'UTCI lui-même ne peut pas être calculé dans l'app : il demande la température de rayonnement, que l'app ne reçoit pas. Je ne m'en sers que comme repère.

### 2.2 Moiteur (point de rosée)

| Point de rosée | Sensation | Note |
|---|---|---|
| moins de −5 °C | air très sec (lèvres, peau, gorge) | 9 |
| −5 à 13 °C | sec à confortable | 10 |
| 13 à 16 °C | un peu humide | 9 |
| 16 à 18 °C | lourd | 7 |
| 18 à 21 °C | moite | 5 |
| 21 à 24 °C | étouffant | 3 |
| 24 à 26 °C | oppressant | 1 |
| 26 °C et plus | très oppressant | 0 |

Ce critère pèse peu (retrait de 10 % au plus). Raison : l'humidité est déjà comptée dans le ressenti. La moiteur ajoute seulement la sensation de peau collante, que le ressenti ne dit pas.

L'air trop sec est peu pénalisé (note 9). Par grand froid, le point de rosée est toujours très bas : pénaliser plus fort ferait double emploi avec le froid.

Sources. Service météo américain (bureau de La Crosse) : jusqu'à 55 °F (13 °C) « sec et confortable » ; de 55 à 65 °F (13 à 18 °C) « collant » ; à partir de 65 °F (18 °C) « oppressant ». Wikipédia : inconfort au-dessus de 15 °C pour les habitants des régions tempérées, « oppressant » au-dessus de 21 °C. **Non vérifié** : le palier de 24 °C et le libellé « lourd » pour 16 à 18 °C. Ce sont des repères courants, je ne les ai pas retrouvés dans une source officielle.

### 2.3 Croisement température × humidité

Note thermique selon la température de l'air (colonnes) et l'humidité (lignes). Entre parenthèses : le ressenti arrondi. Calcul à l'ombre, vent de 10 km/h.

| Humidité ↓ / Air → | 20 °C | 22 °C | 24 °C | 26 °C | 28 °C | 30 °C | 32 °C | 34 °C | 36 °C | 38 °C | 40 °C | 42 °C | 44 °C |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **10 %** | **8** (15°) | **9** (17°) | **9** (19°) | **9** (21°) | **10** (24°) | **10** (26°) | **9** (28°) | **8** (30°) | **7** (32°) | **6** (35°) | **5** (37°) | **3** (39°) | **2** (41°) |
| **20 %** | **8** (16°) | **9** (18°) | **9** (20°) | **10** (23°) | **10** (25°) | **9** (27°) | **8** (30°) | **7** (32°) | **6** (34°) | **5** (37°) | **3** (39°) | **2** (42°) | **1** (45°) |
| **30 %** | **8** (17°) | **9** (19°) | **9** (21°) | **10** (24°) | **10** (26°) | **9** (29°) | **7** (31°) | **6** (34°) | **5** (36°) | **3** (39°) | **2** (42°) | **1** (45°) | **0** (48°) |
| **40 %** | **9** (18°) | **9** (20°) | **10** (22°) | **10** (25°) | **9** (28°) | **8** (30°) | **7** (33°) | **5** (36°) | **4** (39°) | **2** (41°) | **1** (45°) | **0** (48°) | **0** (51°) |
| **50 %** | **9** (18°) | **9** (21°) | **10** (23°) | **10** (26°) | **9** (29°) | **7** (32°) | **6** (35°) | **4** (38°) | **3** (41°) | **1** (44°) | **0** (47°) | **0** (50°) | **0** (54°) |
| **60 %** | **9** (19°) | **9** (22°) | **10** (25°) | **9** (27°) | **8** (30°) | **6** (33°) | **5** (36°) | **3** (39°) | **2** (43°) | **0** (46°) | **0** (50°) | **0** (53°) | **0** (57°) |
| **70 %** | **9** (20°) | **10** (23°) | **10** (26°) | **9** (28°) | **7** (31°) | **6** (35°) | **4** (38°) | **2** (41°) | **1** (45°) | **0** (48°) | **0** (52°) | **0** (56°) | **0** (60°) |
| **80 %** | **9** (21°) | **10** (24°) | **10** (27°) | **8** (30°) | **7** (33°) | **5** (36°) | **3** (39°) | **1** (43°) | **0** (47°) | **0** (51°) | **0** (55°) | **0** (59°) | **0** (64°) |
| **90 %** | **9** (22°) | **10** (25°) | **9** (28°) | **8** (31°) | **6** (34°) | **4** (38°) | **2** (41°) | **1** (45°) | **0** (49°) | **0** (53°) | **0** (57°) | **0** (62°) | **0** (67°) |
| **100 %** | **10** (22°) | **10** (25°) | **9** (29°) | **7** (32°) | **5** (35°) | **3** (39°) | **2** (43°) | **0** (47°) | **0** (51°) | **0** (55°) | **0** (60°) | **0** (65°) | **0** (70°) |

À lire ainsi : à 36 °C, la note passe de 7 (10 % d'humidité) à 0 (80 % et plus). À 24 °C, l'humidité ne change presque rien.

Limite connue : par air très sec, la formule donne un ressenti bas (30 °C à 10 % : ressenti 26 °C, note 10). C'est vrai à l'ombre. En plein soleil, le ressenti réel est plus élevé de 3 °C environ.

### 2.4 Croisement froid × vent

Note thermique selon la température de l'air (colonnes) et le vent moyen (lignes). Entre parenthèses : le ressenti arrondi. Humidité de 70 %.

| Vent ↓ / Air → | −30 °C | −25 °C | −20 °C | −15 °C | −10 °C | −5 °C | 0 °C | 5 °C | 10 °C |
|---|---|---|---|---|---|---|---|---|---|
| **0 km/h** | **0** (−34°) | **0** (−29°) | **0** (−24°) | **1** (−19°) | **2** (−14°) | **3** (−8°) | **5** (−3°) | **6** (3°) | **7** (9°) |
| **10 km/h** | **0** (−36°) | **0** (−31°) | **0** (−25°) | **1** (−20°) | **2** (−15°) | **3** (−10°) | **4** (−4°) | **5** (1°) | **7** (7°) |
| **20 km/h** | **0** (−37°) | **0** (−32°) | **0** (−27°) | **1** (−22°) | **2** (−16°) | **3** (−11°) | **4** (−6°) | **5** (0°) | **6** (6°) |
| **30 km/h** | **0** (−39°) | **0** (−33°) | **0** (−28°) | **0** (−23°) | **2** (−18°) | **3** (−13°) | **4** (−7°) | **5** (−2°) | **6** (4°) |
| **40 km/h** | **0** (−40°) | **0** (−35°) | **0** (−30°) | **0** (−25°) | **1** (−19°) | **2** (−14°) | **3** (−9°) | **5** (−3°) | **6** (3°) |
| **50 km/h** | **0** (−41°) | **0** (−36°) | **0** (−31°) | **0** (−26°) | **1** (−21°) | **2** (−16°) | **3** (−10°) | **4** (−4°) | **5** (1°) |
| **60 km/h** | **0** (−43°) | **0** (−38°) | **0** (−33°) | **0** (−28°) | **1** (−22°) | **2** (−17°) | **3** (−12°) | **4** (−6°) | **5** (0°) |
| **80 km/h** | **0** (−46°) | **0** (−41°) | **0** (−36°) | **0** (−30°) | **0** (−25°) | **1** (−20°) | **2** (−14°) | **3** (−9°) | **5** (−3°) |

Pour comparaison, voici l'indice de refroidissement éolien nord-américain (formule de 2001 : 13,12 + 0,6215 × T − 11,37 × V^0,16 + 0,3965 × T × V^0,16, valable sous 10 °C et au-dessus de 4,8 km/h). L'app ne l'utilise pas ; il sert à vérifier que le ressenti d'Open-Meteo reste du même ordre.

| Vent ↓ / Air → | −30 °C | −25 °C | −20 °C | −15 °C | −10 °C | −5 °C | 0 °C | 5 °C | 10 °C |
|---|---|---|---|---|---|---|---|---|---|
| **10 km/h** | −39 | −33 | −27 | −21 | −15 | −9 | −3 | 3 | 9 |
| **20 km/h** | −43 | −37 | −30 | −24 | −18 | −12 | −5 | 1 | 7 |
| **30 km/h** | −46 | −39 | −33 | −26 | −20 | −13 | −6 | 0 | 7 |
| **40 km/h** | −48 | −41 | −34 | −27 | −21 | −14 | −7 | −1 | 6 |
| **50 km/h** | −49 | −42 | −35 | −29 | −22 | −15 | −8 | −1 | 5 |
| **60 km/h** | −50 | −43 | −36 | −30 | −23 | −16 | −9 | −2 | 5 |
| **80 km/h** | −52 | −45 | −38 | −31 | −24 | −17 | −10 | −3 | 4 |

Les deux formules s'accordent à quelques degrés près jusqu'à −15 °C. Par très grand froid et vent fort, le refroidissement éolien descend plus bas (jusqu'à 8 °C d'écart). Cela ne change pas la note : dans cette zone elle vaut déjà 0 ou 1.

### 2.5 Pluie et neige

Étape 1 : l'intensité, en millimètres par heure.

| Intensité | Exemple | Note |
|---|---|---|
| moins de 0,1 mm/h | sec | 10 (puis voir la probabilité) |
| 0,1 à 0,5 mm/h | bruine, quelques gouttes | 7 |
| 0,5 à 1 mm/h | petite pluie | 6 |
| 1 à 2,5 mm/h | pluie faible | 5 |
| 2,5 à 5 mm/h | pluie modérée | 3 |
| 5 à 10 mm/h | pluie soutenue | 2 |
| 10 à 20 mm/h | forte pluie | 1 |
| 20 mm/h et plus | pluie violente | 0 |

Étape 2 : s'il ne pleut pas, la probabilité de pluie de l'heure retire un peu.

| Probabilité | Note |
|---|---|
| moins de 30 % | 10 |
| 30 à 70 % | 9 |
| 70 % et plus | 8 |

Étape 3 : le type, d'après le code météo. Il remplace ou limite la note d'intensité.

| Type | Codes | Règle |
|---|---|---|
| Bruine | 51, 53, 55 | note d'intensité |
| Pluie | 61, 63, 65 | note d'intensité |
| Averse | 80, 81, 82 | note d'intensité ; le code 82 (averse violente) déclenche aussi un plafond |
| Neige faible, grains, averse de neige faible | 71, 77, 85 | 6 |
| Neige modérée | 73 | 4 |
| Neige forte, forte averse de neige | 75, 86 | 2, et plafond |
| Bruine ou pluie verglaçante | 56, 57, 66, 67 | 1, et plafond |
| Orage | 95, 97 | note d'intensité limitée à 2, et plafond |
| Orage avec grêle | 96, 99 | 0, et plafond |

La liste des codes vient de la documentation d'Open-Meteo. Elle précise que les codes 96 et 99 ne sortent que des modèles qui prévoient la grêle.

**Non vérifié** : la durée exacte couverte par `precipitation` dans le bloc « actuel » (dernière heure ou dernier quart d'heure). À contrôler au moment de développer. Le bloc quart d'heure permet de toute façon de retrouver une intensité par heure (quart d'heure × 4).

### 2.6 Ciel

De jour, d'après la couverture nuageuse (instant présent) ou le code météo (heures à venir).

| Couverture | Code météo équivalent | Note de jour |
|---|---|---|
| 0 à 20 % | 0 (dégagé) | 10 |
| 20 à 50 % | 1 (peu nuageux) | 9 |
| 50 à 80 % | 2 (partiellement nuageux) | 7 |
| 80 à 95 % | — | 5 |
| 95 à 100 % | 3 (couvert), et tous les codes de pluie ou de neige | 4 |
| Brume : visibilité de 1 à 4 km | — | 6 au plus |
| Brouillard : codes 45 et 48, ou visibilité sous 1 km | 45, 48 | 3 |

Trois règles :

- **La nuit, le ciel compte moitié moins.** L'écart à 10 est divisé par deux, arrondi en faveur de la note : couvert vaut 7 au lieu de 4, brouillard 7 au lieu de 3.
- **Par forte chaleur, les nuages ne sont pas une gêne.** De jour, si le ressenti atteint 29 °C, la note du ciel ne descend pas sous 8 (sauf brouillard).
- **Brouillard dense** (visibilité sous 200 m) : plafond, voir § 3.

**Non vérifié** : les seuils de couverture qu'Open-Meteo utilise pour passer du code 0 au code 1, 2 ou 3. La correspondance du tableau est mon hypothèse.

### 2.7 Vent

Le vent agit deux fois, et les deux effets sont séparés :

1. **Effet sur la température.** Il est déjà dans le ressenti : le vent fait baisser le ressenti. Par temps chaud, cela remonte la note thermique. Par temps froid, cela la baisse. Rien à ajouter.
2. **Gêne mécanique** (cheveux, poussière, bruit, parapluie retourné). C'est ce critère. Il a trois colonnes selon la température de l'air, car une brise n'est pas vécue de la même façon.

| Vent moyen (échelle de Beaufort) | Froid : air sous 15 °C | Tempéré : 15 à 27 °C, ou 37 °C et plus | Chaud : 27 à 37 °C |
|---|---|---|---|
| 0 à 5 km/h (calme) | 10 | 10 | 8 |
| 6 à 11 km/h (très légère brise) | 9 | 10 | 10 |
| 12 à 19 km/h (petite brise) | 8 | 9 | 10 |
| 20 à 28 km/h (jolie brise) | 6 | 8 | 9 |
| 29 à 38 km/h (bonne brise) | 4 | 6 | 7 |
| 39 à 49 km/h (vent frais) | 3 | 4 | 5 |
| 50 à 61 km/h (grand frais) | 1 | 2 | 3 |
| 62 à 74 km/h (coup de vent) | 0 | 1 | 1 |
| 75 km/h et plus | 0 | 0 | 0 |

À lire ainsi : par temps chaud, l'air immobile est pénalisé (8) et la brise est bienvenue (10). Par temps froid, toute brise coûte. À 37 °C et plus, le vent ne rafraîchit plus (effet sèche-cheveux) : on revient à la colonne tempérée.

Les rafales donnent une seconde note. On garde la plus basse des deux.

| Rafales | Note |
|---|---|
| moins de 40 km/h | 10 |
| 40 à 49 km/h | 7 |
| 50 à 59 km/h | 5 |
| 60 à 74 km/h | 3 |
| 75 à 89 km/h | 1 |
| 90 km/h et plus | 0 |

Les tranches de vent moyen suivent l'échelle de Beaufort (vérifiée sur Wikipédia).

### 2.8 Indice UV

| Indice UV | Classe de l'OMS | Note |
|---|---|---|
| 0 à 2 | faible | 10 |
| 3 à 5 | modéré | 10 |
| 6 à 7 | élevé | 7 |
| 8 à 10 | très élevé | 5 |
| 11 et plus | extrême | 3 |

La nuit : 10. Jusqu'à 5, aucun retrait : c'est ce qui permet à une belle journée d'atteindre 10. Le critère pèse peu (retrait de 10 % au plus) : un UV fort est un risque dont on se protège (ombre, chapeau, crème), pas un inconfort immédiat. Les classes sont celles de l'OMS, vérifiées sur Wikipédia ; la protection est conseillée à partir de 3.

L'UV horaire d'Open-Meteo est la moyenne de l'heure précédente (documentation Open-Meteo).

### 2.9 Qualité de l'air

La note vient de l'indice européen (`european_aqi`), qui est le plus mauvais des indices par polluant.

| Indice européen | Classe | Note |
|---|---|---|
| 0 à 20 | bon | 10 |
| 20 à 40 | moyen | 10 |
| 40 à 60 | dégradé | 7 |
| 60 à 80 | mauvais | 5 |
| 80 à 100 | très mauvais | 2 |
| plus de 100 | extrêmement mauvais | 0 |

Seuils par polluant, en microgrammes par mètre cube. Ils servent à dire à l'écran quel polluant est en cause. Ils ne changent pas la note.

| Polluant | Bon | Moyen | Dégradé | Mauvais | Très mauvais | Extrêmement mauvais |
|---|---|---|---|---|---|---|
| PM2.5 | 0 à 5 | 5 à 15 | 15 à 50 | 50 à 90 | 90 à 140 | plus de 140 |
| PM10 | 0 à 15 | 15 à 45 | 45 à 120 | 120 à 195 | 195 à 270 | plus de 270 |
| Dioxyde d'azote (NO2) | 0 à 10 | 10 à 25 | 25 à 60 | 60 à 100 | 100 à 150 | plus de 150 |
| Ozone | 0 à 60 | 60 à 100 | 100 à 120 | 120 à 160 | 160 à 180 | plus de 180 |

Source : documentation de l'API qualité de l'air d'Open-Meteo, qui indique utiliser les seuils européens révisés en 2024, sur des valeurs horaires. **À revérifier au moment de développer** : j'ai lu ces chiffres par un outil de résumé automatique, et ils diffèrent des anciens seuils (par exemple PM2.5 « bon » jusqu'à 10 auparavant).

Les pollens (aulne, bouleau, graminées) sont reçus mais ne sont pas dans la note : la gêne dépend de chaque personne, et ces données ne couvrent que l'Europe (**non vérifié**).

Hors de l'instant présent, l'app n'a pas la qualité de l'air : le critère est neutre.

---

## 3. Plafonds

Un plafond limite la note finale, quel que soit le reste. Si plusieurs plafonds s'appliquent, le plus bas gagne.

| Condition | Détection | Note maximale |
|---|---|---|
| Orage avec grêle | codes 96, 99 | 2 |
| Orage | codes 95, 97 | 3 |
| Pluie ou bruine verglaçante | codes 56, 57, 66, 67 | 3 |
| Pluie violente | 20 mm/h et plus, ou code 82 | 3 |
| Forte pluie | 10 à 20 mm/h | 4 |
| Forte neige | codes 75, 86 | 4 |
| Tempête | rafales de 90 km/h et plus, ou vent moyen de 75 km/h et plus | 1 |
| Coup de vent fort | rafales de 75 à 89 km/h, ou vent moyen de 62 à 74 km/h | 3 |
| Coup de vent | rafales de 60 à 74 km/h, ou vent moyen de 50 à 61 km/h | 5 |
| Chaleur extrême | air à 45 °C et plus | 1 |
| Canicule | air de 40 à 45 °C | 3 |
| Air extrêmement mauvais | indice européen de 100 et plus | 3 |
| Air très mauvais | indice européen de 80 à 100 | 5 |
| Brouillard dense | visibilité sous 200 m | 6 |

**Froid extrême et chaleur humide : pas besoin de plafond séparé.** Dans la formule recommandée, la note finale ne peut jamais dépasser la note thermique. Un ciel bleu à −28 °C (ressenti −33 °C) a une note thermique de 0, donc une note finale de 0. Le plafond « canicule » existe seulement pour la chaleur très sèche, où la formule du ressenti est trop indulgente (42 °C à 10 % d'humidité avec du vent : ressenti 37 °C).

Pas de plafond pour les UV : on peut s'en protéger. C'est un choix à valider (§ 8).

---

## 4. Formule finale

### 4.1 Formule recommandée : base thermique × gênes

```
note = note thermique
       × (1 − 0,60 × (10 − note pluie)   / 10)
       × (1 − 0,40 × (10 − note vent)    / 10)
       × (1 − 0,40 × (10 − note air)     / 10)
       × (1 − 0,20 × (10 − note ciel)    / 10)
       × (1 − 0,10 × (10 − note moiteur) / 10)
       × (1 − 0,10 × (10 − note UV)      / 10)

note arrondie à une décimale
note finale = la plus petite valeur entre cette note et les plafonds du § 3
```

En clair : on part du confort thermique. Chaque gêne retire un pourcentage. Une gêne absente (note 10) ne retire rien. Une gêne maximale (note 0) retire son pourcentage entier. Quand le ressenti est dans la zone idéale et qu'aucune gêne n'est présente, la note vaut exactement 10.

| Critère | Rôle | Retrait maximal |
|---|---|---|
| Thermique | base de la note | — |
| Pluie et neige | gêne | 60 % |
| Vent | gêne | 40 % |
| Qualité de l'air | gêne | 40 % |
| Ciel | gêne | 20 % |
| Moiteur | gêne | 10 % |
| UV | gêne | 10 % |

### 4.2 Variante A : moyenne pondérée (le point de départ évoqué)

```
note = 0,40 × thermique + 0,10 × moiteur + 0,20 × pluie + 0,10 × ciel + 0,10 × vent + 0,05 × UV + 0,05 × air
```

Défaut : l'absence de gêne rapporte des points. Quand il ne pleut pas, qu'il n'y a pas de vent et que l'air est pur, 60 % de la note est acquise d'avance, même par un froid polaire. Il faut alors beaucoup de plafonds pour corriger (variante A′ : mêmes plafonds, plus « note finale ≤ note thermique + 2 »). Et sous le plafond, tout se ressemble : à −3 °C, ciel bleu ou ciel couvert donnent la même note.

### 4.3 Variante B : le pire critère domine

```
note = la plus basse des sept notes
```

Défaut : un seul critère mineur écrase tout. 26 °C au grand soleil avec un UV de 11 obtient 3 sur 10. Et deux gênes ne comptent pas plus qu'une seule.

### 4.4 Comparaison sur les vingt cas

| N° | Situation | A. Moyenne pondérée | A′. Moyenne + plafonds | B. Pire critère | **C. Base thermique × gênes (recommandée)** |
|---|---|---|---|---|---|
| 1 | 24 °C, soleil, vent léger | 10 | 10 | 10 | **10** |
| 2 | 35 °C à 20 % d’humidité, soleil | 8,2 | 8 | 5 | **5,7** |
| 3 | 35 °C à 80 % d’humidité | 4,7 | 2 | 0 | **0** |
| 4 | 28 °C à 85 % (Pattaya, Singapour), nuageux | 7,1 | 7,1 | 1 | **5** |
| 5 | 30 °C sec et venté (Dubai) | 9,4 | 9,4 | 7 | **7,5** |
| 6 | 42 °C très sec, vent chaud (Ahvaz en été) | 7,2 | 3 | 5 | **3** |
| 7 | 15 °C, couvert, bruine (Dublin) | 7,9 | 7,9 | 4 | **5,5** |
| 8 | 5 °C, pluie et vent | 5,4 | 5,4 | 3 | **1,9** |
| 9 | −3 °C, ciel clair, sans vent (Anchorage) | 7,5 | 6 | 4 | **4** |
| 10 | −28 °C, ciel clair (Tiksi) | 5,8 | 2 | 0 | **0** |
| 11 | 22 °C, orage | 6,6 | 3 | 2 | **3** |
| 12 | 26 °C, grand soleil, UV 11 (Tahiti) | 9,4 | 9,4 | 3 | **9** |
| 13 | 24 °C, air très pollué (indice 115) | 9,4 | 3 | 0 | **3** |
| 14 | Nuit claire à 18 °C | 9,6 | 9,6 | 9 | **9** |
| 15 | 12 °C, soleil, vent faible (Paris au printemps) | 8,7 | 8,7 | 7 | **6,7** |
| 16 | 0 °C, neige faible, couvert | 6,1 | 6 | 4 | **2,6** |
| 17 | 2 °C, brouillard épais, calme | 7,2 | 6 | 3 | **3,8** |
| 18 | 18 °C, tempête sèche (vent 55, rafales 85) | 7,6 | 3 | 1 | **3** |
| 19 | 30 °C, grosse averse tropicale (15 mm/h) | 5 | 4 | 0 | **2** |
| 20 | 24 °C, couvert, calme, sec | 9,3 | 9,3 | 4 | **8,7** |

### 4.5 Recommandation

Je recommande la formule **C, base thermique × gênes**, avec les plafonds du § 3.

- Elle répond à ta demande de départ : la chaleur, le froid et l'humidité décident d'abord. Le reste module.
- Elle n'a besoin d'aucun plafond pour le froid : −28 °C sous ciel bleu donne 0, pas 6.
- Les gênes se cumulent : pluie et vent ensemble coûtent plus que la pluie seule.
- Elle reste simple à expliquer à l'écran : « base 8 (ressenti 14 °C), bruine −18 %, ciel couvert −12 %, vent −4 % ».

Elle s'inspire des indices de tourisme, qui donnent eux aussi la première place au confort thermique :

| Indice | Formule et poids | Vérifié ? |
|---|---|---|
| Tourism Climate Index (Mieczkowski, 1985) | TCI = 2 × (4 × CId + CIa + 2 × R + 2 × S + W). Confort de jour 40 %, confort moyen sur 24 h 10 %, pluie 20 %, ensoleillement 20 %, vent 10 %. Chaque sous-indice est noté de 0 à 5. Échelle : 90 à 100 idéal, 80 à 89 excellent, 70 à 79 très bon, 60 à 69 bon, 50 à 59 acceptable, 40 à 49 marginal, 30 à 39 défavorable, 20 à 29 très défavorable, 10 à 19 extrêmement défavorable, moins de 10 impossible | oui, par un article qui reproduit la formule et le tableau (Kovács et Unger, 2014). L'article de 1985 lui-même n'a pas été consulté |
| Holiday Climate Index (Scott, Rutty, Amelung et Tang, 2016, revue *Atmosphere*) | Version urbaine : confort thermique 40 %. Données journalières : température maximale et humidité, nébulosité, pluie, vent. Note de 0 à 100. La pluie et le vent peuvent « l'emporter » sur le reste : c'est le principe de mes plafonds | en partie. **Non vérifié** : la formule complète (de mémoire : 4 × confort + 2 × nébulosité + 3 × pluie + 1 × vent, soit 40, 20, 30 et 10 %) et les barèmes par tranche. L'article était inaccessible |

Ces deux indices sont des moyennes pondérées. Ils fonctionnent parce qu'ils notent des climats de vacances, pas des −28 °C. Pour une app qui couvre Tiksi et Dubai, la moyenne ne suffit pas.

---

## 5. Libellés

| Note | Libellé |
|---|---|
| 9 à 10 | Idéal |
| 7 à 8,9 | Agréable |
| 5 à 6,9 | Correct |
| 3 à 4,9 | Médiocre |
| 1 à 2,9 | Pénible |
| 0 à 0,9 | Extrême |

Affichage proposé : la note avec une décimale (« 7,5 »), sans décimale quand elle tombe juste (« 10 »), suivie du libellé.

---

## 6. Cas concrets, calculés de bout en bout

Les valeurs d'entrée sont des situations types, choisies par moi. Ce ne sont pas des relevés réels.

### 6.1 Entrées

| N° | Air | Humidité | Vent / rafales | Pluie | Code | Nuages | UV | Indice air |
|---|---|---|---|---|---|---|---|---|
| 1 | 24 °C | 50 % | 8 / 15 km/h | 0 mm/h | 0 | 10 % | 5 | 18 |
| 2 | 35 °C | 20 % | 10 / 20 km/h | 0 mm/h | 0 | 5 % | 9 | 35 |
| 3 | 35 °C | 80 % | 8 / 15 km/h | 0 mm/h | 0 | 40 % | 9 | 35 |
| 4 | 28 °C | 85 % | 8 / 15 km/h | 0 mm/h | 0 | 60 % | 8 | 30 |
| 5 | 30 °C | 15 % | 30 / 45 km/h | 0 mm/h | 0 | 0 % | 7 | 45 |
| 6 | 42 °C | 10 % | 25 / 40 km/h | 0 mm/h | 0 | 0 % | 10 | 70 |
| 7 | 15 °C | 85 % | 15 / 28 km/h | 0,3 mm/h | 51 | 100 % | 1 | 15 |
| 8 | 5 °C | 90 % | 30 / 50 km/h | 3 mm/h | 63 | 100 % | 1 | 15 |
| 9 | −3 °C | 70 % | 3 / 6 km/h | 0 mm/h | 0 | 5 % | 1 | 12 |
| 10 | −28 °C | 75 % | 8 / 12 km/h | 0 mm/h | 0 | 5 % | 0 | 10 |
| 11 | 22 °C | 75 % | 20 / 55 km/h | 6 mm/h | 95 | 100 % | 2 | 25 |
| 12 | 26 °C | 55 % | 10 / 18 km/h | 0 mm/h | 0 | 5 % | 11 | 25 |
| 13 | 24 °C | 50 % | 5 / 10 km/h | 0 mm/h | 0 | 20 % | 5 | 115 |
| 14 | 18 °C | 70 % | 5 / 10 km/h | 0 mm/h | 0 | 5 % | nuit | 20 |
| 15 | 12 °C | 60 % | 10 / 18 km/h | 0 mm/h | 0 | 15 % | 4 | 30 |
| 16 | 0 °C | 95 % | 10 / 20 km/h | 0,5 mm/h | 71 | 100 % | 0 | 20 |
| 17 | 2 °C | 100 % | 3 / 6 km/h | 0 mm/h | 45 | 100 % | 0 | 45 |
| 18 | 18 °C | 65 % | 55 / 85 km/h | 0 mm/h | 0 | 70 % | 3 | 15 |
| 19 | 30 °C | 85 % | 15 / 35 km/h | 15 mm/h | 81 | 100 % | 3 | 25 |
| 20 | 24 °C | 60 % | 8 / 15 km/h | 0 mm/h | 0 | 100 % | 3 | 20 |

L'indice d'air est l'indice européen. Le code est le code météo (0 dégagé, 45 brouillard, 51 bruine, 63 pluie, 71 neige faible, 81 averse, 95 orage).

### 6.2 Notes par critère et note finale

Le ressenti et le point de rosée sont calculés avec les formules du § 2.1 (à l'ombre). Le ressenti et le point de rosée sont arrondis au degré. La colonne « Calcul » montre la base thermique, puis le retrait de chaque gêne présente, puis la note. Les retraits se multiplient, ils ne s'additionnent pas.

| N° | Situation | Ressenti | Point de rosée | Therm. | Moit. | Pluie | Ciel | Vent | UV | Air | Calcul | **Note** | Libellé |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 24 °C, soleil, vent léger | 24 °C | 13 °C | 10 | 10 | 10 | 10 | 10 | 10 | 10 | base 10 → 10 | **10** | idéal |
| 2 | 35 °C à 20 % d’humidité, soleil | 33 °C | 9 °C | 6 | 10 | 10 | 10 | 10 | 5 | 10 | base 6 ; UV −5 % → 5,7 | **5,7** | correct |
| 3 | 35 °C à 80 % d’humidité | 45 °C | 31 °C | 0 | 0 | 10 | 9 | 10 | 5 | 10 | base 0 ; moiteur −10 %, ciel −2 %, UV −5 % → 0 | **0** | extrême |
| 4 | 28 °C à 85 % (Pattaya, Singapour), nuageux | 34 °C | 25 °C | 6 | 1 | 10 | 8 | 10 | 5 | 10 | base 6 ; moiteur −9 %, ciel −4 %, UV −5 % → 5 | **5** | correct |
| 5 | 30 °C sec et venté (Dubai) | 24 °C | 1 °C | 10 | 10 | 10 | 10 | 7 | 7 | 7 | base 10 ; vent −12 %, UV −3 %, air −12 % → 7,5 | **7,5** | agréable |
| 6 | 42 °C très sec, vent chaud (Ahvaz en été) | 37 °C | 4 °C | 5 | 10 | 10 | 10 | 7 | 5 | 5 | base 5 ; vent −12 %, UV −5 %, air −20 % → 3,3 ; plafond « canicule » → 3 | **3** | médiocre |
| 7 | 15 °C, couvert, bruine (Dublin) | 14 °C | 12 °C | 8 | 10 | 7 | 4 | 9 | 10 | 10 | base 8 ; pluie −18 %, ciel −12 %, vent −4 % → 5,5 | **5,5** | correct |
| 8 | 5 °C, pluie et vent | −1 °C | 3 °C | 5 | 10 | 3 | 4 | 4 | 10 | 10 | base 5 ; pluie −42 %, ciel −12 %, vent −24 % → 1,9 | **1,9** | pénible |
| 9 | −3 °C, ciel clair, sans vent (Anchorage) | −6 °C | −8 °C | 4 | 9 | 10 | 10 | 10 | 10 | 10 | base 4 ; moiteur −1 % → 4 | **4** | médiocre |
| 10 | −28 °C, ciel clair (Tiksi) | −33 °C | −31 °C | 0 | 9 | 10 | 10 | 9 | 10 | 10 | base 0 ; moiteur −1 %, vent −4 % → 0 | **0** | extrême |
| 11 | 22 °C, orage | 22 °C | 17 °C | 9 | 7 | 2 | 4 | 5 | 10 | 10 | base 9 ; moiteur −3 %, pluie −48 %, ciel −12 %, vent −20 % → 3,2 ; plafond « orage » → 3 | **3** | médiocre |
| 12 | 26 °C, grand soleil, UV 11 (Tahiti) | 27 °C | 16 °C | 10 | 7 | 10 | 10 | 10 | 3 | 10 | base 10 ; moiteur −3 %, UV −7 % → 9 | **9** | idéal |
| 13 | 24 °C, air très pollué (indice 115) | 24 °C | 13 °C | 10 | 10 | 10 | 9 | 10 | 10 | 0 | base 10 ; ciel −2 %, air −40 % → 5,9 ; plafond « air extrêmement mauvais » → 3 | **3** | médiocre |
| 14 | Nuit claire à 18 °C | 18 °C | 12 °C | 9 | 10 | 10 | 10 | 10 | 10 | 10 | base 9 → 9 | **9** | idéal |
| 15 | 12 °C, soleil, vent faible (Paris au printemps) | 9 °C | 4 °C | 7 | 10 | 10 | 10 | 9 | 10 | 10 | base 7 ; vent −4 % → 6,7 | **6,7** | correct |
| 16 | 0 °C, neige faible, couvert | −4 °C | −1 °C | 4 | 10 | 6 | 4 | 9 | 10 | 10 | base 4 ; pluie −24 %, ciel −12 %, vent −4 % → 2,6 | **2,6** | pénible |
| 17 | 2 °C, brouillard épais, calme | 0 °C | 2 °C | 5 | 10 | 10 | 3 | 10 | 10 | 7 | base 5 ; ciel −14 %, air −12 % → 3,8 | **3,8** | médiocre |
| 18 | 18 °C, tempête sèche (vent 55, rafales 85) | 10 °C | 11 °C | 7 | 10 | 10 | 7 | 1 | 10 | 10 | base 7 ; ciel −6 %, vent −36 % → 4,2 ; plafond « coup de vent fort » → 3 | **3** | médiocre |
| 19 | 30 °C, grosse averse tropicale (15 mm/h) | 36 °C | 27 °C | 5 | 0 | 1 | 8 | 10 | 10 | 10 | base 5 ; moiteur −10 %, pluie −54 %, ciel −4 % → 2 | **2** | pénible |
| 20 | 24 °C, couvert, calme, sec | 25 °C | 16 °C | 10 | 9 | 10 | 4 | 10 | 10 | 10 | base 10 ; moiteur −1 %, ciel −12 % → 8,7 | **8,7** | agréable |

### 6.3 Ce que disent ces cas

- **Sec contre humide** (cas 2 et 3) : 35 °C donne 5,7 à 20 % d'humidité et 0 à 80 %.
- **Tropiques** (cas 4) : 28 °C à 85 % donne 5. Le ressenti est de 34 °C et l'air est oppressant. C'est sévère pour un temps ordinaire à Singapour ; à toi de dire si cela sonne juste.
- **Vent par temps chaud** (cas 5) : à Dubai, 30 km/h de vent font tomber le ressenti de 30 à 24 °C. La base thermique est 10, et le vent ne retire que 12 %.
- **Froid sec et calme** (cas 9 et 15) : −3 °C sous ciel bleu donne 4 ; 12 °C au soleil donne 6,7. Tout dépend de la pente côté froid (§ 8).
- **Dangers** (cas 11, 13, 18) : orage, air très pollué et tempête sont ramenés à 3 par les plafonds, même à 22 ou 24 °C.
- **Nuit** (cas 14) : 18 °C par nuit claire donne 9. Ni UV ni ciel ne pèsent.

---

## 7. Limites connues

- **Soleil.** Pour les heures à venir, le ressenti est calculé à l'ombre. En plein soleil fort, il manque jusqu'à 3 °C environ.
- **Chaleur sèche et ventée.** La formule du ressenti retire toujours des degrés pour le vent, même à 42 °C. Le plafond « canicule » corrige les cas extrêmes, pas les cas entre 37 et 40 °C.
- **Double compte de l'humidité.** Elle agit dans le ressenti et dans la moiteur. C'est voulu, et limité à 10 %.
- **Marches d'escalier.** Avec des tranches, la note saute d'un coup quand on change de tranche (10 à 26,9 °C, 9 à 27 °C). Au développement, on pourra lisser en reliant les milieux de tranches par des droites. Les cas ci-dessus sont calculés sans lissage.
- **Qualité de l'air.** Connue pour maintenant seulement. La note des heures à venir l'ignore.
- **Ciel des heures à venir.** Quatre niveaux seulement, d'après le code météo.

Trois ajouts possibles lèveraient ces limites **sans nouvelle requête**, en demandant simplement des champs de plus dans les requêtes existantes : `apparent_temperature` et `cloud_cover` en horaire, et la qualité de l'air en horaire. Chaque colonne horaire ajoute 240 valeurs à télécharger. C'est ta décision ; rien n'est changé.

---

## 8. Les choix qui te reviennent

La page `docs-conception/reglages-indice.html` permet d'essayer la plupart de ces choix avec des curseurs : zone idéale, pentes, poids de chaque gêne, plafonds. Elle recalcule en direct la note et les 20 cas. Elle utilise les mêmes barèmes que ce document.

| Choix | Proposition actuelle | Autre possibilité |
|---|---|---|
| Zone idéale | 22 à 27 °C ressentis (ta demande) | — |
| Sévérité côté froid | 1 point tous les 5 °C sous 22 °C : 12 °C au soleil vaut 6,7 ; −3 °C sous ciel bleu vaut 4 | plus sévère (tu aimes la chaleur) ou plus douce (un beau jour d'hiver) |
| Sévérité côté chaud | 1 point tous les 2 °C au-dessus de 27 °C | plus douce pour les tropiques (cas 4 à 5) |
| Formule | base thermique × gênes | moyenne pondérée avec plafonds |
| Retrait maximal par gêne | pluie 60 %, vent 40 %, air 40 %, ciel 20 %, moiteur 10 %, UV 10 % | à ajuster un par un |
| Moiteur | 10 %, car déjà dans le ressenti | 15 à 20 % si tu veux punir davantage l'air moite |
| UV | aucun retrait jusqu'à 5 ; pas de plafond | plafond (par exemple 7 au plus à partir de 11) |
| Ciel couvert | −12 % de jour ; pas de retrait par forte chaleur | plus ou moins fort |
| Plafonds | tableau du § 3 | valeurs à ajuster ; ajouter ou retirer des conditions |
| Canicule | plafond 3 à partir de 40 °C d'air | seuil plus bas (38 °C) |
| Pollens | hors de la note | les ajouter comme gêne |
| Note du jour | moyenne des heures du lever au coucher | moyenne de 8 h à 20 h, ou meilleure plage de 3 heures |
| Libellés et arrondi | six libellés, note à une décimale | autres mots, note entière |
| Champs horaires en plus | aucun | ressenti, nuages, air (voir § 7) |

---

## 9. Sources

Vérifié par lecture directe ou par recherche le 18 novembre 2026 :

- Champs demandés par l'app : `docs/js/api.js`.
- Définitions des variables et codes météo : https://open-meteo.com/en/docs
- Formule de la température ressentie d'Open-Meteo : dépôt public `open-meteo/open-meteo`, fichier `Sources/App/Helper/Meteorology.swift`, fonction `apparentTemperature`. Contrôlée ensuite sur les valeurs en direct de Paris, Singapour, Anchorage, Dubai et Tahiti.
- Indice européen de qualité de l'air et seuils : https://open-meteo.com/en/docs/air-quality-api
- Humidex : https://en.wikipedia.org/wiki/Humidex
- Heat Index : https://en.wikipedia.org/wiki/Heat_index
- Refroidissement éolien et formule australienne de Steadman : https://en.wikipedia.org/wiki/Wind_chill
- Risques de gelure : https://www.canada.ca/en/services/environment/weather/severeweather/wind-chill-index.html
- Classes de l'UTCI : https://thermofeel.readthedocs.io/en/latest/guide/utci.html et https://climate-adapt.eea.europa.eu/en/metadata/indicators/thermal-comfort-indices-universal-thermal-climate-index-1979-2019
- Point de rosée : https://www.weather.gov/arx/why_dewpoint_vs_humidity et https://en.wikipedia.org/wiki/Dew_point
- Indice UV : https://en.wikipedia.org/wiki/Ultraviolet_index
- Échelle de Beaufort : https://en.wikipedia.org/wiki/Beaufort_scale
- Tourism Climate Index : Kovács et Unger, 2014, *Acta Climatologica et Chorologica* 47-48, pages 77 à 84 (reproduit la formule et le tableau de Mieczkowski, 1985).
- Holiday Climate Index : Scott, Rutty, Amelung et Tang, 2016, *Atmosphere* 7(6), 80, https://www.mdpi.com/2073-4433/7/6/80 (article non consulté : accès refusé ; seuls le résumé et des citations indirectes ont été lus).

Non vérifié (rappel) : formule complète et barèmes du Holiday Climate Index ; palier de 24 °C du point de rosée ; seuils de nuages des codes météo 0 à 3 ; durée couverte par `precipitation` dans le bloc actuel ; couverture géographique des pollens ; seuils par polluant à relire dans la source.

Tous les barèmes et pourcentages de ce document sont ma proposition. Ils ne viennent d'aucune norme.

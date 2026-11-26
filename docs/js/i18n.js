/* Textes français et anglais, nombres, heures du lieu affiché. */
(function () {
  var T = {
    fr: {
      days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      daysShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
      months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
      today: 'Aujourd’hui', todayShort: 'Auj.', tomorrow: 'Demain', now: 'Maint.',
      feels: 'Ressenti', max: 'Max', min: 'Min', precip: 'Précip.', chance: 'Risque',
      gusts: 'rafales', wind: 'Vent', humidity: 'Humidité', dew: 'Point de rosée', pressure: 'Pression',
      visibility: 'Visibilité', uv: 'Indice UV', clouds: 'Nuages', sun: 'Soleil', moon: 'Lune',
      air: 'Qualité de l’air', pollen: 'Pollens', rainTotal: 'Précipitations',
      sunrise: 'Lever', sunset: 'Coucher', daylight: 'Durée du jour', tomorrowShort: 'demain',
      next3h: 'Pluie dans les 3 heures', hourly: 'Heure par heure', daily: '10 jours', details: 'Détails', openLog: 'Ouvrir le journal', logTitle: 'Journal', logKept: '7 jours gardés', copy: 'Copier', copied: 'Copié', copyFailed: 'Copie impossible', rotPlay: 'Faire tourner le globe', rotPause: 'Arrêter le globe', reorder: 'Glisser pour déplacer', tpHours: 'Heures', tpMinutes: 'Minutes', tpNow: 'Maintenant', hvCond: 'Conditions météo', hvPrecip: 'Précipitations', hvWind: 'Vent', hvCondSub: 'Température (°C)', hvPrecipSub: 'Intensité · Risque de pluie', hvWindSub: 'Vitesse (km/h) · Rafales', edit: 'Modifier', done: 'Terminé', editMode: 'Mode édition', editHint: 'glissez les blocs pour les réordonner, − pour en retirer.', addTiles: 'Ajouter', removeTile: 'Retirer',
      rising: 'en hausse', falling: 'en baisse', steady: 'stable',
      uvLevels: ['faible', 'modéré', 'élevé', 'très élevé', 'extrême'],
      airLevels: ['bon', 'correct', 'moyen', 'médiocre', 'mauvais', 'très mauvais'],
      pollenLevels: ['nul', 'faible', 'moyen', 'fort', 'très fort'],
      alder: 'Aulne', birch: 'Bouleau', grass: 'Graminées',
      dirs: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
      moonPhases: ['Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Lune gibbeuse croissante', 'Pleine lune', 'Lune gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'],
      illuminated: 'éclairée',
      today24: 'aujourd’hui', next24: 'sur 24 h',
      updated: 'Mis à jour à', stale: 'Données anciennes', offline: 'Hors connexion', retrying: 'Météo injoignable, nouvel essai', loading: 'Chargement…',
      noData: 'Pas encore de données pour ce lieu.', retry: 'Réessayer',
      rainNow: function (until) { return until ? 'Pluie jusqu’à ' + until : 'Pluie pendant les 3 prochaines heures'; },
      snowNow: function (until) { return until ? 'Neige jusqu’à ' + until : 'Neige pendant les 3 prochaines heures'; },
      rainSoon: function (kind, min) { return kind + ' dans ' + min + ' min'; },
      rainLater: function (kind, when) { return kind + ' probable ' + when; },
      dry: 'Pas de pluie prévue dans les 12 heures',
      intensities: { rain: ['Pluie faible', 'Pluie modérée', 'Forte pluie'], snow: ['Neige faible', 'Neige modérée', 'Forte neige'] },
      at: function (t) { return 'à ' + t; },
      towards: function (t) { return 'vers ' + t; },
      tomorrowAt: function (t) { return 'demain vers ' + t; },
      dayAt: function (d, t) { return d + ' vers ' + t; },
      alerts: {
        frost: function (v, w) { return 'Gel, jusqu’à ' + v + ' ' + w; },
        gust: function (v, w) { return 'Rafales à ' + v + ' km/h ' + w; },
        rain: function (v, w) { return 'Fortes pluies, ' + v + ' mm/h ' + w; },
        rainDay: function (v) { return 'Fortes pluies, ' + v + ' mm sur 24 h'; },
        snow: function (v, w) { return 'Neige, ' + v + ' cm en 24 h, dès ' + w; },
        storm: function (w) { return 'Orage possible ' + w; },
        heat: function (v, w) { return 'Forte chaleur, ' + v + ' ' + w; },
        uv: function (v, w) { return 'UV élevé (' + v + ') ' + w; },
        air: function (v, l) { return 'Air ' + l + ' (indice ' + v + ')'; }
      },
      places: 'Lieux', settings: 'Réglages', search: 'Rechercher une ville', add: 'Ajouter', remove: 'Supprimer',
      startHere: 'Lieu de démarrage', done: 'Terminé', noResult: 'Aucun résultat', searching: 'Recherche…',
      added: 'Ajouté', alreadyThere: 'Déjà dans la liste', lastPlace: 'Il faut garder au moins un lieu',
      carousel: 'Défilement des lieux', off: 'Arrêté', every: function (s) { return s < 60 ? s + ' s' : (s / 60) + ' min'; },
      veil: 'Atténuation la nuit', auto: 'Automatique', hours: 'Horaires', from: 'de', to: 'à', level: 'Assombrissement de l’écran la nuit', lighter: 'Plus clair', darker: 'Plus sombre', dotSize: 'Taille des points de la carte (cet appareil)', smaller: 'Plus petits', bigger: 'Plus grands',
      motion: 'Animations', reduced: 'Réduites', motionOff: 'Coupées',
      seconds: 'Secondes sur l’horloge', yes: 'Oui', no: 'Non', language: 'Langue',
      about: 'À propos', source: 'Données météo : Open-Meteo.com (licence CC BY 4.0)', diagnostic: 'Diagnostic',
      version: 'Version', clearLog: 'Vider le journal', demo: 'Démonstration', demoTime: 'Moment', demoWeather: 'Temps',
      demoCycle: 'Journée en 60 s', demoStop: 'Arrêter la démonstration', reload: 'Recharger', forceUpdate: 'Forcer la mise à jour', latest: 'En ligne :', checking: 'Recherche de la version en ligne…', upToDate: 'C’est la dernière version.', updateAvail: 'Version %1 disponible.', onlineUnknown: 'Version en ligne inconnue (hors connexion).',
      veilHint: 'Touchez l’écran pour rallumer',
      badge: 'DÉMO', close: 'Fermer', worldMap: 'Carte du monde', allPlaces: 'Tous les lieux', comfort: 'Bien-être', comfortBase: 'Base', comfortFeels: 'ressenti', comfortNone: 'Aucune gêne', comfortCap: 'Plafond', comfortShade: 'À l’ombre', comfortWhy: 'Pourquoi cette note', comfortWhyParts: { thermique: 'Température', moiteur: 'Humidité', pluie: 'Pluie, neige', ciel: 'Ciel', vent: 'Vent', uv: 'UV', air: 'Air' }, comfortParts: { pluie: 'Pluie ou neige', vent: 'Vent', air: 'Air', ciel: 'Ciel', moiteur: 'Moiteur', uv: 'UV' }, comfortLevels: { ideal: 'Idéal', pleasant: 'Agréable', fair: 'Correct', poor: 'Médiocre', tough: 'Pénible', extreme: 'Extrême' }, comfortCaps: { hail: 'orage avec grêle', storm: 'orage', freezing: 'pluie verglaçante', fog: 'brouillard', heat: 'air très chaud', pluie: 'pluie ou neige', vent: 'vent', air: 'qualité de l’air', ciel: 'ciel', moiteur: 'moiteur', uv: 'UV' },
      calibration: 'Calibration du ressenti', calibrationHint: 'Les valeurs de l’indice de bien-être, à régler sur une situation réelle ou un cas type.',
      calib: { title: 'Calibration du ressenti',
        hint: 'Chaque curseur recalcule la note tout de suite. Les valeurs de la formule s’appliquent partout dans l’app dès qu’on lâche le curseur.',
        situation: 'Situation', srcPlace: 'Lieu affiché', edited: 'retouchée', time: 'Moment', day: 'Jour', night: 'Nuit', sun: 'Au soleil', shade: 'À l’ombre',
        sit: { T: 'Température de l’air', rh: 'Humidité', v: 'Vent moyen', g: 'Rafales', mm: 'Pluie ou neige', pop: 'Probabilité de pluie (s’il ne pleut pas)',
          nuages: 'Nuages', uv: 'Indice UV', aqi: 'Indice européen de qualité de l’air', type: 'Type de précipitation', vis: 'Visibilité' },
        types: { auto: 'Pluie ou bruine', annonce: 'Pluie annoncée, presque rien mesuré', violente: 'Averse violente', neige1: 'Neige faible', neige2: 'Neige modérée',
          neige3: 'Neige forte', verglas: 'Pluie verglaçante', orage: 'Orage', grele: 'Orage avec grêle' },
        vis: ['Bonne', 'Brume (1 à 4 km)', 'Brouillard (moins de 1 km)', 'Brouillard dense (moins de 200 m)'],
        groups: { therm: 'Confort thermique (base de la note)', weights: 'Poids de chaque gêne : retrait maximal', force: 'Force de chaque gêne quand elle est forte',
          other: 'Pluie annoncée et ombre', caps: 'Plafonds : note maximale en cas de danger' },
        groupHints: { therm: 'La note thermique vaut 10 dans la zone idéale, puis baisse peu à peu. Par temps froid, l’humidité ne réchauffe plus le ressenti. L’air très chaud limite la note même quand il est sec.',
          weights: 'Une gêne à son pire retire ce pourcentage de la base. À 0 %, elle ne compte plus.',
          force: 'Une gêne forte limite aussi la note à elle seule : note maximale = 10 − force × (10 − note de la gêne). Avec une force de 80 %, un air noté 5 limite la note à 6. À 0 %, cette limite n’existe pas.',
          other: '', caps: 'À 10, le plafond est désactivé.' },
        k: { lo: 'Zone idéale : de', hi: 'Zone idéale : à', pc: 'Côté froid : 1 point perdu tous les', pc2: 'Grand froid (plus de 14 °C sous la zone) : 1 point tous les',
          fh: 'Froid humide : retrait au plus, en points', ph: 'Côté chaud : 1 point perdu tous les', chSeuil: 'Air très chaud : la note baisse à partir de',
          chPente: 'Air très chaud : 1 point perdu tous les', pluie: 'Pluie et neige', vent: 'Vent', air: 'Qualité de l’air', ciel: 'Ciel (nuages, brouillard)',
          moiteur: 'Moiteur', uv: 'UV', k_pluie: 'Pluie et neige', k_vent: 'Vent', k_air: 'Qualité de l’air', k_ciel: 'Ciel', k_moiteur: 'Moiteur', k_uv: 'UV',
          annonce: 'Pluie annoncée sans quantité : note de pluie au plus', uvOmbre: 'Part des UV reçue à l’ombre', c_orage: 'Orage', c_grele: 'Orage avec grêle',
          c_verglas: 'Pluie verglaçante', c_brouillard: 'Brouillard dense (moins de 200 m)' },
        off: 'désactivé', atMost: 'au plus', dew: 'point de rosée', noGap: 'le soleil ne change rien ici', shadeWins: 'l’ombre fait gagner', sunWins: 'le soleil fait gagner',
        oneNight: 'La nuit, il n’y a qu’une seule note.', capped: 'Calcul : %1. Limite « %2 » : note ramenée à %3.', noCap: 'Aucune limite ne s’applique.',
        reset: 'Revenir aux valeurs proposées', cases: 'Cas types', casesHint: 'Recalculés avec les valeurs ci-dessus. Touchez une ligne pour l’essayer en haut. La nuit, il n’y a qu’une note.',
        colCase: 'Situation', colDef: 'Proposé', changed: 'Modifié par rapport aux valeurs proposées :', unchanged: 'Valeurs proposées, sans changement.',
        caseNames: ['24 °C, soleil, vent léger', '35 °C à 20 % d’humidité, soleil', '35 °C à 80 % d’humidité', '28 °C à 85 % (Singapour), nuageux', '30 °C sec et venté (Dubaï)',
          '42 °C très sec, vent chaud (Ahvaz en été)', '15 °C, couvert, bruine (Dublin)', '5 °C, pluie et vent', '−3 °C, ciel clair, sans vent (Anchorage)', '−28 °C, ciel clair (Tiksi)',
          '22 °C, orage', '26 °C, grand soleil, UV 11 (Tahiti)', '24 °C, air très pollué (indice 115)', 'Nuit claire à 18 °C', '12 °C, soleil, vent faible (Paris au printemps)',
          '0 °C, neige faible, couvert', '2 °C, brouillard épais, calme', '18 °C, tempête sèche (vent 55, rafales 85)', '30 °C, grosse averse tropicale (15 mm/h)', '24 °C, couvert, calme, sec',
          'Dublin la nuit : 9 °C, 87 %, bruine annoncée', '34 °C à 69 %, vent faible, peu de nuages', '24 °C, soleil, air mauvais (indice 70)', 'Pattaya à 14 h : 32 °C à 56 %, soleil',
          'Niamey : 36 °C à 7 %, vent sec', 'Miami la nuit : 23 °C à 96 %', 'Paris en hiver : 2 °C, couvert', 'Beau jour d’hiver : −5 °C, soleil, calme', '40 °C à 10 %, sans vent',
          '30 °C à 50 %, plein soleil (UV 8)'] },
      backup: 'Sauvegarde', backupHint: 'Lieux, réglages, carte et étiquettes, pour les garder ou les copier sur un autre appareil.', exportData: 'Exporter', importData: 'Importer', exportHint: 'Copiez ce texte (ou téléchargez-le) et gardez-le.', importHint: 'Collez une sauvegarde puis touchez Appliquer.', importApply: 'Appliquer', importBad: 'Sauvegarde illisible', importConfirm: 'Remplacer les lieux et les réglages de cet appareil par ceux de la sauvegarde ?', download: 'Télécharger', cityView: 'Ville', rotateForMap: 'Tournez le téléphone pour afficher la carte.', dotBlink: 'Clignotement', dotHalo: 'Halo', dotTemp: 'Couleur de la température', clocks: 'Horloges', weatherCards: 'Météo',
      mapStyles: { nature: 'Nature', satellite: 'Satellite', flat: 'Épuré', atlas: 'Atlas', neon: 'Néon' }, viewMap: 'Carte', viewGlobe: 'Globe',
      yesterday: 'Hier', sameTime: 'même heure', mapCredit: 'Natural Earth · images NASA Blue Marble et VIIRS · jour et nuit calculés à la minute', hourOpt: function (h) { return h + ' h'; },
      diag: { version: 'Version', browser: 'Navigateur', screen: 'Écran', window: 'fenêtre', home: 'Écran d’accueil',
        anim: 'Animation', fps: 'i/s', quality: 'qualité', lastCall: 'Dernier appel', network: 'Réseau',
        online: 'en ligne', offline: 'hors ligne', uptime: 'Allumé depuis', errors: 'Erreurs', motion: { auto: 'auto', reduced: 'réduites', off: 'coupées' } },
      demoTimes: { nuit: 'Nuit', aube: 'Aube', lever: 'Lever', matin: 'Matin', midi: 'Midi', soir: 'Soir', coucher: 'Coucher', crepuscule: 'Crépuscule' },
      demoWeathers: { reel: 'Réel', clair: 'Clair', voile: 'Voilé', nuageux: 'Nuageux', couvert: 'Couvert', brouillard: 'Brouillard', bruine: 'Bruine', pluie: 'Pluie', averse: 'Averses', orage: 'Orage', neige: 'Neige', grele: 'Grêle' }
    },
    en: {
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      today: 'Today', todayShort: 'Today', tomorrow: 'Tomorrow', now: 'Now',
      feels: 'Feels like', max: 'Max', min: 'Min', precip: 'Precip.', chance: 'Chance',
      gusts: 'gusts', wind: 'Wind', humidity: 'Humidity', dew: 'Dew point', pressure: 'Pressure',
      visibility: 'Visibility', uv: 'UV index', clouds: 'Cloud cover', sun: 'Sun', moon: 'Moon',
      air: 'Air quality', pollen: 'Pollen', rainTotal: 'Precipitation',
      sunrise: 'Sunrise', sunset: 'Sunset', daylight: 'Daylight', tomorrowShort: 'tomorrow',
      next3h: 'Rain in the next 3 hours', hourly: 'Hourly', daily: '10 days', details: 'Details', openLog: 'Open log', logTitle: 'Log', logKept: '7 days kept', copy: 'Copy', copied: 'Copied', copyFailed: 'Copy failed', rotPlay: 'Spin the globe', rotPause: 'Stop the globe', reorder: 'Drag to move', tpHours: 'Hours', tpMinutes: 'Minutes', tpNow: 'Now', hvCond: 'Conditions', hvPrecip: 'Precipitation', hvWind: 'Wind', hvCondSub: 'Temperature (°C)', hvPrecipSub: 'Intensity · Chance of rain', hvWindSub: 'Speed (km/h) · Gusts', edit: 'Edit', done: 'Done', editMode: 'Edit mode', editHint: 'drag the blocks to reorder them, − to remove one.', addTiles: 'Add', removeTile: 'Remove',
      rising: 'rising', falling: 'falling', steady: 'steady',
      uvLevels: ['low', 'moderate', 'high', 'very high', 'extreme'],
      airLevels: ['good', 'fair', 'moderate', 'poor', 'very poor', 'extremely poor'],
      pollenLevels: ['none', 'low', 'moderate', 'high', 'very high'],
      alder: 'Alder', birch: 'Birch', grass: 'Grass',
      dirs: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
      moonPhases: ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'],
      illuminated: 'illuminated',
      today24: 'today', next24: 'next 24 h',
      updated: 'Updated at', stale: 'Old data', offline: 'Offline', retrying: 'Weather unreachable, retrying', loading: 'Loading…',
      noData: 'No data for this place yet.', retry: 'Retry',
      rainNow: function (until) { return until ? 'Rain until ' + until : 'Rain for the next 3 hours'; },
      snowNow: function (until) { return until ? 'Snow until ' + until : 'Snow for the next 3 hours'; },
      rainSoon: function (kind, min) { return kind + ' in ' + min + ' min'; },
      rainLater: function (kind, when) { return kind + ' likely ' + when; },
      dry: 'No rain expected in the next 12 hours',
      intensities: { rain: ['Light rain', 'Moderate rain', 'Heavy rain'], snow: ['Light snow', 'Moderate snow', 'Heavy snow'] },
      at: function (t) { return 'at ' + t; },
      towards: function (t) { return 'around ' + t; },
      tomorrowAt: function (t) { return 'tomorrow around ' + t; },
      dayAt: function (d, t) { return d + ' around ' + t; },
      alerts: {
        frost: function (v, w) { return 'Frost, down to ' + v + ' ' + w; },
        gust: function (v, w) { return 'Gusts of ' + v + ' km/h ' + w; },
        rain: function (v, w) { return 'Heavy rain, ' + v + ' mm/h ' + w; },
        rainDay: function (v) { return 'Heavy rain, ' + v + ' mm over 24 h'; },
        snow: function (v, w) { return 'Snow, ' + v + ' cm in 24 h, from ' + w; },
        storm: function (w) { return 'Thunderstorm possible ' + w; },
        heat: function (v, w) { return 'Heat, ' + v + ' ' + w; },
        uv: function (v, w) { return 'High UV (' + v + ') ' + w; },
        air: function (v, l) { return 'Air quality ' + l + ' (index ' + v + ')'; }
      },
      places: 'Places', settings: 'Settings', search: 'Search for a city', add: 'Add', remove: 'Remove',
      startHere: 'Start place', done: 'Done', noResult: 'No result', searching: 'Searching…',
      added: 'Added', alreadyThere: 'Already in the list', lastPlace: 'At least one place is needed',
      carousel: 'Cycle through places', off: 'Off', every: function (s) { return s < 60 ? s + ' s' : (s / 60) + ' min'; },
      veil: 'Dim at night', auto: 'Automatic', hours: 'Schedule', from: 'from', to: 'to', level: 'How dark the screen gets at night', lighter: 'Lighter', darker: 'Darker', dotSize: 'Map dot size (this device)', smaller: 'Smaller', bigger: 'Bigger',
      motion: 'Animations', reduced: 'Reduced', motionOff: 'Off',
      seconds: 'Seconds on the clock', yes: 'Yes', no: 'No', language: 'Language',
      about: 'About', source: 'Weather data: Open-Meteo.com (CC BY 4.0 licence)', diagnostic: 'Diagnostics',
      version: 'Version', clearLog: 'Clear log', demo: 'Demo', demoTime: 'Time of day', demoWeather: 'Weather',
      demoCycle: 'A day in 60 s', demoStop: 'Stop demo', reload: 'Reload', forceUpdate: 'Force update', latest: 'Online:', checking: 'Checking the online version…', upToDate: 'This is the latest version.', updateAvail: 'Version %1 available.', onlineUnknown: 'Online version unknown (offline).',
      veilHint: 'Touch the screen to brighten',
      badge: 'DEMO', close: 'Close', worldMap: 'World map', allPlaces: 'All places', comfort: 'Comfort', comfortBase: 'Base', comfortFeels: 'feels like', comfortNone: 'Nothing to spoil it', comfortCap: 'Capped', comfortShade: 'In the shade', comfortWhy: 'Why this score', comfortWhyParts: { thermique: 'Temperature', moiteur: 'Humidity', pluie: 'Rain, snow', ciel: 'Sky', vent: 'Wind', uv: 'UV', air: 'Air' }, comfortParts: { pluie: 'Rain or snow', vent: 'Wind', air: 'Air', ciel: 'Sky', moiteur: 'Mugginess', uv: 'UV' }, comfortLevels: { ideal: 'Ideal', pleasant: 'Pleasant', fair: 'Fair', poor: 'Poor', tough: 'Unpleasant', extreme: 'Extreme' }, comfortCaps: { hail: 'thunderstorm with hail', storm: 'thunderstorm', freezing: 'freezing rain', fog: 'fog', heat: 'very hot air', pluie: 'rain or snow', vent: 'wind', air: 'air quality', ciel: 'sky', moiteur: 'mugginess', uv: 'UV' },
      calibration: 'Comfort calibration', calibrationHint: 'The values behind the comfort score, tuned on a real situation or a sample case.',
      calib: { title: 'Comfort calibration',
        hint: 'Every slider recomputes the score at once. Formula values apply everywhere in the app as soon as you release the slider.',
        situation: 'Situation', srcPlace: 'Current place', edited: 'edited', time: 'Time', day: 'Day', night: 'Night', sun: 'In the sun', shade: 'In the shade',
        sit: { T: 'Air temperature', rh: 'Humidity', v: 'Average wind', g: 'Gusts', mm: 'Rain or snow', pop: 'Chance of rain (when dry)',
          nuages: 'Clouds', uv: 'UV index', aqi: 'European air quality index', type: 'Precipitation type', vis: 'Visibility' },
        types: { auto: 'Rain or drizzle', annonce: 'Rain forecast, almost none measured', violente: 'Violent shower', neige1: 'Light snow', neige2: 'Moderate snow',
          neige3: 'Heavy snow', verglas: 'Freezing rain', orage: 'Thunderstorm', grele: 'Thunderstorm with hail' },
        vis: ['Good', 'Haze (1 to 4 km)', 'Fog (under 1 km)', 'Dense fog (under 200 m)'],
        groups: { therm: 'Thermal comfort (base of the score)', weights: 'Weight of each nuisance: maximum deduction', force: 'Strength of each nuisance when severe',
          other: 'Forecast rain and shade', caps: 'Caps: maximum score in dangerous weather' },
        groupHints: { therm: 'The thermal score is 10 in the ideal range, then drops gradually. In the cold, humidity no longer warms the feel. Very hot air limits the score even when dry.',
          weights: 'A nuisance at its worst removes this percentage from the base. At 0 %, it no longer counts.',
          force: 'A severe nuisance also limits the score on its own: maximum score = 10 − strength × (10 − nuisance score). With 80 %, air scored 5 limits the score to 6. At 0 %, there is no such limit.',
          other: '', caps: 'At 10, the cap is off.' },
        k: { lo: 'Ideal range: from', hi: 'Ideal range: to', pc: 'Cold side: 1 point lost every', pc2: 'Deep cold (over 14 °C below the range): 1 point every',
          fh: 'Damp cold: deduction up to, in points', ph: 'Warm side: 1 point lost every', chSeuil: 'Very hot air: the score drops from',
          chPente: 'Very hot air: 1 point lost every', pluie: 'Rain and snow', vent: 'Wind', air: 'Air quality', ciel: 'Sky (clouds, fog)',
          moiteur: 'Mugginess', uv: 'UV', k_pluie: 'Rain and snow', k_vent: 'Wind', k_air: 'Air quality', k_ciel: 'Sky', k_moiteur: 'Mugginess', k_uv: 'UV',
          annonce: 'Rain forecast with no amount: rain score up to', uvOmbre: 'Share of UV received in the shade', c_orage: 'Thunderstorm', c_grele: 'Thunderstorm with hail',
          c_verglas: 'Freezing rain', c_brouillard: 'Dense fog (under 200 m)' },
        off: 'off', atMost: 'up to', dew: 'dew point', noGap: 'the sun changes nothing here', shadeWins: 'the shade adds', sunWins: 'the sun adds',
        oneNight: 'At night there is only one score.', capped: 'Computed: %1. Limit “%2”: score brought down to %3.', noCap: 'No limit applies.',
        reset: 'Back to the proposed values', cases: 'Sample cases', casesHint: 'Recomputed with the values above. Tap a row to try it at the top. At night there is only one score.',
        colCase: 'Situation', colDef: 'Proposed', changed: 'Changed from the proposed values:', unchanged: 'Proposed values, unchanged.',
        caseNames: ['24 °C, sunny, light wind', '35 °C at 20 % humidity, sunny', '35 °C at 80 % humidity', '28 °C at 85 % (Singapore), cloudy', '30 °C, dry and windy (Dubai)',
          '42 °C, very dry, hot wind (Ahvaz in summer)', '15 °C, overcast, drizzle (Dublin)', '5 °C, rain and wind', '−3 °C, clear sky, no wind (Anchorage)', '−28 °C, clear sky (Tiksi)',
          '22 °C, thunderstorm', '26 °C, full sun, UV 11 (Tahiti)', '24 °C, heavily polluted air (index 115)', 'Clear night at 18 °C', '12 °C, sunny, light wind (Paris in spring)',
          '0 °C, light snow, overcast', '2 °C, thick fog, calm', '18 °C, dry storm (wind 55, gusts 85)', '30 °C, heavy tropical shower (15 mm/h)', '24 °C, overcast, calm, dry',
          'Dublin at night: 9 °C, 87 %, drizzle forecast', '34 °C at 69 %, light wind, few clouds', '24 °C, sunny, poor air (index 70)', 'Pattaya at 2 pm: 32 °C at 56 %, sunny',
          'Niamey: 36 °C at 7 %, dry wind', 'Miami at night: 23 °C at 96 %', 'Paris in winter: 2 °C, overcast', 'Fine winter day: −5 °C, sunny, calm', '40 °C at 10 %, no wind',
          '30 °C at 50 %, full sun (UV 8)'] },
      backup: 'Backup', backupHint: 'Places, settings, map and labels, to keep them or copy them to another device.', exportData: 'Export', importData: 'Import', exportHint: 'Copy this text (or download it) and keep it.', importHint: 'Paste a backup, then tap Apply.', importApply: 'Apply', importBad: 'Unreadable backup', importConfirm: 'Replace the places and settings on this device with those from the backup?', download: 'Download', cityView: 'City', rotateForMap: 'Turn your phone sideways to see the map.', dotBlink: 'Blinking', dotHalo: 'Halo', dotTemp: 'Temperature colour', clocks: 'Clocks', weatherCards: 'Weather',
      mapStyles: { nature: 'Nature', satellite: 'Satellite', flat: 'Flat', atlas: 'Atlas', neon: 'Neon' }, viewMap: 'Map', viewGlobe: 'Globe',
      yesterday: 'Yesterday', sameTime: 'same time', mapCredit: 'Natural Earth · NASA Blue Marble and VIIRS imagery · day and night computed every minute', hourOpt: function (h) { return (h < 10 ? '0' : '') + h + ':00'; },
      diag: { version: 'Version', browser: 'Browser', screen: 'Screen', window: 'window', home: 'Home screen',
        anim: 'Animation', fps: 'fps', quality: 'quality', lastCall: 'Last request', network: 'Network',
        online: 'online', offline: 'offline', uptime: 'Running for', errors: 'Errors', motion: { auto: 'auto', reduced: 'reduced', off: 'off' } },
      demoTimes: { nuit: 'Night', aube: 'Dawn', lever: 'Sunrise', matin: 'Morning', midi: 'Noon', soir: 'Evening', coucher: 'Sunset', crepuscule: 'Dusk' },
      demoWeathers: { reel: 'Real', clair: 'Clear', voile: 'Hazy', nuageux: 'Cloudy', couvert: 'Overcast', brouillard: 'Fog', bruine: 'Drizzle', pluie: 'Rain', averse: 'Showers', orage: 'Storm', neige: 'Snow', grele: 'Hail' }
    }
  };

  var I = { lang: 'fr' };

  I.setLang = function (pref) {
    var sys = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    I.lang = pref === 'fr' || pref === 'en' ? pref : (sys.indexOf('fr') === 0 ? 'fr' : 'en');
    document.documentElement.lang = I.lang;
  };
  I.t = function () { return T[I.lang]; };

  /* Nom, région et pays d'un lieu dans la langue affichée (lieux d'origine), sinon tels qu'enregistrés. */
  I.place = function (p) {
    var n = p.names && p.names[I.lang];
    return n ? { name: n[0], region: n[1], country: n[2] } : { name: p.name, region: p.region || '', country: p.country || '' };
  };

  /* Nombres : virgule décimale en français, vrai signe moins. */
  I.num = function (v, dec) {
    if (!SM.U.has(v)) return '–';
    var s = (dec ? v.toFixed(dec) : String(Math.round(v)));
    if (/^-0(\.0+)?$/.test(s)) s = s.slice(1);
    if (I.lang === 'fr') s = s.replace('.', ',');
    return s.replace('-', '−');
  };
  I.temp = function (v) { return I.num(v) + '°'; };
  I.mm = function (v) {
    if (!SM.U.has(v)) return '–';
    return (v > 0 && v < 0.1 ? I.num(0.1, 1) : (v < 10 ? I.num(v, 1) : I.num(v))) + ' mm';
  };
  I.dir = function (deg) { return I.t().dirs[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16]; };

  /* Heure murale du lieu : Intl avec le fuseau, sinon décalage fixe. */
  var fmtCache = {};
  function formatter(tz) {
    if (fmtCache[tz] !== undefined) return fmtCache[tz];
    var f = null;
    try {
      f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', weekday: 'short' });
      if (!f.formatToParts) f = null;
    } catch (e) { f = null; }
    fmtCache[tz] = f;
    return f;
  }
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  /* Renvoie { y, mo (0-11), d, h, mi, s, wd, key } pour un instant Unix (s) dans un fuseau. */
  I.wall = function (unix, tz, offset) {
    var f = tz ? formatter(tz) : null;
    if (f) {
      var o = {};
      f.formatToParts(new Date(unix * 1000)).forEach(function (p) { o[p.type] = p.value; });
      var h = parseInt(o.hour, 10) % 24;
      var r = { y: +o.year, mo: +o.month - 1, d: +o.day, h: h, mi: +o.minute, s: +o.second, wd: WD[o.weekday] };
      r.key = r.y * 10000 + r.mo * 100 + r.d;
      return r;
    }
    var dt = new Date((unix + (offset || 0)) * 1000);
    var q = { y: dt.getUTCFullYear(), mo: dt.getUTCMonth(), d: dt.getUTCDate(), h: dt.getUTCHours(), mi: dt.getUTCMinutes(), s: dt.getUTCSeconds(), wd: dt.getUTCDay() };
    q.key = q.y * 10000 + q.mo * 100 + q.d;
    return q;
  };

  I.hm = function (w) { return SM.U.pad(w.h) + ':' + SM.U.pad(w.mi); };
  I.hOnly = function (w) { return I.lang === 'fr' ? w.h + ' h' : SM.U.pad(w.h) + ':00'; };
  I.longDate = function (w) {
    var t = I.t();
    return I.lang === 'fr'
      ? t.days[w.wd] + ' ' + w.d + ' ' + t.months[w.mo]
      : t.days[w.wd] + ' ' + w.d + ' ' + t.months[w.mo];
  };
  I.duration = function (sec) {
    var m = Math.round(sec / 60);
    return Math.floor(m / 60) + ' h ' + SM.U.pad(m % 60);
  };

  /* « à 18:00 », « demain vers 6 h », « jeudi vers 15 h » vu depuis maintenant. */
  I.when = function (unix, nowUnix, tz, offset) {
    var t = I.t();
    var w = I.wall(unix, tz, offset);
    var n = I.wall(nowUnix, tz, offset);
    var hh = I.hOnly(w);
    if (w.key === n.key) return t.towards(hh);
    var tomorrow = I.wall(nowUnix + 86400, tz, offset);
    if (w.key === tomorrow.key) return t.tomorrowAt(hh);
    return t.dayAt(t.days[w.wd], hh);
  };

  SM.i18n = I;
})();

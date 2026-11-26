/* Weather Hub · réglages fixes. Code limité à ES2017 (Safari 12). */
var SM = window.SM || {};
window.SM = SM;

/* Touchers : écouteurs passifs partout. Un écouteur tactile non passif oblige Safari à envoyer chaque toucher à la
   page puis à attendre sa réponse, jusqu'à une seconde, sans redessiner l'écran pendant ce temps (mesuré sur l'iPad :
   arrivées d'un lieu figées une seconde pile). Les seuls non passifs sont posés sur l'élément qui en a besoin, et
   seulement pendant qu'il sert : poignées de la feuille des lieux, blocs en mode édition, carte du monde. */

SM.VERSION = '1.41.1';

// D'ouest en est, comme sur une carte classique.
SM.DEFAULT_PLACES = [
  { id: 'anchorage', name: 'Anchorage', region: 'Alaska', country: 'United States', lat: 61.21806, lon: -149.90028, tz: 'America/Anchorage',
    names: { en: ['Anchorage', 'Alaska', 'United States'], fr: ['Anchorage', 'Alaska', 'États-Unis'] } },
  { id: 'tahiti', name: 'Tahiti', region: 'Îles du Vent', country: 'French Polynesia', lat: -17.5347, lon: -149.56844, tz: 'Pacific/Tahiti',
    names: { en: ['Tahiti', 'Windward Islands', 'French Polynesia'], fr: ['Tahiti', 'Îles du Vent', 'Polynésie française'] } },
  { id: 'bogota', name: 'Bogota', region: 'Bogota D.C.', country: 'Colombia', lat: 4.60971, lon: -74.08175, tz: 'America/Bogota',
    names: { en: ['Bogota', 'Bogota D.C.', 'Colombia'], fr: ['Bogota', 'Bogota D.C.', 'Colombie'] } },
  { id: 'newyork', name: 'New York', region: 'New York', country: 'United States', lat: 40.71427, lon: -74.00597, tz: 'America/New_York',
    names: { en: ['New York', 'New York', 'United States'], fr: ['New York', 'New York', 'États-Unis'] } },
  { id: 'lisbonne', name: 'Lisbon', region: 'Lisbon', country: 'Portugal', lat: 38.72509, lon: -9.1498, tz: 'Europe/Lisbon',
    names: { en: ['Lisbon', 'Lisbon', 'Portugal'], fr: ['Lisbonne', 'Lisbonne', 'Portugal'] } },
  { id: 'marrakech', name: 'Marrakesh', region: 'Marrakesh-Safi', country: 'Morocco', lat: 31.63416, lon: -7.99994, tz: 'Africa/Casablanca',
    names: { en: ['Marrakesh', 'Marrakesh-Safi', 'Morocco'], fr: ['Marrakech', 'Marrakech-Safi', 'Maroc'] } },
  { id: 'dublin', name: 'Dublin', region: 'Leinster', country: 'Ireland', lat: 53.33306, lon: -6.24889, tz: 'Europe/Dublin',
    names: { en: ['Dublin', 'Leinster', 'Ireland'], fr: ['Dublin', 'Leinster', 'Irlande'] } },
  { id: 'aigre', name: 'Aigre', region: 'Charente', country: 'France', lat: 45.89151, lon: 0.00824, tz: 'Europe/Paris',
    names: { en: ['Aigre', 'Charente', 'France'], fr: ['Aigre', 'Charente', 'France'] } },
  { id: 'barcelone', name: 'Barcelona', region: 'Catalonia', country: 'Spain', lat: 41.38879, lon: 2.15899, tz: 'Europe/Madrid',
    names: { en: ['Barcelona', 'Catalonia', 'Spain'], fr: ['Barcelone', 'Catalogne', 'Espagne'] } },
  { id: 'paris', name: 'Paris', region: 'Île-de-France', country: 'France', lat: 48.85341, lon: 2.3488, tz: 'Europe/Paris',
    names: { en: ['Paris', 'Île-de-France', 'France'], fr: ['Paris', 'Île-de-France', 'France'] } },
  { id: 'istanbul', name: 'Istanbul', region: 'Istanbul', country: 'Turkey', lat: 41.01384, lon: 28.94966, tz: 'Europe/Istanbul',
    names: { en: ['Istanbul', 'Istanbul', 'Turkey'], fr: ['Istanbul', 'Istanbul', 'Turquie'] } },
  { id: 'moscou', name: 'Moscow', region: 'Moscow', country: 'Russia', lat: 55.75204, lon: 37.61781, tz: 'Europe/Moscow',
    names: { en: ['Moscow', 'Moscow', 'Russia'], fr: ['Moscou', 'Moscou', 'Russie'] } },
  { id: 'ahvaz', name: 'Ahvaz', region: 'Khuzestan', country: 'Iran', lat: 31.31901, lon: 48.6842, tz: 'Asia/Tehran',
    names: { en: ['Ahvaz', 'Khuzestan', 'Iran'], fr: ['Ahvaz', 'Khouzestan', 'Iran'] } },
  { id: 'dubai', name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', lat: 25.07725, lon: 55.30927, tz: 'Asia/Dubai',
    names: { en: ['Dubai', 'Dubai', 'United Arab Emirates'], fr: ['Dubaï', 'Dubaï', 'Émirats arabes unis'] } },
  { id: 'pattaya', name: 'Pattaya', region: 'Chonburi', country: 'Thailand', lat: 12.93333, lon: 100.88333, tz: 'Asia/Bangkok',
    names: { en: ['Pattaya', 'Chonburi', 'Thailand'], fr: ['Pattaya', 'Chonburi', 'Thaïlande'] } },
  { id: 'singapour', name: 'Singapore', region: 'Singapore', country: 'Singapore', lat: 1.28967, lon: 103.85007, tz: 'Asia/Singapore',
    names: { en: ['Singapore', 'Singapore', 'Singapore'], fr: ['Singapour', 'Singapour', 'Singapour'] } },
  { id: 'tiksi', name: 'Tiksi', region: 'Sakha', country: 'Russia', lat: 71.69075, lon: 128.86523, tz: 'Asia/Yakutsk',
    names: { en: ['Tiksi', 'Sakha Republic', 'Russia'], fr: ['Tiksi', 'République de Sakha', 'Russie'] } },
  { id: 'vladivostok', name: 'Vladivostok', region: 'Primorsky Krai', country: 'Russia', lat: 43.10562, lon: 131.87354, tz: 'Asia/Vladivostok',
    names: { en: ['Vladivostok', 'Primorsky Krai', 'Russia'], fr: ['Vladivostok', 'Kraï du Primorie', 'Russie'] } },
  { id: 'tokyo', name: 'Tokyo', region: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.69171, tz: 'Asia/Tokyo',
    names: { en: ['Tokyo', 'Tokyo', 'Japan'], fr: ['Tokyo', 'Tokyo', 'Japon'] } },
  { id: 'sydney', name: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.86785, lon: 151.20732, tz: 'Australia/Sydney',
    names: { en: ['Sydney', 'New South Wales', 'Australia'], fr: ['Sydney', 'Nouvelle-Galles du Sud', 'Australie'] } }
];

SM.DEFAULT_SETTINGS = {
  hourView: 'cond',    // Heure par heure : 'cond' | 'precip' | 'wind'
  tiles: [],           // ordre des blocs des détails (vide = ordre d'origine)
  hiddenTiles: [],     // blocs retirés en mode édition
  carousel: 0,          // secondes entre deux lieux, 0 = arrêté
  comfort: {},          // indice de bien-être : valeurs de la formule réglées dans la calibration (les autres restent proposées)
  veil: 'hours',        // 'off' | 'auto' (nuit au lieu de démarrage) | 'hours'
  veilFrom: '23:00',
  veilTo: '07:00',
  veilLevel: 0.55,
  motion: 'auto',       // 'auto' | 'reduced' | 'off'
  seconds: false,
  lang: 'en'            // 'en' | 'fr' | 'auto' (langue de l'iPad)
};

// Open-Meteo ne renouvelle ses valeurs que tous les quarts d'heure : rafraîchir plus souvent ne ramène rien de neuf.
SM.REFRESH_MS = 15 * 60 * 1000;
SM.AIR_REFRESH_MS = 30 * 60 * 1000;
SM.STALE_BADGE_MS = 60 * 60 * 1000;
SM.STALE_DATA_MS = 3 * 60 * 60 * 1000;

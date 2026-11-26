/* Garde la coquille de l'app pour démarrer sans réseau. Les données météo ne passent jamais par ici. */
var VERSION = 'sm-1.36.1';
var SHELL = [
  './', 'index.html', 'css/app.css?v=1.36.1',
  'js/config.js?v=1.36.1', 'js/diag.js?v=1.36.1', 'js/compat.js?v=1.36.1', 'js/store.js?v=1.36.1', 'js/i18n.js?v=1.36.1',
  'js/api.js?v=1.36.1', 'js/astro.js?v=1.36.1', 'js/codes.js?v=1.36.1', 'js/comfort.js?v=1.36.1', 'js/icons.js?v=1.36.1', 'js/sky.js?v=1.36.1',
  'js/ui.js?v=1.36.1', 'js/places.js?v=1.36.1', 'js/settings.js?v=1.36.1', 'js/calib.js?v=1.36.1', 'js/world.js?v=1.36.1', 'js/borders.js?v=1.36.1', 'js/globe.js?v=1.36.1', 'js/map.js?v=1.36.1', 'js/edit.js?v=1.36.1', 'js/list.js?v=1.36.1', 'js/update.js?v=1.36.1', 'js/app.js?v=1.36.1',
  'socle/installation.css?v=1.36.1', 'socle/installation.js?v=1.36.1',
  'img/icon-180.png', 'img/earth-day.jpg', 'img/earth-night.jpg'
];

/* Les images sans numéro de version (Terre de jour et de nuit, 420 Ko) sont reprises de l'ancien cache
   au lieu d'être retéléchargées à chaque mise à jour. Une image modifiée doit donc changer de nom. */
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(SHELL.map(function (u) {
      if (u.indexOf('img/') !== 0) return c.add(u);
      return caches.match(u).then(function (hit) { return hit ? c.put(u, hit) : c.add(u); });
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION && k !== 'sm-diag'; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* Même origine seulement. Les fichiers portent leur version dans l'adresse (?v=) et le cache change de nom
   à chaque version : ce qui est en cache est donc toujours le bon, sans rien redemander au réseau. */
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin || url.search.indexOf('fresh=') >= 0) return;
  // La page elle-même : réseau d'abord, pour que chaque ouverture voie la dernière version ; cache si hors ligne.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(function (r) {
      if (r && r.ok) { var copy = r.clone(); caches.open(VERSION).then(function (c) { c.put('index.html', copy); }); }
      return r;
    }).catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.open(VERSION).then(function (c) {
    return c.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (r) {
        if (r && r.ok) c.put(e.request, r.clone());
        return r;
      });
    });
  }));
});

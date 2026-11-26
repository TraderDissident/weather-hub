/* Icônes dessinées à la main en SVG, cadre 64 × 64. Dégradés définis une seule fois dans la page. */
(function () {
  var DEFS =
    '<svg class="defs" width="0" height="0" aria-hidden="true"><defs>' +
    '<radialGradient id="g-sun" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#fff6b0"/><stop offset=".55" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff9f1c"/></radialGradient>' +
    '<linearGradient id="g-cloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd8e6"/></linearGradient>' +
    '<linearGradient id="g-cloud-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9c2d0"/><stop offset="1" stop-color="#6f7a8c"/></linearGradient>' +
    '<linearGradient id="g-moon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#d9d4bd"/></linearGradient>' +
    '<linearGradient id="g-bolt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0"/><stop offset="1" stop-color="#ffb000"/></linearGradient>' +
    '</defs></svg>';

  var CLOUD = 'M17 46a9 9 0 0 1-.5-18a13 13 0 0 1 25-4a10 10 0 0 1 9 22z';

  function sun(cx, cy, r, rays) {
    var s = '';
    if (rays) {
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4, r1 = r + 4, r2 = r + 9;
        s += '<line x1="' + (cx + Math.cos(a) * r1).toFixed(1) + '" y1="' + (cy + Math.sin(a) * r1).toFixed(1) +
          '" x2="' + (cx + Math.cos(a) * r2).toFixed(1) + '" y2="' + (cy + Math.sin(a) * r2).toFixed(1) +
          '" stroke="#ffc93c" stroke-width="3.2" stroke-linecap="round"/>';
      }
    }
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#g-sun)"/>';
  }
  function moon(cx, cy, r) {
    return '<path d="M' + (cx + r * 0.25) + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 1 0 ' + (cx + r) + ' ' + (cy + r * 0.3) +
      'A' + (r * 0.78) + ' ' + (r * 0.78) + ' 0 0 1 ' + (cx + r * 0.25) + ' ' + (cy - r) + 'z" fill="url(#g-moon)"/>';
  }
  function cloud(dark, tx, ty, sc) {
    return '<path transform="translate(' + (tx || 0) + ' ' + (ty || 0) + ') scale(' + (sc || 1) + ')" d="' + CLOUD +
      '" fill="url(#' + (dark ? 'g-cloud-dark' : 'g-cloud') + ')"/>';
  }
  function drops(n, len, color) {
    var s = '', xs = n === 2 ? [26, 38] : (n === 3 ? [22, 32, 42] : [19, 27, 35, 43]);
    xs.forEach(function (x, i) {
      var y = 50 + (i % 2) * 3;
      s += '<line x1="' + x + '" y1="' + y + '" x2="' + (x - 3) + '" y2="' + (y + len) + '" stroke="' + (color || '#6cc4ff') + '" stroke-width="3" stroke-linecap="round"/>';
    });
    return s;
  }
  function flakes(n) {
    var s = '', xs = n === 2 ? [25, 39] : [20, 32, 44];
    xs.forEach(function (x, i) {
      var y = 54 + (i % 2) * 4;
      s += '<g stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"><line x1="' + (x - 3.5) + '" y1="' + y + '" x2="' + (x + 3.5) + '" y2="' + y + '"/>' +
        '<line x1="' + (x - 1.8) + '" y1="' + (y - 3) + '" x2="' + (x + 1.8) + '" y2="' + (y + 3) + '"/><line x1="' + (x + 1.8) + '" y1="' + (y - 3) + '" x2="' + (x - 1.8) + '" y2="' + (y + 3) + '"/></g>';
    });
    return s;
  }
  function bolt() { return '<path d="M34 44l-8 12h7l-4 9 11-14h-7l5-7z" fill="url(#g-bolt)"/>'; }
  function hail() { return '<circle cx="22" cy="58" r="2.6" fill="#e8f4ff"/><circle cx="44" cy="56" r="2.6" fill="#e8f4ff"/>'; }
  function fogLines() {
    return '<g stroke="#e3e8f0" stroke-width="3.2" stroke-linecap="round" opacity=".9"><line x1="12" y1="50" x2="52" y2="50"/><line x1="18" y1="57" x2="48" y2="57"/></g>';
  }
  function skyBehind(isDay) { return isDay ? sun(24, 22, 10, true) : moon(25, 21, 10); }

  var W = {
    'clear-day': function () { return sun(32, 32, 14, true); },
    'clear-night': function () { return moon(32, 32, 16); },
    'few-day': function () { return sun(28, 26, 13, true) + cloud(false, 18, 12, 0.7); },
    'few-night': function () { return moon(28, 26, 14) + cloud(false, 18, 12, 0.7); },
    'partly-day': function () { return skyBehind(true) + cloud(false, 4, 6, 0.95); },
    'partly-night': function () { return skyBehind(false) + cloud(false, 4, 6, 0.95); },
    'overcast': function () { return cloud(true, -4, -4, 0.85) + cloud(false, 4, 6, 0.95); },
    'fog': function () { return cloud(false, 2, -8, 0.95) + fogLines(); },
    'drizzle': function () { return cloud(false, 0, -6, 1) + drops(3, 5); },
    'rain': function () { return cloud(false, 0, -6, 1) + drops(3, 9); },
    'heavyrain': function () { return cloud(true, 0, -6, 1) + drops(4, 11); },
    'sleet': function () { return cloud(false, 0, -6, 1) + drops(2, 7) + '<circle cx="32" cy="58" r="2.4" fill="#fff"/>'; },
    'showers-day': function () { return skyBehind(true) + cloud(false, 4, 0, 0.92) + drops(2, 8); },
    'showers-night': function () { return skyBehind(false) + cloud(false, 4, 0, 0.92) + drops(2, 8); },
    'snow': function () { return cloud(false, 0, -6, 1) + flakes(3); },
    'heavysnow': function () { return cloud(true, 0, -6, 1) + flakes(3); },
    'snowshowers-day': function () { return skyBehind(true) + cloud(false, 4, 0, 0.92) + flakes(2); },
    'snowshowers-night': function () { return skyBehind(false) + cloud(false, 4, 0, 0.92) + flakes(2); },
    'storm': function () { return cloud(true, 0, -8, 1) + bolt(); },
    'hail': function () { return cloud(true, 0, -8, 1) + bolt() + hail(); }
  };

  /* Pictogrammes d'interface, trait simple en currentColor, cadre 24 × 24. */
  var P = {
    pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    drop: '<path d="M12 3.5s6 6.6 6 10.7a6 6 0 0 1-12 0C6 10.1 12 3.5 12 3.5z"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8"/>',
    gauge: '<path d="M4.5 17a8 8 0 1 1 15 0"/><path d="M12 13l4-4"/>',
    eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    sunny: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.4-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.5 18z"/>',
    thermo: '<path d="M10 14.8V5a2 2 0 1 1 4 0v9.8a4 4 0 1 1-4 0z"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7"/>',
    flower: '<circle cx="12" cy="9" r="2.2"/><path d="M12 6.8a2.6 2.6 0 1 1 2.6-2.4M14.2 9.6a2.6 2.6 0 1 1 .8 3.4M9.8 9.6a2.6 2.6 0 1 0-.8 3.4M12 11v10M12 17c-2-2-4-2-5-1"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    sunrise: '<path d="M2 16.5h20M7 16.5a5 5 0 0 1 10 0M12 7.5v2M5.6 10.1l1.4 1.4M18.4 10.1L17 11.5M9.5 22L12 19.5l2.5 2.5"/>',
    sunset: '<path d="M2 16.5h20M7 16.5a5 5 0 0 1 10 0M12 7.5v2M5.6 10.1l1.4 1.4M18.4 10.1L17 11.5M9.5 19.5L12 22l2.5-2.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
    // Même dessin que expand, pointes retournées vers le centre (mêmes traits, même taille).
    shrink: '<path d="M13 5v6h6M11 19v-6H5M20 4l-7 7M4 20l7-7"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
    pause: '<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="3"/>',
    // Vue d'un lieu : une carte, en paysage ou en portrait comme l'écran (app.css).
    card: '<rect class="icl" x="3" y="6" width="18" height="12" rx="2.2"/><rect class="icp" x="6" y="3" width="12" height="18" rx="2.2"/>',
    grip: '<path d="M5 8h14M5 12h14M5 16h14"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.2a4.2 4.2 0 0 0 7 0"/><path d="M9 9.8h.01M15 9.8h.01" stroke-width="2.4"/>',
    // Mosaïque : quatre tuiles (l'ancienne icône, trois lignes à puces, se lisait « liste »).
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11" stroke-width="2"/><circle cx="4.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/>',
    arrowUp: '<path d="M12 20V5M6 10.5L12 4.5l6 6" stroke-width="2.2"/>',
    arrowDown: '<path d="M12 4v15M6 13.5l6 6 6-6" stroke-width="2.2"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    up: '<path d="M6 15l6-6 6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
    warn: '<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    arrow: '<path d="M12 3l4.5 9.5L12 10.5l-4.5 2z" fill="currentColor"/><path d="M12 10.5V21"/>',
    offline: '<path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 4.2-2.6M14.8 10.4A10 10 0 0 1 19 13M2 9.5a15 15 0 0 1 4.3-2.8M11 5.6A15 15 0 0 1 22 9.5"/><circle cx="12" cy="20" r=".8" fill="currentColor"/>'
  };

  SM.icons = {
    defs: DEFS,
    weather: function (key, cls) {
      var f = W[key] || W.overcast;
      return '<svg class="wx ' + (cls || '') + '" viewBox="0 0 64 64" aria-hidden="true">' + f() + '</svg>';
    },
    ui: function (key, cls) {
      return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[key] || '') + '</svg>';
    },
    /* Lune à sa vraie phase, partie éclairée du bon côté. */
    moonPhase: function (ph, southern, size, inSky) {
      var r = 20, cx = 24, cy = 24;
      var k = Math.cos(2 * Math.PI * ph.phase);
      var rx = Math.abs(k) * r;
      var gibbous = ph.fraction > 0.5;
      var d = 'M' + cx + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) +
        'A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + (gibbous ? 1 : 0) + ' ' + cx + ' ' + (cy - r) + 'z';
      var flip = (!ph.waxing) !== (!!southern);
      return '<svg class="moonph" viewBox="0 0 48 48" width="' + (size || 48) + '" height="' + (size || 48) + '" aria-hidden="true">' +
        (inSky ? '<circle cx="24" cy="24" r="20" fill="rgba(160,175,210,.07)"/>' : '<circle cx="24" cy="24" r="20" fill="#2a3045" stroke="rgba(255,255,255,.25)" stroke-width=".8"/>') +
        '<path d="' + d + '" fill="url(#g-moon)"' + (flip ? ' transform="translate(48 0) scale(-1 1)"' : '') + '/></svg>';
    }
  };
})();

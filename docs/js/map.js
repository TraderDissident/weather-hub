/* Carte du monde : jour, nuit et crépuscule à la minute, soleil et lune à leur aplomb, fuseaux horaires,
   villes avec leur météo et leur heure, horloges ou cartes météo en dessous. */
(function () {
  var U = SM.U, I = SM.i18n, IC = SM.icons, CO = SM.codes;
  var PI = Math.PI, RAD = PI / 180;

  /* ---------- projection de Miller, de 75° N à 58° S, coupée au détroit de Béring (169° O) ---------- */
  /* Coupée avant à 172,5° O, une bordure de fuseau : un bout de la Tchoukotka (Russie) restait au bord gauche (Matt,
     26/11). La règle des heures suit la coupure (rulerHTML). */
  var LON0 = -169, LAT_N = 75, LAT_S = -58;
  function miller(lat) { return 1.25 * Math.log(Math.tan(PI / 4 + 0.4 * lat * RAD)); }
  var MT = miller(LAT_N), MB = miller(LAT_S);
  var ASPECT = (MT - MB) / (2 * PI), ASPECT0 = ASPECT;
  /* Plein écran : la carte garde sa largeur et montre plus de nord avec la hauteur libre (jusqu'à 84° N, au-delà
     il n'y a plus de terres). Le sud ne bouge pas. Hors plein écran : 75° N comme avant. */
  var NORTH_MAX = 84;
  function setNorth(lat, south) {
    LAT_N = lat; LAT_S = south === undefined ? -58 : south;
    MT = miller(LAT_N); MB = miller(LAT_S); ASPECT = (MT - MB) / (2 * PI);
  }
  /* Paysage, hors plein écran : la carte prend la largeur de la rangée de boutons ; si la hauteur manque, le sud est
     rogné (jusqu'à 45° S, sous l'Australie et Tahiti), le nord reste à 75°. null si cela ne suffit pas. */
  var SOUTH_MIN = -45;
  // Bornes de latitude pour un rapport hauteur / largeur voulu (voir M.resize, paysage).
  function fitLat(ratio) {
    var span = ratio * 2 * PI, n = miller(75), sm = miller(-58), base = n - sm, extra = span - base;
    var inv = function (m) { return (2.5 * Math.atan(Math.exp(0.8 * m)) - 0.625 * PI) / RAD; };
    if (extra >= 0) {
      var n2 = Math.min(n + extra, miller(NORTH_MAX)), s2 = Math.max(sm - (extra - (n2 - n)), miller(-72));
      return [inv(n2), inv(s2)];
    }
    var s3 = Math.min(sm - extra, miller(SOUTH_MIN)), left = span - (n - s3), n3 = Math.max(n + Math.min(0, left), miller(73));
    return [inv(n3), inv(s3)];
  }
  function southFor(ratio) {
    var mb = miller(75) - ratio * 2 * PI;
    if (mb <= miller(-58)) return -58;
    if (mb > miller(SOUTH_MIN)) return null;
    return (2.5 * Math.atan(Math.exp(0.8 * mb)) - 0.625 * PI) / RAD;
  }
  function northFor(ratio) {
    var mt = Math.min(MB + ratio * 2 * PI, miller(NORTH_MAX));
    if (mt <= miller(75)) return 75;
    return (2.5 * Math.atan(Math.exp(0.8 * mt)) - 0.625 * PI) / RAD;
  }
  // Hauteur de référence des étiquettes placées à la main : celle de la carte à 75° N, pour qu'elles restent à la
  // même distance de leur point quand le plein écran agrandit la carte vers le nord.
  function labH() { return st.w * ASPECT0; }
  function fx(lon) { return (((lon - LON0) % 360) + 360) % 360 / 360; }
  var EQ = false; // vrai pendant le dessin des textures du globe (projection équirectangulaire, Terre entière)
  function fy(lat) { return EQ ? (90 - lat) / 180 : (MT - miller(U.clamp(lat, -85, 85))) / (MT - MB); }
  function latAt(f) { var m = MT - f * (MT - MB); return (2.5 * Math.atan(Math.exp(0.8 * m)) - 0.625 * PI) / RAD; }

  /* ---------- tracé des terres, décodé une fois ---------- */
  /* ---------- tracés : terres (anneaux fermés) et frontières (lignes), décodés une fois ---------- */
  function decodeList(list) {
    return (list || []).map(function (r) {
      var out = new Float32Array(r.length), x = 0, y = 0, prev = null, shift = 0, lo = 1e9, hi = -1e9;
      for (var i = 0; i < r.length; i += 2) {
        x += r[i]; y += r[i + 1];
        // Déroule les longitudes : un tracé qui franchit la ligne de changement de date reste continu.
        var lon = x / 20 + shift;
        if (prev !== null && lon - prev > 180) { shift -= 360; lon -= 360; }
        else if (prev !== null && lon - prev < -180) { shift += 360; lon += 360; }
        prev = lon;
        out[i] = lon; out[i + 1] = y / 20;
        if (lon < lo) lo = lon; if (lon > hi) hi = lon;
      }
      out.lo = lo; out.hi = hi;
      return out;
    });
  }
  var rings = null, borders = null;

  var st = {
    root: null, box: null, cv: null, ctx: null, day: null, night: null, tmp: null, mask: null, tw: null,
    w: 0, h: 0, pr: 1, minuteKey: '', cards: 'clocks', style: 'nature', places: [], hands: []
  };

  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  // Safari ne rend la mémoire d'un canevas qu'au passage du ramasse-miettes ; le ramener à 0 × 0 la libère tout de suite.
  function free(c) { if (c && c.getContext && c.width) { c.width = 0; c.height = 0; } }
  /* Fonds de jour et de nuit gardés d'une ouverture à l'autre. Mesuré sur l'iPad : les redessiner (images satellite
     reprojetées ligne par ligne, ou tracé des terres et des frontières) prenait 4,6 à 4,8 s à CHAQUE ouverture de la
     carte. Ils ne dépendent que du style, de la taille et de la projection : on ne les refait que si l'un change.
     Coût : deux canevas de la taille de la carte gardés en mémoire (environ 4 Mo chacun sur l'iPad). */
  /* Deux entrées : à chaque ouverture, la carte est d'abord dimensionnée avant que ses réglages ne montent dans
     l'en-tête, puis redimensionnée à sa vraie taille ; avec une seule entrée, chacune chassait l'autre. */
  var layerCache = [];
  function freeLayers() {
    free(st.tmp); free(st.mask); free(st.tw);
    st.day = st.night = st.tmp = st.mask = st.tw = null;
  }

  /* Dessine chaque tracé à chaque copie de la carte (−360°, 0, +360°) qui touche le cadre. */
  function trace(g, list, w, h, pr, closed) {
    var sx = w * pr / 360, sy = h * pr;
    g.beginPath();
    for (var k = 0; k < list.length; k++) {
      var r = list[k];
      for (var c = -1; c <= 1; c++) {
        var off = c * 360 - LON0;
        if (r.hi + off < 0 || r.lo + off > 360) continue;
        for (var i = 0; i < r.length; i += 2) {
          var X = (r[i] + off) * sx, Y = fy(r[i + 1]) * sy;
          if (i === 0) g.moveTo(X, Y); else g.lineTo(X, Y);
        }
        if (closed) g.closePath();
      }
    }
  }
  function traceLand(g, w, h, pr) { if (!rings) rings = decodeList(SM.WORLD); trace(g, rings, w, h, pr, true); }
  function traceBorders(g, w, h, pr) { if (!borders) borders = decodeList(SM.BORDERS); trace(g, borders, w, h, pr, false); }

  /* ---------- images NASA (domaine public), rangées dans l'app : Blue Marble le jour, lumières des villes la nuit ---------- */
  var EARTH = { day: null, night: null, ready: false, waiting: [] };
  function loadEarth(cb) {
    if (EARTH.ready) { cb(); return; }
    EARTH.waiting.push(cb);
    if (EARTH.day) return;
    var n = 0;
    function done() {
      if (++n < 2) return;
      EARTH.ready = true;
      var w = EARTH.waiting; EARTH.waiting = [];
      w.forEach(function (f) { f(); });
    }
    EARTH.day = new Image(); EARTH.night = new Image();
    EARTH.day.onload = EARTH.night.onload = done;
    EARTH.day.onerror = EARTH.night.onerror = function () { SM.diag.warn('images satellite introuvables'); };
    EARTH.day.src = 'img/earth-day.jpg'; EARTH.night.src = 'img/earth-night.jpg';
  }

  /* Reprojette une image équirectangulaire (Terre entière, 180° O à gauche) ligne par ligne. */
  function drawEquirect(g, img, cw, ch, y0, y1) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var x0 = (LON0 + 180) / 360 * iw, d1 = (iw - x0) / iw * cw;
    for (var y = y0 || 0, end = y1 === undefined ? ch : Math.min(y1, ch); y < end; y++) {
      var lat = EQ ? 90 - (y + 0.5) / ch * 180 : latAt((y + 0.5) / ch);
      var sy = U.clamp((90 - lat) / 180 * ih, 0, ih - 1);
      g.drawImage(img, x0, sy, iw - x0, 1, 0, y, d1, 1);
      if (x0 > 0) g.drawImage(img, 0, sy, x0, 1, d1, y, cw - d1, 1);
    }
  }

  /* ---------- les styles ---------- */
  function stops(g, ch, list) {
    var gr = g.createLinearGradient(0, 0, 0, ch);
    list.forEach(function (s) { gr.addColorStop(U.clamp(fy(s[0]), 0, 1), s[1]); });
    return gr;
  }

  var STYLES = {
    nature: {
      oceanDay: [[75, '#0b2a4c'], [30, '#15507f'], [0, '#1d6aa3'], [-30, '#15507f'], [-58, '#0b2a4c']],
      landDay: [[75, '#e4ecf1'], [68, '#b3c2bd'], [60, '#4f6e52'], [50, '#5f8456'], [42, '#7c9257'], [33, '#b8a26f'],
        [24, '#c2a873'], [15, '#93995e'], [6, '#3d7046'], [-6, '#3b6c45'], [-16, '#8d985c'], [-26, '#b9a06b'],
        [-36, '#6f8d58'], [-48, '#6b8a6c'], [-58, '#d5e0e6']],
      coastDay: 'rgba(255,255,255,0.28)', bordersDay: 'rgba(255,255,255,0.16)',
      oceanNight: [[75, '#02060f'], [0, '#061329'], [-58, '#02060f']],
      landNight: [[75, '#1a2840'], [0, '#0f1b30'], [-58, '#1a2840']],
      coastNight: 'rgba(130,170,235,0.32)', bordersNight: 'rgba(130,170,235,0.14)',
      stars: true, soft: true, twilight: [255, 140, 80, 92], glint: 0.30, atm: [0.35, 0.6, 1], grid: 'rgba(255,255,255,0.08)', grid2: 'rgba(255,255,255,0.12)', bg: '#04091a'
    },
    satellite: {
      imagery: true, stars: false, soft: true, twilight: [255, 150, 90, 70], glint: 0.14,
      grid: 'rgba(255,255,255,0.06)', grid2: null, bg: '#000000', atm: [0.38, 0.62, 1]
    },
    flat: {
      oceanDay: [[75, '#060607'], [-58, '#060607']],
      landDay: [[75, '#5c5c61'], [-58, '#5c5c61']],
      coastDay: null, bordersDay: null,
      oceanNight: [[75, '#000000'], [-58, '#000000']],
      landNight: [[75, '#2d2d31'], [-58, '#2d2d31']],
      coastNight: null, bordersNight: null,
      stars: false, soft: false, twilight: null, glint: 0, terminator: 'rgba(255,255,255,0.75)', atm: [0.55, 0.55, 0.6],
      grid: 'rgba(255,255,255,0.07)', grid2: null, bg: '#000000'
    },
    atlas: {
      oceanDay: [[75, '#c3d7e1'], [0, '#a2c6d9'], [-58, '#c3d7e1']],
      landDay: [[75, '#f8f5ef'], [55, '#ece2c6'], [30, '#f1dfb6'], [0, '#e2ddb6'], [-30, '#efdbb3'], [-58, '#f8f5ef']],
      coastDay: 'rgba(110,92,62,0.75)', bordersDay: 'rgba(130,100,70,0.42)',
      oceanNight: [[75, '#2d3d54'], [0, '#34465f'], [-58, '#2d3d54']],
      landNight: [[75, '#56617a'], [0, '#4b566e'], [-58, '#56617a']],
      coastNight: 'rgba(205,215,240,0.45)', bordersNight: 'rgba(205,215,240,0.22)',
      stars: false, soft: true, twilight: [255, 170, 110, 70], glint: 0.12, atm: [0.62, 0.78, 0.95], grid: 'rgba(90,80,60,0.18)', grid2: 'rgba(90,80,60,0.25)', bg: '#c3d7e1'
    },
    neon: {
      oceanDay: [[75, '#03040c'], [0, '#050816'], [-58, '#03040c']],
      landDay: [[75, '#0b1226'], [0, '#0a1124'], [-58, '#0b1226']],
      coastDay: '#3fe0ff', coastGlow: 'rgba(63,224,255,0.9)', bordersDay: 'rgba(63,224,255,0.22)',
      oceanNight: [[75, '#020208'], [0, '#03030c'], [-58, '#020208']],
      landNight: [[75, '#07081a'], [0, '#060716'], [-58, '#07081a']],
      coastNight: 'rgba(160,110,255,0.75)', coastNightGlow: 'rgba(140,90,255,0.8)', bordersNight: 'rgba(160,110,255,0.16)',
      stars: true, soft: true, twilight: [200, 90, 255, 85], glint: 0.10, atm: [0.25, 0.85, 1], grid: 'rgba(63,224,255,0.08)', grid2: 'rgba(63,224,255,0.14)', bg: '#03040c'
    }
  };
  var STYLE_ORDER = ['nature', 'satellite', 'flat', 'atlas', 'neon'];

  function paintLayer(g, S, night, cw, ch, noStars) {
    paintSteps(g, S, night, cw, ch, noStars).forEach(function (f) { f(); });
  }
  /* Le dessin d'un fond en étapes courtes : bandes de 48 lignes pour les images satellite ; mer, terres, côtes et
     frontières pour les autres styles. Permet de le préparer au repos sans jamais bloquer la page d'un coup. */
  function paintSteps(g, S, night, cw, ch, noStars) {
    var w = st.w, h = st.h, pr = st.pr, out = [];
    if (S.imagery) {
      if (EARTH.ready) {
        for (var y = 0; y < ch; y += 48) (function (a) {
          out.push(function () { g.imageSmoothingEnabled = true; drawEquirect(g, night ? EARTH.night : EARTH.day, cw, ch, a, a + 48); });
        })(y);
      } else out.push(function () { g.fillStyle = night ? '#02040c' : '#0b2a4c'; g.fillRect(0, 0, cw, ch); });
      return out;
    }
    out.push(function () {
      g.fillStyle = stops(g, ch, night ? S.oceanNight : S.oceanDay);
      g.fillRect(0, 0, cw, ch);
      if (night && S.stars && !noStars) {
        var rnd = U.seeded('carte-etoiles');
        for (var i = 0; i < 420; i++) {
          g.fillStyle = 'rgba(220,230,255,' + (0.15 + rnd() * 0.6).toFixed(2) + ')';
          g.beginPath(); g.arc(rnd() * cw, rnd() * ch, (0.3 + rnd() * 0.8) * pr, 0, 6.283); g.fill();
        }
      }
    });
    out.push(function () {
      traceLand(g, w, h, pr);
      g.fillStyle = stops(g, ch, night ? S.landNight : S.landDay);
      g.fill();
    });
    var coast = night ? S.coastNight : S.coastDay, glow = night ? S.coastNightGlow : S.coastGlow;
    if (coast) out.push(function () {
      traceLand(g, w, h, pr);
      if (glow) { g.shadowColor = glow; g.shadowBlur = 7 * pr; }
      g.lineWidth = (glow ? 1.1 : 0.8) * pr; g.strokeStyle = coast; g.stroke();
      g.shadowBlur = 0;
    });
    var bc = night ? S.bordersNight : S.bordersDay;
    if (bc && SM.BORDERS) out.push(function () {
      traceBorders(g, w, h, pr);
      g.lineWidth = 0.6 * pr; g.strokeStyle = bc; g.stroke();
    });
    return out;
  }

  /* Textures du globe : la Terre entière en équirectangulaire 2048 × 1024, au style choisi. */
  function globeTexture(S, night) {
    if (S.imagery) return night ? EARTH.night : EARTH.day;
    var keep = [st.w, st.h, st.pr, LON0];
    st.w = 2048; st.h = 1024; st.pr = 1; LON0 = -180; EQ = true;
    var c = canvas(2048, 1024);
    try { paintLayer(c.getContext('2d'), S, night, 2048, 1024, true); }
    finally { st.w = keep[0]; st.h = keep[1]; st.pr = keep[2]; LON0 = keep[3]; EQ = false; }
    return c;
  }

  function globeParams(S) {
    var tw = S.twilight;
    return {
      soft: S.soft ? 1 : 0,
      tw: tw ? [tw[0] / 255, tw[1] / 255, tw[2] / 255, tw[3] / 255] : [0, 0, 0, 0],
      term: S.terminator ? [1, 1, 1, 0.75] : [1, 1, 1, 0],
      atm: S.atm || [0.35, 0.6, 1]
    };
  }

  function buildLayers() {
    var S = STYLES[st.style] || STYLES.nature;
    if (S.imagery && !EARTH.ready) {
      var styleAsked = st.style;
      loadEarth(function () { if (st.root && st.style === styleAsked) { buildLayers(); M.tick(true); } });
    }
    if (st.view === 'globe' && SM.globe.active()) {
      if (st.box) st.box.style.background = '#000';
      if (!S.imagery || EARTH.ready) {
        // Deux textures de 8 Mo chacune : envoyées à la carte graphique, puis rendues aussitôt.
        var gd = globeTexture(S, false), gn = globeTexture(S, true);
        SM.globe.setTextures(gd, gn);
        free(gd); free(gn);
      }
      SM.globe.setStyle(globeParams(S));
      drawSpace();
      freeLayers();
      st.mask = true;
      st.minuteKey = '';
      return;
    }
    var cw = Math.round(st.w * st.pr), ch = Math.round(st.h * st.pr);
    freeLayers();
    var t0 = Date.now(), key = [st.style, cw, ch, LAT_N, LAT_S, LON0, S.imagery ? EARTH.ready : 0].join('|');
    var hit = layerCache.filter(function (e) { return e.key === key; })[0];
    if (!hit) {
      hit = { key: key, day: canvas(cw, ch), night: canvas(cw, ch) };
      paintLayer(hit.day.getContext('2d'), S, false, cw, ch);
      paintLayer(hit.night.getContext('2d'), S, true, cw, ch);
      layerCache.unshift(hit);
      while (layerCache.length > 2) { var old = layerCache.pop(); free(old.day); free(old.night); }
      M.lastBuild = (Date.now() - t0) + ' ms painted';
    } else M.lastBuild = 'reused';
    // Taille de la carte retenue par orientation (et plein écran) : la préparation au repos la réutilise.
    try { localStorage.setItem('sm.mapSize.' + orient() + (LAT_N !== 75 ? '.full' : ''), JSON.stringify({ w: st.w, h: st.h, pr: st.pr, lat: LAT_N, south: LAT_S })); } catch (e) { /* rien */ }
    st.day = hit.day; st.night = hit.night; st.tmp = canvas(cw, ch);
    if (st.box) st.box.style.background = S.bg;
    // Masque jour/nuit et bande de crépuscule, calculés sur une grille fine puis lissés à l'agrandissement.
    var mw = 240, mh = Math.round(240 * ASPECT);
    st.mask = canvas(mw, mh); st.tw = canvas(mw, mh);
    st.lats = []; for (var y = 0; y < mh; y++) st.lats.push(latAt((y + 0.5) / mh) * RAD);
    st.minuteKey = '';
  }

  function drawSpace() {
    var c = st.ctx, cw = st.cv.width, ch = st.cv.height, pr = st.pr;
    var bg = c.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.max(cw, ch) * 0.7);
    bg.addColorStop(0, '#0a1430'); bg.addColorStop(0.6, '#03060f'); bg.addColorStop(1, '#000000');
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = bg; c.fillRect(0, 0, cw, ch);
    var rnd = U.seeded('espace');
    for (var i = 0; i < 380; i++) {
      c.fillStyle = 'rgba(225,232,255,' + (0.12 + rnd() * 0.7).toFixed(2) + ')';
      c.beginPath(); c.arc(rnd() * cw, rnd() * ch, (0.25 + rnd() * rnd() * 1.4) * pr, 0, 6.283); c.fill();
    }
  }

  function drawGlobeSky(ms) {
    var sun = SM.astro.subSolar(ms);
    SM.globe.setSun(sun.lat, sun.lon);
    SM.globe.draw();
  }

  function drawSky(ms) {
    if (st.view === 'globe' && SM.globe.active()) { drawGlobeSky(ms); return; }
    if (!st.ctx || !st.day || !st.mask) return;
    var S = STYLES[st.style] || STYLES.nature;
    var w = st.w, h = st.h, pr = st.pr, cw = st.cv.width, ch = st.cv.height;
    var sun = SM.astro.subSolar(ms), dec = sun.lat * RAD;
    var mw = st.mask.width, mh = st.mask.height;
    var mg = st.mask.getContext('2d'), tg = st.tw.getContext('2d');
    var md = mg.createImageData(mw, mh), td = tg.createImageData(mw, mh);
    var sd = Math.sin(dec), cd = Math.cos(dec), twc = S.twilight;
    for (var y = 0; y < mh; y++) {
      var la = st.lats[y], sl = Math.sin(la), cl = Math.cos(la);
      for (var x = 0; x < mw; x++) {
        var lon = LON0 + (x + 0.5) / mw * 360;
        var alt = Math.asin(sl * sd + cl * cd * Math.cos((lon - sun.lon) * RAD)) / RAD;
        // Limite douce (crépuscule progressif) ou franche (style épuré).
        var day = S.soft ? U.clamp((alt + 6) / 9, 0, 1) : U.clamp((alt + 1.2) / 2.4, 0, 1);
        var o = (y * mw + x) * 4;
        md.data[o] = md.data[o + 1] = md.data[o + 2] = 255; md.data[o + 3] = Math.round(day * day * (3 - 2 * day) * 255);
        if (twc) {
          var tw = Math.max(0, 1 - Math.abs(alt + 2) / 6.5);
          td.data[o] = twc[0]; td.data[o + 1] = Math.round(twc[1] + 50 * day); td.data[o + 2] = Math.round(twc[2] + 50 * day);
          td.data[o + 3] = Math.round(tw * tw * twc[3]);
        }
      }
    }
    mg.putImageData(md, 0, 0); tg.putImageData(td, 0, 0);
    var c = st.ctx;
    c.imageSmoothingEnabled = true;
    c.globalCompositeOperation = 'source-over';
    c.drawImage(st.night, 0, 0);
    var t = st.tmp.getContext('2d');
    t.globalCompositeOperation = 'source-over';
    t.clearRect(0, 0, cw, ch);
    t.drawImage(st.day, 0, 0);
    t.globalCompositeOperation = 'destination-in';
    t.imageSmoothingEnabled = true;
    t.drawImage(st.mask, 0, 0, cw, ch);
    t.globalCompositeOperation = 'source-over';
    c.drawImage(st.tmp, 0, 0);
    if (twc) c.drawImage(st.tw, 0, 0, cw, ch);
    // Reflet du soleil sur l'océan, répété de part et d'autre de la couture.
    var sx = fx(sun.lon) * cw, sy = fy(sun.lat) * ch, R = cw * 0.2;
    if (S.glint) {
      [sx - cw, sx, sx + cw].forEach(function (x) {
        var gl = c.createRadialGradient(x, sy, 0, x, sy, R);
        gl.addColorStop(0, 'rgba(255,248,220,' + S.glint + ')'); gl.addColorStop(0.4, 'rgba(255,240,200,' + (S.glint / 3).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,240,200,0)');
        c.fillStyle = gl; c.fillRect(x - R, sy - R, 2 * R, 2 * R);
      });
    }
    // Limite jour/nuit en trait fin : latitude où le soleil est à l'horizon, pour chaque longitude.
    if (S.terminator) {
      c.lineWidth = 1.3 * pr; c.strokeStyle = S.terminator;
      c.beginPath();
      var td2 = Math.tan(Math.abs(dec) < 0.001 ? 0.001 : dec);
      for (var i = 0; i <= 360; i++) {
        var lo = LON0 + i, H = (lo - sun.lon) * RAD;
        var lat = Math.atan(-Math.cos(H) / td2) / RAD;
        var X = i / 360 * cw, Y = fy(lat) * ch;
        if (i === 0) c.moveTo(X, Y); else c.lineTo(X, Y);
      }
      c.stroke();
    }
    // Limites des fuseaux, équateur et tropiques.
    c.lineWidth = Math.max(1, pr * 0.7);
    c.strokeStyle = S.grid;
    c.beginPath();
    for (var k = 1; k < 24; k++) { var Xg = Math.round(k / 24 * cw) + 0.5; c.moveTo(Xg, 0); c.lineTo(Xg, ch); }
    c.stroke();
    if (S.grid2) {
      if (c.setLineDash) c.setLineDash([3 * pr, 5 * pr]);
      c.strokeStyle = S.grid2;
      c.beginPath();
      [0, 23.44, -23.44].forEach(function (la) { var Yg = Math.round(fy(la) * ch) + 0.5; c.moveTo(0, Yg); c.lineTo(cw, Yg); });
      c.stroke();
      if (c.setLineDash) c.setLineDash([]);
    }
    // Soleil et lune à leur aplomb.
    var moon = SM.astro.subLunar(ms), ph = SM.astro.moonPhase(ms);
    place(st.sunEl, fx(sun.lon) * w, fy(sun.lat) * h);
    place(st.moonEl, fx(moon.lon) * w, fy(moon.lat) * h);
    var key = Math.round(ph.phase * 50);
    if (st.moonKey !== key) { st.moonKey = key; st.moonEl.innerHTML = IC.moonPhase(ph, false, 30, true); }
  }

  function place(el, x, y) { el.style.webkitTransform = el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; }

  /* ---------- heures et décalages ---------- */
  function cityOffsetMin(p, nowS) {
    var w = SM.app.data[p.id];
    var wl = I.wall(nowS, (w && w.tz) || p.tz, w ? w.offset : 0);
    // Les fuseaux sont des multiples de 15 min : on arrondit pour effacer les secondes.
    return Math.round((Date.UTC(wl.y, wl.mo, wl.d, wl.h, wl.mi, wl.s) / 1000 - nowS) / 900) * 15;
  }
  function offsetLabel(min) {
    var tt = I.t();
    if (min === 0) return tt.sameTime;
    var a = Math.abs(min), hh = Math.floor(a / 60), mm = a % 60;
    return (min > 0 ? '+' : '−') + hh + ' h' + (mm ? ' ' + U.pad(mm) : '');
  }
  function dayLabel(p, nowS) {
    var tt = I.t(), w = SM.app.data[p.id];
    var c = I.wall(nowS, (w && w.tz) || p.tz, w ? w.offset : 0);
    var d = new Date(nowS * 1000), devKey = d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
    return c.key === devKey ? tt.today : (c.key > devKey ? tt.tomorrow : tt.yesterday);
  }

  /* ---------- villes ---------- */
  function cityInfo(p, ms) {
    var w = SM.app.data[p.id], nowS = Math.floor(ms / 1000);
    var tz = (w && w.tz) || p.tz, wl = I.wall(nowS, tz, w ? w.offset : 0);
    var c = w ? w.current : null, d = null;
    if (w) {
      for (var i = 0; i < w.daily.length; i++) if (I.wall(w.daily[i].t + 43200, tz, w.offset).key === wl.key) { d = w.daily[i]; break; }
    }
    var sky = SM.sky.colorsFor(p.lat, p.lon, ms, c ? c.code : null, c ? c.cloud : null);
    return { p: p, pl: I.place(p), w: w, c: c, d: d, wl: wl, tz: tz, sky: sky, night: sky.alt < -3, temp: c ? c.temp : null };
  }

  function markerHTML(ci, i) {
    var icon = ci.c ? IC.weather(CO.icon(ci.c.code, ci.sky.alt > -1), 'mki') : '';
    var col = dotColor() === 'temp' ? (U.has(ci.temp) ? SM.ui.tempColor(ci.temp) : '#ffffff') : dotColor();
    return '<div class="mk' + (ci.night ? ' night' : '') + '" data-place="' + U.esc(ci.p.id) + '" style="left:' + (fx(ci.p.lon) * 100).toFixed(3) + '%;top:' + (fy(ci.p.lat) * 100).toFixed(3) + '%">' +
      '<i class="mkd" style="background:' + col + '"></i><i class="mkp" style="border-color:' + col + '"></i>' +
      '<div class="mkl">' + icon + '<div class="mkt"><b>' + (U.has(ci.temp) ? I.temp(ci.temp) : '') + '</b><span>' + U.esc(ci.pl.name) + '</span><small class="mktime"></small></div></div></div>';
  }

  function clockSVG(ci) {
    var ticks = '';
    for (var k = 0; k < 60; k++) {
      var a = k * 6 * RAD, big = k % 5 === 0, r1 = big ? 38 : 41.5;
      ticks += '<line x1="' + (50 + Math.sin(a) * r1).toFixed(2) + '" y1="' + (50 - Math.cos(a) * r1).toFixed(2) + '" x2="' + (50 + Math.sin(a) * 44).toFixed(2) + '" y2="' + (50 - Math.cos(a) * 44).toFixed(2) + '" class="' + (big ? 'tb' : 'ts') + '"/>';
    }
    var nums = [12, 3, 6, 9].map(function (n, i) {
      var a = i * 90 * RAD;
      return '<text x="' + (50 + Math.sin(a) * 30).toFixed(1) + '" y="' + (50 - Math.cos(a) * 30).toFixed(1) + '">' + n + '</text>';
    }).join('');
    return '<svg class="clk' + (ci.night ? ' night' : '') + '" viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="47" class="face"/>' + ticks + nums +
      '<line x1="50" y1="56" x2="50" y2="27" class="hh"/><line x1="50" y1="58" x2="50" y2="14" class="mh"/>' +
      '<line x1="50" y1="60" x2="50" y2="10" class="sh"/><circle cx="50" cy="50" r="2.6" class="hub"/></svg>';
  }

  function dayBar(ci) {
    if (!ci.d || !ci.d.sunrise || !ci.d.sunset) return '';
    var w = ci.w;
    var rise = I.wall(ci.d.sunrise, ci.tz, w.offset), set = I.wall(ci.d.sunset, ci.tz, w.offset);
    var fr = (rise.h * 60 + rise.mi) / 1440 * 100, fs = (set.h * 60 + set.mi) / 1440 * 100;
    var g = 'linear-gradient(to right,#18203c 0%,#18203c ' + Math.max(fr - 4, 0).toFixed(1) + '%,#f19a6a ' + fr.toFixed(1) + '%,#9fd0ff ' + Math.min(fr + 5, fs).toFixed(1) + '%,#9fd0ff ' + Math.max(fs - 5, fr).toFixed(1) + '%,#f08a5d ' + fs.toFixed(1) + '%,#18203c ' + Math.min(fs + 4, 100).toFixed(1) + '%,#18203c 100%)';
    return '<div class="dbar2" style="background:' + g + '"><i class="now"></i></div>' +
      '<div class="srow">' + IC.ui('sunrise') + I.hm(rise) + '<span></span>' + IC.ui('sunset') + I.hm(set) + '</div>';
  }

  function cardHTML(ci) {
    var tt = I.t(), cols = ci.sky.cols, isClock = st.cards === 'clocks';
    var bg = isClock ? '' : ' style="background-image:linear-gradient(to bottom,' + U.rgb(cols[0]) + ' 0%,' + U.rgb(cols[1]) + ' 60%,' + U.rgb(cols[2]) + ' 100%)"';
    var wx = ci.c ? IC.weather(CO.icon(ci.c.code, ci.sky.alt > -1), 'mci') : '';
    var hl = ci.d ? '<span class="hl">' + tt.max + ' ' + I.temp(ci.d.max) + ' · ' + tt.min + ' ' + I.temp(ci.d.min) + '</span>' : '';
    if (isClock) {
      return '<div class="mcard clock" data-place="' + U.esc(ci.p.id) + '">' + clockSVG(ci) + '<div class="mcc">' +
        '<div class="mcn">' + U.esc(ci.pl.name) + '</div><div class="mcbig"><span class="mctime"></span>' +
        (U.has(ci.temp) ? '<span class="mct">' + wx + I.temp(ci.temp) + '</span>' : '') + '</div>' +
        '<div class="mcs"><span class="mcday"></span></div>' + dayBar(ci) + '</div></div>';
    }
    return '<div class="mcard sky' + (ci.sky.brightness > 0.62 ? ' bright' : '') + '" data-place="' + U.esc(ci.p.id) + '"' + bg + '>' +
      '<div class="mch"><div><b>' + U.esc(ci.pl.name) + '</b><small>' + U.esc(ci.pl.country) + '</small></div>' + wx + '</div>' +
      '<div class="mcbig"><span class="mctime"></span><span class="mct">' + (U.has(ci.temp) ? I.temp(ci.temp) : '–') + '</span></div>' +
      '<div class="mcs"><span class="mcday"></span>' + (ci.c ? ' · ' + U.esc(CO.label(ci.c.code)) : '') + '</div>' +
      '<div class="mcs">' + hl + '</div>' + dayBar(ci) + '</div>';
  }

  var lastLayout = 0;
  function placeOnGlobe(final) {
    if (!st.root || st.view !== 'globe') return;
    var cx = st.w / 2, cy = st.h / 2, G = SM.globe;
    U.$$('.mk', st.box).forEach(function (mk, i) {
      var ci = st.infos && st.infos[i];
      if (!ci) return;
      var p = G.project(ci.p.lat, ci.p.lon);
      var disp = p.front ? '' : 'none';
      if (mk.style.display !== disp) mk.style.display = disp;
      // Position par transformation : la carte graphique déplace le point et son étiquette, sans mise en page ni
      // repeinte à chaque image (avant : left et top, donc 30 mises en page par seconde).
      if (!mk._g) { mk._g = true; mk.style.left = '0'; mk.style.top = '0'; }
      mk._x = cx + p.x; mk._y = cy + p.y;
      if (p.front) place(mk, mk._x, mk._y);
    });
    var ms = SM.app.nowMs(), sun = SM.astro.subSolar(ms), moon = SM.astro.subLunar(ms);
    var ps = G.project(sun.lat, sun.lon), pm = G.project(moon.lat, moon.lon);
    st.sunEl.style.display = ps.front ? '' : 'none'; place(st.sunEl, cx + ps.x, cy + ps.y);
    st.moonEl.style.display = pm.front ? '' : 'none'; place(st.moonEl, cx + pm.x, cy + pm.y);
    globeLabels();
  }

  /* Globe : comme la carte des trajets de Travel Hub, chaque étiquette reste collée à droite de son point et tourne
     avec lui. Aucun replacement : quand deux étiquettes se recouvrent, la seconde s'efface (son point reste). */
  function globeLabels() {
    // Toutes les étiquettes restent affichées ; chacune garde la place qu'on lui a donnée par rapport à son point
    // (à droite par défaut), et tourne avec lui. Position retenue en proportion du rayon du globe.
    var saved = globePos(), R = Math.max(SM.globe.radius(), 1), pts = [];
    U.$$('.mk', st.box).forEach(function (mk) {
      var lab = U.$('.mkl', mk), id = mk.getAttribute('data-place');
      if (mk.style.display === 'none') return;
      if (!lab._w || lab._pos !== 'g') { lab.style.display = ''; lab._w = lab.offsetWidth; lab._h = lab.offsetHeight; lab._pos = 'g'; }
      var held = drag && drag.p.lab === lab, m = saved[id];
      var off = held ? drag.p.off : (m ? [m[0] * R, m[1] * R] : [12, -lab._h / 2]);
      var x = mk._x, y = mk._y;
      // Étiquette tenue : son point continue de tourner, le trait le suit.
      if (held) { drag.p.x = x; drag.p.y = y; drag.p.box = [x + drag.p.off[0], y + drag.p.off[1], drag.p.w, drag.p.h]; }
      if (!held) {
        var l = off[0].toFixed(0) + 'px', t = off[1].toFixed(0) + 'px';
        if (lab.style.left !== l) lab.style.left = l;
        if (lab.style.top !== t) lab.style.top = t;
        if (lab.style.display) lab.style.display = '';
      }
      pts.push(held ? drag.p : { id: id, lab: lab, x: x, y: y, w: lab._w, h: lab._h, off: [off[0], off[1], 0, 0], box: [x + off[0], y + off[1], lab._w, lab._h], globe: true });
    });
    st.labels = pts;
    drawLines();
  }

  /* Étiquettes : placées autour de leur point (à droite, à gauche, au-dessus, au-dessous, puis de plus en plus loin
     avec un trait de rappel), jamais l'une sur l'autre et toujours séparées d'un écart minimal. Les villes les plus
     entourées passent d'abord, puis trois passes reprennent chaque étiquette en tenant compte de toutes les autres. */
  var GAP = 10;
  // light : globe en rotation, placement rapide (une passe, sans recuit) ; la version complète à l'arrêt.
  // Durée du placement des étiquettes, pour le journal (ligne d'ouverture de la carte).
  function layoutLabels(light) {
    var t0 = Date.now();
    layoutLabelsRun(light);
    M.lastLabels = (Date.now() - t0) + ' ms';
  }
  function layoutLabelsRun(light) {
    // Jamais de nouveau placement pendant qu'une étiquette est tenue : elle se détacherait de son trait.
    if (drag) { pendingRefresh = true; return; }
    var W = st.w, H = st.h;
    var mks = U.$$('.mk', st.box).filter(function (mk) { return mk.style.display !== 'none'; });
    if (!mks.length) { U.$('.mklines', st.box).innerHTML = ''; return; }
    // Positions choisies à la main (carte à plat seulement) : fixes, les autres étiquettes s'arrangent autour.
    var saved = st.view === 'map' ? manualPos() : {};
    var autoKey = st.view === 'map' ? W + 'x' + H + '|' + I.lang : '';
    if (!st.autoPos) st.autoPos = {};
    var pts = mks.map(function (mk) {
      var lab = U.$('.mkl', mk), id = mk.getAttribute('data-place');
      lab.style.display = ''; lab._pos = '';
      var p = { id: id, lab: lab, x: mk.offsetLeft, y: mk.offsetTop, w: lab.offsetWidth, h: lab.offsetHeight, box: null, off: null, fixed: false };
      var m = saved[id], a = autoKey && autoKey === st.autoKey && st.autoPos[id];
      if (m) { p.fixed = true; p.off = [m[0] * W, m[1] * labH(), 0, 0]; p.box = [p.x + p.off[0], p.y + p.off[1], p.w, p.h]; }
      // Déjà placée automatiquement à cette taille : elle garde sa place, quoi qu'il arrive (choix de Matt).
      else if (a) { p.kept = true; p.off = [a[0], a[1], 0, 0]; p.box = [p.x + a[0], p.y + a[1], p.w, p.h]; }
      return p;
    });
    st.labels = pts;
    // Candidats : 24 directions à 9 distances, des plus proches aux plus lointaines.
    function candidates(p) {
      var out = [], k = 0;
      [12, 35, 60, 90, 125, 165, 210, 260, 320].forEach(function (d) {
        for (var a = 0; a < 24; a++) {
          var ang = a / 24 * Math.PI * 2, cx = Math.cos(ang), cy = Math.sin(ang);
          // Le bord de l'étiquette le plus proche du point se tient à la distance d.
          var ox = cx > 0.3 ? cx * d : (cx < -0.3 ? cx * d - p.w : -p.w / 2 + cx * d);
          var oy = cy > 0.3 ? cy * d : (cy < -0.3 ? cy * d - p.h : -p.h / 2 + cy * d);
          out.push([ox, oy, k++, d]);
        }
      });
      return out;
    }
    function overlap(a, b, gap) {
      var ox = Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]) + gap;
      var oy = Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]) + gap;
      return ox > 0 && oy > 0 ? ox * oy : 0;
    }
    // Un segment (point → étiquette) traverse-t-il un rectangle ?
    function crosses(x1, y1, x2, y2, r) {
      for (var t = 0.15; t < 0.9; t += 0.15) {
        var x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
        if (x > r[0] && x < r[0] + r[2] && y > r[1] && y < r[1] + r[3]) return true;
      }
      return false;
    }
    function segX(a, b, c, d, e, f, g, h) {
      var d1 = (g - e) * (b - f) - (h - f) * (a - e), d2 = (g - e) * (d - f) - (h - f) * (c - e);
      var d3 = (c - a) * (f - b) - (d - b) * (e - a), d4 = (c - a) * (h - b) - (d - b) * (g - a);
      return d1 * d2 < 0 && d3 * d4 < 0;
    }
    function anchor(p, b) { return [U.clamp(p.x, b[0], b[0] + b[2]), U.clamp(p.y, b[1], b[1] + b[3])]; }
    function score(p, o, self) {
      var b = [p.x + o[0], p.y + o[1], p.w, p.h], s = o[3] * 9 + (o[2] % 24) * 0.3;
      if (b[0] < 2) s += 20000 + (2 - b[0]) * 50;
      if (b[0] + b[2] > W - 2) s += 20000 + (b[0] + b[2] - W) * 50;
      if (b[1] < 2) s += 20000 + (2 - b[1]) * 50;
      if (b[1] + b[3] > H - 2) s += 20000 + (b[1] + b[3] - H) * 50;
      var an = anchor(p, b);
      pts.forEach(function (q, j) {
        // Les points des villes : jamais sous une étiquette.
        if (overlap(b, [q.x - 9, q.y - 9, 18, 18], 4)) s += 8000;
        if (j === self || !q.box) return;
        var ov = overlap(b, q.box, GAP);
        if (ov) s += 10000 + ov;
        // Un trait de rappel ne doit pas traverser une autre étiquette.
        if (crosses(p.x, p.y, an[0], an[1], q.box)) s += 3000;
        var qa = anchor(q, q.box);
        if (crosses(q.x, q.y, qa[0], qa[1], b)) s += 3000;
        // Deux traits de rappel ne se croisent que s'il n'y a pas d'autre place (moins grave qu'un chevauchement).
        if (segX(p.x, p.y, an[0], an[1], q.x, q.y, qa[0], qa[1])) s += 2500;
      });
      return s;
    }
    function best(p, i) {
      if (p.fixed || p.kept) return;
      var bo = null, bs = 1e12;
      candidates(p).forEach(function (o) { var v = score(p, o, i); if (v < bs) { bs = v; bo = o; } });
      p.off = bo; p.box = [p.x + bo[0], p.y + bo[1], p.w, p.h];
    }
    // Les plus entourées d'abord.
    var order = pts.map(function (p, i) {
      var c = 0;
      pts.forEach(function (q) { if (Math.abs(q.x - p.x) < 220 && Math.abs(q.y - p.y) < 140) c++; });
      return [c, i];
    }).sort(function (a, b) { return b[0] - a[0]; }).map(function (a) { return a[1]; });
    for (var pass = 0; pass < (light ? 1 : 6); pass++) order.forEach(function (i) { best(pts[i], i); });
    // Démêlage : deux traits qui se croisent, on échange la place des deux étiquettes (chacune reste reliée à son
    // point) quand l'échange ne crée ni chevauchement ni débordement. Répété tant qu'il améliore.
    function cost(i) { return score(pts[i], pts[i].off, i); }
    for (var round = 0; round < (light ? 0 : 4); round++) {
      var changed = false;
      for (var i = 0; i < pts.length; i++) for (var j = i + 1; j < pts.length; j++) {
        var P = pts[i], Q = pts[j];
        if (P.fixed || Q.fixed || P.kept || Q.kept) continue;
        var pa = anchor(P, P.box), qa = anchor(Q, Q.box);
        if (!segX(P.x, P.y, pa[0], pa[1], Q.x, Q.y, qa[0], qa[1])) continue;
        var before = cost(i) + cost(j), po = P.off, qo = Q.off, pb = P.box, qb = Q.box;
        // Chaque étiquette prend l'emplacement de l'autre, centrée sur le même centre.
        var pc = [pb[0] + pb[2] / 2, pb[1] + pb[3] / 2], qc = [qb[0] + qb[2] / 2, qb[1] + qb[3] / 2];
        P.off = [qc[0] - P.w / 2 - P.x, qc[1] - P.h / 2 - P.y, po[2], po[3]]; P.box = [P.x + P.off[0], P.y + P.off[1], P.w, P.h];
        Q.off = [pc[0] - Q.w / 2 - Q.x, pc[1] - Q.h / 2 - Q.y, qo[2], qo[3]]; Q.box = [Q.x + Q.off[0], Q.y + Q.off[1], Q.w, Q.h];
        if (cost(i) + cost(j) < before) changed = true;
        else { P.off = po; P.box = pb; Q.off = qo; Q.box = qb; }
      }
      if (!changed) break;
      order.forEach(function (k) { best(pts[k], k); });
    }
    // Recuit : on essaie des emplacements au hasard (tirage fixe, donc le même résultat d'une minute à l'autre),
    // en acceptant parfois un léger recul au début pour sortir des impasses ; on garde la meilleure disposition vue.
    var rnd = U.seeded('etiquettes' + pts.length), cands = pts.map(candidates);
    var total = function () { var t = 0; pts.forEach(function (q, k) { t += score(q, q.off, k); }); return t; };
    var cur = total(), bestT = cur, keep = pts.map(function (q) { return q.off; });
    for (var it = 0, N = light ? 0 : 2000; it < N; it++) {
      var k = Math.floor(rnd() * pts.length), q = pts[k], c = cands[k][Math.floor(rnd() * cands[k].length)];
      if (q.fixed || q.kept) continue;
      var before = score(q, q.off, k), oldOff = q.off, oldBox = q.box;
      q.off = c; q.box = [q.x + c[0], q.y + c[1], q.w, q.h];
      var after = score(q, c, k), temp = 600 * (1 - it / N);
      if (after <= before || rnd() < Math.exp((before - after) / Math.max(temp, 1))) {
        cur += after - before;
        if (cur < bestT) { bestT = cur; keep = pts.map(function (r) { return r.off; }); }
      } else { q.off = oldOff; q.box = oldBox; }
    }
    pts.forEach(function (q, k) { q.off = keep[k]; q.box = [q.x + q.off[0], q.y + q.off[1], q.w, q.h]; });
    // Mémoire des places automatiques (carte à plat) : un déplacement à la main ne bouscule pas les autres.
    if (autoKey) {
      if (autoKey !== st.autoKey) { st.autoKey = autoKey; st.autoPos = {}; }
      pts.forEach(function (p) { if (!p.fixed) st.autoPos[p.id] = [p.off[0], p.off[1]]; });
    }
    pts.forEach(function (p) { p.lab.style.left = p.off[0].toFixed(0) + 'px'; p.lab.style.top = p.off[1].toFixed(0) + 'px'; p.lab.className = 'mkl' + (p.fixed ? ' fixed' : ''); });
    drawLines();
  }

  /* Traits de rappel : du point au bord le plus proche de l'étiquette. */
  function drawLines() {
    var lines = '';
    (st.labels || []).forEach(function (p) {
      // L'étiquette tenue fait foi, même si la liste a été refaite entre-temps.
      if (drag && drag.p.id === p.id) p = drag.p;
      if (!p.box) return;
      var ax = U.clamp(p.x, p.box[0], p.box[0] + p.box[2]), ay = U.clamp(p.y, p.box[1], p.box[1] + p.box[3]);
      if (Math.abs(ax - p.x) + Math.abs(ay - p.y) > 20) {
        lines += '<line x1="' + p.x.toFixed(1) + '" y1="' + p.y.toFixed(1) + '" x2="' + ax.toFixed(1) + '" y2="' + ay.toFixed(1) + '"/>';
      }
    });
    U.$('.mklines', st.box).innerHTML = lines;
  }

  /* ---------- étiquettes placées à la main ----------
     On glisse une étiquette (doigt ou souris) ; Maj enfoncée, le trait se cale à 0°, 45°, 90°… ; reposée sur son
     point, elle repasse au placement automatique. Position gardée par lieu et par orientation, en proportion de la carte. */
  var MKEY = 'sm.labelPos', GKEY = 'sm.labelPosGlobe';
  function globePos() { try { return JSON.parse(localStorage.getItem(GKEY)) || {}; } catch (e) { return {}; } }
  function saveGlobe(id, v) {
    var all = globePos();
    if (v) all[id] = v; else delete all[id];
    try { localStorage.setItem(GKEY, JSON.stringify(all)); } catch (e) { /* plein */ }
  }
  function orient() { return document.getElementById('app').className.indexOf('land') >= 0 ? 'land' : 'port'; }
  function manualAll() { try { return JSON.parse(localStorage.getItem(MKEY)) || {}; } catch (e) { return {}; } }
  function manualPos() { return manualAll()[orient()] || {}; }
  function saveManual(id, v) {
    var all = manualAll(), o = orient();
    all[o] = all[o] || {};
    if (v) all[o][id] = v; else delete all[o][id];
    try { localStorage.setItem(MKEY, JSON.stringify(all)); } catch (e) { /* plein */ }
  }

  var drag = null;
  function labelAt(t) {
    if (!st.root || !t.closest) return null;
    var lab = t.closest('.mkl'), mk = lab && lab.parentNode;
    if (!lab || !st.labels) return null;
    for (var i = 0; i < st.labels.length; i++) if (st.labels[i].lab === lab) return st.labels[i];
    return null;
  }
  function pointOf(e) { var t = e.touches ? e.touches[0] || e.changedTouches[0] : e; return [t.clientX, t.clientY]; }
  function dragStart(e) {
    var p = labelAt(e.target);
    if (!p) return;
    var pt = pointOf(e);
    // Position et taille relues à l'instant du geste : le trait et l'étiquette partent du même état.
    var mk = p.lab.parentNode;
    if (st.view === 'globe' && mk._g) { p.x = mk._x; p.y = mk._y; } else { p.x = mk.offsetLeft; p.y = mk.offsetTop; }
    p.w = p.lab.offsetWidth; p.h = p.lab.offsetHeight;
    p.off = [p.lab.offsetLeft, p.lab.offsetTop, 0, 0]; p.box = [p.x + p.off[0], p.y + p.off[1], p.w, p.h];
    drag = { p: p, sx: pt[0], sy: pt[1], ox: p.off[0], oy: p.off[1], moved: false };
    if (e.type === 'mousedown') e.preventDefault();
  }
  function dragMove(e) {
    if (!drag) return;
    // Bouton relâché hors de la fenêtre : on termine là, l'étiquette ne reste pas accrochée au curseur.
    if (e.type === 'mousemove' && e.buttons === 0) { dragEnd(); return; }
    var pt = pointOf(e), dx = pt[0] - drag.sx, dy = pt[1] - drag.sy, p = drag.p;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
    drag.moved = true;
    if (e.cancelable) e.preventDefault();
    var ox = drag.ox + dx, oy = drag.oy + dy;
    if (e.shiftKey) {
      // Trait calé : le centre de l'étiquette sur la demi-droite à 0°, 45°, 90°… partant du point, à la même distance.
      var cx = ox + p.w / 2, cy = oy + p.h / 2, d = Math.sqrt(cx * cx + cy * cy), a = Math.round(Math.atan2(cy, cx) / (Math.PI / 4)) * (Math.PI / 4);
      ox = Math.cos(a) * d - p.w / 2; oy = Math.sin(a) * d - p.h / 2;
    }
    // Toujours dans la carte.
    ox = U.clamp(ox, 2 - p.x, st.w - 2 - p.w - p.x); oy = U.clamp(oy, 2 - p.y, st.h - 2 - p.h - p.y);
    p.off = [ox, oy, 0, 0]; p.box = [p.x + ox, p.y + oy, p.w, p.h];
    ox = Math.round(ox); oy = Math.round(oy);
    p.off = [ox, oy, 0, 0]; p.box = [p.x + ox, p.y + oy, p.w, p.h];
    p.lab.style.left = ox + 'px'; p.lab.style.top = oy + 'px';
    p.lab.className = 'mkl fixed dragging';
    drawLines();
  }
  function dragEnd() {
    if (!drag) return;
    var d = drag;
    // Le glisser s'arrête net au relâchement ; seul le clic qui suit est ignoré (il ne doit pas ouvrir la ville).
    drag = null;
    if (!d.moved) return;
    draggedAt = Date.now();
    // Ramenée tout contre son point : l'étiquette repasse au placement automatique.
    var b = d.p.box, ax = U.clamp(d.p.x, b[0], b[0] + b[2]), ay = U.clamp(d.p.y, b[1], b[1] + b[3]);
    var near = Math.abs(ax - d.p.x) + Math.abs(ay - d.p.y) < 6;
    if (st.view === 'globe') {
      var R = Math.max(SM.globe.radius(), 1);
      saveGlobe(d.p.id, near ? null : [d.p.off[0] / R, d.p.off[1] / R]);
      globeLabels();
    } else {
      saveManual(d.p.id, near ? null : [d.p.off[0] / st.w, d.p.off[1] / labH()]);
      layoutLabels();
    }
    // Données arrivées pendant le glisser : la carte se met à jour maintenant.
    if (pendingRefresh) { pendingRefresh = false; M.refresh(); }
  }
  var draggedAt = 0, pendingRefresh = false;
  document.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('touchstart', dragStart, { passive: true });
  document.addEventListener('touchend', dragEnd, { passive: true });
  document.addEventListener('touchcancel', dragEnd, { passive: true });

  /* ---------- règle des fuseaux ---------- */
  /* 24 fuseaux de 15°, le premier (UTC−11) commençant à 172,5° O. La carte commence à LON0 : le premier fuseau est
     coupé à gauche et son reste revient au bord droit (même heure, trop étroit pour un chiffre). */
  function rulerHTML() {
    var off = ((LON0 + 172.5) % 15 + 15) % 15, s = '';
    var span = function (z, w, blank) { return '<span data-z="' + z + '" style="-webkit-flex:' + w + ' 1 0;flex:' + w + ' 1 0' + (blank ? ';visibility:hidden' : '') + '"></span>'; };
    for (var k = 0; k < 24; k++) s += span(k - 11, k ? 15 : 15 - off, false);
    if (off) s += span(-11, off, true);
    return s;
  }
  function updateRuler(ms) {
    var dev = -new Date(ms).getTimezoneOffset();
    var devZone = Math.round(dev / 60), utc = new Date(ms);
    var uh = utc.getUTCHours(), um = utc.getUTCMinutes();
    U.$$('.zones span', st.root).forEach(function (sp) {
      var z = +sp.getAttribute('data-z'), h = (uh + z + 48) % 24;
      var alt = SM.astro.sun(ms, 0, z * 15).alt;
      sp.className = (z === devZone ? 'me' : '') + (alt > 0 ? ' d' : (alt > -12 ? ' t' : ''));
      sp.textContent = z === devZone ? U.pad(h) + ':' + U.pad(um) : U.pad(h);
    });
  }

  /* ---------- rendu et mise à jour ---------- */
  var M = {};

  // later : la taille définitive viendra d'un M.resize() de l'appelant (réglages montés dans l'en-tête) ; on ne
  // dimensionne pas ici, sinon les fonds étaient dessinés une première fois à une taille provisoire, pour rien.
  M.render = function (container, places, later) {
    if (drag && st.root) { pendingRefresh = true; return; }
    // Carte reconstruite alors qu'elle était déjà affichée : l'ancien canevas et ses calques sont rendus tout de suite.
    if (st.cv) { freeLayers(); free(st.cv); st.cv = st.ctx = null; }
    var tt = I.t();
    try { st.cards = localStorage.getItem('sm.mapCards') || 'clocks'; } catch (e) { st.cards = 'clocks'; }
    try { st.style = localStorage.getItem('sm.mapStyle') || 'nature'; } catch (e) { st.style = 'nature'; }
    if (!STYLES[st.style]) st.style = 'nature';
    try { st.view = localStorage.getItem('sm.mapView') || 'map'; } catch (e) { st.view = 'map'; }
    if (st.view === 'globe' && !SM.globe.supported()) st.view = 'map';
    st.places = places;
    // Nouveau cadre : l'ancien globe y serait resté accroché.
    SM.globe.detach();
    container.innerHTML =
      '<div class="mapview"><p class="mrotate">' + U.esc(tt.rotateForMap) + '</p><div class="mapwrap">' +
        '<div class="zones">' + rulerHTML() + '</div>' +
        '<div class="mapbox"><canvas></canvas><div class="msun"><i></i></div><div class="mmoon"></div>' +
        '<svg class="mklines" aria-hidden="true"></svg><div class="mks"></div><p class="mapcredit">' + U.esc(tt.mapCredit) + '</p>' + spinHTML() + '</div>' +
      '</div>' +
      '<div class="mbottom"><div class="mbar"><div class="seg mstyle">' + STYLE_ORDER.map(function (k) {
        return '<button data-style="' + k + '"' + (k === st.style ? ' class="on"' : '') + '>' + tt.mapStyles[k] + '</button>';
      }).join('') + '</div>' + (SM.globe.supported() ? '<div class="seg mview"><button data-view="map"' + (st.view === 'map' ? ' class="on"' : '') + '>' + tt.viewMap + '</button>' +
        '<button data-view="globe"' + (st.view === 'globe' ? ' class="on"' : '') + '>' + tt.viewGlobe + '</button></div>' : '') + '<div class="seg mswitch"><button data-cards="clocks"' + (st.cards === 'clocks' ? ' class="on"' : '') + '>' + tt.clocks + '</button>' +
        '<button data-cards="weather"' + (st.cards === 'weather' ? ' class="on"' : '') + '>' + tt.weatherCards + '</button></div></div>' +
        '<div class="mcards"></div></div></div>';
    st.root = U.$('.mapview', container);
    if (!dotBlink()) st.root.className += ' noblink';
    if (!dotHalo()) st.root.className += ' nohalo';
    // Glisser d'étiquette : seul écouteur non passif de la carte, posé sur elle (voir config.js).
    st.root.addEventListener('touchmove', dragMove, { passive: false });
    st.box = U.$('.mapbox', st.root);
    st.cv = U.$('canvas', st.box);
    st.ctx = st.cv.getContext('2d');
    st.sunEl = U.$('.msun', st.box); st.moonEl = U.$('.mmoon', st.box);
    st.moonKey = null;
    st.day = st.mask = null;
    M.refresh();
    if (!later) M.resize(true);
  };

  /* ---------- carte préparée au repos ---------- */
  /* Pendant que la ville ou la liste est affichée et que personne ne touche l'écran, les fonds de la carte (à la taille
     où elle s'affichera) sont dessinés en avance, par petites étapes, pour qu'elle s'ouvre aussitôt au clic. Arrêté
     dès qu'un geste commence ou que la carte s'ouvre, repris au prochain repos. cb(texte pour le journal). */
  var warm = null;
  M.prewarm = function (canStep, cb) {
    if (warm || st.root) return;
    var sz;
    try { sz = JSON.parse(localStorage.getItem('sm.mapSize.' + (document.getElementById('app').className.indexOf('land') >= 0 ? 'land' : 'port') + (SM.app.mapFull ? '.full' : ''))); } catch (e) { sz = null; }
    if (!sz) return;
    var style = 'nature', view = 'map';
    try { style = localStorage.getItem('sm.mapStyle') || 'nature'; view = localStorage.getItem('sm.mapView') || 'map'; } catch (e) { /* rien */ }
    if (view === 'globe' || !STYLES[style]) return;
    var S = STYLES[style];
    if (S.imagery && !EARTH.ready) { loadEarth(function () { }); return; }
    var cw = Math.round(sz.w * sz.pr), ch = Math.round(sz.h * sz.pr);
    var key = [style, cw, ch, sz.lat, sz.south === undefined ? -58 : sz.south, LON0, S.imagery ? EARTH.ready : 0].join('|');
    if (layerCache.some(function (e) { return e.key === key; })) return;
    var entry = { key: key, day: canvas(cw, ch), night: canvas(cw, ch) };
    // Chaque étape dessine avec la taille et la projection de la carte à venir, puis rend celles de l'instant.
    var withSize = function (f) {
      var keep = [st.w, st.h, st.pr, LAT_N, LAT_S];
      st.w = sz.w; st.h = sz.h; st.pr = sz.pr; setNorth(sz.lat, sz.south);
      try { f(); } finally { st.w = keep[0]; st.h = keep[1]; st.pr = keep[2]; setNorth(keep[3], keep[4]); }
    };
    var steps = [];
    withSize(function () {
      steps = paintSteps(entry.day.getContext('2d'), S, false, cw, ch).concat(paintSteps(entry.night.getContext('2d'), S, true, cw, ch));
    });
    warm = { n: steps.length, ms: 0, t: Date.now() };
    var next = function () {
      if (st.root) { free(entry.day); free(entry.night); warm = null; return; }   // carte ouverte entre-temps
      if (!canStep()) { setTimeout(next, 1000); return; }
      var t = Date.now();
      withSize(steps.shift());
      warm.ms += Date.now() - t;
      if (steps.length) { setTimeout(next, 40); return; }
      layerCache.unshift(entry);
      while (layerCache.length > 2) { var old = layerCache.pop(); free(old.day); free(old.night); }
      if (cb) cb('map prewarm ' + warm.ms + ' ms in ' + warm.n + ' steps over ' + Math.round((Date.now() - warm.t) / 1000) + ' s · ' + style + ' ' + cw + 'x' + ch);
      warm = null;
    };
    setTimeout(next, 0);
  };

  /* Nouvelles données : on refait villes et cartes, pas le fond. */
  M.refresh = function () {
    if (!st.root) return;
    // Pas de reconstruction des étiquettes sous le doigt : elle attend la fin du glisser.
    if (drag) { pendingRefresh = true; return; }
    var ms = SM.app.nowMs();
    var infos = st.places.map(function (p) { return cityInfo(p, ms); });
    // Les anciens points et les anciennes cartes sont vidés après remplacement (voir U.release).
    var oldMk = U.$$('.mk', st.box), oldCards = U.$$('.mcard', st.root);
    U.$('.mks', st.box).innerHTML = infos.map(markerHTML).join('');
    st.infos = infos;
    if (st.view === 'globe') placeOnGlobe(true);
    U.$('.mcards', st.root).innerHTML = infos.map(cardHTML).join('');
    alignCards();
    oldMk.concat(oldCards).forEach(function (n) { n.textContent = ''; });
    st.infos = infos;
    st.minuteKey = '';
    M.tick(true);
    if (st.w && st.view !== 'globe') layoutLabels();
  };

  M.setCards = function (mode) {
    st.cards = mode;
    try { localStorage.setItem('sm.mapCards', mode); } catch (e) { /* rien */ }
    U.$$('.mswitch button').forEach(function (b) { b.className = b.getAttribute('data-cards') === mode ? 'on' : ''; });
    M.refresh();
    M.resize(true);
  };

  M.setView = function (view) {
    if (!st.root || (view === 'globe' && !SM.globe.supported())) return;
    st.view = view;
    try { localStorage.setItem('sm.mapView', view); } catch (e) { /* rien */ }
    U.$$('.mview button').forEach(function (b) { b.className = b.getAttribute('data-view') === view ? 'on' : ''; });
    if (view === 'map') { SM.globe.detach(); U.$$('.mk', st.box).forEach(function (mk) { mk.style.display = ''; }); st.sunEl.style.display = st.moonEl.style.display = ''; }
    M.refresh();
    M.resize(true);
  };

  M.setStyle = function (style) {
    if (!STYLES[style] || !st.root) return;
    st.style = style;
    try { localStorage.setItem('sm.mapStyle', style); } catch (e) { /* rien */ }
    U.$$('.mstyle button').forEach(function (b) { b.className = b.getAttribute('data-style') === style ? 'on' : ''; });
    buildLayers();
    M.tick(true);
  };

  /* Les points sont placés en pourcentage de la hauteur selon la projection : quand le plein écran change le nord
     affiché, leur hauteur doit être recalculée, sinon ils restent à leur place d'avant (décalés de leur ville). */
  function placeMarkers() {
    if (!st.box) return;
    var byId = {};
    (st.places || []).forEach(function (p) { byId[p.id] = p; });
    U.$$('.mk', st.box).forEach(function (mk) {
      var p = byId[mk.getAttribute('data-place')];
      if (p) mk.style.top = (fy(p.lat) * 100).toFixed(3) + '%';
    });
  }

  M.resize = function (force) {
    if (!st.root) return;
    var wrap = U.$('.mapwrap', st.root), bottom = U.$('.mbottom', st.root);
    var land = document.getElementById('app').className.indexOf('land') >= 0;
    var availW = st.root.clientWidth - 2 * parseFloat(getComputedStyle(wrap).paddingLeft || 0);
    var W = availW;
    if (land) {
      var rulerH = U.$('.zones', st.root).offsetHeight;
      var availH = st.root.clientHeight - bottom.offsetHeight - rulerH - 8;
      W = Math.min(availW, availH / ASPECT);
    }
    // Plein écran : la carte entière, aussi grande que l'écran le permet, sans débord ; le reste reste vide.
    var full = document.getElementById('app').className.indexOf('mapfull') >= 0;
    var fullH = full ? st.root.clientHeight - U.$('.zones', st.root).offsetHeight - 2 : 0;
    var north = full && st.view === 'map' ? northFor(fullH / Math.max(availW, 1)) : 75, south = -58;
    var landH = st.root.clientHeight - bottom.offsetHeight - U.$('.zones', st.root).offsetHeight - 8;
    /* Paysage hors plein écran : une seule marge M (celle des côtés) partout. Au-dessus des heures : M sous les
       boutons, ou M sous la barre d'état quand les contrôles sont masqués (l'en-tête sort alors de la mise en page).
       Entre la carte et les cartes de villes : M. Sous les cartes de villes : M. La carte prend toute la hauteur qui
       reste : elle montre plus de nord (jusqu'à 84°) puis plus de sud (jusqu'à 72° S) si la place le permet, ou
       rogne le sud (jusqu'à 45° S) puis le nord (jusqu'à 73°) si elle manque. */
    var lay = land && !full && !SM.app.phone, padM = 0, topY = 0;
    wrap.style.marginTop = ''; bottom.style.paddingTop = '';
    if (lay) {
      padM = parseFloat(getComputedStyle(wrap).paddingLeft) || 16;
      var app0 = document.getElementById('app'), card0 = U.$('.mcard', bottom), cardsH = card0 ? card0.offsetHeight : bottom.offsetHeight;
      var hb = U.$('header.top .iconbtn', app0), viewTop = st.root.getBoundingClientRect().top;
      topY = app0.className.indexOf(' nochrome') >= 0 || !hb ? padM : Math.max(0, hb.getBoundingClientRect().bottom - viewTop + padM);
      landH = st.root.clientHeight - topY - U.$('.zones', st.root).offsetHeight - padM - cardsH - padM;
      if (st.view === 'map') { var fb = fitLat(landH / Math.max(availW, 1)); north = fb[0]; south = fb[1]; }
    } else if (land && !full && st.view === 'map') { var sf = southFor(landH / Math.max(availW, 1)); if (sf !== null) south = sf; }
    if (north !== LAT_N || south !== LAT_S) { setNorth(north, south); force = true; placeMarkers(); }
    if (land && !full) W = Math.min(availW, landH / ASPECT);
    if (full) W = st.view === 'globe' ? availW : Math.min(availW, fullH / ASPECT);
    W = Math.floor(Math.max(W, 280));
    var H = full && st.view === 'globe' ? fullH : Math.round(W * ASPECT);
    // Globe en plein écran : la boîte couvre tout l'écran, en-tête compris ; les boutons restent par-dessus (classe gfull).
    var gfull = full && st.view === 'globe', appEl = document.getElementById('app');
    // Globe en paysage : la boîte prend aussi la largeur de la rangée de boutons ; le globe reste rond, centré.
    if (st.view === 'globe' && land && !full) { W = Math.floor(availW); H = Math.round(Math.max(280, landH)); }
    if (gfull) { W = appEl.clientWidth; H = appEl.clientHeight; }
    if (lay) {
      // Reste de hauteur (carte plate aux bornes de latitude) : partagé au-dessus et au-dessous, la marge reste égale.
      wrap.style.marginTop = (topY + Math.max(0, landH - H) / 2).toFixed(1) + 'px';
      bottom.style.paddingTop = padM.toFixed(1) + 'px';
    }
    // En portrait, le globe prend la hauteur libre au lieu de celle de la carte plate.
    if (st.view === 'globe' && !land && !full) H = Math.round(Math.max(H, Math.min(W * 0.85, st.root.clientHeight - bottom.offsetHeight - 60)));
    if (!force && W === st.w && H === st.h) return;
    st.w = W; st.h = H;
    st.pr = Math.min(window.devicePixelRatio || 1, 1.5);
    U.$('.zones', st.root).style.width = W + 'px';
    st.box.style.width = W + 'px'; st.box.style.height = H + 'px';
    dotSize();
    st.cv.width = Math.round(W * st.pr); st.cv.height = Math.round(H * st.pr);
    st.cv.style.width = W + 'px'; st.cv.style.height = H + 'px';
    st.box.className = 'mapbox' + (st.view === 'globe' ? ' globe' : '') + (gfull ? ' gfull' : '');
    if (st.view === 'globe') {
      if (!SM.globe.active()) {
        if (SM.globe.attach(st.box, placeOnGlobe)) {
          var cur = SM.app.places[SM.app.idx] || st.places[0];
          SM.globe.lon = cur ? cur.lon : 0;
          SM.globe.lat = 25;
        } else { st.view = 'map'; }
      }
      var motion = SM.app.settings.motion;
      applySpin();
      SM.globe.resize(Math.min(W, H) * 1.0);
      SM.globe.run();
    }
    buildLayers();
    M.tick(true);
    if (st.view === 'globe') placeOnGlobe(true); else layoutLabels();
    alignCards();
  };
  /* Bande des cartes sous la carte : la première carte commence exactement au bord gauche de la carte du monde
     (et la dernière finit à son bord droit), au lieu d'une marge fixe qui la décalait de quelques points. */
  function alignCards() {
    var row = st.root && U.$('.mcards', st.root), card = row && U.$('.mcard', row);
    if (!row || !card) return;
    var m = parseFloat(getComputedStyle(card).marginLeft) || 0;
    var b = st.box.getBoundingClientRect(), r = row.getBoundingClientRect();
    row.style.paddingLeft = Math.max(0, b.left - r.left - m).toFixed(1) + 'px';
    row.style.paddingRight = Math.max(0, r.right - b.right - m).toFixed(1) + 'px';
  }
  M.alignCards = alignCards;

  /* Chaque seconde : aiguilles. Chaque minute (ou si forcé) : ciel de la carte, heures, règle. */
  M.tick = function (force) {
    if (!st.root || !st.infos) return;
    var ms = SM.app.nowMs(), nowS = Math.floor(ms / 1000);
    var minute = Math.floor(ms / 60000);
    // Entre deux minutes, seules les aiguilles des horloges bougent : sans horloges à l'écran (cartes météo, ou plein
    // écran qui les masque), rien à calculer. Avant : l'heure de chaque lieu recalculée chaque seconde, pour rien.
    var hands = st.cards === 'clocks' && !SM.app.mapFull;
    if (!force && st.minuteKey === minute && !hands) return;
    var cards = U.$$('.mcard', st.root), mks = U.$$('.mk', st.box);
    st.infos.forEach(function (ci, i) {
      var wl = I.wall(nowS, ci.tz, ci.w ? ci.w.offset : 0);
      var card = cards[i];
      if (card && hands) {
        var sec = wl.s, mn = wl.mi + sec / 60, hr = (wl.h % 12) + mn / 60;
        var hs = U.$$('line.hh, line.mh, line.sh', card);
        if (hs.length === 3) {
          hs[0].setAttribute('transform', 'rotate(' + (hr * 30).toFixed(2) + ' 50 50)');
          hs[1].setAttribute('transform', 'rotate(' + (mn * 6).toFixed(2) + ' 50 50)');
          hs[2].setAttribute('transform', 'rotate(' + (sec * 6) + ' 50 50)');
        }
      }
      if (force || st.minuteKey !== minute) {
        if (card) {
          var tEl = U.$('.mctime', card), dEl = U.$('.mcday', card), now = U.$('.dbar2 .now', card);
          if (tEl) tEl.textContent = I.hm(wl);
          if (dEl) dEl.textContent = dayLabel(ci.p, nowS) + ', ' + offsetLabel(cityOffsetMin(ci.p, nowS) - (-new Date(ms).getTimezoneOffset()));
          if (now) now.style.left = ((wl.h * 60 + wl.mi) / 1440 * 100).toFixed(2) + '%';
        }
        var mk = mks[i];
        if (mk) U.$('.mktime', mk).textContent = I.hm(wl);
      }
    });
    if (force || st.minuteKey !== minute) {
      st.minuteKey = minute;
      drawSky(ms);
      updateRuler(ms);
    }
  };

  M.active = function () { return !!(st.root && document.body.contains(st.root)); };
  M.leave = function () { SM.globe.detach(); freeLayers(); free(st.cv); st.root = null; st.infos = null; st.cv = st.ctx = null; st.w = st.h = 0; };

  /* Lecture / pause de la rotation du globe, comme sur la carte de Travel Hub : deux boutons en pastille en bas à
     gauche du globe, et la vitesse (0,5× à 2×) qui se déplie au survol de la souris. Choix retenus d'une fois à l'autre. */
  function spinPref(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function spinOn() { return spinPref('sm.globeSpin', '1') === '1'; }
  function spinSpeed() { return parseFloat(spinPref('sm.globeSpeed', '1')) || 1; }
  function applySpin() {
    var motion = SM.app.settings.motion, base = motion === 'off' ? 0 : (motion === 'reduced' ? 0.6 : 2);
    SM.globe.spin = spinOn() ? base * spinSpeed() : 0;
  }
  function spinHTML() {
    var on = spinOn(), sp = spinSpeed(), tt = I.t();
    return '<div class="gctl"><button data-gspin="1"' + (on ? ' class="on"' : '') + ' aria-label="' + U.esc(tt.rotPlay) + '">' + IC.ui('play') + '</button>' +
      '<button data-gspin="0"' + (!on ? ' class="on"' : '') + ' aria-label="' + U.esc(tt.rotPause) + '">' + IC.ui('pause') + '</button>' +
      '<span class="gspeed"><i></i>' + [0.5, 1, 1.5, 2].map(function (v) {
        return '<button data-gspeed="' + v + '"' + (v === sp ? ' class="on"' : '') + '>' + String(v).replace('.', I.lang === 'fr' ? ',' : '.') + '×</button>';
      }).join('') + '</span></div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-gspin], [data-gspeed]');
    if (!b) return;
    try {
      if (b.hasAttribute('data-gspin')) localStorage.setItem('sm.globeSpin', b.getAttribute('data-gspin'));
      else localStorage.setItem('sm.globeSpeed', b.getAttribute('data-gspeed'));
    } catch (err) { /* rien */ }
    applySpin();
    var on = spinOn(), sp = String(spinSpeed());
    U.$$('[data-gspin]').forEach(function (x) { x.className = (x.getAttribute('data-gspin') === '1') === on ? 'on' : ''; });
    U.$$('[data-gspeed]').forEach(function (x) { x.className = x.getAttribute('data-gspeed') === sp ? 'on' : ''; });
    e.stopPropagation();
  }, true);

  /* ---------- points des lieux : couleur et clignotement (réglages de la carte et du globe) ---------- */
  var DOT_COLORS = ['temp', '#ffffff', '#ffd23f', '#ff8a3d', '#ff4d6d', '#c77dff', '#4dd2ff', '#5cf28c'];
  function dotColor() { var v = spinPref('sm.dotColor', 'temp'); return DOT_COLORS.indexOf(v) >= 0 ? v : 'temp'; }
  function dotBlink() { return spinPref('sm.dotBlink', '1') === '1'; }
  // Halo : la lueur orangée autour des lieux où il fait nuit.
  function dotHalo() { return spinPref('sm.dotHalo', '1') === '1'; }
  function dotsHTML() {
    var tt = I.t(), cur = dotColor(), on = dotBlink(), halo = dotHalo();
    return '<div class="seg mdots"><button data-dblink="' + (on ? '0' : '1') + '"' + (on ? ' class="on"' : '') + '>' + tt.dotBlink + '</button>' +
      '<button data-dhalo="' + (halo ? '0' : '1') + '"' + (halo ? ' class="on"' : '') + '>' + tt.dotHalo + '</button>' +
      '<span class="dsw">' + DOT_COLORS.map(function (c) {
        // « border-box » : le dégradé couvre aussi la bordure. Sinon il se répète sous elle, et la pastille montre un carré dans un cercle.
        var bg = c === 'temp' ? 'linear-gradient(135deg,#4dd2ff,#5cf28c 35%,#ffd23f 65%,#ff4d6d) border-box' : c;
        return '<button data-dcolor="' + c + '"' + (c === cur ? ' class="on"' : '') + ' aria-label="' + U.esc(c === 'temp' ? tt.dotTemp : c) + '" style="background:' + bg + '"></button>';
      }).join('') + '</span></div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-dcolor], [data-dblink], [data-dhalo]');
    if (!b || !st.root) return;
    try {
      if (b.hasAttribute('data-dcolor')) localStorage.setItem('sm.dotColor', b.getAttribute('data-dcolor'));
      else if (b.hasAttribute('data-dhalo')) localStorage.setItem('sm.dotHalo', b.getAttribute('data-dhalo'));
      else localStorage.setItem('sm.dotBlink', b.getAttribute('data-dblink'));
    } catch (err) { /* rien */ }
    var on = dotBlink(), cur = dotColor();
    var halo = dotHalo();
    if (st.root) st.root.className = st.root.className.replace(' noblink', '').replace(' nohalo', '') + (on ? '' : ' noblink') + (halo ? '' : ' nohalo');
    U.$$('[data-dhalo]').forEach(function (x) { x.setAttribute('data-dhalo', halo ? '0' : '1'); x.className = halo ? 'on' : ''; });
    U.$$('[data-dblink]').forEach(function (x) { x.setAttribute('data-dblink', on ? '0' : '1'); x.className = on ? 'on' : ''; });
    U.$$('[data-dcolor]').forEach(function (x) { x.className = x.getAttribute('data-dcolor') === cur ? 'on' : ''; });
    // Couleur des points : les marqueurs sont redessinés avec la nouvelle couleur.
    if (b.hasAttribute('data-dcolor') && st.root) M.refresh();
    e.stopPropagation();
  }, true);

  /* Points des lieux proportionnels à la carte : 1,2 % de sa largeur (12 points sur l'iPad), entre 6 et 14 points,
     multipliés par le réglage « Taille des points » (Réglages, de ×0,4 à ×3). Ce réglage est propre à l'appareil :
     il est rangé à part (sm.dotScale) et ne part pas dans la sauvegarde. L'anneau qui clignote et le halo de nuit
     suivent le même facteur. */
  var DOT_MIN = 0.4, DOT_MAX = 3;
  function dotScale() { var v = parseFloat(spinPref('sm.dotScale', '1')); return v >= DOT_MIN && v <= DOT_MAX ? v : 1; }
  function dotSize() {
    if (!st.box || !st.w) return;
    var k = dotScale();
    st.box.style.setProperty('--dot', Math.max(3, Math.round(U.clamp(st.w * 0.0121, 6, 14) * k)) + 'px');
    st.box.style.setProperty('--dotk', String(k));
  }
  // Clignotement, halo et couleur des points : affichés dans les Réglages, à côté de la taille (demande de Matt, 26/11).
  M.dotsHTML = dotsHTML;
  M.dotScale = dotScale;
  M.setDotScale = function (k) {
    try { localStorage.setItem('sm.dotScale', String(U.clamp(k, DOT_MIN, DOT_MAX))); } catch (e) { /* rien */ }
    dotSize();
  };

  /* Page de la carte et du globe, plein écran ou non : un appui sur un endroit vide (carte, en-tête entre les boutons,
     marges ; ni lieu, ni étiquette, ni bouton, ni carte de ville) masque tous les contrôles, l'appui suivant les remontre. Un glissement (rotation du globe) ne compte pas. Quitter la carte
     les remontre (appClass réécrit les classes de #app). */
  var tapXY = null;
  function tapStart(e) { var t = e.touches ? e.touches[0] : e; tapXY = t ? [t.clientX, t.clientY] : null; }
  document.addEventListener('touchstart', tapStart, true);
  document.addEventListener('mousedown', tapStart, true);
  document.addEventListener('click', function (e) {
    var app = document.getElementById('app'), t = e.target;
    // Page de la carte, n'importe où, sauf sur ce qui fait déjà quelque chose (bouton, lieu, étiquette, carte de ville,
    // champ, menu des options, feuille ouverte).
    if (!app || !t.closest || app.className.indexOf('mapmode') < 0 || /\bopen\b/.test((document.getElementById('sheet') || {}).className || '')) return;
    if (t.closest('button, a, input, select, textarea, label, [data-act], [data-place], .mk, .mkl, .gctl, #hbar, .sheet')) return;
    if (tapXY && Math.abs(e.clientX - tapXY[0]) + Math.abs(e.clientY - tapXY[1]) > 10) return;
    if (M.labelDragging()) return;
    var off = app.className.indexOf(' nochrome') >= 0;
    app.className = off ? app.className.replace(' nochrome', '') : app.className + ' nochrome';
    // Paysage : la carte reprend ou rend la hauteur de l'en-tête.
    M.resize();
  });

  M.labelDragging = function () { return !!(drag && drag.moved) || Date.now() - draggedAt < 400; };
  SM.map = M;
})();

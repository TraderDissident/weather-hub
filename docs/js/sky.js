/* Ciel animé : dégradé selon la hauteur du soleil, astres, étoiles, nuages, pluie, neige, éclairs, brouillard, relief. */
(function () {
  var U = SM.U;
  var H = U.hex;

  /* Couleurs [haut, milieu, horizon] selon la hauteur du soleil. Matin et soir diffèrent près de l'horizon. */
  var NIGHT = [H('#03050c'), H('#070b19'), H('#0d152c')];
  var ASTRO = [H('#050a1c'), H('#0b1430'), H('#1a2550')];
  var DAY15 = [H('#2f6fc6'), H('#6aa2e2'), H('#bcd8f2')];
  var DAY35 = [H('#2569c4'), H('#5795e0'), H('#a6cbf0')];
  var DAY90 = [H('#1d5fbf'), H('#4a8bdc'), H('#98c2ee')];
  var RISE = [
    [-90, NIGHT], [-18, NIGHT], [-12, ASTRO],
    [-6, [H('#0c1638'), H('#28316c'), H('#6d5b90')]],
    [-2, [H('#1a2e62'), H('#5a5f98'), H('#e59c95')]],
    [2, [H('#3561a5'), H('#9aa3cf'), H('#ffcf9e')]],
    [6, [H('#3d72bd'), H('#8fb3e0'), H('#f6dcc0')]],
    [15, DAY15], [35, DAY35], [90, DAY90]
  ];
  var SET = [
    [-90, NIGHT], [-18, NIGHT], [-12, ASTRO],
    [-6, [H('#0e173b'), H('#35306b'), H('#8c4a6b')]],
    [-2, [H('#1c2a5c'), H('#6e4a7c'), H('#f2834f')]],
    [2, [H('#34579a'), H('#b8788a'), H('#ffa458')]],
    [6, [H('#3b6db8'), H('#9bb0d8'), H('#f5c891')]],
    [15, DAY15], [35, DAY35], [90, DAY90]
  ];

  function interp(keys, alt) {
    for (var i = 1; i < keys.length; i++) {
      if (alt <= keys[i][0]) {
        var a = keys[i - 1], b = keys[i], t = (alt - a[0]) / (b[0] - a[0]);
        return [U.mix(a[1][0], b[1][0], t), U.mix(a[1][1], b[1][1], t), U.mix(a[1][2], b[1][2], t)];
      }
    }
    return keys[keys.length - 1][1];
  }
  function mix3(a, b, t) { return [U.mix(a[0], b[0], t), U.mix(a[1], b[1], t), U.mix(a[2], b[2], t)]; }
  function shade(c, f) { return [c[0] * f, c[1] * f, c[2] * f]; }

  var S = {
    w: 0, h: 0, motion: 'auto', paused: false,
    scene: null, light: null, brightness: 0.3,
    layerFlip: false, particles: [], kind: 'none', fps: 30
  };

  var root, starsBox, fog1, fog2, skyA, skyB, deck, sunEl, moonEl, starsCv, twinkleCv, cloudBox, hillsEl, fogEl, fxCv, fxCtx, flashEl, styleEl;
  var clouds = [];
  var loopOn = false, lastFrame = 0, frameCount = 0, fpsStart = 0, slowSince = 0, quality = 1;
  var nextFlash = 0, bolt = null;

  S.init = function (container) {
    root = container;
    root.innerHTML =
      '<div class="sky-l" id="skyA"></div><div class="sky-l" id="skyB"></div>' +
      '<div id="starsBox"><canvas id="stars"></canvas><canvas id="twinkle"></canvas></div>' +
      '<div id="sun"><div class="halo"></div><div class="disc"></div></div><div id="moonEl"></div>' +
      '<div id="deck"></div><div id="cloudBox"></div>' +
      '<div id="fog"><div class="fog1"></div><div class="fog2"></div></div>' +
      '<div id="hills"></div><canvas id="fx"></canvas><div id="flash"></div>';
    skyA = U.$('#skyA'); skyB = U.$('#skyB'); deck = U.$('#deck'); sunEl = U.$('#sun'); moonEl = U.$('#moonEl');
    starsCv = U.$('#stars'); twinkleCv = U.$('#twinkle'); cloudBox = U.$('#cloudBox'); hillsEl = U.$('#hills');
    fogEl = U.$('#fog'); starsBox = U.$('#starsBox'); fog1 = U.$('.fog1', fogEl); fog2 = U.$('.fog2', fogEl); fxCv = U.$('#fx'); fxCtx = fxCv.getContext('2d'); flashEl = U.$('#flash');
    styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    S.resize();
  };

  /* Canevas de la pluie : un pixel de canevas par point d'écran (fxScale = 1). S.setFxScale(0.5) le dessine deux fois
     moins fin (quatre fois moins de pixels à remplir et à garder), pour mesurer sur l'iPad ce que la finesse coûte
     et juger à l'œil ce qu'elle apporte. Le dessin garde les mêmes coordonnées dans les deux cas. */
  var fxScale = 1;
  function sizeFx() {
    fxCv.width = Math.round(S.w * fxScale); fxCv.height = Math.round(S.h * fxScale);
    fit(fxCv, S.w, S.h);
    fxCtx.setTransform(fxScale, 0, 0, fxScale, 0, 0);
  }
  S.setFxScale = function (k) { fxScale = U.clamp(k || 1, 0.25, 1); if (S.w) sizeFx(); return fxCv.width + 'x' + fxCv.height; };

  /* La mise en page donne la taille quand elle la connaît. Sur l'iPad (iOS 12), la largeur lue sur la page reste
     parfois celle du portrait après une rotation : la pluie, la neige et la grêle s'arrêtaient alors aux trois quarts
     de l'écran en paysage. */
  S.resize = function (hintW, hintH) {
    var w = hintW || root.clientWidth || innerWidth, h = hintH || root.clientHeight || innerHeight;
    if (w === S.w && h === S.h) return;
    S.w = w; S.h = h;
    sizeFx();
    drawStars();
    if (S.scene) { S.hillsKey = ''; buildClouds(true); S.apply(S.scene, true); }
  };

  /* Mesuré sur l'iPad : la mémoire d'une couche suit sa taille AFFICHÉE, pas celle de son canevas. Un nuage de
     320 × 160 px affiché en 580 × 290 coûtait 2,7 Mo au lieu de 0,2 ; les étoiles, 8,7 Mo chacune ; la pluie, 11 Mo.
     Chaque canevas reçoit donc une couche à sa taille exacte en pixels d'écran, et c'est la carte graphique qui
     l'agrandit jusqu'à la taille voulue. Même image à l'écran (elle était déjà agrandie), mémoire divisée. */
  function ratio() { return Math.min(window.devicePixelRatio || 1, 2); }
  function fit(cv, showW, showH) {
    var r = ratio(), w = cv.width / r, h = cv.height / r;
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    var t = 'scale3d(' + (showW / w).toFixed(5) + ',' + (showH / h).toFixed(5) + ',1)';
    cv.style.webkitTransformOrigin = cv.style.transformOrigin = '0 0';
    cv.style.webkitTransform = cv.style.transform = t;
  }

  /* ---------- étoiles ---------- */
  function drawStars() {
    var rnd = U.seeded('etoiles');
    [[starsCv, 170, 0.9], [twinkleCv, 28, 1.6]].forEach(function (spec) {
      var cv = spec[0];
      cv.width = Math.round(S.w / 2); cv.height = Math.round(S.h * 0.8 / 2);
      fit(cv, S.w, S.h * 0.8);
      var g = cv.getContext('2d');
      g.clearRect(0, 0, cv.width, cv.height);
      for (var i = 0; i < spec[1]; i++) {
        var x = rnd() * cv.width, y = Math.pow(rnd(), 1.4) * cv.height, r = (0.25 + rnd() * 0.55) * spec[2];
        g.fillStyle = 'rgba(255,' + Math.round(240 + rnd() * 15) + ',' + Math.round(220 + rnd() * 35) + ',' + (0.35 + rnd() * 0.65).toFixed(2) + ')';
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    });
  }

  /* ---------- nuages ---------- */
  function makeCloud(rnd, i) {
    var c = { im: document.createElement('img'), wrap: document.createElement('div'), puffs: [] };
    c.im.alt = ''; c.im.draggable = false;
    var n = 7 + Math.floor(rnd() * 6);
    for (var k = 0; k < n; k++) {
      var t = k / (n - 1);
      var x = 50 + t * 220 + (rnd() - 0.5) * 30;
      var arch = Math.sin(t * Math.PI);
      var r = 28 + arch * 30 + rnd() * 16;
      var y = 112 - arch * 30 - rnd() * 14;
      c.puffs.push([x, y, r]);
    }
    for (var m = 0; m < 4; m++) c.puffs.push([60 + rnd() * 200, 118 + rnd() * 10, 22 + rnd() * 12]);
    c.wrap.className = 'cloud';
    c.wrap.appendChild(c.im);
    c.seed = i;
    return c;
  }

  /* Un nuage est une image calculée point par point, plus un canevas. Mesuré sur l'iPad le 23/11 (relevé des fils
     pendant un gel) : Safari 12 fait dessiner les dégradés d'un canevas par la carte graphique, et la page attend
     qu'elle ait fini avant de pouvoir afficher ce canevas. Quand la carte graphique tarde, toute la page s'arrête :
     quelques secondes à chaque changement de teinte, parfois des dizaines de minutes. Le calcul ci-dessous donne la
     même image (formule du dégradé radial à deux cercles, mêmes paliers, même superposition) sans rien lui demander ;
     l'image est remise à Safari sous forme de PNG, qu'il affiche comme n'importe quelle image. */
  var CW = 320, CH = 160, cloudAcc = null, cloudRaw = null, cloudPng = null, crcT = null, pngAt = null;
  function u32(o, p, v) { o[p] = (v >>> 24) & 255; o[p + 1] = (v >>> 16) & 255; o[p + 2] = (v >>> 8) & 255; o[p + 3] = v & 255; }
  function crc32(o, a, b) {
    var c = -1, i;
    for (i = a; i < b; i++) c = crcT[(c ^ o[i]) & 255] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  }
  // PNG sans compression : en-têtes et découpage écrits une fois, seuls les points et les sommes de contrôle changent.
  function pngInit() {
    var n, k, i, rawLen = CH * (1 + CW * 4), blocks = Math.ceil(rawLen / 65535), zLen = 2 + blocks * 5 + rawLen + 4;
    crcT = new Int32Array(256);
    for (n = 0; n < 256; n++) { var c = n; for (k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; crcT[n] = c; }
    cloudAcc = new Float32Array(CW * CH * 4);
    cloudRaw = new Uint8Array(rawLen);
    var o = cloudPng = new Uint8Array(8 + 25 + 12 + zLen + 12), p = 0, sig = [137, 80, 78, 71, 13, 10, 26, 10], tag = function (t) { for (var j = 0; j < 4; j++) o[p++] = t.charCodeAt(j); };
    for (i = 0; i < 8; i++) o[p++] = sig[i];
    u32(o, p, 13); p += 4; tag('IHDR'); u32(o, p, CW); u32(o, p + 4, CH); o[p + 8] = 8; o[p + 9] = 6; p += 13;
    u32(o, p, crc32(o, p - 17, p)); p += 4;
    u32(o, p, zLen); p += 4;
    pngAt = { idat: p, data: [] };
    tag('IDAT'); o[p++] = 0x78; o[p++] = 0x01;
    for (i = 0; i < blocks; i++) {
      var len = Math.min(65535, rawLen - i * 65535);
      o[p++] = i === blocks - 1 ? 1 : 0; o[p++] = len & 255; o[p++] = len >>> 8; o[p++] = ~len & 255; o[p++] = (~len >>> 8) & 255;
      pngAt.data.push([p, i * 65535, i * 65535 + len]); p += len;
    }
    pngAt.adler = p; p += 4; pngAt.crc = p; p += 4;
    u32(o, p, 0); p += 4; tag('IEND'); u32(o, p, crc32(o, p - 4, p));
  }
  function paintCloud(c, light, shadeC, alpha) {
    if (!cloudPng) pngInit();
    var acc = cloudAcc, raw = cloudRaw, n4 = CW * CH * 4, i, k, x, y;
    for (k = 0; k < n4; k++) acc[k] = 0;
    var a0 = +(0.9 * alpha).toFixed(3), a1 = +(0.6 * alpha).toFixed(3);
    for (i = 0; i < c.puffs.length; i++) {
      var p = c.puffs[i], cx = p[0], cy = p[1], r = p[2];
      var col = U.mix(light, shadeC, U.clamp((cy - 50) / 90, 0, 1));
      var cr = Math.round(col[0]), cg = Math.round(col[1]), cb = Math.round(col[2]);
      // Dégradé du cercle (cx, cy - 0,2 r, 0,15 r) au cercle (cx, cy, r), limité au disque (cx, cy, r).
      var y0 = cy - r * 0.2, r0 = r * 0.15, cdy = r * 0.2, dr = r * 0.85, qa = dr * dr - cdy * cdy, rr = r * r;
      var xa = Math.max(0, Math.floor(cx - r)), xb = Math.min(CW - 1, Math.ceil(cx + r));
      var ya = Math.max(0, Math.floor(cy - r)), yb = Math.min(CH - 1, Math.ceil(cy + r));
      for (y = ya; y <= yb; y++) {
        var dy = y + 0.5 - y0, dyc = y + 0.5 - cy, qb = dy * cdy + r0 * dr, row = y * CW * 4;
        for (x = xa; x <= xb; x++) {
          var dx = x + 0.5 - cx, d2 = dx * dx;
          if (d2 + dyc * dyc >= rr) continue;
          var qc = d2 + dy * dy - r0 * r0, t = qc <= 0 ? 0 : (Math.sqrt(qb * qb + qa * qc) - qb) / qa;
          if (t >= 1) continue;
          if (t < 0) t = 0;
          var sa = t <= 0.55 ? a0 + (a1 - a0) * t / 0.55 : a1 * (1 - t) / 0.45, inv = 1 - sa;
          k = row + x * 4;
          acc[k] = cr * sa + acc[k] * inv; acc[k + 1] = cg * sa + acc[k + 1] * inv; acc[k + 2] = cb * sa + acc[k + 2] * inv; acc[k + 3] = sa + acc[k + 3] * inv;
        }
      }
    }
    // Points en RGBA non prémultiplié, un octet de filtre (0) en tête de chaque ligne.
    var q = 0;
    for (y = 0, k = 0; y < CH; y++) {
      raw[q++] = 0;
      for (x = 0; x < CW; x++, k += 4, q += 4) {
        var a = acc[k + 3];
        if (a > 0) { raw[q] = acc[k] / a + 0.5; raw[q + 1] = acc[k + 1] / a + 0.5; raw[q + 2] = acc[k + 2] / a + 0.5; raw[q + 3] = a * 255 + 0.5; }
        else { raw[q] = 0; raw[q + 1] = 0; raw[q + 2] = 0; raw[q + 3] = 0; }
      }
    }
    var o = cloudPng, s1 = 1, s2 = 0, len = raw.length;
    for (i = 0; i < pngAt.data.length; i++) o.set(raw.subarray(pngAt.data[i][1], pngAt.data[i][2]), pngAt.data[i][0]);
    for (i = 0; i < len;) { var end = Math.min(len, i + 5552); for (; i < end; i++) { s1 += raw[i]; s2 += s1; } s1 %= 65521; s2 %= 65521; }
    u32(o, pngAt.adler, ((s2 << 16) | s1) >>> 0);
    u32(o, pngAt.crc, crc32(o, pngAt.idat, pngAt.adler + 4));
    var url = URL.createObjectURL(new Blob([o], { type: 'image/png' })), old = c.url;
    c.url = url;
    c.im.onload = c.im.onerror = function () { if (old) URL.revokeObjectURL(old); };
    c.im.src = url;
  }

  /* Les 13 nuages possibles sont créés une seule fois par taille d'écran : image, largeur, trajet (une règle
     d'animation chacun). Changer de lieu ou de vent ne recrée plus rien : ni image, ni feuille de style (dont la
     réécriture faisait recalculer le style de toute la page). */
  var MAX_CLOUDS = 13;
  function ensurePool() {
    var key = S.w + '|' + S.h;
    if (key === S.poolKey) return;
    S.poolKey = key;
    // Les images des nuages précédents sont rendues tout de suite.
    clouds.forEach(function (c) { c.im.onload = c.im.onerror = null; if (c.url) URL.revokeObjectURL(c.url); });
    cloudBox.innerHTML = '';
    clouds = [];
    var rnd = U.seeded('nuages'), css = '';
    for (var i = 0; i < MAX_CLOUDS; i++) {
      var c = makeCloud(rnd, i);
      c.cw = Math.round(S.w * (0.32 + rnd() * 0.3)); c.ch = Math.round(c.cw / 2);
      c.dist = S.w + c.cw;
      c.durK = 0.8 + rnd() * 0.5;
      var bw = 320 / ratio(), bh = 160 / ratio(), k = (c.cw / bw).toFixed(4);
      c.wrap.style.width = bw + 'px'; c.wrap.style.height = bh + 'px'; c.wrap.style.left = (-c.cw) + 'px';
      c.wrap.style.opacity = (0.75 + rnd() * 0.25).toFixed(2);
      c.wrap.style.display = 'none';
      css += '@-webkit-keyframes cd' + i + '{from{-webkit-transform:translate3d(0,0,0) scale(' + k + ')}to{-webkit-transform:translate3d(' + c.dist + 'px,0,0) scale(' + k + ')}}' +
        '@keyframes cd' + i + '{from{transform:translate3d(0,0,0) scale(' + k + ')}to{transform:translate3d(' + c.dist + 'px,0,0) scale(' + k + ')}}';
      cloudBox.appendChild(c.wrap);
      clouds.push(c);
    }
    styleEl.textContent = css;
  }

  /* Combien de nuages, à quelle hauteur, à quelle vitesse et dans quel sens : réglé sur les nuages existants. */
  function buildClouds(force) {
    var sc = S.scene;
    if (!sc) return;
    var cover = sc.cover / 100;
    var want = Math.round(U.clamp(cover * 12 + (cover > 0.05 ? 1 : 0), 0, MAX_CLOUDS) * (quality < 1 ? 0.6 : 1));
    if (S.motion === 'off') want = Math.min(want, 5);
    var dirSign = sc.driftSign;
    var speed = 6 + Math.min(sc.wind || 0, 80) * 0.45;
    var key = want + '|' + dirSign + '|' + Math.round(speed) + '|' + S.w + '|' + S.h + '|' + S.motion;
    if (!force && key === S.cloudKey) return;
    S.cloudKey = key;
    SM.diag.note('clouds ' + want);
    ensurePool();
    // Hauteur et décalage propres à chaque lieu, pour que le ciel ne soit pas le même partout.
    var rnd = U.seeded('nuages' + (sc.placeName || ''));
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i], top = Math.round(S.h * (0.02 + rnd() * 0.42) - c.ch * 0.3), delay = rnd();
      /* Nuage en trop : caché et arrêté, mais laissé dans l'affichage. Le retirer (display) détruisait sa couche, et
         la remettre la recréait : mesuré sur l'iPad, 250 à 400 ms de plus à chaque passage d'un ciel nuageux à un ciel clair. */
      if (i >= want) {
        if (c.shown !== false) { c.shown = false; c.wrap.style.visibility = 'hidden'; c.wrap.style.webkitAnimationPlayState = c.wrap.style.animationPlayState = 'paused'; c.play = 'paused'; }
        continue;
      }
      var dur = Math.round(c.dist / speed * c.durK);
      var anim = 'cd' + i + ' ' + dur + 's linear ' + (-delay * dur).toFixed(1) + 's infinite' + (dirSign < 0 ? ' reverse' : '');
      c.wrap.style.top = top + 'px';
      if (c.anim !== anim) { c.anim = anim; c.wrap.style.webkitAnimation = anim; c.wrap.style.animation = anim; }
      var play = S.motion === 'off' ? 'paused' : 'running';
      if (c.play !== play) { c.play = play; c.wrap.style.webkitAnimationPlayState = play; c.wrap.style.animationPlayState = play; }
      if (c.wrap.style.display) c.wrap.style.display = '';
      if (c.shown !== true) { c.shown = true; c.wrap.style.visibility = ''; }
    }
    S.cloudCount = want;
  }

  /* Une couche invisible reste une couche que l'iPad compose à chaque image (et qu'il anime, pour le brouillard et
     les étoiles) : dès que son fondu de sortie est fini, on la retire de l'affichage. Elle revient avant de reparaître. */
  function layer(el, opacity, instant) {
    var on = opacity > 0.004;
    clearTimeout(el._hideT);
    if (on) {
      if (el.style.display === 'none') { el.style.display = ''; void el.offsetWidth; SM.diag.note('+' + el.id); }
      el.style.opacity = opacity.toFixed(3);
      return;
    }
    el.style.opacity = '0';
    if (el.style.display === 'none') return;
    if (instant) { el.style.display = 'none'; SM.diag.note('-' + el.id); }
    else {
      SM.diag.note('fade-' + el.id);
      el._hideT = setTimeout(function () { var l = SM.diag.step('hide ' + el.id); el.style.display = 'none'; SM.diag.done(l); }, 3300);
    }
  }
  // Couleur arrondie par pas de 4 : au crépuscule, la teinte des nuages ne se repeint plus à chaque changement infime.
  function q4(c) { return [Math.round(c[0] / 4) * 4, Math.round(c[1] / 4) * 4, Math.round(c[2] / 4) * 4]; }

  /* ---------- relief ---------- */
  function hillPath(rnd, base, amp, rough) {
    var ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
    var f = [1 + rnd() * 1.5, 2.5 + rnd() * 2, 5 + rnd() * 4, 11 + rnd() * 6];
    var d = 'M0 300', N = 60;
    for (var i = 0; i <= N; i++) {
      var x = i / N;
      var y = base - amp * (0.55 * Math.sin(x * f[0] * 3.14 + ph[0]) + 0.3 * Math.sin(x * f[1] * 3.14 + ph[1]) +
        rough * 0.12 * Math.sin(x * f[2] * 3.14 + ph[2]) + rough * 0.05 * Math.sin(x * f[3] * 3.14 + ph[3]));
      d += 'L' + (x * 1000).toFixed(1) + ' ' + y.toFixed(1);
    }
    return d + 'L1000 300Z';
  }

  function buildHills(sc, cols, daylight) {
    var key = (sc.placeName || '') + '|' + cols.map(function (c) { return U.rgb(c); }).join() + '|' + sc.snowGround;
    if (key === S.hillsKey) return;
    S.hillsKey = key;
    SM.diag.note('hills');
    var rnd = U.seeded('relief' + (sc.placeName || ''));
    var low = cols[2];
    var nightBase = H('#05070d');
    var dayBase = sc.snowGround ? H('#d9e2ec') : H('#1f2f2b');
    var base = U.mix(nightBase, dayBase, daylight);
    var far = U.mix(low, base, sc.snowGround ? 0.35 : 0.3);
    var mid = U.mix(low, base, sc.snowGround ? 0.55 : 0.6);
    var near = U.mix(low, base, sc.snowGround ? 0.75 : 0.88);
    if (sc.snowGround) { mid = shade(mid, 0.95); near = shade(near, 0.92); }
    hillsEl.innerHTML =
      '<svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="' + hillPath(rnd, 150, 60, 1) + '" fill="' + U.rgb(far) + '"/>' +
      '<path d="' + hillPath(rnd, 205, 45, 1.4) + '" fill="' + U.rgb(mid) + '"/>' +
      '<path d="' + hillPath(rnd, 255, 30, 2) + '" fill="' + U.rgb(near) + '"/></svg>';
  }

  /* ---------- particules ---------- */
  function setParticles(kind, level) {
    var counts = { drizzle: [0, 90, 130, 170], rain: [0, 120, 190, 250], snow: [0, 70, 110, 150], hail: [0, 70, 110, 140] };
    var n = kind === 'none' ? 0 : Math.round((counts[kind] || [0, 0, 0, 0])[level] * quality * (S.motion === 'reduced' ? 0.5 : 1));
    if (S.motion === 'off') n = 0;
    var arr = S.particles;
    if ((n ? kind : 'none') !== S.kind || n !== arr.length) SM.diag.note('fx ' + S.kind + ' ' + arr.length + '>' + (n ? kind : 'none') + ' ' + n);
    S.kind = n ? kind : 'none';
    while (arr.length < n) arr.push({ x: Math.random() * S.w, y: Math.random() * S.h, z: 0.4 + Math.random() * 0.6, p: Math.random() * 6.28 });
    arr.length = n;
    // Sans pluie ni neige, le canevas plein écran sort de l'affichage : une couche de moins à composer.
    var need = (n || S.storm) ? '' : 'none';
    if (fxCv.style.display !== need) { fxCv.style.display = need; SM.diag.note(need ? '-fx' : '+fx'); }
    if ((n || S.storm) && !loopOn && !S.paused) { loopOn = true; lastFrame = 0; fpsStart = 0; frameCount = 0; U.raf(frame); SM.diag.note('fx loop on'); }
    if (!n && !S.storm) fxCtx.clearRect(0, 0, S.w, S.h);
  }

  /* Pendant qu'un nouvel écran se construit, la pluie garde son image : la page est de toute façon occupée, et
     chaque image de pluie retarderait d'autant l'arrivée de l'écran. Elle reprend dès que l'écran entre. */
  var holdUntil = 0;
  S.hold = function (ms) { holdUntil = ms ? Date.now() + ms : 0; };

  function frame(ts) {
    if (S.paused || (S.kind === 'none' && !S.storm && !bolt)) { var le = SM.diag.step('fx loop off'); loopOn = false; fxCtx.clearRect(0, 0, S.w, S.h); SM.diag.done(le); return; }
    U.raf(frame);
    if (holdUntil && Date.now() < holdUntil) { lastFrame = 0; fpsStart = 0; return; }
    if (lastFrame && ts - lastFrame < 31) return;
    var gap = lastFrame ? ts - lastFrame : 0;
    var dt = lastFrame ? Math.min(gap, 80) / 33.3 : 1;
    lastFrame = ts;
    // Un trou de plus de 400 ms veut dire onglet en arrière-plan ou écran en veille, pas lenteur : on repart à zéro.
    if (!fpsStart || gap > 400) { fpsStart = ts; frameCount = 0; }
    frameCount++;
    if (ts - fpsStart > 2000) {
      S.fps = Math.round(frameCount * 1000 / (ts - fpsStart));
      SM.diag.fps = S.fps;
      frameCount = 0; fpsStart = ts;
      if (S.fps < 20 && S.fps > 4 && S.motion === 'auto') {
        if (!slowSince) slowSince = ts;
        if (ts - slowSince > 10000 && quality > 0.3) {
          quality = quality > 0.6 ? 0.5 : 0.3;
          slowSince = 0;
          SM.diag.warn('animation slow (' + S.fps + ' fps), quality ' + quality);
          if (S.scene) { buildClouds(true); S.apply(S.scene, true); }
        }
      } else slowSince = 0;
    }
    var g = fxCtx, w = S.w, h = S.h, arr = S.particles, wind = S.windPx || 0, i, p;
    var lf = SM.diag.step('fx frame');
    g.clearRect(0, 0, w, h);
    if (S.kind === 'rain' || S.kind === 'drizzle') {
      var len = S.kind === 'rain' ? 20 : 9, sp = S.kind === 'rain' ? 17 : 8;
      g.strokeStyle = S.dropColor; g.lineWidth = S.kind === 'rain' ? 1.6 : 1.2;
      g.beginPath();
      for (i = 0; i < arr.length; i++) {
        p = arr[i];
        p.y += sp * p.z * dt; p.x += wind * p.z * dt;
        if (p.y > h) { p.y = -20; p.x = Math.random() * (w + 200) - 100; }
        if (p.x > w + 50) p.x -= w + 100; else if (p.x < -50) p.x += w + 100;
        g.moveTo(p.x, p.y);
        g.lineTo(p.x - wind * len / sp, p.y - len * p.z);
      }
      g.stroke();
    } else if (S.kind === 'snow' || S.kind === 'hail') {
      var hail = S.kind === 'hail';
      g.fillStyle = hail ? 'rgba(235,245,255,0.85)' : 'rgba(255,255,255,0.85)';
      for (i = 0; i < arr.length; i++) {
        p = arr[i];
        p.p += 0.03 * dt;
        p.y += (hail ? 11 : 1.3) * p.z * dt;
        p.x += (wind * (hail ? 0.6 : 0.5) + (hail ? 0 : Math.sin(p.p) * 0.6)) * dt;
        if (p.y > h) { p.y = -6; p.x = Math.random() * w; }
        if (p.x > w + 10) p.x -= w + 20; else if (p.x < -10) p.x += w + 20;
        g.beginPath(); g.arc(p.x, p.y, (hail ? 1.6 : 1.5) + p.z * (hail ? 1.2 : 2.6), 0, 6.283); g.fill();
      }
    }
    if (S.storm) lightning(ts, g);
    SM.diag.done(lf);
  }

  function lightning(ts, g) {
    if (!nextFlash) nextFlash = ts + 3000 + Math.random() * 6000;
    if (ts > nextFlash) {
      nextFlash = ts + 5000 + Math.random() * 11000;
      flashEl.className = '';
      void flashEl.offsetWidth;
      flashEl.className = 'on';
      if (Math.random() < 0.7) {
        var x = S.w * (0.15 + Math.random() * 0.7), y = 0, pts = [[x, y]];
        while (y < S.h * 0.55) { y += 18 + Math.random() * 30; x += (Math.random() - 0.5) * 50; pts.push([x, y]); }
        bolt = { pts: pts, until: ts + 220 };
      }
    }
    if (bolt) {
      if (ts > bolt.until) { bolt = null; return; }
      g.strokeStyle = 'rgba(240,240,255,0.9)'; g.lineWidth = 2.2; g.shadowColor = '#b9c8ff'; g.shadowBlur = 12;
      g.beginPath(); g.moveTo(bolt.pts[0][0], bolt.pts[0][1]);
      for (var i = 1; i < bolt.pts.length; i++) g.lineTo(bolt.pts[i][0], bolt.pts[i][1]);
      g.stroke(); g.shadowBlur = 0;
    }
  }

  /* ---------- placement des astres ---------- */
  function screenPos(az, alt, lat) {
    var facing = lat >= 0 ? 180 : 0;
    var rel = ((az - facing + 540) % 360) - 180;
    var horizon = S.h * 0.74;
    return { x: S.w * (0.5 + rel / 90 * 0.4), y: horizon - U.clamp(alt / 55, -0.2, 1) * (horizon - S.h * 0.1) };
  }

  /* Couleurs du ciel [haut, milieu, horizon] pour une hauteur de soleil et un temps donnés. */
  function weatherColors(alt, rising, info, cover, daylight) {
    var cols = interp(rising ? RISE : SET, alt);
    // Le temps grise, assombrit ou délave le ciel.
    var kind = info.kind, lvl = info.level;
    var gray = mix3([H('#0a0d14'), H('#11151e'), H('#1a1f2a')], [H('#6f7b8c'), H('#8d97a5'), H('#a9b1bc')], daylight);
    var amt = cover * 0.62 + (kind === 'rain' || kind === 'drizzle' ? 0.12 + lvl * 0.05 : 0);
    if (kind === 'storm' || kind === 'hail') {
      gray = mix3([H('#07080d'), H('#0e1018'), H('#171a24')], [H('#2b2e3b'), H('#3d4050'), H('#545668')], daylight); amt = 0.92;
    } else if (kind === 'fog') {
      gray = mix3([H('#14171e'), H('#1b1f27'), H('#262a33')], [H('#aab1ba'), H('#bfc5cc'), H('#cfd3d8')], daylight); amt = 0.85;
    } else if (kind === 'snow') {
      gray = mix3([H('#10141d'), H('#1a1f2b'), H('#272d3a')], [H('#aeb8c6'), H('#c6cdd8'), H('#dde2e9')], daylight); amt = 0.8;
    }
    amt = U.clamp(amt, 0, 0.92);
    return { cols: mix3(cols, gray, amt), gray: gray };
  }

  /* Pour les cartes de villes : ciel d'un lieu à un instant, sans rien dessiner. */
  S.colorsFor = function (lat, lon, ms, code, coverPct) {
    var sun = SM.astro.sun(ms, lat, lon), later = SM.astro.sun(ms + 600000, lat, lon);
    var info = SM.codes.scene(U.has(code) ? code : 2);
    var cover = U.clamp((U.has(coverPct) ? coverPct : info.cover) / 100, 0, 1);
    var daylight = U.clamp((sun.alt + 8) / 18, 0, 1);
    var wc = weatherColors(sun.alt, later.alt > sun.alt, info, cover, daylight);
    return { cols: wc.cols, alt: sun.alt, rising: later.alt > sun.alt, daylight: daylight,
      brightness: U.clamp(U.luma(wc.cols[1]) * 0.6 + U.luma(wc.cols[2]) * 0.4, 0, 1) };
  };

  /* ---------- scène ---------- */
  /*
   sc = { lat, lon, ms, code, cover, rate, wind, windDir, placeName, instant }
  */
  /* staged : le ciel change par morceaux, une tâche chacun (fond ; soleil, lune, étoiles, voile ; nuages ;
     brouillard, relief, pluie), à 120 ms d'intervalle et jamais pendant un geste. Mesuré sur l'iPad : d'un bloc,
     passer d'un ciel de nuit à un ciel de jour occupait la page 500 ms. Le résultat final est le même. */
  var stageT = 0, stageSeq = 0;
  function stages(list, seq) {
    if (!list.length || seq !== stageSeq) return;
    if (S.busy && S.busy()) { stageT = setTimeout(function () { stages(list, seq); }, 150); return; }
    var l = SM.diag.step('sky part ' + (4 - list.length) + '/3');
    list.shift()();
    SM.diag.done(l);
    if (list.length) stageT = setTimeout(function () { stages(list, seq); }, 120);
  }
  S.apply = function (sc, instant, staged) {
    clearTimeout(stageT);
    var seq = ++stageSeq, lsky = SM.diag.step('sky');
    S.scene = sc;
    var sun = SM.astro.sun(sc.ms, sc.lat, sc.lon);
    var later = SM.astro.sun(sc.ms + 600000, sc.lat, sc.lon);
    var rising = later.alt > sun.alt;
    var moon = SM.astro.moon(sc.ms, sc.lat, sc.lon);
    var phase = SM.astro.moonPhase(sc.ms);
    var info = SM.codes.scene(sc.code);
    var cover = U.clamp((U.has(sc.cover) ? sc.cover : info.cover) / 100, 0, 1);
    var alt = sun.alt;
    var daylight = U.clamp((alt + 8) / 18, 0, 1);
    var night = U.clamp((-alt - 4) / 10, 0, 1);

    var wc = weatherColors(alt, rising, info, cover, daylight);
    var cols = wc.cols, gray = wc.gray, kind = info.kind, lvl = info.level;
    S.light = cols;
    S.brightness = U.clamp(U.luma(cols[1]) * 0.6 + U.luma(cols[2]) * 0.4, 0, 1);

    var sp = screenPos(sun.az, alt, sc.lat);
    // Lueur de l'aube ou du crépuscule, du côté du soleil.
    var glowA = U.clamp(1 - Math.abs(alt + 1) / 11, 0, 1) * (1 - cover * 0.65) * 0.75;
    var glowC = rising ? H('#ffb6a0') : H('#ff9a52');
    var gx = U.clamp(sp.x / S.w * 100, -20, 120).toFixed(1);
    var bg = 'radial-gradient(70% 55% at ' + gx + '% 78%, ' + U.rgb(glowC, glowA.toFixed(3)) + ' 0%, ' + U.rgb(glowC, 0) + ' 100%), ' +
      'linear-gradient(to bottom, ' + U.rgb(cols[0]) + ' 0%, ' + U.rgb(cols[1]) + ' 52%, ' + U.rgb(cols[2]) + ' 80%)';
    // Même ciel qu'à la dernière fois (la nuit, pendant des heures) : ni repeinte ni fondu de 3 s pour rien.
    if (bg !== S.bgKey) {
      S.bgKey = bg;
      SM.diag.note(instant ? 'background' : 'background fade 3 s');
      var showLayer = S.layerFlip ? skyA : skyB, hideLayer = S.layerFlip ? skyB : skyA;
      var dur = instant ? '0s' : '3s';
      showLayer.style.webkitTransitionDuration = showLayer.style.transitionDuration = dur;
      hideLayer.style.webkitTransitionDuration = hideLayer.style.transitionDuration = dur;
      showLayer.style.backgroundImage = bg;
      showLayer.style.opacity = '1';
      hideLayer.style.opacity = '0';
      S.layerFlip = !S.layerFlip;
    }

    var partA = function () {
    // Soleil
    var sunVis = alt > -3 ? U.clamp((alt + 3) / 4, 0, 1) * (1 - cover * 0.85) * (kind === 'fog' ? 0.3 : 1) : 0;
    var warm = U.clamp(1 - alt / 12, 0, 1);
    layer(sunEl, sunVis, instant);
    sunEl.style.webkitTransform = sunEl.style.transform = 'translate3d(' + sp.x.toFixed(0) + 'px,' + sp.y.toFixed(0) + 'px,0)';
    sunEl.className = warm > 0.5 ? 'warm' : '';

    // Lune
    var mp = screenPos(moon.az, moon.alt, sc.lat);
    var moonVis = moon.alt > -2 ? (0.25 + night * 0.75) * (1 - cover * 0.95) * U.clamp((moon.alt + 2) / 4, 0, 1) : 0;
    if (alt > 5) moonVis *= 0.5;
    var phKey = Math.round(phase.phase * 100) + (sc.lat < 0 ? 's' : 'n');
    if (S.moonKey !== phKey) { S.moonKey = phKey; SM.diag.note('moon shape'); moonEl.innerHTML = SM.icons.moonPhase(phase, sc.lat < 0, 64, true); }
    layer(moonEl, moonVis, instant);
    moonEl.style.webkitTransform = moonEl.style.transform = 'translate3d(' + mp.x.toFixed(0) + 'px,' + mp.y.toFixed(0) + 'px,0)';

    // Étoiles
    var starA = night * (1 - cover * 0.9) * (kind === 'fog' ? 0.2 : 1);
    layer(starsBox, starA, true);

    // Voile nuageux en haut de l'écran quand le ciel est couvert.
    var deckC = mix3(gray, cols, 0.25)[0];
    var deckBg = 'linear-gradient(to bottom, ' + U.rgb(deckC, 0.95) + ' 0%, ' + U.rgb(deckC, 0.6) + ' 35%, ' + U.rgb(deckC, 0) + ' 75%)';
    if (deckBg !== S.deckKey) { S.deckKey = deckBg; deck.style.backgroundImage = deckBg; SM.diag.note('deck colour'); }
    var deckA = U.clamp((cover - 0.55) / 0.45, 0, 1);
    layer(deck, deckA, instant);
    /* Couleur de la première ligne de pixels sous la barre d'état du téléphone (app.js, barColor) : haut du dégradé
       du ciel, recouvert par le voile nuageux (opacité 0,95 en haut, fois celle de la couche). Mesuré sur 64 scènes
       (8 moments × 8 temps) : écart de 0 à 2 sur 255 avec le rendu. */
    S.top = U.mix(cols[0], deckC, 0.95 * deckA);
    if (SM.app && SM.app.barColor) SM.app.barColor();
    };

    var partB = function () {
    // Nuages : nombre, sens et teinte.
    var toward = ((sc.windDir || 270) + 180) % 360;
    var facing = sc.lat >= 0 ? 180 : 0;
    var relT = ((toward - facing + 540) % 360) - 180;
    sc.driftSign = relT >= 0 ? 1 : -1;
    S.windPx = U.clamp(Math.sin(relT * Math.PI / 180) * (sc.wind || 0) / 12, -6, 6);
    buildClouds(false);
    var golden = U.clamp(1 - Math.abs(alt - 1) / 9, 0, 1) * (1 - cover * 0.5);
    var light = U.mix(H('#3a4258'), H('#ffffff'), daylight);
    var shd = U.mix(H('#161b28'), H('#b9c3d2'), daylight);
    light = U.mix(light, rising ? H('#ffe0d6') : H('#ffe1bf'), golden * 0.7);
    shd = U.mix(shd, rising ? H('#c98aa6') : H('#e0805e'), golden * 0.8);
    if (kind === 'rain' || kind === 'drizzle') { light = shade(light, 0.82); shd = shade(shd, 0.7); }
    if (kind === 'snow') { light = shade(light, 0.95); shd = shade(shd, 0.85); }
    if (kind === 'storm' || kind === 'hail') { light = shade(light, 0.55); shd = shade(shd, 0.4); }
    // Seuls les nuages montrés sont peints, et seulement quand leur teinte change.
    light = q4(light); shd = q4(shd);
    var ca = 0.55 + cover * 0.4;
    var paintKey = U.rgb(light) + U.rgb(shd) + ca.toFixed(2);
    // Un nuage jamais peint l'est tout de suite ; un simple changement de teinte attend la fin du changement de lieu,
    // puis se fait un nuage à la fois, pour ne jamais occuper la page d'un bloc.
    var pending = [], painted = 0;
    for (var i = 0; i < (S.cloudCount || 0) && i < clouds.length; i++) {
      var cl = clouds[i];
      if (cl.paintKey === paintKey) continue;
      if (instant || !cl.paintKey) { cl.paintKey = paintKey; paintCloud(cl, light, shd, ca); painted++; } else pending.push(cl);
    }
    if (painted || pending.length) SM.diag.note('cloud paint ' + painted + ' now ' + pending.length + ' later');
    clearTimeout(S.paintT);
    if (pending.length) {
      var paintNext = function () {
        if (!pending.length) return;
        // Un changement de lieu est en cours : la teinte attend (voir busy() dans app.js).
        if (S.busy && S.busy()) { S.paintT = setTimeout(paintNext, 300); return; }
        var c2 = pending.shift(), lc = SM.diag.step('cloud paint');
        c2.paintKey = paintKey; paintCloud(c2, light, shd, ca);
        SM.diag.done(lc);
        S.paintT = setTimeout(paintNext, 60);
      };
      S.paintT = setTimeout(paintNext, 1100);
    }
    };

    var partC = function () {
    // Brouillard
    var fogA = kind === 'fog' ? 0.55 + lvl * 0.15 : (kind === 'drizzle' ? 0.15 : 0);
    if (fogA > 0) {
      var fc = q4(U.mix(H('#3a404c'), H('#e8ecf0'), daylight)), fogKey = U.rgb(fc);
      if (fogKey !== S.fogKey) {
        S.fogKey = fogKey;
        SM.diag.note('fog colour');
        fog1.style.backgroundImage = 'radial-gradient(50% 50% at 50% 60%, ' + U.rgb(fc, 0.85) + ' 0%, ' + U.rgb(fc, 0) + ' 100%)';
        fog2.style.backgroundImage = 'radial-gradient(45% 50% at 50% 55%, ' + U.rgb(fc, 0.7) + ' 0%, ' + U.rgb(fc, 0) + ' 100%)';
      }
    }
    layer(fogEl, fogA, instant);

    // Relief
    sc.snowGround = kind === 'snow';
    buildHills(sc, cols, daylight);

    // Précipitations
    var pk = 'none', pl = 0;
    if (kind === 'rain' || kind === 'drizzle' || kind === 'snow' || kind === 'hail') { pk = kind; pl = lvl; }
    if (kind === 'storm') { pk = 'rain'; pl = 3; }
    if (sc.rate > 0 && pk === 'none' && cover > 0.5) { pk = sc.cold ? 'snow' : 'rain'; pl = sc.rate > 4 ? 3 : sc.rate > 1 ? 2 : 1; }
    S.dropColor = U.rgb(U.mix(H('#9fb0cc'), H('#eef4fb'), daylight), (0.5 + daylight * 0.25).toFixed(2));
    S.storm = (kind === 'storm' || kind === 'hail') && S.motion !== 'off';
    setParticles(pk, pl);
    };

    if (staged && !instant) stages([partA, partB, partC], seq);
    else { partA(); partB(); partC(); }

    root.className = S.motion === 'off' ? 'still' : '';
    SM.diag.done(lsky);
    return { sunAlt: alt, rising: rising, brightness: S.brightness, daylight: daylight, cols: cols };
  };

  S.setMotion = function (m) { S.motion = m; S.cloudKey = ''; if (S.scene) { buildClouds(true); S.apply(S.scene, true); } };
  S.pause = function (p) {
    S.paused = p;
    if (!p && S.scene) S.apply(S.scene, true);
  };
  S.quality = function () { return quality; };

  SM.sky = S;
})();

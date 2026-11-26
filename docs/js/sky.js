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
    layerFlip: false, kind: 'none', fps: 0
  };

  var root, starsBox, fog1, fog2, skyA, skyB, deck, sunEl, moonEl, starsIm, twinkleIm, cloudBox, hillsEl, fogEl, fxEl, fxStyle, boltEl, flashEl, styleEl;
  var clouds = [];
  var quality = 1;

  /* Plus aucun canevas dans le ciel. Relevé des fils de l'iPad pendant un gel (23/11) : Safari 12 fait dessiner un
     canevas par la carte graphique, et pour l'afficher la page attend qu'elle ait fini ; quand elle tarde, toute la
     page s'arrête. Les nuages étaient les premiers retirés (1.32.4) ; les gels n'arrivaient plus ensuite que sous la
     pluie, dernier canevas redessiné trente fois par seconde (24/11 : 20 gels sous la bruine, aucun par temps sec).
     Étoiles : deux images calculées. Pluie, neige, grêle : un petit élément par goutte, animé par la carte graphique
     seule, sans que la page ait rien à dessiner ni à attendre. Éclair : un tracé vectoriel. */
  S.init = function (container) {
    root = container;
    root.innerHTML =
      '<div class="sky-l" id="skyA"></div><div class="sky-l" id="skyB"></div>' +
      '<div id="starsBox"><img id="stars" alt=""><img id="twinkle" alt=""></div>' +
      '<div id="sun"><div class="halo"></div><div class="disc"></div></div><div id="moonEl"></div>' +
      '<div id="deck"></div><div id="cloudBox"></div>' +
      '<div id="fog"><div class="fog1"></div><div class="fog2"></div></div>' +
      '<div id="hills"></div><div id="fx"></div><div id="bolt"></div><div id="flash"></div>';
    skyA = U.$('#skyA'); skyB = U.$('#skyB'); deck = U.$('#deck'); sunEl = U.$('#sun'); moonEl = U.$('#moonEl');
    starsIm = U.$('#stars'); twinkleIm = U.$('#twinkle'); cloudBox = U.$('#cloudBox'); hillsEl = U.$('#hills');
    fogEl = U.$('#fog'); starsBox = U.$('#starsBox'); fog1 = U.$('.fog1', fogEl); fog2 = U.$('.fog2', fogEl); fxEl = U.$('#fx'); boltEl = U.$('#bolt'); flashEl = U.$('#flash');
    fxEl.style.display = 'none'; boltEl.style.display = 'none'; flashEl.style.display = 'none';
    styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    // Trajets des gouttes : une feuille à part, pour que sa réécriture ne relance pas les nuages.
    fxStyle = document.createElement('style');
    document.head.appendChild(fxStyle);
    // Clignotement des étoiles : un trajet par niveau de transparence, écrit une seule fois (voir twinkle()).
    var twStyle = document.createElement('style'), tw = '';
    for (var n = 1; n <= TW; n++) tw += both('tw' + n, 'from{opacity:' + (0.15 * n / TW).toFixed(4) + '}to{opacity:' + (n / TW).toFixed(4) + '}');
    twStyle.textContent = tw;
    document.head.appendChild(twStyle);
    S.resize();
  };

  /* La mise en page donne la taille quand elle la connaît. Sur l'iPad (iOS 12), la largeur lue sur la page reste
     parfois celle du portrait après une rotation : la pluie, la neige et la grêle s'arrêtaient alors aux trois quarts
     de l'écran en paysage. */
  S.resize = function (hintW, hintH) {
    var w = hintW || root.clientWidth || innerWidth, h = hintH || root.clientHeight || innerHeight;
    if (w === S.w && h === S.h) return;
    S.w = w; S.h = h;
    drawStars();
    if (S.scene) { S.hillsKey = ''; buildClouds(true); S.apply(S.scene, true); }
  };

  /* Mesuré sur l'iPad : la mémoire d'une couche suit sa taille AFFICHÉE, pas celle de son canevas. Un nuage de
     320 × 160 px affiché en 580 × 290 coûtait 2,7 Mo au lieu de 0,2 ; les étoiles, 8,7 Mo chacune ; la pluie, 11 Mo.
     Chaque canevas reçoit donc une couche à sa taille exacte en pixels d'écran, et c'est la carte graphique qui
     l'agrandit jusqu'à la taille voulue. Même image à l'écran (elle était déjà agrandie), mémoire divisée. */
  function ratio() { return Math.min(window.devicePixelRatio || 1, 2); }
  // « pw × ph » : taille de l'image en points d'image ; « showW × showH » : taille voulue à l'écran.
  function fit(el, pw, ph, showW, showH) {
    var r = ratio(), w = pw / r, h = ph / r;
    el.style.width = w + 'px'; el.style.height = h + 'px';
    var t = 'scale3d(' + (showW / w).toFixed(5) + ',' + (showH / h).toFixed(5) + ',1)';
    el.style.webkitTransformOrigin = el.style.transformOrigin = '0 0';
    el.style.webkitTransform = el.style.transform = t;
  }

  /* ---------- étoiles ---------- */
  /* Mêmes étoiles qu'avec les canevas (mêmes tirages, dans le même ordre) : chaque disque est calculé point par
     point, sa bordure adoucie sur 5 × 5 sous-points, puis l'image est remise à Safari en PNG. */
  function drawStars() {
    var rnd = U.seeded('etoiles');
    [[starsIm, 170, 0.9], [twinkleIm, 28, 1.6]].forEach(function (spec) {
      var im = spec[0], w = Math.max(1, Math.round(S.w / 2)), h = Math.max(1, Math.round(S.h * 0.8 / 2));
      var acc = new Float32Array(w * h * 4), i, x, y, k, u, v;
      for (i = 0; i < spec[1]; i++) {
        var cx = rnd() * w, cy = Math.pow(rnd(), 1.4) * h, r = (0.25 + rnd() * 0.55) * spec[2];
        var cg = Math.round(240 + rnd() * 15), cb = Math.round(220 + rnd() * 35), al = +(0.35 + rnd() * 0.65).toFixed(2), rr = r * r;
        var xa = Math.max(0, Math.floor(cx - r)), xb = Math.min(w - 1, Math.floor(cx + r));
        var ya = Math.max(0, Math.floor(cy - r)), yb = Math.min(h - 1, Math.floor(cy + r));
        for (y = ya; y <= yb; y++) {
          for (x = xa; x <= xb; x++) {
            var hit = 0;
            for (v = 0; v < 5; v++) for (u = 0; u < 5; u++) {
              var dx = x + (u + 0.5) / 5 - cx, dy = y + (v + 0.5) / 5 - cy;
              if (dx * dx + dy * dy < rr) hit++;
            }
            if (!hit) continue;
            var sa = al * hit / 25, inv = 1 - sa;
            k = (y * w + x) * 4;
            acc[k] = 255 * sa + acc[k] * inv; acc[k + 1] = cg * sa + acc[k + 1] * inv; acc[k + 2] = cb * sa + acc[k + 2] * inv; acc[k + 3] = sa + acc[k + 3] * inv;
          }
        }
      }
      var raw = new Uint8Array(h * (1 + w * 4)), q = 0;
      for (y = 0, k = 0; y < h; y++) {
        raw[q++] = 0;
        for (x = 0; x < w; x++, k += 4, q += 4) {
          var a = acc[k + 3];
          if (a > 0) { raw[q] = acc[k] / a + 0.5; raw[q + 1] = acc[k + 1] / a + 0.5; raw[q + 2] = acc[k + 2] / a + 0.5; raw[q + 3] = a * 255 + 0.5; }
        }
      }
      var old = im._url;
      im._url = pngURL(w, h, raw);
      im.onload = im.onerror = function () { if (old) URL.revokeObjectURL(old); };
      im.src = im._url;
      fit(im, w, h, S.w, S.h * 0.8);
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
  // PNG sans compression d'une image RGBA quelconque (étoiles) ; « raw » porte déjà l'octet de filtre de chaque ligne.
  function pngURL(w, h, raw) {
    if (!crcT) pngInit();
    var rawLen = raw.length, blocks = Math.ceil(rawLen / 65535), zLen = 2 + blocks * 5 + rawLen + 4;
    var o = new Uint8Array(8 + 25 + 12 + zLen + 12), p = 0, i, sig = [137, 80, 78, 71, 13, 10, 26, 10];
    var tag = function (t) { for (var j = 0; j < 4; j++) o[p++] = t.charCodeAt(j); };
    for (i = 0; i < 8; i++) o[p++] = sig[i];
    u32(o, p, 13); p += 4; tag('IHDR'); u32(o, p, w); u32(o, p + 4, h); o[p + 8] = 8; o[p + 9] = 6; p += 13;
    u32(o, p, crc32(o, p - 17, p)); p += 4;
    u32(o, p, zLen); p += 4;
    var idat = p;
    tag('IDAT'); o[p++] = 0x78; o[p++] = 0x01;
    for (i = 0; i < blocks; i++) {
      var len = Math.min(65535, rawLen - i * 65535);
      o[p++] = i === blocks - 1 ? 1 : 0; o[p++] = len & 255; o[p++] = len >>> 8; o[p++] = ~len & 255; o[p++] = (~len >>> 8) & 255;
      o.set(raw.subarray(i * 65535, i * 65535 + len), p); p += len;
    }
    var s1 = 1, s2 = 0;
    for (i = 0; i < rawLen;) { var end = Math.min(rawLen, i + 5552); for (; i < end; i++) { s1 += raw[i]; s2 += s1; } s1 %= 65521; s2 %= 65521; }
    u32(o, p, ((s2 << 16) | s1) >>> 0); p += 4;
    u32(o, p, crc32(o, idat, p)); p += 4;
    u32(o, p, 0); p += 4; tag('IEND'); u32(o, p, crc32(o, p - 4, p));
    return URL.createObjectURL(new Blob([o], { type: 'image/png' }));
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
  /* parts : la transparence est portée par ces enfants et non par le calque. Un calque transparent qui contient
     plusieurs couches animées oblige la carte graphique à les composer à part à chaque image, puis à fondre le
     résultat : une passe plein écran de plus, en continu. Chaque enfant fondu seul n'en demande aucune. */
  function layer(el, opacity, instant, parts) {
    var on = opacity > 0.004;
    var set = function (v) { if (!parts) { el.style.opacity = v; return; } for (var i = 0; i < parts.length; i++) parts[i].style.opacity = v; };
    clearTimeout(el._hideT);
    if (on) {
      if (el.style.display === 'none') { el.style.display = ''; void el.offsetWidth; SM.diag.note('+' + el.id); }
      set(opacity.toFixed(3));
      return;
    }
    set('0');
    if (el.style.display === 'none') return;
    if (instant) { el.style.display = 'none'; SM.diag.note('-' + el.id); }
    else {
      SM.diag.note('fade-' + el.id);
      el._hideT = setTimeout(function () { var l = SM.diag.step('hide ' + el.id); el.style.display = 'none'; SM.diag.done(l); }, 3300);
    }
  }
  /* Étoiles : même règle que la brume, la transparence est sur chacune des deux images et plus sur le calque qui les
     contient (les deux images n'ont aucun point commun : le résultat est le même). L'image qui clignote porte déjà
     une animation d'opacité, de 0,15 à 1 ; son trajet est donc choisi parmi TW niveaux, de 0,15 × a à a, par pas de
     0,5 %. Changer de niveau garde le moment du clignotement (délai négatif). Sans animation : opacité fixe. */
  var TW = 200, twKey = '', twT0 = Date.now();
  function twinkle(a) {
    var still = S.motion === 'off', n = Math.max(1, Math.min(TW, Math.round(a * TW)));
    var key = still ? 'still' + a.toFixed(3) : 'tw' + n;
    if (key === twKey) return;
    twKey = key;
    var an = still ? 'none' : 'tw' + n + ' 3.2s ease-in-out ' + (-((Date.now() - twT0) % 6400) / 1000).toFixed(2) + 's infinite alternate';
    twinkleIm.style.opacity = a.toFixed(3);
    twinkleIm.style.webkitAnimation = twinkleIm.style.animation = an;
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
  /* Pluie, bruine, neige et grêle sans canevas. Chaque goutte est un petit élément (un trait ou un disque vectoriel,
     peint une seule fois) que la carte graphique déplace seule le long d'un trajet CSS : la page n'a plus rien à
     dessiner à chaque image, ni à attendre. Mêmes mesures qu'avec le canevas : nombre, longueur, épaisseur, couleur,
     vitesse selon la profondeur (z de 0,4 à 1), pente selon le vent, balancement des flocons, et un point d'image
     par point d'écran (l'élément est peint à taille réduite puis agrandi, comme l'était le canevas).
     Pluie : le vent incline tout le calque #fx ; la goutte y tombe droit, donc suit la pente voulue à l'écran.
     Neige, grêle : le vent fait dériver tout le calque, en boucle sur une largeur d'écran (deux jeux identiques). */
  var COUNTS = { drizzle: [0, 90, 130, 170], rain: [0, 120, 190, 250], snow: [0, 70, 110, 150], hail: [0, 70, 110, 140] };
  var FX = {
    rain: { sp: 17, len: 20, lw: 1.6 }, drizzle: { sp: 8, len: 9, lw: 1.2 },
    snow: { v: 1.3, drift: 0.5, r0: 1.5, r1: 2.6, col: 'rgba(255,255,255,0.85)', sway: true },
    hail: { v: 11, drift: 0.6, r0: 1.6, r1: 1.2, col: 'rgba(235,245,255,0.85)', sway: false }
  };
  // JIT : écart au plus entre deux chutes d'une même goutte ; LEGS chutes par tour ; SETS trajets ; BW : boîte d'une goutte.
  var JIT = 120, LEGS = 3, SETS = 4, BW = 14, GROUPS = 12;
  var fxKey = '', fxList = [], fxQueue = [], fxT = 0, fxN = 0, fxSlope = null, fxTint = '', fxDrift = null, fxSets = null;

  function tr(x, y) { return 'translate3d(' + x + 'px,' + y.toFixed(1) + 'px,0) scale(' + ratio() + ')'; }
  function both(name, body) { return '@-webkit-keyframes ' + name + '{' + body.replace(/transform:/g, '-webkit-transform:') + '}@keyframes ' + name + '{' + body + '}'; }

  /* Les gouttes possibles, tirées une fois par temps et par taille d'écran. Le niveau de pluie et le vent ne font
     qu'en ajouter ou en retirer aux marges : celles qui tombent déjà ne bougent pas. */
  function fxBuild(kind) {
    var P = FX[kind], rnd = U.seeded('particules ' + kind), css = '', i, g, j;
    clearTimeout(fxT); fxT = 0; fxQueue = []; fxList = []; fxEl.innerHTML = ''; fxSlope = null; fxTint = ''; fxDrift = null; fxSets = null;
    fxEl.style.webkitTransitionDuration = fxEl.style.transitionDuration = '0s';
    fxEl.style.webkitTransform = fxEl.style.transform = 'none';
    if (P.sp) {
      /* Pluie : LEGS chutes par tour, chacune dans une colonne décalée, comme la goutte qui renaissait ailleurs.
         Entre deux chutes, la goutte passe par un détour hors de l'écran, loin à droite. */
      var bh = P.len + 3, y0 = -20 - (bh - 1.5), y1 = S.h + P.len + 2 - (bh - 1.5), far = 3 * (S.w + S.h);
      for (g = 0; g < SETS; g++) {
        var offs = [], body = '';
        for (j = 0; j < LEGS; j++) offs.push(Math.round((rnd() * 2 - 1) * JIT));
        for (j = 0; j < LEGS; j++) {
          var a = j / LEGS * 100, b = (j + 1) / LEGS * 100, o = offs[j], o2 = offs[(j + 1) % LEGS];
          body += a.toFixed(4) + '%{transform:' + tr(o, y0) + '}' + (b - 0.003).toFixed(4) + '%{transform:' + tr(o, y1) + '}' +
            (b - 0.002).toFixed(4) + '%{transform:' + tr(o + far, y1) + '}' + (b - 0.001).toFixed(4) + '%{transform:' + tr(o2 + far, y0) + '}';
        }
        css += both('pf' + g, body + '100%{transform:' + tr(offs[0], y0) + '}');
      }
      // Même densité qu'avant (n gouttes sur la largeur de l'écran plus 200), sur la largeur que le vent le plus fort demande.
      var tmax = 6 / P.sp, xa = -10 - JIT - tmax * S.h, xb = S.w + 10 + JIT + tmax * S.h;
      // (la goutte passe un peu plus de temps hors de l'écran qu'avant, en bas : le nombre le compense)
      var count = Math.round(COUNTS[kind][3] * (xb - xa) / (S.w + 200) * (S.h + P.len + 22) / (S.h + 20));
      for (i = 0; i < count; i++) fxList.push({ x: xa + rnd() * (xb - xa), z: 0.4 + rnd() * 0.6, r: rnd(), g: Math.floor(rnd() * SETS), ph: rnd(), el: null, el2: null, line: null, q: false, t: 0, tint: '' });
    } else {
      var W20 = S.w + 20, html = '<div class="drift">';
      css += both('ps', 'from{transform:' + tr(0, -11) + '}to{transform:' + tr(0, S.h + 1) + '}') +
        both('pdr', 'from{transform:translate3d(0,0,0)}to{transform:translate3d(' + W20 + 'px,0,0)}') +
        both('pdl', 'from{transform:translate3d(0,0,0)}to{transform:translate3d(' + (-W20) + 'px,0,0)}') +
        both('psway', 'from{transform:translate3d(-20px,0,0)}to{transform:translate3d(20px,0,0)}');
      for (i = 0; i < COUNTS[kind][3]; i++) fxList.push({ x: -10 + rnd() * W20, z: 0.4 + rnd() * 0.6, r: rnd(), g: Math.floor(rnd() * GROUPS), ph: rnd(), el: null, el2: null, line: null, q: false });
      // Balancement des flocons : ±20 points en 7 s, par groupes décalés (la neige d'avant : 0,6 point par image, phase propre).
      for (j = 0; j < 2; j++) {
        html += '<div class="set">';
        for (g = 0; g < GROUPS; g++) {
          var sw = 'psway 3.49s cubic-bezier(.37,0,.63,1) ' + (-(g / GROUPS) * 6.98).toFixed(2) + 's infinite alternate';
          html += '<div class="sw"' + (P.sway ? ' style="-webkit-animation:' + sw + ';animation:' + sw + '"' : '') + '></div>';
        }
        html += '</div>';
      }
      fxEl.innerHTML = html + '</div>';
      fxSets = [fxEl.firstChild.firstChild.children, fxEl.firstChild.lastChild.children];
    }
    fxStyle.textContent = css;
  }

  function fxDrop(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }
  function wetMake(c, P) {
    var bh = P.len + 3, t = +fxSlope, r = ratio(), dur = LEGS * (S.h + P.len + 22) / (P.sp * c.z * 30), d = document.createElement('div');
    var an = 'pf' + c.g + ' ' + dur.toFixed(3) + 's linear ' + (-c.ph * dur).toFixed(3) + 's infinite';
    d.className = 'p';
    d.style.cssText = 'left:' + (c.x - BW / 2).toFixed(1) + 'px;width:' + BW / r + 'px;height:' + bh / r + 'px;-webkit-animation:' + an + ';animation:' + an;
    d.innerHTML = '<svg viewBox="0 0 ' + BW + ' ' + bh + '"><line x1="' + BW / 2 + '" y1="' + (bh - 1.5) + '" x2="' + (BW / 2 - t * P.len * (1 - c.z)).toFixed(2) +
      '" y2="' + (bh - 1.5 - P.len * c.z).toFixed(2) + '" stroke="' + fxTint + '" stroke-width="' + P.lw + '"/></svg>';
    fxEl.appendChild(d);
    c.el = d; c.line = d.firstChild.firstChild; c.t = t; c.tint = fxTint;
  }
  // Retouche d'une goutte en place : inclinaison du trait et teinte du moment.
  function wetTouch(c, P) {
    var t = +fxSlope;
    if (c.t !== t) { c.t = t; c.line.setAttribute('x2', (BW / 2 - t * P.len * (1 - c.z)).toFixed(2)); }
    if (c.tint !== fxTint) { c.tint = fxTint; c.line.setAttribute('stroke', fxTint); }
  }
  function dryMake(c, P) {
    var r = ratio(), dur = (S.h + 12) / (P.v * 30 * c.z), an = 'ps ' + dur.toFixed(2) + 's linear ' + (-c.ph * dur).toFixed(2) + 's infinite';
    var css = 'left:' + (c.x - 5).toFixed(1) + 'px;width:' + 10 / r + 'px;height:' + 10 / r + 'px;-webkit-animation:' + an + ';animation:' + an;
    var svg = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="' + (P.r0 + c.z * P.r1).toFixed(2) + '" fill="' + P.col + '"/></svg>';
    // Les deux jeux naissent ensemble : leurs chutes restent ainsi au même point, et la boucle de la dérive ne se voit pas.
    for (var k = 0; k < 2; k++) {
      var d = document.createElement('div');
      d.className = 'p'; d.style.cssText = css; d.innerHTML = svg;
      fxSets[k][c.g].appendChild(d);
      if (k) c.el2 = d; else c.el = d;
    }
  }
  // Les gouttes sont créées, et retouchées, par paquets, pour ne jamais occuper la page d'un bloc.
  function fxPump() {
    if (fxT || !fxQueue.length) return;
    var P = FX[S.kind], n = 0, c;
    if (!P) { fxQueue = []; return; }
    while (fxQueue.length && n < 60) {
      c = fxQueue.shift();
      if (!c.q) continue;
      c.q = false;
      if (c.el) { if (P.sp) wetTouch(c, P); }
      else if (P.sp) wetMake(c, P); else dryMake(c, P);
      n++;
    }
    if (fxQueue.length) fxT = setTimeout(function () { fxT = 0; var l = SM.diag.step('fx build'); fxPump(); SM.diag.done(l); }, 40);
  }
  function fxSync(n) {
    var kind = S.kind, P = FX[kind], i, c;
    fxN = n;
    if (!n || !P) {
      if (fxKey) { fxKey = ''; clearTimeout(fxT); fxT = 0; fxQueue = []; fxList = []; fxSets = null; fxEl.innerHTML = ''; }
      return;
    }
    var key = kind + '|' + S.w + '|' + S.h + '|' + ratio();
    if (key !== fxKey) { fxKey = key; fxBuild(kind); }
    var f = n / COUNTS[kind][3], wind = S.windPx || 0;
    if (P.sp) {
      var t = wind / P.sp, slope = t.toFixed(4), ts = +slope, tint = S.dropColor;
      var lo = -10 - JIT - Math.max(0, t) * S.h, hi = S.w + 10 + JIT + Math.max(0, -t) * S.h;
      if (slope !== fxSlope) {
        // Premier réglage : tout de suite. Ensuite, le vent tourne en 3 s, sans à-coup.
        fxEl.style.webkitTransitionDuration = fxEl.style.transitionDuration = fxSlope === null ? '0s' : '3s';
        fxEl.style.webkitTransform = fxEl.style.transform = 'matrix(1,0,' + slope + ',1,0,0)';
      }
      fxSlope = slope; fxTint = tint;
      for (i = 0; i < fxList.length; i++) {
        c = fxList[i];
        if (!(c.r < f && c.x >= lo && c.x <= hi)) { c.q = false; if (c.el) { fxDrop(c.el); c.el = c.line = null; } continue; }
        /* Goutte déjà là : son trait n'est retouché que si sa teinte change ou si sa pointe se déplace d'au moins un
           quart de point (la pente de la chute, elle, est donnée tout de suite et exactement par #fx). Avant, le
           moindre écart de vent faisait retoucher toutes les gouttes dans la même tâche. Retouches et créations
           passent par la même file, par paquets (fxPump). */
        if (c.el && c.tint === tint && Math.abs(ts - c.t) * P.len * (1 - c.z) < 0.25) continue;
        if (!c.q) { c.q = true; fxQueue.push(c); }
      }
    } else {
      // Dérive : wind × 0,5 (neige) ou 0,6 (grêle) point par image, la même pour tous ; en dessous d'un point par seconde, rien.
      var v = P.drift * wind * 30, W20 = S.w + 20, box = fxEl.firstChild;
      var drift = Math.abs(v) < 1 ? '' : (v > 0 ? 'pdr ' : 'pdl ') + Math.max(1, Math.round(W20 / Math.abs(v))) + 's linear infinite';
      if (drift !== fxDrift) {
        fxDrift = drift;
        box.style.webkitAnimation = box.style.animation = drift || 'none';
        box.lastChild.style.left = (v > 0 ? -W20 : W20) + 'px';
      }
      for (i = 0; i < fxList.length; i++) {
        c = fxList[i];
        if (!(c.r < f)) { c.q = false; if (c.el) { fxDrop(c.el); fxDrop(c.el2); c.el = c.el2 = null; } continue; }
        if (!c.el && !c.q) { c.q = true; fxQueue.push(c); }
      }
    }
    fxPump();
  }

  function setParticles(kind, level) {
    var n = kind === 'none' ? 0 : Math.round((COUNTS[kind] || [0, 0, 0, 0])[level] * quality * (S.motion === 'reduced' ? 0.5 : 1));
    if (S.motion === 'off') n = 0;
    var k = n ? kind : 'none';
    if (k !== S.kind || n !== fxN) SM.diag.note('fx ' + S.kind + ' ' + fxN + '>' + k + ' ' + n);
    S.kind = k;
    // Sans pluie ni neige, le calque sort de l'affichage.
    var need = n ? '' : 'none';
    if (fxEl.style.display !== need) { fxEl.style.display = need; SM.diag.note(need ? '-fx' : '+fx'); }
    fxSync(n);
    stormLoop(S.storm && !S.paused);
  }

  // La pluie ne dépend plus de la page : plus rien à suspendre pendant qu'un écran se construit.
  S.hold = function () {};

  /* ---------- éclairs ---------- */
  var flashT = 0, boltT = 0, flashOffT = 0;
  function stormLoop(on) {
    if (!on) {
      clearTimeout(flashT); flashT = 0;
      // Hors orage, le calque de l'éclair (tout l'écran, invisible) sort de l'affichage, le dernier éclair éteint (0,8 s).
      if (flashEl.style.display !== 'none' && !flashOffT) {
        flashOffT = setTimeout(function () { var l = SM.diag.step('hide flash'); flashOffT = 0; flashEl.style.display = 'none'; flashEl.className = ''; SM.diag.done(l); }, 900);
      }
      return;
    }
    clearTimeout(flashOffT); flashOffT = 0;
    if (flashEl.style.display === 'none') { flashEl.style.display = ''; SM.diag.note('+flash'); }
    if (flashT) return;
    var go = function () { flash(); flashT = setTimeout(go, 5000 + Math.random() * 11000); };
    flashT = setTimeout(go, 3000 + Math.random() * 6000);
  }
  function flash() {
    if (document.hidden) return;
    var l = SM.diag.step('flash'), r = ratio();
    flashEl.className = '';
    void flashEl.offsetWidth;
    flashEl.className = 'on';
    if (Math.random() < 0.7) {
      var x = S.w * (0.15 + Math.random() * 0.7), y = 0, pts = x.toFixed(1) + ',0', xa = x, xb = x;
      while (y < S.h * 0.55) {
        y += 18 + Math.random() * 30; x += (Math.random() - 0.5) * 50; pts += ' ' + x.toFixed(1) + ',' + y.toFixed(1);
        if (x < xa) xa = x; if (x > xb) xb = x;
      }
      /* Même trait qu'avant (2,2 points, lueur de 12), peint à taille réduite puis agrandi comme l'était le canevas.
         Le cadre n'est plus tout l'écran mais l'éclair et sa lueur (24 points de marge, la lueur s'éteint à 18) : la
         lueur se calcule sur une surface plusieurs fois plus petite. Cadre en points entiers : le trait tombe sur
         les mêmes points d'image qu'avant. */
      var M = 24, x0 = Math.floor(xa) - M, bw = Math.ceil(xb) + M - x0, bh = Math.ceil(y) + 2 * M;
      var glow = 'drop-shadow(0 0 ' + 6 / r + 'px #b9c8ff)', sc = 'translate3d(' + x0 + 'px,' + (-M) + 'px,0) scale(' + r + ')';
      boltEl.innerHTML = '<svg viewBox="' + x0 + ' ' + (-M) + ' ' + bw + ' ' + bh + '" style="width:' + bw / r + 'px;height:' + bh / r + 'px;-webkit-transform:' + sc + ';transform:' + sc +
        ';-webkit-filter:' + glow + ';filter:' + glow + '"><polyline points="' + pts + '" fill="none" stroke="rgba(240,240,255,0.9)" stroke-width="2.2"/></svg>';
      boltEl.style.display = '';
      clearTimeout(boltT);
      boltT = setTimeout(function () { boltEl.style.display = 'none'; boltEl.innerHTML = ''; }, 220);
    }
    SM.diag.done(l);
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
    layer(starsBox, starA, true, [starsIm]);
    if (starA > 0.004) twinkle(starA);

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
    layer(fogEl, fogA, instant, [fog1, fog2]);

    // Relief
    sc.snowGround = kind === 'snow';
    buildHills(sc, cols, daylight);

    // Précipitations
    var pk = 'none', pl = 0;
    if (kind === 'rain' || kind === 'drizzle' || kind === 'snow' || kind === 'hail') { pk = kind; pl = lvl; }
    if (kind === 'storm') { pk = 'rain'; pl = 3; }
    if (sc.rate > 0 && pk === 'none' && cover > 0.5) { pk = sc.cold ? 'snow' : 'rain'; pl = sc.rate > 4 ? 3 : sc.rate > 1 ? 2 : 1; }
    // Par seizièmes de jour : au crépuscule, les gouttes ne sont pas repeintes à chaque retouche infime de leur teinte.
    var dq = Math.round(daylight * 16) / 16;
    S.dropColor = U.rgb(U.mix(H('#9fb0cc'), H('#eef4fb'), dq), (0.5 + dq * 0.25).toFixed(2));
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
    if (p) stormLoop(false);
    if (!p && S.scene) S.apply(S.scene, true);
  };
  S.quality = function () { return quality; };

  SM.sky = S;
})();

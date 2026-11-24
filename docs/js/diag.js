/* Journal de l'app, lisible et copiable depuis l'écran Diagnostic. Chargé en premier.
   Gardé 7 jours dans l'iPad (4 000 lignes au plus). Chaque ligne : date, heure à la seconde, niveau, message.
   Niveaux : · information, ! avertissement, ✕ erreur. */
(function () {
  var KEY = 'sm.log2';
  var KEEP_MS = 7 * 24 * 3600 * 1000, MAX = 4000;
  var rows = [];   // [temps en ms, niveau, message]
  try { rows = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { rows = []; }
  try { localStorage.removeItem('sm.log'); } catch (e) { /* ancien journal */ }

  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function stamp(t) {
    var d = new Date(t);
    return p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
  }
  function prune() {
    var limit = Date.now() - KEEP_MS, i = 0;
    while (i < rows.length && rows[i][0] < limit) i++;
    if (i) rows = rows.slice(i);
    if (rows.length > MAX) rows = rows.slice(rows.length - MAX);
  }
  var saveT = 0;
  function saveNow() {
    var l = step('log save');
    clearTimeout(saveT); saveT = 0;
    prune();
    try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) {
      // Stockage plein : on garde la moitié la plus récente.
      rows = rows.slice(Math.floor(rows.length / 2));
      try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e2) { /* bloqué */ }
    }
    done(l);
  }
  // Avertissements et erreurs écrits tout de suite ; les informations, groupées (2 s), pour ménager l'iPad.
  function log(level, msg) {
    rows.push([Date.now(), level, String(msg).slice(0, 400)]);
    if (level === '·') { if (!saveT) saveT = setTimeout(saveNow, 2000); } else saveNow();
  }

  /* Repère d'étape. iOS n'écrit rien dans son journal pendant un gel : pour savoir sur quoi la page s'arrête, chaque
     étape qui suit une mise à jour (ciel, rendu, nuages, pluie, enregistrements) note en mémoire son début, sa fin
     et ce qu'elle a changé. Rien n'est écrit dans l'iPad tant que tout va bien. Après un gel, la ligne « steps »
     du journal donne les dernières étapes avant l'arrêt, celle qui était en cours s'il y en avait une, et les
     premières à la reprise. Lecture d'une étape : « nom ×fois durée @-délai entre sa fin et l'arrêt [changements] ». */
  var steps = [], open = [], STEPS = 60;
  function step(name) {
    var now = Date.now(), l = steps[steps.length - 1];
    if (open.length > 8) open = [];
    // Même étape répétée de près (images de pluie, nuages repeints un à un) : une seule entrée, comptée.
    if (l && l.n === name && l.e && !l.d && now - l.e < 1000) { l.s = now; l.e = 0; l.k++; }
    else {
      l = { n: name, t: now, s: now, e: 0, k: 1, d: '', ms: 0 };
      steps.push(l);
      if (steps.length > STEPS) steps.shift();
    }
    open.push(l);
    return l;
  }
  function done(l, detail) {
    var now = Date.now(), i = open.lastIndexOf(l);
    if (i >= 0) open.splice(i, 1);
    l.ms += now - l.s; l.e = now;
    if (detail) note(detail, l);
  }
  // Ce que l'étape en cours a changé à l'écran (couche montrée ou retirée, fond, nuages, pluie).
  function note(txt, l) {
    l = l || open[open.length - 1];
    if (l && l.d.length < 200) l.d += (l.d ? ', ' : '') + txt;
  }
  function ms3(t) {
    var m = new Date(t).getMilliseconds();
    return stamp(t).slice(6) + '.' + (m < 100 ? '0' : '') + (m < 10 ? '0' : '') + m;
  }
  /* L'arrêt est le plus long silence entre deux signes de vie depuis la dernière seconde battue (« from »). */
  function trail(from, now) {
    var pts = [from, now], i, l;
    for (i = 0; i < steps.length; i++) { l = steps[i]; pts.push(l.t, l.s); if (l.e) pts.push(l.e); }
    pts.sort(function (a, b) { return a - b; });
    var stop = from, back = now, best = -1, sign = 'second tick';
    for (i = 1; i < pts.length; i++) {
      if (pts[i - 1] >= from && pts[i] <= now && pts[i] - pts[i - 1] > best) { best = pts[i] - pts[i - 1]; stop = pts[i - 1]; back = pts[i]; }
    }
    var show = function (x) { return x.n + (x.k > 1 ? ' ×' + x.k : '') + (x.d ? ' [' + x.d + ']' : ''); };
    var before = [], inside = [], after = [];
    for (i = 0; i < steps.length; i++) {
      l = steps[i];
      if (l.t === stop || l.s === stop || l.e === stop) sign = l.n;
      if (l.t >= back) after.push(show(l) + ' @+' + (l.t - back));
      else if (l.e && l.e <= stop) { if (stop - l.e < 15000) before.push(show(l) + ' ' + l.ms + 'ms @-' + (stop - l.e)); }
      else if (l.e) inside.push(show(l) + ' began @-' + (stop - l.s));
      else before.push(show(l) + ' NOT FINISHED @-' + (stop - l.s));
    }
    return 'steps · last sign of life ' + ms3(stop) + ' (' + sign + ') · back ' + ms3(back) +
      ' · before: ' + (before.slice(-12).join(' > ') || 'none in 15 s') +
      (inside.length ? ' · STOPPED INSIDE: ' + inside.join(' > ') : '') +
      ' · then: ' + (after.slice(0, 4).join(' > ') || 'this check first');
  }
  function line(r) { return stamp(r[0]) + ' ' + r[1] + ' ' + r[2]; }

  SM.diag = {
    info: function (m) { log('·', m); },
    warn: function (m) { log('!', m); },
    error: function (m) { log('✕', m); },
    lines: function () { return rows.map(line); },
    count: function () { return rows.length; },
    days: 7,
    clear: function () { rows = []; saveNow(); },
    errors: function () { return rows.filter(function (r) { return r[1] === '✕'; }).length; },
    flush: saveNow,
    // Texte complet à copier : l'état de l'appareil, puis le journal du plus récent au plus ancien.
    report: function () {
      var a = SM.app, head = [
        'Station Météo ' + SM.VERSION + ' · ' + stamp(Date.now()),
        navigator.userAgent,
        'screen ' + screen.width + '×' + screen.height + ' · window ' + innerWidth + '×' + innerHeight + ' · ×' + (window.devicePixelRatio || 1) +
          ' · standalone ' + (navigator.standalone ? 'yes' : 'no') + ' · ' + (navigator.onLine ? 'online' : 'offline'),
        'up ' + Math.round((Date.now() - SM.diag.started) / 60000) + ' min · fps ' + SM.diag.fps +
          ' · last request ' + (SM.diag.lastFetch || '–'),
        paintStats(),
        a ? 'mode ' + a.mode + ' · place ' + ((a.places[a.idx] || {}).id || '') + ' · places ' + a.places.length + ' · settings ' + JSON.stringify(a.settings) : '',
        rows.length + ' lines · ' + SM.diag.days + ' days kept',
        ''
      ];
      return head.concat(rows.map(line).reverse()).join('\n');
    },
    fps: 0,
    lastFetch: '',
    started: Date.now(),
    // Repère d'étape (voir plus haut) : début, fin, étape sans durée, changement noté, fonction entourée.
    step: step,
    done: done,
    note: note,
    beat: function (name) { done(step(name)); },
    wrap: function (name, fn) {
      return function () { var l = step(name); try { return fn.apply(this, arguments); } finally { done(l); } };
    },
    trail: trail
  };

  window.addEventListener('error', function (e) {
    SM.diag.error((e.message || 'error') + ' @ ' + (e.filename || '').split('/').pop() + ':' + (e.lineno || 0));
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    SM.diag.error('promise: ' + (r && r.message ? r.message : r));
  });
  SM.diag.info('start ' + SM.VERSION + ' · ' + innerWidth + '×' + innerHeight + ' · ' + (navigator.standalone ? 'home screen' : 'browser') + ' · ' + (navigator.onLine ? 'online' : 'offline'));

  /* Boîte noire : toutes les 30 s, l'app note qu'elle vit encore (heure, écran affiché, dernière météo reçue). Au
     démarrage suivant, si la dernière note date de plus de 2 min sans fermeture propre, le journal dit à quelle
     heure l'app s'est arrêtée et ce qu'elle affichait. */
  var AKEY = 'sm.alive';
  function context() {
    var app = SM.app, ctx = '';
    try {
      if (app) {
        ctx = app.mode === 'map' ? 'map ' + (localStorage.getItem('sm.mapView') || 'map') + (app.mapFull ? ' full' : '') : 'place ' + ((app.places[app.idx] || {}).id || '');
        ctx += app.sheet ? ' · sheet ' + app.sheet : '';
      }
    } catch (e) { /* rien */ }
    return ctx + ' · fps ' + SM.diag.fps + ' · ' + paintStats();
  }
  // Ce qui pèse à l'écran : éléments, canevas et leur surface totale, couches du ciel et nuages montrés.
  function paintStats() {
    var cvs = document.getElementsByTagName('canvas'), px = 0, i, shown = 0, clouds = 0;
    for (i = 0; i < cvs.length; i++) px += cvs[i].width * cvs[i].height;
    var sky = document.getElementById('sky'), box = document.getElementById('cloudBox');
    if (sky) for (i = 0; i < sky.children.length; i++) if (sky.children[i].style.display !== 'none') shown++;
    if (box) for (i = 0; i < box.children.length; i++) if (box.children[i].style.display !== 'none') clouds++;
    return 'dom ' + document.getElementsByTagName('*').length + ' · canvas ' + cvs.length + ' (' + (px / 1e6).toFixed(2) + ' Mpx) · sky layers ' + shown + ' · clouds ' + clouds;
  }
  try {
    var prev = JSON.parse(localStorage.getItem(AKEY) || 'null');
    if (prev && !prev.bye && Date.now() - prev.t > 120000) {
      SM.diag.error('previous run stopped answering at ' + stamp(prev.t) + ' · v' + prev.v + ' · ' + prev.ctx + ' · up ' + Math.round(prev.up / 60) + ' min');
    }
  } catch (e) { /* rien */ }
  function alive(bye) {
    var l = step('alive note');
    try { localStorage.setItem(AKEY, JSON.stringify({ t: Date.now(), v: SM.VERSION, ctx: context(), up: (Date.now() - SM.diag.started) / 1000, bye: !!bye })); } catch (e) { /* rien */ }
    done(l);
  }
  setInterval(function () { if (!document.hidden) alive(false); }, 30000);

  /* Gel : une minuterie d'une seconde qui revient avec plus de 6 s de retard, alors que la page est à l'écran,
     veut dire que tout était arrêté. On note la durée et l'heure du début : c'est la trace du blocage nocturne. */
  /* Deux horloges pour savoir ce qui s'est arrêté : l'heure murale (Date.now) avance toujours ; l'horloge monotone
     (performance.now) s'arrête quand l'appareil lui-même dort. Si les deux ont avancé pareil, l'iPad était éveillé
     et seule la page était arrêtée ; si la monotone n'a presque pas bougé, c'est l'iPad qui dormait. */
  function mono() { return window.performance && performance.now ? performance.now() : Date.now(); }
  var tick = Date.now(), monoTick = mono(), hiddenAt = 0;
  setInterval(function () {
    var now = Date.now(), gap = now - tick, m = mono(), mgap = m - monoTick;
    if (gap > 6000 && !document.hidden) {
      // Les étapes d'abord (relevées avant toute autre écriture), mais rangées sous la ligne du gel.
      var path = '';
      try { path = trail(tick, now); } catch (e) { path = 'steps · unreadable: ' + e.message; }
      rows.push([now, '✕', ('FROZEN ' + Math.round(gap / 1000) + ' s (since ' + stamp(tick) + ') · monotonic clock +' + Math.round(mgap / 1000) + ' s: ' +
        (mgap < gap * 0.5 ? 'DEVICE WAS ASLEEP' : 'device awake, page stopped') +
        ' · focus ' + (document.hasFocus ? document.hasFocus() : '?') + ' · ' + (navigator.onLine ? 'online' : 'offline') + ' · ' + context()).slice(0, 400)]);
      rows.push([now, '·', path.slice(0, 1200)]);
      saveNow();
      // L'app se remet à jour tout de suite (heure, voile, météo) au lieu d'attendre ses minuteries.
      if (SM.diag.onResume) { try { SM.diag.onResume(gap); } catch (e) { SM.diag.error('resume: ' + e.message); } }
      // Rapport mis à disposition quelques secondes après, avec les lignes de la reprise.
      setTimeout(function () { if (SM.diag.publish) SM.diag.publish(); }, 8000);
    }
    tick = now; monoTick = m;
  }, 1000);

  /* Tout ce que le système fait à la page : masquée, montrée, mise en veille, réveillée, réseau, taille. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { hiddenAt = Date.now(); SM.diag.info('page hidden'); saveNow(); }
    else { SM.diag.info('page visible' + (hiddenAt ? ' after ' + Math.round((Date.now() - hiddenAt) / 1000) + ' s' : '')); tick = Date.now(); monoTick = mono(); }
  });
  window.addEventListener('pagehide', function (e) { SM.diag.info('pagehide' + (e.persisted ? ' (kept in memory)' : '')); alive(true); saveNow(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) SM.diag.info('pageshow (back from memory)'); });
  window.addEventListener('online', function () { SM.diag.info('network online'); });
  window.addEventListener('offline', function () { SM.diag.warn('network offline'); });
  window.addEventListener('focus', function () { SM.diag.info('window focus'); });
  window.addEventListener('blur', function () { SM.diag.info('window blur'); });
  window.addEventListener('orientationchange', function () { SM.diag.info('orientation ' + window.orientation); });
  ['freeze', 'resume'].forEach(function (n) { document.addEventListener(n, function () { SM.diag.warn('page ' + n); saveNow(); }); });
  // Premier toucher après un long silence : dit quand quelqu'un est revenu devant l'iPad.
  var lastTouch = Date.now();
  ['touchstart', 'mousedown'].forEach(function (n) {
    document.addEventListener(n, function () {
      var idle = Date.now() - lastTouch;
      if (idle > 10 * 60000) SM.diag.info('touch after ' + Math.round(idle / 60000) + ' min idle');
      lastTouch = Date.now();
    }, { capture: true, passive: true });
  });
  /* Le rapport (état et journal) est aussi rangé dans le cache du site, sous « sm-diag / diag-report ». L'outil de
     diagnostic branché en USB ne voit pas la page d'une web app sous iOS 12, mais il voit son service worker, qui
     partage ce cache : il peut donc lire le journal sans qu'on le copie à la main. Rien ne sort de l'appareil. */
  function publish() {
    if (!window.caches) return;
    try {
      caches.open('sm-diag').then(function (c) {
        var l = step('report'), text = SM.diag.report();
        done(l);
        return c.put('diag-report', new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
      }).catch(function () { /* cache indisponible */ });
    } catch (e) { /* rien */ }
  }
  SM.diag.publish = publish;
  setTimeout(publish, 10000);
  setInterval(function () { if (!document.hidden) publish(); }, 5 * 60000);

  // Point de situation toutes les heures.
  setInterval(function () { if (!document.hidden) SM.diag.info('hourly · up ' + Math.round((Date.now() - SM.diag.started) / 60000) + ' min · ' + context()); }, 3600000);
})();

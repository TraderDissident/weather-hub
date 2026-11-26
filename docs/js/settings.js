/* Écrans Réglages et Diagnostic (avec la démonstration du ciel). */
(function () {
  var U = SM.U, I = SM.i18n;
  function t() { return I.t(); }

  function seg(key, options, value) {
    return '<div class="seg" data-key="' + key + '">' + options.map(function (o) {
      return '<button data-v="' + U.esc(String(o[0])) + '"' + (String(o[0]) === String(value) ? ' class="on"' : '') + '>' + U.esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }
  function field(label, html) { return '<div class="field"><label>' + U.esc(label) + '</label>' + html + '</div>'; }

  /* Champ d'heure de Travel Hub (TimePickerField) : un bouton avec une horloge, qui ouvre deux colonnes,
     heures puis minutes, avec « Maintenant ». Choisir l'heure garde les minutes ; choisir les minutes referme. */
  var CLOCK = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  function timeField(key, value) {
    return '<div class="tp"><button type="button" class="tpbtn" data-tp="' + key + '">' + CLOCK + '<span>' + U.hhmm(value) + '</span></button></div>';
  }
  function timePop(key) {
    var tt = t(), v = U.hhmm(SM.app.settings[key]), h = v.slice(0, 2), m = v.slice(3);
    function col(kind, label, items, sel) {
      return '<div class="tpcol"><p>' + U.esc(label) + '</p><div class="tplist" data-kind="' + kind + '">' + items.map(function (x) {
        return '<button type="button" data-' + kind + '="' + x + '"' + (x === sel ? ' class="on"' : '') + '>' + x + '</button>';
      }).join('') + '</div></div>';
    }
    var hours = [], mins = [];
    for (var i = 0; i < 24; i++) hours.push(U.pad(i));
    for (var j = 0; j < 60; j++) mins.push(U.pad(j));
    // 00 aux deux bouts des minutes, comme dans Travel Hub : après 59, l'heure revient.
    mins.push('00');
    return '<div class="tppop" data-for="' + key + '"><div class="tpcols">' + col('h', tt.tpHours, hours, h) + col('m', tt.tpMinutes, mins, m) + '</div>' +
      '<div class="tpfoot"><button type="button" data-tpnow="1">' + U.esc(tt.tpNow) + '</button></div></div>';
  }

  function settingsHTML() {
    var tt = t(), s = SM.app.settings;
    var html =
      field(tt.carousel, seg('carousel', [[0, tt.off], [30, tt.every(30)], [60, tt.every(60)], [300, tt.every(300)]], s.carousel)) +
      field(tt.veil, seg('veil', [['off', tt.off], ['auto', tt.auto], ['hours', tt.hours]], s.veil));
    if (s.veil === 'hours') {
      html += '<div class="twocol">' + field(tt.from, timeField('veilFrom', s.veilFrom)) + field(tt.to, timeField('veilTo', s.veilTo)) + '</div>';
    }
    // Opacité du voile noir posé sur l'écran la nuit : à gauche l'écran reste plus clair, à droite il s'assombrit.
    if (s.veil !== 'off') html += field(tt.level, '<input type="range" class="vrange" data-key="veilLevel" min="0.2" max="0.85" step="0.05" value="' + s.veilLevel + '">' +
      '<div class="vends"><span>' + U.esc(tt.lighter) + '</span><span>' + U.esc(tt.darker) + '</span></div>');
    // Taille des points des lieux sur la carte et le globe : propre à cet appareil (voir dotSize() dans map.js).
    var dk = SM.map && SM.map.dotScale ? SM.map.dotScale() : 1;
    html += field(tt.dotSize, '<input type="range" class="vrange" data-dot="1" min="0.4" max="3" step="0.1" value="' + dk + '">' +
      '<div class="vends"><span>' + U.esc(tt.smaller) + '</span><span>' + U.esc(tt.bigger) + '</span></div>' +
      (SM.map && SM.map.dotsHTML ? SM.map.dotsHTML() : ''));
    html +=
      field(tt.motion, seg('motion', [['auto', tt.auto], ['reduced', tt.reduced], ['off', tt.motionOff]], s.motion)) +
      field(tt.seconds, seg('seconds', [[true, tt.yes], [false, tt.no]], s.seconds)) +
      field(tt.language, seg('lang', [['en', 'English'], ['fr', 'Français'], ['auto', tt.auto]], s.lang)) +
      field(tt.comfort, '<p class="about">' + U.esc(tt.calibrationHint) + '</p>' +
        '<div class="btnrow"><button class="btn" data-open="calib">' + tt.calibration + '</button></div>') +
      field(tt.backup, '<p class="about">' + U.esc(tt.backupHint) + '</p>' +
        '<div class="btnrow"><button class="btn" data-bk="export">' + tt.exportData + '</button><button class="btn" data-bk="import">' + tt.importData + '</button></div>') +
      field(tt.about, '<p class="about">' + tt.version + ' ' + SM.VERSION + '<br>' + U.esc(tt.source) + '<br>' + U.esc(tt.mapCredit) + '</p>' +
        '<p class="about" id="latestVer">' + U.esc(tt.checking) + '</p>' +
        // Actif seulement si une autre version est en ligne (showLatest) : grisé pendant la vérification, hors ligne, à jour.
        '<div class="btnrow"><button class="btn" data-update="1" disabled>' + tt.forceUpdate + '</button>' +
        '<button class="btn" data-open="diag">' + tt.diagnostic + '</button></div>');
    return html;
  }

  function parse(key, v) {
    if (key === 'carousel') return parseInt(v, 10);
    if (key === 'veilLevel') return parseFloat(v);
    if (key === 'seconds') return v === 'true';
    return v;
  }

  function bindSettings(body) {
    body.innerHTML = settingsHTML();
    showLatest();
    body.onclick = function (e) {
      var b = e.target.closest('.seg button');
      if (b && b.parentNode.hasAttribute('data-key')) {
        var key = b.parentNode.getAttribute('data-key');
        SM.app.setSetting(key, parse(key, b.getAttribute('data-v')));
        bindSettings(body);
        return;
      }
      var op = e.target.closest('[data-open]');
      if (op) { SM.app.open(op.getAttribute('data-open')); return; }
      // Champ d'heure.
      var pop = U.$('.tppop', body), tb = e.target.closest('.tpbtn');
      if (tb) {
        var k = tb.getAttribute('data-tp'), was = pop && pop.getAttribute('data-for') === k;
        if (pop) pop.parentNode.removeChild(pop);
        if (was) return;
        tb.parentNode.insertAdjacentHTML('beforeend', timePop(k));
        // Chaque colonne montre la valeur choisie en son milieu.
        U.$$('.tplist', body).forEach(function (l) {
          var on = U.$('.on', l);
          if (on) l.scrollTop = on.offsetTop - l.clientHeight / 2 + on.offsetHeight / 2;
        });
        return;
      }
      if (pop && e.target.closest('.tppop')) {
        var key2 = pop.getAttribute('data-for'), cur = U.hhmm(SM.app.settings[key2]);
        var bh = e.target.closest('[data-h]'), bm = e.target.closest('[data-m]'), now = e.target.closest('[data-tpnow]');
        if (bh) {
          SM.app.setSetting(key2, bh.getAttribute('data-h') + ':' + cur.slice(3));
          U.$$('[data-h]', pop).forEach(function (x) { x.className = x === bh ? 'on' : ''; });
          U.$('.tpbtn[data-tp="' + key2 + '"] span', body).textContent = U.hhmm(SM.app.settings[key2]);
        } else if (bm || now) {
          var d = new Date();
          SM.app.setSetting(key2, now ? U.pad(d.getHours()) + ':' + U.pad(d.getMinutes()) : cur.slice(0, 2) + ':' + bm.getAttribute('data-m'));
          bindSettings(body);
        }
        return;
      }
      if (pop) pop.parentNode.removeChild(pop);
    };
    U.$$('.vrange', body).forEach(function (r) {
      if (r.hasAttribute('data-dot')) {
        r.oninput = r.onchange = function () { if (SM.map && SM.map.setDotScale) SM.map.setDotScale(parseFloat(r.value)); };
        return;
      }
      var key = r.getAttribute('data-key') || 'veilLevel';
      var save = function () { SM.app.setSetting(key, parseFloat(r.value)); };
      r.oninput = save; r.onchange = save;
    });
    U.$$('select', body).forEach(function (sel) {
      sel.onchange = function () { SM.app.setSetting(sel.getAttribute('data-key'), parse(sel.getAttribute('data-key'), sel.value)); };
    });
  }

  /* ---------- diagnostic ---------- */
  function diagHTML() {
    var tt = t(), g = tt.diag, d = SM.diag, demo = SM.app.demo;
    var rows = [
      [g.version, SM.VERSION],
      [g.browser, navigator.userAgent],
      [g.screen, screen.width + '×' + screen.height + ' · ' + g.window + ' ' + innerWidth + '×' + innerHeight + ' · ×' + (window.devicePixelRatio || 1)],
      [g.home, navigator.standalone ? tt.yes : tt.no],
      [g.anim, (SM.sky.fps || '–') + ' ' + g.fps + ' · ' + g.quality + ' ' + SM.sky.quality() + ' · ' + g.motion[SM.app.settings.motion]],
      [g.lastCall, d.lastFetch || '–'],
      [g.network, navigator.onLine ? g.online : g.offline],
      [g.uptime, Math.round((Date.now() - d.started) / 60000) + ' min'],
      [g.errors, d.errors()]
    ];
    var times = ['reel', 'nuit', 'aube', 'lever', 'matin', 'midi', 'soir', 'coucher', 'crepuscule'];
    var weathers = Object.keys(tt.demoWeathers);
    return '<table class="kv">' + rows.map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + U.esc(r[1]) + '</td></tr>'; }).join('') + '</table>' +
      field(tt.demo + ' · ' + tt.demoTime, '<div class="seg" data-demo="time">' + times.map(function (k) {
        var on = (k === 'reel' && !demo.time && !demo.cycle) || demo.time === k;
        return '<button data-v="' + k + '"' + (on ? ' class="on"' : '') + '>' + (k === 'reel' ? tt.demoWeathers.reel : tt.demoTimes[k]) + '</button>';
      }).join('') + '<button data-v="cycle"' + (demo.cycle ? ' class="on"' : '') + '>' + tt.demoCycle + '</button></div>') +
      field(tt.demo + ' · ' + tt.demoWeather, '<div class="seg" data-demo="weather">' + weathers.map(function (k) {
        var on = (k === 'reel' && !demo.weather) || demo.weather === k;
        return '<button data-v="' + k + '"' + (on ? ' class="on"' : '') + '>' + tt.demoWeathers[k] + '</button>';
      }).join('') + '</div>') +
      '<div class="btnrow"><button class="btn" data-x="log">' + tt.openLog + ' (' + d.count() + ')</button><button class="btn" data-x="reload">' + tt.reload + '</button></div>';
  }

  function bindDiag(body) {
    body.innerHTML = diagHTML();
    body.onclick = function (e) {
      var b = e.target.closest('[data-demo] button');
      if (b) {
        var which = b.parentNode.getAttribute('data-demo'), v = b.getAttribute('data-v');
        if (which === 'time') SM.app.setDemo({ time: v === 'reel' || v === 'cycle' ? null : v, cycle: v === 'cycle' });
        else SM.app.setDemo({ weather: v === 'reel' ? null : v });
        bindDiag(body);
        return;
      }
      var x = e.target.closest('[data-x]');
      if (!x) return;
      if (x.getAttribute('data-x') === 'reload') location.reload();
      if (x.getAttribute('data-x') === 'log') openLog();
    };
  }

  /* Journal en plein écran : toutes les lignes des 7 derniers jours, les plus récentes en haut, avec Copier
     (tout le journal et l'état de l'appareil dans le presse-papiers), Vider et Fermer. */
  function openLog() {
    var tt = t(), old = document.getElementById('logview');
    if (old) old.parentNode.removeChild(old);
    var v = document.createElement('div');
    v.id = 'logview';
    var lines = SM.diag.lines().reverse();
    v.innerHTML = '<header><h2>' + U.esc(tt.logTitle) + '</h2><span class="lgn">' + lines.length + ' · ' + tt.logKept + '</span>' +
      '<button class="btn" data-lg="copy">' + U.esc(tt.copy) + '</button><button class="btn" data-lg="clear">' + U.esc(tt.clearLog) + '</button>' +
      '<button class="btn" data-lg="close">' + U.esc(tt.close) + '</button></header>' +
      '<div class="lgbody">' + lines.map(function (l) {
        var lv = l.charAt(15);
        return '<div class="lgl' + (lv === '✕' ? ' e' : (lv === '!' ? ' w' : '')) + '">' + U.esc(l) + '</div>';
      }).join('') + '</div>';
    document.body.appendChild(v);
    v.onclick = function (e) {
      var b = e.target.closest('[data-lg]');
      if (!b) return;
      var act = b.getAttribute('data-lg');
      if (act === 'close') v.parentNode.removeChild(v);
      if (act === 'clear') { SM.diag.clear(); openLog(); }
      if (act === 'copy') copyText(SM.diag.report(), function (ok) { b.textContent = ok ? tt.copied : tt.copyFailed; setTimeout(function () { b.textContent = tt.copy; }, 2000); });
    };
  }
  // Presse-papiers : l'API moderne si elle existe, sinon une zone de texte sélectionnée (Safari 12).
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(legacyCopy(text)); });
      return;
    }
    done(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea'), ok = false;
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px';
    document.body.appendChild(ta);
    try {
      var range = document.createRange();
      range.selectNodeContents(ta);
      var sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(range);
      ta.setSelectionRange(0, text.length);
      ok = document.execCommand('copy');
    } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  // Bouton « Forcer la mise à jour » et version en ligne, lue à l'ouverture des réglages.
  document.addEventListener('click', function (e) {
    var ub = e.target.closest && e.target.closest('[data-update]');
    if (ub && !ub.disabled) SM.update.forceIfNewer();
    var bk = e.target.closest && e.target.closest('[data-bk]');
    if (bk) openBackup(bk.getAttribute('data-bk'));
  });

  /* ---------- sauvegarde : export et import ---------- */
  /* Tout ce qui est propre à Matt : lieux et leur ordre, lieu de démarrage, réglages, blocs de détails, vue, réglages
     de la carte et du globe (style, vue, cartes du bas, plein écran, rotation, points), étiquettes placées à la main.
     Laissé de côté : la météo en mémoire, le journal et ce qui dépend de l'appareil (taille de la carte, taille des points). */
  function backupKeys() {
    var out = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('sm.') === 0 && !/^sm\.(w\.|log|alive|mapSize|dotScale)/.test(k)) out.push(k);
    }
    return out.sort();
  }
  function exportText() {
    var data = {};
    backupKeys().forEach(function (k) { data[k] = localStorage.getItem(k); });
    return JSON.stringify({ app: 'station-meteo', version: SM.VERSION, date: new Date().toISOString(), data: data }, null, 1);
  }
  // Plein écran, sur le modèle du journal : le texte de la sauvegarde, à copier (ou télécharger sur un ordinateur),
  // ou une zone où coller une sauvegarde pour l'appliquer.
  function openBackup(mode) {
    var tt = t(), old = document.getElementById('bkview');
    if (old) old.parentNode.removeChild(old);
    var v = document.createElement('div');
    v.id = 'bkview';
    var txt = mode === 'export' ? exportText() : '';
    v.innerHTML = '<header><h2>' + U.esc(mode === 'export' ? tt.exportData : tt.importData) + '</h2><span class="lgn">' +
      U.esc(mode === 'export' ? tt.exportHint : tt.importHint) + '</span>' +
      (mode === 'export' ? '<button class="btn" data-b="copy">' + U.esc(tt.copy) + '</button><button class="btn" data-b="file">' + U.esc(tt.download) + '</button>'
        : '<button class="btn" data-b="apply">' + U.esc(tt.importApply) + '</button>') +
      '<button class="btn" data-b="close">' + U.esc(tt.close) + '</button></header>' +
      '<textarea class="bktext" spellcheck="false" autocorrect="off" autocapitalize="off"' + (mode === 'export' ? ' readonly' : '') + '></textarea>';
    document.body.appendChild(v);
    var area = v.querySelector('.bktext');
    area.value = txt;
    v.onclick = function (e) {
      var b = e.target.closest('[data-b]');
      if (!b) return;
      var act = b.getAttribute('data-b');
      if (act === 'close') v.parentNode.removeChild(v);
      if (act === 'copy') copyText(txt, function (ok) { b.textContent = ok ? tt.copied : tt.copyFailed; setTimeout(function () { b.textContent = tt.copy; }, 2000); });
      if (act === 'file') {
        var a = document.createElement('a'), d = new Date();
        a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(txt);
        a.download = 'station-meteo-' + d.getFullYear() + '-' + U.pad(d.getMonth() + 1) + '-' + U.pad(d.getDate()) + '.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }
      if (act === 'apply') applyBackup(area.value, b);
    };
  }
  function applyBackup(text, btn) {
    var tt = t(), obj = null;
    try { obj = JSON.parse(text); } catch (e) { obj = null; }
    var data = obj && obj.app === 'station-meteo' && obj.data;
    var keys = data ? Object.keys(data).filter(function (k) { return k.indexOf('sm.') === 0 && !/^sm\.(w\.|log|alive|mapSize|dotScale)/.test(k) && typeof data[k] === 'string'; }) : [];
    if (!keys.length) { btn.textContent = tt.importBad; setTimeout(function () { btn.textContent = tt.importApply; }, 2500); return; }
    var places = null;
    try { places = JSON.parse(data['sm.places'] || 'null'); } catch (e) { places = null; }
    if (data['sm.places'] && !(places && places.length)) { btn.textContent = tt.importBad; setTimeout(function () { btn.textContent = tt.importApply; }, 2500); return; }
    if (!window.confirm(tt.importConfirm)) return;
    // Les réglages de la sauvegarde remplacent ceux de l'appareil ; la météo en mémoire et le journal restent.
    backupKeys().forEach(function (k) { localStorage.removeItem(k); });
    keys.forEach(function (k) { localStorage.setItem(k, data[k]); });
    SM.diag.info('backup imported · ' + keys.length + ' keys · from v' + (obj.version || '?'));
    SM.diag.flush();
    location.reload();
  }
  function showLatest() {
    var tt = t();
    SM.update.latestVersion().then(function (v) {
      var p = document.getElementById('latestVer'), b = document.querySelector('[data-update]');
      var newer = !!v && v !== SM.VERSION;
      if (p) p.textContent = !v ? tt.onlineUnknown : (newer ? tt.updateAvail.replace('%1', v) : tt.upToDate);
      if (b) b.disabled = !newer;
    }).catch(function () {
      var p = document.getElementById('latestVer');
      if (p) p.textContent = tt.onlineUnknown;
    });
  }

  SM.settings = { open: bindSettings, openDiag: bindDiag, copyText: copyText };
})();

/* Écran Lieux : liste, recherche, ajout, suppression, ordre, lieu de démarrage. */
(function () {
  var U = SM.U, I = SM.i18n, IC = SM.icons;
  var body, timer = 0, lastQuery = '', results = [];
  // Onglet de la feuille : la vue dont on règle l'ordre ('place', 'list' ou 'map'). À l'ouverture : la vue affichée.
  var tab = 'place';

  function t() { return I.t(); }

  /* Glisser-déposer : on attrape la poignée ≡ d'un lieu (doigt ou souris), la ligne suit, les autres s'écartent ;
     près du haut ou du bas de la liste, elle défile. L'ordre est enregistré au lâcher. */
  var pd = null;
  function pPoint(e) { var q = e.touches ? e.touches[0] || e.changedTouches[0] : e; return [q.clientX, q.clientY]; }
  function pStart(e) {
    var g = e.target.closest && e.target.closest('.prow .grip');
    if (!g) return;
    var row = g.closest('.prow'), r = row.getBoundingClientRect(), pt = pPoint(e);
    pd = { row: row, list: row.parentNode, scroller: row.closest('.sheet-body'), grabY: pt[1] - r.top, y: pt[1], timer: 0 };
    row.className = 'prow dragging';
    if (e.cancelable) e.preventDefault();
    pd.timer = setInterval(pScroll, 30);
  }
  function pPlace() {
    var row = pd.row;
    row.style.webkitTransform = row.style.transform = 'none';
    var r = row.getBoundingClientRect(), dy = pd.y - pd.grabY - r.top;
    row.style.webkitTransform = row.style.transform = 'translate3d(0,' + dy.toFixed(0) + 'px,0)';
  }
  function pMove(e) {
    if (!pd) return;
    if (e.type === 'mousemove' && e.buttons === 0) { pEnd(); return; }
    if (e.cancelable) e.preventDefault();
    pd.y = pPoint(e)[1];
    pSwap();
    pPlace();
  }
  // La ligne tenue prend la place de celle qu'elle survole, de moitié au moins.
  function pSwap() {
    var rows = [].slice.call(pd.list.children), k = rows.indexOf(pd.row);
    var mid = pd.y - pd.grabY + pd.row.offsetHeight / 2;
    var prev = rows[k - 1], next = rows[k + 1];
    if (prev && mid < prev.getBoundingClientRect().top + prev.offsetHeight / 2) pd.list.insertBefore(pd.row, prev);
    else if (next && mid > next.getBoundingClientRect().top + next.offsetHeight / 2) pd.list.insertBefore(pd.row, next.nextSibling);
  }
  function pScroll() {
    if (!pd || !pd.scroller) return;
    var s = pd.scroller.getBoundingClientRect(), v = 0;
    if (pd.y < s.top + 50) v = -8; else if (pd.y > s.bottom - 50) v = 8;
    if (v) { pd.scroller.scrollTop += v; pSwap(); pPlace(); }
  }
  function pEnd() {
    if (!pd) return;
    var d = pd;
    pd = null;
    clearInterval(d.timer);
    d.row.style.webkitTransform = d.row.style.transform = '';
    d.row.className = 'prow';
    var ids = [].map.call(d.list.querySelectorAll('.prow'), function (r) { return r.getAttribute('data-id'); });
    var by = {}, cur = SM.app.ordered(tab);
    SM.app.places.forEach(function (p) { by[p.id] = p; });
    var list = ids.map(function (id) { return by[id]; }).filter(Boolean);
    var same = list.length === cur.length && list.every(function (p, k) { return p === cur[k]; });
    if (!same) SM.app.setOrder(tab, list);
  }
  // Non passifs sur le corps de la feuille seulement (voir config.js) : ailleurs, aucun toucher n'attend la page.
  function bindTouch(el) {
    if (!el || el._pTouch) return;
    el._pTouch = true;
    el.addEventListener('touchstart', pStart, { passive: false });
    el.addEventListener('touchmove', pMove, { passive: false });
    el.addEventListener('touchend', pEnd, { passive: true });
    el.addEventListener('touchcancel', pEnd, { passive: true });
  }
  document.addEventListener('mousedown', pStart);
  document.addEventListener('mousemove', pMove);
  document.addEventListener('mouseup', pEnd);

  function listHTML() {
    var tt = t(), places = SM.app.ordered(tab), start = SM.store.startPlace() || SM.app.places[0].id;
    return places.map(function (p, i) {
      return '<div class="prow" data-id="' + U.esc(p.id) + '">' +
        '<button class="mini star' + (p.id === start ? ' on' : '') + '" data-act="start" title="' + U.esc(tt.startHere) + '">' + IC.ui('star') + '</button>' +
        '<div class="pn" data-act="go"><b>' + U.esc(I.place(p).name) + '</b><small>' + U.esc([I.place(p).region, I.place(p).country].filter(Boolean).join(', ')) + '</small></div>' +
        '<button class="mini danger" data-act="del" title="' + U.esc(tt.remove) + '">' + IC.ui('trash') + '</button>' +
        '<span class="grip" aria-label="' + U.esc(tt.reorder) + '">' + IC.ui('grip') + '</span>' +
      '</div>';
    }).join('');
  }

  // Trois onglets : l'ordre des lieux se règle vue par vue. Étoile, corbeille et ajout valent pour toutes les vues.
  function tabsHTML() {
    var tt = t();
    return '<div class="seg ptabs">' + [['place', tt.tabCity], ['list', tt.tabList], ['map', tt.tabMap]].map(function (o) {
      return '<button data-ptab="' + o[0] + '"' + (o[0] === tab ? ' class="on"' : '') + '>' + U.esc(o[1]) + '</button>';
    }).join('') + '</div><p class="hint ptabhint">' + U.esc(tt.tabHint) + '</p>' +
      // Tri rapide de la vue de l'onglet : par fuseau horaire (d'ouest en est), ou copie de l'ordre d'une autre vue.
      '<div class="seg pquick"><button data-psort="tz">' + U.esc(tt.sortTz) + '</button>' +
      ['place', 'list', 'map'].filter(function (v) { return v !== tab; }).map(function (v) {
        return '<button data-pcopy="' + v + '">' + U.esc(tt.copyFrom.replace('%', { place: tt.tabCity, list: tt.tabList, map: tt.tabMap }[v])) + '</button>';
      }).join('') + '</div>';
  }
  // Décalage horaire du moment (données météo du lieu), sinon déduit de la longitude.
  function tzOffset(p) { var w = SM.app.data[p.id]; return w && typeof w.offset === 'number' ? w.offset : Math.round(p.lon / 15) * 3600; }

  function resultsHTML(state) {
    var tt = t();
    if (state === 'busy') return '<p class="hint">' + tt.searching + '</p>';
    if (state === 'error') return '<p class="hint">' + tt.offline + '</p>';
    if (!results.length) return lastQuery.length > 1 ? '<p class="hint">' + tt.noResult + '</p>' : '';
    var have = {};
    SM.app.places.forEach(function (p) { have[p.lat.toFixed(2) + ',' + p.lon.toFixed(2)] = 1; });
    return results.map(function (r, i) {
      var dup = have[r.lat.toFixed(2) + ',' + r.lon.toFixed(2)];
      return '<div class="prow res">' +
        '<div class="pn"><b>' + U.esc(r.name) + '</b><small>' + U.esc([r.region, r.country].filter(Boolean).join(', ')) + '</small></div>' +
        (dup ? '<span class="hint">' + tt.alreadyThere + '</span>' : '<button class="btn sm" data-add="' + i + '">' + IC.ui('plus') + tt.add + '</button>') +
      '</div>';
    }).join('');
  }

  function render() {
    var tt = t();
    // Nombre de lieux à côté du titre de la feuille, tenu à jour à chaque ajout, retrait ou déplacement.
    var h2 = document.querySelector('#sheet h2');
    if (h2) h2.innerHTML = U.esc(tt.places) + ' <span class="hcount">' + SM.app.places.length + '</span>';
    body.innerHTML =
      '<div class="searchbox">' + IC.ui('search') + '<input class="search" type="search" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="' + U.esc(tt.search) + '" value="' + U.esc(lastQuery) + '"></div>' +
      '<div class="results">' + resultsHTML() + '</div>' +
      '<div class="ptabsbox">' + tabsHTML() + '</div><div class="plist">' + listHTML() + '</div>';
    var input = U.$('input', body);
    input.addEventListener('input', function () {
      clearTimeout(timer);
      var q = input.value.trim();
      lastQuery = q;
      if (q.length < 2) { results = []; U.$('.results', body).innerHTML = ''; return; }
      timer = setTimeout(function () { search(q); }, 450);
    });
  }

  function search(q) {
    var box = U.$('.results', body);
    box.innerHTML = resultsHTML('busy');
    SM.api.search(q).then(function (r) {
      if (q !== lastQuery) return;
      results = r;
      box.innerHTML = resultsHTML();
    }).catch(function (e) {
      SM.diag.warn('search: ' + e.message);
      box.innerHTML = resultsHTML('error');
    });
  }

  function refreshList() { U.$('.plist', body).innerHTML = listHTML(); U.$('.results', body).innerHTML = resultsHTML(); }

  function onClick(e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      var r = results[+add.getAttribute('data-add')];
      if (!r) return;
      var places = SM.app.places.slice();
      places.push(r);
      SM.app.setPlaces(places);
      SM.app.toast(t().added + ' · ' + r.name);
      results = []; lastQuery = '';
      U.$('input', body).value = '';
      refreshList();
      return;
    }
    var tb = e.target.closest('[data-ptab]');
    if (tb) {
      tab = tb.getAttribute('data-ptab');
      U.$('.ptabsbox', body).innerHTML = tabsHTML();
      refreshList();
      return;
    }
    var srt = e.target.closest('[data-psort]'), cp = e.target.closest('[data-pcopy]');
    if (srt || cp) {
      var next = srt ? SM.app.ordered(tab).slice().sort(function (a, b) { return tzOffset(a) - tzOffset(b) || a.lon - b.lon; })
        : SM.app.ordered(cp.getAttribute('data-pcopy')).slice();
      SM.app.setOrder(tab, next);
      refreshList();
      SM.app.toast(srt ? t().sortedTz : t().copied);
      return;
    }
    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    var row = btn.closest('.prow'), id = row.getAttribute('data-id'), act = btn.getAttribute('data-act');
    var list = SM.app.places.slice(), i = -1;
    list.forEach(function (p, k) { if (p.id === id) i = k; });
    if (i < 0) return;
    if (act === 'go') { SM.app.close(); SM.app.goTo(id); return; }
    if (act === 'start') { SM.store.saveStartPlace(id); refreshList(); return; }
    if (act === 'del') {
      if (list.length === 1) { SM.app.toast(t().lastPlace); return; }
      list.splice(i, 1);
      SM.store.dropWeather(id);
      if (SM.store.startPlace() === id) SM.store.saveStartPlace(list[0].id);
    }
    SM.app.setPlaces(list);
    refreshList();
  }

  SM.places = {
    open: function (b) {
      body = b;
      results = []; lastQuery = '';
      tab = SM.app.mode === 'list' || SM.app.mode === 'map' ? SM.app.mode : 'place';
      render();
      body.onclick = onClick;
      bindTouch(body);
    }
  };
})();

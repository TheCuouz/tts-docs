// Buscador de la documentacion: el indice se baja una sola vez, a la primera tecla.
(function () {
  var caja = document.getElementById('buscar');
  var panel = document.getElementById('resultados');
  var lateral = document.getElementById('lateral');
  var menu = document.getElementById('menu');
  var indice = null, sel = -1;
  var raiz = (document.querySelector('link[rel=stylesheet][href$="estilo.css"]') || {})
              .getAttribute('href').replace('estilo.css', '');

  if (menu) menu.addEventListener('click', function () { lateral.classList.toggle('abierto'); });

  function baja() {
    if (indice) return Promise.resolve(indice);
    return fetch(raiz + 'indice.json').then(function (r) { return r.json(); })
      .then(function (j) { indice = j; return j; });
  }

  function pinta(lista, q) {
    if (!q) { panel.hidden = true; return; }
    sel = -1;
    if (!lista.length) {
      panel.innerHTML = '<p class="vacio">Nothing matches “' + q.replace(/</g, '') + '”.</p>';
      panel.hidden = false; return;
    }
    panel.innerHTML = lista.slice(0, 12).map(function (p) {
      return '<a href="' + raiz + p.u + '"><span class="r-t">' + p.t +
             '</span><span class="r-x">' + (p.frag || '') + '</span></a>';
    }).join('');
    panel.hidden = false;
  }

  function busca(q) {
    var t = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!t.length) return [];
    return indice.map(function (p) {
      var heno = (p.t + ' ' + p.x).toLowerCase(), puntos = 0, pos = -1;
      t.forEach(function (palabra) {
        var i = heno.indexOf(palabra);
        if (i < 0) { puntos = -999; return; }
        puntos += p.t.toLowerCase().indexOf(palabra) >= 0 ? 6 : 1;
        if (pos < 0) pos = i;
      });
      var frag = pos > 0 ? p.x.substr(Math.max(0, pos - 40), 120).trim() : p.x.substr(0, 110);
      return { t: p.t, u: p.u, frag: frag, puntos: puntos };
    }).filter(function (p) { return p.puntos > 0; })
      .sort(function (a, b) { return b.puntos - a.puntos; });
  }

  if (caja) {
    caja.addEventListener('input', function () {
      var q = caja.value.trim();
      if (!q) { panel.hidden = true; return; }
      baja().then(function () { pinta(busca(q), q); });
    });
    caja.addEventListener('keydown', function (e) {
      var items = panel.querySelectorAll('a');
      if (e.key === 'Escape') { panel.hidden = true; caja.blur(); }
      if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        items[Math.max(sel, 0)].classList.remove('sel');
        sel = (sel + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
        items[sel].classList.add('sel');
      }
      if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); items[sel].click(); }
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== caja) panel.hidden = true;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== caja) { e.preventDefault(); caja.focus(); }
    });
  }
})();

/* Van 15-10: «el ojo humano es muy cabrón con las simetrías». Rejillas con filas completas y filas de botones parejas.
   - Rejillas (GRID): elige cuántas columnas usar (entre las que caben) para que la última fila quede llena o lo más llena posible;
     si aun así sobra alguna, queda centrada.
   - Filas de botones (CHIPS): estrecha la fila lo justo para repartir los botones por igual entre las líneas, centradas. */
(function () {
  var GRID = {'.spells': 190, '.cf-grid': 340, '.bios': 230, '.profs': 300, '.race-grid': 150, '.tiles': 230,
    '.addons': 440, '.brands': 190, '.codes': 190, '.vgrid:not(.shorts)': 250, '.vgrid.shorts': 150, '.foot-partners>div': 150, '.apartados': 260, '.avisos': 280, '.r-cards': 230, '.r-mms': 280, '.r-jefes': 230};
  var CHIPS = ['.quick', '.race-chips', '.mtags', '.race-classes', '.class-chips', '.fnav', '.soc-row', '.calc-classes', '.foot-icons', '.r-strip'];
  function vis(el) { return Array.prototype.filter.call(el.children, function (k) { return k.offsetWidth > 0 && getComputedStyle(k).position !== 'absolute'; }); }
  function rows(kids) { var t = {}, n = 0; kids.forEach(function (k) { var y = Math.round(k.offsetTop / 6); if (!(y in t)) { t[y] = 0; n++; } t[y]++; }); return Object.keys(t).sort(function (a, b) { return a - b; }).map(function (y) { return t[y]; }); }
  function grid(el, min) {
    Array.prototype.forEach.call(el.querySelectorAll(':scope>.cuadra-sobra'), function (k) { k.classList.remove('cuadra-sobra'); });
    var kids = vis(el), n = kids.length; if (n < 2) return;
    var g = parseFloat(getComputedStyle(el).columnGap) || 12, W = el.clientWidth;
    var cmax = Math.max(1, Math.min(n, Math.floor((W + g) / (min + g)))), best = cmax, bs = -1;
    for (var c = cmax; c >= Math.max(1, Math.ceil(cmax / 2)); c--) {
      var r = n % c, s = r === 0 ? 2 : r / c;           // fila llena = lo mejor; si no, la última lo más llena posible
      if (s > bs + 1e-9) { bs = s; best = c; }
      if (r === 0) break;
    }
    el.classList.add('cuadra-g'); el.style.setProperty('--cols', best); el.style.setProperty('--g', g + 'px');
    // Vídeos: si la última fila queda a medias, se ocultan los que sobran (hay más en el canal)
    if (el.matches('.vgrid') && n > best) { var keep = n - n % best; kids.forEach(function (k, i) { if (i >= keep) k.classList.add('cuadra-sobra'); }); }
  }
  function chips(el) {
    el.style.maxWidth = ''; var kids = vis(el); if (kids.length < 3) return;
    var r0 = rows(kids); if (r0.length < 2) return;
    var W = el.clientWidth, best = W, bd = r0[0] - r0[r0.length - 1];
    for (var w = W - 8; w > W * 0.45 && bd > 1; w -= 8) {
      el.style.maxWidth = w + 'px'; var r = rows(kids);
      if (r.length !== r0.length) break;
      var d = Math.max.apply(null, r) - Math.min.apply(null, r);
      if (d < bd) { bd = d; best = w; }
    }
    el.style.maxWidth = best < W ? best + 'px' : '';
    el.classList.add('cuadra-c');
  }
  function run() {
    Object.keys(GRID).forEach(function (s) { document.querySelectorAll(s).forEach(function (el) { if (getComputedStyle(el).display !== 'none') grid(el, GRID[s]); }); });
    CHIPS.forEach(function (s) { document.querySelectorAll(s).forEach(function (el) { if (el.offsetWidth) chips(el); }); });
  }
  var t; function later() { clearTimeout(t); t = setTimeout(run, 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('resize', later); window.addEventListener('load', run);
  document.addEventListener('toggle', later, true);   // al abrir un desplegable, cuadrar lo de dentro
  new MutationObserver(later).observe(document.body, {childList: true, subtree: true});
})();

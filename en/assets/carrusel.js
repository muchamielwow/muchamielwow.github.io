/* Carrusel de la portada (Van, 16-10): lo más importante de la web sin bajar. Pasa solo cada 6,5 s, se para con el ratón
   encima o al tocar, flechas, puntos y deslizar en el móvil. Cada diapositiva con data-hasta="AAAA-MM-DD" desaparece ese día. */
(function () {
  var c = document.querySelector('[data-car]'); if (!c) return;
  var pista = c.querySelector('.car-pista'), hoy = new Date();
  [].slice.call(pista.children).forEach(function (s) { var h = s.getAttribute('data-hasta'); if (h && new Date(h + 'T00:00:00') <= hoy) s.remove(); });
  var sl = [].slice.call(pista.children), n = sl.length, i = 0, t = null;
  var EN = document.documentElement.lang === 'en', puntos = c.querySelector('.car-puntos');
  puntos.innerHTML = sl.map(function (_, k) { return '<button type="button" aria-label="' + (EN ? 'Slide ' : 'Diapositiva ') + (k + 1) + '"></button>'; }).join('');
  var pb = [].slice.call(puntos.children);
  if (n < 2) c.classList.add('solo');
  function ir(k) {
    i = (k + n) % n; pista.style.transform = 'translateX(' + (-100 * i) + '%)';
    pb.forEach(function (b, j) { b.classList.toggle('on', j === i); });
    sl.forEach(function (s, j) { s.setAttribute('aria-hidden', j !== i ? 'true' : 'false'); s.tabIndex = j === i ? 0 : -1; });
  }
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stop() { clearInterval(t); t = null; }
  function play() { stop(); if (!quieto && n > 1) t = setInterval(function () { ir(i + 1); }, 6500); }
  c.querySelector('.car-flecha.prev').onclick = function () { ir(i - 1); play(); };
  c.querySelector('.car-flecha.next').onclick = function () { ir(i + 1); play(); };
  pb.forEach(function (b, k) { b.onclick = function () { ir(k); play(); }; });
  c.addEventListener('mouseenter', stop); c.addEventListener('mouseleave', play);
  c.addEventListener('focusin', stop); c.addEventListener('focusout', play);
  var x0 = null;
  c.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, {passive: true});
  c.addEventListener('touchend', function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) ir(i + (dx < 0 ? 1 : -1)); play();
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else play(); });
  ir(0); play();
})();

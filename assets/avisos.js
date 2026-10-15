/* Últimos avisos oficiales de Blizzard sobre WoW Forever (Van, 16-10). Lee datos/avisos-blizzard.json, que una tarea de
   GitHub actualiza cada 20 minutos. Cada bloque <div data-avisos data-n="3"> se rellena con tarjetas, y la diapositiva
   [data-aviso-car] del carrusel de la portada, con el más reciente. */
(function () {
  var cajas = document.querySelectorAll('[data-avisos]'), car = document.querySelector('[data-aviso-car]');
  if (!cajas.length && !car) return;
  var EN = document.documentElement.lang === 'en', base = document.currentScript.src.replace(/assets\/avisos\.js.*$/, '');
  var T = EN ? {of: 'OFFICIAL', mas: 'Read on the Blizzard forum →', nada: 'No recent Blizzard posts about WoW Forever.', err: 'Blizzard posts could not be loaded right now.', ult: 'LATEST BLIZZARD POST'}
             : {of: 'OFICIAL', mas: 'Leer en el foro de Blizzard →', nada: 'No hay avisos recientes de Blizzard sobre WoW Forever.', err: 'Ahora mismo no se pueden cargar los avisos de Blizzard.', ult: 'ÚLTIMO AVISO DE BLIZZARD'};
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function autor(a) { return a === 'BlizzardEntertainment' ? 'Blizzard' : a; }
  function fecha(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString(EN ? 'en-GB' : 'es-ES', {day: 'numeric', month: 'short'}) + ', ' + d.toLocaleTimeString(EN ? 'en-GB' : 'es-ES', {hour: '2-digit', minute: '2-digit'});
  }
  function pinta(lista) {
    if (car && lista[0]) {
      var x = lista[0];
      car.querySelector('.eyebrow').textContent = T.ult + ' · ' + autor(x.autor) + ' · ' + fecha(x.fecha);
      car.querySelector('[data-car-titulo]').textContent = x.titulo;
      car.querySelector('[data-car-titulo]').setAttribute('lang', 'en');
      car.querySelector('[data-car-txt]').textContent = x.resumen;
      car.querySelector('[data-car-txt]').setAttribute('lang', 'en');
    }
    cajas.forEach(function (c) {
      var n = +c.getAttribute('data-n') || 3, a = lista.slice(0, n);
      if (!a.length) { c.innerHTML = '<p class="fine">' + T.nada + '</p>'; return; }
      c.innerHTML = a.map(function (x) {
        var fresco = Date.now() - Date.parse(x.fecha) < 36e5 * 24;
        return '<a class="aviso" href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer">' + (fresco ? '<span class="badge-new">' + (EN ? 'NEW' : 'NUEVO') + '</span>' : '') +
          '<span class="aviso-meta">' + T.of + ' · ' + esc(x.foro) + ' · ' + esc(autor(x.autor)) + ' · ' + fecha(x.fecha) + '</span>' +
          '<b lang="en">' + esc(x.titulo) + '</b><span class="aviso-txt" lang="en">' + esc(x.resumen) + '</span><span class="aviso-mas">' + T.mas + '</span></a>';
      }).join('');
      c.classList.add('listo');
    });
  }
  fetch(base + 'datos/avisos-blizzard.json?v=' + Math.floor(Date.now() / 3e5), {cache: 'no-store'})
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (d) { pinta(d.avisos || []); })
    .catch(function () { cajas.forEach(function (c) { c.innerHTML = '<p class="fine">' + T.err + '</p>'; }); });
})();

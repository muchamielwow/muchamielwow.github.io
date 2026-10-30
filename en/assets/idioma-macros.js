// Macros en el idioma de tu juego (30-10-2026). El juego solo entiende los nombres de los hechizos en el idioma del cliente:
// aquí se cambian por los oficiales de WoW Forever (inglés, castellano de España o de Latinoamérica). Se recuerda la elección.
(async () => {
  const cajas = [...document.querySelectorAll('.macro pre code')];
  if (!cajas.length) return;
  let dic = {};
  try { dic = await fetch(new URL('hechizos-idiomas.json', document.currentScript ? document.currentScript.src : location.href)).then(r => r.json()); } catch { return; }
  const nombres = Object.keys(dic).sort((a, b) => b.length - a.length);
  const esc = s => s.replace(/[.*+?^${}()|[\]\]/g, '\$&');
  const re = new RegExp('(?<![A-Za-z])(' + nombres.map(esc).join('|') + ')(?![A-Za-z])', 'g');
  cajas.forEach(c => { c.dataset.en = c.textContent; });
  const barra = document.createElement('div');
  barra.className = 'idioma-macros';
  const EN = document.documentElement.lang === 'en';
  barra.innerHTML = '<b>' + (EN ? 'Your game language:' : 'Idioma de tu juego:') + '</b> <button data-l="en">English</button> <button data-l="es">Español (España)</button> <button data-l="mx">Español (Latinoamérica)</button>' +
    '<small>' + (EN ? 'The game only understands spell names in your client language. Pick yours and copy.' : 'El juego solo entiende los hechizos en el idioma de tu cliente. Elige el tuyo y copia.') + '</small>';
  const estilo = document.createElement('style');
  estilo.textContent = '.idioma-macros{position:sticky;top:0;z-index:20;display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#101724f2;border:1px solid #a88d5666;border-radius:10px;padding:10px 14px;margin:14px 0}' +
    '.idioma-macros button{background:#253247;color:#fff;border:1px solid #65728b;border-radius:6px;padding:6px 12px;cursor:pointer;font:inherit}.idioma-macros button.on{background:#c99a3c;color:#0c1017;border-color:#c99a3c;font-weight:700}' +
    '.idioma-macros small{flex-basis:100%;color:#9aa6b8}';
  document.head.append(estilo);
  const primera = cajas[0].closest('.macro');
  (primera.closest('.mfin, section, .detail-body, main') && primera.parentElement || document.body).insertBefore(barra, primera);
  function pon(l) {
    cajas.forEach(c => {
      c.textContent = l === 'en' ? c.dataset.en : c.dataset.en.replace(re, n => (dic[n] && dic[n][l]) || n);
      const len = c.closest('.macro').querySelector('.mlen');
      if (len) { const n = [...c.textContent].length; len.textContent = n + '/255'; len.style.color = n > 255 ? '#e06a5f' : ''; }
    });
    barra.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.l === l));
    try { localStorage.setItem('idioma-macros', l); } catch {}
  }
  barra.querySelectorAll('button').forEach(b => b.onclick = () => pon(b.dataset.l));
  let l = 'es';
  try { l = localStorage.getItem('idioma-macros') || (EN ? 'en' : navigator.language === 'es-ES' ? 'es' : /^es/.test(navigator.language) ? 'mx' : 'es'); } catch {}
  pon(l);
})();

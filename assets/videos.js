(() => {
  'use strict';
  const grids = [...document.querySelectorAll('[data-youtube-latest]')];
  if (!grids.length) return;
  const english = document.documentElement.lang.startsWith('en');
  const channel = 'UCLKDtwQj4YDatBOQPkOlDlA';
  const cacheName = `muchamiel-videos-${channel}`;
  const label = english ? {
    updated: 'Channel checked: ', saved: 'Last available videos. ', unavailable: 'Live update unavailable; showing saved videos.',
    latest: 'Latest channel uploads, including videos, Shorts and streams.'
  } : {
    updated: 'Canal consultado: ', saved: 'Últimos vídeos disponibles. ', unavailable: 'Actualización no disponible; se muestran los vídeos guardados.',
    latest: 'Últimas publicaciones del canal: vídeos, Shorts y directos.'
  };
  const format = value => new Intl.DateTimeFormat(english ? 'en-GB' : 'es-ES', {
    dateStyle: 'medium', timeStyle: 'short'
  }).format(new Date(value));

  function entries(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid XML');
    const ns = 'http://www.youtube.com/xml/schemas/2015';
    const atom = 'http://www.w3.org/2005/Atom';
    const feedChannel = doc.getElementsByTagNameNS(ns, 'channelId')[0]?.textContent;
    // YouTube's feed header can omit UC; entry channel IDs retain it.
    if (![channel, channel.slice(2)].includes(feedChannel)) throw new Error('Wrong channel');
    const seen = new Set();
    const items = [...doc.getElementsByTagNameNS(atom, 'entry')].map(entry => {
      const value = (namespace, tag) => entry.getElementsByTagNameNS(namespace, tag)[0]?.textContent || '';
      return {id: value(ns, 'videoId'), channel: value(ns, 'channelId'), title: value(atom, 'title').slice(0, 1000), published: value(atom, 'published')};
    }).filter(v => v.channel === channel && /^[A-Za-z0-9_-]{11}$/.test(v.id) && v.title && Number.isFinite(Date.parse(v.published)) &&
      !seen.has(v.id) && seen.add(v.id));
    items.sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
    if (!items.length) throw new Error('Empty feed');
    return items;
  }

  function card(video) {
    const a = document.createElement('a');
    a.className = 'vcard'; a.href = `https://www.youtube.com/watch?v=${video.id}`;
    a.target = '_blank'; a.rel = 'noopener noreferrer';
    const thumb = document.createElement('span'); thumb.className = 'thumb';
    const image = document.createElement('img'); image.loading = 'lazy'; image.alt = '';
    image.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`; thumb.append(image);
    const body = document.createElement('span'); body.className = 'vbody';
    const title = document.createElement('strong'); title.textContent = video.title;
    const time = document.createElement('small');
    time.textContent = new Intl.DateTimeFormat(english ? 'en-GB' : 'es-ES', {dateStyle: 'medium'}).format(new Date(video.published));
    body.append(title, time); a.append(thumb, body); return a;
  }

  function render(items, updated, stale = false) {
    for (const grid of grids) {
      grid.replaceChildren(...items.slice(0, Number(grid.dataset.limit) || 12).map(card));
      const status = grid.nextElementSibling;
      if (status?.matches('[data-youtube-status]')) {
        status.textContent = label.latest + ' ' + (stale ? label.saved : '') +
          (updated ? label.updated + format(updated) : label.saved);
      }
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(cacheName));
    if (saved && Date.now() - saved.savedAt < 86400000) render(entries(saved.xml), saved.updated, true);
  } catch { /* Private browsing and corrupt cache must not hide the static cards. */ }

  async function refresh() {
    // 29-10: primero el RSS que guarda la tarea de GitHub en la propia web (datos/); lo demás, solo de reserva.
    const propio = new URL('../datos/youtube-feed.xml', new URL(document.currentScript?.src || scriptUrl));
    const local = new URL('../api/youtube-feed', new URL(document.currentScript?.src || scriptUrl));
    const remote = 'https://wow-forever-guia.pages.dev/api/youtube-feed';
    const endpoints = [...new Set([propio.href, local.href, remote])];
    for (const endpoint of endpoints) {
      try {
        const result = await fetch(endpoint, {signal: AbortSignal.timeout(12000), credentials: 'omit'});
        if (!result.ok) throw new Error('Feed unavailable');
        const xml = await result.text();
        const items = entries(xml);
        if (!items.length) throw new Error('Empty feed');
        const esPropio = endpoint === propio.href;
        const updated = result.headers.get('X-Feed-Updated') || (esPropio ? result.headers.get('Last-Modified') || '' : '');
        render(items, updated, !esPropio && result.headers.get('X-Feed-State') !== 'fresh');
        try { localStorage.setItem(cacheName, JSON.stringify({xml, updated, savedAt: Date.now()})); } catch {}
        return;
      } catch { /* The home server can use the public Pages feed when it has no endpoint. */ }
    }
    for (const grid of grids) {
      const status = grid.nextElementSibling;
      if (status?.matches('[data-youtube-status]')) status.textContent = label.unavailable;
    }
  }
  const scriptUrl = document.currentScript.src;
  refresh();
  // Refresh while an open page is visible; no timers run on the home PC.
  setInterval(() => { if (!document.hidden) refresh(); }, 3600000);
})();

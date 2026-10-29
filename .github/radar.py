"""Radar de novedades de WoW Forever (Van, 29-10-2026), para la IA de Muchamiel.

Cada hora lo ejecuta una tarea de GitHub en el repositorio de la web (.github/workflows/radar.yml). Lee las fuentes de
.github/radar/fuentes.json (Muchamiel puede añadir o quitar las que quiera desde GitHub) y escribe:
  .github/radar/RADAR.md   la lista de los últimos 7 días, la más nueva arriba, para pegársela a una IA
  .github/radar/vistos.json lo ya visto, para no perder lo que las fuentes dejan de listar
No usa claves ni cuentas: solo RSS públicos y el foro de Blizzard. Si una fuente falla, sigue con las demás.
Uso: python radar.py <carpeta del repositorio>"""
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

try:
    from zoneinfo import ZoneInfo
    ES = ZoneInfo('Europe/Madrid')
except Exception:  # sin datos de zonas: hora UTC
    ES = timezone.utc
UA = {'User-Agent': 'Mozilla/5.0 (radar de la web de Muchamiel; github.com/muchamielwow)'}
DIAS = 7
FIAB = {'oficial': 'Oficial de Blizzard', 'web': 'Web especializada', 'creador': 'Creador de contenido', 'comunidad': 'Comunidad (sin confirmar)'}


def bajar(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()


def limpio(t, n=300):
    t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t or ''))).strip()
    return t if len(t) <= n else t[:n].rsplit(' ', 1)[0] + '…'


def fecha(t):
    if not t:
        return None
    try:
        d = parsedate_to_datetime(t)
    except Exception:
        try:
            d = datetime.fromisoformat(t.strip().replace('Z', '+00:00'))
        except Exception:
            return None
    return (d if d.tzinfo else d.replace(tzinfo=timezone.utc)).astimezone(timezone.utc)


def hijo(e, *nombres):
    for n in nombres:
        for c in e.iter():
            if c.tag.split('}')[-1] == n and (c.text or c.attrib.get('href')):
                return c
    return None


def rss(f):
    raiz = ET.fromstring(bajar(f['url']))
    out = []
    for it in [e for e in raiz.iter() if e.tag.split('}')[-1] in ('item', 'entry')]:
        t = hijo(it, 'title')
        ln = hijo(it, 'link')
        enlace = (ln.attrib.get('href') or ln.text or '').strip() if ln is not None else ''
        d = hijo(it, 'pubDate', 'published', 'updated', 'date')
        desc = hijo(it, 'description', 'summary', 'content', 'encoded')
        out.append({'titulo': limpio(t.text if t is not None else '', 200), 'url': enlace,
                    'fecha': fecha(d.text if d is not None else ''), 'resumen': limpio(desc.text if desc is not None else '')})
    return out


def foro_blizzard(f):
    datos = json.loads(bajar('https://us.forums.blizzard.com/en/wow/groups/blizzard-tracker/posts.json'))
    out = []
    for p in datos.get('posts', []):
        out.append({'titulo': html.unescape(p.get('topic_title') or ''), 'resumen': limpio(p.get('excerpt')),
                    'url': f"https://us.forums.blizzard.com/en/wow/t/{p.get('topic_slug')}/{p.get('topic_id')}/{p.get('post_number')}",
                    'fecha': fecha(p.get('created_at')), 'categoria': p.get('category_id')})
    return out


def run(repo):
    base = Path(repo) / '.github' / 'radar'
    fuentes = json.loads((base / 'fuentes.json').read_text(encoding='utf-8'))['fuentes']
    fv = base / 'vistos.json'
    vistos = {v['url']: v for v in (json.loads(fv.read_text(encoding='utf-8')) if fv.exists() else [])}
    ahora = datetime.now(timezone.utc)
    fallos = []
    for f in fuentes:
        if f.get('activa') is False:
            continue
        try:
            items = foro_blizzard(f) if f.get('tipo') == 'foro-blizzard' else rss(f)
        except Exception as e:
            fallos.append(f"{f['nombre']}: {e}")
            continue
        filtro = [x.lower() for x in f.get('filtro', [])]
        for x in items:
            if not x['url'] or not x['fecha'] or x['fecha'] < ahora - timedelta(days=DIAS):
                continue
            if filtro and not any(k in (x['titulo'] + ' ' + x['resumen']).lower() for k in filtro) and x.get('categoria') not in (347, 349):
                continue
            if x['url'] not in vistos:
                vistos[x['url']] = {'url': x['url'], 'titulo': x['titulo'], 'resumen': x['resumen'], 'fecha': x['fecha'].isoformat(),
                                    'fuente': f['nombre'], 'idioma': f.get('idioma', '?'), 'fiabilidad': f.get('fiabilidad', 'comunidad')}
    lista = sorted(vistos.values(), key=lambda v: v['fecha'], reverse=True)
    lista = [v for v in lista if datetime.fromisoformat(v['fecha']) >= ahora - timedelta(days=DIAS)]
    fv.write_text(json.dumps(lista[:500], ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    hora = ahora.astimezone(ES).strftime('%d-%m-%Y %H:%M')
    md = [f'# Radar de WoW Forever · actualizado el {hora} (hora de España)', '',
          f'Novedades de los últimos {DIAS} días, la más nueva arriba. Fiabilidad: «Oficial de Blizzard» es seguro; '
          'lo demás hay que comprobarlo antes de darlo por hecho. Las fuentes se cambian en .github/radar/fuentes.json.', '']
    dia = None
    for v in lista:
        d = datetime.fromisoformat(v['fecha']).astimezone(ES)
        if d.strftime('%d-%m') != dia:
            dia = d.strftime('%d-%m')
            md += ['', f'## {d.strftime("%d-%m-%Y")}', '']
        md.append(f"- **{d.strftime('%H:%M')} · {v['fuente']}** ({v['idioma']}, {FIAB.get(v['fiabilidad'], v['fiabilidad'])}): "
                  f"[{v['titulo']}]({v['url']})" + (f" — {v['resumen']}" if v['resumen'] else ''))
    if fallos:
        md += ['', '## Fuentes que han fallado esta vez', ''] + [f'- {x}' for x in fallos]
    (base / 'RADAR.md').write_text('\n'.join(md) + '\n', encoding='utf-8')
    print('radar:', len(lista), 'novedades;', len(fallos), 'fuentes con fallo')


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv) > 1 else '.')

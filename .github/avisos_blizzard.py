"""Últimos avisos oficiales de Blizzard sobre WoW Forever (Van, 16-10-2026), para la portada y Noticias.

Lee los mensajes del equipo de Blizzard en su foro (grupo «blizzard-tracker») y se queda con los temas nuevos de los foros de
Forever (General y Beta) y con los de otros foros cuyo título hable de Forever. Escribe datos/avisos-blizzard.json.
Lo ejecuta una tarea de GitHub cada 20 minutos en el repositorio de la web (.github/workflows/avisos.yml) y también la
generación local, para que la versión subida salga con datos frescos. Guarda los anteriores: el foro solo lista los 20 últimos
mensajes de Blizzard de todo WoW, y los de Forever se perderían enseguida.
Uso: python avisos_blizzard.py <carpeta de la web>"""
import html
import json
import re
import sys
import urllib.request
from pathlib import Path

FORO = 'https://us.forums.blizzard.com/en/wow'
FOREVER = {347: 'Forever', 349: 'Beta'}
MAX = 12


def leer(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (avisos de la web de Muchamiel)', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def limpio(t, n=220):
    t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t or ''))).strip()
    return t if len(t) <= n else t[:n].rsplit(' ', 1)[0] + '…'


def nuevos():
    out = []
    for p in leer(FORO + '/groups/blizzard-tracker/posts.json')['posts']:
        titulo = html.unescape(p.get('topic_title') or '')
        cat = p.get('category_id')
        if p.get('post_number') != 1 or not (cat in FOREVER or 'forever' in titulo.lower()):
            continue
        out.append({'id': p['topic_id'], 'titulo': titulo, 'url': FORO + '/t/' + p['topic_slug'] + '/' + str(p['topic_id']),
                    'autor': p.get('username') or 'Blizzard', 'fecha': p['created_at'], 'resumen': limpio(p.get('excerpt')),
                    'foro': FOREVER.get(cat, 'Noticias')})
    return out


def run(web):
    f = Path(web) / 'datos' / 'avisos-blizzard.json'
    viejos = json.loads(f.read_text(encoding='utf-8'))['avisos'] if f.exists() else []
    try:
        todos = {a['id']: a for a in viejos}
        todos.update({a['id']: a for a in nuevos()})
    except Exception as e:  # sin red o el foro caído: se queda lo que había
        print('avisos: no se pudo leer el foro:', e)
        if f.exists():
            return
        todos = {}
    lista = sorted(todos.values(), key=lambda a: a['fecha'], reverse=True)[:MAX]
    f.parent.mkdir(parents=True, exist_ok=True)
    nuevo = json.dumps({'fuente': FORO + '/groups/blizzard-tracker/posts', 'avisos': lista}, ensure_ascii=False, indent=1) + '\n'
    if not f.exists() or f.read_text(encoding='utf-8') != nuevo:
        f.write_text(nuevo, encoding='utf-8')
    print('avisos:', len(lista))


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv) > 1 else '.')

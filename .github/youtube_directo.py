"""¿Está Muchamiel en directo en YouTube? (Van, 16-10-2026). El navegador del visitante no puede saberlo, así que lo mira la
tarea de GitHub cada 20 minutos (.github/workflows/avisos.yml) leyendo youtube.com/@muchamiel/live, y lo deja en
datos/directo.json, que lee assets/live.js. Solo reescribe el fichero si cambia (sin fecha dentro) para no hacer commits de más.
Uso: python youtube_directo.py <carpeta de la web>"""
import json
import re
import sys
import urllib.request
from pathlib import Path

URL = 'https://www.youtube.com/@muchamiel/live'


def mirar():
    req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept-Language': 'es-ES,es;q=0.9',
                                               'Cookie': 'CONSENT=YES+1; SOCS=CAI'})
    with urllib.request.urlopen(req, timeout=30) as r:
        h = r.read().decode('utf-8', 'replace')
    vivo = '"isLiveNow":true' in h
    m = re.search(r'<link rel="canonical" href="(https://www\.youtube\.com/watch\?v=[\w-]{11})"', h)
    t = re.search(r'<meta name="title" content="([^"]*)"', h)
    return {'youtube': bool(vivo and m), 'url': m[1] if vivo and m else URL, 'titulo': t[1] if vivo and t else ''}


def run(web):
    f = Path(web) / 'datos' / 'directo.json'
    try:
        d = mirar()
    except Exception as e:  # YouTube no responde: se queda lo que había (o «sin directo» si no había nada)
        print('directo: no se pudo mirar YouTube:', e)
        if f.exists():
            return
        d = {'youtube': False, 'url': URL, 'titulo': ''}
    nuevo = json.dumps(d, ensure_ascii=False, indent=1) + '\n'
    f.parent.mkdir(parents=True, exist_ok=True)
    if not f.exists() or f.read_text(encoding='utf-8') != nuevo:
        f.write_text(nuevo, encoding='utf-8')
    print('directo: youtube', d['youtube'])


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv) > 1 else '.')

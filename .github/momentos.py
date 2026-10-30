"""Mejores momentos de cada directo de Muchamiel (Van, 30-10-2026).

Lo lanza la tarea de GitHub .github/workflows/momentos.yml cada 15 minutos:
1. Mira si Muchamiel está en directo (YouTube /@muchamiel/live o la página de Twitch).
2. Si lo está, escucha el chat de Twitch por IRC en modo anónimo (solo lectura, la vía oficial y pública de Twitch)
   hasta que acaba el directo o se acerca el límite de 6 h de GitHub (la siguiente ejecución sigue en el mismo fichero).
3. Cuenta mensajes por minuto, detecta los picos, las marcas de los moderadores (!momento) y los raids y subs regaladas,
   y deja .github/momentos/<fecha>-<vídeo>.md (para leer) y .json (los datos), más el índice .github/momentos/README.md.

No guarda nombres de usuario ni mensajes de los espectadores: solo cuentas por minuto y palabras típicas de reacción.
Sí guarda el texto de !momento de Muchamiel y de los moderadores (es su nota).
Uso: python momentos.py <carpeta del repositorio> [--minutos-max N] [--rehacer]"""
import json
import re
import socket
import statistics
import sys
import time
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

CANAL = 'muchamiel'
YT_LIVE = 'https://www.youtube.com/@muchamiel/live'
TW_PAGE = 'https://www.twitch.tv/muchamiel'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept-Language': 'es-ES,es;q=0.9', 'Cookie': 'CONSENT=YES+1; SOCS=CAI'}
MADRID = timezone(timedelta(hours=1))  # hora de invierno; solo para mostrar
# Palabras típicas de reacción (en minúsculas). Se cuentan, nunca se guardan los mensajes.
REACCIONES = {
    'risa': re.compile(r'\b(kekw|lul|lol|lmao|omegalul|xd+|ja(ja)+|je(je)+|jsjs\w*|pff+)\b'),
    'sorpresa': re.compile(r'\b(pog\w*|wtf|omg|ostia|hostia|madre mia|que dices|no way|wow+)\b'),
    'f': re.compile(r'^\s*f\s*$'),
    'gg': re.compile(r'\bgg+\b'),
    'clip': re.compile(r'\b(clip|clipea|clipeo|clipealo|clipped)\b'),
}


def _get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read().decode('utf-8', 'replace')


def directo():
    """Devuelve {'vivo': bool, 'video': id de YouTube o '', 'inicio': epoch del inicio en YouTube o None, 'titulo': str}."""
    d = {'vivo': False, 'video': '', 'inicio': None, 'titulo': ''}
    try:
        h = _get(YT_LIVE)
        if '"isLiveNow":true' in h:
            m = re.search(r'<link rel="canonical" href="https://www\.youtube\.com/watch\?v=([\w-]{11})"', h)
            t = re.search(r'<meta name="title" content="([^"]*)"', h)
            s = re.search(r'"startTimestamp":"([^"]+)"', h)
            d.update(vivo=True, video=m[1] if m else '', titulo=t[1] if t else '')
            if s:
                d['inicio'] = datetime.fromisoformat(s[1].replace('Z', '+00:00')).timestamp()
    except Exception as e:
        print('momentos: YouTube no responde:', e)
    if not d['vivo']:
        try:
            if '"isLiveBroadcast":true' in _get(TW_PAGE):
                d['vivo'] = True
        except Exception as e:
            print('momentos: Twitch no responde:', e)
    return d


def escuchar(hasta, cada_cuanto_mirar=300):
    """Escucha el chat por IRC anónimo. Devuelve eventos (t, tipo, extra) hasta 'hasta' (epoch) o fin del directo."""
    eventos = []
    s = socket.create_connection(('irc.chat.twitch.tv', 6667), timeout=30)
    s.sendall(b'CAP REQ :twitch.tv/tags twitch.tv/commands\r\nPASS SCHMOOPIIE\r\nNICK justinfan%d\r\nJOIN #%s\r\n' % (int(time.time()) % 90000 + 10000, CANAL.encode()))
    s.settimeout(30)
    buf, ultimo_mirar, apagado = b'', time.time(), 0
    while time.time() < hasta:
        try:
            datos = s.recv(65536)
            if not datos:
                break
            buf += datos
        except socket.timeout:
            pass
        *lineas, buf = buf.split(b'\r\n')
        for raw in lineas:
            linea = raw.decode('utf-8', 'replace')
            if linea.startswith('PING'):
                s.sendall(b'PONG :tmi.twitch.tv\r\n')
                continue
            tags = {}
            if linea.startswith('@'):
                cab, _, linea = linea.partition(' ')
                tags = dict(kv.split('=', 1) for kv in cab[1:].split(';') if '=' in kv)
            m = re.match(r':\S+ (PRIVMSG|USERNOTICE) #\S+(?: :(.*))?$', linea)
            if not m:
                continue
            t = time.time()
            if m[1] == 'PRIVMSG':
                texto = (m[2] or '').strip()
                badges = tags.get('badges', '')
                manda = 'broadcaster' in badges or 'moderator' in badges
                if manda and texto.lower().startswith('!momento'):
                    eventos.append((t, 'marca', texto[8:].strip()[:120]))
                else:
                    low = texto.lower()
                    tipos = [k for k, rx in REACCIONES.items() if rx.search(low)]
                    eventos.append((t, 'msg', tipos))
            else:
                tipo = tags.get('msg-id', '')
                if tipo == 'raid':
                    eventos.append((t, 'raid', tags.get('msg-param-viewerCount', '?')))
                elif tipo in ('submysterygift',):
                    eventos.append((t, 'regalo', tags.get('msg-param-mass-gift-count', '?')))
                elif tipo in ('sub', 'resub', 'subgift'):
                    eventos.append((t, 'sub', ''))
        if time.time() - ultimo_mirar > cada_cuanto_mirar:
            ultimo_mirar = time.time()
            apagado = 0 if directo()['vivo'] else apagado + 1
            print(f'momentos: {len(eventos)} eventos; directo {"sigue" if apagado == 0 else "parece acabado"}')
            if apagado >= 2:  # 10 minutos sin directo: se acabó
                break
    s.close()
    return eventos


def analizar(d):
    """Calcula los momentos a partir de d['min'] (mensajes por minuto, desde el inicio) y las marcas/raids."""
    por_min = {int(k): v for k, v in d['min'].items()}
    if not por_min:
        return []
    ultimo = max(por_min)
    serie = [por_min.get(i, {}).get('n', 0) for i in range(ultimo + 1)]
    activos = [x for x in serie if x > 0]
    base = statistics.median(activos) if activos else 0
    momentos = []
    # Picos: el minuto supera mucho lo normal de los 20 minutos de alrededor y lo normal del directo.
    for i, n in enumerate(serie):
        vecinos = serie[max(0, i - 10):i] + serie[i + 1:i + 11]
        normal = statistics.median(vecinos) if vecinos else base
        if n >= max(8, 2.2 * max(normal, 1), 1.8 * max(base, 1)):
            r = por_min.get(i, {})
            reac = sorted(((v, k) for k, v in r.get('r', {}).items() if v >= 3), reverse=True)
            momentos.append({'min': i, 'n': n, 'normal': round(normal), 'tipo': 'chat', 'reac': [k for _, k in reac[:3]]})
    # Juntar picos seguidos (dos minutos o menos) y quedarse con el más alto.
    juntos = []
    for m in momentos:
        if juntos and m['min'] - juntos[-1]['hasta'] <= 2:
            j = juntos[-1]
            j['hasta'] = m['min']
            if m['n'] > j['n']:
                j.update(n=m['n'], normal=m['normal'], reac=m['reac'], pico=m['min'])
        else:
            juntos.append(dict(m, hasta=m['min'], pico=m['min']))
    juntos.sort(key=lambda j: j['n'] / max(j['normal'], 1), reverse=True)
    elegidos = juntos[:15]
    for e in d.get('eventos', []):
        elegidos.append({'min': e['min'], 'pico': e['min'], 'tipo': e['tipo'], 'extra': e.get('extra', '')})
    elegidos.sort(key=lambda j: j['pico'])
    return elegidos


NOMBRE_REAC = {'risa': 'risas', 'sorpresa': 'sorpresa', 'f': 'efes', 'gg': 'GG', 'clip': 'piden clip'}


def motivo(m):
    if m['tipo'] == 'marca':
        return 'Marca de Muchamiel o de un moderador' + (f': «{m["extra"]}»' if m.get('extra') else '')
    if m['tipo'] == 'raid':
        return f'Raid con {m["extra"]} personas'
    if m['tipo'] == 'regalo':
        return f'Le regalan {m["extra"]} subs'
    r = ', '.join(NOMBRE_REAC.get(k, k) for k in m.get('reac', []))
    return f'El chat explota: {m["n"]} mensajes en un minuto (lo normal ahí, {m["normal"]})' + (f'; sobre todo {r}' if r else '')


def hhmmss(minuto):
    return f'{minuto // 60}:{minuto % 60:02d}:00'


def escribir(repo, d):
    carpeta = Path(repo) / '.github' / 'momentos'
    carpeta.mkdir(parents=True, exist_ok=True)
    base = carpeta / d['id']
    momentos = analizar(d)
    d['momentos'] = momentos
    (base.with_suffix('.json')).write_text(json.dumps(d, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    inicio = datetime.fromtimestamp(d['inicio'], MADRID)
    total = sum(v['n'] for v in d['min'].values())
    l = [f'# Mejores momentos · directo del {inicio:%d-%m-%Y} ({inicio:%H:%M}, hora de España)', '']
    if d.get('titulo'):
        l.append(f'**{d["titulo"]}**  ')
    if d.get('video'):
        l.append(f'Vídeo en YouTube: https://www.youtube.com/watch?v={d["video"]}  ')
    l += [f'Chat de Twitch: {total} mensajes en {len(d["min"])} minutos con actividad.', '',
          'El minuto cuenta desde el inicio del directo en YouTube. El enlace abre el vídeo justo ahí '
          '(empieza un minuto antes para tener contexto). En el vídeo de Twitch puede variar unos segundos.', '']
    if not momentos:
        l.append('No ha habido picos claros en el chat.')
    else:
        l += ['| Minuto | Motivo | Abrir |', '|---|---|---|']
        for m in momentos:
            seg = max(0, m['pico'] * 60 - 60)
            enlace = f'[ver](https://www.youtube.com/watch?v={d["video"]}&t={seg}s)' if d.get('video') else ''
            l.append(f'| {hhmmss(m["pico"])} | {motivo(m)} | {enlace} |')
    l += ['', 'Cómo marcar un momento en directo: Muchamiel o un moderador escribe `!momento` en el chat de Twitch '
          '(con una nota si quiere: `!momento pull de Hogger`). Sale en esta lista.', '']
    (base.with_suffix('.md')).write_text('\n'.join(l), encoding='utf-8')
    # Índice
    filas = []
    for f in sorted(carpeta.glob('*.json'), reverse=True):
        try:
            x = json.loads(f.read_text(encoding='utf-8'))
        except Exception:
            continue
        ini = datetime.fromtimestamp(x['inicio'], MADRID)
        filas.append(f'| {ini:%d-%m-%Y %H:%M} | [{x.get("titulo") or x["id"]}]({f.stem}.md) | {len(x.get("momentos", []))} |')
    (carpeta / 'README.md').write_text('\n'.join(['# Mejores momentos de los directos', '',
                                                  'Una lista por directo, la más nueva arriba. La hace sola la tarea «Mejores momentos» de GitHub.', '',
                                                  '| Directo | Lista | Momentos |', '|---|---|---|'] + filas) + '\n', encoding='utf-8')
    print(f'momentos: {base.name}.md con {len(momentos)} momentos')


def run(repo, minutos_max=345):
    d0 = directo()
    if not d0['vivo']:
        print('momentos: Muchamiel no está en directo')
        return
    inicio = d0['inicio'] or time.time()
    clave = (datetime.fromtimestamp(inicio, MADRID).strftime('%Y-%m-%d') + '-' + (d0['video'] or 'twitch'))
    f = Path(repo) / '.github' / 'momentos' / (clave + '.json')
    d = json.loads(f.read_text(encoding='utf-8')) if f.exists() else {'id': clave, 'video': d0['video'], 'titulo': d0['titulo'], 'inicio': inicio, 'min': {}, 'eventos': []}
    hasta = time.time() + minutos_max * 60
    print(f'momentos: escuchando el chat hasta {datetime.fromtimestamp(hasta, MADRID):%H:%M}')
    for t, tipo, extra in escuchar(hasta):
        minuto = str(max(0, int((t - d['inicio']) // 60)))
        if tipo == 'msg':
            cel = d['min'].setdefault(minuto, {'n': 0, 'r': {}})
            cel['n'] += 1
            for k in extra:
                cel['r'][k] = cel['r'].get(k, 0) + 1
        elif tipo != 'sub':
            d['eventos'].append({'min': int(minuto), 'tipo': tipo, 'extra': extra})
    escribir(repo, d)


if __name__ == '__main__':
    args = sys.argv[1:]
    repo = args[0] if args else '.'
    mx = int(args[args.index('--minutos-max') + 1]) if '--minutos-max' in args else 345
    if '--rehacer' in args:  # vuelve a escribir los .md desde los .json (si se cambia el análisis)
        for f in (Path(repo) / '.github' / 'momentos').glob('*.json'):
            escribir(repo, json.loads(f.read_text(encoding='utf-8')))
    else:
        run(repo, mx)

# Talentos de la calculadora al día con talentsforever.com (Van, 16-10-2026: «que se actualice sola siempre»).
# Baja https://talentsforever.com/data.json (CC-BY-4.0, mismo formato que research/talents.json) y sustituye el
# bloque "talents" del <script id="talent-data"> de cada calculadora que se le pase; clases y builds de ejemplo no se tocan.
# En el PC lo llama comunidad_portal.run() (también guarda research/talents.json); en GitHub, la tarea talentos.yml
# lo ejecuta cada 6 horas sobre calculadora/ y en/calculadora/ (copia en .github/ del repo).
# Uso: python actualizar_talentos.py [--research research/talents.json] fichero.html [fichero.html ...]
import json, re, sys, urllib.request
from pathlib import Path

URL = 'https://talentsforever.com/data.json'
CLASES = ['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Shaman', 'Mage', 'Warlock', 'Druid']
BLOQUE = re.compile(r'(<script type="application/json" id="talent-data">)(.*?)(</script>)', re.S)


def bajar():
    req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0 (muchamielwow.github.io)'})
    with urllib.request.urlopen(req, timeout=60) as r:
        d = json.loads(r.read().decode('utf-8'))
    # Si el formato cambia, mejor no tocar nada que romper la calculadora.
    for c in CLASES:
        trees = d['talents'][c]['trees']
        assert len(trees) == 3, c
        for t in trees:
            assert t['name'] and t['talents'], c
            for x in t['talents']:
                assert x['name'] and x['max'] >= 1 and x['row'] >= 1 and x['col'] >= 1 and len(x['desc']) == x['max'], (c, x.get('name'))
    return d


def nombres(talents):
    return {c: {x['name'] for t in talents[c]['trees'] for x in t['talents']} for c in talents}


MESES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def fecha(d, s):
    # «Los datos locales fueron generados el 8/10/2026» y su versión inglesa, con la fecha del export.
    a, m, dia = (int(x) for x in d['generated'][:10].split('-'))
    s = re.sub(r'generados el \d{1,2}/\d{1,2}/\d{4}', f'generados el {dia}/{m}/{a}', s)
    return re.sub(r'generated on [A-Z][a-z]{2} \d{1,2}, \d{4}', f'generated on {MESES[m - 1]} {dia}, {a}', s)


def aplicar(d, fichero, presets=None, con_fecha=True):
    # con_fecha=False en web/base-gpt: la frase en castellano es la clave de la traducción inglesa.
    p = Path(fichero)
    s = p.read_text(encoding='utf-8')
    s = fecha(d, s) if con_fecha else s
    m = BLOQUE.search(s)
    if not m:
        print('sin talent-data:', fichero)
        return False
    datos = json.loads(m.group(2))
    nuevo = {c: {'trees': d['talents'][c]['trees']} for c in CLASES}
    if presets:  # en el PC: las builds de ejemplo de datos_clases (las guías enlazan a ellas)
        datos['presets'].update(presets)
    if datos['talents'] == nuevo and s == p.read_text(encoding='utf-8') and not presets:
        print('al día:', fichero)
        return False
    viejos, nuevos = nombres(datos['talents']), nombres(nuevo)
    for c in CLASES:
        mas, menos = sorted(nuevos[c] - viejos.get(c, set())), sorted(viejos.get(c, set()) - nuevos[c])
        if mas or menos:
            print(f'  {c}: +{mas} -{menos}')
    datos['talents'] = nuevo
    txt = json.dumps(datos, ensure_ascii=False).replace('</', '<\\/')
    s = s[:m.start(2)] + txt + s[m.end(2):]
    p.write_text(s, encoding='utf-8', newline='')
    print('actualizado:', fichero, '(datos del', d.get('generated'), ')')
    return True


ULTIMO = None  # en el PC, comunidad_portal baja una vez y aplica dos (base-gpt antes de generar, dist al final)


def main(args):
    global ULTIMO
    research = None
    if args[:1] == ['--research']:
        research, args = args[1], args[2:]
    d = ULTIMO = bajar()
    if research:
        Path(research).write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding='utf-8')
    return [aplicar(d, f) for f in args]


if __name__ == '__main__':
    main(sys.argv[1:])

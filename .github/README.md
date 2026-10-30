# Manual de la web de Muchamiel

Web: **https://muchamielwow.github.io** · Esta cuenta de GitHub (`muchamielwow`) es **de Muchamiel**: la web es suya.

Este manual existe para que la web siga funcionando pase lo que pase, aunque Van o su ordenador no estén.

## Qué es

- Una web estática (solo ficheros HTML, CSS, imágenes y JSON). No tiene base de datos ni servidor que mantener.
- La sirve **GitHub Pages** gratis desde este repositorio, rama `main`.
- Hay versión en inglés en `/en/`.

## Quién la hace

- Van y su asistente (Claude) la generan en el ordenador de Van con unos scripts de Python y la suben aquí ya hecha.
- **Si eso deja de pasar, la web sigue en línea tal cual.** No se cae: solo deja de recibir noticias nuevas.

## Lo que se actualiza solo (sin nadie)

En la carpeta `.github/workflows/` hay tres tareas automáticas de GitHub:

| Tarea | Cada cuánto | Qué hace |
|---|---|---|
| Avisos de Blizzard | cada 20 minutos | Lee los avisos oficiales y el estado del directo y actualiza `datos/` |
| Talentos de la calculadora | cada 6 horas | Actualiza los talentos de la calculadora |
| Radar de novedades | cada hora | Junta las novedades de Forever de las fuentes en `.github/radar/RADAR.md`, para tu IA |
| Mejores momentos | cada 15 min | Si estás en directo, escucha el chat de Twitch y al acabar deja la lista de mejores momentos en `.github/momentos/` |

Se ven en la pestaña **Actions** del repositorio. Si una falla, GitHub te avisa por correo; normalmente basta con esperar a la siguiente.

## Mejores momentos de cada directo (para tus vídeos largos)

- Cuando estás en directo, la tarea escucha el chat de Twitch (solo lee; no escribe nada ni guarda nombres ni mensajes de la gente) y cuenta los mensajes por minuto.
- Al acabar deja un archivo por directo en `.github/momentos/` con los picos del chat (risas, sorpresa, efes, gente pidiendo clip), los raids, las subs regaladas y las marcas: si tú o un moderador escribís `!momento` en el chat (con una nota si queréis: `!momento pull de Hogger`), sale en la lista.
- Cada momento trae el minuto y un enlace que abre tu directo de YouTube justo ahí.
- Para tu IA, el índice en texto limpio: https://raw.githubusercontent.com/muchamielwow/muchamielwow.github.io/main/.github/momentos/README.md (cada lista se abre cambiando README.md por el nombre del archivo).

## El radar de novedades (para tu IA)

- La lista está en `.github/radar/RADAR.md`. Para pegársela a una IA, este enlace da el texto limpio:
  https://raw.githubusercontent.com/muchamielwow/muchamielwow.github.io/main/.github/radar/RADAR.md
- Las fuentes están en `.github/radar/fuentes.json`. Son tuyas: añade o quita las que quieras con el lápiz ✏️ (copia una línea y cambia nombre y dirección). Para un canal de YouTube: `https://www.youtube.com/feeds/videos.xml?channel_id=` + el identificador del canal (empieza por UC).
- Si una fuente falla, sale al final de RADAR.md y las demás siguen funcionando.
- Las instrucciones para tu IA (el texto para pegarle) están en tu zona privada: https://muchamiel-privado.pages.dev → «Tu IA».

## Cómo cambiar algo a mano

1. Entra en https://github.com/muchamielwow/muchamielwow.github.io con la cuenta `muchamielwow`.
2. Busca el fichero (por ejemplo `index.html` es la portada; cada página es `carpeta/index.html`).
3. Pulsa el lápiz ✏️, cambia el texto y pulsa **Commit changes**.
4. En 1 o 2 minutos se ve en la web.

Ojo: si Van vuelve a subir la web generada, los cambios hechos a mano en las páginas se pisan. Lo que sí se respeta siempre es la carpeta **`marcas/`** (tu media kit) y `.github/`.

## Tu carpeta `marcas/`

Es tuya: Van nunca la toca. Sube ahí lo que quieras (Add file → Upload files).

## Lo imprescindible para no perder la web

- Tener la **contraseña** de la cuenta `muchamielwow` y el **correo de recuperación** a tu nombre.
- Activar la **verificación en dos pasos** (Settings → Password and authentication) y guardar los códigos de recuperación.
- Opcional: invitar a Van como colaborador (Settings → Collaborators) para que pueda subir cambios con su propia cuenta.

## Si algún día quieres dominio propio (muchamiel.tv o similar)

1. Compra el dominio en Cloudflare con tu cuenta.
2. Aquí: Settings → Pages → Custom domain → escribe el dominio.
3. En Cloudflare, añade el registro DNS que GitHub te indique.

Más detalles y precios: en tu zona privada (https://muchamiel-privado.pages.dev → «Web propia»).

## Contacto

Dudas: Van. Este manual no contiene contraseñas ni claves; no las pongas nunca en este repositorio, porque es público.

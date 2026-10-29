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

En la carpeta `.github/workflows/` hay dos tareas automáticas de GitHub:

| Tarea | Cada cuánto | Qué hace |
|---|---|---|
| Avisos de Blizzard | cada 20 minutos | Lee los avisos oficiales y el estado del directo y actualiza `datos/` |
| Talentos de la calculadora | cada 6 horas | Actualiza los talentos de la calculadora |

Se ven en la pestaña **Actions** del repositorio. Si una falla, GitHub te avisa por correo; normalmente basta con esperar a la siguiente.

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

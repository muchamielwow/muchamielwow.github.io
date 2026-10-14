# Muchamiel Lock PvP — 0.2.0 alpha

Autor: Van. Exclusivo de brujo para la beta de WoW Forever. Alpha 0.2.0 experimental, no una versión validada en el cliente. Descarga de prueba disponible en el apartado de Brujo de la guía; no presentarla como addon probado.

## Nuevo panel del rival (0.2.0)

Sustituye a la 0.1.0. `/mlp rival` abre objetivo/foco con catálogo para las nueve clases y raciales según raza. Intenta registrar usos a partir de eventos UNIT_SPELLCAST_SUCCEEDED legibles. Si la beta los restringe o no comunica un uso, no lo detecta: desconocido no significa disponible.

Los tiempos parten de GetSpellBaseCooldown cuando esté expuesto o de los segundos que configures manualmente. Son estimaciones base/manuales: no consulta cooldowns reales del enemigo, talentos, cargas ni cooldowns compartidos. Al expirar dice «Podría estar listo», no confirma que lo esté. Un Preparation/Cold Snap observado invalida las estimaciones anteriores.

Haz clic en un hechizo solo para marcar un uso que hayas visto. Puedes escribir segundos junto al botón y pulsar Enter; vacío borra la duración personalizada. `/mlp reset` borra observaciones cuando el contexto del duelo se reinicie. `/mlp diag` incluye disponibilidad de API de cooldown base y número de eventos legibles observados.

Defensivos: identifica algunos buffs prioritarios activos y su duración solo si es legible. Buffs mágicos: candidatos para Devour Magic, hasta tres, con prioridades; ser mágico o robable no garantiza que Devour Magic pueda quitarlo. La falta de datos no confirma ausencia de protección. Raciales por raza: Evasion no es inmunidad a Fear.

Las instalaciones nuevas activan rival, buffs mágicos y tótems. Las actualizaciones conservan tus módulos. DR real sigue requiriendo Forever Simple DR (/fdr), instalado aparte; el ZIP no lo incluye. No hay una aura importable: es un addon independiente.

## Referencia de parche

Revisado el 9 de octubre de 2026: las notas oficiales más recientes son del 8 de octubre. El anuncio de cliente de Blizzard del 22 de septiembre confirma la rama 1.60.1, pero las notas del 8 de octubre no escriben el número de compilación. No se presenta 70291 como confirmado por ese anuncio. El TOC 16001 es el utilizado por los addons Forever consultados; la confirmación exacta en cada instalación la da GetBuildInfo(), que el propio addon incluye en /mlp diag.

- https://us.forums.blizzard.com/en/wow/t/beta-client-update-september-22/2358655
- https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-8/2360696/5
- https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-known-issues-october-8/2352687

El 8 de octubre Blizzard anunció soporte del Cooldown Manager para clases, raciales y abalorios, y más soporte de consumibles en un parche futuro. La lista histórica de errores incluye cooldowns de Healthstone/pets y seguimiento de Banes/Curses al cambiar de objetivo; no se infiere que todos se hayan resuelto ni que todos permanezcan sin comprobar el cliente. No se limita Legacy a cinco puntos dentro del addon: las notas anuncian 16 Legacy Points de prueba, que no equivalen a 16 puntos de talento.

## Instalar y configurar

Copiar la carpeta MuchamielLockPvP en Interface/AddOns del cliente de Forever. Debe quedar Interface/AddOns/MuchamielLockPvP/MuchamielLockPvP.toc. Reiniciar o /reload y activar el addon en la lista.

`/mlp`: menú. Cada módulo tiene su casilla. Hay perfiles independientes Duelos/BGs, bloqueo y movimiento de paneles, tamaño, texto, sonidos, vista previa, vida/maná opcional de pet y botón explícito para activar placas de enemigos, pets y tótems fuera de combate. Se guardan los ajustes entre sesiones. Tres módulos están activos inicialmente; el resto se activa a elección.

`/mlp diag`: muestra versión y APIs presentes. Copiar el resultado y los errores para la revisión.

## Qué contiene esta alpha

- Healthstone: cantidad en bolsas; racial aprendida y cooldown si es legible. Todavía no muestra cooldown de objeto de Healthstone.
- Shards: cantidad y aviso de pocas reservas; umbral inicial 3.
- Demonio: estado y lista de habilidades de la barra actual, sin asumir Spell Lock a nivel 30. Todavía no muestra sus cooldowns.
- Buffs: Soul Link, armadura y Nightfall cuando sean identificables. No interpreta una ausencia de datos como ausencia confirmada de Soul Link.
- DoTs propios del objetivo: temporizadores únicamente legibles. Nombres ingleses; el filtro PLAYER pide a la API solo efectos propios.
- Casteos de objetivo/foco: texto y cuenta atrás legible. Barras gráficas y acceso mediante los mecanismos nativos de datos restringidos pendientes.
- Efectos del rival: hasta tres candidatos mágicos legibles, con prioridad. Defensivos activos y usos observados en el panel del rival; no seguimiento completo ni tiempos exactos.
- Tótems: detección experimental por nombres ingleses de placas visibles. Sin posiciones externas, sin eventos de combate bloqueados, sin garantía de identificar cada tótem.
- DR: panel de estado pendiente de integración. Usar Forever Simple DR para el seguimiento real; no se fabrica un temporizador de DR.

Los campos restringidos se indican, no se calculan eludiendo restricciones. Nada lanza hechizos, usa objetos, selecciona tótems ni envía mensajes a otros jugadores automáticamente.

## Pruebas pendientes dentro del juego

1. Confirmar versión con /dump GetBuildInfo() y carga sin errores.
2. Abrir menú, cambiar perfil, activar/desactivar, mover, cerrar y /reload: comprobar persistencia.
3. Probar en duelos amistosos Kick, Psychic Scream, Will of the Forsaken, resets, cambio de objetivo/foco, candidatos de Devour Magic y tótems. Comparar eventos observados y tiempos con los usos reales. Probar también mascota y DoTs.
4. Repetir en BG: comprobar restricciones y rendimiento.
5. Incorporar DR nativo, cooldowns de pet/objeto y ajustes de talentos/cargas/cooldowns compartidos tras validar qué datos permite Forever.

Pruebas de esta entrega: sintaxis Lua 5.1 y ejecución de casos simulados de usos, expiración, cambio de identidad, duración manual, resets, datos restringidos, filtro de buffs y nivel/raza. No equivalen a una prueba dentro del juego.

La UI actual ya muestra vida y maná. Esta alpha no los duplica para el jugador.

# Fototeca e interacciones — entrega 2026-10-11

## Implementado

- `/fototeca`, navegación y entrada visual en el hub: cassette, sol a franjas, neón, Polaroids, filtros por álbum, créditos y visor con flechas, Escape y retorno de foco. EN/ES usa el selector persistente existente. No se presentan fotos ficticias como recuerdos del club.
- Música instrumental original con Web Audio: Play por decisión del visitante, volumen, pausa y limpieza al abandonar la ruta o ocultar la pestaña. Enlace Spotify editable.
- Envíos de 1–8 fotos, una solicitud por imagen de hasta 3 MiB, reencodificación sin EXIF, consentimiento, desafío firmado, cuotas y almacenamiento privado. Registro de slots y reintentos de carga/finalización idempotentes.
- Colección Fototeca, bandeja editorial, aceptación al borrador privado y publicación admin. Revisiones concurrentes no sobrescriben cambios ni duplican fotos. Edición EN/ES, reemplazo, orden y retirada; miniaturas también en imágenes de eventos y otras fichas. Estado de publicación y guía de tres pasos visibles.
- Spotify e Instagram incrustados directamente, sin controles de cargar/cerrar. Spotify usa contenedor redondeado uniforme; los reproductores de países también se presentan directamente y se detienen al ocultar la ruta/pestaña.
- Niagara vuelve a moverse tras soltar el gesto y salir con el puntero; pausa segura durante interacción y foco de teclado. Globo: arrastre vertical táctil sin mover el documento y rotación manual del preview con una indicación de gesto.
- Actualización SQL aditiva para instalaciones existentes y presupuesto de cargas temporales. Limpieza en posteriores envíos: abandonos >1 h, rechazos >7 días, conservando referencias CMS/historial.
- Ante un fallo transitorio del CMS, una instancia reutiliza su última lectura pública validada durante un máximo de cinco minutos. Una lectura correcta reemplaza esa copia, incluidas las retiradas. Una instancia nueva o un fallo más largo utiliza los contenidos revisados del repositorio, cuya fototeca empieza vacía.

## Comprobación

96 pruebas unitarias aprobadas, lint sin errores/advertencias y build de producción; SQL ejecutado sobre Postgres/PGlite; contratos HTTP con servidor de producción y servicio REST de prueba; Chromium real para envío múltiple, bandeja, edición, publicación, visor, idioma, sonido y presentación 320/375/768/1440 px. Los datos e imágenes de pruebas son exclusivos del entorno local.

La revisión independiente señaló reintentos de finalización, conservación de cargas fallidas y lectura pública durante interrupciones; se corrigieron y se comprobaron con regresiones. Los reproductores externos pueden depender de cookies, restricciones del proveedor y disponibilidad; la prueba verifica nuestra integración y enlaces, no garantiza contenido de terceros.

## Pendiente en el entorno del fundador

Ejecutar [la actualización de Supabase](PHOTOTECA_SETUP.md), esperar el despliegue Preview y comprobar un envío real con las cuentas del club. No se ejecutó SQL contra su proyecto ni se verificó el despliegue remoto desde el entorno cloud. No hay nuevas dependencias ni servicios de pago. `main` permanece intacta; los hitos se envían a `work`.

## Corrección del nivel musical — 2026-10-11

El fundador informó que Play no producía sonido audible. Una prueba de Chromium con un analizador Web Audio conectado a la señal real reprodujo una salida de aproximadamente −49 dBFS al volumen inicial: el contexto funcionaba, pero las voces y la ganancia maestra atenuaban demasiado el sonido. Se ajustó únicamente la ganancia maestra, manteniendo los controles y el inicio por Play.

La regresión falló antes del ajuste y pasó después: nivel inicial aproximado −30 dBFS, pico máximo observado 0.53 (sin recorte), respuesta del volumen, silencio a cero, pausa/reinicio y limpieza al salir mediante navegación interna. La prueba está en `tests/phototeca-audio-browser.mjs`; utiliza AudioContext/AnalyserNode nativos y comprueba la señal, además del estado visual. Pasaron también las 96 pruebas unitarias, lint y build. Estas mediciones verifican la salida del navegador local; el dispositivo de audio del visitante y el despliegue remoto se comprueban al actualizar el preview.

## Reproducción portátil — 2026-10-15

El fundador siguió sin oír el mix en Chrome/Edge tras el ajuste anterior. No se ha identificado una causa única en su dispositivo; el estado de AudioContext y una señal interna no prueban que el visitante escuche música.

Se conserva la composición instrumental original, ahora renderizada a `public/audio/familia-mix.wav` mediante `node scripts/render-room-mix.mjs`: PCM mono 32 kHz, 20.87 segundos, bucle continuo, sin muestras ni servicios externos. El nivel RMS del archivo es 0.24 (0.096 al volumen inicial 0.4), frente al aproximadamente 0.03 documentado antes; los picos quedan por debajo de 0.9. El archivo evita depender del sintetizador y de temporizadores Web Audio durante la reproducción.

El botón y volumen controlan un elemento de audio nativo. La indicación de reproducción responde a sus eventos reales. No hay autoplay; se pausa al ocultar la pestaña o desmontar la ruta. Las pruebas comprueban el contenido PCM, nivel, margen y continuidad del bucle; la prueba de navegador comprueba carga, avance, pausa, volumen y salida de la ruta. La audición en el dispositivo del fundador debe confirmarse tras actualizar.

Validación de esta corrección: 98 pruebas aprobadas; lint final de los archivos afectados sin advertencias; compilación completa aprobada. El servidor entrega el WAV con HTTP 200, tipo audio/wav y hash idéntico al archivo probado; las solicitudes parciales devuelven 206. La revisión independiente detectó y se corrigió una carrera Play/Pausa durante la carga. No se pudo completar la prueba interactiva de navegador en esta sesión: la herramienta del navegador integrado devolvió ERR_NETWORK_IO_SUSPENDED y Chrome no estaba disponible. El script de regresión interactiva se actualizó, pero no se ejecutó aquí.

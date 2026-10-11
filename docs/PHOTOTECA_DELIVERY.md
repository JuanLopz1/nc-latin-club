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

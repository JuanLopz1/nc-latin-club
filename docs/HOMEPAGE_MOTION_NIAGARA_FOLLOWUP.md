# Movimiento y fila de negocios del inicio

11 de octubre de 2026. Entrega en `work`, conservando `main`.

## Corrección comprobada

La captura se pudo reproducir con `prefers-reduced-motion: reduce`: las animaciones se detenían según el sistema, y un error real de ancho dejaba las cuatro palabras de la franja agrupadas a la izquierda en escritorio. La franja estática ahora ocupa todo el ancho disponible. Esto reproduce el síntoma; no confirma cuál es la configuración del dispositivo del fundador.

Junto al selector de idioma se incorpora un control EN/ES con tres opciones: seguir el dispositivo (predeterminada), activar animaciones o reducirlas. La elección se guarda en el navegador y se aplica tanto al CSS como al globo, revelados, parallax, calendario y desplazamientos programados. Si el almacenamiento falla, la elección funciona durante la sesión. El inicio muestra una explicación y un botón para activar animaciones cuando el movimiento está reducido.

La franja animada mantiene su ciclo continuo de 28 segundos. No se fuerza movimiento a quien solicita reducirlo; activar animaciones requiere una elección explícita.

## Discover Latin Niagara

La fila del inicio contiene los 21 negocios del directorio una vez cada uno, comenzando con cocobar, La Paisana tienda y Origen. La Paisana restaurante conserva su propia tarjeta. Cada enlace abre su ficha en `/niagara`.

La fila avanza a 18 px por segundo y vuelve en sentido contrario al alcanzar el extremo, sin saltar al comienzo ni duplicar enlaces. Se puede arrastrar con ratón, deslizar en móvil, usar anterior/siguiente y navegar con flechas, Inicio y Fin. La interacción manual detiene el avance; el control permite reanudarlo. El avance se pausa fuera de pantalla, con la pestaña oculta, al pasar el ratón o al enfocar la fila. En movimiento reducido conserva la navegación manual.

Raíces mantiene sus tres países destacados. No se añaden dependencias, fotografías, destinos ni contenido comercial inventado.

## Verificación

- `npm test`: 70 pruebas aprobadas, incluyendo los 21 enlaces bilingües y el fallo de escritura de almacenamiento.
- `npm run lint` y `npm run build`: aprobados.
- Chromium sobre build de producción: preferencia del sistema, activación explícita, persistencia, cambios de preferencia en vivo, revelados, avance real, arrastre sin navegación accidental, botones, teclado y gesto táctil nativo.
- Presentación sin desbordamiento horizontal a 320, 375, 768, 1440 y 1920 px; capturas de escritorio y móvil revisadas.
- Regresiones del inicio, Familia, idioma, Instagram bajo activación, metadatos, agenda, calendario y directorio comprobadas en navegador.
- Regresión del globo completo con los 55 destinos: giro inicial, pausa táctil, selección, zoom, teclado, territorios pequeños, retorno desde páginas culturales y alternativa sin WebGL.

La disponibilidad del despliegue remoto de Vercel se verifica por separado; estas pruebas corresponden al build local de producción.

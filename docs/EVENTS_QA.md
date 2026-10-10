# Events y calendario — evidencia de entrega

Revisión: 10 de octubre de 2026. Implementación pública `ba5c36c` y correcciones finales `8a240dd` en `work`. Los hitos anteriores de contratos, estructura compartida, galería y calendario se verificaron y pushearon por separado.

## Comprobaciones ejecutadas

| Comprobación | Evidencia |
| --- | --- |
| Fechas y contenido | `npm run test:events`: 15/15 pruebas, incluyendo regresiones del inicio para cancelación, reprogramación, fin y carga del reloj. Medianoche exclusiva, fin posterior, ausencia de fin, fechas culturales, horario de verano de Toronto, años bisiestos, orden de listas y validación editorial. |
| Imágenes | Render vacío/una/varias, alt traducido, controles nombrados y miniatura seleccionada; archivos locales de las entradas públicas comprobados. |
| Calidad/compilación | `npm run lint`, `NEXT_TELEMETRY_DISABLED=1 npm run build` y `git diff --check` terminan con código 0. |
| Calendario en Chromium | Cuadrícula de 42 días, categorías vacías, selección del 23 de octubre, fin a medianoche que no ocupa el 24, clics rápidos, cruce de diciembre/enero, Hoy en Niagara con visitante en Asia/Tokyo. |
| Navegación en producción | Inicio ES → agenda → detalle → retorno mantiene idioma, categoría, vista y día. Acceso directo vuelve a la categoría del detalle. Una URL ajena responde HTTP 404 y muestra la página propia. |
| Diseño/controles | EN/ES y anchos 320/375/760/1100/1440 sin overflow de página; menú móvil y Escape; foco visible; animación direccional real de 220 ms y eliminación de movimiento bajo `prefers-reduced-motion`. |
| Fixtures locales de galería | Cero/una/tres imágenes, anterior/siguiente, miniaturas, índice al traducir, reinicio al abrir otro detalle, teclado, swipe y scroll suave. Imagen inválida presenta fallback y no bloquea navegación ni datos. |
| Fixtures locales de entradas | Cancelación sin inscripción; reprogramación con horario vigente/aviso; fecha cultural de día completo y ámbito sin tickets ni organizador de encuentro; retorno de entrada regional selecciona Out of NC. |

Las pruebas de interacción usaron Chromium mediante CDP en este entorno. La galería y los estados futuros se probaron con una colección y archivos temporales en un servidor local de verificación. Se respaldaron los originales; un bloque `finally` restituyó datos, configuración y medios incluso ante un fallo. La compilación final se hizo después de la restitución. Ninguna fixture ni imagen de prueba se pusheó.

Se detectó y corrigió una lectura de `params` antes del límite de carga de Next.js Partial Prefetching: la advertencia se reprodujo y dejó de aparecer después de introducir Suspense. El identificador de scroll suave del layout permite a Next.js manejar correctamente el desplazamiento entre rutas. El guard de rutas usa la misma colección para devolver 404 antes de iniciar el streaming.

## Contenido y límites

Latin Fiesta es la única entrada pública: datos de capturas aportadas por el fundador, no consulta en vivo ni sincronización. No se proporcionó un póster o álbum autorizado para esa entrada. Las galerías admiten múltiples medios locales, pero la interfaz de carga/ordenación para administradores todavía no existe.

Los reintentos a fuentes públicas volvieron a recibir CONNECT 403. Out of NC y Fechas latinas permanecen vacías hasta verificar contenido. Consulte [Events Research](EVENTS_RESEARCH.md). No se infieren próximas ediciones de publicaciones antiguas.

La navegación interna conserva idioma y filtros; una recarga inicia EN. Filtros en URL, `/es`, metadatos traducidos, CMS y actualización automática desde NC Engage siguen pendientes. Los futuros datos del CMS deben alimentar tanto las pantallas como el guard de slugs publicados.

La comprobación de Git verifica igualdad entre HEAD y `origin/work`. El estado Ready de Vercel no pudo consultarse independientemente desde este entorno. No se modificó `main`.

## Revisión independiente final

Un revisor independiente examinó `1077fdc..ba5c36c`, diseño, plan y decisiones, y repitió comprobaciones específicas de fechas y retorno. Detectó dos problemas importantes en el inicio: inscripción de cancelados y ediciones terminadas aún descritas como próximas. Ambos se reprodujeron con pruebas nuevas que fallaron antes del arreglo y pasaron después; el inicio usa ahora la clasificación temporal y reloj compartidos, muestra avisos de estado y oculta la inscripción cancelada. La suite quedó en 15/15; lint y build volvieron a pasar. En producción, Chromium también comprobó que el inicio retira el evento al llegar a medianoche en Niagara sin recarga y que la agenda lo conserva en Pasados, con visitante en Asia/Tokyo. El recorrido completo inicio → agenda → detalle → retorno volvió a pasar.

Hallazgo menor aplazado: si falla la miniatura de una imagen distante cuya diapositiva todavía no se ha cargado, puede mostrarse un icono roto hasta abrir esa diapositiva. Su fallback actual depende del error de la imagen principal; el acceso al evento y la navegación permanecen disponibles. Un fallback independiente de miniaturas es mejora pendiente.

Límites de la revisión: no se verificó precisión actual de fuentes bloqueadas, lectores de pantalla reales, dispositivos táctiles físicos ni el estado remoto de despliegue. La evidencia de interacción corresponde a Chromium con emulación.

## Decisiones de ejecución y sus límites

1. Se mantuvo el checkout `work` acordado para preservar su flujo de push y preview. Esto ofrece menos aislamiento si otro editor cambia simultáneamente los mismos archivos; se revisó el estado antes de cada commit.
2. Los scripts de registro de la skill no estaban expuestos por su paquete cloud. Se llevó un registro manual equivalente; podría diferir el formato de auditoría, sin impacto en la interfaz.
3. Next.js con Cache Components puede iniciar un detalle inexistente con HTTP 200; se añadió un guard de slugs de la misma colección antes de streaming. Un futuro CMS debe mantenerlo alineado con sus entradas publicadas.
4. La plantilla `code-reviewer.md` tampoco estaba disponible en la skill cloud. Se entregó al revisor independiente un paquete manual con rango completo, diseño, plan, focos y decisiones; el formato puede diferir, por eso se pidieron severidad, evidencia y límites explícitos.
5. La exactitud actual de las fuentes externas sigue sin consulta en vivo. Se conservan datos capturados por el fundador y procedencia visible; precios, disponibilidad o cancelaciones posteriores podrían haber cambiado.
6. La interacción se sustenta en Chromium, emulación táctil, teclado y atributos accesibles. Sin dispositivos físicos ni lectores de pantalla reales, pueden quedar problemas específicos de esos entornos.
7. La entrega verifica SHA remoto y producción local. El estado Ready de Vercel no se consultó; podría quedar un fallo específico del hosting.

## Paquete aportado: eventos y calendario, 10 octubre 2026

30/30 pruebas completas, ESLint y build Next aprobados (244 páginas generadas). Chromium sobre build actual: dos festivales externos próximos, nueve archivados, Muertos+LATAFF el 24 octubre, octubre cultural y Día de Muertos en noviembre, 13 sesiones y enlaces LATAFF, hora desconocida Burlington, fin inclusivo Posadas, rutas nuevas HTTP200. Calendario cultural y detalle largo caben a 320/375/760/1100/1440. Flujo previo Latin Fiesta, navegación EN/ES, regresar, animación/reduced-motion y HTTP404 sigue pasando sin excepciones. No se probaron dispositivos físicos ni lectores de pantalla. Ningún medio marcado permission_required fue publicado.

Revisión final y correcciones: suite 31/31. Prueba RED→GREEN sobre LATAFF: sin hora de cierre en última función conserva Próximos hasta fin de su último día; con cierre documentado archiva a esa hora. Regresión Chromium RED→GREEN sobre detalle de última tarjeta: visible, aria-controls, anuncio, foco conservado, Tab al panel, Escape, detalle desde pin. Lint sin avisos y build aprobados. Instalación reproducible `npm ci --cache /workspace/.npm --no-audit --no-fund`, servidor dev y peticiones Niagara/Muertos/hero verificados; Node24.19.0, npm12.2.0. Borrador de entorno actualizado con install_script/start_skill y dominios, aún no aplicado/publicado.

## Ajustes del fundador: filtros y celebraciones mensuales

La agenda empieza con At NC, Out of NC y Fechas latinas seleccionadas juntas; cada botón se activa/desactiva independientemente. Todos y Deseleccionar todos permiten reiniciar la selección. Un acceso directo al detalle vuelve con todas las categorías; navegar desde la agenda conserva la selección múltiple, vista, mes y día.

Festas Juninas y Latin American Heritage Month (2026/2027) llevan `calendarDisplay: "month"`: aparecen una vez en «Este mes», con ámbito y enlace al detalle. No suman badges ni tarjetas diarias. Los rangos de pocos días y los eventos reales conservan su comportamiento; el archivo sigue usando la fecha final real en Niagara. La validación rechaza periodos incompletos etiquetados como un mes entero.

Verificación: 38/38 pruebas Node, build de 244 páginas y lint; pruebas de navegador en `tests/agenda-directory-browser.mjs` y `tests/niagara-browser.mjs`. Se cubren selección múltiple/vacía, archivo externo, bloque mensual y traducción, retorno de detalle, cruce de año, movimiento reducido, filtros de Niagara, selección/cierre por tarjeta y pin, foco/Tab/Escape y anchuras 320/375/768/1440. Las comprobaciones de la última ejecución se registran en DELIVERY_NIAGARA_AGENDA.md.

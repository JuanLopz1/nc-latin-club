# Events y calendario latino — diseño propuesto

Fecha: 10 de octubre de 2026. Estado: propuesta para revisión del fundador; no se ha implementado este subsistema.

## Propósito y punto de partida

Ayudar a estudiantes y jóvenes latinos en Niagara a encontrar encuentros del college, actividades latinas de la región y fechas culturales. El visitante debe poder elegir un evento, entender cuándo y dónde ocurre y abrir la inscripción del organizador.

El fundador aprobó el estilo de festival urbano nocturno y pidió incluir eventos fuera de NC. El inicio ya publica Latin Fiesta!, organizada por International, con datos de las capturas y enlace NC Engage aportados por el fundador. La colección local, el selector EN/ES y las tarjetas existen; solo hay una página de inicio, sin calendario, detalles ni administración.

## Enfoque recomendado

Construir el recorrido público completo con datos locales y componentes compartidos. Esto permite revisarlo en Vercel y preparar los campos que después editarán los administradores.

Crear primero solo las pestañas del inicio sería más pequeño, pero seguiría faltando el recorrido de calendario y detalle. Empezar por el backend requeriría elegir servicios y preparar administración antes de validar la experiencia pública. Esta entrega no necesita cuentas, dependencias nuevas ni servicios externos.

## Pantallas y estilo

**Inicio:** conservar el diseño actual y la sección Events. Añadir un enlace a la agenda completa y enlazar el título de Latin Fiesta con su detalle. La navegación principal Events abrirá `/events`; los enlaces existentes a `/#events` seguirán funcionando.

**`/events`:** título grande, fondo azul nocturno, amarillo luminoso y acentos coral/cian. Las tarjetas tendrán fecha destacada y tratamiento gráfico de cartel. En móvil los controles se distribuyen en varias filas y la agenda mantiene una sola columna, sin desplazamiento horizontal.

Tres categorías claramente separadas:

- **At NC / En NC:** encuentros del college, incluidos los organizados por International u otros grupos. Mostrar siempre el organizador real.
- **Out of NC / Fuera de NC:** eventos latinos de la región de Niagara. Toronto y otras regiones quedan fuera del alcance inicial propuesto.
- **Latin dates / Fechas latinas:** celebraciones culturales documentadas. Una fecha cultural no anuncia un encuentro, no ofrece tickets y no atribuye organización al club.

Cada categoría permite alternar **List / Lista** y **Calendar / Calendario**. La lista ofrece próximos y pasados; el calendario muestra todas las entradas del mes seleccionado sin aplicar ese filtro temporal. Cambiar de categoría conserva mes y vista. Cambiar idioma conserva todos los filtros y la fecha seleccionada.

**Calendario:** semana de lunes a domingo, botones mes anterior/siguiente y volver a hoy. Cada día con entradas muestra cantidad o marcas con texto accesible. Elegir un día actualiza una lista de entradas debajo del calendario; desde esa lista se abre el detalle. Los días sin entradas se pueden seleccionar y explican que no hay actividades publicadas. Se evita llenar las celdas móviles con títulos largos.

**`/events/[slug]`:** título, categoría, descripción, inicio y fin completos, lugar, ciudad si está confirmada, organizador, precio y reglas de invitados cuando existan. Inscripción externa en nueva pestaña con aviso accesible y enlace a la fuente. Latin Fiesta conserva su nombre y la atribución a International. Una entrada cancelada muestra el aviso y oculta el botón de inscripción; una reprogramada muestra la fecha vigente y un aviso descriptivo. Un slug inexistente devuelve 404.

Las fechas culturales usan el mismo recorrido de detalle, pero muestran fecha de día completo, país o ámbito y fuente editorial, sin campos de entradas ni organizador de un encuentro.

## Navegación e idiomas

Extraer encabezado, pie y control de idioma a una estructura compartida en el layout. Usar `next/link` para el recorrido interno y conservar correo, patrocinio NCSAC, menú móvil, Escape, enlaces de inicio y accesibilidad actuales.

El inglés sigue siendo el idioma inicial. Un proveedor de idioma compartido mantiene EN/ES durante la navegación interna y actualiza `document.documentElement.lang`. El inicio consume ese mismo estado; sus textos no se duplican. Los metadatos iniciales de las nuevas rutas serán descriptivos en inglés.

Esta entrega conserva el mecanismo de idioma del prototipo: una recarga completa comienza en inglés. Las rutas `/es`, metadatos localizados y persistencia entre visitas quedan para un hito de internacionalización. Es una propuesta de alcance distinta de la estrategia `/es` sugerida en el roadmap; debe aprobarse antes de implementar.

Los filtros permanecen en estado del navegador, sin prometer enlaces que compartan mes o categoría. El detalle tiene URL estable y puede compartirse directamente. El control de retorno desde un detalle abierto dentro de la agenda usa el contexto conservado en el layout para recuperar categoría, mes y vista; un acceso directo al detalle vuelve a la categoría correspondiente en la agenda con valores iniciales.

## Contenido y contratos

Separar tipos, datos, funciones de fechas y presentación. El inicio, la lista, el calendario y el detalle consumen la misma colección. Los componentes reciben datos; no conocen un proveedor de CMS.

Una entrada de encuentro contiene:

- ID y slug estables; tipo `event`; categoría `at-nc` u `out-of-nc`.
- Título, descripción, lugar, organizador y admisión en EN/ES; ciudad cuando esté confirmada. Para Out of NC, ciudad y organizador son obligatorios.
- Inicio con offset; fin con offset cuando esté confirmado.
- Estado `scheduled`, `cancelled` o `rescheduled`; aviso bilingüe obligatorio para los dos últimos.
- URL de fuente, fecha de revisión editorial y procedencia de la información; inscripción HTTPS opcional.
- Imagen y texto alternativo bilingüe opcionales, solo si hay un archivo autorizado disponible.

Una entrada cultural contiene ID, slug, tipo `cultural-date`, título y descripción EN/ES, fecha `YYYY-MM-DD`, país o ámbito, fuente y fecha de revisión editorial. No genera recurrencias anuales automáticamente: cada año se revisa su fecha.

La colección inicial tiene Latin Fiesta y ninguna entrada regional o cultural. Su ciudad y dirección exacta no se deducen de “The Core”. La fuente se registra como capturas proporcionadas por el fundador y URL NC Engage, sin afirmar verificación en vivo. No se usa la ilustración ficticia del inicio como fotografía del evento. Sin un póster autorizado, la tarjeta usa tipografía y fecha.

## Reglas de fechas

Los encuentros se presentan siempre en `America/Toronto`, independientemente del huso horario del visitante. “Hoy” se obtiene del reloj de ejecución en Niagara y no queda fijado a la fecha de compilación de Vercel. La inicialización evita diferencias de hidratación entre servidor y navegador.

Un encuentro aparece en cada día que ocupa, con intervalo de inicio incluido y fin excluido. Latin Fiesta va de 23 de octubre de 2026 a las 20:00 a 24 de octubre a las 00:00: ocupa la celda del 23; el detalle muestra explícitamente que termina el 24. Si termina después de medianoche, ocupa ambos días. Un encuentro sin fin confirmado aparece únicamente en el día de inicio.

En la lista, un encuentro permanece entre próximos/en curso hasta su fin; sin fin, se considera pasado después del inicio. Las entradas canceladas conservan su posición temporal y el aviso. Una fecha cultural es próxima durante todo su día local y pasa a anteriores al día siguiente.

Las fechas culturales se comparan como fechas de calendario. No se convierten a medianoche UTC, evitando que cambien de día al mostrarlas en Niagara. Las funciones aceptan un reloj de referencia para comprobar estos casos sin modificar contenido público.

## Estados vacíos, fuentes y errores

Out of NC comienza con “Estamos reuniendo eventos latinos de Niagara”, acompañado de un enlace al correo del club para sugerencias. Fechas latinas explica que las celebraciones aparecerán después de revisión. Meses y días vacíos conservan navegación y controles de categoría.

Las entradas se revisan antes de publicarse y muestran fuente. La selección regional no promete recoger todos los eventos ni sincronizar automáticamente precios, disponibilidad o cancelaciones. La búsqueda regional se realiza cuando haya acceso a fuentes públicas; el bloqueo de red observado no autoriza inventar datos ni obtenerlos de páginas privadas.

No se publican entradas con identificadores duplicados, fecha inválida, fin anterior al inicio, categoría incompatible o campos obligatorios incompletos. La validación del contenido informa el error durante las verificaciones previas al despliegue. Los enlaces externos se limitan a HTTPS.

## Accesibilidad y verificación

Controles con nombres traducidos, estados de selección accesibles y foco visible. Las categorías y vistas pueden usar botones con `aria-pressed`; cada día es un botón con fecha y cantidad de entradas en su nombre accesible, sin declarar un patrón ARIA de grid que no se implemente. Tab y Enter/Espacio permiten recorrer y activar los controles. Los cambios de mes y resultados se anuncian brevemente sin mover el foco por sorpresa. El menú mantiene cierre con Escape y recuperación de foco.

Comprobar con el mismo conjunto de datos: inicio/lista/detalle coincidentes, calendario vacío, varios eventos en un día, fin a medianoche y después de medianoche, cambio de mes y año, horario de verano y fechas culturales sin desplazamiento. Los casos ficticios solo existen en verificaciones locales.

En navegador comprobar EN/ES, idioma conservado entre rutas, filtros conservados al volver, 404, registro externo, cancelación y ausencia de inscripción cuando no hay URL. Revisar teclado, contraste, movimiento reducido y anchos de 320 px a escritorio. Ejecutar lint y build antes del commit y push a `origin/work`; verificar SHA remoto. No modificar `main`.

## Límites y resultado de esta entrega

No incluye portal admin, búsqueda automática de eventos, compra de tickets, formularios que envíen mensajes, cuentas, minijuegos ni el mapa definitivo. El único contenido público de partida es el evento aportado por el fundador. Staff y mapa conservan su orden posterior en el roadmap.

La entrega estará completa cuando se pueda pasar de inicio a agenda, cambiar categoría/vista/mes, seleccionar un día, abrir un detalle y volver; el contenido coincide y los controles funcionan en móvil y en ambos idiomas. Las pestañas regional y cultural pueden estar vacías sin bloquear el lanzamiento de la agenda. El diseño visual del inicio aprobado se conserva.

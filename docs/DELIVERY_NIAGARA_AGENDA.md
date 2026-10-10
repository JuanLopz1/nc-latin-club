# Niagara y agenda — entrega del 10 octubre 2026

Se entregan `/niagara`, entrada desde el hub y contenido real de eventos/calendario. Se conservan el diseño nocturno, EN/ES, identidad, Instagram y Latin Fiesta del fundador.

- 21 fichas, 16 destinos en 15 puntos, filtros por búsqueda/ciudad/categoría/modalidad y directorio independiente del proveedor. CoCo confirmado y La Paisana tienda/restaurante separados; El Camino, Taco N Tequila y Sombra incluidos sin destinos inventados. Dos negocios por encargo mantienen canales y no publican dirección privada.
- 11 eventos externos con fechas, direcciones, detalles y fuentes, 13 funciones de LATAFF, nueve ediciones archivadas al 10 octubre. Precios desconocidos y horarios no publicados conservan esa condición. Brazilfest archivado con fechas provisionales y aviso.
- 225 ocurrencias culturales de 2026/2027 con ámbito específico y temporadas inclusivas. No se importan los 327 feriados como descansos de Ontario. Globo de países separado.
- Los medios `permission_required` siguen fuera de public; la galería existente permite una o más imágenes autorizadas. Portal de cargas/admin es futuro.

## Evidencia

Suite31/31, lint sin avisos, build244páginas. Navegación de Fiesta/404/idioma/reduced-motion preservada. Chromium 320–1440, filtros/pins/unidades, calendario cultural/rangos, archivo y sesiones. Regresiones RED→GREEN: panel junto a tarjeta con navegación/foco; última sesión sin cierre no archiva al empezar. Arrastre, zoom, reset con redondeo, cambio de idioma sin recentrado y pinch emulado pasan. No se verificaron lectores de pantalla ni dispositivos físicos.

Revisión fresca independiente: dos importantes corregidos, ningún crítico. El hallazgo menor de canales Web/Facebook duplicados se resuelve en el ajuste posterior de fichas. Fuentes comerciales y teselas no pueden comprobarse en vivo por CONNECT403; no se afirman accesos exitosos. Las fichas y destinos documentados siguen utilizables.

## Decisiones tomadas

1. Continuar sin nueva aprobación y push a work: autorización explícita del fundador. Riesgo si la interpretación fuera incorrecta: cambios reversibles en work.
2. Transpilar pruebas a ES2017 como la aplicación: el valor por defecto ES5 vaciaba iteradores Map. Riesgo: diferencias con compilación real; build y navegador se verificaron también.
3. El Camino/Sombra quedan visibles con fuente documentada y aviso de canal faltante: inclusión autorizada, investigación bloqueada. Riesgo: contacto comercial incompleto hasta recibir enlace.
4. Brazilfest mantiene fechas provisionales en archivo: agenda secundaria aportada y diferencia de duración primaria. Riesgo: corregir fechas históricas tras aclaración.

## Pendientes concretos

Canal comercial y destino público de El Camino/by McNips y Sombra; destino de Taco N Tequila. St. Paul Barber Shop, Dulces Castillo, Artesanía I AM y Nacho Business conservan seguimiento individual; Eh José, El Pinche Taco y Plaza Fiesta requieren aclarar señales de cierre antes de mostrarlos activos. Ver NIAGARA_RESEARCH.md. Ninguno fue descartado por defecto.

Instalación y arranque reproducibles verificados; install_script/start_skill guardados. Dominios adicionales de investigación y OSM guardados en borrador de configuración; aplicarlo/publicarlo desde configuración del entorno habilita el reintento, no prueba conectividad por sí solo. No hacen falta secretos para estas funciones.

Push verificado a origin/work en cada hito, main sin cambios. No se verifica estado Ready de Vercel desde este entorno.

## Ajustes de experiencia solicitados después de la entrega

- Agenda: las tres categorías activas al entrar, combinación de varias, deselección individual y controles Todos/Deseleccionar todos. El regreso desde un detalle conserva esa selección; una entrada directa vuelve con todas.
- Celebraciones mensuales: cuatro ocurrencias de Juninas/Latin American Heritage Month se muestran una vez en «Este mes», con fuente y detalles accesibles. No se repiten en cada día ni en los contadores. Sus fechas finales reales siguen determinando el archivo; Muertos/Posadas y otros rangos breves se mantienen diarios.
- Niagara: ciudad, categoría y modalidad permiten varias opciones y empiezan completas. Una selección vacía da cero resultados, Limpiar filtros recupera todo. Las opciones se combinan en cada grupo y se intersectan entre grupos/búsqueda.
- Una sola tarjeta por negocio: pin y botones expanden la ficha original; no hay otro panel repitiendo título, descripción, dirección y acciones. Toggle/Escape cierran; el foco y la selección del mapa siguen conectados. Los canales comerciales repetidos se muestran una vez.
- Crear, editar, retirar fichas, gestionar imágenes y buscar por `#etiquetas` quedan definidos en ROADMAP para el portal autenticado futuro; no hay CRUD ni búsqueda por tags activados en esta entrega.

Validación de esta actualización: 38 pruebas Node, lint sin avisos, build de 244 páginas; producción local nueva y dos recorridos Chromium. Selección múltiple/vacía, archivo, banner mensual, EN/ES, regreso de detalle, año nuevo, movimiento reducido, filtros/pins, ficha única y navegación de teclado; sin desbordamiento de 320 a 1440 px. Capturas locales fuera del repositorio en `/workspace/artifacts`. Las verificaciones locales no establecen el estado del despliegue de Vercel.

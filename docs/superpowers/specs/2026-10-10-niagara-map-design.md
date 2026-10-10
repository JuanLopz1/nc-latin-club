# Discover Latin Niagara — diseño aprobado con aclaraciones

Fecha: 10 de octubre de 2026. Prioridad elegida por el fundador: mapa de negocios de Niagara con los archivos aportados. Este diseño adapta esa especificación al sitio nocturno actual. El fundador aprobó continuar la implementación con las aclaraciones siguientes, que prevalecen sobre el paquete.

## Resultado esperado

Encontrar negocios con vínculo latino documentado en Niagara, buscar comida o servicios y abrir el destino correcto en Google Maps. `/niagara` reúne mapa real y directorio EN/ES con una sola selección; no exige cuenta. La prioridad es utilidad local para jóvenes y estudiantes, preservando la identidad NC LATIN CLUB y el diseño nocturno aprobado.

El PDF y el ZIP son materiales aportados, con anotaciones editoriales e instrucciones históricas. Sus referencias a patio/colores crema no reemplazan las decisiones posteriores del fundador. Los requisitos útiles de directorio/mapa se adoptan aquí; el alcance autorizado incluye Niagara, la carga de eventos reales y las fechas culturales; el globo sigue separado.

## Enfoque propuesto

Usar **Leaflet 1.9.4**, versión estable consultada en npm el 10 de octubre, con tipos TypeScript y proveedor de teselas configurable. No necesita Google Places ni facturación. Es apropiado para los 16 pins iniciales y ofrece pan, zoom y pinch sin escribir un motor cartográfico.

Un iframe de Google simplificaría montaje, pero limita la sincronización de filtros/pins. Un motor WebGL añade tamaño y complejidad innecesarios para este directorio. Se recomienda Leaflet con CSS y controles adaptados al sitio; no reutilizar fotos del paquete como fachadas.

Nuevas dependencias propuestas: `leaflet@1.9.4` y `@types/leaflet` como dependencia de desarrollo. La instalación ocurre durante la implementación, con la autorización explícita de continuar. No hay backend ni proveedor de pago.

## Pantalla y navegación

Mantener encabezado, pie, idioma y menú compartidos. Introducción con tipografía fuerte, fondo azul noche, amarillo y cian; `Discover Latin Niagara` / `Descubre el Niagara latino` como título. Mapa y tarjetas en dos columnas en escritorio; mapa encima de tarjetas en móvil. Altura reservada de 480 px y 340 px respectivamente, sin ocupar todo el inicio.

El menú Latin Niagara pasa a `/niagara` cuando funcione. La sección `/#niagara` se convierte en una entrada llamativa: “Descubre el Niagara latino”, tarjetas CoCo, La Paisana y Origen, invitación a comida/tiendas/emprendimientos y botón “Explorar Niagara”. No añadir el mapa pesado al hero. Idioma se conserva al navegar; una recarga sigue iniciando EN como el resto del sitio.

El directorio renderiza las fichas publicables recibidas por props. La colección editorial se normaliza en el servidor; componentes no importan el JSON bruto de investigación. Los controles internos y candidatos pendientes no llegan al cliente.

## Contenido inicial

Preparar las 18 fichas del paquete: 16 ubicaciones públicas y dos negocios sin tienda física. Añadir El Camino/by McNips, Taco N Tequila y Sombra por selección explícita del fundador; sin pin hasta resolver destino. Mantener origen y fecha de revisión, sin afirmar apertura en vivo, stock, propiedad latina o colaboración con el club.

CoCo usa la dirección confirmada por el fundador: 155 St Paul Crescent, St. Catharines. La Paisana tienda (unidad 9) y restaurante (unidad 4) son fichas distintas en 2895 St Paul Ave. Revisar individualmente los diez candidatos y conservar su seguimiento, sin descartarlos automáticamente; señales de cierre necesitan aclaración antes de publicación como activos. Se publican canales documentados, sin deducir nacionalidades de propietarios.

Solo se proyectan campos públicos: ID, nombre, ciudad, categorías, modalidad, tradición documentada, descripción EN/ES, oferta documentada, dirección pública cuando corresponda, coordenadas revisadas cuando corresponda, web/contacto comercial, fuentes y fecha de revisión. Se excluyen contactos personales, domicilios de producción, notas internas, flags editoriales y candidatos.

Paz Bakery y La Casita Guanaca tienen tarjetas sin dirección, pin o botón de navegación. Paz enlaza a su tienda/stockists; La Casita ofrece Contactar sin prometer pedidos activos. Un camión conserva su ubicación pública revisada con una explicación de modalidad móvil; no se presenta como seguimiento en vivo.

No usar imágenes del paquete: son recursos de eventos y sus permisos están pendientes. Las tarjetas usan gráficos originales sencillos, nombre e icono, sin simular una foto real.

## Interacción y filtros

Un único `selectedPlaceId` sincroniza tarjeta, pin y detalle. Pulsar un pin selecciona el lugar y abre el detalle. Pulsar una tarjeta selecciona su pin y centra el mapa una vez; una tarjeta sin ubicación pública abre detalle sin centrar ni inventar coordenadas. El efecto de selección no se ejecuta en cada render.

Pan con mouse/tacto, zoom por botones y pinch táctil. Rueda de mouse desactivada para conservar scroll de página. Ver Niagara ajusta el encuadre a los pins publicados; no pide ubicación del visitante. Mover el mapa no altera resultados.

Búsqueda insensible a tildes/mayúsculas sobre nombre, ciudad, descripción cultural y oferta acreditada. Filtros por ciudad, categoría y modalidad; categorías disponibles derivadas de fichas públicas. Todos y Limpiar filtros recuperan resultados. Se muestran por separado cantidad de fichas y cantidad de pins.

Si un filtro excluye el lugar seleccionado, se limpia la selección. Cerrar detalle conserva filtros. Marcadores coincidentes se agrupan con selector de lugares, sin desplazar coordenadas para inventar separación. La lista ofrece las mismas acciones que el mapa y permanece utilizable sin éste.

## Detalles y acciones

Panel integrado junto a la tarjeta seleccionada con nombre, categorías, ciudad, modalidad, tradición/descripcion documentada y dirección pública completa si existe. Cierre nombrado y Escape; sin trampa de foco. Las acciones son:

- Ver en mapa selecciona el pin dentro del sitio.
- Llévame ahí / Take me there abre Google Maps Directions con `api=1` y destino compuesto de nombre + dirección completa + unidad. No incluir origen ni Place ID no verificado.
- Web / Contactar abre el canal comercial HTTPS suministrado; sin presuponer pedidos disponibles.
- Fuente y revisión muestran trazabilidad del paquete; no describirlo como verificación en vivo del asistente.

Enlaces externos con aviso de nueva pestaña y `noopener noreferrer`. Las fichas sin foto usan diseño tipográfico; faltantes de horario/precio/accesibilidad no se convierten en afirmaciones públicas.

## Mapa, proveedor y errores

Leaflet se carga solo en cliente, de forma diferida, con altura reservada y limpieza de instancias/listeners al desmontar. Tipos y filtro son independientes del motor de mapas. Cambio de idioma actualiza etiquetas sin perder cámara/filtros/selección.

Proveedor configurable mediante ajustes públicos del mapa, separados de los datos de lugares. Para desarrollo, teselas estándar de OpenStreetMap con atribución visible; respetar sus términos/caché y evaluar proveedor/capacidad antes de un lanzamiento con tráfico real. No descargar mapas completos, geocodificar por visitante ni prometer uso ilimitado.

Conservar atribución de OpenStreetMap contributors y procedencia/precisión de coordenadas en documentación. Pins `address_point` se describen como aproximaciones al inmueble, no a la puerta exacta. No usar `[0,0]` ni centro de ciudad como sustituto.

Si faltan teselas o falla el módulo, mostrar mensaje traducido y mantener directorio, detalles y enlaces a Google Maps. En este entorno algunas fuentes externas devolvieron CONNECT403; se informará por separado si no puede verificarse una carga real de teselas. Una fixture de teselas no demuestra disponibilidad del proveedor.

## Accesibilidad y movimiento

Pins y botones con nombres EN/ES, controles táctiles cómodos y foco visible. Lista equivalente accesible por teclado; contador y selección anunciados brevemente. Abrir desde una tarjeta conserva el foco del botón, revela el panel contiguo y conecta ambos con aria-controls. Seleccionar desde un pin revela el detalle y lleva el foco a su título para acceder a sus acciones. Cerrar o Escape devuelve el foco a la tarjeta.

Movimientos de cámara y panel son breves y respetan `prefers-reduced-motion`; no animación continua. No capturar gestos de página fuera del mapa. El teclado permite acceder a una ficha sin operar una superficie cartográfica.

## Verificación antes de push

Pruebas puras para filtrado por tildes, múltiples categorías, selección excluida, elegibilidad de pins y destinos de Maps con unidad. Comprobar que notas editoriales privadas y direcciones de negocios sin tienda física no aparecen en props, HTML o bundle.

En navegador: selección pin→tarjeta y tarjeta→pin, zoom/pan/reset, no recenterado mientras se arrastra, búsqueda vacía/limpiar, cerrar/Escape, cambio EN/ES, entradas sin pin y fallo de proveedor. Anchos 320–1440 y movimiento reducido. Probar gesto táctil emulado; reportar dispositivos/lectores de pantalla que no se hayan probado.

Ejecutar las pruebas actuales de Events para regresiones, nueva suite Niagara, lint, build y `git diff --check`. Commit/push a `origin/work` después de cada hito importante y comprobar SHA remoto; `main` permanece sin cambios. No declarar que Vercel está Ready sin verificarlo.

## Fuera de esta entrega

El globo cultural de Latinoamérica queda como hito aparte. No incluye admin, uploads, búsqueda automática de negocios, ubicación del visitante, ratings, reservas, rutas dentro del sitio o actualizaciones en vivo.

Después de Niagara, cargar en esta entrega los eventos reales y fechas culturales del paquete en sus secciones respectivas, incluyendo archivo. Adaptar rangos culturales, horarios diarios y fechas sin hora; Toronto/Burlington deben identificarse como tales. Las imágenes con permiso pendiente conservan esa restricción. No importar 327 feriados como días libres de Ontario ni sustituir Latin Fiesta confirmada por una reunión de planificación.

Fuentes de requisitos: elección explícita del fundador, `INSTRUCCIONES_CODEX.md`, `mapa_niagara_especificacion.json`, `DIRECTORIO_LATINO_NIAGARA.md` y `lugares_niagara.json` aportados. Ver inventario en [DELIVERED_RESOURCES_REVIEW](../../DELIVERED_RESOURCES_REVIEW.md).

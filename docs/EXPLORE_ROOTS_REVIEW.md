# Explore Our Roots — revisión del paquete y propuesta

10 octubre 2026. Esta entrega revisa contenido y propone el siguiente hito; no instala un motor gráfico ni implementa el globo.

## Decisiones directas del fundador

- El ZIP es una referencia adaptable, no una orden de seguir todas sus instrucciones ni una aprobación automática de sus propuestas.
- Aclaración de esta sesión: **todo el planeta visible, con las Américas destacadas y el resto tenue**. Actualiza el encuadre anterior limitado a las Américas.
- Continúa la identidad nocturna actual: azul noche/grafito, tipografía fuerte y acentos amarillo/cian. Las propuestas crema/esmeralda/serif del paquete no sustituyen por sí mismas el diseño actual.
- Niagara, eventos, calendario cultural y el explorador de países son funciones distintas. El portal admin sigue siendo un producto futuro.

## Inspección del material

Archivo: `NC_LATIN_CLUB_CODEX_EXPLORE_OUR_ROOTS_FINAL.zip`.
SHA-256: `4918ebdb6ea4f489eab29f0ac7abec4bbbcd5a21346ff08977a29fa3d3c7887f`.
Se extrajo fuera del repositorio y se inspeccionó sin ejecutar `build.py`. No se copiaron recursos a `public/`.

| Elemento | Resultado comprobado localmente |
| --- | --- |
| Fichas base | 54; IDs, slugs y mapGeometryKey únicos. |
| Regiones | 14 Sudamérica, 7 Centroamérica, 2 Norteamérica, 30 Caribe, 1 contextual/Caribe ampliado. |
| Portadas y créditos | 54 JPG decodificables, 1200 × 675; 54 filas de créditos; ninguna ruta de imagen ausente. |
| Idiomas | 0 descripciones EN, 9 nombres EN; el texto base es ES. |
| Estado editorial | Las 54 fichas son `draft_needs_local_review`. Enlaces/fuentes aportados no equivalen a comprobación de cada afirmación. |
| Datos geográficos | Sin geometrías y sin coordenadas en las fichas; las claves no bastan para dibujar o enfocar un territorio. |
| Páginas ampliadas | 54 slugs coincidentes con la base; todas `draft_not_for_auto_publish`. |
| Secciones ampliadas | Historia, paisajes, artes y curiosidades carecen de elementos en 48 de las 54 fichas. Seis tienen semillas adicionales. |
| Quiz | 108 preguntas marcadas `ui_placeholder`; no incorporarlas como minijuegos culturales. |

Las portadas son composiciones abstractas con textos culturales, no fotos documentales. El paquete declara uso y adaptación autorizados para el proyecto y exige crédito. Su estética pastel puede usarse provisionalmente dentro de una tarjeta; no define el aspecto del globo o de la página. La captura de referencia inspira líneas/cartografía, sin publicarla como textura.

La revisión anterior verifica estructura y archivos, no hechos culturales ni disponibilidad de cada enlace. La investigación editorial y traducciones tienen su propia fase.

## Encaje con el código actual

Next 16.4, React 19.3, TypeScript y App Router. `/explore` y `/explore/[country]` no existen. `club-home.tsx` contiene `RootsMap`, una ilustración SVG con cuatro entradas, selección y diálogo; no es un globo geográfico. `SiteProvider` ya centraliza idioma y estado compartido. `/niagara` usa Leaflet para negocios y no debe transformarse en este explorador.

Mantener el inicio y reemplazar gradualmente su entrada de Raíces por una invitación clara a `/explore`. Cargar el renderizador solamente en esa ruta. Las páginas culturales usarán una plantilla común y datos por slug, con fuentes y créditos, no 54 componentes duplicados.

## Experiencia propuesta

1. **Llegar:** planeta oscuro y reconocible, encuadre inicial en las Américas, contornos finos y tierras del resto del mundo tenues. Los 54 registros son destinos culturales; otros países no aparentan tener una ficha disponible.
2. **Explorar:** arrastrar, zoom con límites, +/− y restablecer visibles. Buscador tolerante a tildes y alias. Filtros regionales múltiples, todos activos por defecto, coherentes con los filtros recién entregados. Bermudas accesible como Atlántico/contextual.
3. **Seleccionar:** país con acento luminoso moderado, etiqueta de nombre y bandera cuando exista un recurso adecuado. Cámara breve y controlada. Un único panel con introducción, temas y acción «Explorar»; en móvil, una hoja inferior que deja parte del planeta visible.
4. **Entrar al país:** plantilla con bienvenida, sabores, música/bailes, tradiciones, expresión y curiosidad únicamente donde haya contenido revisado. Conservar el lenguaje nocturno; un posible interior crema queda como alternativa visual, sin adoptarlo automáticamente.
5. **Volver:** recuperar orientación, zoom, selección y filtros. Idioma global, Escape/foco, alternativa completa de lista y búsqueda si falla WebGL. Sin audio automático; enlaces o reproductores solo cuando haya recursos reales.

Propuesta inicial de movimiento: una presentación breve y luego control del visitante. Autorrotación opcional y pausada al interactuar; nunca con movimiento reducido. Evitar un giro constante que separe las Américas de la vista antes de que el visitante pueda explorarlas.

## Opciones técnicas y recomendación

| Opción | Ventaja | Coste / límite |
| --- | --- | --- |
| **globe.gl, cargado bajo demanda** | API ya cubre polígonos, hover/clic, material del planeta y escena/cámara; menos trabajo manual de interacción. | Incorpora Three.js y dependencias; medir bundle, GPU y limpieza de recursos. |
| Three.js directamente | Mayor control visual y potencial de recortar funcionalidades. | Hay que construir selección, geometrías, cámara y gestión de gestos; más desarrollo y mantenimiento. |
| Proyección esférica SVG/Canvas | Puede funcionar como alternativa sin WebGL. | No cumple por sí sola la experiencia 3D real como protagonista. |

**Recomendación:** prototipo con `globe.gl` directo, evitando inicialmente otro wrapper React. Importación dinámica dentro de un componente cliente y una frontera clara entre escena y UI React. No se instala durante esta revisión.

Consulta de metadata/README al registro npm: globe.gl 2.46.2, react-globe.gl 2.38.0, Three.js 0.186.1 y world-atlas 2.0.2. Estas versiones son candidatas, no dependencias elegidas ni compatibilidad ya probada. Los tamaños descomprimidos declarados (~39.6 MB de globe.gl, ~17.7 MB del wrapper, ~20.4 MB de Three) **no son el JavaScript que descargará el visitante**: incluyen distribuciones repetidas. No prometer tamaño o fluidez antes de medir el build del prototipo.

## Geografía y territorios pequeños

- Base mundial trazable: evaluar Natural Earth / world-atlas. El README de world-atlas documenta topologías 110m/50m/10m derivadas de Natural Earth e IDs ISO numéricos. El catálogo usa ISO2 y claves editoriales: requiere correspondencia explícita y revisión de licencia/atribución del recurso elegido.
- Probar 50m para la base y geometrías más detalladas por necesidad, en lugar de cargar el mundo entero a máxima resolución. La cobertura exacta todavía no está verificada.
- Cada registro debe resolver un polígono correcto o un punto geográfico revisado, con objetivo táctil suficiente. La búsqueda/lista permanece disponible para todos; no ocultar una isla porque el atlas la omita.
- Bonaire, Saba y San Eustaquio comparten ISO2 `BQ`, pero tienen claves `BQ-BO`, `BQ-SA`, `BQ-SE`; no agruparlos como una sola ficha. San Martín francés `MF` y Sint Maarten `SX` también son distintos.
- Guayana Francesa, San Bartolomé y otros territorios necesitan correspondencia propia; no enfocar indiscriminadamente el centro de todo un país administrador.
- Malvinas/Falklands conserva formulación neutral de soberanía disputada. Bermudas es Atlántico/contextual. EE. UU. se explora por sus comunidades latinas; la cobertura no define a todos los lugares como estados soberanos ni culturalmente idénticos.

## Datos, navegación y futuro admin

Normalizar una vez el catálogo base: identidad, región, estatus, textos locales, temas, medios/créditos y fuentes. Mantener geometría/centro de cámara en un catálogo geográfico separado pero vinculado por slug. No importar el dataset ampliado entero al cliente ni mostrar instrucciones como «Investigar ingredientes» al público.

Estado compartido de exploración: orientación/zoom, país seleccionado, consulta, regiones activas y preferencia de movimiento. Guardar/restaurar estado entre `/explore` y `/explore/[country]` en un proveedor persistente, reutilizando el patrón del sitio. El detalle puede cargar como página normal sin introducir rutas modales complejas desde el primer prototipo. Acceso directo funciona con una vista inicial definida y los slugs desconocidos responden 404.

Los textos EN faltantes no se sustituyen silenciosamente por español: preparar traducciones de la primera muestra desde el ES aportado y revisar su correspondencia. Si una vista previa usa ES original mientras falta traducción, indicarlo expresamente; no afirmar cobertura bilingüe completa. Conservar expresiones en su idioma original.

Para publicación cultural, distinguir borrador y contenido revisado; no cambiar estatus por la mera presencia de URLs. El futuro admin gestionará textos, imágenes, enlaces y estados editoriales mediante el mismo contrato de datos. No añadir autenticación/backend para probar el globo.

## Siguiente hito propuesto

**Primera entrega:** planeta completo con estética nocturna, controles, búsqueda/lista, selección y tarjeta para Colombia, Brasil, México, Jamaica, Haití y Curazao. Son una prueba representativa de continente, Caribe, tamaño de territorio e idiomas; los 54 destinos siguen siendo el alcance final.

Antes de escalar: comprobar desktop/móvil, teclado, movimiento reducido, gesto de arrastre frente al scroll de página, fallback sin WebGL, selección rápida, cierre/foco, restauración de cámara y una isla pequeña. Registrar peso real de la ruta y comprobar liberación de la escena al salir. La emulación móvil no sustituye pruebas en teléfonos físicos.

Después: plantilla cultural inicial para Colombia, ampliación a 54 destinos con correspondencia geográfica auditada, traducciones y revisión de contenido en lotes. Añadir fotos y audio verificados progresivamente. Los quizzes, minijuegos y portal admin conservan sus hitos separados.

Cada hito de implementación conservará la regla del repo: comprobar el cambio, commit/push a `work` y verificar SHA remoto, sin modificar `main`.

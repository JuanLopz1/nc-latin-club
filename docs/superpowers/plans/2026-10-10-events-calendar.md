# Events y calendario latino — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear la agenda bilingüe con At NC, Out of NC, fechas culturales, calendario dinámico, detalles y galerías opcionales de varias imágenes.

**Architecture:** Mantener contenido local tipado y una sola colección para inicio, agenda y detalle. Separar operaciones puras de fechas de los componentes interactivos; compartir idioma y contexto de agenda mediante un proveedor persistente en el layout. Las rutas serán `/events` y `/events/[slug]`, con componentes pequeños y estilos CSS Modules.

**Tech Stack:** Next.js 16.4.0, React 19.3.0, TypeScript, CSS Modules, `Intl`, `next/image`, Node 24 con `node:test`, Chromium/CDP para verificaciones locales. Sin nuevas dependencias.

**Spec:** [Diseño aprobado](../specs/2026-10-10-events-calendar-design.md), con los ajustes del fundador para múltiples imágenes y animaciones suaves. Investigación: [fuentes y bloqueo de conexión](../../EVENTS_RESEARCH.md).

## Global Constraints

- “Los encuentros se presentan siempre en `America/Toronto`, independientemente del huso horario del visitante.”
- “Cada entrada puede tener una colección opcional `images`, con cero, una o varias imágenes ordenadas.”
- “`prefers-reduced-motion: reduce` elimina transiciones, desplazamientos animados y scroll suave.”
- “El inglés sigue siendo el idioma inicial.” Una recarga inicia EN; navegación interna conserva idioma y contexto. No añadir rutas `/es` en esta entrega.
- “Los enlaces externos se limitan a HTTPS.” Mostrar fuente y organizador; ocultar inscripción de cancelados.
- “No se publican entradas solo por conocer una URL o recordar una celebración.” Latin Fiesta es la única entrada verificada con evidencia aportada por el fundador, no por consulta en vivo.
- “No se añade un formulario público de subida ni se simula que el admin ya existe.” Los medios locales preceden a la carga/ordenación del futuro portal.
- “Ejecutar lint y build antes del commit y push a `origin/work`; verificar SHA remoto. No modificar `main`.”
- Leer las guías pertinentes de `node_modules/next/dist/docs/` antes de modificar rutas, layouts, imágenes o estilos. Conservar la regla Turbopack que excluye `*.module.css`.
- Cada comando de verificación debe terminar con código 0; las pruebas deben informar todas sus assertions como pasadas. Una compilación o servidor antiguo no sirve como evidencia para código nuevo.

## Review Focus

- Apertura directa o retorno desde un detalle: usar su categoría si no había contexto; conservar filtros existentes al volver. Prueba en tarea 5.
- Cambio de día/huso horario entre servidor, visitante y compilación: el reloj real de Niagara gobierna hoy, próximos y pasados sin error de hidratación. Prueba en tareas 1 y 4.
- Imagen inexistente y colecciones vacías/de una/de varias: acceso al evento permanece disponible; no dejar iconos rotos ni controles inútiles. Prueba en tareas 3 y 5.
- Clics rápidos, selección de días vecinos y cambio de categoría: mes y selección siguen siendo válidos, animación no bloquea interacción ni roba foco. Prueba en tarea 4.
- Fechas antiguas, horarios incompletos o cancelación: no presentar una edición antigua como próxima, no inventar fin y no permitir inscripción cancelada. Prueba en tareas 1 y 5.

---

## Mapa de archivos y contratos

| Archivo | Responsabilidad |
| --- | --- |
| `app/components/events/event-types.ts` | Tipos de encuentro, fecha cultural, fuente, imágenes y estado de agenda. |
| `app/components/events/agenda-data.ts` | Colección editorial única; conserva Latin Fiesta y no contiene fixtures. |
| `app/components/events/agenda-validation.ts` | Validar contenido, identificadores, fechas, fuentes y medios antes de publicar. |
| `app/components/events/agenda-dates.ts` | Fechas locales, clasificación temporal, ocupación de días y cuadrícula mensual. |
| `app/components/events/agenda-clock.ts` | Reloj de ejecución con snapshot estable, actualización al minuto y snapshot servidor `null`. |
| `app/components/events/events-copy.ts` | Textos EN/ES de agenda, detalles, estados y galería. |
| `app/components/site-context.tsx` | Idioma y estado persistente de agenda entre rutas. |
| `app/components/site-shell.tsx` y `.module.css` | Encabezado, pie, menú móvil y skip link compartidos. |
| `app/components/events/event-gallery.tsx` y `.module.css` | Imágenes, controles, miniaturas, selección y error de carga. |
| `app/components/events/event-card.tsx` y `.module.css` | Tarjeta enlazada, portada opcional y metadatos resumidos. |
| `app/components/events/events-agenda.tsx` y `.module.css` | Categorías, lista, próximos/pasados y vista calendario. |
| `app/components/events/month-calendar.tsx` y `.module.css` | Cuadrícula de seis semanas, navegación mensual y selección accesible. |
| `app/components/events/event-detail.tsx` y `.module.css` | Detalle bilingüe, fuente, estado, inscripción y galería. |
| `app/events/page.tsx`, `app/events/[slug]/page.tsx` | Rutas y metadatos; detalle desconocido devuelve 404. |
| `app/components/club-events.ts` | Puente compatible hacia la colección única para el inicio. |
| `app/components/club-home.tsx`, `events-section.tsx`, `home-copy.ts`, `app/layout.tsx` | Integrar estructura común y enlaces sin perder el recorrido actual. |
| `tests/register-typescript.cjs`, `tests/events.test.cjs`, `tests/gallery.test.cjs`, `tests/events-home.test.cjs` | Usar TypeScript instalado para cargar módulos bajo `node:test`; fixtures solo en verificaciones. |
| `/tmp/nc-events-calendar-browser-check.mjs` | Verificación CDP local; artefactos en `/workspace/artifacts/`, fuera del commit. |

### Tipos compartidos que se fijan en tarea 1

`LocalizedText = Record<Language, string>`. `CalendarDate` y `CalendarMonth` son strings validados `YYYY-MM-DD` y `YYYY-MM`. `AgendaCategory = 'at-nc' | 'out-of-nc' | 'latin-dates'`.

`EntryImage = { src: string; width: number; height: number; alt: LocalizedText; caption?: LocalizedText }`: `src` es una ruta `/images/events/...` a un archivo disponible en `public/`, sin rutas relativas, esquemas externos ni segmentos `..`.

`EditorialSource = { url: string; reviewedOn: CalendarDate; provenance: 'user-capture' | 'official-page' }`.

`EntryBase = { id: string; slug: string; title: LocalizedText; description: LocalizedText; source: EditorialSource; images?: readonly EntryImage[] }`.

`EventEntry = EntryBase & { kind: 'event'; category: 'at-nc' | 'out-of-nc'; startsAt: string; endsAt?: string; venue: LocalizedText; city?: LocalizedText; organizer: LocalizedText; admission?: LocalizedText; registrationUrl?: string; status: 'scheduled' | 'cancelled' | 'rescheduled'; statusNote?: LocalizedText }`.

`CulturalEntry = EntryBase & { kind: 'cultural-date'; category: 'latin-dates'; date: CalendarDate; scope: LocalizedText }`. `AgendaEntry = EventEntry | CulturalEntry`.

`AgendaState = { category: AgendaCategory; view: 'list' | 'calendar'; period: 'upcoming' | 'past'; month: CalendarMonth; selectedDate: CalendarDate }`.

## Task 1: Colección única y operaciones de fechas comprobadas

**Files:** crear tipos, datos, validación, fechas y reloj del mapa; modificar `club-events.ts`, `package.json`; crear `tests/register-typescript.cjs` y `tests/events.test.cjs`.

**Interfaces:** producir `agendaEntries: readonly AgendaEntry[]`; `validateAgenda(entries: readonly AgendaEntry[]): void`; `niagaraDate(value: Date | string): CalendarDate`; `shiftMonth(month: CalendarMonth, delta: number): CalendarMonth`; `monthCells(month: CalendarMonth): CalendarDate[]`; `entriesOnDate(entries: readonly AgendaEntry[], date: CalendarDate): AgendaEntry[]`; `isPast(entry: AgendaEntry, now: Date): boolean`; `listEntries(entries: readonly AgendaEntry[], category: AgendaCategory, period: 'upcoming' | 'past', now: Date): AgendaEntry[]`; `initialAgendaState(now: Date, category?: AgendaCategory): AgendaState`; `useAgendaClock(): Date | null`.

- [x] Escribir pruebas que importen los módulos reales mediante el adaptador de TypeScript existente; añadir `test:events` en package.json con `node --test tests/events.test.cjs tests/gallery.test.cjs` cuando exista el segundo archivo. El adaptador transpila TS/TSX a CommonJS usando el paquete TypeScript instalado; un stub de CSS se limita a pruebas de render, nunca a verificar estilos.
- [x] Comprobar Latin Fiesta: inicio `2026-10-23T20:00:00-04:00`, fin `2026-10-24T00:00:00-04:00`, ocupa el 23 y no el 24; otra fixture con fin a las 00:30 ocupa ambos. Con reloj `2026-10-24T03:59:00Z` sigue próxima/en curso; a `2026-10-24T04:00:00Z` pasa a anterior.
- [x] Comprobar fecha cultural fixture `2026-11-02`: ocupa solo ese día aun cuando el visitante usa UTC o Asia/Tokyo; permanece próxima durante ese día local. Comprobar dos entradas el mismo día, encuentro sin fin y la transición de horario de verano del 1 de noviembre de 2026.
- [x] Comprobar `shiftMonth('2026-12', 1) === '2027-01'`; cuadrícula de 42 días consecutivos que empieza lunes, febrero de 2028 incluye el 29, y el dato editorial no depende de la fecha de build. Comprobar orden ascendente para próximas y descendente para pasadas.
- [x] Comprobar rechazo de IDs/slugs duplicados, offset ausente, `2026-02-30`, fin anterior al inicio, URL no HTTPS, Out of NC sin ciudad/organizador, cancelado/reprogramado sin aviso y dimensiones/alt/ruta de imagen inválidos. Comprobar que archivo de imagen mencionado existe con una revisión de medios en el mismo comando de pruebas, usando `public/` como raíz.
- [x] Ejecutar `node --test tests/events.test.cjs` antes de implementar y confirmar fallos por exports ausentes; implementar interfaces. Calcular ocupación hasta `endsAt - 1 ms`, convertir ambos extremos a fecha Niagara y comparar strings de calendario. Hacer aritmética mensual en UTC usando getters UTC, nunca formatear esos días artificiales como timestamps de Niagara.
- [x] Migrar Latin Fiesta sin cambiar información aportada, con slug `latin-fiesta-2026`, estado `scheduled`, fuente NC Engage y `provenance: 'user-capture'`. El puente exporta solo encuentros At NC desde la colección, sin duplicar entradas. Validar al cargar la colección para que una compilación falle ante datos inválidos.
- [x] Implementar reloj con `useSyncExternalStore`: snapshot servidor `null`, snapshot cliente estable entre ticks y actualización al minuto. Una vista que necesita hoy muestra inicialización accesible hasta recibir reloj; nunca usa la fecha congelada del prerender.
- [x] Ejecutar pruebas de fechas/validación, lint y build. Revisar diff, commit `feat: add verified agenda contracts and Niagara date helpers`, push a `origin/work` y verificar SHA remoto.

## Task 2: Navegación y contexto compartidos sin cambiar el inicio

**Files:** crear `site-context.tsx`, `site-shell.tsx` y `.module.css`; modificar `app/layout.tsx`, `club-home.tsx`, `club-home.module.css`, `home-copy.ts`.

**Interfaces:** `SiteProvider({ children }: { children: ReactNode })`; `useSiteLanguage(): { language: Language; setLanguage(language: Language): void }`; `useAgendaState(): { state: AgendaState | null; setState(state: AgendaState): void }`. `SiteShell({children}: {children: ReactNode})` contiene encabezado/pie/skip link; cada pantalla conserva un único `main#main-content`.

- [x] Preparar comprobación CDP que detecte dos encabezados o dos main, ausencia de foco visible, menú que no cierre con Escape o pérdida del idioma al navegar. Ejecutarla sobre el estado previo cuando estén disponibles las nuevas rutas; conservar primero evidencia del inicio actual para comparar.
- [x] Extraer encabezado/pie y su CSS sin rediseñar hero, Familia, mapa ni Niagara. Montar proveedor y estructura común en el layout; el inicio consume idioma compartido y conserva selección de país y diálogos locales. Actualizar `html.lang` desde el proveedor.
- [x] Los enlaces del menú hacia secciones usan `/#familia`, `/#roots`, `/#niagara`, `/#join`; Events abre `/events`. No cambiar aún el enlace de navegación a una ruta ausente: activar al integrar tarea 4. Inicio, marca y pie usan `next/link`; menú se cierra al activar enlaces y al cambiar de ruta.
- [x] Comprobar el inicio EN/ES, marca NC LATIN CLUB, patrocinio/contacto, imagen principal, mapa/dialog/Escape, Niagara y anchos 320/375/760/1100/1440. Revisar que el focus ring no quede recortado y que el skip link funcione en cada main.
- [x] Lint/build, commit `refactor: share site navigation and bilingual context`, push a `origin/work` y verificar SHA remoto.

## Task 3: Galería accesible de una o varias imágenes

**Files:** crear `event-gallery.tsx` y `.module.css`, `events-copy.ts`, `tests/gallery.test.cjs`.

**Interfaces:** consume `EntryImage`, `Language`; produce `EventGallery({ images, language, entryId }: { images: readonly EntryImage[]; language: Language; entryId: string }): ReactNode`. La tarjeta reutiliza únicamente `images?.[0]`; el componente de galería se usa en detalle.

- [x] Escribir pruebas de render con ReactDOMServer: cero imágenes no genera controles ni figura vacía; una imagen genera su alt EN/ES y ninguna flecha/contador inútil; tres imágenes tienen controles nombrados y miniaturas con selección accesible. Las fixtures usan medios de prueba, no imágenes o anuncios de eventos reales.
- [x] Ejecutar `node --test tests/gallery.test.cjs`, confirmar fallo antes de crear el componente e implementar galería. Reservar proporción con dimensiones, renderizar mediante `next/image` y usar carga diferida fuera de vista. Mantener información del evento independiente del estado de carga.
- [x] Implementar pista horizontal con scroll-snap táctil, botones anterior/siguiente sin ciclo infinito y miniaturas. La selección sigue el desplazamiento de la pista; el contador anuncia `n / total`. Flechas izquierda/derecha se manejan solo dentro de la galería enfocada; no añadir listeners globales. Cambiar idioma mantiene índice; cambiar entryId lo reinicia.
- [x] Mostrar fallo por imagen con texto traducido y continuar permitiendo navegación. Transiciones de 180–240 ms y scroll suave se desactivan con movimiento reducido. Comprobar navegación, swipe y error en navegador en tarea 5, cuando exista la ruta de detalle.
- [x] Pruebas de render, lint/build, commit `feat: add optional multi-image event galleries`, push a `origin/work` y verificar SHA remoto.

## Task 4: Agenda y calendario dinámico

**Files:** crear `event-card.tsx`, `events-agenda.tsx`, `month-calendar.tsx`, sus CSS Modules y `app/events/page.tsx`; ampliar `events-copy.ts`; activar Events en `site-shell.tsx`.

**Interfaces:** `EventCard({entry, language}: {entry: AgendaEntry; language: Language})`; `MonthCalendar({entries, month, selectedDate, today, language, onMonthChange, onSelectDate}: {entries: readonly AgendaEntry[]; month: CalendarMonth; selectedDate: CalendarDate; today: CalendarDate; language: Language; onMonthChange(month: CalendarMonth): void; onSelectDate(date: CalendarDate): void})`; `EventsAgenda({entries}: {entries: readonly AgendaEntry[]})`. Consumen contexto y helpers de tareas 1–2.

- [x] Escribir comprobación CDP: categorías y vistas actualizan selección accesible; Out of NC y Latin dates vacías no muestran fechas ficticias; lista At NC contiene Latin Fiesta en próximas para reloj anterior al evento. Mes vacío sigue permitiendo anterior/siguiente/hoy y elegir un día.
- [x] Implementar lista y controles con textos EN/ES y estado en `useAgendaState`; inicializar con reloj real solo cuando exista. La lista usa próximos/pasados; el calendario omite ese filtro y mantiene la categoría. Tarjeta enlaza su slug; activar enlace de detalle en tarea 5 para no publicar rutas ausentes. Portada opcional y estado de cancelación quedan identificados sin fingir disponibilidad.
- [x] Implementar cuadrícula de 42 fechas empezando lunes, etiquetas completas de fecha/cantidad, estado hoy/seleccionado y días vecinos atenuados. Elegir día vecino cambia mes y selecciona esa fecha; cambiar mes con flechas selecciona su primer día; Hoy selecciona hoy en Niagara. Elegir día actualiza resultados debajo sin robar foco.
- [x] Aplicar entrada direccional de 220 ms al cambiar mes, respuesta luminosa de selección y aparición de resultados. No bloquear controles ni acumular temporizadores por clics; usar keys/estado para reflejar el mes final. Las seis semanas evitan saltos de altura. Quitar animaciones, transforms de entrada y scroll suave bajo `prefers-reduced-motion: reduce`.
- [x] Verificar con CDP varios clics rápidos siguiente/anterior y cruce diciembre/enero: encabezado, fechas y selección corresponden al último estado. Verificar cambio de categoría conserva vista/mes; cambio EN/ES conserva controles y selección; teclado mantiene foco visible. Probar pantalla táctil, contraste y 320/375/760/1100/1440 sin overflow de página.
- [x] Con reloj cliente UTC/Asia/Tokyo, comprobar que Hoy y lista usan Niagara; consola sin hydration errors. Capturar agenda/calendario EN y ES en móvil/escritorio. Lint/build y pruebas; commit `feat: add bilingual event agenda and animated calendar`, push a `origin/work` y verificar SHA remoto.

## Task 5: Detalles, integración con inicio y comprobación de galerías

**Files:** crear `event-detail.tsx`, `.module.css`, `app/events/[slug]/page.tsx`; modificar `events-section.tsx`, `.module.css`, `events-copy.ts` y `event-card.tsx`.

**Interfaces:** `EventDetail({entry}: {entry: AgendaEntry})` consume colección, contexto e `EventGallery`. La ruta resuelve `params: Promise<{slug: string}>`, genera parámetros estáticos de la colección y llama `notFound()` ante slug ajeno; metadatos usan título/descripcion de la entrada en EN.

- [x] Preparar verificación de rutas: `/events/latin-fiesta-2026` devuelve detalle correcto y URL inventada devuelve 404. Comprobar inicio/lista/detalle muestran los mismos timestamps, organizer International, The Core, precios/reglas y enlace NC Engage. Fuente visible; no derivar dirección ni ciudad desconocidas.
- [x] Implementar detalle y retorno: con contexto existente recuperar categoría/vista/mes/fecha; sin contexto crear estado inicial de la categoría del detalle. Navegación por `next/link` conserva idioma. El detalle cultural usa fecha de día completo/ámbito/fuente, sin ticket ni organizador de encuentro.
- [x] Implementar estados: cancelado muestra aviso y ninguna inscripción; reprogramado usa horario vigente y aviso; sin registrationUrl no genera botón. Enlace externo HTTPS con `noopener noreferrer`, nombre accesible y aviso de apertura externa. El detalle carga la galería opcional; el inicio añade enlace a agenda y títulos de tarjetas al detalle.
- [x] Ejecutar browser fixtures locales de cero/una/tres imágenes, fallo de carga, cultural-date, cancelado y reprogramado. Solo en servidor de verificación local, respaldar datos y medios antes de usar fixtures; restituir originales al terminar, incluso si falla. No commit ni push mientras exista contenido de prueba en `public/` o en la colección. Con tres imágenes verificar controles, miniaturas, swipe, contador, índice conservado al traducir, reinicio entre entradas y funcionamiento con movimiento reducido.
- [x] Comprobar navegación inicio ES → agenda → detalle → retorno conserva idioma y filtros; apertura directa del detalle devuelve a su categoría; menú y skip link siguen funcionando. Probar 404, teclado y widths de tarea 4. Guardar capturas fuera del repo.
- [x] Restituir datos reales, verificar diff y medios sin fixtures, ejecutar pruebas, lint y un build fresco. Commit `feat: add event details and connect the homepage agenda`, push a `origin/work` y verificar SHA remoto.

## Task 6: Revisión final, investigación y documentación de entrega

**Files:** actualizar `README.md`, `docs/ROADMAP.md`, `docs/EVENTS_RESEARCH.md` y las casillas de este plan.

**Interfaces:** consume el recorrido integrado y evidencia de pruebas; no introduce proveedor externo ni interfaz de admin.

- [x] Reintentar fuentes candidatas públicas autorizadas. Si funcionan, verificar año/ciudad/organizador/horario/inscripción para encuentros y fecha/ámbito para celebraciones. Añadir únicamente entradas con evidencia consultada y registrar fecha de revisión. No usar un recuerdo o resultado de búsqueda como confirmación. Si sigue el 403, mantener estados vacíos y documentar bloqueo sin detener la funcionalidad.
- [x] Confirmar la entrega con datos reales: lista/calendario/detalle, imágenes autorizadas si las hubiera, 404, idiomas y retorno. Ejecutar `npm run test:events`, `npm run lint`, `NEXT_TELEMETRY_DISABLED=1 npm run build` y `git diff --check`. Repetir pruebas solo si hay modificaciones nuevas o fallos.
- [x] Solicitar una revisión independiente del conjunto mediante `superpowers:requesting-code-review`, con spec, plan y evidencia. Corregir hallazgos concretos y verificar lo afectado antes de afirmar finalización.
- [x] Actualizar documentos con rutas, colección, varias imágenes, comandos de verificación y límites reales: carga del admin, persistencia/URLs de idioma, sincronización y contenido regional pendiente. Actualizar prioridad del roadmap: inicio aprobado, agenda implementada; siguiente staff/familia. Registrar QA y commit final; push a `origin/work` y verificar SHA remoto.

## Handoff

El fundador aprobó el plan y eligió **ejecución nativa en esta sesión**, con una revisión independiente final: el contexto compartido, las rutas y los contratos de fechas se integran secuencialmente y no requieren varios implementadores. La alternativa es ejecución por subagentes con revisión independiente por tarea y al final, con mayor coste de contexto.

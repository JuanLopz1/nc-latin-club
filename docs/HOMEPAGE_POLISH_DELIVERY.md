# Pulido de homepage, agenda y Niagara

Fecha de entrega: 10 de octubre de 2026, America/Toronto.

## Cambios

- Franja amarilla continua de derecha a izquierda, ciclo de 28 segundos y control de pausa. Los dos grupos tienen el mismo ancho; no se divide en líneas en móvil.
- Entrada escalonada del hero, revelados que se ejecutan una sola vez, microinteracciones y movimiento suave de la insignia. El parallax de la ilustración está limitado a 12 px.
- Cabecera sticky con fondo opaco y sombra al bajar; la altura real ajusta el espacio para navegar a secciones.
- Vista 3D en Raíces con Colombia, México y El Salvador: cambia cada ocho segundos, se pausa al tocarla y deja de animarse fuera de pantalla. Las tarjetas destacadas conservan su diseño.
- Preferencia EN/ES guardada en el navegador, inglés para una visita nueva y HTML inicial consistente para hidratar.
- `/familia` utiliza el contenido existente del inicio y añade el contacto actual, sin inventar perfiles del staff.
- Pestañas independientes Eventos y Cultura. Los filtros de eventos y contadores respetan próximos/pasados y el mes mostrado; la lista cultural permite elegir un año. Las celebraciones de mes completo permanecen en un bloque único fuera de las celdas diarias.
- Latin Fiesta tiene cuenta regresiva y descarga `.ics` en el inicio y en su detalle, con los horarios aportados y su zona horaria.
- Niagara conserva las 21 fichas y números consecutivos; Paz Bakery es la 16. Taco N Tequila recibe el destino público y coordenadas publicados por su web oficial. Son 17 negocios con destino en 16 marcadores, porque las dos fichas de La Paisana comparten ubicación. Los números del mapa coinciden con las tarjetas visibles.
- Perfil oficial de Instagram incrustado al final del inicio, activado por el visitante y con enlace alternativo al perfil. Cerrar el bloque o salir de la página descarga el iframe.
- Metadatos canonical, Open Graph y Twitter para las rutas públicas, con la ilustración existente de la fiesta. Las imágenes de una vista previa apuntan a ese despliegue de Vercel; el canonical conserva el dominio público del club.

No se añaden dependencias ni se cambian fotografías, colores principales, rutas existentes o textos culturales. El movimiento reducido mantiene visible el contenido y evita animaciones automáticas.

## Verificación

- `npm test`: 67 pruebas, incluidas separación de agenda, rangos culturales, horarios, cuenta regresiva, exportación de calendario y números del directorio.
- `npm run lint` y `npm run build`.
- Navegador Chromium contra build de producción: presentación a 320, 375, 768 y 1440 px, marquee continuo, pausa, revelados, cabecera, globo, persistencia de idioma, Familia, Instagram, metadatos y movimiento reducido.
- Regresión del globo completo: selección, zoom, teclado, territorios pequeños y alternativa sin WebGL.
- Interacciones de agenda y Niagara: filtros, archivo, año cultural, calendario, descarga y expansión única de tarjetas.

## Pendientes explícitos

- Cuatro negocios permanecen sin pin: Paz Bakery y La Casita Guanaca operan por pedido; El Camino y Sombra necesitan confirmar un punto público actual. Conservan sus fichas y canales; no se inventan destinos.
- El póster original de Latin Fiesta no está disponible como archivo del repositorio. Open Graph usa `/images/Banner.png`, la ilustración existente de la fiesta.
- Instagram decide la disponibilidad de su iframe. No se promete una integración de API ni una selección de publicaciones sin sus enlaces.
- Fototeca, envíos con aprobación del admin y Latin Club Spotify están anotados para después. La playlist oficial necesita su enlace; no se crea una playlist provisional.
- Portal editable, fotos culturales autorizadas y revisión comunitaria de los perfiles mantienen su alcance posterior.

Entrega en `work`; `main` permanece sin cambios.

# Animaciones desde el menú y al llegar al contenido

Esta entrega actualiza el comportamiento anterior según la nueva indicación del fundador: animaciones activadas por defecto y un único ajuste para desactivarlas dentro del menú.

## Cambios

- Menú accesible en escritorio y móvil, con un solo interruptor EN/ES de animaciones. La elección continúa guardándose en el navegador; la antigua opción «según el dispositivo» pasa a activadas. Una desactivación elegida por el visitante se conserva.
- Se retiran el botón independiente del header, el aviso bajo la franja amarilla y los botones de animación de la franja, la vista del globo y la fila de Niagara.
- Entrada del hero escalonada: transiciones de 1,05–1,2 segundos y pequeñas diferencias de inicio entre título, descripción, acciones e ilustración.
- Títulos y párrafos se observan individualmente. Se revelan cuando entran en la vista, con un margen de 80 px desde el borde inferior y sin volver a desaparecer al regresar. La ilustración en móvil espera si queda fuera de pantalla.
- El estado inicial oculto no tiene transición; se anima solo la aparición. Esto evita el anterior desvanecimiento breve que se revertía al hidratar.
- «Saltar al contenido» conserva los revelados de los textos fuera de pantalla. El foco sobre un enlace puede hacer legibles sus propios textos.
- Los textos de las tres tarjetas de países se revelan por separado de sus siluetas.
- La fila de los 21 negocios conserva arrastre, gesto táctil y anterior/siguiente. Tras una interacción manual espera ocho segundos antes de continuar; mantiene la pausa con foco, ratón encima, fuera de pantalla o con pestaña oculta.
- La vista del globo mantiene la pausa al tocarlo. Volver a activar las animaciones desde el menú reanuda su presentación.

La navegación, contenido, imágenes, colores principales y dependencias se mantienen. El interruptor del menú detiene CSS y JavaScript y deja el contenido legible.

## Validación

- `npm test`: 70 pruebas aprobadas.
- `npm run lint` y `npm run build`: aprobados.
- `tests/home-motion-menu-browser.mjs`: entrada real de opacidad, ilustración fuera de pantalla, título/párrafo independientes, una sola aparición, enlace para saltar contenido, menú EN/ES, persistencia, arrastre, gesto táctil y reanudación de Niagara.
- `tests/home-motion-browser.mjs`: continuidad de la franja amarilla, header fijo, parallax, idiomas, Instagram por decisión del visitante y metadatos para compartir.
- `tests/agenda-directory-browser.mjs`: pestañas y contadores del calendario, archivo de eventos, descarga de calendario y filtros de los 21 negocios; sin errores de JavaScript.
- `tests/explore-browser.mjs`: 55 destinos, interacción y pausa del globo, ajuste global de movimiento, controles adaptables, páginas culturales y alternativa sin WebGL; sin excepciones de ejecución.
- Presentación del inicio y del menú a 320, 375, 768, 1440 y 1920 px; capturas de escritorio y móvil revisadas.

Las pruebas de navegador se ejecutan contra el build local de producción. El estado del despliegue de Vercel se comprueba por separado.

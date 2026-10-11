# Activar la fototeca en el proyecto existente

La interfaz está en `/fototeca` y la colección **Fototeca** del panel. No crees otro proyecto de Supabase ni cambies tus usuarios o variables de Vercel.

1. Espera a que el despliegue de la rama `work` esté Ready en Vercel.
2. Abre [el archivo de actualización](https://github.com/JuanLopz1/nc-latin-club/blob/work/supabase/gallery.sql), copia su contenido completo y ejecútalo en **SQL Editor → New query → Run** de tu proyecto actual de Supabase. El script es aditivo y se puede ejecutar de nuevo; conserva usuarios, contenido publicado e historial.
3. Recarga `/admin`, elige **Fototeca** y guarda el primer borrador. Puedes subir tus propias fotos o revisar las recibidas en **Fotos de la familia**.
4. En `/fototeca`, envía una o varias fotos con permiso. Vuelve a la bandeja y pulsa **Actualizar bandeja**. Revisa el envío y usa **Añadir al borrador** o **Rechazar**.
5. Completa los textos y descripciones EN/ES en **Detalles de la foto**. **Vista previa** es privada. Solo **Publicar**, con una cuenta admin, cambia la fototeca pública; los editores pueden preparar borradores.
6. Abre una ventana privada y comprueba las fotos publicadas. Una foto pendiente debe devolver 404 fuera de la sesión editorial.

El script utiliza el bucket privado `club-media` y la configuración que ya instalaste con `supabase/admin.sql`. No activa un plan de pago. Para instalaciones nuevas, `admin.sql` ya incluye la fototeca; quienes tenían el panel instalado deben usar esta actualización.

## Fotos y música

- Visitantes: 1–8 JPEG, PNG o WebP, máximo **3 MiB por foto**. Cada archivo se envía por separado para respetar el límite de solicitudes de Vercel.
- El texto del visitante conserva su idioma original; el equipo revisa ambas versiones antes de publicar. Las fotos se convierten a WebP y se eliminan metadatos EXIF.
- Administración: subir, reemplazar, ordenar, buscar, asignar álbum/crédito y retirar fotos. Retirar una foto no borra archivos referenciados en el historial.
- El cassette reproduce una composición instrumental original al pulsar Play, con volumen y pausa. Se detiene al cambiar de página o dejar la pestaña en segundo plano. El enlace musical adicional se edita en Fototeca.
- Instagram y Spotify aparecen directamente. Si el proveedor bloquea la inserción, queda disponible su enlace externo. No se solicita reproducción automática.

## Límites y conservación

Se permiten tres lotes por origen y hora, 60 en 24 horas, 160 lotes pendientes/en proceso y 16 lotes temporales sin limpiar. El máximo de almacenamiento temporal correspondiente es 384 MiB; las fotos aprobadas y el resto de medios también consumen el espacio de tu plan.

En un envío posterior, el sistema limpia cargas abandonadas tras una hora y rechazos tras siete días, siempre que sus imágenes no aparezcan en borradores, contenido publicado o historial. No es una tarea programada: sin nuevos envíos, esos archivos permanecen privados hasta la próxima limpieza. Las imágenes aprobadas y el historial requieren revisión manual para recuperar espacio.

Si faltan las tablas, el formulario informa que los envíos aún no están disponibles. Si una cuota se agota, no se confirma un envío inexistente. No compartas claves ni contraseñas para resolver errores; basta el mensaje.

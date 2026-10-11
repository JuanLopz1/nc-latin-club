# Panel administrativo — entrega 2026-10-11

## Implementado

- `/admin`, con acceso mediante cuentas previamente autorizadas en Supabase; roles admin/editor y sesiones en cookies HttpOnly, SameSite y Secure sobre HTTPS.
- Seis colecciones: marca/enlaces/Spotify, textos de homepage, eventos reales, fechas culturales, negocios Niagara y páginas de los 55 destinos.
- Formularios EN/ES, búsqueda, creación/duplicación/retiro de fichas, campos opcionales, ordenación y una o varias imágenes por ficha. Los países nuevos se limitan a destinos conocidos del globo.
- Borrador privado, vista previa privada, publicación validada, recuperación desde historial y descarga JSON de la colección. Versión optimista: una edición antigua recibe un conflicto.
- Publicación sin Git push: componentes, rutas y guardia de 404 leen el contenido publicado. Se refresca el contenido compartido al publicar; otras pestañas requieren recarga.
- Imágenes privadas, saneadas con sharp a WebP y sin metadatos; máximo 3 MiB por archivo y 30 imágenes por ficha. Los visitantes solo reciben archivos referenciados exactamente en contenido publicado.
- Eventos/cultura conservan colecciones separadas y un espacio de URLs compartido protegido por SQL, incluso antes de la primera publicación de los datos del repositorio.
- Recomendación Spotify temporal: **MAÑANA SERÁ BONITO · KAROL G**. Enlace de álbum confirmado por su página oficial; no se presenta como el número uno actual. El reproductor se carga por decisión del visitante y no tiene autoplay.
- Fallback con los datos revisados del repositorio; sin configuración, el panel explica la activación y no simula guardar.

## Revisión

Una revisión independiente encontró cinco problemas importantes. Se corrigieron con comprobaciones de regresión: conservar el marcador obligatorio al añadir música, bloquear edición/navegación durante cargas, evitar colisiones de IDs/URLs entre eventos y cultura, volver al acceso después de un refresh revocado y usar cookies Secure detrás del proxy HTTPS. No hubo hallazgos críticos.

## Probado

- `npm test`: **80/80** pruebas, incluidas las regresiones de sesión, cookies, música, validación y permisos.
- `npm run lint`: sin errores ni advertencias.
- Build de producción con integración configurada mediante el servicio local de prueba y sin variables de conexión: ambos aprobados, 305 rutas generadas y TypeScript aprobado.
- SQL completo ejecutado en Postgres (PGlite): RLS, protección de borradores/historial, roles, publicación, conflictos de revisión, colisiones entre eventos/cultura y almacenamiento privado. PGlite se instaló temporalmente fuera de las dependencias de la aplicación.
- HTTP de producción contra el contrato REST local: autenticación, sesión revocada, cookies Secure tras proxy, CSRF, permisos, actualización pública, nuevos slugs, 404 y archivos privados/publicados saneados.
- Chromium: formularios, búsqueda, edición/borrador/publicación, recuperación, vista previa privada, bloqueo durante carga, subida/publicación de múltiples imágenes, Spotify activado por visitante y EN/ES. Anchos 320, 375, 768 y 1440 sin desbordamiento; capturas de móvil/escritorio inspeccionadas.
- Regresión pública Chromium: marquee continuo, revelados, globo, parallax, navegación fija, idioma persistente, Instagram optativo, movimiento reducido y SEO; calendario real/cultural, observancias mensuales, archivo, countdown/ICS y los 21 negocios con filtros y una sola ficha expandida.
- Producción sin configuración: `/admin` indica activación pendiente, las APIs no guardan y las páginas públicas conservan los datos.

## Activación y límites

Se necesita un proyecto **Supabase Free**, ejecutar el SQL, crear el usuario autorizado y configurar las tres variables de servidor en Vercel antes de redeploy. [Guía completa](ADMIN_SETUP.md). No se contrató ningún servicio ni se conectó un proyecto real: no se recibieron credenciales.

Las pruebas locales de contrato REST y Postgres no sustituyen la comprobación de Supabase/Vercel reales. El enlace oficial del álbum funciona; la reproducción del proveedor externo depende de su disponibilidad y restricciones. Staff, noticias, fototeca con envíos/moderación y un constructor de layouts siguen como funciones futuras. La retirada de fotos no borra el archivo del bucket para conservar el historial; el respaldo JSON no incorpora los archivos.

## Corrección de acceso durante la activación

Los logs aportados mostraron una solicitud 404 a `/rest/v1/auth/v1/token`: se había configurado la URL de Data API con `/rest/v1` como base. El cliente ahora normaliza ese sufijo conocido a la raíz del proyecto, conservando las rutas correctas de Auth, REST y Storage. La guía recomienda guardar directamente la URL raíz en Vercel.

También se corrigió el mensaje que convertía cualquier rechazo de autenticación en “Email or password could not be verified”. Solo el error de credenciales mantiene ese mensaje; se distinguen correo sin confirmar, Email deshabilitado, clave de aplicación rechazada, límite de intentos y fallo del servicio. No se exponen mensajes crudos, claves ni tokens del proveedor.

Verificación: **87/87** pruebas, lint y build aprobados; pruebas HTTP de producción con servicio REST local, tanto con URL raíz como con `/rest/v1`. Se comprobaron errores diferenciados, acceso válido, permisos, CSRF, borradores, publicación, rutas y medios privados/publicados. La validación del acceso al proyecto real después del despliegue requiere un nuevo intento del fundador; no se disponía de su sesión ni contraseña.

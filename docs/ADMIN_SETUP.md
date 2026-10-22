# Activar el panel de NC Latin Club

El código del panel está preparado para Supabase. La web conserva los datos revisados del repositorio hasta que se conecte el proyecto. Sin conexión, `/admin` muestra una explicación y no simula guardar cambios.

## 1. Proyecto gratuito

En [Supabase Dashboard](https://supabase.com/dashboard), crea una cuenta, una organización **Free** y un proyecto `nc-latin-club`. No selecciones Pro ni añadas servicios de pago. Guarda la contraseña de la base de datos en tu gestor de contraseñas; el panel no necesita esa contraseña. Los límites y la disponibilidad del plan se muestran en Supabase; no se habilita una mejora de plan desde esta aplicación.

## 2. Tablas y almacenamiento

Abre **SQL Editor**, crea una consulta y ejecuta el contenido completo de [supabase/admin.sql](../../supabase/admin.sql). Crea las tablas, las reglas de acceso, el historial y un bucket **privado** llamado `club-media`. El script puede volver a ejecutarse sin borrar contenido. No hagas público ese bucket.

## 3. Tu cuenta de administrador

El acceso admite correo o nombre de usuario. En proyectos existentes, ejecuta
`supabase/admin-usernames.sql` para activar los nombres únicos; las cuentas sin nombre
siguen entrando con correo. El nombre se guarda en `cms_members.username` en minúsculas
(3 a 32 caracteres, letras, números, punto, guion o guion bajo).

Para crear una cuenta nueva con permisos de administrador, configura de forma privada
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `CMS_NEW_USER_PASSWORD` en el entorno local.
Después ejecuta `node scripts/create-admin-user.mjs kurotodev kurotodev@gmail.com`.
También puedes cargar las claves desde `.env.local` usando
`node --env-file=.env.local scripts/create-admin-user.mjs kurotodev kurotodev@gmail.com`.
La contraseña no debe incluirse en el código ni como argumento del comando. El script
crea la cuenta y su membresía; no cambia contraseñas de cuentas existentes ni envía correos.
Si la membresía falla después de crear la cuenta, completa esa membresía en Supabase.
Para una cuenta ya existente, asigna `username` a su fila de `cms_members` desde Supabase.

En **Authentication → Users → Add user → Create new user**, crea tu cuenta con tu correo y una contraseña que conozcas. Confirma el correo desde el Dashboard si utilizas creación manual. Después ejecuta esta consulta en SQL Editor, sustituyendo solo el correo:

```sql
insert into public.cms_members(user_id, role)
select id, 'admin'
from auth.users
where lower(email) = lower('TU_CORREO_AQUI')
on conflict (user_id) do update set role = excluded.role;
```

La consulta debe encontrar el usuario que acabas de crear. En **Table Editor → cms_members** comprueba que existe la fila con permiso `admin`. Una cuenta sin esa fila no puede entrar al panel. Para otro integrante repite el procedimiento y usa `editor` si solo debe guardar borradores; únicamente `admin` publica. La gestión de cuentas ocurre en Supabase, no en un formulario público.

En las opciones de autenticación, desactiva el registro público de nuevos usuarios y conserva el proveedor **Email**. Los nombres de las opciones pueden variar con la versión del Dashboard.

## 4. Conectar Vercel

En la configuración del proyecto Supabase obtén **Project URL** y, en **API Keys → Legacy API Keys**, las claves `anon` y `service_role`.

En **Vercel → nc-latin-club → Settings → Environment Variables** añade:

| Nombre | Valor de Supabase |
|---|---|
| `SUPABASE_URL` | Project URL, `https://TU_PROYECTO.supabase.co`, sin `/rest/v1` |
| `SUPABASE_ANON_KEY` | Clave `anon` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave `service_role` |

Marca las claves como sensibles. Habilita **Preview** para probar la rama `work`; habilita **Production** cuando quieras conectar también ese despliegue. No uses nombres `NEXT_PUBLIC_` para las claves privadas. No las pegues en el chat ni en GitHub.

Haz **Redeploy** del último despliegue de `work`, porque los nuevos valores deben estar presentes al construir y ejecutar el sitio. Abre `/admin` en la URL de preview y entra con tu correo y contraseña.

Para desarrollo local, guarda esos mismos nombres en `.env.local`, que está ignorado por Git, y reinicia el servidor. Las claves de Vercel no se transfieren automáticamente a este entorno de Codex. Si quieres que Codex compruebe la conexión real, añádelas también mediante los ajustes seguros del entorno, sin enviarlas por chat.

## Uso diario

- **Marca, enlaces y Spotify:** logo, ilustración, contacto, Instagram, álbum/playlist/canción y las invitaciones de Raíces y Niagara.
- **Textos del inicio:** títulos, descripciones, botones, Familia, patrocinio y pie EN/ES. Las etiquetas de funcionamiento y la estructura de las páginas siguen en código.
- **Eventos reales / Calendario cultural:** colecciones separadas. Para eventos con hora usa el campo de inicio con fecha, hora y desplazamiento de Toronto: `2026-10-23T20:00:00-04:00`. En invierno normalmente es `-05:00`. Si no conoces la hora, conserva un rango de fechas y no inventes una.
- **Negocios:** crear, editar, duplicar o retirar fichas; canales, servicios y palabras para buscar. Un pin requiere dirección pública y coordenadas revisadas. No publiques domicilios privados.
- **Países:** textos, secciones, fuentes, imágenes y música de los 55 destinos existentes. La geografía del globo permanece fija. Comprueba título y artista en Spotify y conserva fuentes documentales antes de publicar; la validación de estructura no sustituye la revisión cultural ni verifica automáticamente enlaces externos.
- Puedes adjuntar **una o varias imágenes**, ordenarlas y retirarlas de una ficha. JPEG, PNG o WebP de hasta **3 MiB por archivo**, con descripciones EN/ES. Se decodifican y convierten a WebP, eliminando metadatos. El límite deja margen al tamaño de solicitudes de Vercel.
- **Guardar borrador** no modifica la web. **Vista previa** abre una presentación privada; exige completar los campos necesarios para mostrarla.
- **Publicar** revisa los datos y actualiza la web sin Git push. El panel refresca el contenido compartido y las nuevas solicitudes públicas leen lo publicado. Recarga una pestaña pública que ya estuviera abierta para ver la nueva versión.
- Si otra persona guardó primero, recarga la colección y vuelve a aplicar tus cambios; no se sobrescribe su trabajo.
- **Historial** ofrece las 30 revisiones más recientes; recupera una como borrador y después decide si publicarla. **Descargar respaldo** exporta la colección seleccionada, con el borrador y la versión pública, a JSON. Las imágenes originales no se incluyen en ese archivo: respáldalas desde Supabase Storage. Se conserva el historial en la base de datos; no es una política automática de copias de seguridad.

Las imágenes no referenciadas en contenido publicado requieren sesión editorial; los visitantes reciben 404. Retirar una imagen de una ficha no elimina su archivo del bucket, para permitir recuperar versiones del historial. La limpieza de archivos antiguos se hace en Supabase después de revisar qué versiones se quieren conservar.

- **Fototeca:** fotos, álbumes, créditos, textos EN/ES y enlace musical. La bandeja añade los envíos revisados al borrador privado; solo Publicar los muestra en la web. Las fotos se pueden buscar, ordenar, reemplazar y retirar.

Si ya instalaste el panel antes de la fototeca, ejecuta únicamente [supabase/gallery.sql](../supabase/gallery.sql), siguiendo [la actualización de fototeca](PHOTOTECA_SETUP.md). Conserva usuarios, contenido e historial; no necesitas crear otro proyecto ni cambiar las variables de Vercel.

Staff, noticias y un constructor de layouts continúan como funciones separadas.

## Comprobación de activación

1. Entra como admin y guarda un texto como borrador: una ventana privada debe seguir viendo la versión anterior.
2. Publícalo: recarga la ventana privada y confirma el cambio.
3. Sube una imagen: antes de publicarla, su enlace debe dar 404 sin sesión; después debe verse en la ficha correspondiente.
4. Entra como editor: puede guardar, pero Publicar está desactivado y la API también rechaza la publicación.

El código se verifica en producción local con un servicio REST de prueba y el SQL se ejecuta sobre Postgres mediante PGlite. Eso comprueba la implementación y los permisos del script; la conexión con tu proyecto real de Supabase y Vercel se valida solo después de completar estos pasos.

## Si falla el acceso

Si los logs muestran `/rest/v1/auth/v1/token` con 404, se copió la URL de Data API en lugar de la raíz del proyecto. Configura `SUPABASE_URL` sin `/rest/v1`. El panel también normaliza ese sufijo conocido para que Auth, REST y Storage resuelvan sus rutas correctamente.

El panel usa la cuenta creada en **Authentication → Users** del proyecto indicado por `SUPABASE_URL`. Esa contraseña es independiente de la cuenta del Dashboard de Supabase y de la contraseña de la base de datos.

- **Conectar Supabase:** comprueba las tres variables y la URL HTTPS en el despliegue Preview de `work`; después haz redeploy.
- **Email or password could not be verified:** Supabase devolvió el error de credenciales. Comprueba el proyecto y el usuario en Authentication; consulta el último intento `/token` en Logs → Auth antes de cambiar configuración.
- **Email confirmation:** confirma el correo desde Authentication → Users.
- **Application API key:** la aplicación fue rechazada por la clave. Comprueba que URL y clave `anon` legacy provengan del mismo proyecto y actualiza Preview antes de redeploy.
- **Email provider:** conserva Email habilitado para iniciar sesión. Puedes mantener deshabilitado el registro público.
- **Too many sign-in attempts:** espera antes de volver a intentar.
- **Content service:** consulta la disponibilidad del proyecto y sus logs; el panel ya no presenta ese fallo como una contraseña incorrecta.

Comparte solo el mensaje o código de error si necesitas ayuda; nunca claves, contraseñas, tokens ni encabezados de las solicitudes.

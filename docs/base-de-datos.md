# La base de datos

Desde el 27/11/2026 (datos versión 16) la base es donde vive todo lo que carga la persona. Cada cosa es **una fila**: un cambio toca solo lo suyo y un dispositivo atrasado no puede pisar el resto.

Proyecto de Supabase: `Plantitas` (`kliipodfdabuyhiceryw`). El SQL está en `supabase/migrations`.

## Tablas

Todas tienen la misma forma: `user_id`, `id`, `datos` (el contenido, como lo usa la app), `version` (versión de datos de la app que la escribió), `creado`, `actualizado` (lo pone la base) y `borrado`.

| Tabla | Una fila por | Módulo |
|---|---|---|
| `espacios` | espacio, con su luz | Mi espacio |
| `planos` | plano de un espacio (mismo `id`) | Mi espacio |
| `espacio_plantas` | planta que vive en un espacio | Mi espacio |
| `casos` | planta en la Guardia | Guardia |
| `controles` | control de un caso en un día | Guardia |
| `visitas_vivero` | ida al vivero | Guardia |
| almacenamiento `fotos` | foto de un caso: `<cuenta>/<caso>.jpg` | Guardia |
| `hijitos` | hijito | Hijitos |
| `favoritas`, `colecciones` | planta favorita, colección | Plantas |
| `lecciones`, `insignias` | lección o repaso hecho, insignia | Aprender |
| `avance` | `inicio`, `mascotas`, `xp`, `racha`, `semillas`, `salteadas`, `refuerzo` | Aprender y Perfil |
| `historial` | versión anterior de cada fila que cambió | resguardo |
| `progreso` | el bloque único de antes; ahora es una copia de respaldo | resguardo |
| `dispositivos` | dispositivo vinculado | Perfil |

El catálogo de plantas, las lecciones y la guía son contenido de la app, no datos de la persona: no están en la base.

## Reglas

- Cada cuenta ve, crea y cambia solo sus filas. La app **no puede eliminar** filas ni fotos, ni leer el historial.
- Borrar marca `borrado`. Solo se marca lo que la persona borró a propósito.
- Si a un dispositivo le falta algo que no borró, lo vuelve a traer de la base.
- Si la misma fila cambió en dos dispositivos, se une lo que se puede (puntos, racha, lecciones, colecciones, hijitos); en el resto gana el último en subir y la otra versión queda en `historial`.
- Una app vieja no puede pisar una fila escrita por una más nueva.
- Un envío guarda todas sus filas o ninguna.

## En el dispositivo

La app conserva una copia completa para funcionar sin conexión. De cada fila guarda una huella de cómo estaba la última vez que coincidió con la base: así sabe qué subir y qué traer. Código: `src/lib/filas.ts` (sin red, todo probado) y `src/lib/nube.ts`. Fotos: `src/lib/nubeFotos.ts`.

Sin cuenta conectada, todo queda solo en el dispositivo.

## Recuperar algo

Desde el editor SQL de Supabase:

```sql
-- Lo borrado de una tabla
select id, datos, actualizado from public.casos where borrado;
-- Volver a mostrarlo (la app lo trae en la próxima sincronización)
update public.casos set borrado = false where id = '...';
-- Versiones anteriores de una fila
select guardado, datos from public.historial where tabla = 'espacios' and id = '...' order by n desc;
```

Las fotos quitadas siguen en el almacenamiento `fotos`.

## Probar cambios

- `npm test`: reglas de filas, varias ventanas, sin conexión, dos dispositivos, datos recortados (con una base simulada).
- `supabase start` y `npm run test:base`: lo mismo contra una base real en esta máquina (necesita Docker), más permisos, historial, fotos y el paso desde el bloque viejo.
- Un cambio en la base va como archivo nuevo en `supabase/migrations`, se prueba en local y recién después se aplica.

## Límites

- En el plan gratuito, Supabase puede pausar un proyecto sin uso. La copia local permite seguir usando la app mientras tanto.
- El historial no reemplaza una copia fuera de Supabase: conviene exportar cada tanto.

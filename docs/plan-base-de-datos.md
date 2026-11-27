# Plan: la base de datos como fuente principal

Estado: propuesta del 27/11/2026, sin empezar.

## Qué cambia

Hoy la nube guarda **un bloque con todo** por cuenta, que cada sincronización reemplaza. La propuesta es que cada cosa sea **una fila**: un cambio toca solo lo suyo y un dispositivo atrasado no puede pisar el resto.

- La base manda; el celu y la compu leen lo mismo.
- Cada dispositivo conserva una copia para abrir y anotar sin internet (recomendado).
- Borrar solo marca la fila como borrada: se puede recuperar.
- Sin cuenta, la app sigue guardando solo en el dispositivo, como hoy.

## Datos

Toda tabla lleva `user_id`, `id`, `actualizado` (lo pone la base) y `borrado`. La clave es `user_id` + `id`.

| Tabla | Guarda | Etapa |
|---|---|---|
| `espacios` | nombre, tipo, luz, tamaño, mascotas, esfuerzo, plano | 2 |
| `espacio_plantas` | espacio, planta del catálogo, lugar | 2 |
| `casos` | planta, ingreso, respuestas, causas, alta o despedida, si contestó lo del vivero | 3 |
| `controles` | un control por caso y día | 3 |
| `visitas_vivero` | fecha y qué dijeron | 3 |
| almacenamiento `fotos` (privado) | una foto por caso | 3 |
| `hijitos`, `colecciones`, `favoritas`, `avance` | el resto | 4 |
| `historial` | la versión anterior de cada fila que se modifica | 1 |

Permisos: cada cuenta ve, crea y modifica solo sus filas. La app no puede borrar filas ni leer el historial.

## Cómo funciona en el dispositivo

1. Cada acción se ve al instante y se anota en una lista de **pendientes de enviar**.
2. Los pendientes se envían en orden y se reintentan al volver la conexión. Reenviar uno no duplica nada.
3. Al abrir o volver a la app se traen las filas cambiadas desde la última vez. Una fila con cambios pendientes no se pisa.
4. Si dos dispositivos editan **la misma fila**, gana la última. El historial guarda la otra.
5. Perfil muestra cuántos cambios faltan enviar y cuándo fue la última sincronización.

## Pasar lo que ya está cargado

La primera vez, con la cuenta conectada:

1. Guardar una copia local.
2. Subir lo del dispositivo sin reemplazar filas que ya existan.
3. Volver a leer y comparar cantidades.
4. Solo si coinciden, empezar a usar las tablas. Si no, seguir como antes y avisar.

El bloque actual (`progreso`) no se borra hasta la última etapa y queda como respaldo.

## Etapas

Un cambio publicado por etapa, cada uno con tu OK.

| # | Qué | Listo cuando |
|---|---|---|
| 0 | Dar acceso a la base y correr `supabase/historial.sql` | Hay una versión guardada en el historial |
| 1 | Crear tablas, permisos e historial. La app no cambia | Probado en una base local y aplicado; una cuenta no ve datos de otra |
| 2 | Mi espacio sobre las tablas | Lo cargado en el celu aparece en la compu, con y sin internet |
| 3 | Guardia y fotos | Un caso con su foto se ve en los dos |
| 4 | El resto y retirar el bloque | Nada depende de `progreso` |

## Pruebas que no pueden faltar (etapas 2 a 4)

- Sin internet y reconectando.
- Dos dispositivos cargando a la vez.
- Un envío que falla a la mitad.
- Un dispositivo con una versión vieja.
- La migración con datos de la versión anterior, comparando cantidades.

## Cuidados con el acceso a la base

- El SQL se muestra y se prueba en local antes de aplicarlo; se aplica solo con tu OK.
- No se borran ni modifican las tablas actuales hasta la etapa 4.
- Para revisar datos se miran cantidades, no el contenido ni los correos.
- No hace falta pasar contraseñas ni claves por el chat.

## Límites

- En el plan gratuito, Supabase puede pausar un proyecto sin uso. La copia local permite seguir usando la app mientras tanto.
- El historial no reemplaza una copia fuera de Supabase: conviene exportar cada tanto.

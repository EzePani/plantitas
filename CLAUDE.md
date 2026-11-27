# Plantitas

## Los datos del usuario no se pierden

Regla principal del proyecto: ningún cambio puede borrar ni recortar lo que la persona cargó. Si aparece un riesgo de pérdida, se arregla antes de seguir publicando; avisarlo no alcanza.

### Incidente del 27/11/2026

Se perdieron las plantas de Mi espacio, los planos y los casos de la Guardia usada desde el celular. Quedaron los espacios, las lecciones y los puntos. No se pudieron recuperar: la nube guarda una sola versión y ya estaba pisada.

Causas encontradas y reproducidas (no se confirmó cuál ocurrió):

- Dos ventanas de la app sobre el mismo guardado (instalada y pestaña): la más vieja escribía lo que tenía en memoria sobre lo nuevo y lo subía a la nube.
- Una app en una versión vieja podía subir datos sin los campos nuevos, y los demás dispositivos los aplicaban reemplazando los suyos.

Arreglo: PR #22 (datos versión 15).

### Reglas que tiene que cumplir el código

- Cada acción parte de lo último guardado (`alDiaAntes` en `src/store/useStore.ts`).
- Nunca se escribe sobre datos de una versión más nueva ni sobre datos que no se pueden leer (`src/store/disco.ts`).
- Lo que escribió una versión vieja se junta con lo actual, no lo reemplaza.
- Antes de reemplazar datos o cambiar de formato se guarda una copia (`src/lib/copias.ts`).
- La base guarda cada cosa en su fila (`docs/base-de-datos.md`). De la base solo se quita lo que la persona borró a propósito, y se marca, no se elimina. Lo que falta en un dispositivo sin haberse borrado se vuelve a traer.

### Antes de publicar un cambio en guardado, migraciones o nube

- [ ] Si cambia el formato de los datos (aunque sea un campo opcional): subir `VERSION_DATOS` y probar la carga de datos de la versión anterior.
- [ ] Un dato nuevo se suma a `aFilas` y `deFilas` (`src/lib/filas.ts`), a `fusionar` y a la lista de `cosas` de `copias.ts`. Si es una lista de cosas que se pueden perder, va en su propia tabla, no dentro de otra fila.
- [ ] Sumar a `src/lib/ventanas.test.ts` el caso de pérdida que el cambio pueda abrir (varias ventanas, versión vieja, sincronización).
- [ ] `npm test` pasa. La publicación lo corre y se frena si falla; no saltear ni borrar esos tests para publicar.
- [ ] Si cambia la base: archivo nuevo en `supabase/migrations`, `supabase start` y `npm run test:base` antes de aplicarlo. Primero se aplica la base y después se publica la app.
- [ ] Pedir el OK de publicación avisando qué datos toca.

### Lo que todavía no está protegido

- Las copias automáticas viven en el dispositivo: se van si se borran los datos de la app.
- Sin cuenta conectada no hay base: todo depende del dispositivo.
- Las fotos de la Guardia no entran en las copias automáticas ni en la exportación (sí en la base, con cuenta conectada).
- Para un resguardo fuera de Supabase: Perfil → Exportar mi progreso.

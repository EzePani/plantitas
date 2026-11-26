# Brief tanda 7: más plantas y variantes

Seguí `investigacion/BRIEF-t6.md` (y los briefs que manda leer), con estos cambios:

- Fecha de consulta a registrar: 2026-11-26.
- Como ejemplo de especie + variantes mirá las entradas `dieffenbachia*` y `potus*` en `src/data/plants.json`.
- Si una variante no se puede respaldar con 2 fuentes de cuidados, usá fuentes de la especie diciéndolo claramente en `adaptaciones` o `discrepancias` y bajá la confianza; si ni así, o si no podés confirmar que la variante existe, omitila.
- Poné en `otros_nombres` el nombre botánico sin signos (ej. si el científico lleva "×") y los nombres de vivero que confirmes: el buscador compara texto.
- No edites `plants.json`: si a una planta ya cargada le falta un nombre alternativo, avisalo en tu respuesta con la fuente.

## Fotos fuera de Commons
Primero buscá en Wikimedia Commons (`scripts/buscar-fotos.mjs` + `scripts/descargar-extras.mjs`). Si faltan, buscá en internet en otras fuentes **con licencia abierta**:

- iNaturalist: `https://api.inaturalist.org/v1/observations?taxon_name=<especie>&photo_license=cc0,cc-by,cc-by-sa&quality_grade=any&per_page=20` (preferí `captive=true`). La imagen grande es la URL de la foto cambiando `square` por `large`.
- Openverse (Flickr y otros): `https://api.openverse.org/v1/images/?q=<nombre>&license=cc0,pdm,by,by-sa&page_size=20`.
- GBIF: `https://api.gbif.org/v1/occurrence/search?q=<nombre>&mediaType=StillImage`.

Se bajan con `node scripts/descargar-url.mjs scripts/fotos-<lote>-url.json investigacion/nuevas/fotos-<lote>.json <desde>` (formato en el encabezado del script; `desde` = 1 si no hay principal todavía, o el número que siga). El script pisa la lista de cada id que pidas: si ya tenía fotos de Commons, usá un archivo de salida aparte y uní las listas a mano.

Nunca uses fotos sin licencia abierta (viveros, tiendas, blogs, redes, resultados de buscador), ni NC ni ND. Para un cultivar, la foto tiene que estar identificada como ese cultivar (título, etiqueta o descripción) y verse como describen las fuentes; ante la duda, dejalo sin foto. Mirá cada imagen con Read.

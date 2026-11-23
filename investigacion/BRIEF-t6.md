# Brief tanda 6: plantas nuevas del catálogo (ficha completa + cultivo + fotos)

Leé primero, completos: `investigacion/BRIEF.md` (reglas duras: solo citar URLs que abriste con WebFetch y leíste, hemisferio sur, tono, nada de mitos), `investigacion/BRIEF-t5.md` (formato de `cultivo`: porte, tutor, poda, propagación) y `src/data/plantas/esquema.ts` (esquema zod exacto). Fecha de consulta a registrar: 2026-11-23.

Como modelo terminado mirá en `src/data/plants.json` las entradas `cola-de-mono-dorada` (completa pero con toxicidad sin verificar) y `potus` (con toxicidad verificada), y en `src/data/plantas/cultivo-a.json` la de `potus` para el `cultivo`.

## Qué entregar
Un array JSON en `investigacion/nuevas/plantas-<tu-lote>.json` con **una entrada completa por planta**, con exactamente los campos del esquema `esquemaPlanta` (los de cuidados y mascotas que ya conocés, más `clases`, `cultivo` y `fotos_extra`). Y las notas en `investigacion/t6-<tu-lote>-notas.json` con el formato de `BRIEF.md`.

### Cuidados y mascotas
- `id`: kebab-case sin tildes (`^[a-z-]+$`), el que te paso. `nombre_comun`: el que te paso. `otros_nombres`: nombres que se usan en Argentina si los conocés y los confirman las fuentes; `[]` si no.
- Cuidados (luz, riego, humedad, sustrato): 2 fuentes institucionales abiertas y leídas por dato (RHS, NC State Plant Toolbox, extensiones universitarias, jardines botánicos). Van en `fuentes` (mínimo 2, sin URLs repetidas). Missouri Botanical Garden suele rechazar la conexión: probá otra.
- Luz con el Modelo de luz: `luz_requerida` y `luz_tolerada` usan `directa`, `indirecta_brillante`, `indirecta_media` o `baja` (la requerida no se repite en las toleradas). `horas_sol_directo` (0 a 12) y `tolera_sol_tarde`: criterio conservador; ante fuentes que no coinciden, tomá lo menor. Sin horas de sol directo, `tolera_sol_tarde` es `false`. `sensibilidad_calor`: baja, media o alta. `luz.confianza_sol`: `media` o `alta` solo si una fuente respalda las horas y el sol de tarde; si es estimación tuya, `baja`. Buenos Aires: la ventana más soleada es la norte.
- `riego.verano` e `invierno`: 1 oración cada uno, preferí la regla ("regá cuando se seque…") a frecuencias exactas salvo que la fuente las dé. Verano = diciembre a febrero.
- `apta.balcon`: pensá en Buenos Aires (heladas suaves ocasionales, verano caluroso); explicalo en `nota_balcon`. `tolerancia_descuido` 1 a 5, `tamano` (chica < 30 cm, mediana 30 a 90, grande > 90), `dificultad`: juicio tuyo apoyado en las fuentes.
- `grupo`: follaje_tropical, suculenta_cactus, amiga_humedad, con_flor o palmera.
- `tip`: 1 oración cálida y práctica. `confianza` general: la más baja entre luz, riego y sustrato. `adaptaciones`: cada conversión de estación o mes que hagas. `discrepancias`: si las fuentes se contradicen, el criterio que elegiste.
- **Toxicidad**: abrí la ficha de la especie en ASPCA (aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants) y una segunda fuente veterinaria o NC State. Si no hay ficha de esa especie o género: `no_verificada`, con `gravedad`, `sintomas` y `partes` en `null`. Gato y perro por separado. `gravedad` según las fuentes (`leve`, `moderada`, `grave`) solo si es tóxica; si es segura, `null`. `advertencia_grave` solo con riesgo serio documentado. `atractivo_para_mascotas` solo con respaldo, si no `desconocido` y motivo `""`. `repelencia_por_olor`: casi siempre `ninguna`. Confianza `alta` en toxicidad exige 2 fuentes en `fuentes_toxicidad`.
- `imagen` y `atribucion_imagen`: `null`. `fotos_extra`: `[]` (las cargo yo después con lo que descargues).

### Clases y cultivo
- `clases`: lista de 1 o 2 entre `follaje`, `suculenta`, `cactus`, `con_flor` (una planta puede ser cactus y con flor). Marcá `con_flor` solo si la flor es parte de por qué se la tiene.
- `cultivo`: exactamente el formato de `BRIEF-t5.md` (porte, tutor, poda, propagacion, fuentes, confianza, adaptaciones). Meses del hemisferio sur ya convertidos. Si no hay dato, lo más conservador (`meses: []`, `metodos: []`), confianza más baja y anotalo en las notas.

## Fotos (1 principal + 2 extra por planta)
1. Buscá candidatas en Wikimedia Commons con `node scripts/buscar-fotos.mjs "<nombre científico> <palabra>"` (probá "leaf", "potted", "houseplant", el cultivar). Esperá unos segundos entre búsquedas: Commons devuelve 429 si se le pide seguido.
2. Elegí 3: la **principal** (planta entera y reconocible, nítida, apaisada o cuadrada, sin personas, carteles ni marcas de agua) y 2 que muestren algo distinto (detalle de hoja, flor, planta en maceta). Tiene que ser la especie correcta (ojo con cultivares y parecidas). Solo CC0, dominio público, CC BY y CC BY-SA (el script rechaza las demás).
3. Escribí `scripts/fotos-<tu-lote>-elegidas.json`: `{ "<id>": ["File:principal.jpg", "File:extra1.jpg", "File:extra2.jpg"] }` y corré `node scripts/descargar-extras.mjs scripts/fotos-<tu-lote>-elegidas.json investigacion/nuevas/fotos-<tu-lote>.json 1`. Baja a `public/img/extra/<id>-1.webp`, `-2.webp`, `-3.webp` y anota las atribuciones (la primera es la principal).
4. **Mirá cada imagen descargada con Read** y confirmá que es la planta correcta y que se ve bien; si no, cambiá el título y volvé a correr (pisa los archivos). Si no hay 3 buenas, dejá las que haya: mejor menos fotos que una equivocada. Si no hay ninguna confiable, dejala sin fotos y avisame.

## Validar
Antes de terminar corré: `LOTE=investigacion/nuevas/plantas-<tu-lote>.json npx vitest run src/data/plantas/validar-lote.test.ts` y arreglá lo que marque.

## Reglas
No toques ningún otro archivo (ni `plants.json`, ni `clases.json`, ni `index.ts`, ni lotes de otros). No hagas commits. Sin datos personales en las búsquedas. Parafraseá siempre; español rioplatense, cálido, sin emojis.

Respuesta final: resumen corto de qué quedó sólido y qué flojo (por planta), qué sitios no pudiste abrir y qué fotos quedaron con dudas.

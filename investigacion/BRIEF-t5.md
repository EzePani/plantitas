# Brief tanda 5: porte, tutor, poda y propagación de cada planta del catálogo

Leé primero `investigacion/BRIEF.md` completo (reglas duras: solo citar URLs abiertas y leídas, hemisferio sur, tono). Fecha de consulta a registrar: 2026-11-22.

Las plantas ya están en `src/data/plants.json` con sus fuentes de cuidados. Empezá por esas mismas URLs (NC State Plant Toolbox, RHS, Missouri Botanical Garden, extensiones): suelen decir el hábito de crecimiento, cómo se propaga y cuándo se poda. Sumá otra fuente institucional si hace falta.

## Qué entregar
Un objeto JSON en `src/data/plantas/cultivo-<tu-lote>.json`, con una entrada por id de planta de tu lote:

```json
{
  "potus": {
    "porte": ["trepadora", "colgante"],
    "tutor": { "recomendado": "opcional", "detalle": "Con un tutor de musgo trepa y da hojas más grandes; sin tutor cae en guías." },
    "poda": { "meses": [9, 10, 11], "detalle": "Recortá las guías largas en primavera para que ramifique." },
    "propagacion": {
      "metodos": ["esqueje_agua", "esqueje_tierra"],
      "en_agua": true,
      "meses": [9, 10, 11, 12, 1, 2],
      "detalle": "Cortá un tramo de tallo con un nudo y una hoja y ponelo en agua: en unas semanas saca raíces."
    },
    "fuentes": [{ "titulo": "...", "org": "...", "url": "https://...", "fecha_consulta": "2026-11-22" }],
    "confianza": "alta",
    "adaptaciones": ["Las fuentes dicen primavera (marzo a mayo en el norte): se pasó a septiembre a noviembre."]
  }
}
```

## Campos
- `porte`: lista (1 o 2 valores) entre `"erguida"` (crece hacia arriba sola, incluye arbolitos y cañas), `"trepadora"` (trepa si tiene de dónde agarrarse), `"colgante"` (cae en guías o ramas; lo que la gente llama "caída"), `"roseta"` (compacta, hojas desde el centro o mata baja). Según el hábito que describan las fuentes.
- `tutor.recomendado`: `"si"` (lo necesita o las fuentes lo recomiendan), `"opcional"` (anda con o sin), `"no"`. `detalle`: 1 oración que diga cuándo ponerlo y de qué tipo (tutor de musgo, caña, aro, enrejado). Si es `"no"`, `detalle` puede ser `""`.
- `poda.meses`: meses (1 a 12, ya convertidos al hemisferio sur) en los que conviene podar o recortar. `[]` si no se poda (solo se sacan hojas secas). `detalle`: 1 oración práctica; si no se poda, decilo ("No necesita poda: solo sacá las hojas secas").
- `propagacion.metodos`: lista entre `"esqueje_agua"`, `"esqueje_tierra"`, `"hoja"` (esqueje de hoja), `"division"` (dividir la mata o los rizomas), `"hijuelos"` (separar hijitos/retoños/keikis/plantines), `"acodo"` (acodo aéreo), `"semilla"`. Solo los que las fuentes respalden para hacer en casa.
- `propagacion.en_agua`: `true` solo si una fuente dice que los esquejes o hijitos enraízan en agua.
- `propagacion.meses`: mejor época para hacer hijitos, en meses del hemisferio sur. `detalle`: 1 o 2 oraciones prácticas y cálidas.
- `fuentes`: mínimo 1, ideal 2, con el formato exacto del ejemplo. Solo URLs que abriste y leíste.
- `confianza`: `"alta"` 2+ fuentes institucionales coinciden; `"media"` 1 institucional o coinciden con matices; `"baja"` poca evidencia (se muestra con aviso).
- `adaptaciones`: cada conversión de estación o mes que hiciste. Conversión: primavera = septiembre a noviembre, verano = diciembre a febrero, otoño = marzo a mayo, invierno = junio a agosto.

Si un dato no se puede verificar, no lo inventes: poné lo más conservador (por ejemplo `metodos: []`, `meses: []`), bajá la confianza y anotalo en las notas.

Entregá además `investigacion/t5-cultivo-<tu-lote>-notas.json` con el formato de notas de `BRIEF.md`.

No toques ningún otro archivo del repo. No hagas commits. Al terminar verificá que el JSON parsea y que están todos los ids de tu lote.

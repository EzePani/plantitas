# Brief: lote de plantas del catálogo

Leé primero `investigacion/BRIEF.md` (reglas) y `src/data/plantas/esquema.ts` (esquema zod exacto que tiene que cumplir cada planta).

Para cada planta de tu lote, investigá y escribí una entrada. Entregá un array JSON en `src/data/plantas/lote-<tu-nombre>.json`.

## Por planta
- Cuidados (luz, riego, humedad, sustrato): al menos 2 fuentes institucionales abiertas y leídas (ej: RHS + Missouri Botanical Garden, o NC State Plant Toolbox + una extensión universitaria). Van en `fuentes`.
- Toxicidad: buscá la ficha de la especie en ASPCA y una segunda fuente veterinaria o NC State. Van en `mascotas.fuentes_toxicidad`. Si no hay ficha: "no_verificada" con `gravedad`, `sintomas` y `partes` en null.
- `gravedad`: basala en lo que digan las fuentes (ej: irritación oral por oxalatos de calcio insolubles suele ser leve a moderada). Si es segura, null.
- `advertencia_grave`: solo si las fuentes describen riesgo serio (falla orgánica, riesgo de vida). Si no, null.
- `atractivo_para_mascotas`: solo con respaldo (ASPCA u otra fuente que lo mencione, ej. hojas colgantes de la cinta atraen gatos). Sin respaldo: "desconocido" y motivo "".
- `repelencia_por_olor`: casi siempre "ninguna". "reconocida" exige fuente veterinaria.
- `luz.necesidad` / `tolera`: traducí las categorías de las fuentes a poca / media / mucha (mucha = sol directo varias horas o muchísima claridad; media = luz brillante indirecta; poca = lejos de la ventana o ambientes poco luminosos). `sol_directo` true solo si las fuentes dicen que tolera pleno sol.
- `riego.verano` e `invierno`: 1 oración cada uno, sin prometer frecuencias exactas salvo que las fuentes las den; preferí la regla (ej: "Regá cuando se seque la mitad superior de la tierra").
- `apta.balcon`: pensá en Buenos Aires (heladas ocasionales suaves en invierno, verano caluroso). Basalo en la rusticidad/temperatura mínima que den las fuentes y explicalo en `nota_balcon` (1 oración; "" si no aplica).
- `tolerancia_descuido`, `tamano` (tamaño típico en maceta de interior: chica < 30 cm, mediana 30-90 cm, grande > 90 cm), `dificultad`: juicio tuyo apoyado en las fuentes.
- `tip`: 1 oración cálida y práctica. `mascotas.nota_mascotas`: 1 consejo práctico y cálido.
- `imagen` y `atribucion_imagen`: null (se cargan después).
- `confianza` general: la más baja entre los datos de cuidado.
- `id`, `nombre_comun`: usá exactamente los que te paso. `otros_nombres`: nombres usados en Argentina si los conocés.

Validá tu JSON contra el esquema antes de terminar, por ejemplo:
`npx tsx -e "..."` no está instalado; usá `npx vitest run` NO (no hay test todavía). Alcanza con: `node -e "JSON.parse(require('fs').readFileSync('src/data/plantas/lote-<nombre>.json','utf8')).forEach(p=>console.log(p.id, p.fuentes.length, p.mascotas.fuentes_toxicidad.length))"` y revisar a ojo contra el esquema.

No toques ningún otro archivo del repo salvo tu lote y tu archivo de notas. No hagas commits.

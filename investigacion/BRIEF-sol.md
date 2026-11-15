# Brief: datos de sol del catálogo

Leé primero `investigacion/BRIEF.md` (reglas duras: solo citás URLs que abriste y leíste con WebFetch).

El catálogo (`src/data/plants.json`) ya tiene, por planta, la luz relevada con fuentes (`luz.detalle`, `luz_requerida`, `luz_tolerada`) y sus `fuentes`. Faltan tres datos que hoy son ESTIMACIONES sin fuente (`luz.confianza_sol: "baja"`):
- `horas_sol_directo`: cuántas horas de sol directo por día tolera (0 = ninguna; 6 o más = pleno sol)
- `tolera_sol_tarde`: si aguanta el sol fuerte de la tarde (el más intenso y caluroso)
- `sensibilidad_calor`: "baja" | "media" | "alta"

Para cada planta de tu lote, buscá qué dicen las fuentes institucionales (RHS, NC State Plant Toolbox, extensiones universitarias, Clemson HGIC, UF/IFAS, Wisconsin, etc.). Empezá por las fuentes que la planta ya tiene citadas en plants.json (reabrilas: suelen decir "full sun", "part shade", "bright indirect", "avoid direct afternoon sun", "morning sun is fine", temperaturas máximas, etc.) y sumá otra si hace falta.

Cómo traducir (y anotá la regla que usaste en `nota_sol`):
- "full sun" (6+ h) → horas 6. "part sun / part shade" o "some direct sun" → 3 a 4. "morning sun only", "gentle/early sun tolerated" → 2. "no direct sun", "bright indirect only", "leaves scorch in direct sun" → 0.
- `tolera_sol_tarde`: true solo si las fuentes dicen pleno sol sin reparos. Si dicen que el sol de la tarde / del mediodía / de verano quema, o recomiendan sombra a la tarde → false.
- `sensibilidad_calor`: "alta" si las fuentes advierten daño por calor, aire caliente o sol a través de vidrio, o piden ambiente fresco; "baja" si la describen como resistente al calor o de climas áridos; "media" si no dicen nada claro (y en ese caso confianza "media" como mucho).
- Si las fuentes se contradicen: el criterio más conservador (menos horas) y anotá la discrepancia.
- Si de paso ves que `luz_requerida` o `luz_tolerada` están mal respecto de las fuentes (categorías: directa | indirecta_brillante | indirecta_media | baja; "baja" = ambiente oscuro, casi sin sombra), corregilas incluyendo esos campos. Ojo con "tolera poca luz": solo va "baja" en `luz_tolerada` si la fuente dice explícitamente que tolera low light.
- Las fuentes del hemisferio norte dicen "south/west window": en Buenos Aires la ventana soleada es la NORTE; el sol de tarde (oeste) es igual en ambos hemisferios. Anotá la adaptación.

Entregá `src/data/plantas/luz-verificada-<tu-nombre>.json`, un objeto con una entrada por planta:
```json
{
  "potus": {
    "horas_sol_directo": 0,
    "tolera_sol_tarde": false,
    "sensibilidad_calor": "media",
    "confianza_sol": "alta",
    "fuentes_sol": [ { "titulo": "...", "org": "...", "url": "...", "fecha_consulta": "2026-11-15" } ],
    "discrepancias_sol": [],
    "adaptaciones_sol": [],
    "nota_sol": "RHS: 'bright indirect light, direct sun scorches'. NC State: 'partial shade'."
  }
}
```
- `confianza_sol`: "alta" si 2+ fuentes institucionales coinciden en los tres datos; "media" si una sola fuente o hay matices; "baja" si no encontraste respaldo (en ese caso dejá los valores conservadores y decilo).
- `fuentes_sol`: las URLs que abriste para estos datos (pueden repetir las que la planta ya tenía).
- `discrepancias_sol` / `adaptaciones_sol`: frases en español para mostrar en la ficha (pueden quedar vacías).
- Opcionales, solo si hay que corregir: `luz_requerida`, `luz_tolerada`.

Además escribí `investigacion/sol-<tu-nombre>-notas.json` con el formato de notas del BRIEF.md (`fuentes`, `revisar`, `no_pude_abrir`).

No toques ningún otro archivo. No hagas commits. Al final, resumen corto: qué quedó sólido, qué flojo, qué corregiste de luz_requerida/tolerada, y sitios que no abrieron.

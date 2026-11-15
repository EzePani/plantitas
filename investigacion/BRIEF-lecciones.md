# Brief: lecciones verificadas

Leé primero `investigacion/BRIEF.md` (reglas), `src/data/lessons/esquema.ts` (esquema zod) y el JSON actual de tus unidades en `src/data/lessons/`. Lo que hay hoy es un BORRADOR escrito de memoria: usalo como punto de partida, pero cada afirmación tiene que quedar respaldada por fuentes que abriste, o corregirse, o eliminarse.

Reescribí el archivo JSON de cada unidad que te toca, cumpliendo:
- Misma cantidad de lecciones, mismos `id`, `unidad` y temas (podés mejorar título y gancho).
- `gancho`: una pregunta cotidiana y cálida.
- `tarjetas`: 4 a 6 por lección. Cada `texto` con MÁXIMO 2 oraciones (hay un test que cuenta los puntos: evitá abreviaturas con punto y los dos puntos seguidos de oración larga está bien). Usá variedad de tipos: `concepto`, `por_que`, `dato_ba` (dato de Buenos Aires: estaciones, calefacción, clima), `comparativa` (campos `imagen_mal`, `imagen_bien`), `tactil` (solo con imagen `planta-partes`, zonas con id `hojas`, `tallo`, `raices`, `maceta`). Al menos un `dato_ba` por unidad cuando tenga sentido.
- `imagen`: solo estos nombres de ilustración existen: planta-feliz, planta-triste, planta-seca, planta-ahogada, planta-quemada, planta-estirada, necesidades, ventana-sol, luz-directa, luz-indirecta, luz-poca, mapa-sol, riego, dedo, maceta-drenaje, maceta-sin-drenaje, sustrato, trasplante, casa, calefaccion, estaciones, gato, perro, veterinario, altura, planta-partes. Si te haría falta una ilustración nueva, usá la más cercana y anotala en tu respuesta final como "ilustración deseada".
- `para_llevarte`: exactamente 3 puntos cortos.
- `quiz`: 3 a 5 preguntas, mezclando tipos: `opcion_multiple`, `verdadero_falso`, `que_le_pasa` (imagen + opciones de síntoma/causa), `unir` (2 a 5 pares, textos cortos). `explicacion` corta y amable. Solo una opción correcta, sin ambigüedad.
- `fuentes`: mínimo 2 por lección, formato `{ "titulo", "org", "url", "fecha_consulta": "2026-11-14" }`, solo URLs que abriste.
- `confianza`: alta / media / baja según las reglas. Si una lección queda verificada, quitá el campo `"estado"`. Si no llegás a 2 fuentes, dejá `"estado": "no_verificado"` y confianza "baja".
- `xp`: 20.

Validá que el JSON parsea y corré `npx vitest run src/data/lessons` (tiene que pasar).

No toques ningún otro archivo del repo salvo los JSON de tus unidades y tu archivo de notas. No hagas commits.

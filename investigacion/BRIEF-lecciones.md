# Brief: lecciones verificadas

Leé primero `investigacion/BRIEF.md` (reglas), `src/data/lessons/esquema.ts` (esquema zod) y el JSON actual de tus unidades en `src/data/lessons/`. Lo que hay hoy es un BORRADOR escrito de memoria: usalo como punto de partida, pero cada afirmación tiene que quedar respaldada por fuentes que abriste, o corregirse, o eliminarse.

Reescribí el archivo JSON de cada unidad que te toca, cumpliendo:
- Misma cantidad de lecciones, mismos `id`, `unidad` y temas (podés mejorar título y gancho).
- `gancho`: una pregunta cotidiana y cálida.
- `tarjetas`: 4 a 6 por lección. Cada `texto` con MÁXIMO 2 oraciones (hay un test que cuenta los puntos: evitá abreviaturas con punto y los dos puntos seguidos de oración larga está bien). Usá variedad de tipos: `concepto`, `por_que`, `dato_ba` (dato de Buenos Aires: estaciones, calefacción, clima), `comparativa` (campos `imagen_mal`, `imagen_bien`), `tactil` (solo con imagen `planta-partes`, zonas con id `hojas`, `tallo`, `raices`, `maceta`). Al menos un `dato_ba` por unidad cuando tenga sentido.
- `imagen`: solo estos nombres de ilustración existen: macetas-materiales (maceta de barro junto a una de plástico), cachepot (maceta funda con otra maceta adentro), piedras-fondo (maceta en corte con capa de piedras abajo), piedras-arriba (maceta con grava sobre la tierra), raices-apretadas (cepellón con raíces dando vueltas), abono-npk (tres letras N, P, K con hoja, raíz y flor), abono-tipos (botella de abono líquido, granulado y humus), abono-exceso (planta con bordes de hojas quemados y frasco volcado), suculenta, cactus, helecho, orquidea, monstera-hoja, helada (maceta en balcón con escarcha), hojas-caidas (planta con hojas en el piso), valija (valija al lado de plantas agrupadas), sombra-nitida (mano con sombra bien marcada), sombra-difusa (mano con sombra borrosa), raices-sanas, raices-podridas, sol-manana (ventana con sol suave), sol-tarde (ventana con sol fuerte y caluroso), plato-agua (maceta con plato con agua), ducha (planta bajo la ducha), autorriego (maceta con mecha a un recipiente de agua), rociador (pulverizador), palito (palito de madera clavado en la tierra), planta-feliz, planta-triste, planta-seca, planta-ahogada, planta-quemada, planta-estirada, necesidades, ventana-sol, luz-directa, luz-indirecta, luz-poca, mapa-sol, riego, dedo, maceta-drenaje, maceta-sin-drenaje, sustrato, trasplante, casa, calefaccion, estaciones, gato, perro, veterinario, altura, planta-partes. Si te haría falta una ilustración nueva, usá la más cercana y anotala en tu respuesta final como "ilustración deseada".
- `para_llevarte`: exactamente 3 puntos cortos.
- `quiz`: 3 a 5 preguntas, mezclando tipos: `opcion_multiple`, `verdadero_falso`, `que_le_pasa` (imagen + opciones de síntoma/causa), `unir` (2 a 5 pares, textos cortos). `explicacion` corta y amable. Solo una opción correcta, sin ambigüedad.
- `fuentes`: mínimo 2 por lección, formato `{ "titulo", "org", "url", "fecha_consulta": "2026-11-15" }` para las fuentes nuevas (las que ya estaban conservan su fecha), solo URLs que abriste.
- `confianza`: alta / media / baja según las reglas. Si una lección queda verificada, quitá el campo `"estado"`. Si no llegás a 2 fuentes, dejá `"estado": "no_verificado"` y confianza "baja".
- `xp`: 20.

Validá que el JSON parsea y corré `npx vitest run src/data/lessons` (tiene que pasar).

No toques ningún otro archivo del repo salvo los JSON de tus unidades y tu archivo de notas. No hagas commits.


## Modelo de luz (usar estas mismas palabras en todas las lecciones)
- Luz DIRECTA: el sol toca físicamente la planta (la mano hace una sombra bien definida)
- Luz INDIRECTA BRILLANTE: el lugar está muy claro pero el sol no pega sobre la planta (sombra difusa o borrosa)
- Luz INDIRECTA MEDIA: ambiente claro pero lejos de la ventana (sombra apenas visible)
- Luz BAJA: ambiente oscuro, casi sin sombra
Cada espacio de la casa tiene su propia luz (ej: el balcón con luz directa, el living con indirecta). La app nunca le pide al usuario la orientación: se deduce de a qué hora EMPIEZA y a qué hora DEJA de pegar el sol.

## Mitos
Para temas con mitos populares (regar con hielo, medidores de humedad baratos, rociar las hojas, piedras en el fondo, etc.): investigá, contrastá con fuentes institucionales y, si no tienen respaldo, mostralos como mito explicando por qué (una tarjeta comparativa o una pregunta verdadero/falso funcionan bien).

## Lo que ya existe
Las lecciones que ya están en el JSON fueron verificadas con fuentes en una pasada anterior (mirá sus `fuentes` y las notas viejas en `investigacion/*-notas.json`). Lo que siga siendo válido, reutilizalo: no hace falta volver a abrir una fuente para un dato que no cambiás. Para todo dato NUEVO o que modifiques, sí: fuente abierta y leída.

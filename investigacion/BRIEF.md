# Reglas de investigación de Plantitas (leer completo antes de empezar)

Plantitas es una app para aprender sobre plantas de interior, para un usuario de Buenos Aires (hemisferio sur). Todo el contenido tiene que salir de fuentes confiables y verificables. **Prohibido afirmar datos de memoria**: tu memoria sirve para saber qué buscar, no como fuente.

Fecha de consulta a registrar: 2026-11-15 (las fuentes ya citadas en archivos existentes conservan su fecha).

## Jerarquía de fuentes
1. Instituciones botánicas/hortícolas: Royal Horticultural Society (rhs.org.uk), Missouri Botanical Garden Plant Finder, Kew (powo.science.kew.org / kew.org), extensión universitaria (UF/IFAS, NC State Extension Plant Toolbox, Clemson HGIC, Univ. of Minnesota/Wisconsin/Maryland/Penn State Extension, etc.)
2. Argentina: INTA, Facultad de Agronomía UBA, Jardín Botánico Carlos Thays, Servicio Meteorológico Nacional u otras oficiales
3. Toxicidad para mascotas: ASPCA (aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants) como principal + una segunda fuente veterinaria seria (Pet Poison Helpline, VCA Hospitals, Merck Veterinary Manual, UC Davis Vet Med, Cornell Vet, FDA). NC State Plant Toolbox también informa toxicidad y sirve como apoyo.
4. Libros de horticultura de interior de editoriales reconocidas
5. Foros (r/houseplants): SOLO capa práctica con consenso claro, nunca fuente única, NUNCA para toxicidad

## Reglas duras
- Solo podés citar una URL que **abriste con WebFetch y leíste** y que dice lo que le atribuís. Un resultado de búsqueda sin abrir NO cuenta. Si un sitio bloquea el acceso, probá otra página o institución equivalente; si no lográs verificar un dato, marcalo como no verificado: nunca lo rellenes.
- Cada dato relevante (luz, riego, sustrato, humedad, toxicidad) necesita 2 fuentes independientes. Confianza: "alta" = 2+ institucionales coinciden; "media" = 1 institucional + consenso de comunidad, o 2 institucionales con matices; "baja" = poca evidencia.
- Si las fuentes se contradicen: elegí el criterio más conservador y registrá la discrepancia.
- Toxicidad: si ASPCA (u otra fuente veterinaria) no lista la especie o el género, es "no_verificada". No la deduzcas de plantas parecidas. Gato y perro se evalúan por separado.
- Adaptación al hemisferio sur / Buenos Aires: las fuentes del norte hablan de "ventana sur = más sol" y de meses invertidos. En Buenos Aires la ventana más soleada es la NORTE, verano = diciembre a febrero, invierno = junio a agosto, clima templado húmedo, inviernos con calefacción que seca el aire. Convertí y anotá cada adaptación que hagas.
- Nada de mitos ni remedios caseros (cubitos de hielo, etc.). Nunca recomendar aceites esenciales ni sprays caseros.
- Parafraseá siempre con palabras propias. No copies textos de las fuentes.
- No incluyas datos personales en ninguna búsqueda o pedido.

## Tono de los textos (van directo a la app)
Español rioplatense, cálido y cercano (vos, "tranqui", "no pasa nada"). Nunca culpar al usuario. Frases cortas y simples, sin jerga. Sin emojis.

## Qué entregar además de los datos
Un archivo `investigacion/<tu-nombre>-notas.json` con:
```json
{
  "fuentes": [ { "org": "RHS", "titulo": "...", "url": "...", "fecha_consulta": "2026-11-14", "que_se_tomo": "resumen de 1 línea", "usado_en": ["potus", "riego-1"] } ],
  "revisar": [ { "id": "zamioculca", "dato": "toxicidad_gato", "motivo": "ASPCA no la lista; ...", "fuentes": ["url"] } ],
  "no_pude_abrir": [ "url o sitio que bloqueó el acceso" ]
}
```
"revisar" = todo dato con confianza baja, no verificado o con fuentes en conflicto.

En tu respuesta final: un resumen corto (qué quedó sólido, qué quedó flojo, qué sitios no pudiste abrir). Sé honesto: prefiero "no lo pude verificar" a un dato inventado.

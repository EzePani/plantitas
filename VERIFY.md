# Para revisar a mano

Generado con `node scripts/generar-fuentes.mjs`. No editar a mano: se pisa.

Acá está todo lo que quedó con confianza baja, sin verificar o con fuentes en conflicto (253 puntos en 53 ítems). Mientras no se revise, la app aplica el criterio más conservador.

## aloe-vera

- [ ] **humedad**: Una sola fuente (RHS Urban Show) habla de humedad; NC State y Penn State no la mencionan. Confianza baja, y por eso la confianza general de la planta queda en baja.
  - https://www.rhs.org.uk/shows-events/rhs-urban-show/houseplant-profiles/houseplants-for-sunlight
- [ ] **luz.sol_directo**: NC State y Penn State dicen sol pleno a parcial; RHS dice luz brillante indirecta lejos del sol directo fuerte. Se dejó true con advertencia.
  - https://plants.ces.ncsu.edu/plants/aloe-vera/
  - https://extension.psu.edu/aloe-a-hardy-houseplant
  - https://www.rhs.org.uk/shows-events/rhs-urban-show/houseplant-profiles/houseplants-for-sunlight
- [ ] **apta.balcon**: Criterio propio: NC State da zonas 10a-12b y Penn State dice que no tolera heladas; se marcó apta con resguardo en noches frías.
  - https://plants.ces.ncsu.edu/plants/aloe-vera/
  - https://extension.psu.edu/aloe-a-hardy-houseplant
- [ ] **horas_sol_directo / tolera_sol_tarde**: Fuentes en conflicto (NC State y Penn State: sol pleno a parcial; RHS Urban Show: sin sol directo fuerte; UC MG Sonoma: protegida del sol intenso). Se bajó de 6 h con sol de tarde a 3 h sin sol de tarde. Ninguna fuente da horas exactas para la especie.
  - https://plants.ces.ncsu.edu/plants/aloe-vera/
  - https://extension.psu.edu/aloe-a-hardy-houseplant
  - https://www.rhs.org.uk/shows-events/rhs-urban-show/houseplant-profiles/houseplants-for-sunlight
  - https://ucanr.edu/site/mg-sonoma/succulents
- [ ] **luz.detalle**: El texto de la ficha habla de 'ventana bien soleada'; coincide, pero convendría sumar que en balcón va con sol de mañana y sombra a la tarde.
  - https://www.rhs.org.uk/shows-events/rhs-urban-show/houseplant-profiles/houseplants-for-sunlight
- [ ] **humedad**: Confianza baja.
- [ ] **fuentes en conflicto**: Luz: NC State y Penn State hablan de sol pleno a parcial; RHS recomienda luz brillante indirecta, lejos del sol directo fuerte. Se dejó sol_directo en true pero con la aclaración de correrla si el sol de verano es muy intenso.
- [ ] **fuentes en conflicto**: Familia: ASPCA la lista como Liliaceae; NC State como Asphodelaceae. Se usó Asphodelaceae.
- [ ] **fuentes en conflicto**: Humedad: solo RHS la menciona (humedad normal de casa, sin rociar); NC State y Penn State no dicen nada.
- [ ] **fuentes en conflicto**: Sol: NC State y Penn State hablan de sol pleno a parcial y la guía de RHS del género pide plena luz; en cambio la guía de RHS para casa pide evitar el sol directo fuerte (pone marrones las hojas) y los Master Gardeners de la Univ. de California recomiendan protegerla del sol intenso. Se tomó el criterio más cuidadoso: unas 3 horas de sol suave, de mañana, y sombra a la tarde.

## anturio

- [ ] **toxicidad_gato / toxicidad_perro**: La ficha de ASPCA abierta ('Flamingo Flower') es de Anthurium scherzeranum, no de A. andraeanum. La especie exacta solo está respaldada por NC State; Pet Poison Helpline cubre el género. Confianza media.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/flamingo-flower
  - https://plants.ces.ncsu.edu/plants/anthurium-andraeanum/
  - https://www.petpoisonhelpline.com/poison/anthurium/
- [ ] **gravedad**: NC State dice severidad baja; se puso 'moderada' por criterio conservador (mismos síntomas por oxalatos que el espatifilo). Revisar si se prefiere 'leve'.
  - https://plants.ces.ncsu.edu/plants/anthurium-andraeanum/
- [ ] **sensibilidad_calor**: Solo RHS menciona calor (lejos de radiadores, rango hasta 30 °C); 'media'.
  - https://www.rhs.org.uk/plants/anthuriums/how-to-grow-anthuriums
- [ ] **fuentes en conflicto**: Toxicidad: la ficha de ASPCA para 'flamingo flower' corresponde a Anthurium scherzeranum, no a A. andraeanum. La especie exacta está respaldada por NC State (problema para perros y gatos) y el género por Pet Poison Helpline.
- [ ] **fuentes en conflicto**: Gravedad: NC State la clasifica como severidad baja, pero describe los mismos síntomas que ASPCA da para el espatifilo (que NC State clasifica como media). Se tomó 'moderada' por criterio conservador.
- [ ] **fuentes en conflicto**: Riego de invierno: ni RHS ni NC State dan una pauta distinta para el invierno; se mantuvo la misma regla.

## basico-1

- [ ] **calefacción que seca el aire en Buenos Aires**: Sin fuente argentina. Se quitó del borrador la frase 'aunque afuera esté húmedo' porque no se verificó el dato de humedad de Buenos Aires (las páginas del SMN sobre el clima de la ciudad devolvieron error 402).
  - https://www.rhs.org.uk/plants/types/houseplants/winter-interest-houseplants-care
- [ ] **calefacción que seca el aire en Buenos Aires**: Sin cambios desde la pasada anterior: sigue sin fuente argentina (solo RHS para el efecto de la calefacción y SMN para los meses).
  - https://www.rhs.org.uk/plants/types/houseplants/winter-interest-houseplants-care

## basico-2

- [ ] **que una hoja vieja se seque es normal**: Una sola fuente institucional (RHS).
  - https://www.rhs.org.uk/plants/types/houseplants/how-to-help-a-poorly-houseplant
- [ ] **las raíces podridas pueden tener mal olor**: Una sola fuente institucional lo dice (Wisconsin PDDC: 'may have a bad odor'). Iowa State, UC IPM, Clemson y RHS describen color y textura pero no olor. Redactado como 'pueden tener mal olor'.
  - https://pddc.wisc.edu/?p=24941
- [ ] **cuánto más grande tiene que ser la maceta nueva**: Las fuentes no coinciden en la medida: NC State 2,5 a 5 cm más ancha (macetas chicas), RHS 5 a 10 cm, Penn State y BBG 'apenas más grande'. Se eligió el criterio conservador y no se puso número ('apenas más grande').
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers
  - https://www.rhs.org.uk/plants/types/houseplants/growing-guide
- [ ] **maceta demasiado grande favorece la pudrición**: Lo dicen Iowa State (maceta muy grande como causa de tierra siempre mojada) y BBG (jardín botánico). Penn State solo da un motivo estético y NC State no lo trata. Redactado como 'se pueden pudrir'.
  - https://yardandgarden.extension.iastate.edu/how-to/diagnosing-houseplant-problems-improper-environmental-conditions
  - https://www.bbg.org/article/when_why_and_how_to_repot_your_houseplants
- [ ] **bulbos, rizomas y tubérculos presentados dentro de la lección de raíces**: El plan los pedía como 'tipos de raíz', pero NC State y Oregon State coinciden en que son tallos subterráneos, no raíces. La tarjeta y el quiz lo aclaran. El ejemplo de la zamioculca tiene una sola fuente (NC State Plant Toolbox).
  - https://content.ces.ncsu.edu/extension-gardener-handbook/3-botany
  - https://extension.oregonstate.edu/gardening/techniques/vegetative-plant-parts

## basico-3

- [ ] **unas cien veces más luz afuera**: Sale de Clemson (<100 vs >10.000 ft-c) y la tabla de NC State (oficina ~50, pleno sol ~10.000). Es un orden de magnitud para un día de sol pleno; junto a una ventana luminosa la diferencia es menor. Redactado como 'puede haber unas cien veces'.
  - https://hgic.clemson.edu/factsheet/indoor-plants-cleaning-fertilizing-containers-light-requirements/
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers
- [ ] **hojas enruladas = sed o calor**: Fuentes con matices: Clemson dice falta de agua crónica, RHS dice hojas que se enrollan por calor, UC IPM solo menciona plagas chupadoras. La tarjeta nombra las tres; el quiz 'unir' usa 'Sed o calor' como causa más común. Por esto la lección queda en confianza media.
  - https://hgic.clemson.edu/factsheet/houseplant-diseases-disorders/
  - https://www.rhs.org.uk/plants/types/houseplants/how-to-help-a-poorly-houseplant
  - https://ipm.ucanr.edu/home-and-landscape/houseplant-problems/
- [ ] **brotes nuevos y tallos erguidos como señal de planta sana**: No hay una fuente que lo liste así. Se apoya de forma indirecta: RHS pide plantas 'robustas' y sin decoloración; RHS, NC State y Penn State tratan el crecimiento frenado en época de crecimiento como señal de problema.
  - https://www.rhs.org.uk/plants/types/houseplants/growing-guide
- [ ] **que una hoja vieja se seque es normal**: Arrastrado de la pasada anterior con una sola fuente (RHS). Iowa State ahora lo respalda: lista el envejecimiento normal entre las causas de amarilleo y caída.
  - https://www.rhs.org.uk/plants/types/houseplants/how-to-help-a-poorly-houseplant
  - https://yardandgarden.extension.iastate.edu/how-to/diagnosing-houseplant-problems-improper-environmental-conditions

## begonia

- [ ] **especie representativa y sustrato**: Se tomó Begonia rex; B. maculata (begonia de caña) no se investigó y su cuidado puede diferir. El sustrato sale casi solo de NC State (confianza media).
  - https://plants.ces.ncsu.edu/plants/begonia-rex-types/
  - https://www.rhs.org.uk/plants/begonias/houseplants
- [ ] **sensibilidad_calor**: 'alta' con una sola fuente (RHS: bordes marrones por temperatura demasiado alta). NC State solo menciona un cultivar tolerante al calor.
  - https://www.rhs.org.uk/plants/begonias/houseplants
  - https://plants.ces.ncsu.edu/plants/begonia-rex-types/
- [ ] **fuentes en conflicto**: Se tomó Begonia rex (grupo Rex-cultorum) como la begonia de interior del catálogo; no se investigó B. maculata por separado. La ficha de ASPCA cubre todo el género (Begonia spp.).
- [ ] **fuentes en conflicto**: Tipo de oxalato: ASPCA dice oxalatos de calcio solubles; NC State dice solo 'oxalato de calcio'.
- [ ] **fuentes en conflicto**: Sustrato: la sección de RHS sobre begonias rex no nombra una mezcla; el dato sale de NC State y de la indicación general de RHS de mantener el compost húmedo pero bien drenado.
- [ ] **fuentes en conflicto**: ASPCA y NC State mencionan falla renal solo en animales de pastoreo, no en perros ni gatos; por eso no se puso advertencia grave.
- [ ] **fuentes en conflicto**: NC State la ubica en sol tamizado o media sombra (categoría que admite algunas horas de sol); RHS pide protegerla del sol directo y tenerla a la sombra en verano. Tomamos cero horas de sol directo.

## bulbos

- [ ] **gravedad**: Matices entre fuentes: Merck dice que la mayoría de las exposiciones a narciso son leves y se resuelven solas; Pet Poison Helpline habla de vómitos intensos, deshidratación y shock; ASPCA de convulsiones y arritmias en ingestas grandes. El tulipán es más leve. Se marcó 'consulta_urgente' (no 'grave') y confianza media.
  - https://www.merckvetmanual.com/toxicology/poisonous-plants/houseplants-and-ornamentals-toxic-to-animals
  - https://www.petpoisonhelpline.com/poison/daffodil/
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/daffodil

## cactus-de-navidad

- [ ] **humedad**: Una sola fuente (NC State) indica humedad alta; Clemson no trata la humedad. Confianza baja, y por eso la confianza general queda en baja.
  - https://plants.ces.ncsu.edu/plants/schlumbergera-x-buckleyi/
- [ ] **riego**: NC State y Clemson difieren en cuándo regar más o menos alrededor de la formación de pimpollos. Confianza media.
  - https://plants.ces.ncsu.edu/plants/schlumbergera-x-buckleyi/
  - https://hgic.clemson.edu/factsheet/thanksgiving-christmas-cacti/
- [ ] **toxicidad (especie)**: ASPCA lista "Christmas Cactus" como Schlumbergera bridgesii; NC State confirma S. x buckleyi. No se abrió ninguna ficha de toxicidad específica de S. truncata (cactus de Acción de Gracias, que suele venderse con el mismo nombre).
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/christmas-cactus
  - https://plants.ces.ncsu.edu/plants/schlumbergera-x-buckleyi/
- [ ] **floración en Buenos Aires**: Los meses (junio-agosto, inducción desde mediados de marzo) son una conversión propia desde fuentes del hemisferio norte; no hay fuente argentina que lo confirme.
  - https://plants.ces.ncsu.edu/plants/schlumbergera-x-buckleyi/
  - https://hgic.clemson.edu/factsheet/thanksgiving-christmas-cacti/
- [ ] **otros_nombres**: "Santa Teresita" y "Zygocactus" están puestos de memoria; no verificados en fuente abierta.
- [ ] **horas_sol_directo**: Las 2 h valen solo para sol suave de otoño-invierno (Clemson); en verano corresponde 0. El campo no distingue estación.
  - https://hgic.clemson.edu/factsheet/thanksgiving-christmas-cacti/
  - https://plants.ces.ncsu.edu/plants/schlumbergera-x-buckleyi/
- [ ] **humedad**: Confianza baja.
- [ ] **fuentes en conflicto**: Riego: NC State pide tierra húmeda (ni empapada ni seca) en primavera-verano y reducir cuando se forman los pimpollos; Clemson pide regar cuando el sustrato está seco al tacto en primavera-verano y mantenerlo parejo y húmedo una vez formados los pimpollos. Se tomó el criterio más conservador contra el exceso de agua en verano y el de Clemson para la etapa de pimpollos.
- [ ] **fuentes en conflicto**: Oscuridad necesaria para florecer: NC State dice al menos 13 horas; Clemson, 14 o más durante 6 semanas.
- [ ] **fuentes en conflicto**: Nombre en ASPCA: la ficha "Christmas Cactus" usa Schlumbergera bridgesii; la confirmación para S. x buckleyi viene de NC State. No se abrió una ficha específica de S. truncata.
- [ ] **fuentes en conflicto**: Humedad: solo NC State la menciona; Clemson no trata la humedad ambiente.
- [ ] **fuentes en conflicto**: Sol: Clemson dice que el sol pleno le hace bien en otoño e invierno; NC State solo advierte que el sol pleno decolora los tallos. Se dejó un rato de sol suave, solo en los meses frescos.

## calatea

- [ ] **fuentes en conflicto**: Se tomó Goeppertia makoyana como especie de referencia. La guía de RHS cubre las 'calateas' en general (Goeppertia, Ctenanthe, Stromanthe) y la ficha de ASPCA es de Calathea spp.
- [ ] **fuentes en conflicto**: Luz: los atributos de NC State listan 'sombra parcial (2-6 h de sol directo)', pero su texto y RHS piden luz indirecta sin sol directo. Se tomó el criterio sin sol directo.

## cinta

- [ ] **toxicidad**: Ficha ASPCA y NC State: no tóxica. Artículo ASPCA 2019: 'levemente tóxica' (malestar digestivo leve). Se dejó 'segura' con confianza media; decidir si se prefiere marcarla distinto.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/spider-plant
  - https://plants.ces.ncsu.edu/plants/chlorophytum-comosum/
  - https://www.aspca.org/news/houseplant-safe-your-pets
  - https://hgic.clemson.edu/exciting-houseplant-selections-for-beginners/
- [ ] **apta.balcon**: true basado en mínimo de 7 °C y zonas 9a-11b de NC State; juicio propio para Buenos Aires, sin fuente local.
  - https://plants.ces.ncsu.edu/plants/chlorophytum-comosum/
- [ ] **atractivo_para_mascotas**: El único respaldo es una página de Clemson Extension (no veterinaria) que menciona reacción leve tipo hierba gatera en algunos gatos.
  - https://hgic.clemson.edu/exciting-houseplant-selections-for-beginners/
- [ ] **fuentes en conflicto**: Toxicidad: la ficha de ASPCA y NC State la dan como no tóxica para gatos y perros, pero un artículo de ASPCA de 2019 la menciona como 'levemente tóxica' (vómitos y diarrea leves tras ingerirla) y Clemson aclara que comer mucha puede causar vómitos o diarrea. Se mantuvo 'segura' por la ficha oficial, con confianza media y aviso en la nota.
- [ ] **fuentes en conflicto**: Riego: NC State dice que crece mejor con tierra húmeda; Wisconsin y Clemson recomiendan dejar secar un poco entre riegos. Se usó esta última regla, más segura contra la pudrición.

## cinta, potus, zamioculca, peperomia, filodendro

- [ ] **sensibilidad_calor**: Ninguna fuente abierta advierte daño por calor ni las describe como resistentes: 'media' por defecto, sin respaldo directo. Por eso confianza_sol quedó en 'media' aunque horas y sol de tarde están bien respaldados.

## dieffenbachia

- [ ] **inclusión en peligrosas.json**: NO incluida. Las fuentes la describen como irritante de boca, con hinchazón de garganta rara, muerte infrecuente y pronóstico bueno (mismo mecanismo que potus, monstera y espatifilo). No la marcan como grave.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/dieffenbachia
  - https://www.petpoisonhelpline.com/poison/dieffenbachia/
  - https://www.merckvetmanual.com/toxicology/poisonous-plants/houseplants-and-ornamentals-toxic-to-animals

## echeveria

- [ ] **humedad**: No verificado: ninguna fuente abierta (NC State, RHS especie, RHS género, UF/IFAS) habla de humedad ambiente. El nivel "baja" es un valor provisorio exigido por el esquema.
  - https://plants.ces.ncsu.edu/plants/echeveria-elegans/
  - https://www.rhs.org.uk/plants/6226/i-echeveria-elegans-i/details
  - https://www.rhs.org.uk/plants/echeveria
  - https://gardeningsolutions.ifas.ufl.edu/plants/ornamentals/echeveria/
- [ ] **luz**: Fuentes en conflicto: sol pleno (RHS especie, NC State, UF/IFAS) vs luz brillante indirecta (guía RHS del género).
  - https://www.rhs.org.uk/plants/6226/i-echeveria-elegans-i/details
  - https://www.rhs.org.uk/plants/echeveria
  - https://plants.ces.ncsu.edu/plants/echeveria-elegans/
  - https://gardeningsolutions.ifas.ufl.edu/plants/ornamentals/echeveria/
- [ ] **toxicidad_gato / toxicidad_perro**: ASPCA lista "Mexican Snowballs" con nombre científico solo de género ("Echevaria") y la nota de suculentas dice "echeveria sp."; la única confirmación a nivel especie (E. elegans) es la etiqueta de NC State. Confianza media.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/mexican-snowballs
  - https://www.aspca.org/news/are-succulents-safe-have-around-pets
  - https://plants.ces.ncsu.edu/plants/echeveria-elegans/
- [ ] **otros_nombres**: "Rosa de alabastro" está puesto de memoria como nombre usado en español; no fue verificado en una fuente abierta.
- [ ] **horas_sol_directo / tolera_sol_tarde**: Fuentes en conflicto (RHS ficha, UF/IFAS, NC State: sol pleno; RHS género: luz indirecta; UC MG Sonoma: E. elegans pide media sombra y se quema). Se dejó 3 h sin sol de tarde. Revisar también luz.detalle de la ficha ('disfruta del sol directo'), que queda más optimista que este criterio.
  - https://plants.ces.ncsu.edu/plants/echeveria-elegans/
  - https://www.rhs.org.uk/plants/6226/i-echeveria-elegans-i/details
  - https://www.rhs.org.uk/plants/echeveria
  - https://gardeningsolutions.ifas.ufl.edu/plants/ornamentals/echeveria/
  - https://ucanr.edu/site/mg-sonoma/succulents
- [ ] **humedad**: Confianza baja.
- [ ] **fuentes en conflicto**: Luz: la ficha de RHS de E. elegans, NC State y UF/IFAS indican sol pleno; la guía de RHS del género recomienda luz brillante indirecta. Se eligió "mucha" con sol directo y confianza media.
- [ ] **fuentes en conflicto**: Riego de invierno: la ficha de RHS de la especie dice no regar en reposo; la guía de RHS del género dice un riego liviano cada varias semanas. Se tomó el riego mínimo.
- [ ] **fuentes en conflicto**: Toxicidad: la ficha de ASPCA "Mexican Snowballs" da el nombre científico solo a nivel género (escrito "Echevaria"); la confirmación a nivel especie viene de NC State.
- [ ] **fuentes en conflicto**: Sol: la ficha de RHS de la especie y UF/IFAS indican sol pleno y NC State sol pleno a media sombra; la guía de RHS del género pide luz brillante indirecta y los Master Gardeners de la Univ. de California dicen que Echeveria elegans pide media sombra y que el sol fuerte le marca las hojas. Se tomó el criterio más cuidadoso: unas 3 horas de sol suave y nada de sol de tarde.
- [ ] **fuentes en conflicto**: Calor: NC State la lista como resistente al calor y UF/IFAS dice que prospera con el calor del verano; la Univ. de California avisa que el sol caliente de verano quema las hojas. Se dejó sensibilidad media.

## espatifilo

- [ ] **gravedad**: NC State: severidad media; FDA: suele resolverse solo. Se dejó 'moderada'.
  - https://plants.ces.ncsu.edu/plants/spathiphyllum/
  - https://www.fda.gov/animal-veterinary/animal-health-literacy/lovely-lilies-and-curious-cats-dangerous-combination
- [ ] **humedad**: Solo RHS da un nivel ('moderada'); NC State apenas menciona puntas marrones por aire seco. Confianza media.
  - https://www.rhs.org.uk/plants/peace-lilies/how-to-grow-peace-lilies
  - https://plants.ces.ncsu.edu/plants/spathiphyllum/
- [ ] **sensibilidad_calor**: 'alta' por la regla (Clemson y RHS advierten daño por aire caliente/sol), aunque la planta prefiere ambiente cálido de 20 a 29 °C. Conviene que el texto de la ficha aclare que el problema es el calor directo.
  - https://hgic.clemson.edu/factsheet/peace-lily/
  - https://www.rhs.org.uk/plants/peace-lilies/how-to-grow-peace-lilies
- [ ] **fuentes en conflicto**: Humedad: RHS dice que prefiere humedad moderada; NC State no la pide como requisito y solo menciona que el aire seco puede dar puntas marrones. Se tomó 'media'.
- [ ] **fuentes en conflicto**: Gravedad: NC State la clasifica como severidad media; la FDA dice que los síntomas suelen resolverse solos. Se tomó 'moderada' (criterio más conservador).
- [ ] **fuentes en conflicto**: Partes tóxicas: NC State nombra las hojas; ASPCA y FDA hablan de la planta en general.
- [ ] **fuentes en conflicto**: Le gusta el ambiente cálido (NC State y Clemson: 20 a 29 °C), pero Clemson y RHS advierten que el sol directo y el aire caliente de la calefacción la dañan. Por eso figura como sensible al calor directo, no al ambiente templado.

## ficus-lyrata

- [ ] **toxicidad**: Sin ficha de especie en la lista de ASPCA (la ficha 'Fiddle-Leaf' es Philodendron bipennifolium). Respaldo: artículo ASPCA 2019 (levemente tóxica), NC State, Pet Poison Helpline (género). Las fuentes difieren en el principio tóxico.
  - https://www.aspca.org/news/houseplant-safe-your-pets
  - https://plants.ces.ncsu.edu/plants/ficus-lyrata/
  - https://www.petpoisonhelpline.com/poison/ficus/
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/fiddle-leaf
- [ ] **riego / humedad**: Fuentes institucionales con matices (tierra húmeda vs dejar secar arriba); sin pauta estacional clara. La segunda fuente (Penn State) es un artículo de Master Gardeners, no una ficha técnica.
  - https://plants.ces.ncsu.edu/plants/ficus-lyrata/
  - https://extension.psu.edu/programs/master-gardener/counties/adams/news/fiddle-leaf-fig-ficus-lyrata
  - https://www.rhs.org.uk/plants/ornamental-figs
- [ ] **horas_sol_directo**: NC State admite media sombra (2-6 h) con protección del sol de tarde; RHS (guía general) y Penn State dicen sin sol directo. Se dejó 0 por criterio conservador; podría subirse a 2 (sol de mañana) si se prioriza la fuente específica de la especie.
  - https://plants.ces.ncsu.edu/plants/ficus-lyrata/
  - https://www.rhs.org.uk/plants/ornamental-figs
  - https://extension.psu.edu/programs/master-gardener/counties/adams/news/fiddle-leaf-fig-ficus-lyrata
- [ ] **luz_tolerada**: Illinois Extension lista Ficus lyrata, Ficus elastica, Anthurium, Begonia y Dracaena con luz mínima 'medium'. No se tocó luz_tolerada de ficus-lyrata, anturio ni begonia (hoy vacía) por ser una sola tabla genérica; evaluar si corresponde agregar indirecta_media.
  - https://extension.illinois.edu/houseplants/lighting
- [ ] **fuentes en conflicto**: Toxicidad: ASPCA no tiene ficha propia de Ficus lyrata en su lista (la ficha 'Fiddle-Leaf' es un filodendro, Philodendron bipennifolium). La cubren un artículo de ASPCA de 2019 (levemente tóxica para perros y gatos), NC State y la ficha del género Ficus de Pet Poison Helpline. Confianza media.
- [ ] **fuentes en conflicto**: Principio tóxico: NC State lo atribuye a oxalatos de calcio insolubles; Pet Poison Helpline y ASPCA hablan de savia irritante.
- [ ] **fuentes en conflicto**: Riego: NC State pide tierra húmeda sin encharcar; Penn State y RHS, regar cuando se secan los primeros centímetros. Las fuentes no dan una pauta estacional clara (Penn State dice que no entra en reposo en invierno).
- [ ] **fuentes en conflicto**: NC State la clasifica como de media sombra (2 a 6 h de sol) siempre que esté protegida del sol de la tarde; RHS y Penn State dicen que no reciba sol directo. Tomamos el criterio más cuidadoso: sin sol directo. Un rato de sol suave de mañana probablemente lo tolere si se acostumbra de a poco.

## filodendro

- [ ] **mascotas.gravedad / advertencia_grave**: NC State: severidad baja. Pet Poison Helpline: en casos raros, hinchazón de garganta con dificultad para respirar. Se puso "moderada" y advertencia_grave null; decidir si ese caso raro amerita advertencia.
  - https://plants.ces.ncsu.edu/plants/philodendron-hederaceum/
  - https://www.petpoisonhelpline.com/poison/philodendron/
- [ ] **sustrato**: Solo Clemson detalla el sustrato (tierra de uso general, drenaje rápido); NC State solo dice buen drenaje y húmedo. Confianza media.
  - https://hgic.clemson.edu/factsheet/philodendron/
  - https://plants.ces.ncsu.edu/plants/philodendron-hederaceum/
- [ ] **horas_sol_directo / luz_requerida**: Ninguna fuente abierta dice explícitamente que el sol directo queme; el 0 se deduce de 'indirect or curtain-filtered'. Se propone corregir luz_requerida a indirecta_media (NC State: prefiere luz media).
  - https://plants.ces.ncsu.edu/plants/philodendron-hederaceum/
  - https://hgic.clemson.edu/factsheet/philodendron/
- [ ] **fuentes en conflicto**: Humedad: NC State dice que prefiere humedad media y tolera aire seco; Clemson dice que la humedad alta es ideal pero tolera la baja de las casas. Se eligió "media".
- [ ] **fuentes en conflicto**: Gravedad: NC State clasifica la toxicidad como baja; Pet Poison Helpline menciona casos raros de hinchazón de garganta con dificultad para respirar. Se eligió "moderada" por ser el criterio más conservador; no se cargó advertencia_grave porque las fuentes no describen riesgo de vida habitual.
- [ ] **fuentes en conflicto**: Nombre: Clemson trata al filodendro hoja de corazón como Philodendron scandens; ASPCA y NC State usan Philodendron hederaceum para la misma planta de nombre común.
- [ ] **fuentes en conflicto**: Tamaño: NC State da de 10 cm a 1,8 m de alto y tallos de más de 1,2 m; depende de cuánto se la pode.

## gomero

- [ ] **toxicidad**: No encontré ficha de Ficus elastica en ASPCA (la 'Indian Rubber Plant' es F. benjamina). Pet Poison Helpline cubre la especie sin separar gato/perro; NC State la marca para ambos sin detallar síntomas.
  - https://www.petpoisonhelpline.com/poison/rubber-tree-plant/
  - https://plants.ces.ncsu.edu/plants/ficus-elastica/
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/indian-rubber-plant
- [ ] **apta.balcon**: NC State da zona USDA 9a (sugiere algo de tolerancia al frío) pero también dice que sufre bajo 13 °C. Se puso false por criterio conservador; no verifiqué con fuente argentina cómo se comporta al aire libre en Buenos Aires.
  - https://plants.ces.ncsu.edu/plants/ficus-elastica/
  - https://hgic.clemson.edu/factsheet/rubber-plant/
- [ ] **horas_sol_directo**: Se dejó 2 (sol de mañana) con Clemson y NC State; la guía general de RHS para ficus dice fuera del sol directo. Con la regla conservadora estricta sería 0.
  - https://hgic.clemson.edu/factsheet/rubber-plant/
  - https://plants.ces.ncsu.edu/plants/ficus-elastica/
  - https://www.rhs.org.uk/plants/ornamental-figs
- [ ] **fuentes en conflicto**: Toxicidad: no encontré ficha de Ficus elastica en ASPCA (la ficha 'Indian Rubber Plant' corresponde a Ficus benjamina). Pet Poison Helpline tiene ficha de la especie pero habla de 'animales' sin separar gato y perro; NC State la marca como problema para gatos y perros. Confianza media.
- [ ] **fuentes en conflicto**: Balcón: NC State la da como rústica desde zona USDA 9a, pero la misma ficha y Clemson dicen que sufre por debajo de 13 °C. Se eligió el criterio conservador (no apta todo el año).
- [ ] **fuentes en conflicto**: Clemson dice que crece mejor con la luz de la mañana de una ventana al este y NC State acepta media sombra con protección del sol de la tarde; la guía general de RHS para ficus dice 'fuera del sol directo'. Dejamos solo sol suave de mañana.

## haworthia

- [ ] **toxicidad_gato / toxicidad_perro**: ASPCA no lista Haworthiopsis/Haworthia attenuata: su ficha "Zebra Haworthia" es de Haworthia fasciata. No se extendió esa ficha; el dato "segura" para la especie se apoya solo en NC State. Confianza media.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/zebra-haworthia
  - https://plants.ces.ncsu.edu/plants/haworthiopsis-attenuata/
- [ ] **luz**: RHS la marca "full sun" con sombra del sol fuerte; NC State la marca media sombra y dice que el sol directo quema. Confianza media.
  - https://www.rhs.org.uk/plants/504241/haworthiopsis-attenuata/details
  - https://plants.ces.ncsu.edu/plants/haworthiopsis-attenuata/
- [ ] **apta.balcon**: RHS da mínima de 1 a 5 °C; NC State pide mantenerla arriba de 10 °C. Se marcó apta con resguardo; revisar si se prefiere false.
  - https://www.rhs.org.uk/plants/504241/haworthiopsis-attenuata/details
  - https://plants.ces.ncsu.edu/plants/haworthiopsis-attenuata/
- [ ] **horas_sol_directo**: NC State: el sol directo quema (-> 0). Wisconsin (género) y RHS ficha aceptan unas horas de sol suave. Se dejó 0 por regla conservadora; 2 h de sol de mañana sería defendible. Wisconsin y UC no nombran H. attenuata (hablan del género).
  - https://plants.ces.ncsu.edu/plants/haworthiopsis-attenuata/
  - https://www.rhs.org.uk/plants/504241/haworthiopsis-attenuata/details
  - https://hort.extension.wisc.edu/articles/haworthias-super-succulents-for-small-spaces/
- [ ] **sensibilidad_calor**: 'alta' por avisos de RHS (sol caliente) y UC (calor fuerte), pero Wisconsin dice que aguantan hasta unos 38 °C con algo de sombra. Matices.
  - https://www.rhs.org.uk/plants/504241/haworthiopsis-attenuata/details
  - https://ucanr.edu/site/mg-sonoma/succulents
  - https://hort.extension.wisc.edu/articles/haworthias-super-succulents-for-small-spaces/
- [ ] **fuentes en conflicto**: Luz: RHS la clasifica como "full sun" pero aclara protegerla del sol fuerte; NC State indica media sombra / luz brillante indirecta y que el sol directo quema. Se eligió "media" sin sol directo.
- [ ] **fuentes en conflicto**: Temperatura mínima: RHS da rusticidad H2 (1 a 5 °C); NC State recomienda mantenerla arriba de 10 °C. Para el balcón se tomó el criterio más conservador.
- [ ] **fuentes en conflicto**: Toxicidad: ASPCA lista "Zebra Haworthia" como Haworthia fasciata, que no es el nombre de esta especie; la confirmación para Haworthiopsis attenuata viene solo de NC State.
- [ ] **fuentes en conflicto**: Sol: NC State dice que el sol directo puede quemar las hojas y la guía de RHS del género pide luz brillante indirecta; la ficha de RHS de la especie la da para plena luz protegida del sol caliente, y Wisconsin (género) acepta unas horas de sol directo en ventana este u oeste. Se dejó sin sol directo por ser lo más cuidadoso; un rato de sol suave de mañana está respaldado por dos fuentes.
- [ ] **fuentes en conflicto**: Calor: Wisconsin dice que aguantan calor fuerte si tienen algo de sombra y aire; RHS y la Univ. de California piden protegerlas del sol caliente y del calor fuerte. Se eligió sensibilidad alta.

## helecho-serrucho

- [ ] **familia**: NC State dice Polypodiaceae, ASPCA Dryopteridaceae; POWO (Kew) devolvió 403 y no pude confirmar la familia vigente.
  - https://plants.ces.ncsu.edu/plants/nephrolepis-exaltata/
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/boston-fern
- [ ] **toxicidad_gato / toxicidad_perro**: ASPCA solo tiene ficha del helecho de Boston (Nephrolepis exaltata bostoniensis), no tóxico. No pude confirmar qué especie exacta usa el catálogo para 'helecho serrucho' (la carpeta src/data/plantas todavía no tiene fichas), así que no lo usé en el quiz.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/boston-fern
- [ ] **luz_tolerada**: Se agregó indirecta_media (Clemson 'moderate, indirect light', Wisconsin 'medium bright light'). Illinois lo lista con mínimo 'low' y Clemson dice que los helechos crecen con poca luz en general, pero NC State solo lo dice del cultivar 'Dallas': no se agregó 'baja'.
  - https://hgic.clemson.edu/factsheet/indoor-ferns/
  - https://hort.extension.wisc.edu/articles/boston-fern-nephrolepis-exaltata/
  - https://extension.illinois.edu/houseplants/lighting
  - https://plants.ces.ncsu.edu/plants/nephrolepis-exaltata/
- [ ] **sensibilidad_calor**: Clemson/NC State piden fresco (15-22 °C); Wisconsin acepta hasta 35 °C de día.
  - https://hgic.clemson.edu/factsheet/indoor-ferns/
  - https://hort.extension.wisc.edu/articles/boston-fern-nephrolepis-exaltata/
- [ ] **fuentes en conflicto**: Familia: NC State lo ubica en Polypodiaceae y ASPCA en Dryopteridaceae; no pude abrir Kew POWO para confirmar la clasificación actual.
- [ ] **fuentes en conflicto**: La ficha de ASPCA nombra la planta como 'Nephrolepis exalta bostoniensis' (la variedad Boston de esta especie).
- [ ] **fuentes en conflicto**: Mantenimiento: NC State lo califica de bajo mantenimiento, pero ambas fuentes exigen humedad alta y tierra siempre húmeda, por eso se lo marcó como difícil en interior con calefacción (juicio propio).
- [ ] **fuentes en conflicto**: Clemson y NC State la quieren en ambiente fresco (15 a 22 °C); Wisconsin dice que aguanta días de hasta 35 °C. Nos quedamos con el criterio más cuidadoso.
- [ ] **fuentes en conflicto**: Wisconsin acepta una ventana al este sin cortina; Clemson dice que el sol directo daña las frondas. Tomamos cero horas de sol directo.

## jade

- [ ] **mascotas.partes**: Ninguna fuente especifica partes tóxicas (ASPCA: principio desconocido). Queda null.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/jade-plant
  - https://www.petpoisonhelpline.com/poison/jade-plant/
- [ ] **toxicidad (nombre)**: La ficha de ASPCA usa Crassula argentea; la equivalencia con C. ovata sale de NC State ("previously Crassula argentea") y la nota de ASPCA sobre suculentas nombra a C. ovata.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/jade-plant
  - https://plants.ces.ncsu.edu/plants/crassula-ovata/
  - https://www.aspca.org/news/are-succulents-safe-have-around-pets
- [ ] **tolera_sol_tarde / sensibilidad_calor**: RHS ficha dice sol pleno con orientación oeste; NC State pide sombra a la tarde. Calor: NC State (fresco) vs Wisconsin (cálido y seco). Se eligió lo conservador.
  - https://plants.ces.ncsu.edu/plants/crassula-ovata/
  - https://www.rhs.org.uk/plants/4739/crassula-ovata/details
  - https://hort.extension.wisc.edu/articles/jade-plant-crassula-ovata/
- [ ] **fuentes en conflicto**: Luz: Wisconsin Extension y la ficha de RHS piden sol directo o pleno; la guía de RHS Urban Show habla de luz brillante indirecta y NC State sugiere algo de sombra a la tarde. Se eligió "mucha" con tolerancia a "media".
- [ ] **fuentes en conflicto**: Nombre: la ficha de ASPCA usa Crassula argentea; NC State indica que es el nombre anterior de Crassula ovata, y la nota de ASPCA sobre suculentas nombra directamente a Crassula ovata.
- [ ] **fuentes en conflicto**: Partes tóxicas: ninguna fuente abierta las especifica (ASPCA indica principio tóxico desconocido); se dejó en null.
- [ ] **fuentes en conflicto**: Sol de tarde: la ficha de RHS la da para sol pleno con orientación oeste; NC State pide algo de sombra a la tarde y, afuera, media sombra; la guía de RHS para casa avisa que la luz demasiado intensa quema. Se eligió sin sol de tarde.
- [ ] **fuentes en conflicto**: Calor: NC State dice que le convienen temperaturas de interior promedio a frescas; Wisconsin dice que le gustan los ambientes cálidos y secos y que tolera un rango amplio. Se dejó sensibilidad media.

## kalanchoe

- [ ] **inclusión en peligrosas.json**: NO incluida. ASPCA y Pet Poison Helpline dicen que lo habitual es malestar digestivo y que el ritmo cardíaco anormal es raro (riesgo mayor con cantidades grandes). Merck describe cuadros graves pero en conejos y ratas. Si se prefiere pecar de prudente, podría sumarse como 'consulta_urgente'.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/kalanchoe
  - https://www.petpoisonhelpline.com/poison/kalanchoe/
  - https://www.merckvetmanual.com/toxicology/poisonous-plants/houseplants-and-ornamentals-toxic-to-animals

## lengua-de-suegra

- [ ] **sustrato**: Solo NC State describe el sustrato; las otras dos fuentes no lo tratan.
  - https://plants.ces.ncsu.edu/plants/dracaena-trifasciata/
- [ ] **horas_sol_directo**: Clemson: evitar sol directo y caliente (-> 0). NC State (2-6 h) y RHS (sol o sombra liviana, sin sol de mediodía en verano) aceptan sol suave. Se dejó 0; 2 h sería defendible.
  - https://hgic.clemson.edu/exciting-houseplant-selections-for-beginners/
  - https://plants.ces.ncsu.edu/plants/dracaena-trifasciata/
  - https://www.rhs.org.uk/plants/sansevieria/growing-guide
- [ ] **fuentes en conflicto**: Luz: NC State la lista para media sombra con 2 a 6 horas de sol directo; Clemson recomienda evitar el sol directo fuerte. Se dejó sol_directo en false por ser lo más conservador.
- [ ] **fuentes en conflicto**: Frecuencia de riego invernal: NC State dice cada 1-2 meses; Clemson, cada 4-6 semanas.
- [ ] **fuentes en conflicto**: ASPCA la ubica en la familia Agavaceae; NC State en Asparagaceae (clasificación actual).
- [ ] **fuentes en conflicto**: Sol: NC State la lista para media sombra (2 a 6 horas de sol directo) y RHS dice que anda al sol o con sombra liviana, pero fuera del sol del mediodía en verano; Clemson pide evitar el sol directo y caliente porque quema. Se dejó sin sol directo por ser lo más cuidadoso; un rato de sol suave de mañana no debería hacerle mal.
- [ ] **fuentes en conflicto**: Calor: NC State la lista como resistente al calor; RHS recomienda 15 a 24 °C y lejos de radiadores. Se dejó sensibilidad media.

## lirios

- [ ] **perros**: ASPCA lista Lilium y Hemerocallis como no tóxicos para perros; FDA dice que pueden tener malestar digestivo leve sin falla renal. Por eso 'afecta' quedó solo en gato.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/lily
  - https://www.fda.gov/animal-veterinary/animal-health-literacy/lovely-lilies-and-curious-cats-dangerous-combination

## luz-1

- [ ] **definición de los cuatro tipos de luz**: Las fuentes no usan las mismas categorías ni los mismos umbrales (UF/IFAS: baja, media, alta, sol directo; NC State: baja, media, alta; ABC: directa, indirecta, poca). UF y UCANR aclaran que son generalizaciones. No se pusieron distancias ni números. Illinois Extension dice que algunas plantas hasta prosperan con poca luz, en tensión con 'se aguanta, no se disfruta'. Confianza media.
  - https://gardeningsolutions.ifas.ufl.edu/plants/houseplants/light-for-houseplants/
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers
- [ ] **prueba de la sombra de la mano**: Solo dos notas de la misma organización (ABC Gardening Australia). Es capa práctica, no un dato institucional independiente doble.
  - https://www.abc.net.au/news/2020-10-23/how-to-find-the-best-light-for-indoor-plants/12769762
  - https://www.abc.net.au/gardening/how-to/the-great-indoors-location-and-light/12804344
- [ ] **prueba de la sombra en cuatro niveles (bien marcada = directa; borrosa = indirecta brillante; apenas visible = indirecta media; casi sin sombra = baja)**: Los extremos están respaldados: RHS (la sombra luminosa no hace sombra bien definida, o sea que la sombra nítida es sol directo), ABC (sin sombra = luz baja; cuanto más nítida, más luz). El escalón intermedio 'apenas visible = indirecta media' es del Modelo de luz de la app y solo aparece en sitios comerciales que no se citaron; además esos sitios no coinciden entre sí (algunos llaman 'baja' a la sombra tenue). Iowa State describe la indirecta brillante como luz que hace una sombra clara, sin rayos sobre la planta: es compatible con 'se ve pero borrosa', pero no idéntico. Confianza media; se aclara en el quiz que es una guía práctica.
  - https://www.rhs.org.uk/plants/types/houseplants/growing-guide
  - https://www.abc.net.au/news/2020-10-23/how-to-find-the-best-light-for-indoor-plants/12769762
  - https://yardandgarden.extension.iastate.edu/how-to/how-care-houseplants
- [ ] **el balcón con luz directa y el living con indirecta**: Es un ejemplo ilustrativo del Modelo de luz, no un dato con fuente. Se redactó como 'puede tener'.

## luz-2

- [ ] **el sol del mediodía queda hacia el norte en Buenos Aires**: Ninguna fuente abierta lo dice con esas palabras para Buenos Aires. Se deduce de Museums Victoria (recorrido del sol a 38 grados sur), UNLP (mejor orientación = norte) y Level NZ. No se pudo abrir YourHome (gobierno australiano) ni BOM, que lo dicen de forma directa. Confianza media.
  - https://museumsvictoria.com.au/media/12658/seasons-activities.pdf
  - http://sedici.unlp.edu.ar/bitstream/handle/10915/150850/Documento_completo.pdf?sequence=1
- [ ] **ventana donde casi nunca da el sol = poca luz (orientación sur)**: Respaldo directo del hemisferio sur solo de Level NZ (poca o ninguna ganancia solar, menos luz); el resto es inversión de fuentes del norte (ventana norte = poco o nada de sol directo). En verano el sol sale y se pone algo hacia el sur, así que puede haber un rato de sol muy temprano o muy tarde.
  - https://www.level.org.nz/passive-design/location-orientation-and-layout/room-layout/
- [ ] **sol de mañana más suave que el de tarde**: UCANR (más fresco a la mañana, más intenso y caluroso a la tarde) y ABC Gardening Australia coinciden; las fuentes de arquitectura lo apoyan por el lado del calor. Es más una diferencia de calor acumulado que de cantidad de luz: se redactó como 'más suave y fresco'.
  - https://www.ucanr.edu/blog/over-fence-alameda-county/article/houseplants-ins-and-outs-light-and-water
  - https://www.abc.net.au/news/2020-10-23/how-to-find-the-best-light-for-indoor-plants/12769762
- [ ] **regla horario del sol -> orientación**: Es una deducción a partir de fuentes del hemisferio sur (Level NZ, ABC, Museums Victoria), no una regla que alguna fuente enuncie así. Edificios, árboles o medianeras pueden recortar el horario y confundir la lectura. En verano un espacio al sur puede recibir un rato de sol muy temprano o muy tarde; por eso se escribió 'casi nunca'. Siguen pendientes los 'revisar' de luz-2 de basico-luz-notas.json (sol del mediodía hacia el norte en Buenos Aires: deducido).
  - https://www.level.org.nz/passive-design/location-orientation-and-layout/room-layout/
  - https://museumsvictoria.com.au/media/12658/seasons-activities.pdf
- [ ] **espacio al sur = 'tu lugar de menos luz'**: Antes decía 'guardalo para las plantas que toleran poca luz'. Se cambió a 'plantas que se llevan bien sin sol directo' porque, según el Modelo de luz, pegado a una ventana sin sol puede haber luz indirecta brillante o media, no necesariamente baja.
  - https://www.level.org.nz/passive-design/location-orientation-and-layout/room-layout/

## luz-3

- [ ] **cambios de lugar en una o dos semanas**: Clemson dice 'gradual' sin plazo; el plazo de 1-2 semanas viene de ABC (plantas nuevas) y UCANR (al sacarlas afuera). NC State habla de 4 a 8 semanas para pasar de exterior a interior.
  - https://hgic.clemson.edu/factsheet/indoor-plants-cleaning-fertilizing-containers-light-requirements/
  - https://www.abc.net.au/news/2020-10-23/how-to-find-the-best-light-for-indoor-plants/12769762
- [ ] **por qué el sol de la tarde es más fuerte y caluroso**: El porqué se armó con dos piezas, cada una con poco respaldo directo: (1) el pico de temperatura es a media tarde por el retraso térmico (una sola fuente abierta: NOAA); (2) el sol de la tarde entra bajo y casi de frente al vidrio en fachadas oeste (UNLP y Level NZ). Ojo: NOAA dice que a esa hora la radiación UV ya bajó casi a la mitad, así que el sol de la tarde no trae más luz que el del mediodía: lo que suma es el calor. UCANR y ABC igual lo describen como 'más intenso' o 'más fuerte'; en las tarjetas se usó 'más fuerte y caluroso' y la explicación apunta al calor. No se encontró una fuente argentina (SMN) sobre la marcha diaria de la temperatura.
  - https://www.cpc.ncep.noaa.gov/products/stratosphere/uv_index/uv_diurnal.shtml
  - http://sedici.unlp.edu.ar/bitstream/handle/10915/150850/Documento_completo.pdf?sequence=1
- [ ] **el vidrio y el calor**: Respaldado: el sol quema a través del vidrio (RHS) y el sol directo por la ventana puede generar temperaturas que dañan las hojas (NC State); las ventanas al oeste se ponen muy calurosas en verano (Arkansas). NO se afirmó que el vidrio 'haga de lupa' ni que concentre los rayos: ninguna fuente institucional abierta lo dice. La distancia de 15 cm viene de una sola fuente (NC State) y protege del calor pegado al vidrio, no del sol directo.
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers
  - https://www.rhs.org.uk/plants/types/houseplants/growing-guide
- [ ] **balcón con sol de tarde en verano**: Sin fuente argentina ni del hemisferio sur. Sale de NC State (las macetas se calientan y secan más que el suelo; la exposición oeste es de las más cálidas) y Rutgers (las plantas de media sombra necesitan alivio del sol intenso de la tarde). Son fuentes sobre macetas de exterior en general, no sobre plantas de interior en balcones.
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers
  - https://extension.rutgers.edu/fs1215
- [ ] **calateas como ejemplo de planta que se quema**: RHS nombra helechos y calateas; UConn confirma helechos. Para calateas hay una sola fuente. Verificar si la calatea está en el catálogo de la app.
  - https://www.rhs.org.uk/plants/types/houseplants/houseplants-for-sunny-rooms

## luz-4

- [ ] **cambios de lugar en una o dos semanas**: Sin cambios respecto de la pasada anterior: Clemson dice 'gradual' sin plazo; el plazo viene de ABC y UCANR.
  - https://www.abc.net.au/news/2020-10-23/how-to-find-the-best-light-for-indoor-plants/12769762
- [ ] **qué pasa con las hojas ya quemadas**: No se incluyó: no se abrió ninguna fuente que diga si se recuperan o conviene cortarlas.

## macetas-1

- [ ] **mito de la capa de piedras en el fondo**: Fuentes en conflicto. Illinois, NC State, Clemson y Mississippi State dicen que la capa de piedras no mejora (o frena) el drenaje. Un estudio de 2025 en PLOS ONE (Rowe) midió que, en macetas con agujero, las capas de drenaje tendieron a reducir la retención de agua, sobre todo en mezclas sin suelo; no evaluó plantas. Criterio conservador aplicado: la lección solo afirma que las piedras NO REEMPLAZAN al agujero (cosa que ninguna fuente discute) y que varias universidades lo consideran un mito; no afirma que las piedras empeoren el drenaje. Por esto la lección quedó en confianza media.
  - https://extension.illinois.edu/container-gardens/container-drainage-options
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers
  - https://hgic.clemson.edu/factsheet/indoor-plants-transplanting-repotting/
  - https://extension.msstate.edu/blogs/extension-for-real-life/gardening-myth-busters
  - https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0318716

## macetas-2

- [ ] **función del compost y de la fibra de coco**: El compost en mezclas para maceta lo detalla una sola fuente abierta (NC State: nutrientes, retención, 15-40 % de la mezcla; el porcentaje no se puso en la tarjeta). INTA lo lista como componente sin detallar función. La fibra de coco aparece en Clemson como alternativa a la turba (enjuagada por las sales) y en RHS como ingrediente de mezclas sin turba; que 'guarda agua' se infiere de que reemplaza a la turba.
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers
  - https://hgic.clemson.edu/factsheet/indoor-plants-soil-mixes/
- [ ] **fuente argentina**: La página del INTA en argentina.gob.ar define sustrato y lista componentes, pero no dice explícitamente 'no usar tierra de jardín en maceta' ni habla de plantas de interior. El título de la fuente en el JSON es descriptivo (no registré el título literal): conviene abrir la URL y copiar el título exacto. No encontré material de FAUBA.
  - https://www.argentina.gob.ar/node/402876

## macetas-3

- [ ] **cuánto más grande la maceta nueva**: Clemson, Illinois y NC State (macetas chicas): 1-2 pulgadas más de diámetro (2,5-5 cm). RHS: 5-10 cm más. Penn State y Wisconsin: 'apenas más grande' o 'un tamaño más'. Se usó el criterio conservador: 2 a 5 cm.
  - https://hgic.clemson.edu/factsheet/indoor-plants-transplanting-repotting/
  - https://www.rhs.org.uk/plants/types/houseplants/growing-guide
- [ ] **época de trasplante (adaptación hemisferio sur)**: Penn State, Wisconsin, RHS y NC State dicen primavera; Clemson primavera y verano en crecimiento activo. Adaptado a Buenos Aires como septiembre a noviembre. No encontré fuente argentina que lo confirme directamente.
  - https://extension.psu.edu/repotting-houseplants
  - https://hgic.clemson.edu/factsheet/indoor-plants-transplanting-repotting/
- [ ] **no trasplantar plantas débiles, en reposo o por florecer**: Una sola fuente (Clemson). Confianza media para esa tarjeta.
  - https://hgic.clemson.edu/factsheet/indoor-plants-transplanting-repotting/

## mascotas-1

- [ ] **por qué las plantas son tóxicas (defensa química)**: Una sola fuente abierta (revisión científica centrada en insectos). Las fuentes veterinarias consultadas no explican el porqué. El texto se dejó general a propósito.
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC8910576/
- [ ] **cinta (Chlorophytum comosum) como 'segura'**: La ficha de ASPCA dice no tóxica para perros y gatos, pero una nota de ASPCA la menciona entre las que pueden dar irritación estomacal leve (vómitos, diarrea). Se mantuvo 'Segura' con la aclaración de que comer mucho de cualquier planta puede caer mal.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/spider-plant
  - https://www.aspca.org/news/houseplant-safe-your-pets

## mascotas-2

- [ ] **no dar leche**: Fuentes en conflicto: Pet Poison Helpline dice que la leche no neutraliza y puede empeorar el malestar; ASPCA (nota sobre plantas con oxalatos) y Merck mencionan que un poco de lácteo puede aliviar la irritación de boca por plantas tipo potus o dieffenbachia. Se eligió el criterio conservador: nada sin indicación profesional.
  - https://www.petpoisonhelpline.com/uncategorized/five-pet-poisoning-first-aid-misconceptions/
  - https://www.aspca.org/news/these-houseplants-can-cause-trouble-your-pets
  - https://www.merckvetmanual.com/toxicology/poisonous-plants/houseplants-and-ornamentals-toxic-to-animals
- [ ] **llevar muestra o foto de la planta**: Lo dice explícitamente la FDA (planta o foto) e International Cat Care (etiqueta). VCA y Cornell hablan de informar qué, cuánto y cuándo, sin mencionar muestra.
  - https://www.fda.gov/animal-veterinary/animal-health-literacy/lovely-lilies-and-curious-cats-dangerous-combination
  - https://icatcare.org/articles/poisonous-plants

## mascotas-3

- [ ] **plantas 'repelentes' por olor**: No encontré ninguna fuente veterinaria que respalde ni que evalúe plantas repelentes por olor; la frase 'no son una solución comprobada' se apoya en esa ausencia de evidencia, no en una fuente que lo diga textualmente. Sí está verificado que lavanda, limonero y naranjo figuran como tóxicos para perros y gatos en ASPCA.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/lavender
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/lemon
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/orange
- [ ] **sprays y disuasivos**: Cornell y VCA mencionan repelentes comerciales, sprays amargos, pimienta de cayena y hasta naftalina en la tierra. Por regla del brief no se recomienda ninguno (la naftalina además es tóxica). La app no menciona sprays comerciales: decidir si se quiere aclarar.
  - https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-behavior-problems-destructive-behavior
  - https://vcahospitals.com/know-your-pet/dogs-and-destructive-chewing
- [ ] **pasto para gatos**: Cornell menciona pasto de avena como alternativa (aclarando que el gato puede seguir mordiendo plantas). La composición (trigo, cebada, avena) sale de Hill's, que es una empresa de alimentos con revisión veterinaria, no una institución. Confianza media.
  - https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-behavior-problems-destructive-behavior
  - https://www.hillspet.com/cat-care/nutrition-feeding/cat-grass-safety-and-information
- [ ] **aceites esenciales en perros**: La fuente abierta (VCA) habla de gatos. No abrí una fuente específica para perros; la lección solo afirma el mecanismo para gatos.
  - https://vcahospitals.com/know-your-pet/essential-oil-and-liquid-potpourri-poisoning-in-cats

## monstera

- [ ] **luz**: Wisconsin sugiere sol directo en invierno; RHS y NC State, sin sol directo. Confianza media.
  - https://hort.extension.wisc.edu/articles/monstera-deliciosa/
  - https://www.rhs.org.uk/plants/swiss-cheese-plants/how-to-grow-swiss-cheese-plants
  - https://plants.ces.ncsu.edu/plants/monstera-deliciosa/
- [ ] **sensibilidad_calor**: 'alta' apoyada solo en RHS (lejos de calor directo/radiadores, aire seco de calefacción). NC State y Wisconsin no advierten sobre calor.
  - https://www.rhs.org.uk/plants/swiss-cheese-plants/how-to-grow-swiss-cheese-plants
- [ ] **fuentes en conflicto**: Luz: Wisconsin Extension sugiere sol directo en invierno; RHS y NC State indican luz indirecta sin sol directo. Se eligió el criterio conservador (sin sol directo).
- [ ] **fuentes en conflicto**: Riego: RHS dice dejar secar casi todo el sustrato; NC State, el cuarto o tercio superior. Se usó la regla de NC State.
- [ ] **fuentes en conflicto**: Gravedad: NC State la clasifica como severidad baja y ASPCA describe este grupo de plantas como de gravedad baja, con hinchazón de garganta solo en casos raros.
- [ ] **fuentes en conflicto**: Sol: Wisconsin sugiere sol directo en invierno; RHS y NC State piden luz indirecta y RHS dice que el sol directo quema. Se dejó sin sol directo.

## orquidea-phalaenopsis

- [ ] **luz**: NC State dice 'poca luz', RHS dice luz brillante sin sol directo de verano. Se puso 'media' con confianza media.
  - https://plants.ces.ncsu.edu/plants/phalaenopsis/
  - https://www.rhs.org.uk/plants/phalaenopsis/growing-guide
- [ ] **horas_sol_directo**: Ninguna fuente dice 'morning sun' textual: se infiere de la recomendación de ventana este con 'little or no direct sun' (Clemson, AOS, NC State, RHS). Wisconsin dice sin sol directo. Con regla estricta sería 0.
  - https://hgic.clemson.edu/factsheet/orchids/
  - https://www.aos.org/orchid-care/care-sheets/phalaenopsis-culture-sheet
  - https://hort.extension.wisc.edu/articles/orchids/
- [ ] **luz_tolerada**: Se agregó indirecta_media: NC State dice que prefiere 'low light', Clemson que se adapta a la luz de interior y Wisconsin que tolera lugares más sombríos. No se agregó 'baja' porque RHS pide luz brillante para florecer.
  - https://plants.ces.ncsu.edu/plants/phalaenopsis/
  - https://hgic.clemson.edu/factsheet/orchids/
  - https://hort.extension.wisc.edu/articles/orchids/
- [ ] **fuentes en conflicto**: Luz: NC State dice que prefiere poca luz (ventana este), mientras que RHS pide luz brillante en invierno y solo evitar el sol directo en verano. Se tomó 'media' (claridad sin sol fuerte).
- [ ] **fuentes en conflicto**: Riego: ninguna de las dos fuentes menciona cubitos de hielo; ambas piden agua tibia, por eso no se recomiendan.
- [ ] **fuentes en conflicto**: Cuatro fuentes recomiendan una ventana al este (sol suave de mañana) con 'poco o nada de sol directo'; Wisconsin dice directamente que las orquídeas no reciban sol directo. Dejamos solo un rato de sol suave temprano, y en verano filtrado.
- [ ] **fuentes en conflicto**: RHS acepta alféizar al oeste; NC State y la American Orchid Society dicen que oeste y sur solo si están bien sombreados. Tomamos el criterio más cuidadoso: sin sol de tarde.

## palma-sagu

- [ ] **gatos**: ASPCA la lista como tóxica para gatos y perros, pero Pet Poison Helpline y Merck hablan sobre todo de perros ('extremadamente sensibles'). Se dejó para ambos por criterio conservador.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/sago-palm
  - https://www.merckvetmanual.com/toxicology/poisonous-plants/houseplants-and-ornamentals-toxic-to-animals

## palmera-areca

- [ ] **toxicidad_gato / toxicidad_perro**: ASPCA y etiquetas de NC State: no tóxica. Pero la sección de veneno de NC State menciona glucósidos cianogénicos (severidad baja) sin aclarar si aplica a mascotas. Se dejó 'segura' con confianza media.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/areca-palm
  - https://plants.ces.ncsu.edu/plants/dypsis-lutescens/
- [ ] **riego.invierno y humedad**: NC State no da pauta de invierno; Clemson solo da reglas generales para palmeras de interior. Confianza media.
  - https://plants.ces.ncsu.edu/plants/dypsis-lutescens/
  - https://hgic.clemson.edu/factsheet/indoor-palms/
- [ ] **apta.balcon**: Zonas USDA 10-11 (NC State) y daño por frío bajo ~7 °C (regla general de Clemson). No se verificó con fuente argentina la zona de rusticidad de Buenos Aires; se puso false por criterio conservador.
  - https://plants.ces.ncsu.edu/plants/dypsis-lutescens/
  - https://hgic.clemson.edu/factsheet/indoor-palms/
- [ ] **horas_sol_directo**: Indoor: 'bright indirect' en las dos fuentes; el 2 se apoya en que NC State dice que al exterior tolera pleno sol. Las fichas de UF/IFAS (EDIS) no abrieron. Con regla estricta sería 0.
  - https://plants.ces.ncsu.edu/plants/dypsis-lutescens/
  - https://hgic.clemson.edu/factsheet/indoor-palms/
- [ ] **fuentes en conflicto**: Nombre: ASPCA la lista como Dypsis lutescens; NC State y Clemson usan Chrysalidocarpus lutescens.
- [ ] **fuentes en conflicto**: Toxicidad: ASPCA y las etiquetas de NC State la dan como no tóxica para gatos y perros, pero la sección de toxicidad de NC State menciona glucósidos cianogénicos en hojas y tallos con severidad baja (náuseas y vómitos, sin aclarar si aplica a mascotas). Se dejó 'segura' con confianza media.
- [ ] **fuentes en conflicto**: Sol: NC State dice que al exterior tolera pleno sol aunque prefiere media sombra; como planta de interior las dos fuentes piden luz indirecta, por eso sol_directo quedó en false.
- [ ] **fuentes en conflicto**: Riego de invierno: NC State no da pauta de invierno; se usó la regla general de Clemson para palmeras de interior.
- [ ] **fuentes en conflicto**: Humedad: NC State dice humedad alta; Clemson no da un requisito específico para la areca (solo la regla general de sumar humedad por debajo del 50 %).
- [ ] **fuentes en conflicto**: Adentro las dos fuentes piden luz brillante indirecta, pero NC State dice que al aire libre tolera pleno sol aunque prefiere media sombra. Dejamos solo un poco de sol suave, y siempre acostumbrándola de a poco.
- [ ] **fuentes en conflicto**: NC State dice que al aire libre tolera pleno sol, pero para interior las fuentes piden luz brillante indirecta. Se toma el criterio conservador: sin sol directo.

## palmera-de-salon

- [ ] **humedad**: NC State (baja a media, tolera aire seco) vs Clemson (alta a moderada, adaptable). Se puso 'media'.
  - https://plants.ces.ncsu.edu/plants/chamaedorea-elegans/
  - https://hgic.clemson.edu/factsheet/indoor-palms/
- [ ] **sensibilidad_calor**: Ninguna fuente abierta habla de calor ni de sol directo para la especie; 'media' por defecto. La ficha UF/IFAS FP119 no abrió.
  - https://plants.ces.ncsu.edu/plants/chamaedorea-elegans/
  - https://hgic.clemson.edu/factsheet/indoor-palms/
- [ ] **fuentes en conflicto**: Humedad: NC State dice humedad baja a media y que tolera el aire seco; Clemson dice que prefiere humedad alta a moderada pero es adaptable. Se tomó 'media'.
- [ ] **fuentes en conflicto**: Riego: NC State indica dejar secar apenas entre riegos; la regla general de Clemson para palmeras dice no dejar secar la tierra del todo. Se tomó regar al secarse la superficie.
- [ ] **fuentes en conflicto**: NC State advierte que el jugo de los frutos puede irritar la piel de las personas; no afecta la clasificación para mascotas (no peligrosa según NC State y ASPCA).

## palo-de-agua

- [ ] **gravedad**: NC State: baja; artículo ASPCA 2019: moderada (género Dracaena). Se dejó 'moderada'.
  - https://plants.ces.ncsu.edu/plants/dracaena-fragrans/
  - https://www.aspca.org/news/houseplant-safe-your-pets
- [ ] **sensibilidad_calor**: NC State la lista como resistente al calor (21-27 °C); Clemson recomienda 15-21 °C para el género. Se dejó 'media'.
  - https://plants.ces.ncsu.edu/plants/dracaena-fragrans/
  - https://hgic.clemson.edu/factsheet/dracaena/
- [ ] **fuentes en conflicto**: Gravedad: NC State la clasifica como severidad baja; un artículo de ASPCA (2019) describe a las Dracaena como moderadamente tóxicas, con cuadros más serios en ingestas grandes. Se dejó 'moderada'.
- [ ] **fuentes en conflicto**: Riego: NC State dice mantener la tierra húmeda en época de crecimiento; Clemson, dejar secar la superficie entre riegos. Se usó la regla de Clemson, más segura contra la pudrición.
- [ ] **fuentes en conflicto**: NC State la marca como resistente al calor y dice que rinde entre 21 y 27 °C; Clemson recomienda 15 a 21 °C para las drácenas en general. Dejamos sensibilidad media.

## peligrosas

- [ ] **nombres comunes en Argentina y presencia en casas y balcones**: Los nombres en español ('laurel de jardín', 'cica', 'hemerocalis') y que sean plantas comunes en Argentina no se verificaron con una fuente argentina; las fuentes veterinarias son de Estados Unidos y Reino Unido. Tampoco se afirma en los textos que sean comunes acá.
- [ ] **formato**: Se usó gravedad 'consulta_urgente' además de 'grave' (entrada 'bulbos') y se agregó un campo opcional 'no_confundir' en 'lirios' para la diferencia con espatifilo y cala. Ajustar si la app espera otro esquema.

## peperomia

- [ ] **humedad / sustrato**: La segunda fuente (RHS) es una guía del género Peperomia, no específica de P. obtusifolia; además difiere de NC State en humedad. Confianza media.
  - https://www.rhs.org.uk/plants/peperomia/how-to-grow-peperomia
  - https://plants.ces.ncsu.edu/plants/peperomia-obtusifolia/
- [ ] **fuentes en conflicto**: Humedad: NC State indica humedad relativa media a baja; la guía de RHS (del género) dice que se adaptan al aire de casa pero prefieren ambientes húmedos. Se eligió "media".
- [ ] **fuentes en conflicto**: Sustrato: la receta detallada viene de la guía de RHS, que es del género Peperomia y no específica de P. obtusifolia; NC State solo pide buen drenaje.
- [ ] **fuentes en conflicto**: Sol: RHS dice que el sol débil de invierno suele ser bienvenido; NC State dice que el sol fuerte o directo quema las hojas. Se dejó sin sol directo.

## pilea

- [ ] **toxicidad_gato / toxicidad_perro**: ASPCA no tiene ficha propia de Pilea peperomioides en su base (la URL probada devolvió el índice general y la búsqueda en aspca.org no encontró ficha). Se apoya en una nota de ASPCA de 2021 que la lista como no tóxica y en NC State ("safe for pets and children", sin detalle). No hay segunda fuente veterinaria. Confianza media.
  - https://www.aspca.org/news/are-succulents-safe-have-around-pets
  - https://plants.ces.ncsu.edu/plants/pilea-peperomioides/
- [ ] **humedad**: Fuentes con matices, incluso dos páginas de RHS que se contradicen (tolera aire seco vs necesita humedad alta).
  - https://www.rhs.org.uk/plants/pilea/how-to-grow-pilea
  - https://www.rhs.org.uk/plants/13015/pilea-peperomioides/details
  - https://plants.ces.ncsu.edu/plants/pilea-peperomioides/
  - https://extension.psu.edu/pilea-as-a-houseplant
- [ ] **fuente Penn State**: El artículo de Penn State trata el género Pilea en general, no solo P. peperomioides.
  - https://extension.psu.edu/pilea-as-a-houseplant
- [ ] **fuentes en conflicto**: Humedad: la guía de cultivo de RHS dice que tolera el aire seco normal de casa; la ficha de RHS de la especie dice que necesita humedad alta; NC State dice moderada a alta pero tolera la de casa; Penn State habla de ambiente cálido y húmedo. Se eligió "media".
- [ ] **fuentes en conflicto**: Toxicidad: no encontré ficha propia de Pilea peperomioides en la base de plantas de ASPCA; ASPCA la nombra como no tóxica en una nota de 2021 sobre suculentas, y NC State dice que es segura para mascotas sin dar más detalle. No se usó la ficha de otras especies de Pilea.

## potus

- [ ] **humedad / gravedad**: Humedad: alta según Wisconsin, sin nivel claro en NC State. Gravedad: baja según ASPCA, media según NC State.
  - https://hort.extension.wisc.edu/articles/pothos-epipremmum-aureum/
  - https://plants.ces.ncsu.edu/plants/epipremnum-aureum/
  - https://www.aspca.org/news/houseplant-safe-your-pets
- [ ] **fuentes en conflicto**: Gravedad: ASPCA describe el riesgo de las plantas con oxalatos como bajo y sin riesgo de vida; NC State la clasifica como severidad media (para personas). Se dejó 'moderada' por ser el criterio más conservador.
- [ ] **fuentes en conflicto**: Humedad: Wisconsin dice que prefiere humedad alta; NC State solo sugiere humidificador o bandeja con piedras. Se dejó 'media'.

## recurso-argentino

- [ ] **línea o guardia oficial de toxicología veterinaria en Argentina**: No encontré un recurso oficial argentino verificable de urgencias toxicológicas veterinarias. La página del Hospital Escuela de la Facultad de Ciencias Veterinarias de la UBA no mostró si tiene guardia ni horarios. No se menciona ninguno en las lecciones.
  - https://www.fvet.uba.ar/?q=hospital

## ricino

- [ ] **dosis**: Las fuentes dan cifras distintas (Pet Poison Helpline: 1-2 semillas masticadas; ASPCA: una onza de semillas puede ser letal). Se escribió 'unas pocas semillas' sin número.
  - https://www.petpoisonhelpline.com/poison/castor-bean/
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/castor-bean-plant

## riego-1

- [ ] **la sed se recupera más fácil que la pudrición**: Es una síntesis: Illinois y NC State dicen que de la pudrición de raíces rara vez se recuperan, y NC State indica empapar el pan de raíces de una planta con falta de agua. Pero Clemson y NC State advierten que dejar secar del todo también daña raíces. La tarjeta dice 'muchas veces se repone', no 'siempre'.
  - https://extension.illinois.edu/container-gardens/container-drainage-options
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers

## riego-2

- [ ] **profundidad del test del dedo**: Las fuentes no coinciden en la profundidad: Clemson dice hasta la primera articulación; Wisconsin 1 pulgada (2,5 cm); RHS habla de superficie seca; Utah State 'unos centímetros/pulgadas'; NC State 2-3 pulgadas (5-7,5 cm, para contenedores en general, incluidos los de exterior). Se usó 'primer nudillo, 2 o 3 cm' por ser el criterio más repetido para interior. Para macetas grandes podría quedarse corto.
  - https://hgic.clemson.edu/factsheet/indoor-plants-watering/
  - https://hort.extension.wisc.edu/articles/houseplant-care/
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers
- [ ] **palito de madera**: Respaldo flojo: una sola fuente explica cómo leerlo (Univ. of Maryland en Ask Extension: la tierra húmeda se pega, la seca queda en polvo, y lo propone para panes de raíces densos). UC Cooperative Extension Sacramento solo lo nombra como método válido, en una guía de suculentas. Por esto la lección quedó en confianza media. 'Como los de brochette' es adaptación local de 'skewer'.
  - https://ask.extension.org/kb/faq.php?id=799752
  - https://ucanr.edu/sites/default/files/2025-08/331073.pdf
- [ ] **medidores de humedad baratos**: Cuatro fuentes institucionales coinciden en que no son del todo confiables (Clemson: exactitud muy variable, el abono y el tipo de tierra alteran la lectura; Illinois: no siempre confiable; Penn State: innecesario y confuso; Maryland: probablemente menos exacto que el dedo, sin ensayos propios). Ninguna habla específicamente de 'los de aguja baratos' ni presenta mediciones: es opinión experta, no un ensayo. Se mostró con salvedad (ayuda, pero confirmar con el dedo), no como inútiles.
  - https://hgic.clemson.edu/factsheet/indoor-plants-watering/
  - https://extension.illinois.edu/houseplants/watering
  - https://extension.psu.edu/to-buy-or-not-to-buy-the-gear-your-houseplants-really-need
  - https://ask.extension.org/kb/faq.php?id=799752
- [ ] **profundidad del test del dedo**: Sigue la discrepancia de la pasada anterior y se suma Illinois (2 pulgadas) y Maryland (1-2 pulgadas, 3 en macetas muy grandes). Se mantuvo 'primer nudillo, 2 o 3 cm'; para macetas grandes queda corto y ahí el palito ayuda.
  - https://hgic.clemson.edu/factsheet/indoor-plants-watering/
  - https://extension.illinois.edu/houseplants/watering
  - https://ask.extension.org/kb/faq.php?id=799752
- [ ] **color de la tierra**: Clemson e Iowa State coinciden, pero Iowa State aclara que el color es confiable en mezclas con turba y menos en otros sustratos. La tarjeta lo presenta como pista rápida a confirmar con el dedo.
  - https://hgic.clemson.edu/factsheet/indoor-plants-watering/
  - https://yardandgarden.extension.iastate.edu/article/2025/04/watering-plants-containers-and-plug-trays

## riego-3

- [ ] **rociar las hojas**: Penn State, Iowa State y NC State dicen que el efecto es mínimo o muy breve. La guía de RHS sí lo menciona como opción para tropicales, aunque aclara que solo ayuda si se hace con frecuencia. Wisconsin lo menciona solo contra arañuela. Se optó por no recomendarlo y sugerir agrupar o humidificador. La bandeja con piedras NO se recomendó: Iowa State y RHS la sugieren, Penn State dice que el efecto es mínimo.
  - https://extension.psu.edu/humidity-and-houseplants
  - https://yardandgarden.extension.iastate.edu/faq/air-our-home-extremely-dry-winter-should-i-mist-houseplants
  - https://www.rhs.org.uk/plants/types/houseplants/growing-guide
- [ ] **invierno: menos riego vs calefacción que seca**: Matiz entre fuentes: Wisconsin, NC State y RHS (diciembre) dicen regar menos en invierno; la guía general de RHS advierte que con calefacción central las macetas pueden secarse más rápido. La lección dice las dos cosas y manda a tocar la tierra. Adaptación hemisferio sur: invierno del norte (dic-feb) convertido a junio-agosto; verano a diciembre-febrero.
  - https://www.rhs.org.uk/plants/types/houseplants/growing-guide
  - https://hort.extension.wisc.edu/articles/houseplant-care/
- [ ] **tiempo para vaciar el plato**: Wisconsin dice 10 a 20 minutos; Utah State, alrededor de una hora. La tarjeta dice 'después de un rato' sin número.
  - https://hort.extension.wisc.edu/articles/houseplant-care/
  - https://extension.usu.edu/archive/care-and-feeding-of-indoor-plants
- [ ] **riego por inmersión**: Respaldado solo para casos puntuales: Clemson lo indica para rehidratar tierra muy seca; Wisconsin describe riego desde el plato (20-30 min) para plantas que no toleran hojas mojadas; RHS para ciclamen. Ninguna fuente abierta lo recomienda como método de rutina, así que la tarjeta lo presenta solo como rescate de tierra reseca.
  - https://hgic.clemson.edu/factsheet/indoor-plants-watering/
  - https://hort.extension.wisc.edu/articles/houseplant-care/
- [ ] **regar por abajo junta sales**: Abierta y leída solo una fuente que lo dice directo (Iowa State, sobre violetas africanas). Que el riego por arriba lava sales lo respaldan además Clemson, Wisconsin e Illinois. Missouri (g6510) y Maryland lo dicen según los resultados de búsqueda, pero no se pudieron abrir, así que no se citan. Ninguna fuente abierta compara 'arriba vs abajo' como métodos de rutina; el riego por abajo aparece para plantas que no toleran hojas mojadas.
  - https://yardandgarden.extension.iastate.edu/how-to/all-about-african-violets
  - https://extension.illinois.edu/houseplants/watering
- [ ] **tiempo de remojo y de vaciado del plato**: Sin número en las tarjetas: Wisconsin dice 20-30 min de riego por plato y vaciar a los 10-20 min; Utah, alrededor de una hora; Illinois, 'hasta que la humedad llegue arriba'.
  - https://hort.extension.wisc.edu/articles/houseplant-care/
  - https://extension.illinois.edu/houseplants/watering

## riego-4

- [ ] **riego con cubitos de hielo**: Fuentes en conflicto. UConn (educador de Extensión) lo trata como tendencia equivocada: el frío puede dañar raíces de plantas tropicales. Un estudio de Ohio State y Georgia (HortScience 2017) no encontró daño en orquídeas Phalaenopsis en corteza; la recomendación de 3 cubitos viene de un productor comercial y el estudio no probó otras plantas ni que el hielo sea mejor. Criterio conservador: una pregunta verdadero/falso acotada a 'la mayoría de las plantas de interior', apoyada además en que RHS, Clemson e Illinois piden agua a temperatura ambiente. No hay tarjeta sobre hielo, solo la pregunta. Una sola fuente institucional trata el mito de forma directa.
  - https://today.uconn.edu/?p=189123
  - https://u.osu.edu/greenhouse/category/postharvest
- [ ] **lluvia en balcones**: Las dos fuentes son de la misma institución (RHS) y hablan de plantas de interior sacadas afuera y de macetas de exterior en clima británico. Que en Buenos Aires llueve más seguido en verano sale de una sola fuente (Gobierno de la Ciudad). No encontré fuente argentina sobre riego de macetas en balcón. UGA no menciona la lluvia.
  - https://www.rhs.org.uk/plants/types/houseplants/moving-houseplants-outdoors
  - https://www.rhs.org.uk/container-gardening/maintenance
  - https://buenosaires.gob.ar/adaptacion/el-clima-en-la-ciudad
- [ ] **ducha: 'hacela cuando toque regar'**: Es una inferencia propia. Wisconsin, Iowa State y NC State respaldan la ducha tibia para limpiar hojas (y Wisconsin, para lavar sales), y NC State e Iowa State el pincel o cepillo para hojas peludas. Ninguna dice explícitamente que la ducha cuente como riego ni cuándo evitarla, más allá de las hojas con pelitos.
  - https://hort.extension.wisc.edu/articles/houseplant-care/
  - https://yardandgarden.extension.iastate.edu/faq/dust-has-accumulated-foliage-my-houseplants-how-can-i-clean-plants
- [ ] **plato en exterior**: Matiz no incluido en la tarjeta: RHS dice que en macetas de exterior un plato puede ayudar a ahorrar agua en períodos secos de verano (y sacarlo en invierno). Para interior todas las fuentes piden vaciarlo. Los mosquitos los menciona solo NC State.
  - https://www.rhs.org.uk/container-gardening/maintenance
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers
- [ ] **goteo y autorriego**: El goteo está respaldado para macetas de exterior en general (NC State, Illinois, RHS), no para plantas de interior. 'Van mejor con plantas que quieren humedad pareja' sale de RHS (autorriego) y Penn State (globos de riego); se aplicó a todo el grupo.
  - https://www.rhs.org.uk/plants/types/houseplants/holiday-care
  - https://extension.illinois.edu/container-gardens/watering
- [ ] **rociar las hojas**: Igual que en la pasada anterior: Penn State, Iowa State y NC State dicen que no sirve para la humedad; la guía de RHS lo menciona como opción si se hace seguido, aunque otra página de RHS dice que la bandeja con grava es 'mucho más eficaz que rociar'. Se mantuvo el criterio de no recomendarlo. Excepción (plantas del aire): Penn State, dos páginas de la misma institución.
  - https://extension.psu.edu/humidity-and-houseplants
  - https://www.rhs.org.uk/plants/types/houseplants/growing-guide

## riego-5

- [ ] **datos de Buenos Aires**: No pude abrir el Servicio Meteorológico Nacional, así que no hay temperaturas ni lluvias en números. Lo local (veranos cálidos, inviernos frescos, olas de calor más frecuentes) sale de una sola fuente oficial, el Gobierno de la Ciudad. Los meses (invierno junio-agosto, verano diciembre-febrero) son la conversión de hemisferio indicada en el brief. El resto son fuentes del hemisferio norte adaptadas.
  - https://buenosaires.gob.ar/adaptacion/el-clima-en-la-ciudad
- [ ] **invierno: menos riego vs calefacción que seca**: Mismo matiz que antes: Wisconsin, NC State y RHS (diciembre) dicen regar menos; RHS y Utah advierten que con calefacción las macetas se secan antes. La lección dice las dos cosas y manda a tocar la tierra. 'Menos luz' como causa es síntesis: las fuentes hablan de crecimiento más lento y de que con fresco y poca luz se necesita menos agua (Clemson, RHS, UF).
  - https://www.rhs.org.uk/plants/types/houseplants/growing-guide
  - https://hort.extension.wisc.edu/articles/houseplant-care/
- [ ] **revisar macetas del balcón todos los días en verano**: Sale de guías de macetas de exterior (RHS: a diario con calor o viento; NC State: a veces riego diario), no de plantas de interior. La tarjeta dice 'puede hacer falta revisar', no regar a diario.
  - https://www.rhs.org.uk/container-gardening/maintenance
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers

## todas

- [ ] **otros_nombres**: Los nombres alternativos usados en Argentina salen de conocimiento general, no de una fuente abierta (el brief lo permite).
- [ ] **atractivo_para_mascotas**: Ninguna fuente abierta menciona si estas plantas atraen a gatos o perros; quedó "desconocido" en las 8.
- [ ] **otros_nombres**: Los nombres alternativos en español están puestos de memoria (no hay fuente argentina abierta que los respalde).
- [ ] **otros_nombres**: Los nombres alternativos salen de conocimiento general, no de fuentes abiertas (el brief lo permite). 'Cuna de Moisés' para el espatifilo es más usado en otros países que en Argentina: revisar.
- [ ] **atractivo_para_mascotas**: Ninguna fuente abierta habla de si atraen a las mascotas; quedó 'desconocido' en todas.
- [ ] **apta.balcon**: Se puso false en todas a partir de temperaturas mínimas y zonas USDA de las fuentes; no se consultó SMN ni otra fuente argentina sobre mínimas de Buenos Aires.

## violeta-africana

- [ ] **horas_sol_directo**: RHS: fuera del sol directo (sobre todo verano). Clemson y Wisconsin solo excluyen sol de tarde/horas pico. Se dejó 2; con regla estricta sería 0.
  - https://www.rhs.org.uk/plants/african-violets/growing-guide
  - https://hgic.clemson.edu/factsheet/african-violet/
  - https://hort.extension.wisc.edu/articles/african-violets/
- [ ] **sensibilidad_calor**: 'alta' se apoya en la advertencia de RHS sobre sol concentrado por el vidrio y rango 18-24 °C; Clemson acepta hasta 27-29 °C.
  - https://www.rhs.org.uk/plants/african-violets/growing-guide
  - https://hgic.clemson.edu/factsheet/african-violet/
- [ ] **fuentes en conflicto**: Humedad: el texto de NC State dice que no tolera el aire seco, pero sus etiquetas incluyen 'tolerante al aire seco'; RHS coincide con que no le gusta el aire seco. Se tomó 'alta'.
- [ ] **fuentes en conflicto**: Luz: los atributos de NC State listan 'sombra profunda' y 'sombra parcial', mientras su texto y RHS piden luz brillante filtrada. Se tomó 'media'.
- [ ] **fuentes en conflicto**: Riego de invierno: ninguna fuente da una pauta distinta para invierno.
- [ ] **fuentes en conflicto**: RHS pide mantenerla fuera del sol directo, sobre todo en verano; Clemson y Wisconsin solo piden evitar el sol de la tarde o de las horas pico. Dejamos solo sol suave temprano y fuera del verano.
- [ ] **fuentes en conflicto**: RHS da 18 a 24 °C y advierte que el sol a través del vidrio la quema; Clemson acepta hasta 27 a 29 °C de día. Tomamos el criterio más cuidadoso con el calor.

## zamioculca

- [ ] **toxicidad_gato / toxicidad_perro**: ASPCA no tiene ficha propia en su lista (la URL /zz-plant no devolvió datos); se apoya en un artículo de ASPCA que nombra Zamioculcas spp. entre las plantas con oxalatos insolubles + NC State (toxicidad media para gatos y perros) + Iowa State. Confianza media.
  - https://www.aspca.org/news/these-houseplants-can-cause-trouble-your-pets
  - https://plants.ces.ncsu.edu/plants/zamioculcas-zamiifolia/
  - https://yardandgarden.extension.iastate.edu/faq/i-recently-purchased-zz-plant-how-do-i-care-it
- [ ] **humedad**: Ninguna fuente abierta da requisitos de humedad; nivel 'baja' es inferencia a partir de su tolerancia al descuido. Confianza baja (arrastra la confianza general de la planta a 'baja').
  - https://plants.ces.ncsu.edu/plants/zamioculcas-zamiifolia/
  - https://yardandgarden.extension.iastate.edu/faq/i-recently-purchased-zz-plant-how-do-i-care-it
- [ ] **sustrato**: Solo NC State describe el sustrato; no pude abrir la ficha de UF/IFAS (EP480).
  - https://plants.ces.ncsu.edu/plants/zamioculcas-zamiifolia/
- [ ] **humedad**: Confianza baja.
- [ ] **fuentes en conflicto**: Toxicidad: no encontré ficha propia de la zamioculca en la lista de plantas de ASPCA (la URL /zz-plant no devolvió datos). ASPCA sí la nombra (Zamioculcas spp.) en un artículo sobre plantas con oxalatos de calcio insolubles, y NC State la marca con toxicidad media para gatos y perros. Por eso figura como tóxica pero con confianza media.
- [ ] **fuentes en conflicto**: Gravedad: el artículo de ASPCA habla de gravedad baja para el grupo; NC State dice media. Se dejó 'moderada' (más conservador).
- [ ] **fuentes en conflicto**: Frecuencia de riego: Iowa State habla de cada 7 a 14 días; NC State, hasta dos veces por mes en verano y una en invierno. Se usó la regla de dejar secar.

## Adaptaciones al hemisferio sur

Datos convertidos desde fuentes del hemisferio norte (orientación de ventanas, meses). Conviene mirarlos con ojo local.

- **aloe-vera**: RHS recomienda ventana sur u oeste (hemisferio norte); en Buenos Aires equivale a ventana norte u oeste. / Penn State habla de crecimiento de principios de primavera a principios de otoño y reposo en otoño-invierno; en Buenos Aires el crecimiento va aproximadamente de septiembre a marzo y el reposo de abril a agosto. / Las fuentes son del hemisferio norte y hablan de ventana sur como la más soleada: en Buenos Aires esa es la ventana norte. El sol de la tarde entra por el oeste igual que allá. / En un balcón porteño: sol de mañana (orientación este o noreste) y reparo desde el mediodía en verano (diciembre a febrero). Si viene de adentro, sacala al sol de a poco.
- **anturio**: RHS recomienda ventana este u oeste, o sur con cortina (hemisferio norte); en Buenos Aires la ventana equivalente a 'sur' es la norte. / RHS recomienda ventana este u oeste, o sur con cortina: en Buenos Aires la que necesita cortina es la norte. El sol directo de verano que quema es el de diciembre a febrero.
- **jade**: RHS recomienda orientación sur u oeste (hemisferio norte); en Buenos Aires equivale a ventana norte u oeste. / NC State indica reducir el riego de otoño a fines de invierno (norte); en Buenos Aires es aproximadamente de abril a agosto. / Las fuentes son del hemisferio norte y hablan de ventana sur como la más soleada: en Buenos Aires esa es la ventana norte. El sol de la tarde entra por el oeste igual que allá. / En balcón: sol de mañana y sombra a la tarde, sobre todo en verano (diciembre a febrero). Al pasarla de adentro al sol, aclimatala de a poco durante unas semanas.
- **begonia**: RHS marca la época de abonado de mayo a septiembre (hemisferio norte); en Buenos Aires equivale a noviembre a marzo aprox. El riego reducido de invierno corresponde a junio-agosto. / RHS pide sombra en verano: en Buenos Aires, de diciembre a febrero.
- **cactus-de-navidad**: Floración: NC State indica flores en invierno del hemisferio norte (diciembre a febrero). En Buenos Aires el invierno es de junio a agosto, así que la floración esperable es aproximadamente de junio a agosto y no en Navidad. / Inducción de pimpollos: NC State y Clemson indican noches largas (13-14 h de oscuridad sin interrupción) y frescas desde mediados de septiembre, el comienzo del otoño boreal. En Buenos Aires equivale a mediados de marzo. / Clemson indica crecimiento ideal de abril a septiembre (primavera-verano boreal); en Buenos Aires es aproximadamente de octubre a marzo. / Clemson dice que el sol pleno es beneficioso en otoño e invierno y dañino en verano; en Buenos Aires el sol fuerte a evitar es el de diciembre a febrero. / El sol suave que le viene bien es el de otoño e invierno: en Buenos Aires, de abril a agosto. De diciembre a febrero, nada de sol directo. / Las fuentes son del hemisferio norte y hablan de ventana sur como la más soleada: en Buenos Aires esa es la ventana norte. El sol de la tarde entra por el oeste igual que allá.
- **calatea**: RHS recomienda ventana norte o este en verano y sur en invierno (hemisferio norte); en Buenos Aires se invierte: sur o este en verano (diciembre-febrero) y norte en invierno (junio-agosto). / El invierno porteño con calefacción seca el aire: es cuando más conviene sumar humedad. / RHS recomienda ventana norte o este en verano y sur en invierno: en Buenos Aires es al revés, sur o este en verano y norte en invierno.
- **cinta**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto. / En balcón solo va a la sombra luminosa: el sol directo le quema las hojas. No es planta para balcón con sol.
- **echeveria**: RHS recomienda orientación sur u oeste (hemisferio norte); en Buenos Aires equivale a ventana norte u oeste. / RHS indica floración a fines de invierno y primavera; en Buenos Aires sería aproximadamente de agosto a noviembre. / Las fuentes son del hemisferio norte y hablan de ventana sur como la más soleada: en Buenos Aires esa es la ventana norte. El sol de la tarde entra por el oeste igual que allá. / En balcón: sol de mañana y sombra desde el mediodía en verano (diciembre a febrero). Sacala al sol de a poco para que no se queme.
- **espatifilo**: RHS da la época de crecimiento como abril a octubre (hemisferio norte); en Buenos Aires equivale más o menos a octubre a abril, y el riego reducido va de junio a agosto. / RHS habla del sol directo de verano: en Buenos Aires, de diciembre a febrero.
- **ficus-lyrata**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto. / El 'sol de la tarde' del que hay que protegerlo llega en Buenos Aires por ventanas oeste y norte. / El sol de la tarde entra por el oeste igual que en el hemisferio norte; la ventana más soleada en Buenos Aires es la norte.
- **filodendro**: Clemson sugiere ventana norte, este u oeste (hemisferio norte, donde la norte es la menos soleada); en Buenos Aires equivale a ventana sur, este u oeste. / Clemson sugiere ventana norte, este u oeste, pensando en el hemisferio norte, donde la norte es la de menos sol. En Buenos Aires la equivalente es la ventana sur; este y oeste valen igual, sin sol directo.
- **gomero**: Temperaturas pasadas de °F a °C (redondeadas). / El reposo 'de otoño a fines del invierno' corresponde en Buenos Aires a marzo-agosto aproximadamente. / Clemson recomienda ventana este (sol de la mañana); vale igual en Buenos Aires porque el este no cambia de hemisferio. / La ventana al este da sol de mañana igual que en el hemisferio norte. En Buenos Aires la ventana más soleada es la norte: ahí conviene filtrarle el sol.
- **haworthia**: RHS recomienda orientación este, sur u oeste (hemisferio norte); en Buenos Aires equivale a este, norte u oeste, siempre filtrando el sol fuerte. / NC State indica floración a fines de primavera y principios de verano; en Buenos Aires sería aproximadamente de noviembre a enero. / Las fuentes son del hemisferio norte y hablan de ventana sur como la más soleada: en Buenos Aires esa es la ventana norte. El sol de la tarde entra por el oeste igual que allá. / En balcón: lugar muy luminoso pero a la sombra, o como mucho un rato de sol temprano. En verano (diciembre a febrero), siempre reparada.
- **helecho-serrucho**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto. / Clemson desaconseja ventanas sur u oeste (las más soleadas en el hemisferio norte); en Buenos Aires equivale a evitar ventanas norte u oeste con sol directo. / Las fuentes del hemisferio norte dicen 'nunca en ventana sur u oeste': en Buenos Aires eso equivale a las ventanas norte y oeste.
- **lengua-de-suegra**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto. / El sol del mediodía de verano que RHS pide evitar es, en Buenos Aires, el de diciembre a febrero y entra por las ventanas al norte.
- **monstera**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto. / RHS recomienda ventana este u oeste (hemisferio norte); en Buenos Aires una ventana este, o norte con cortina que filtre el sol. / RHS recomienda ventana este u oeste (vale igual en Buenos Aires) pero sin que le dé el sol directo; acá la ventana a evitar de cerca es la norte. / En invierno (junio a agosto), alejala de estufas y radiadores.
- **orquidea-phalaenopsis**: NC State habla de ventanas al oeste o al sur con sombra (hemisferio norte); en Buenos Aires la equivalente a 'sur' es la ventana norte, que necesita cortina. Este y oeste no cambian. / RHS indica regar menos en invierno: en Buenos Aires es de junio a agosto. / La ventana al este da sol de mañana igual que en el hemisferio norte. Donde las fuentes dicen 'sur sombreado', en Buenos Aires es la ventana norte con cortina. / RHS pide sacarla del sol directo en verano: acá eso es de diciembre a febrero.
- **palmera-areca**: Clemson sugiere ventanas al este, oeste o sur (hemisferio norte); en Buenos Aires la equivalente a 'sur' es la norte, con la luz filtrada. / NC State solo da la pauta de riego para la época de crecimiento, que en Buenos Aires va de primavera a otoño (octubre a abril aprox.). / Clemson recomienda cerca de una ventana este, oeste o sur: en Buenos Aires, este, oeste o norte.
- **palmera-de-salon**: NC State recomienda ventana al norte o al este (hemisferio norte, las de menos sol); en Buenos Aires equivale a ventana al sur o al este. / NC State recomienda ventana norte o este: en Buenos Aires la equivalente a la norte es la sur (la de menos sol).
- **palo-de-agua**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto.
- **peperomia**: RHS sugiere ventana este u oeste, o alejada de una ventana sur (hemisferio norte); en Buenos Aires equivale a este u oeste, o alejada de una ventana norte. / RHS indica abonar de abril a octubre (primavera a otoño boreal); en Buenos Aires sería aproximadamente de octubre a abril. / RHS recomienda ventana este u oeste, o alejada de una ventana sur: en Buenos Aires, alejada de una ventana norte. El sol de verano que quema es el de diciembre a febrero.
- **pilea**: RHS indica como ideales las ventanas norte, este u oeste y pide alejarla de una ventana sur (hemisferio norte); en Buenos Aires las ideales son sur, este u oeste, y hay que alejarla de una ventana norte, sobre todo en verano. / RHS indica abonar de abril a septiembre (primavera-verano boreal); en Buenos Aires sería aproximadamente de octubre a marzo. / RHS sugiere ventana norte, este u oeste y alejarla en ambientes al sur: en Buenos Aires es al revés, va bien cerca de una ventana sur, este u oeste y alejada de una norte, sobre todo en verano (diciembre a febrero).
- **potus**: Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto. / Las fuentes la dan como rústica solo en zonas USDA 10-12; lo traduje a 'no dejarla afuera en el invierno porteño'.
- **violeta-africana**: RHS recomienda ventana norte o este de primavera a otoño y sur u oeste en invierno (hemisferio norte); en Buenos Aires: sur o este de primavera a otoño, norte u oeste en invierno (junio-agosto). / RHS recomienda alféizar norte o este de primavera a otoño y sur u oeste en invierno: en Buenos Aires es sur o este casi todo el año y norte u oeste en invierno (junio a agosto).
- **zamioculca**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto.

## Sitios que no se pudieron abrir durante la investigación

- https://www.missouribotanicalgarden.org/PlantFinder/ (error de certificado TLS; no se usó Missouri Botanical Garden para ninguna planta)
- https://powo.science.kew.org/results?q=Nephrolepis%20exaltata (403 Forbidden)
- https://edis.ifas.ufl.edu/publication/EP480 y https://ask.ifas.ufl.edu/publication/EP480 (UF/IFAS, ZZ plant: bucle de redirecciones)
- https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/zz-plant (abre, pero sin datos de la planta)
- https://hort.extension.wisc.edu/articles/swiss-cheese-plant-monstera-deliciosa/ , /articles/zz-plant-zamioculcas-zamiifolia/ , /articles/sansevieria-2/ (404: URLs adivinadas que no existen)
- https://www.missouribotanicalgarden.org/PlantFinder/PlantFinderDetails.aspx?kempercode=b628 (error de certificado; no se usó Missouri Botanical Garden en ninguna planta)
- https://extension.umn.edu/houseplants/cacti-and-succulents (HTTP 403)
- https://extension.umn.edu/houseplants/holiday-cacti (HTTP 403)
- https://hort.extension.wisc.edu/articles/aloe-vera/ (404, URL adivinada)
- https://hort.extension.wisc.edu/articles/chinese-money-plant-pilea-peperomioides/ (404, URL adivinada)
- https://hort.extension.wisc.edu/articles/heart-leaf-philodendron-philodendron-hederaceum/ (404, URL adivinada)
- https://hort.extension.wisc.edu/articles/baby-rubber-plant-peperomia-obtusifolia/ (404, URL adivinada)
- https://hort.extension.wisc.edu/articles/holiday-cacti/ (404, URL adivinada)
- https://yardandgarden.extension.iastate.edu/how-to/care-holiday-cacti (404, URL adivinada)
- https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/chinese-money-plant (no existe la ficha: devuelve el índice general de plantas)
- https://extension.umn.edu/planting-and-growing-guides/lighting-indoor-plants (403; todo extension.umn.edu bloqueado)
- https://extension.uga.edu/publications/detail.html?number=B1318 (certificado rechazado)
- https://extension.umd.edu/resource/lighting-indoor-plants (certificado rechazado)
- https://www.missouribotanicalgarden.org/ (error de certificado)
- https://extension.missouri.edu/publications/g6515 (403)
- https://www.yourhome.gov.au/passive-design/orientation (timeout, 3 intentos)
- https://www.bom.gov.au/news-and-media/solstices-equinoxes-and-the-seasons (403)
- https://www.health.qld.gov.au/__data/assets/pdf_file/0031/1172929/understanding-suns-path.pdf (403)
- https://assets.sustainability.vic.gov.au/susvic/Guide-Energy-Smart-Housing-Manual.pdf (no resuelve DNS)
- https://www.building.govt.nz/getting-started/smarter-homes-guides/siting-and-location/house-orientation (página vacía)
- https://www3.smn.gob.ar/serviciosclimaticos/clima/archivo/invierno.pdf y www.smn.gob.ar/noticias (402)
- https://repositorio.smn.gob.ar/.../Atlas_Climático_de_Argentina.pdf (supera el tamaño máximo)
- https://extension.wvu.edu/files/d/d82924be-5fb5-480d-af6d-b1d0a23c1806/wlg-177-houseplants-digital.pdf (403)
- https://www.argentina.gob.ar/sites/default/files/manual_de_vivienda_sustentable_2.pdf (abrió, pero el texto extraído quedó fragmentado y no se usó)
- https://www.missouribotanicalgarden.org/PlantFinder/ (error de certificado en los dos intentos, incluida la ficha de Begonia rex-cultorum kempercode=b543)
- https://www.petpoisonhelpline.com/poison/peace-lily/ (404)
- https://www.petpoisonhelpline.com/poison/begonia/ (404)
- URLs adivinadas de RHS que dieron 404 (moth-orchid, peace-lily, anthurium, african-violet, begonia/houseplant growing-guide); se reemplazaron por las URLs correctas halladas por búsqueda
- https://plants.ces.ncsu.edu/plants/begonia-rex-cultorum-group/ y /begonia-rex-cultorum/ (404; se usó /begonia-rex-types/)
- https://healthtopics.vetmed.ucdavis.edu/health-topics/feline/lily-toxicity-cats (403)
- https://vcahospitals.com/know-your-pet/first-aid-for-poisoning-in-cats (404)
- https://vcahospitals.com/know-your-pet/dog-behavior-problems-destructive-chewing (404; se usó /know-your-pet/dogs-and-destructive-chewing)
- https://www.aspca.org/pet-care/animal-poison-control/poisonous-plants (404)
- https://www.petpoisonhelpline.com/poison/essential-oils-cats/ (404; se usó VCA para aceites esenciales)
- https://www.nature.com/scitable/knowledge/library/plant-resistance-against-herbivory-96675700 (redirige a login)
- https://www.uky.edu/~garose/link100.htm (error de certificado)
- https://www.fvet.uba.ar/?q=hospital (abrió, pero solo mostró el menú, sin datos de guardia)
- Fichas de ASPCA y Pet Poison Helpline con URL adivinada que dieron 404 o la página índice (day-lily, daylily, castor-bean, azaleas, tulips, daffodils): se encontraron las URL correctas y son las citadas
- https://extension.umd.edu/resource/watering-indoor-plants (certificado rechazado)
- https://extension.umd.edu/resource/overwatered-indoor-plants (certificado rechazado)
- https://extension.umn.edu/planting-and-growing-guides/watering-houseplants (403)
- https://www.rhs.org.uk/plants/types/houseplants/watering (404, URL adivinada)
- https://extension.missouri.edu/publications/g6510 (403)
- https://extension.oregonstate.edu/node/162136 (403)
- https://puyallup.wsu.edu/wp-content/uploads/sites/403/2015/03/container-drainage.pdf (404; PDF de Chalker-Scott sobre el mito del drenaje)
- https://gardenprofessors.com/container-planting-intuition-vs-reality/ (403)
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11856292/ (captcha; el mismo estudio se abrió en journals.plos.org)
- https://yardandgarden.extension.iastate.edu/how-to/how-water-indoor-plants (404, URL adivinada)
- https://plantsoilcenter.cahnr.uconn.edu/watering-houseplants (404 tras redirección)
- https://www.missouribotanicalgarden.org/PlantFinder/ (error de certificado en todas las fichas probadas, incl. taxonid=282753 Ficus lyrata)
- https://extension.umn.edu/houseplants/moth-orchids (403)
- https://edis.ifas.ufl.edu/fp119, /fr309 y /st254 (redirigen a ask.ifas.ufl.edu, que entra en bucle de redirecciones)
- https://hgic.clemson.edu/factsheet/african-violets/ (404; la correcta es /african-violet/)
- https://hgic.clemson.edu/factsheet/anthurium/ y /prayer-plant/ (404)
- https://hort.extension.wisc.edu/articles/ rubber-tree-ficus-elastica, fiddle-leaf-fig-ficus-lyrata, peace-lily-spathiphyllum, rex-begonias, rex-begonia-begonia-rex-cultorum, parlor-palm-chamaedorea-elegans, corn-plant-dracaena-fragrans (404, URLs adivinadas)
- https://www.rhs.org.uk/plants/dracaena/growing-guide, /palms/indoor/growing-guide, /ferns/indoor/growing-guide (404, URLs adivinadas)
- https://gardeningsolutions.ifas.ufl.edu/plants/ornamentals/calathea/ y .../palms-and-cycads/areca-palm/ (404)
- https://hort.extension.wisc.edu/articles/aloe-vera/ (404; URL probada a ciegas, no existe)
- https://hort.extension.wisc.edu/articles/zebra-plant-haworthia-fasciata/ (404; URL probada a ciegas)
- https://www.rhs.org.uk/plants/chlorophytum/growing-guide (404; URL probada a ciegas)
- https://extension.psu.edu/zebra-plant-as-a-houseplant (apareció en una búsqueda pero no la abrí: no se cita)
- https://hort.extension.wisc.edu/articles/root-rots-on-houseplants/ (404; se usó la misma ficha en pddc.wisc.edu)
- https://www.rhs.org.uk/plants/types/houseplants/repotting (404)
- https://extension.umd.edu/resource/potting-and-repotting-indoor-plants (certificado rechazado)
- https://extension.psu.edu/caring-for-houseplants y https://extension.psu.edu/preventing-diagnosing-and-correcting-common-houseplant-problems (abrieron, pero devolvieron un índice de artículos sin el contenido; no se citaron)
- https://extension.oregonstate.edu/gardening/techniques/botany-basics (abrió, pero es solo un índice; no se citó)
- https://www.yourhome.gov.au/passive-design/orientation (timeout otra vez)
- https://origin.cpc.ncep.noaa.gov/products/stratosphere/uv_index/uv_diurnal.shtml (no resuelve DNS; la misma página abrió en www.cpc.ncep.noaa.gov)
- https://extension.unh.edu/blog/2018/01/how-much-light-do-houseplants-need (socket hang up)
- https://www.nybg.org/blogs/plant-talk/2015/01/tip-of-the-week/houseplants-101/ (405)
- https://extension.umd.edu/resource/excess-light-indoor-plants (certificado rechazado)
- https://ucanr.edu/blog/stanislaus-sprout/article/give-indoor-plants-right-light (403)
- https://ucanr.edu/blog/garden-notes/article/here-comes-sun-what-gardeners-should-know-about-it (403, también con www)
- https://www.ucanr.edu/blog/under-solano-sun/article/caring-container-plants-during-heatwaves (403)
- https://extension.psu.edu/caring-for-houseplants (abrió, pero devolvió una página de suelos sin contenido de luz)
- INTA / SMN: no se encontró ninguna página sobre sol de tarde, balcones o marcha diaria de la temperatura
- https://www.smn.gob.ar/estadisticas (402)
- https://buenosaires.gob.ar/sites/default/files/2023-02/Cambios%20observados%20CABA%202020.pdf (404)
- https://extension.umd.edu/resource/mineral-and-fertilizer-salt-deposits-indoor-plants (certificado rechazado)
- https://extension.umd.edu/resource/self-watering-containers (certificado rechazado)
- https://extension.missouri.edu/media/wysiwyg/Extensiondata/Pub/pdf/agguides/hort/g06510.pdf (403)
- https://extension.umn.edu/news/moving-houseplants-outdoors (403)
- https://ucanr.edu/blog/stanislaus-sprout/article/houseplant-care-july-classes-uc-master-gardeners (403)

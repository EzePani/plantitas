# Para revisar a mano

Generado con `node scripts/generar-fuentes.mjs`. No editar a mano: se pisa.

Acá está todo lo que quedó con confianza baja, sin verificar o con fuentes en conflicto (168 puntos en 49 ítems). Mientras no se revise, la app aplica el criterio más conservador.

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
- [ ] **humedad**: Confianza baja.
- [ ] **fuentes en conflicto**: Luz: NC State y Penn State hablan de sol pleno a parcial; RHS recomienda luz brillante indirecta, lejos del sol directo fuerte. Se dejó sol_directo en true pero con la aclaración de correrla si el sol de verano es muy intenso.
- [ ] **fuentes en conflicto**: Familia: ASPCA la lista como Liliaceae; NC State como Asphodelaceae. Se usó Asphodelaceae.
- [ ] **fuentes en conflicto**: Humedad: solo RHS la menciona (humedad normal de casa, sin rociar); NC State y Penn State no dicen nada.

## anturio

- [ ] **toxicidad_gato / toxicidad_perro**: La ficha de ASPCA abierta ('Flamingo Flower') es de Anthurium scherzeranum, no de A. andraeanum. La especie exacta solo está respaldada por NC State; Pet Poison Helpline cubre el género. Confianza media.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/flamingo-flower
  - https://plants.ces.ncsu.edu/plants/anthurium-andraeanum/
  - https://www.petpoisonhelpline.com/poison/anthurium/
- [ ] **gravedad**: NC State dice severidad baja; se puso 'moderada' por criterio conservador (mismos síntomas por oxalatos que el espatifilo). Revisar si se prefiere 'leve'.
  - https://plants.ces.ncsu.edu/plants/anthurium-andraeanum/
- [ ] **fuentes en conflicto**: Toxicidad: la ficha de ASPCA para 'flamingo flower' corresponde a Anthurium scherzeranum, no a A. andraeanum. La especie exacta está respaldada por NC State (problema para perros y gatos) y el género por Pet Poison Helpline.
- [ ] **fuentes en conflicto**: Gravedad: NC State la clasifica como severidad baja, pero describe los mismos síntomas que ASPCA da para el espatifilo (que NC State clasifica como media). Se tomó 'moderada' por criterio conservador.
- [ ] **fuentes en conflicto**: Riego de invierno: ni RHS ni NC State dan una pauta distinta para el invierno; se mantuvo la misma regla.

## basico-1

- [ ] **calefacción que seca el aire en Buenos Aires**: Sin fuente argentina. Se quitó del borrador la frase 'aunque afuera esté húmedo' porque no se verificó el dato de humedad de Buenos Aires (las páginas del SMN sobre el clima de la ciudad devolvieron error 402).
  - https://www.rhs.org.uk/plants/types/houseplants/winter-interest-houseplants-care

## basico-2

- [ ] **que una hoja vieja se seque es normal**: Una sola fuente institucional (RHS).
  - https://www.rhs.org.uk/plants/types/houseplants/how-to-help-a-poorly-houseplant

## basico-3

- [ ] **unas cien veces más luz afuera**: Sale de Clemson (<100 vs >10.000 ft-c) y la tabla de NC State (oficina ~50, pleno sol ~10.000). Es un orden de magnitud para un día de sol pleno; junto a una ventana luminosa la diferencia es menor. Redactado como 'puede haber unas cien veces'.
  - https://hgic.clemson.edu/factsheet/indoor-plants-cleaning-fertilizing-containers-light-requirements/
  - https://content.ces.ncsu.edu/extension-gardener-handbook/18-plants-grown-in-containers

## begonia

- [ ] **especie representativa y sustrato**: Se tomó Begonia rex; B. maculata (begonia de caña) no se investigó y su cuidado puede diferir. El sustrato sale casi solo de NC State (confianza media).
  - https://plants.ces.ncsu.edu/plants/begonia-rex-types/
  - https://www.rhs.org.uk/plants/begonias/houseplants
- [ ] **fuentes en conflicto**: Se tomó Begonia rex (grupo Rex-cultorum) como la begonia de interior del catálogo; no se investigó B. maculata por separado. La ficha de ASPCA cubre todo el género (Begonia spp.).
- [ ] **fuentes en conflicto**: Tipo de oxalato: ASPCA dice oxalatos de calcio solubles; NC State dice solo 'oxalato de calcio'.
- [ ] **fuentes en conflicto**: Sustrato: la sección de RHS sobre begonias rex no nombra una mezcla; el dato sale de NC State y de la indicación general de RHS de mantener el compost húmedo pero bien drenado.
- [ ] **fuentes en conflicto**: ASPCA y NC State mencionan falla renal solo en animales de pastoreo, no en perros ni gatos; por eso no se puso advertencia grave.

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
- [ ] **humedad**: Confianza baja.
- [ ] **fuentes en conflicto**: Riego: NC State pide tierra húmeda (ni empapada ni seca) en primavera-verano y reducir cuando se forman los pimpollos; Clemson pide regar cuando el sustrato está seco al tacto en primavera-verano y mantenerlo parejo y húmedo una vez formados los pimpollos. Se tomó el criterio más conservador contra el exceso de agua en verano y el de Clemson para la etapa de pimpollos.
- [ ] **fuentes en conflicto**: Oscuridad necesaria para florecer: NC State dice al menos 13 horas; Clemson, 14 o más durante 6 semanas.
- [ ] **fuentes en conflicto**: Nombre en ASPCA: la ficha "Christmas Cactus" usa Schlumbergera bridgesii; la confirmación para S. x buckleyi viene de NC State. No se abrió una ficha específica de S. truncata.
- [ ] **fuentes en conflicto**: Humedad: solo NC State la menciona; Clemson no trata la humedad ambiente.

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
- [ ] **humedad**: Confianza baja.
- [ ] **fuentes en conflicto**: Luz: la ficha de RHS de E. elegans, NC State y UF/IFAS indican sol pleno; la guía de RHS del género recomienda luz brillante indirecta. Se eligió "mucha" con sol directo y confianza media.
- [ ] **fuentes en conflicto**: Riego de invierno: la ficha de RHS de la especie dice no regar en reposo; la guía de RHS del género dice un riego liviano cada varias semanas. Se tomó el riego mínimo.
- [ ] **fuentes en conflicto**: Toxicidad: la ficha de ASPCA "Mexican Snowballs" da el nombre científico solo a nivel género (escrito "Echevaria"); la confirmación a nivel especie viene de NC State.

## espatifilo

- [ ] **gravedad**: NC State: severidad media; FDA: suele resolverse solo. Se dejó 'moderada'.
  - https://plants.ces.ncsu.edu/plants/spathiphyllum/
  - https://www.fda.gov/animal-veterinary/animal-health-literacy/lovely-lilies-and-curious-cats-dangerous-combination
- [ ] **humedad**: Solo RHS da un nivel ('moderada'); NC State apenas menciona puntas marrones por aire seco. Confianza media.
  - https://www.rhs.org.uk/plants/peace-lilies/how-to-grow-peace-lilies
  - https://plants.ces.ncsu.edu/plants/spathiphyllum/
- [ ] **fuentes en conflicto**: Humedad: RHS dice que prefiere humedad moderada; NC State no la pide como requisito y solo menciona que el aire seco puede dar puntas marrones. Se tomó 'media'.
- [ ] **fuentes en conflicto**: Gravedad: NC State la clasifica como severidad media; la FDA dice que los síntomas suelen resolverse solos. Se tomó 'moderada' (criterio más conservador).
- [ ] **fuentes en conflicto**: Partes tóxicas: NC State nombra las hojas; ASPCA y FDA hablan de la planta en general.

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
- [ ] **fuentes en conflicto**: Toxicidad: ASPCA no tiene ficha propia de Ficus lyrata en su lista (la ficha 'Fiddle-Leaf' es un filodendro, Philodendron bipennifolium). La cubren un artículo de ASPCA de 2019 (levemente tóxica para perros y gatos), NC State y la ficha del género Ficus de Pet Poison Helpline. Confianza media.
- [ ] **fuentes en conflicto**: Principio tóxico: NC State lo atribuye a oxalatos de calcio insolubles; Pet Poison Helpline y ASPCA hablan de savia irritante.
- [ ] **fuentes en conflicto**: Riego: NC State pide tierra húmeda sin encharcar; Penn State y RHS, regar cuando se secan los primeros centímetros. Las fuentes no dan una pauta estacional clara (Penn State dice que no entra en reposo en invierno).

## filodendro

- [ ] **mascotas.gravedad / advertencia_grave**: NC State: severidad baja. Pet Poison Helpline: en casos raros, hinchazón de garganta con dificultad para respirar. Se puso "moderada" y advertencia_grave null; decidir si ese caso raro amerita advertencia.
  - https://plants.ces.ncsu.edu/plants/philodendron-hederaceum/
  - https://www.petpoisonhelpline.com/poison/philodendron/
- [ ] **sustrato**: Solo Clemson detalla el sustrato (tierra de uso general, drenaje rápido); NC State solo dice buen drenaje y húmedo. Confianza media.
  - https://hgic.clemson.edu/factsheet/philodendron/
  - https://plants.ces.ncsu.edu/plants/philodendron-hederaceum/
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
- [ ] **fuentes en conflicto**: Toxicidad: no encontré ficha de Ficus elastica en ASPCA (la ficha 'Indian Rubber Plant' corresponde a Ficus benjamina). Pet Poison Helpline tiene ficha de la especie pero habla de 'animales' sin separar gato y perro; NC State la marca como problema para gatos y perros. Confianza media.
- [ ] **fuentes en conflicto**: Balcón: NC State la da como rústica desde zona USDA 9a, pero la misma ficha y Clemson dicen que sufre por debajo de 13 °C. Se eligió el criterio conservador (no apta todo el año).

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
- [ ] **fuentes en conflicto**: Luz: RHS la clasifica como "full sun" pero aclara protegerla del sol fuerte; NC State indica media sombra / luz brillante indirecta y que el sol directo quema. Se eligió "media" sin sol directo.
- [ ] **fuentes en conflicto**: Temperatura mínima: RHS da rusticidad H2 (1 a 5 °C); NC State recomienda mantenerla arriba de 10 °C. Para el balcón se tomó el criterio más conservador.
- [ ] **fuentes en conflicto**: Toxicidad: ASPCA lista "Zebra Haworthia" como Haworthia fasciata, que no es el nombre de esta especie; la confirmación para Haworthiopsis attenuata viene solo de NC State.

## helecho-serrucho

- [ ] **familia**: NC State dice Polypodiaceae, ASPCA Dryopteridaceae; POWO (Kew) devolvió 403 y no pude confirmar la familia vigente.
  - https://plants.ces.ncsu.edu/plants/nephrolepis-exaltata/
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/boston-fern
- [ ] **toxicidad_gato / toxicidad_perro**: ASPCA solo tiene ficha del helecho de Boston (Nephrolepis exaltata bostoniensis), no tóxico. No pude confirmar qué especie exacta usa el catálogo para 'helecho serrucho' (la carpeta src/data/plantas todavía no tiene fichas), así que no lo usé en el quiz.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/boston-fern
- [ ] **fuentes en conflicto**: Familia: NC State lo ubica en Polypodiaceae y ASPCA en Dryopteridaceae; no pude abrir Kew POWO para confirmar la clasificación actual.
- [ ] **fuentes en conflicto**: La ficha de ASPCA nombra la planta como 'Nephrolepis exalta bostoniensis' (la variedad Boston de esta especie).
- [ ] **fuentes en conflicto**: Mantenimiento: NC State lo califica de bajo mantenimiento, pero ambas fuentes exigen humedad alta y tierra siempre húmeda, por eso se lo marcó como difícil en interior con calefacción (juicio propio).

## jade

- [ ] **mascotas.partes**: Ninguna fuente especifica partes tóxicas (ASPCA: principio desconocido). Queda null.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/jade-plant
  - https://www.petpoisonhelpline.com/poison/jade-plant/
- [ ] **toxicidad (nombre)**: La ficha de ASPCA usa Crassula argentea; la equivalencia con C. ovata sale de NC State ("previously Crassula argentea") y la nota de ASPCA sobre suculentas nombra a C. ovata.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/jade-plant
  - https://plants.ces.ncsu.edu/plants/crassula-ovata/
  - https://www.aspca.org/news/are-succulents-safe-have-around-pets
- [ ] **fuentes en conflicto**: Luz: Wisconsin Extension y la ficha de RHS piden sol directo o pleno; la guía de RHS Urban Show habla de luz brillante indirecta y NC State sugiere algo de sombra a la tarde. Se eligió "mucha" con tolerancia a "media".
- [ ] **fuentes en conflicto**: Nombre: la ficha de ASPCA usa Crassula argentea; NC State indica que es el nombre anterior de Crassula ovata, y la nota de ASPCA sobre suculentas nombra directamente a Crassula ovata.
- [ ] **fuentes en conflicto**: Partes tóxicas: ninguna fuente abierta las especifica (ASPCA indica principio tóxico desconocido); se dejó en null.

## kalanchoe

- [ ] **inclusión en peligrosas.json**: NO incluida. ASPCA y Pet Poison Helpline dicen que lo habitual es malestar digestivo y que el ritmo cardíaco anormal es raro (riesgo mayor con cantidades grandes). Merck describe cuadros graves pero en conejos y ratas. Si se prefiere pecar de prudente, podría sumarse como 'consulta_urgente'.
  - https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/kalanchoe
  - https://www.petpoisonhelpline.com/poison/kalanchoe/
  - https://www.merckvetmanual.com/toxicology/poisonous-plants/houseplants-and-ornamentals-toxic-to-animals

## lengua-de-suegra

- [ ] **sustrato**: Solo NC State describe el sustrato; las otras dos fuentes no lo tratan.
  - https://plants.ces.ncsu.edu/plants/dracaena-trifasciata/
- [ ] **fuentes en conflicto**: Luz: NC State la lista para media sombra con 2 a 6 horas de sol directo; Clemson recomienda evitar el sol directo fuerte. Se dejó sol_directo en false por ser lo más conservador.
- [ ] **fuentes en conflicto**: Frecuencia de riego invernal: NC State dice cada 1-2 meses; Clemson, cada 4-6 semanas.
- [ ] **fuentes en conflicto**: ASPCA la ubica en la familia Agavaceae; NC State en Asparagaceae (clasificación actual).

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

## luz-2

- [ ] **el sol del mediodía queda hacia el norte en Buenos Aires**: Ninguna fuente abierta lo dice con esas palabras para Buenos Aires. Se deduce de Museums Victoria (recorrido del sol a 38 grados sur), UNLP (mejor orientación = norte) y Level NZ. No se pudo abrir YourHome (gobierno australiano) ni BOM, que lo dicen de forma directa. Confianza media.
  - https://museumsvictoria.com.au/media/12658/seasons-activities.pdf
  - http://sedici.unlp.edu.ar/bitstream/handle/10915/150850/Documento_completo.pdf?sequence=1
- [ ] **ventana donde casi nunca da el sol = poca luz (orientación sur)**: Respaldo directo del hemisferio sur solo de Level NZ (poca o ninguna ganancia solar, menos luz); el resto es inversión de fuentes del norte (ventana norte = poco o nada de sol directo). En verano el sol sale y se pone algo hacia el sur, así que puede haber un rato de sol muy temprano o muy tarde.
  - https://www.level.org.nz/passive-design/location-orientation-and-layout/room-layout/
- [ ] **sol de mañana más suave que el de tarde**: UCANR (más fresco a la mañana, más intenso y caluroso a la tarde) y ABC Gardening Australia coinciden; las fuentes de arquitectura lo apoyan por el lado del calor. Es más una diferencia de calor acumulado que de cantidad de luz: se redactó como 'más suave y fresco'.
  - https://www.ucanr.edu/blog/over-fence-alameda-county/article/houseplants-ins-and-outs-light-and-water
  - https://www.abc.net.au/news/2020-10-23/how-to-find-the-best-light-for-indoor-plants/12769762

## luz-3

- [ ] **cambios de lugar en una o dos semanas**: Clemson dice 'gradual' sin plazo; el plazo de 1-2 semanas viene de ABC (plantas nuevas) y UCANR (al sacarlas afuera). NC State habla de 4 a 8 semanas para pasar de exterior a interior.
  - https://hgic.clemson.edu/factsheet/indoor-plants-cleaning-fertilizing-containers-light-requirements/
  - https://www.abc.net.au/news/2020-10-23/how-to-find-the-best-light-for-indoor-plants/12769762

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
- [ ] **fuentes en conflicto**: Luz: Wisconsin Extension sugiere sol directo en invierno; RHS y NC State indican luz indirecta sin sol directo. Se eligió el criterio conservador (sin sol directo).
- [ ] **fuentes en conflicto**: Riego: RHS dice dejar secar casi todo el sustrato; NC State, el cuarto o tercio superior. Se usó la regla de NC State.
- [ ] **fuentes en conflicto**: Gravedad: NC State la clasifica como severidad baja y ASPCA describe este grupo de plantas como de gravedad baja, con hinchazón de garganta solo en casos raros.

## orquidea-phalaenopsis

- [ ] **luz**: NC State dice 'poca luz', RHS dice luz brillante sin sol directo de verano. Se puso 'media' con confianza media.
  - https://plants.ces.ncsu.edu/plants/phalaenopsis/
  - https://www.rhs.org.uk/plants/phalaenopsis/growing-guide
- [ ] **fuentes en conflicto**: Luz: NC State dice que prefiere poca luz (ventana este), mientras que RHS pide luz brillante en invierno y solo evitar el sol directo en verano. Se tomó 'media' (claridad sin sol fuerte).
- [ ] **fuentes en conflicto**: Riego: ninguna de las dos fuentes menciona cubitos de hielo; ambas piden agua tibia, por eso no se recomiendan.

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
- [ ] **fuentes en conflicto**: Nombre: ASPCA la lista como Dypsis lutescens; NC State y Clemson usan Chrysalidocarpus lutescens.
- [ ] **fuentes en conflicto**: Toxicidad: ASPCA y las etiquetas de NC State la dan como no tóxica para gatos y perros, pero la sección de toxicidad de NC State menciona glucósidos cianogénicos en hojas y tallos con severidad baja (náuseas y vómitos, sin aclarar si aplica a mascotas). Se dejó 'segura' con confianza media.
- [ ] **fuentes en conflicto**: Sol: NC State dice que al exterior tolera pleno sol aunque prefiere media sombra; como planta de interior las dos fuentes piden luz indirecta, por eso sol_directo quedó en false.
- [ ] **fuentes en conflicto**: Riego de invierno: NC State no da pauta de invierno; se usó la regla general de Clemson para palmeras de interior.
- [ ] **fuentes en conflicto**: Humedad: NC State dice humedad alta; Clemson no da un requisito específico para la areca (solo la regla general de sumar humedad por debajo del 50 %).

## palmera-de-salon

- [ ] **humedad**: NC State (baja a media, tolera aire seco) vs Clemson (alta a moderada, adaptable). Se puso 'media'.
  - https://plants.ces.ncsu.edu/plants/chamaedorea-elegans/
  - https://hgic.clemson.edu/factsheet/indoor-palms/
- [ ] **fuentes en conflicto**: Humedad: NC State dice humedad baja a media y que tolera el aire seco; Clemson dice que prefiere humedad alta a moderada pero es adaptable. Se tomó 'media'.
- [ ] **fuentes en conflicto**: Riego: NC State indica dejar secar apenas entre riegos; la regla general de Clemson para palmeras dice no dejar secar la tierra del todo. Se tomó regar al secarse la superficie.
- [ ] **fuentes en conflicto**: NC State advierte que el jugo de los frutos puede irritar la piel de las personas; no afecta la clasificación para mascotas (no peligrosa según NC State y ASPCA).

## palo-de-agua

- [ ] **gravedad**: NC State: baja; artículo ASPCA 2019: moderada (género Dracaena). Se dejó 'moderada'.
  - https://plants.ces.ncsu.edu/plants/dracaena-fragrans/
  - https://www.aspca.org/news/houseplant-safe-your-pets
- [ ] **fuentes en conflicto**: Gravedad: NC State la clasifica como severidad baja; un artículo de ASPCA (2019) describe a las Dracaena como moderadamente tóxicas, con cuadros más serios en ingestas grandes. Se dejó 'moderada'.
- [ ] **fuentes en conflicto**: Riego: NC State dice mantener la tierra húmeda en época de crecimiento; Clemson, dejar secar la superficie entre riegos. Se usó la regla de Clemson, más segura contra la pudrición.

## peligrosas

- [ ] **nombres comunes en Argentina y presencia en casas y balcones**: Los nombres en español ('laurel de jardín', 'cica', 'hemerocalis') y que sean plantas comunes en Argentina no se verificaron con una fuente argentina; las fuentes veterinarias son de Estados Unidos y Reino Unido. Tampoco se afirma en los textos que sean comunes acá.
- [ ] **formato**: Se usó gravedad 'consulta_urgente' además de 'grave' (entrada 'bulbos') y se agregó un campo opcional 'no_confundir' en 'lirios' para la diferencia con espatifilo y cala. Ajustar si la app espera otro esquema.

## peperomia

- [ ] **humedad / sustrato**: La segunda fuente (RHS) es una guía del género Peperomia, no específica de P. obtusifolia; además difiere de NC State en humedad. Confianza media.
  - https://www.rhs.org.uk/plants/peperomia/how-to-grow-peperomia
  - https://plants.ces.ncsu.edu/plants/peperomia-obtusifolia/
- [ ] **fuentes en conflicto**: Humedad: NC State indica humedad relativa media a baja; la guía de RHS (del género) dice que se adaptan al aire de casa pero prefieren ambientes húmedos. Se eligió "media".
- [ ] **fuentes en conflicto**: Sustrato: la receta detallada viene de la guía de RHS, que es del género Peperomia y no específica de P. obtusifolia; NC State solo pide buen drenaje.

## pilea

- [ ] **toxicidad_gato / toxicidad_perro**: ASPCA no tiene ficha propia de Pilea peperomioides en su base (la URL probada devolvió el índice general y la búsqueda en aspca.org no encontró ficha). Se apoya en una nota de ASPCA de 2021 que la lista como no tóxica y en NC State ("safe for pets and children", sin detalle). No hay segunda fuente veterinaria. Confianza media.
  - https://www.aspca.org/news/are-succulents-safe-have-around-pets
  - https://plants.ces.ncsu.edu/plants/pilea-peperomioides/
- [ ] **humedad**: Fuentes con matices, incluso dos páginas de RHS que se contradicen (tolera aire seco vs necesita humedad alta).
  - https://www.rhs.org.uk/plants/pilea/how-to-grow-pilea
  - https://www.rhs.org.uk/plants/13015/pilea-peperomioides/details
  - https://plants.ces.ncsu.edu/plants/pilea-peperomioides/
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

## todas

- [ ] **otros_nombres**: Los nombres alternativos usados en Argentina salen de conocimiento general, no de una fuente abierta (el brief lo permite).
- [ ] **atractivo_para_mascotas**: Ninguna fuente abierta menciona si estas plantas atraen a gatos o perros; quedó "desconocido" en las 8.
- [ ] **otros_nombres**: Los nombres alternativos en español están puestos de memoria (no hay fuente argentina abierta que los respalde).
- [ ] **otros_nombres**: Los nombres alternativos salen de conocimiento general, no de fuentes abiertas (el brief lo permite). 'Cuna de Moisés' para el espatifilo es más usado en otros países que en Argentina: revisar.
- [ ] **atractivo_para_mascotas**: Ninguna fuente abierta habla de si atraen a las mascotas; quedó 'desconocido' en todas.
- [ ] **apta.balcon**: Se puso false en todas a partir de temperaturas mínimas y zonas USDA de las fuentes; no se consultó SMN ni otra fuente argentina sobre mínimas de Buenos Aires.

## violeta-africana

- [ ] **fuentes en conflicto**: Humedad: el texto de NC State dice que no tolera el aire seco, pero sus etiquetas incluyen 'tolerante al aire seco'; RHS coincide con que no le gusta el aire seco. Se tomó 'alta'.
- [ ] **fuentes en conflicto**: Luz: los atributos de NC State listan 'sombra profunda' y 'sombra parcial', mientras su texto y RHS piden luz brillante filtrada. Se tomó 'media'.
- [ ] **fuentes en conflicto**: Riego de invierno: ninguna fuente da una pauta distinta para invierno.

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

- **aloe-vera**: RHS recomienda ventana sur u oeste (hemisferio norte); en Buenos Aires equivale a ventana norte u oeste. / Penn State habla de crecimiento de principios de primavera a principios de otoño y reposo en otoño-invierno; en Buenos Aires el crecimiento va aproximadamente de septiembre a marzo y el reposo de abril a agosto.
- **anturio**: RHS recomienda ventana este u oeste, o sur con cortina (hemisferio norte); en Buenos Aires la ventana equivalente a 'sur' es la norte.
- **jade**: RHS recomienda orientación sur u oeste (hemisferio norte); en Buenos Aires equivale a ventana norte u oeste. / NC State indica reducir el riego de otoño a fines de invierno (norte); en Buenos Aires es aproximadamente de abril a agosto.
- **begonia**: RHS marca la época de abonado de mayo a septiembre (hemisferio norte); en Buenos Aires equivale a noviembre a marzo aprox. El riego reducido de invierno corresponde a junio-agosto.
- **cactus-de-navidad**: Floración: NC State indica flores en invierno del hemisferio norte (diciembre a febrero). En Buenos Aires el invierno es de junio a agosto, así que la floración esperable es aproximadamente de junio a agosto y no en Navidad. / Inducción de pimpollos: NC State y Clemson indican noches largas (13-14 h de oscuridad sin interrupción) y frescas desde mediados de septiembre, el comienzo del otoño boreal. En Buenos Aires equivale a mediados de marzo. / Clemson indica crecimiento ideal de abril a septiembre (primavera-verano boreal); en Buenos Aires es aproximadamente de octubre a marzo. / Clemson dice que el sol pleno es beneficioso en otoño e invierno y dañino en verano; en Buenos Aires el sol fuerte a evitar es el de diciembre a febrero.
- **calatea**: RHS recomienda ventana norte o este en verano y sur en invierno (hemisferio norte); en Buenos Aires se invierte: sur o este en verano (diciembre-febrero) y norte en invierno (junio-agosto). / El invierno porteño con calefacción seca el aire: es cuando más conviene sumar humedad.
- **cinta**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto.
- **echeveria**: RHS recomienda orientación sur u oeste (hemisferio norte); en Buenos Aires equivale a ventana norte u oeste. / RHS indica floración a fines de invierno y primavera; en Buenos Aires sería aproximadamente de agosto a noviembre.
- **espatifilo**: RHS da la época de crecimiento como abril a octubre (hemisferio norte); en Buenos Aires equivale más o menos a octubre a abril, y el riego reducido va de junio a agosto.
- **ficus-lyrata**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto. / El 'sol de la tarde' del que hay que protegerlo llega en Buenos Aires por ventanas oeste y norte.
- **filodendro**: Clemson sugiere ventana norte, este u oeste (hemisferio norte, donde la norte es la menos soleada); en Buenos Aires equivale a ventana sur, este u oeste.
- **gomero**: Temperaturas pasadas de °F a °C (redondeadas). / El reposo 'de otoño a fines del invierno' corresponde en Buenos Aires a marzo-agosto aproximadamente. / Clemson recomienda ventana este (sol de la mañana); vale igual en Buenos Aires porque el este no cambia de hemisferio.
- **haworthia**: RHS recomienda orientación este, sur u oeste (hemisferio norte); en Buenos Aires equivale a este, norte u oeste, siempre filtrando el sol fuerte. / NC State indica floración a fines de primavera y principios de verano; en Buenos Aires sería aproximadamente de noviembre a enero.
- **helecho-serrucho**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto. / Clemson desaconseja ventanas sur u oeste (las más soleadas en el hemisferio norte); en Buenos Aires equivale a evitar ventanas norte u oeste con sol directo.
- **lengua-de-suegra**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto.
- **monstera**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto. / RHS recomienda ventana este u oeste (hemisferio norte); en Buenos Aires una ventana este, o norte con cortina que filtre el sol.
- **orquidea-phalaenopsis**: NC State habla de ventanas al oeste o al sur con sombra (hemisferio norte); en Buenos Aires la equivalente a 'sur' es la ventana norte, que necesita cortina. Este y oeste no cambian. / RHS indica regar menos en invierno: en Buenos Aires es de junio a agosto.
- **palmera-areca**: Clemson sugiere ventanas al este, oeste o sur (hemisferio norte); en Buenos Aires la equivalente a 'sur' es la norte, con la luz filtrada. / NC State solo da la pauta de riego para la época de crecimiento, que en Buenos Aires va de primavera a otoño (octubre a abril aprox.).
- **palmera-de-salon**: NC State recomienda ventana al norte o al este (hemisferio norte, las de menos sol); en Buenos Aires equivale a ventana al sur o al este.
- **palo-de-agua**: Temperaturas pasadas de °F a °C (redondeadas). / Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto.
- **peperomia**: RHS sugiere ventana este u oeste, o alejada de una ventana sur (hemisferio norte); en Buenos Aires equivale a este u oeste, o alejada de una ventana norte. / RHS indica abonar de abril a octubre (primavera a otoño boreal); en Buenos Aires sería aproximadamente de octubre a abril.
- **pilea**: RHS indica como ideales las ventanas norte, este u oeste y pide alejarla de una ventana sur (hemisferio norte); en Buenos Aires las ideales son sur, este u oeste, y hay que alejarla de una ventana norte, sobre todo en verano. / RHS indica abonar de abril a septiembre (primavera-verano boreal); en Buenos Aires sería aproximadamente de octubre a marzo.
- **potus**: Estaciones convertidas: la época de crecimiento (primavera-verano) va de septiembre a febrero y el invierno de junio a agosto. / Las fuentes la dan como rústica solo en zonas USDA 10-12; lo traduje a 'no dejarla afuera en el invierno porteño'.
- **violeta-africana**: RHS recomienda ventana norte o este de primavera a otoño y sur u oeste en invierno (hemisferio norte); en Buenos Aires: sur o este de primavera a otoño, norte u oeste en invierno (junio-agosto).
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

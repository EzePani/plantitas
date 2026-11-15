# Plantitas 🌱

PWA de uso personal para aprender sobre plantas de interior desde cero (macetas, balcón, interior). Lecciones cortas y muy visuales, en español rioplatense, pensada para Buenos Aires (hemisferio sur).

> **Estado:** las 12 unidades y sus 49 lecciones (Familias creció con Trepadoras y colgantes, Tutores y soportes, y Plantas de flor y de hojas) están completas y con fuentes (tandas 1, 2 y 3). Catálogo de 25 plantas y recomendador por espacio con el Modelo de luz.

## Rigor del contenido

Todo el contenido educativo sale de fuentes abiertas y leídas durante la investigación (instituciones botánicas, extensión universitaria y fuentes veterinarias).

- **[SOURCES.md](SOURCES.md)**: todas las fuentes, qué se tomó de cada una y el nivel de confianza de cada lección y planta.
- `investigacion/`: las reglas de investigación y las notas crudas de cada lote.
- Los tests fallan si una lección o planta tiene menos de 2 fuentes, o si un dato de toxicidad afirmado no tiene fuente.

## Cómo correrlo

```bash
npm install
npm run dev      # desarrollo
npm test         # Vitest
npm run build    # chequeo de tipos + build de producción (genera el service worker)
npm run preview  # sirve el build, para probar la PWA instalada y offline
npm run icons    # regenera los íconos PNG desde public/favicon.svg

node scripts/unir-catalogo.mjs        # une los lotes de plantas en src/data/plants.json
node scripts/descargar-imagenes.mjs   # baja fotos de Wikimedia Commons (licencias abiertas) a public/img
node scripts/buscar-fotos.mjs "Monstera deliciosa"   # lista candidatas para elegir una foto a mano (scripts/imagenes.json)
node scripts/generar-fuentes.mjs      # regenera SOURCES.md
```

## Stack

Vite + React + TypeScript · Tailwind CSS v4 · Zustand (persist en localStorage) · Framer Motion · vite-plugin-pwa · zod · Vitest. Sin backend, sin login, sin APIs externas en runtime.

## Estructura

```
src/
  data/         todo el contenido y los textos (nada hardcodeado en componentes)
    lessons/    un JSON por unidad + esquema zod
    textos.ts   textos de interfaz · onboarding.ts · unidades.ts · gamificacion.ts
  lib/          lógica pura y testeada: perfil, luz, camino, gamificación, backup
  store/        estado global persistido (Zustand)
  components/   botones, bottom sheet, diálogo, navegación, ilustraciones SVG
  features/
    onboarding/ learn/ quiz/ profile/ spaces/ pets/
scripts/        generación de íconos (después: descarga de imágenes)
```

## Decisiones

- **Navegación sin router.** Son 4 pestañas y una lección a pantalla completa; se maneja con estado y transiciones de Framer Motion. Menos peso y se siente más app.
- **Modelo de luz por espacio.** Cada espacio guarda solo lo que el usuario ve: tipo de luz (directa / indirecta / baja / no sé), hasta 2 tramos de sol directo (desde-hasta, en horas enteras de 6 a 20) y qué lo filtra. Todo lo demás se deriva en `lib/luz.ts` y se muestra como "Estimación": horas de sol, momento del día (mañana hasta las 12, mediodía de 12 a 15, tarde desde las 15), orientación aproximada y aviso de calor. La orientación nunca se pregunta.
  - Orientación: menos de 1 h de sol → sur; 7 h o más → norte; si no, según el centro del sol respecto del mediodía solar (cerca de las 13 hs en Buenos Aires): antes de las 11:45 → este, después de las 14:15 → oeste, en el medio → norte.
  - Obstáculos: una cortina filtra el sol (la planta recibe luz indirecta brillante, sin aviso de calor); un árbol lo tamiza a la mitad; edificios y techos no restan, porque ya están reflejados en las horas que cargó el usuario. Un vidrio con sol directo dispara el aviso de calor.
  - Aviso de calor: 1,5 h o más de sol directo después de las 15, o sol directo a través de un vidrio.
  - "No sé" asume luz indirecta media y muestra la prueba de la sombra (10, 13 y 17 hs). Sol directo sin saber las horas asume 3 horas.
  - Los valores derivados se corrigen editando el espacio (no se pisan a mano uno por uno).
- **Onboarding 3a-3d.** Los obstáculos (3c) y las horas (3b) se preguntan solo si hay sol directo. "Interior" se carga como Living. Se pueden cargar hasta 2 espacios; tamaño, mascotas y dedicación arrancan con valores del perfil y se editan en "Mi espacio".
- **Luz del catálogo.** `luz_requerida` y `luz_tolerada` usan las 4 categorías del modelo. Las horas de sol directo, el sol de tarde y la sensibilidad al calor se relevaron con fuentes en una segunda pasada (`src/data/plantas/luz-verificada-*.json`, que `scripts/unir-catalogo.mjs` aplica sobre los lotes). Criterio conservador: ante fuentes que no coinciden se toma la menor cantidad de horas. Resultado: ninguna planta del catálogo quedó tolerando el sol fuerte de la tarde, y solo aloe, jade y echeveria aceptan algunas horas de sol directo en el balcón. Gomero, orquídea, violeta africana y cactus de Navidad figuran con 2 horas de sol suave de mañana (las fuentes sugieren ventana al este); la areca quedó en 0. Cuando un balcón tiene sol demasiado fuerte para todo el catálogo, la app lo dice y sugiere filtrarlo.
- **Solo lo respaldado.** La app no incluye mitos ni remedios sin respaldo: ni para desmentirlos (hielo, canela, agua oxigenada, mayonesa, cáscaras de huevo, medidores baratos, capa de piedras en el fondo) ni como consejo. Si un tema no tiene fuente confiable, se deja afuera y cada persona lo resuelve por su cuenta. Los consejos prácticos con respaldo institucional (por ejemplo "el abono no es un remedio" o "el plato no es una reserva de agua") sí quedan.
- **Migración v1 → v2** (`lib/migraciones.ts`). El horario de sol viejo se convierte en un perfil de luz equivalente (mañana → sol de 8 a 12, mediodía → 11 a 15, tarde → 14 a 18, casi todo el día → 9 a 17, casi nunca → luz baja). Los espacios guardados se convierten; si no había, se arman los del onboarding. Las lecciones conservan su progreso con el id nuevo. Perfil, XP, racha, insignias y semillas no se tocan. Vale igual para el estado guardado y para backups viejos.
- **12 unidades.** Las lecciones que ya existían se reubicaron: señales de la planta → 1.3, interior vs. jardín → 1.4, señales de luz → 2.4. Las cuatro lecciones nuevas de la tanda 1 son 1.2 (raíces), 2.3 (sol de mañana y de tarde), 3.4 (formas de regar) y 3.5 (riego según la estación). Las tres de Macetas y tierra (drenaje, sustrato, trasplante) pasaron a la unidad 4 como 4.2, 4.3 y 4.6, ajustadas al plan nuevo; el progreso de quien ya las había hecho se conserva. Una lección planificada sin contenido se ve en el camino como "Próximamente" y no traba el avance.
- **Perfiles.** Primerizo / Sobreviviente / En camino / Experimentado. "Ya sé bastante" pasa por un mini test de 3 preguntas: con 2 o más aciertos es Experimentado, si no En camino (sin mostrarle qué falló). Al Sobreviviente se le ponen primero Luz y Riego. Si la mascota muerde plantas ("siempre" o "a veces"), la Unidad 12 va primero para cualquier perfil. Con objetivo "elegir y comprar" se destacan las unidades 11 y 6.
- **Salteo.** En camino puede saltear Lo básico; Experimentado también Luz, Riego y Macetas. Test de 5 preguntas, se aprueba con 80%. Saltear no da XP, pero el cofre queda para abrir.
- **Camino lineal.** Cada unidad: lecciones → repaso → cofre. Si alguna vez se planifica una lección sin contenido, se ve como "Próximamente" y no traba el avance.
- **Enredadera.** Queda fija sobre el borde izquierdo y trepa de abajo hacia arriba según el progreso total (así "se extiende hacia arriba" y acompaña el scroll aunque el camino baje, como en Duolingo). Una hoja por nodo completado, una flor por unidad completa. Su largo sale del estado guardado.
- **Gamificación.** 20 XP por lección + 2 por acierto; repaso 10 + 2 por acierto; cofre 30. Repetir una lección solo da la XP de los aciertos. Niveles en 0 / 100 / 250 / 500 / 900 XP. La racha cuenta días con al menos una lección (fecha local).
- **Feedback inmediato.** En el quiz la respuesta se evalúa al tocar la opción, sin botón "Comprobar".
- **Backup.** JSON con `version`; se valida con zod (campos desconocidos se descartan, tamaño máximo 1 MB) y pasa por las mismas migraciones que el estado guardado. Un archivo inválido nunca toca el estado.
- **Ilustraciones propias.** Todas en SVG dentro de `components/Ilustracion.tsx`, armadas con las mismas piezas (maceta con carita, hojas, sol, gota). La mascota se llama Brote. Los íconos de interfaz son de lucide (ISC).
- **Tipografías.** Fredoka (títulos) y Nunito (texto), empaquetadas con la app para que funcione offline.
- **Base path.** `VITE_BASE` define el `base` de Vite (en GitHub Pages será `/plantitas/`).
- **Toxicidad.** Gato y perro se evalúan por separado. Solo "segura" verificada cuenta como apta: "no verificada" se trata igual que tóxica en filtros y recomendador, y con gato y perro vale el peor de los dos. El atractivo para mascotas es un campo aparte y nunca cambia la seguridad.
- **Cinta (lazo de amor).** Queda como segura (ficha de ASPCA y NC State), con confianza media, porque una nota de ASPCA menciona malestar digestivo leve.
- **Confianza general de una planta.** Es la más baja entre luz, riego y sustrato. La humedad lleva su propio nivel y su aviso: es el dato menos documentado.
- **Recomendador.** Filtros duros: mascotas, interior/balcón y luz del espacio (categoría, horas de sol directo que tolera la planta y aviso de calor). Adentro, un lugar con sol directo también admite plantas de luz indirecta brillante, avisando que hay que correrlas de la ventana; en el balcón no. Con aviso de calor, las plantas sensibles bajan y aparecen en "mejor evitar". Tamaño, dedicación y humedad (baño) ordenan. Las mascotas del paso 4 se precargan del perfil y el cambio vale solo para ese espacio. Cada espacio se guarda y se edita; las recomendaciones se calculan al abrirlo.
- **Plantas especialmente peligrosas.** `src/data/peligrosas.json` (lirios, palma sagú, adelfa, ricino, azalea, bulbos) se muestra como advertencia fija en el catálogo aunque no sean plantas del catálogo.
- **Fotos.** Vienen de Wikimedia Commons con licencia CC0, CC BY o CC BY-SA; autor, licencia y enlace quedan en `plants.json`, `credits.json` y la pantalla Créditos. Nueve se eligieron a mano (`scripts/imagenes.json`) porque el primer resultado no mostraba bien la planta.
- **Remedios para plagas y mascotas (unidad 9).** Solo entran productos con respaldo y su riesgo para mascotas: hisopo con alcohol (fuente veterinaria), jabón potásico (ficha de NPIC, no veterinaria), trampas adhesivas (siempre fuera del alcance de las mascotas) y la advertencia de piretrinas, permetrina e insecticidas sistémicos (VCA, Pet Poison Helpline, Merck). Se sacaron neem, aceites hortícolas y todos los remedios caseros.
- **Pendientes conocidos.** El JS pesa unos 282 kB gzip. Varias tarjetas reutilizan una ilustración cercana porque falta dibujar la específica (maceta funda, pasto para gatos, sombra de la mano, etc.). No hay fuentes argentinas para el cuidado de plantas de interior: las adaptaciones al hemisferio sur son conversiones propias, .

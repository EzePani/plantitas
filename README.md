# Plantitas 🌱

PWA de uso personal para aprender sobre plantas de interior desde cero (macetas, balcón, interior). Lecciones cortas y muy visuales, en español rioplatense, pensada para Buenos Aires (hemisferio sur).

> **Estado:** v1 con la tanda 1 de contenido (unidades 1, 2, 3, 5 y 8), catálogo de 25 plantas y recomendador. Las unidades 4, 6, 7 y 9 figuran como "Próximamente".

## Rigor del contenido

Todo el contenido educativo sale de fuentes abiertas y leídas durante la investigación (instituciones botánicas, extensión universitaria y fuentes veterinarias).

- **[SOURCES.md](SOURCES.md)**: todas las fuentes, qué se tomó de cada una y el nivel de confianza de cada lección y planta.
- **[VERIFY.md](VERIFY.md)**: lo que quedó con confianza baja, sin verificar o con fuentes en conflicto, para revisar a mano.
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
node scripts/generar-fuentes.mjs      # regenera SOURCES.md y VERIFY.md
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
- **La orientación nunca se pregunta.** `lib/luz.ts` la deduce de la hora en que da el sol (mañana → este/luz media, tarde → oeste/mucha, mediodía o todo el día → norte/mucha, casi nunca → sur/poca). "No sé" asume luz media y lo marca como supuesto.
- **Perfiles.** Primerizo / Sobreviviente / En camino / Experimentado. "Ya sé bastante" pasa por un mini test de 3 preguntas: con 2 o más aciertos es Experimentado, si no En camino (sin mostrarle qué falló). Al Sobreviviente se le ponen primero Luz y Riego. Si la mascota muerde plantas ("siempre" o "a veces"), la Unidad 8 va primero para cualquier perfil.
- **Salteo.** En camino puede saltear Lo básico; Experimentado también Luz, Riego y Macetas. Test de 5 preguntas, se aprueba con 80%. Saltear no da XP, pero el cofre queda para abrir.
- **Camino lineal.** Cada unidad: lecciones → repaso → cofre. Las unidades de la tanda 2 se ven como "Próximamente" y no traban el avance.
- **Enredadera.** Queda fija sobre el borde izquierdo y trepa de abajo hacia arriba según el progreso total (así "se extiende hacia arriba" y acompaña el scroll aunque el camino baje, como en Duolingo). Una hoja por nodo completado, una flor por unidad completa. Su largo sale del estado guardado.
- **Gamificación.** 20 XP por lección + 2 por acierto; repaso 10 + 2 por acierto; cofre 30. Repetir una lección solo da la XP de los aciertos. Niveles en 0 / 100 / 250 / 500 / 900 XP. La racha cuenta días con al menos una lección (fecha local).
- **Feedback inmediato.** En el quiz la respuesta se evalúa al tocar la opción, sin botón "Comprobar".
- **Backup.** JSON con `version`; se valida con zod (campos desconocidos se descartan, tamaño máximo 1 MB) y pasa por las mismas migraciones que el estado guardado. Un archivo inválido nunca toca el estado.
- **Ilustraciones propias.** Todas en SVG dentro de `components/Ilustracion.tsx`, armadas con las mismas piezas (maceta con carita, hojas, sol, gota). La mascota se llama Brote. Los íconos de interfaz son de lucide (ISC).
- **Tipografías.** Fredoka (títulos) y Nunito (texto), empaquetadas con la app para que funcione offline.
- **Base path.** `VITE_BASE` define el `base` de Vite (en GitHub Pages será `/plantitas/`).
- **Toxicidad.** Gato y perro se evalúan por separado. Solo "segura" verificada cuenta como apta: "no verificada" se trata igual que tóxica en filtros y recomendador, y con gato y perro vale el peor de los dos. El atractivo para mascotas es un campo aparte y nunca cambia la seguridad.
- **Cinta (lazo de amor).** Queda como segura (ficha de ASPCA y NC State), con confianza media, porque una nota de ASPCA menciona malestar digestivo leve. Está en VERIFY.md.
- **Confianza general de una planta.** Es la más baja entre luz, riego y sustrato. La humedad lleva su propio nivel y su aviso: es el dato menos documentado.
- **Recomendador.** Filtros duros: mascotas, interior/balcón y luz. Adentro, un lugar con mucha luz también admite plantas de luz indirecta, avisando que hay que correrlas de la ventana; en el balcón no. Tamaño, dedicación y humedad (baño) ordenan. Las mascotas del paso 4 se precargan del perfil y el cambio vale solo para ese espacio.
- **Plantas especialmente peligrosas.** `src/data/peligrosas.json` (lirios, palma sagú, adelfa, ricino, azalea, bulbos) se muestra como advertencia fija en el catálogo aunque no sean plantas del catálogo.
- **Fotos.** Vienen de Wikimedia Commons con licencia CC0, CC BY o CC BY-SA; autor, licencia y enlace quedan en `plants.json`, `credits.json` y la pantalla Créditos. Nueve se eligieron a mano (`scripts/imagenes.json`) porque el primer resultado no mostraba bien la planta.
- **Pendientes conocidos.** El JS pesa unos 225 kB gzip. Varias tarjetas reutilizan una ilustración cercana porque falta dibujar la específica (maceta funda, pasto para gatos, sombra de la mano, etc.). No hay fuentes argentinas para el cuidado de plantas de interior: las adaptaciones al hemisferio sur son conversiones propias, listadas en VERIFY.md.

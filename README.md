# Plantitas 🌱

PWA de uso personal para aprender sobre plantas de interior desde cero (macetas, balcón, interior). Lecciones cortas y muy visuales, en español rioplatense, pensada para Buenos Aires (hemisferio sur).

> **Estado:** fases 1 a 3 listas (scaffold + PWA, onboarding y perfiles, camino + lecciones + gamificación).
> El contenido de las lecciones es un **borrador sin verificar** (`"estado": "no_verificado"`, confianza baja, sin fuentes): sirve para probar el motor. El contenido verificado, el catálogo, `SOURCES.md` y `VERIFY.md` llegan en la fase 4.

## Cómo correrlo

```bash
npm install
npm run dev      # desarrollo
npm test         # Vitest
npm run build    # chequeo de tipos + build de producción (genera el service worker)
npm run preview  # sirve el build, para probar la PWA instalada y offline
npm run icons    # regenera los íconos PNG desde public/favicon.svg
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
- **Pendiente conocido.** El bundle JS pesa ~180 kB gzip; se optimiza en la fase de pulido. El test que exige 2 fuentes por lección se agrega junto con el contenido verificado (hoy el test exige que lo que no tiene fuentes esté marcado como no verificado).

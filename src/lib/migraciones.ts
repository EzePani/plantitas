/**
 * Migraciones del estado persistido. MIGRACIONES[n] lleva los datos de la versión n a la n+1.
 * Trabajan sobre datos sin tipar (vienen de localStorage o de un backup) y nunca tiran:
 * lo que no entienden lo dejan pasar, y después el esquema decide si el resultado es válido.
 */

import { hoyLocal } from './fecha'

type Obj = Record<string, unknown>
const esObj = (x: unknown): x is Obj => typeof x === 'object' && x !== null && !Array.isArray(x)

// ---------- v1 → v2: modelo de luz por espacio + 12 unidades ----------

/** Horario de sol del modelo viejo → perfil de luz equivalente del modelo nuevo */
const LUZ_V1: Record<string, Obj> = {
  manana: { tipo: 'directa', tramos: [{ desde: 8, hasta: 12 }], obstaculos: [] },
  mediodia: { tipo: 'directa', tramos: [{ desde: 11, hasta: 15 }], obstaculos: [] },
  tarde: { tipo: 'directa', tramos: [{ desde: 14, hasta: 18 }], obstaculos: [] },
  todo_el_dia: { tipo: 'directa', tramos: [{ desde: 9, hasta: 17 }], obstaculos: [] },
  // "Casi nunca da el sol" era "poca luz" en el modelo viejo: se conserva lo más prudente
  casi_nunca: { tipo: 'baja', tramos: [], obstaculos: [] },
  no_se: { tipo: 'no_se', tramos: [], obstaculos: [] },
}
const luzV1 = (hora: unknown): Obj => structuredClone(LUZ_V1[String(hora)] ?? LUZ_V1.no_se)

/** Lecciones que cambiaron de lugar al pasar de 9 a 12 unidades */
export const LECCIONES_V1: Record<string, string> = {
  'basico-2': 'basico-3', // señales de una planta sana
  'basico-3': 'basico-4', // por qué una planta de interior es distinta
  'luz-3': 'luz-4', // señales de poca o mucha luz
  'macetas-1': 'macetas-2', // macetas y drenaje
  'macetas-2': 'macetas-3', // sustrato
  'macetas-3': 'macetas-6', // trasplante
}
/** Unidades que cambiaron de id ("Plantas en agua" pasó a ser "Multiplicar tus plantas") */
export const UNIDADES_V1: Record<string, string> = { agua: 'multiplicar' }

const ESFUERZO_POR_TIEMPO: Record<string, string> = { casi_nada: 'poco', un_rato: 'medio', me_encanta: 'mucho' }
const NOMBRES: Record<string, string> = { living: 'Living', balcon: 'Balcón' }

function v1aV2(datos: unknown): unknown {
  if (!esObj(datos)) return datos
  const d: Obj = { ...datos }
  const respuestas = esObj(d.respuestas) ? { ...d.respuestas } : null
  const mascotas = esObj(d.mascotas) && typeof d.mascotas.tipo === 'string' ? d.mascotas.tipo : 'ninguna'

  // Espacios guardados: de { datos: { horaSol… }, plantas } a un perfil de luz propio
  const viejos = Array.isArray(d.espacios) ? d.espacios : []
  let espacios: unknown[] = viejos.map((e) => {
    if (!esObj(e) || !esObj(e.datos)) return e
    const x = e.datos
    return { id: e.id, nombre: e.nombre, creado: e.creado, tipo: x.tipo, luz: luzV1(x.horaSol), tamano: x.tamano, mascotas: x.mascotas, esfuerzo: x.esfuerzo }
  })

  // Si no había espacios guardados, los del onboarding se arman con lo que se respondió ahí
  if (espacios.length === 0 && respuestas && d.onboardingCompleto === true) {
    const tipos = respuestas.lugar === 'balcon' ? ['balcon'] : respuestas.lugar === 'ambos' ? ['living', 'balcon'] : ['living']
    espacios = tipos.map((tipo) => ({
      id: `${tipo}-inicial`,
      nombre: NOMBRES[tipo],
      creado: hoyLocal(),
      tipo,
      luz: luzV1(respuestas.horaSol),
      tamano: 'mediano',
      mascotas,
      esfuerzo: ESFUERZO_POR_TIEMPO[String(respuestas.tiempo)] ?? 'medio',
    }))
  }
  d.espacios = espacios

  if (respuestas) {
    delete respuestas.horaSol
    delete respuestas.abertura
    d.respuestas = respuestas
  }

  // Progreso: mismas lecciones, ids nuevos. Nada se pierde (XP, racha e insignias no cambian).
  if (esObj(d.completadas)) {
    const completadas: Obj = {}
    for (const [id, registro] of Object.entries(d.completadas)) completadas[LECCIONES_V1[id] ?? id] = registro
    d.completadas = completadas
  }
  for (const campo of ['salteadas', 'semillas']) {
    const lista = d[campo]
    if (Array.isArray(lista)) d[campo] = [...new Set(lista.map((u) => UNIDADES_V1[String(u)] ?? u))]
  }
  return d
}

// ---------- v2 → v3: plantas favoritas ----------

/** Solo agrega la lista de favoritas, vacía. Todo lo demás queda como estaba. */
function v2aV3(datos: unknown): unknown {
  if (!esObj(datos)) return datos
  return { ...datos, favoritas: Array.isArray(datos.favoritas) ? datos.favoritas : [] }
}

// ---------- v3 → v4: colecciones de plantas ----------

/** Solo agrega la lista de colecciones, vacía. Todo lo demás queda como estaba. */
function v3aV4(datos: unknown): unknown {
  if (!esObj(datos)) return datos
  return { ...datos, colecciones: Array.isArray(datos.colecciones) ? datos.colecciones : [] }
}

// ---------- v4 → v5: hijitos en seguimiento y quiz de refuerzo ----------

/** Agrega los hijitos (vacío) y el refuerzo, que arranca contando desde las lecciones ya hechas. */
function v4aV5(datos: unknown): unknown {
  if (!esObj(datos)) return datos
  const hechas = esObj(datos.completadas) ? Object.keys(datos.completadas).filter((id) => !id.startsWith('repaso-')).length : 0
  return {
    ...datos,
    hijitos: Array.isArray(datos.hijitos) ? datos.hijitos : [],
    refuerzo: esObj(datos.refuerzo) ? datos.refuerzo : { ultimo: null, leccionesAlUltimo: hechas, fallidas: [] },
  }
}

export const MIGRACIONES: Record<number, (datos: unknown) => unknown> = { 1: v1aV2, 2: v2aV3, 3: v3aV4, 4: v4aV5 }

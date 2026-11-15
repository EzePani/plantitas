import type { UnidadId } from '../../lib/tipos'
import type { Leccion, Pregunta } from './esquema'
import basico from './basico.json'
import luz from './luz.json'
import riego from './riego.json'
import mascotas from './mascotas.json'

export type { Leccion, Pregunta, Tarjeta, Fuente } from './esquema'

/**
 * Unidades con contenido cargado (tanda 1). Las de las tandas 2 y 3 se agregan acá cuando estén listas.
 * En ./pendientes hay lecciones ya verificadas de unidades que todavía no se lanzaron.
 */
export const LECCIONES: Partial<Record<UnidadId, Leccion[]>> = {
  basico: basico as Leccion[],
  luz: luz as Leccion[],
  riego: riego as Leccion[],
  mascotas: mascotas as Leccion[],
}

export const LECCIONES_POR_UNIDAD: Partial<Record<UnidadId, string[]>> = Object.fromEntries(
  Object.entries(LECCIONES).map(([u, ls]) => [u, ls.map((l) => l.id)]),
)

const POR_ID = new Map<string, Leccion>(
  Object.values(LECCIONES)
    .flat()
    .map((l) => [l.id, l]),
)

export function leccionPorId(id: string): Leccion | undefined {
  return POR_ID.get(id)
}

/** Preguntas para el repaso o el test de salteo: se toman parejo de todas las lecciones de la unidad */
export function preguntasDeUnidad(unidad: UnidadId, cantidad: number): Pregunta[] {
  const lecciones = LECCIONES[unidad] ?? []
  const out: Pregunta[] = []
  for (let ronda = 0; out.length < cantidad; ronda++) {
    let agrego = false
    for (const l of lecciones) {
      const p = l.quiz[l.quiz.length - 1 - ronda]
      if (p && out.length < cantidad) {
        out.push(p)
        agrego = true
      }
    }
    if (!agrego) break
  }
  return out
}

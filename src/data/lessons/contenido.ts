import type { UnidadId } from '../../lib/tipos'
import type { Leccion, Pregunta } from './esquema'
import basico from './basico.json'
import luz from './luz.json'
import riego from './riego.json'
import mascotas from './mascotas.json'
import macetas from './macetas.json'
import abono from './abono.json'
import familias from './familias.json'
import estaciones from './estaciones.json'
import rutina from './rutina.json'
import plagas from './plagas.json'
import multiplicar from './multiplicar.json'
import comprar from './comprar.json'

/**
 * Las 12 unidades con su contenido (tandas 1, 2 y 3).
 */
export const LECCIONES: Partial<Record<UnidadId, Leccion[]>> = {
  basico: basico as Leccion[],
  luz: luz as Leccion[],
  riego: riego as Leccion[],
  macetas: macetas as Leccion[],
  abono: abono as Leccion[],
  familias: familias as Leccion[],
  estaciones: estaciones as Leccion[],
  rutina: rutina as Leccion[],
  plagas: plagas as Leccion[],
  multiplicar: multiplicar as Leccion[],
  comprar: comprar as Leccion[],
  mascotas: mascotas as Leccion[],
}

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

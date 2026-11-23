import type { Leccion, Pregunta } from '../data/lessons/esquema'
import { diasEntre } from './fecha'
import type { DatosPersistidos, Refuerzo } from './tipos'

export const PREGUNTAS_REFUERZO = 5
/** Hace falta haber visto algo para poder reforzarlo */
const MINIMO_LECCIONES = 3
export const MAX_FALLIDAS = 60

export interface PreguntaRefuerzo {
  /** `<leccion>:<posición en su quiz>` */
  clave: string
  pregunta: Pregunta
}

export const clavePregunta = (leccionId: string, posicion: number) => `${leccionId}:${posicion}`

/** Lecciones completadas (los repasos no cuentan) */
export const leccionesHechas = (completadas: DatosPersistidos['completadas']): string[] => Object.keys(completadas).filter((id) => !id.startsWith('repaso-'))

/**
 * El refuerzo no aparece siempre al mismo ritmo: después de 2 a 4 lecciones nuevas, o de 3 a 5 días
 * sin hacerlo. El número sale de lo ya hecho, así que no cambia cada vez que se abre la app.
 */
export function umbrales(r: Refuerzo): { lecciones: number; dias: number } {
  const semilla = r.leccionesAlUltimo * 7 + (r.ultimo ? Number(r.ultimo.slice(-2)) : 0)
  return { lecciones: 2 + (semilla % 3), dias: 3 + ((semilla >> 1) % 3) }
}

export function refuerzoDisponible(d: Pick<DatosPersistidos, 'completadas' | 'refuerzo'>, hoy: string): boolean {
  const hechas = leccionesHechas(d.completadas).length
  if (hechas < MINIMO_LECCIONES) return false
  const u = umbrales(d.refuerzo)
  if (hechas - d.refuerzo.leccionesAlUltimo >= u.lecciones) return true
  return d.refuerzo.ultimo !== null && diasEntre(d.refuerzo.ultimo, hoy) >= u.dias
}

/** Mezcla sin tocar la lista original. `azar` se inyecta para poder probarlo. */
function mezclar<T>(lista: T[], azar: () => number): T[] {
  const out = [...lista]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Arma el quiz con preguntas de lecciones ya hechas: primero las que se fallaron
 * y el resto al azar, sin repetir lección mientras haya otras para elegir.
 */
export function armarRefuerzo(hechas: string[], fallidas: string[], leccionPorId: (id: string) => Leccion | undefined, azar: () => number = Math.random, cantidad = PREGUNTAS_REFUERZO): PreguntaRefuerzo[] {
  const todas: PreguntaRefuerzo[] = hechas.flatMap((id) => (leccionPorId(id)?.quiz ?? []).map((pregunta, i) => ({ clave: clavePregunta(id, i), pregunta })))
  const porClave = new Map(todas.map((p) => [p.clave, p]))
  const elegidas = mezclar(fallidas.map((c) => porClave.get(c)).filter((p): p is PreguntaRefuerzo => Boolean(p)), azar).slice(0, cantidad)
  const usadas = new Set(elegidas.map((p) => p.clave))
  const leccionesUsadas = new Set(elegidas.map((p) => p.clave.split(':')[0]))
  const resto = mezclar(todas.filter((p) => !usadas.has(p.clave)), azar)
  // Primera pasada: una pregunta por lección nueva. Segunda: lo que haga falta para completar.
  for (const pasada of [true, false]) {
    for (const p of resto) {
      if (elegidas.length >= cantidad) break
      const leccion = p.clave.split(':')[0]
      if (usadas.has(p.clave) || (pasada && leccionesUsadas.has(leccion))) continue
      elegidas.push(p)
      usadas.add(p.clave)
      leccionesUsadas.add(leccion)
    }
  }
  return mezclar(elegidas, azar)
}

/** Las falladas pasan al frente de la lista; las acertadas salen */
export function actualizarFallidas(previas: string[], falladas: string[], acertadas: string[]): string[] {
  const fuera = new Set(acertadas)
  return [...new Set([...falladas, ...previas])].filter((c) => !fuera.has(c)).slice(0, MAX_FALLIDAS)
}

import type { CategoriaLuz, Clase, Planta, Porte } from '../data/plantas/esquema'
import { esApta } from './mascotas'
import type { TipoMascota } from './tipos'

/** Todo lo que se puede filtrar en el catálogo. Listas vacías y `false` = sin filtrar por eso. */
export interface Filtros {
  mascotas: TipoMascota
  clases: Clase[]
  luz: CategoriaLuz[]
  porte: Porte[]
  facil: boolean
  conTutor: boolean
  enAgua: boolean
}

export const SIN_FILTROS: Filtros = { mascotas: 'ninguna', clases: [], luz: [], porte: [], facil: false, conTutor: false, enAgua: false }

/** Dentro de un grupo alcanza con cumplir una opción; entre grupos hay que cumplir todos */
export function pasaFiltros(p: Planta, f: Filtros): boolean {
  if (!esApta(p, f.mascotas)) return false
  if (f.clases.length && !f.clases.some((c) => p.clases.includes(c))) return false
  // "Le sirve esta luz": es la que pide o una que aguanta
  if (f.luz.length && !f.luz.some((l) => p.luz_requerida === l || p.luz_tolerada.includes(l))) return false
  if (f.porte.length && !f.porte.some((x) => p.cultivo.porte.includes(x))) return false
  if (f.facil && p.dificultad !== 'facil') return false
  if (f.conTutor && p.cultivo.tutor.recomendado === 'no') return false
  if (f.enAgua && !p.cultivo.propagacion.en_agua) return false
  return true
}

export const filtrosActivos = (f: Filtros): number =>
  (f.mascotas !== 'ninguna' ? 1 : 0) + f.clases.length + f.luz.length + f.porte.length + (f.facil ? 1 : 0) + (f.conTutor ? 1 : 0) + (f.enAgua ? 1 : 0)

/** Agrega o saca un valor de una lista de filtros */
export const alternar = <T>(lista: T[], valor: T): T[] => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor])

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/**
 * Pasa una lista de meses (1 a 12) a texto, juntando los seguidos y cruzando el fin de año:
 * [9, 10, 11, 12, 1, 2] → "septiembre a febrero"; [3, 4, 9, 10] → "marzo a abril y septiembre a octubre".
 */
export function rangoMeses(meses: number[]): string {
  const set = new Set(meses)
  if (set.size === 0) return ''
  if (set.size === 12) return 'todo el año'
  // Se arranca en un mes cuyo anterior no está, para que un tramo que cruza diciembre no quede partido
  const inicio = [...Array(12).keys()].map((i) => i + 1).find((m) => set.has(m) && !set.has(m === 1 ? 12 : m - 1))!
  const tramos: [number, number][] = []
  for (let i = 0; i < 12; i++) {
    const m = ((inicio - 1 + i) % 12) + 1
    if (!set.has(m)) continue
    const ultimo = tramos[tramos.length - 1]
    if (ultimo && (ultimo[1] % 12) + 1 === m) ultimo[1] = m
    else tramos.push([m, m])
  }
  const textos = tramos.map(([a, b]) => (a === b ? MESES[a - 1] : `${MESES[a - 1]} a ${MESES[b - 1]}`))
  return textos.length === 1 ? textos[0] : `${textos.slice(0, -1).join(', ')} y ${textos[textos.length - 1]}`
}

import type { UnidadId } from '../lib/tipos'
import entradas from './wiki.json'

/**
 * Guía rápida: fichas cortas de conceptos, siempre abiertas. Resumen lo que enseñan las lecciones
 * (no agregan datos nuevos: heredan sus fuentes) y llevan a la lección donde se profundiza.
 */
export interface Entrada {
  id: string
  termino: string
  /** otras palabras con las que alguien lo buscaría */
  sinonimos: string[]
  unidad: UnidadId
  /** definición de una oración */
  resumen: string
  /** 2 o 3 párrafos cortos, con **negrita** */
  cuerpo: string[]
  no_confundir?: string
  /** lecciones donde se profundiza; la primera es la principal */
  lecciones: string[]
  /** ids de otras entradas */
  relacionadas: string[]
}

export const WIKI = entradas as Entrada[]

const POR_ID = new Map(WIKI.map((e) => [e.id, e]))
export const entradaPorId = (id: string) => POR_ID.get(id)

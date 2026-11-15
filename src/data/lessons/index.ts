import type { UnidadId } from '../../lib/tipos'
import { UNIDADES, idsDelPlan } from '../unidades'

export type { Leccion, Pregunta, Tarjeta, Fuente } from './esquema'

/**
 * Ids de las lecciones de cada unidad. Es liviano a propósito: el contenido completo
 * (los textos de las 49 lecciones) vive en `contenido.ts` y se carga aparte, solo cuando hace falta.
 */
export const LECCIONES_POR_UNIDAD: Partial<Record<UnidadId, string[]>> = Object.fromEntries(
  (Object.keys(UNIDADES) as UnidadId[]).map((u) => [u, idsDelPlan(u)]),
)

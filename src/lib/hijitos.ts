import { diasEntre } from './fecha'
import type { Hijito } from './tipos'

/**
 * Cada cuántos días se avisa de cambiar el agua. La lección "Propagar en agua" dice una o dos veces
 * por semana: se avisa a los 4 días para que nunca pase la semana.
 */
export const DIAS_CAMBIO_AGUA = 4
export const MAX_HIJITOS = 60

export type EtapaHijito = 'enraizando' | 'con_raices' | 'en_maceta' | 'adaptandose' | 'prendida'

/** Etapas en las que ya no queda nada por seguir */
export const terminado = (e: EtapaHijito): boolean => e === 'en_maceta' || e === 'prendida'

export interface EstadoHijito {
  etapa: EtapaHijito
  /** Días desde que se cortó o separó (hasta hoy, o hasta que terminó el seguimiento) */
  dias: number
  /** Solo cortes en agua, antes de la maceta */
  tocaAgua: boolean
  /** Días que tardó en cada etapa, contados desde el inicio (null si todavía no pasó o no corresponde) */
  diasRaices: number | null
  diasMaceta: number | null
  diasPrendio: number | null
}

export function estadoHijito(crudo: Hijito, hoy: string): EstadoHijito {
  const h = normalizar(crudo)
  const separada = h.origen === 'separada'
  const etapa: EtapaHijito = separada ? (h.prendio ? 'prendida' : 'adaptandose') : h.maceta ? 'en_maceta' : h.raices ? 'con_raices' : 'enraizando'
  const desde = (f: string | null) => (f ? Math.max(0, diasEntre(h.inicio, f)) : null)
  return {
    etapa,
    dias: Math.max(0, diasEntre(h.inicio, h.maceta ?? h.prendio ?? hoy)),
    tocaAgua: h.medio === 'agua' && !h.maceta && diasEntre(h.agua, hoy) >= DIAS_CAMBIO_AGUA,
    diasRaices: desde(h.raices),
    diasMaceta: desde(h.maceta),
    diasPrendio: desde(h.prendio),
  }
}

export type FechasHijito = Pick<Hijito, 'inicio' | 'raices' | 'maceta' | 'prendio'>
/** Lo que se puede corregir a mano: el tipo, dónde está y las fechas */
export type CorreccionHijito = FechasHijito & Pick<Hijito, 'origen' | 'medio'>
export type ErrorFechas = 'formato' | 'futuro' | 'orden'

/** Deja solo los datos que corresponden al tipo: una separada va en tierra y sin raíces ni maceta; un corte no "prende" */
export function normalizar<T extends CorreccionHijito>(h: T): T {
  return h.origen === 'separada' ? { ...h, medio: 'tierra', raices: null, maceta: null } : { ...h, prendio: null }
}

const ES_FECHA = /^\d{4}-\d{2}-\d{2}$/

/** Las fechas tienen que ir en orden (inicio ≤ raíces ≤ maceta, o inicio ≤ prendió) y ninguna puede ser posterior a hoy */
export function errorDeFechas(f: FechasHijito, hoy: string): ErrorFechas | null {
  const puestas = [f.inicio, f.raices, f.maceta, f.prendio].filter((x): x is string => x !== null)
  if (puestas.some((x) => !ES_FECHA.test(x) || Number.isNaN(Date.parse(x)))) return 'formato'
  if (puestas.some((x) => x > hoy)) return 'futuro'
  if (puestas.some((x, i) => i > 0 && x < puestas[i - 1])) return 'orden'
  return null
}

/** Aplica una corrección hecha a mano. El último cambio de agua nunca queda antes del inicio. Si las fechas no son válidas, no cambia nada. */
export function aplicarCorreccion(h: Hijito, c: CorreccionHijito, hoy: string): Hijito {
  const { origen, medio, inicio, raices, maceta, prendio } = normalizar(c)
  if (errorDeFechas({ inicio, raices, maceta, prendio }, hoy)) return h
  return { ...h, origen, medio, inicio, raices, maceta, prendio, agua: h.agua < inicio ? inicio : h.agua }
}

/** Primero los que piden algo hoy, después los que siguen en camino y al final los terminados */
export function ordenarHijitos(hijitos: Hijito[], hoy: string): Hijito[] {
  const peso = (h: Hijito) => {
    const e = estadoHijito(h, hoy)
    return terminado(e.etapa) ? 2 : e.tocaAgua ? 0 : 1
  }
  return [...hijitos].sort((a, b) => peso(a) - peso(b) || b.inicio.localeCompare(a.inicio))
}

/** Cuántos hijitos necesitan agua nueva hoy */
export const hijitosConAviso = (hijitos: Hijito[], hoy: string): number => hijitos.filter((h) => estadoHijito(h, hoy).tocaAgua).length

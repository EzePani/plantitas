import { diasEntre } from './fecha'
import type { Hijito } from './tipos'

/**
 * Cada cuántos días se avisa de cambiar el agua. La lección "Propagar en agua" dice una o dos veces
 * por semana: se avisa a los 4 días para que nunca pase la semana.
 */
export const DIAS_CAMBIO_AGUA = 4
export const MAX_HIJITOS = 60

export type EtapaHijito = 'enraizando' | 'con_raices' | 'en_maceta'

export interface EstadoHijito {
  etapa: EtapaHijito
  /** Días desde que se puso a enraizar (hasta hoy, o hasta que pasó a maceta) */
  dias: number
  /** Solo en agua y antes de la maceta */
  tocaAgua: boolean
  /** Días que tardó en echar raíces y en pasar a maceta, contados desde el inicio (null si todavía no pasó) */
  diasRaices: number | null
  diasMaceta: number | null
}

export function estadoHijito(h: Hijito, hoy: string): EstadoHijito {
  const etapa: EtapaHijito = h.maceta ? 'en_maceta' : h.raices ? 'con_raices' : 'enraizando'
  return {
    etapa,
    dias: Math.max(0, diasEntre(h.inicio, h.maceta ?? hoy)),
    tocaAgua: h.medio === 'agua' && !h.maceta && diasEntre(h.agua, hoy) >= DIAS_CAMBIO_AGUA,
    diasRaices: h.raices ? Math.max(0, diasEntre(h.inicio, h.raices)) : null,
    diasMaceta: h.maceta ? Math.max(0, diasEntre(h.inicio, h.maceta)) : null,
  }
}

export type FechasHijito = Pick<Hijito, 'inicio' | 'raices' | 'maceta'>
export type ErrorFechas = 'formato' | 'futuro' | 'orden'

const ES_FECHA = /^\d{4}-\d{2}-\d{2}$/

/** Las fechas tienen que ir en orden (inicio ≤ raíces ≤ maceta) y ninguna puede ser posterior a hoy */
export function errorDeFechas(f: FechasHijito, hoy: string): ErrorFechas | null {
  const puestas = [f.inicio, f.raices, f.maceta].filter((x): x is string => x !== null)
  if (puestas.some((x) => !ES_FECHA.test(x) || Number.isNaN(Date.parse(x)))) return 'formato'
  if (puestas.some((x) => x > hoy)) return 'futuro'
  if (puestas.some((x, i) => i > 0 && x < puestas[i - 1])) return 'orden'
  return null
}

/** Aplica fechas corregidas a mano. El último cambio de agua nunca queda antes del inicio. Si no son válidas, no cambia nada. */
export function corregirFechas(h: Hijito, f: FechasHijito, hoy: string): Hijito {
  if (errorDeFechas(f, hoy)) return h
  return { ...h, inicio: f.inicio, raices: f.raices, maceta: f.maceta, agua: h.agua < f.inicio ? f.inicio : h.agua }
}

/** Primero los que piden algo hoy, después los que siguen enraizando y al final los que ya están en maceta */
export function ordenarHijitos(hijitos: Hijito[], hoy: string): Hijito[] {
  const peso = (h: Hijito) => {
    const e = estadoHijito(h, hoy)
    return e.etapa === 'en_maceta' ? 2 : e.tocaAgua ? 0 : 1
  }
  return [...hijitos].sort((a, b) => peso(a) - peso(b) || b.inicio.localeCompare(a.inicio))
}

/** Cuántos hijitos necesitan agua nueva hoy */
export const hijitosConAviso = (hijitos: Hijito[], hoy: string): number => hijitos.filter((h) => estadoHijito(h, hoy).tocaAgua).length

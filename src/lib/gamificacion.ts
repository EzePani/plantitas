import { diasEntre } from './fecha'
import type { DatosPersistidos, Racha, UnidadId } from './tipos'

export const XP_POR_ACIERTO = 2
export const XP_REPASO = 10
export const XP_COFRE = 30

/** XP mínima de cada nivel (Semilla → Brote → Plantín → Planta → Jardín) */
export const UMBRALES_NIVEL = [0, 100, 250, 500, 900]

export interface InfoNivel {
  indice: number
  xpMin: number
  /** null en el último nivel */
  xpSiguiente: number | null
  /** 0..1 dentro del nivel actual */
  progreso: number
}

export function nivelPara(xp: number): InfoNivel {
  let indice = 0
  for (let i = 0; i < UMBRALES_NIVEL.length; i++) if (xp >= UMBRALES_NIVEL[i]) indice = i
  const xpMin = UMBRALES_NIVEL[indice]
  const xpSiguiente = UMBRALES_NIVEL[indice + 1] ?? null
  const progreso = xpSiguiente === null ? 1 : (xp - xpMin) / (xpSiguiente - xpMin)
  return { indice, xpMin, xpSiguiente, progreso }
}

export function xpDeLeccion(xpBase: number, aciertos: number): number {
  return xpBase + Math.max(0, aciertos) * XP_POR_ACIERTO
}

/** Nueva racha después de completar una lección hoy */
export function sumarARacha(racha: Racha, hoy: string): Racha {
  if (racha.ultima === hoy) return racha
  if (racha.ultima && diasEntre(racha.ultima, hoy) === 1) {
    return { dias: racha.dias + 1, ultima: hoy }
  }
  return { dias: 1, ultima: hoy }
}

/** Días de racha a mostrar: si pasó más de un día sin lecciones, se cortó */
export function rachaVigente(racha: Racha, hoy: string): number {
  if (!racha.ultima) return 0
  return diasEntre(racha.ultima, hoy) <= 1 ? racha.dias : 0
}

export function metaDeHoyCumplida(racha: Racha, hoy: string): boolean {
  return racha.ultima === hoy
}

export type InsigniaId =
  | 'primera-leccion'
  | 'racha-3'
  | 'racha-7'
  | 'experto-riego'
  | 'modulo-completo'
  | 'puntaje-perfecto'
  | 'primer-cofre'

export interface ContextoInsignias {
  /** ids de lección por unidad disponible */
  leccionesPorUnidad: Partial<Record<UnidadId, string[]>>
}

type Progreso = Pick<DatosPersistidos, 'completadas' | 'racha' | 'semillas' | 'salteadas'>

export function unidadCompleta(
  unidad: UnidadId,
  progreso: Pick<DatosPersistidos, 'completadas'>,
  ctx: ContextoInsignias,
): boolean {
  const ids = ctx.leccionesPorUnidad[unidad]
  if (!ids || ids.length === 0) return false
  return ids.every((id) => progreso.completadas[id])
}

/** Insignias que corresponden al estado actual (las ya ganadas nunca se pierden) */
export function insigniasMerecidas(p: Progreso, ctx: ContextoInsignias): InsigniaId[] {
  const out: InsigniaId[] = []
  const registros = Object.entries(p.completadas)
  const lecciones = registros.filter(([id]) => !id.startsWith('repaso-'))
  if (lecciones.length >= 1) out.push('primera-leccion')
  if (p.racha.dias >= 3) out.push('racha-3')
  if (p.racha.dias >= 7) out.push('racha-7')
  if (unidadCompleta('riego', p, ctx)) out.push('experto-riego')
  const unidades = Object.keys(ctx.leccionesPorUnidad) as UnidadId[]
  if (unidades.some((u) => unidadCompleta(u, p, ctx))) out.push('modulo-completo')
  if (registros.some(([, r]) => r.total > 0 && r.aciertos === r.total)) out.push('puntaje-perfecto')
  if (p.semillas.length >= 1) out.push('primer-cofre')
  return out
}

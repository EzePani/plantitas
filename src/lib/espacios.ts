import { lugarDe } from './plano'
import type { Espacio, PlantaEnEspacio } from './tipos'

/** Tope de plantas anotadas en un mismo espacio */
export const MAX_PLANTAS_ESPACIO = 100

/** Suma una planta del catálogo al espacio (en un lugar del plano, o sin ubicar). Se puede repetir. */
export function agregarPlanta(e: Espacio, plantaId: string, id: string, lugar?: string | null): Espacio {
  if (e.plantas.length >= MAX_PLANTAS_ESPACIO) return e
  return { ...e, plantas: [...e.plantas, { id, plantaId, ...(lugar && { lugar }) }] }
}

/** Posición de la última planta de ese tipo que está en `lugar` (null = sin ubicar) */
const ultimaEn = (e: Espacio, plantaId: string, lugar: string | null) => e.plantas.findLastIndex((p) => p.plantaId === plantaId && lugarDe(e, p) === lugar)

/**
 * Saca una sola planta de ese tipo. Con `lugar`, de ese lugar (null = sin ubicar);
 * sin él, primero una sin ubicar y si no la última que se agregó.
 */
export function quitarPlanta(e: Espacio, plantaId: string, lugar?: string | null): Espacio {
  let i = ultimaEn(e, plantaId, lugar ?? null)
  if (i < 0 && lugar === undefined) i = e.plantas.findLastIndex((p) => p.plantaId === plantaId)
  return i < 0 ? e : { ...e, plantas: e.plantas.filter((_, n) => n !== i) }
}

/** Cambia de lugar una planta (null = sin ubicar), sin crear ni borrar ninguna */
export function moverPlanta(e: Espacio, plantaId: string, desde: string | null, hacia: string | null): Espacio {
  const i = ultimaEn(e, plantaId, desde)
  if (i < 0) return e
  return {
    ...e,
    plantas: e.plantas.map((p, n) => (n !== i ? p : hacia ? { ...p, lugar: hacia } : { id: p.id, plantaId: p.plantaId })),
  }
}

export interface GrupoPlantas {
  plantaId: string
  cantidad: number
}

/** Las plantas del espacio agrupadas por tipo ("Potus ×2"), en el orden en que se agregaron */
export function agruparPlantas(plantas: PlantaEnEspacio[]): GrupoPlantas[] {
  const grupos = new Map<string, number>()
  for (const p of plantas) grupos.set(p.plantaId, (grupos.get(p.plantaId) ?? 0) + 1)
  return [...grupos].map(([plantaId, cantidad]) => ({ plantaId, cantidad }))
}

/** Al sincronizar, las plantas de un mismo espacio se juntan por id: no se pierde ninguna ni se duplica */
export function unirPlantas(a: PlantaEnEspacio[], b: PlantaEnEspacio[]): PlantaEnEspacio[] {
  const ids = new Set(a.map((p) => p.id))
  return [...a, ...b.filter((p) => !ids.has(p.id))].slice(0, MAX_PLANTAS_ESPACIO)
}

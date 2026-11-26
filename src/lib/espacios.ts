import type { Espacio, PlantaEnEspacio } from './tipos'

/** Tope de plantas anotadas en un mismo espacio */
export const MAX_PLANTAS_ESPACIO = 100

/** Suma una planta del catálogo al espacio. Se puede repetir (dos potus son dos plantas). */
export function agregarPlanta(e: Espacio, plantaId: string, id: string): Espacio {
  if (e.plantas.length >= MAX_PLANTAS_ESPACIO) return e
  return { ...e, plantas: [...e.plantas, { id, plantaId }] }
}

/** Saca una sola planta de ese tipo: la última que se agregó */
export function quitarPlanta(e: Espacio, plantaId: string): Espacio {
  const i = e.plantas.findLastIndex((p) => p.plantaId === plantaId)
  return i < 0 ? e : { ...e, plantas: e.plantas.filter((_, n) => n !== i) }
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

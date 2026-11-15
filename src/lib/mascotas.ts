import type { Planta, Toxicidad } from '../data/plantas/esquema'
import type { TipoMascota } from './tipos'

export type Especie = 'gato' | 'perro'

export function especiesDe(tipo: TipoMascota): Especie[] {
  if (tipo === 'gato') return ['gato']
  if (tipo === 'perro') return ['perro']
  if (tipo === 'ambos') return ['gato', 'perro']
  return []
}

export function toxicidadPara(p: Pick<Planta, 'mascotas'>, especie: Especie): Toxicidad {
  return especie === 'gato' ? p.mascotas.toxicidad_gato : p.mascotas.toxicidad_perro
}

const PEOR: Record<Toxicidad, number> = { segura: 0, no_verificada: 1, toxica: 2 }

/**
 * Estado de una planta para las mascotas de la casa, con el criterio más estricto:
 * si hay gato y perro, vale el peor de los dos. Sin mascotas devuelve null.
 * Nunca se deduce del atractivo: solo de los campos de toxicidad.
 */
export function seguridadPara(p: Pick<Planta, 'mascotas'>, tipo: TipoMascota): Toxicidad | null {
  const especies = especiesDe(tipo)
  if (especies.length === 0) return null
  return especies.map((e) => toxicidadPara(p, e)).reduce((a, b) => (PEOR[b] > PEOR[a] ? b : a))
}

/** Solo "segura" verificada cuenta como apta. "no_verificada" se trata igual que tóxica. */
export function esApta(p: Pick<Planta, 'mascotas'>, tipo: TipoMascota): boolean {
  const s = seguridadPara(p, tipo)
  return s === null || s === 'segura'
}

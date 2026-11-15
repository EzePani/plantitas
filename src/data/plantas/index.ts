import plantas from '../plants.json'
import peligrosas from '../peligrosas.json'
import type { Fuente } from '../lessons'
import type { Planta } from './esquema'

export type { Planta, NivelLuz, Toxicidad } from './esquema'

export const PLANTAS = plantas as Planta[]

const POR_ID = new Map(PLANTAS.map((p) => [p.id, p]))
export const plantaPorId = (id: string) => POR_ID.get(id)

/** Plantas especialmente peligrosas: se muestran como advertencia fija, estén o no en el catálogo */
export interface Peligrosa {
  id: string
  nombre: string
  nombre_cientifico: string
  afecta: ('gato' | 'perro')[]
  gravedad: 'leve' | 'moderada' | 'grave' | 'consulta_urgente'
  partes: string
  que_pasa: string
  advertencia: string
  /** aclaración sobre plantas de nombre parecido que no son lo mismo */
  no_confundir?: string
  fuentes: Fuente[]
  confianza: 'alta' | 'media' | 'baja'
}

export const PELIGROSAS = peligrosas as Peligrosa[]

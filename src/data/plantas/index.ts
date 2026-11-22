import plantas from '../plants.json'
import peligrosas from '../peligrosas.json'
import type { Fuente } from '../lessons'
import clases from './clases.json'
import cultivoA from './cultivo-a.json'
import cultivoB from './cultivo-b.json'
import cultivoC from './cultivo-c.json'
import fotosUno from './fotos-uno.json'
import fotosDos from './fotos-dos.json'
import type { Clase, Cultivo, FotoExtra, Planta } from './esquema'

export type { Planta, CategoriaLuz, Toxicidad, Clase, Cultivo, Porte, MetodoPropagacion, FotoExtra } from './esquema'

// plants.json trae los cuidados y la toxicidad. La clasificación, el cultivo (porte, tutor, poda,
// propagación) y las fotos extra se cargan en archivos aparte, por id de planta, y se unen acá.
const CLASES = clases as Record<string, Clase[]>
const CULTIVO = { ...cultivoA, ...cultivoB, ...cultivoC } as Record<string, Cultivo>
const FOTOS = { ...fotosUno, ...fotosDos } as Record<string, FotoExtra[]>

export const PLANTAS = (plantas as Omit<Planta, 'clases' | 'cultivo' | 'fotos_extra'>[]).map((p) => ({
  ...p,
  clases: CLASES[p.id],
  cultivo: CULTIVO[p.id],
  fotos_extra: FOTOS[p.id] ?? [],
})) as Planta[]

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

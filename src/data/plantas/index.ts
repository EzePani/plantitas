import plantas from '../plants.json'
import peligrosas from '../peligrosas.json'
import type { Fuente } from '../lessons'
import clases from './clases.json'
import cultivoA from './cultivo-a.json'
import cultivoB from './cultivo-b.json'
import cultivoC from './cultivo-c.json'
import cultivoD from './cultivo-d.json'
import cultivoE from './cultivo-e.json'
import cultivoF from './cultivo-f.json'
import cultivoG from './cultivo-g.json'
import cultivoH from './cultivo-h.json'
import cultivoI from './cultivo-i.json'
import cultivoJ from './cultivo-j.json'
import cultivoK from './cultivo-k.json'
import cultivoL from './cultivo-l.json'
import cultivoM from './cultivo-m.json'
import cultivoN from './cultivo-n.json'
import cultivoO from './cultivo-o.json'
import cultivoP from './cultivo-p.json'
import cultivoQ from './cultivo-q.json'
import fotosUno from './fotos-uno.json'
import fotosDos from './fotos-dos.json'
import fotosD from './fotos-d.json'
import fotosE from './fotos-e.json'
import fotosF from './fotos-f.json'
import fotosG from './fotos-g.json'
import fotosH from './fotos-h.json'
import fotosI from './fotos-i.json'
import fotosJ from './fotos-j.json'
import fotosK from './fotos-k.json'
import fotosL from './fotos-l.json'
import fotosM from './fotos-m.json'
import fotosN from './fotos-n.json'
import fotosO from './fotos-o.json'
import fotosP from './fotos-p.json'
import fotosQ from './fotos-q.json'
import type { Clase, Cultivo, FotoExtra, Planta } from './esquema'

export type { Planta, CategoriaLuz, Toxicidad, Clase, Cultivo, Porte, MetodoPropagacion, FotoExtra } from './esquema'

// plants.json trae los cuidados y la toxicidad. La clasificación, el cultivo (porte, tutor, poda,
// propagación) y las fotos extra se cargan en archivos aparte, por id de planta, y se unen acá.
const CLASES = clases as Record<string, Clase[]>
const CULTIVO = { ...cultivoA, ...cultivoB, ...cultivoC, ...cultivoD, ...cultivoE, ...cultivoF, ...cultivoG, ...cultivoH, ...cultivoI, ...cultivoJ, ...cultivoK, ...cultivoL, ...cultivoM, ...cultivoN, ...cultivoO, ...cultivoP, ...cultivoQ } as Record<string, Cultivo>
const FOTOS = { ...fotosUno, ...fotosDos, ...fotosD, ...fotosE, ...fotosF, ...fotosG, ...fotosH, ...fotosI, ...fotosJ, ...fotosK, ...fotosL, ...fotosM, ...fotosN, ...fotosO, ...fotosP, ...fotosQ } as Record<string, FotoExtra[]>

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

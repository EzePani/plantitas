import type { ElementoPlano, Espacio, Plano, PlantaEnEspacio, TipoElemento } from './tipos'

export const LADO = 6
export const CELDAS = LADO * LADO
export const TIPOS_ELEMENTO: TipoElemento[] = ['ventana', 'puerta', 'mesa', 'mueble', 'estante', 'gancho']

export type Forma = 'rectangulo' | 'l' | 'u'
export const FORMAS: Forma[] = ['rectangulo', 'l', 'u']

const fila = (c: number) => Math.floor(c / LADO)
const columna = (c: number) => c % LADO
const TODAS = Array.from({ length: CELDAS }, (_, c) => c)

/** Piso de cada forma base. La L recorta el cuarto de abajo a la derecha; la U, el centro de arriba. */
export function sueloDe(forma: Forma): number[] {
  if (forma === 'l') return TODAS.filter((c) => !(fila(c) >= 3 && columna(c) >= 3))
  if (forma === 'u') return TODAS.filter((c) => !(fila(c) < 3 && (columna(c) === 2 || columna(c) === 3)))
  return TODAS
}

/** Qué forma base es este piso, si no se lo retocó */
export const formaDe = (suelo: number[]): Forma | null => FORMAS.find((f) => sueloDe(f).join() === [...suelo].sort((a, b) => a - b).join()) ?? null

/** Una celda del piso está contra una pared si de algún lado no sigue el piso */
export function contraPared(suelo: number[], c: number): boolean {
  const vecinas = [fila(c) > 0 ? c - LADO : -1, fila(c) < LADO - 1 ? c + LADO : -1, columna(c) > 0 ? c - 1 : -1, columna(c) < LADO - 1 ? c + 1 : -1]
  return vecinas.some((v) => !suelo.includes(v))
}

/** La ventana y la puerta son parte de la pared */
export const vaEnPared = (t: TipoElemento): boolean => t === 'ventana' || t === 'puerta'
export const llevaPlantas = (t: TipoElemento): boolean => t !== 'puerta'

/** Cambia el piso y saca los elementos que quedaron afuera (o lejos de la pared, si son de pared) */
export function conSuelo(p: Plano, suelo: number[]): Plano {
  const orden = [...suelo].sort((a, b) => a - b)
  return { suelo: orden, elementos: p.elementos.filter((e) => orden.includes(e.celda) && (!vaEnPared(e.tipo) || contraPared(orden, e.celda))) }
}

/** Suma o saca un cuadradito del piso. Siempre queda al menos uno. */
export function alternarSuelo(p: Plano, c: number): Plano {
  if (!p.suelo.includes(c)) return conSuelo(p, [...p.suelo, c])
  return p.suelo.length > 1 ? conSuelo(p, p.suelo.filter((x) => x !== c)) : p
}

/**
 * Tocar una celda con un elemento elegido: si está ocupada, lo quita; si está libre, lo pone.
 * Devuelve null si ese elemento no puede ir ahí (ventana o puerta lejos de la pared).
 */
export function tocarElemento(p: Plano, c: number, tipo: TipoElemento, id: string): Plano | null {
  if (p.elementos.some((e) => e.celda === c)) return { ...p, elementos: p.elementos.filter((e) => e.celda !== c) }
  if (!p.suelo.includes(c) || (vaEnPared(tipo) && !contraPared(p.suelo, c))) return null
  return { ...p, elementos: [...p.elementos, { id, tipo, celda: c }] }
}

export const lugarPiso = (c: number): string => `piso-${c}`

/** El lugar admite plantas: un elemento que no sea la puerta, o un cuadradito de piso libre */
export function lugarValido(p: Plano | undefined, lugar: string): boolean {
  if (!p) return false
  if (p.elementos.some((e) => e.id === lugar && llevaPlantas(e.tipo))) return true
  return p.suelo.some((c) => lugarPiso(c) === lugar && !p.elementos.some((e) => e.celda === c))
}

/** Dónde está una planta; null si está sin ubicar (o su lugar ya no existe) */
export const lugarDe = (e: Espacio, p: PlantaEnEspacio): string | null => (p.lugar && lugarValido(e.plano, p.lugar) ? p.lugar : null)

export const plantasEn = (e: Espacio, lugar: string | null): PlantaEnEspacio[] => e.plantas.filter((p) => lugarDe(e, p) === lugar)

/** Guarda (o quita) el plano. Las plantas cuyo lugar desapareció quedan sin ubicar. */
export function ponerPlano(e: Espacio, plano: Plano | undefined): Espacio {
  const nuevo: Espacio = { ...e, plano }
  if (!plano) delete nuevo.plano
  nuevo.plantas = e.plantas.map(({ lugar, ...p }) => (lugar && lugarValido(plano, lugar) ? { ...p, lugar } : p))
  return nuevo
}

/** Número para distinguir dos elementos iguales ("Estante 2"), en orden de lectura; null si es el único */
export function numeroDe(p: Plano, el: ElementoPlano): number | null {
  const iguales = p.elementos.filter((x) => x.tipo === el.tipo).sort((a, b) => a.celda - b.celda)
  return iguales.length > 1 ? iguales.findIndex((x) => x.id === el.id) + 1 : null
}

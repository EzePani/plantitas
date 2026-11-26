import type { ElementoPlano, Espacio, Plano, PlantaEnEspacio, TipoElemento } from './tipos'

export const LADO = 6
export const CELDAS = LADO * LADO
/** Referencias del espacio: sirven para ubicarse, van en la pared y no llevan plantas */
export const REFERENCIAS: TipoElemento[] = ['ventana', 'puerta']
/** Lugares donde se pueden poner plantas (además del piso, que es todo cuadradito libre) */
export const LUGARES: TipoElemento[] = ['mesa', 'mueble', 'estante', 'gancho']

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

export const esReferencia = (t: TipoElemento): boolean => REFERENCIAS.includes(t)

export const elementoEn = (p: Plano, c: number): ElementoPlano | undefined => p.elementos.find((e) => e.celdas.includes(c))

const reemplazar = (p: Plano, nuevo: ElementoPlano): Plano => ({ ...p, elementos: p.elementos.map((e) => (e.id === nuevo.id ? nuevo : e)) })

/** Un elemento de ese tipo puede ocupar el cuadradito: es piso, está libre y, si es puerta o ventana, da a una pared */
export const puedeIr = (p: Plano, tipo: TipoElemento, c: number): boolean => p.suelo.includes(c) && !elementoEn(p, c) && (!esReferencia(tipo) || contraPared(p.suelo, c))

/** Cambia el piso. Cada elemento pierde los cuadraditos que ya no le sirven, y se va si no le queda ninguno. */
export function conSuelo(p: Plano, suelo: number[]): Plano {
  const orden = [...suelo].sort((a, b) => a - b)
  const elementos = p.elementos
    .map((e) => ({ ...e, celdas: e.celdas.filter((c) => orden.includes(c) && (!esReferencia(e.tipo) || contraPared(orden, c))) }))
    .filter((e) => e.celdas.length > 0)
  return { suelo: orden, elementos }
}

/** Suma o saca un cuadradito del piso. Siempre queda al menos uno. */
export function alternarSuelo(p: Plano, c: number): Plano {
  if (!p.suelo.includes(c)) return conSuelo(p, [...p.suelo, c])
  return p.suelo.length > 1 ? conSuelo(p, p.suelo.filter((x) => x !== c)) : p
}

/** Empieza un elemento todavía sin cuadraditos: se le van tildando con `alternarCelda` */
export const nuevoElemento = (p: Plano, tipo: TipoElemento, id: string): Plano => ({ ...p, elementos: [...p.elementos, { id, tipo, celdas: [] }] })

export type ErrorCelda = 'pared' | 'ocupado'

/** Tilda o destilda un cuadradito de un elemento. Si no se puede tildar, dice por qué. */
export function alternarCelda(p: Plano, id: string, c: number): Plano | ErrorCelda {
  const e = p.elementos.find((x) => x.id === id)
  if (!e) return p
  if (e.celdas.includes(c)) return reemplazar(p, { ...e, celdas: e.celdas.filter((x) => x !== c) })
  if (!p.suelo.includes(c) || elementoEn(p, c)) return 'ocupado'
  if (!puedeIr(p, e.tipo, c)) return 'pared'
  return reemplazar(p, { ...e, celdas: [...e.celdas, c].sort((a, b) => a - b) })
}

export const quitarElemento = (p: Plano, id: string): Plano => ({ ...p, elementos: p.elementos.filter((e) => e.id !== id) })

export function renombrar(p: Plano, id: string, nombre: string): Plano {
  const e = p.elementos.find((x) => x.id === id)
  return e ? reemplazar(p, { ...e, nombre: nombre.slice(0, 30) }) : p
}

/** Deja el plano prolijo: sin elementos vacíos, y con los nombres sin espacios de más (o sin nombre si quedó vacío) */
export const limpiar = (p: Plano): Plano => ({
  ...p,
  elementos: p.elementos.filter((e) => e.celdas.length > 0).map(({ nombre, ...e }) => (nombre?.trim() ? { ...e, nombre: nombre.trim() } : e)),
})

/** La tira horizontal más larga de un elemento: ahí se escribe su nombre */
export function franja(e: ElementoPlano): { celda: number; largo: number } {
  let mejor = { celda: e.celdas[0] ?? 0, largo: e.celdas.length ? 1 : 0 }
  for (const c of e.celdas) {
    if (columna(c) > 0 && e.celdas.includes(c - 1)) continue
    let largo = 1
    while (columna(c + largo) > 0 && e.celdas.includes(c + largo)) largo++
    if (largo > mejor.largo) mejor = { celda: c, largo }
  }
  return mejor
}

export const lugarPiso = (c: number): string => `piso-${c}`

/** El lugar admite plantas: un elemento que no sea de referencia, o un cuadradito de piso libre */
export function lugarValido(p: Plano | undefined, lugar: string): boolean {
  if (!p) return false
  if (p.elementos.some((e) => e.id === lugar && !esReferencia(e.tipo))) return true
  return p.suelo.some((c) => lugarPiso(c) === lugar && !elementoEn(p, c))
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

/** Número para distinguir dos elementos iguales sin nombre propio ("Estante 2"), en orden de lectura; null si es el único */
export function numeroDe(p: Plano, el: ElementoPlano): number | null {
  const iguales = p.elementos.filter((x) => x.tipo === el.tipo && !x.nombre?.trim()).sort((a, b) => (a.celdas[0] ?? CELDAS) - (b.celdas[0] ?? CELDAS))
  return iguales.length > 1 ? iguales.findIndex((x) => x.id === el.id) + 1 : null
}

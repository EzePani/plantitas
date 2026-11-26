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

/** Cuántos cuadraditos puede medir un elemento para cada lado */
export const MAX_LARGO = 3

/** Los cuadraditos que ocupa un elemento */
export function celdasDe(e: ElementoPlano): number[] {
  const ancho = e.ancho ?? 1
  return Array.from({ length: ancho * (e.alto ?? 1) }, (_, i) => e.celda + Math.floor(i / ancho) * LADO + (i % ancho))
}

export const elementoEn = (p: Plano, c: number): ElementoPlano | undefined => p.elementos.find((e) => celdasDe(e).includes(c))

/** Entra en la cuadrícula, todo sobre el piso, sin pisar a otro y, si es de pared, entero contra la pared */
function cabe(p: Plano, e: ElementoPlano): boolean {
  if (columna(e.celda) + (e.ancho ?? 1) > LADO) return false
  const celdas = celdasDe(e)
  if (!celdas.every((c) => p.suelo.includes(c) && (!esReferencia(e.tipo) || contraPared(p.suelo, c)))) return false
  return !p.elementos.some((x) => x.id !== e.id && celdasDe(x).some((c) => celdas.includes(c)))
}

const reemplazar = (p: Plano, nuevo: ElementoPlano): Plano => ({ ...p, elementos: p.elementos.map((e) => (e.id === nuevo.id ? nuevo : e)) })

/** Cambia el piso y saca los elementos que ya no entran (quedaron afuera, o lejos de la pared si son de pared) */
export function conSuelo(p: Plano, suelo: number[]): Plano {
  const nuevo = { suelo: [...suelo].sort((a, b) => a - b), elementos: p.elementos }
  return { ...nuevo, elementos: p.elementos.filter((e) => cabe(nuevo, e)) }
}

/** Suma o saca un cuadradito del piso. Siempre queda al menos uno. */
export function alternarSuelo(p: Plano, c: number): Plano {
  if (!p.suelo.includes(c)) return conSuelo(p, [...p.suelo, c])
  return p.suelo.length > 1 ? conSuelo(p, p.suelo.filter((x) => x !== c)) : p
}

/** Pone un elemento de un cuadradito. Devuelve null si no puede ir ahí (ocupado, o ventana o puerta lejos de la pared). */
export function agregarElemento(p: Plano, c: number, tipo: TipoElemento, id: string): Plano | null {
  const nuevo: ElementoPlano = { id, tipo, celda: c }
  return cabe(p, nuevo) ? { ...p, elementos: [...p.elementos, nuevo] } : null
}

/**
 * Cambia cuánto ocupa un elemento. Crece hacia la derecha y hacia abajo; si ahí no hay lugar,
 * se corre sin dejar su cuadradito inicial. Devuelve null si ese tamaño no entra.
 */
export function redimensionar(p: Plano, id: string, ancho: number, alto: number): Plano | null {
  const e = p.elementos.find((x) => x.id === id)
  if (!e || ancho < 1 || alto < 1 || ancho > MAX_LARGO || alto > MAX_LARGO) return null
  const { ancho: _ancho, alto: _alto, ...base } = e
  for (let dy = 0; dy < alto; dy++) {
    for (let dx = 0; dx < ancho; dx++) {
      if (fila(e.celda) < dy || columna(e.celda) < dx) continue
      const nuevo: ElementoPlano = { ...base, celda: e.celda - dy * LADO - dx, ...(ancho > 1 && { ancho }), ...(alto > 1 && { alto }) }
      if (cabe(p, nuevo)) return reemplazar(p, nuevo)
    }
  }
  return null
}

export const quitarElemento = (p: Plano, id: string): Plano => ({ ...p, elementos: p.elementos.filter((e) => e.id !== id) })

export function renombrar(p: Plano, id: string, nombre: string): Plano {
  const e = p.elementos.find((x) => x.id === id)
  return e ? reemplazar(p, { ...e, nombre: nombre.slice(0, 30) }) : p
}

/** Antes de guardar: sin espacios de más y sin nombres vacíos */
export const limpiarNombres = (p: Plano): Plano => ({
  ...p,
  elementos: p.elementos.map(({ nombre, ...e }) => (nombre?.trim() ? { ...e, nombre: nombre.trim() } : e)),
})

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
  const iguales = p.elementos.filter((x) => x.tipo === el.tipo && !x.nombre?.trim()).sort((a, b) => a.celda - b.celda)
  return iguales.length > 1 ? iguales.findIndex((x) => x.id === el.id) + 1 : null
}

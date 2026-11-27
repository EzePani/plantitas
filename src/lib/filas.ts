import { notaVigente } from './guardia'
import { normalizar } from './hijitos'
import type { Caso, Coleccion, Control, DatosPersistidos, Espacio, Hijito, Plano, PlantaEnEspacio, Racha, Refuerzo, RegistroNodo, VisitaVivero } from './tipos'

/**
 * En la base cada cosa es una fila: un espacio, una planta, un caso, un control, una lección…
 * Acá se pasa de los datos de la app a filas y de vuelta, y se decide qué hacer cuando una fila
 * cambió en dos dispositivos. Nada de esto toca la red.
 */
export const TABLAS = ['avance', 'lecciones', 'insignias', 'espacios', 'planos', 'espacio_plantas', 'casos', 'controles', 'visitas_vivero', 'hijitos', 'colecciones', 'favoritas'] as const
export type Tabla = (typeof TABLAS)[number]
type Datos = Record<string, unknown>

export interface Fila {
  tabla: Tabla
  id: string
  datos: Datos
}
/** Filas por clave (`tabla/id`). El orden importa: dentro de cada tabla van de la más vieja a la más nueva */
export type Filas = Map<string, Fila>
export const claveDe = (tabla: string, id: string) => `${tabla}/${id}`

/** El mismo texto para el mismo contenido, sin importar el orden de los campos ni los que no tienen valor */
export function canonico(x: unknown): string {
  if (Array.isArray(x)) return `[${x.map((y) => canonico(y ?? null)).join(',')}]`
  if (x && typeof x === 'object') {
    const o = x as Datos
    return `{${Object.keys(o).filter((k) => o[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canonico(o[k])}`).join(',')}}`
  }
  return JSON.stringify(x ?? null)
}

/** Huella corta de una fila, para saber si cambió sin guardar una copia entera */
export function huella(datos: unknown): string {
  const s = canonico(datos)
  let a = 0xdeadbeef
  let b = 0x41c6ce57
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    a = Math.imul(a ^ c, 2654435761)
    b = Math.imul(b ^ c, 1597334677)
  }
  a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909)
  b = Math.imul(b ^ (b >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909)
  return (4294967296 * (2097151 & b) + (a >>> 0)).toString(36)
}

export function aFilas(d: DatosPersistidos): Filas {
  const m: Filas = new Map()
  const poner = (tabla: Tabla, id: string, datos: object) => m.set(claveDe(tabla, id), { tabla, id, datos: JSON.parse(JSON.stringify(datos)) as Datos })

  poner('avance', 'inicio', { onboardingCompleto: d.onboardingCompleto, respuestas: d.respuestas, perfil: d.perfil })
  poner('avance', 'mascotas', d.mascotas)
  poner('avance', 'xp', { xp: d.xp })
  poner('avance', 'racha', d.racha)
  poner('avance', 'semillas', { lista: d.semillas })
  poner('avance', 'salteadas', { lista: d.salteadas })
  poner('avance', 'refuerzo', d.refuerzo)
  for (const [id, r] of Object.entries(d.completadas)) poner('lecciones', id, r)
  for (const [id, fecha] of Object.entries(d.insignias)) poner('insignias', id, { fecha })

  for (const { plantas, plano, ...e } of d.espacios) {
    poner('espacios', e.id, e)
    // El plano va en su propia fila: si un día falta, se nota y se recupera
    if (plano) poner('planos', e.id, plano)
    for (const p of plantas) poner('espacio_plantas', `${e.id}:${p.id}`, { ...p, espacio: e.id })
  }
  // En la app lo nuevo va primero; en las filas, al final
  for (const { controles, vivero, ...c } of [...d.casos].reverse()) {
    poner('casos', c.id, { ...c, ...(vivero && { contestoVivero: true }) })
    for (const k of controles) poner('controles', `${c.id}:${k.fecha}`, { ...k, caso: c.id })
    for (const v of vivero ?? []) poner('visitas_vivero', `${c.id}:${v.id}`, { ...v, caso: c.id })
  }
  for (const h of [...d.hijitos].reverse()) poner('hijitos', h.id, h)
  for (const c of d.colecciones) poner('colecciones', c.id, c)
  for (const f of [...d.favoritas].reverse()) poner('favoritas', f, {})
  return m
}

/** Arma los datos de la app. Lo que falte queda como en `base` (una app recién instalada) */
export function deFilas(m: Filas, base: DatosPersistidos): DatosPersistidos {
  const de = (t: Tabla) => [...m.values()].filter((f) => f.tabla === t)
  const avance = <T>(id: string): T | undefined => m.get(claveDe('avance', id))?.datos as T | undefined
  const inicio = avance<Pick<DatosPersistidos, 'onboardingCompleto' | 'respuestas' | 'perfil'>>('inicio')
  const porFecha = (a: { fecha: string }, b: { fecha: string }) => a.fecha.localeCompare(b.fecha)

  const plantas = de('espacio_plantas')
  const controles = de('controles')
  const visitas = de('visitas_vivero')
  const sin = <T>(datos: Datos, campo: string) => {
    const { [campo]: _fuera, ...resto } = datos
    return resto as T
  }

  return {
    onboardingCompleto: inicio?.onboardingCompleto ?? base.onboardingCompleto,
    respuestas: inicio?.respuestas ?? base.respuestas,
    perfil: inicio?.perfil ?? base.perfil,
    mascotas: avance<DatosPersistidos['mascotas']>('mascotas') ?? base.mascotas,
    completadas: Object.fromEntries(de('lecciones').map((f) => [f.id, f.datos as unknown as RegistroNodo])),
    salteadas: avance<{ lista: DatosPersistidos['salteadas'] }>('salteadas')?.lista ?? base.salteadas,
    xp: avance<{ xp: number }>('xp')?.xp ?? base.xp,
    racha: avance<Racha>('racha') ?? base.racha,
    insignias: Object.fromEntries(de('insignias').map((f) => [f.id, f.datos.fecha as string])),
    semillas: avance<{ lista: DatosPersistidos['semillas'] }>('semillas')?.lista ?? base.semillas,
    espacios: de('espacios').map((f) => ({
      ...(f.datos as unknown as Omit<Espacio, 'plantas' | 'plano'>),
      ...(m.has(claveDe('planos', f.id)) && { plano: m.get(claveDe('planos', f.id))!.datos as unknown as Plano }),
      plantas: plantas.filter((p) => p.datos.espacio === f.id).map((p) => sin<PlantaEnEspacio>(p.datos, 'espacio')),
    })),
    favoritas: de('favoritas').map((f) => f.id).reverse(),
    colecciones: de('colecciones').map((f) => f.datos as unknown as Coleccion),
    hijitos: de('hijitos').map((f) => f.datos as unknown as Hijito).reverse(),
    casos: de('casos')
      .map((f) => {
        const { contestoVivero, ...c } = f.datos as unknown as Omit<Caso, 'controles' | 'vivero'> & { contestoVivero?: boolean }
        const vivero = visitas.filter((v) => v.datos.caso === f.id).map((v) => sin<VisitaVivero>(v.datos, 'caso')).sort(porFecha)
        return {
          ...c,
          controles: controles.filter((k) => k.datos.caso === f.id).map((k) => sin<Control>(k.datos, 'caso')).sort(porFecha),
          ...((contestoVivero || vivero.length > 0) && { vivero }),
        } as Caso
      })
      .reverse(),
    refuerzo: avance<Refuerzo>('refuerzo') ?? base.refuerzo,
  }
}

/**
 * Una fila que cambió en dos lados. `a` gana los empates; lo que se puede juntar se junta,
 * con las mismas reglas que `fusionar`.
 */
export function unir(tabla: Tabla, id: string, a: Datos, b: Datos): Datos {
  const lista = (x: Datos) => (Array.isArray(x.lista) ? (x.lista as string[]) : [])
  const txt = (x: unknown) => (typeof x === 'string' ? x : '')
  const num = (x: unknown) => (typeof x === 'number' ? x : 0)

  if (tabla === 'lecciones') return num(b.aciertos) > num(a.aciertos) || (num(b.aciertos) === num(a.aciertos) && txt(b.fecha) > txt(a.fecha)) ? b : a
  if (tabla === 'insignias') return txt(b.fecha) && txt(b.fecha) < txt(a.fecha) ? b : a
  if (tabla === 'colecciones') return { ...a, plantas: [...new Set([...((a.plantas as string[]) ?? []), ...((b.plantas as string[]) ?? [])])].slice(0, 200) }
  if (tabla === 'casos') {
    const nota = notaVigente(a as unknown as Caso, b as unknown as Caso)
    return { ...a, ...nota, ...(!a.cierre && b.cierre ? { cierre: b.cierre } : {}), ...(b.contestoVivero ? { contestoVivero: true } : {}), ...(!a.foto && b.foto ? { foto: b.foto } : {}) }
  }
  if (tabla === 'hijitos') {
    const h = a as unknown as Hijito
    const o = b as unknown as Hijito
    return normalizar({ ...h, agua: h.agua > o.agua ? h.agua : o.agua, raices: h.raices ?? o.raices, maceta: h.maceta ?? o.maceta, prendio: h.prendio ?? o.prendio }) as unknown as Datos
  }
  if (tabla === 'avance') {
    if (id === 'xp') return { xp: Math.max(num(a.xp), num(b.xp)) }
    if (id === 'semillas' || id === 'salteadas') return { lista: [...new Set([...lista(a), ...lista(b)])] }
    if (id === 'racha') return txt(a.ultima) !== txt(b.ultima) ? (txt(a.ultima) > txt(b.ultima) ? a : b) : { ...a, dias: Math.max(num(a.dias), num(b.dias)) }
    if (id === 'refuerzo') {
      const base = txt(b.ultimo) > txt(a.ultimo) ? b : a
      return { ...base, leccionesAlUltimo: Math.max(num(a.leccionesAlUltimo), num(b.leccionesAlUltimo)), fallidas: [...new Set([...((a.fallidas as string[]) ?? []), ...((b.fallidas as string[]) ?? [])])].slice(0, 60) }
    }
    if (id === 'inicio') return { onboardingCompleto: Boolean(a.onboardingCompleto || b.onboardingCompleto), respuestas: a.respuestas ?? b.respuestas ?? null, perfil: a.perfil ?? b.perfil ?? null }
  }
  return a
}

/** Tablas cuyas filas cuelgan de otra: [tabla del padre, campo que lo nombra (sin campo: tienen el mismo id)] */
const PADRE: Partial<Record<Tabla, [Tabla, string?]>> = { planos: ['espacios'], espacio_plantas: ['espacios', 'espacio'], controles: ['casos', 'caso'], visitas_vivero: ['casos', 'caso'] }

// ───────── Conciliar lo local con lo que llega de la base ─────────

export interface Remota extends Fila {
  version: number
  creado: string
  actualizado: string
  borrado: boolean
}

/**
 * Lo que este dispositivo sabe de una fila de la base: la huella del contenido que tenía la última
 * vez que coincidieron y el `actualizado` más nuevo que vio. `[null, v]`: la fila existe en la base
 * pero acá no va (está borrada, o quedó suelta sin su espacio o su caso).
 */
export type Vista = [huella: string | null, actualizado: string]
export type Base = Record<string, Vista>

export interface Pedido {
  tabla: Tabla
  id: string
  datos?: Datos
  version: number
  borrado: boolean
  visto: string | null
}

export interface Conciliado {
  /** Las filas locales después de sumar lo que llegó */
  filas: Filas
  base: Base
  /** Filas que este dispositivo conocía y ya no tiene, sin haberlas borrado: hay que volver a traerlas */
  faltan: string[]
  /** Filas de la base escritas por una app más nueva */
  nuevas: boolean
}

/**
 * Suma a lo local las filas que llegaron. Reglas:
 * - Una fila que acá no cambió toma lo que diga la base (también si allá se borró).
 * - Una fila que cambió en los dos lados se une; lo que no se puede unir queda con lo local, que se sube después.
 * - Algo borrado acá a propósito (`borrados`) no vuelve.
 * - Lo que falta acá sin haberse borrado a propósito se recupera de la base.
 * `ganaRemoto`: este dispositivo no tenía cambios propios, así que ante la duda vale la base
 * (salvo las filas `delBloque`, que nunca son más nuevas que lo local).
 */
export function conciliar(locales: Filas, remotas: Remota[], base: Base, borrados: ReadonlySet<string>, opciones: { version: number; ganaRemoto?: boolean; delBloque?: number }): Conciliado {
  const filas: Filas = new Map(locales)
  const nueva: Base = { ...base }
  let nuevas = false

  // Primero espacios y casos: sus plantas, controles y visitas solo entran si están
  const hijas = (r: Remota) => (PADRE[r.tabla] ? 1 : 0)
  const conPadre = (r: Remota) => {
    const p = PADRE[r.tabla]
    return !p || filas.has(claveDe(p[0], p[1] ? String(r.datos[p[1]]) : r.id))
  }

  for (const r of [...remotas].sort((x, y) => hijas(x) - hijas(y))) {
    const clave = claveDe(r.tabla, r.id)
    if (r.version > opciones.version) {
      nuevas = true
      continue
    }
    const vista = base[clave]
    const local = filas.get(clave)
    // Ya vista. Solo se vuelve a mirar si acá falta sin haberse borrado a propósito
    if (vista && vista[1] === r.actualizado && (local || borrados.has(clave) || r.borrado || !conPadre(r))) continue
    const hRemota = huella(r.datos)
    const cambioLocal = local ? !vista || huella(local.datos) !== vista[0] : borrados.has(clave)

    if (!cambioLocal) {
      // Acá no se tocó: vale la base
      if (r.borrado || !conPadre(r)) {
        filas.delete(clave)
        nueva[clave] = [null, r.actualizado]
      } else {
        filas.set(clave, { tabla: r.tabla, id: r.id, datos: r.datos })
        nueva[clave] = [hRemota, r.actualizado]
      }
      continue
    }
    if (!local) {
      // Borrada acá a propósito: se sube el borrado
      nueva[clave] = [vista?.[0] ?? hRemota, r.actualizado]
      continue
    }
    if (r.borrado) {
      if (vista) {
        // Borrada allá y modificada acá: se conserva y vuelve a subir
        nueva[clave] = [null, r.actualizado]
      } else {
        // Primera vez que este dispositivo ve la fila, y ya la borraron a propósito en otro
        filas.delete(clave)
        nueva[clave] = [null, r.actualizado]
      }
      continue
    }
    const manda = !vista && opciones.ganaRemoto && r.version > (opciones.delBloque ?? 0)
    const datos = manda ? unir(r.tabla, r.id, r.datos, local.datos) : unir(r.tabla, r.id, local.datos, r.datos)
    filas.set(clave, { tabla: r.tabla, id: r.id, datos })
    // La huella es la de la base: si lo unido es distinto, se sube
    nueva[clave] = [hRemota, r.actualizado]
  }

  const faltan = Object.keys(nueva).filter((k) => nueva[k][0] !== null && !filas.has(k) && !borrados.has(k))
  return { filas, base: nueva, faltan, nuevas }
}

/** Lo que hay que mandar a la base: filas nuevas o cambiadas y los borrados hechos a propósito */
export function pendientes(filas: Filas, base: Base, borrados: ReadonlySet<string>, version: number): Pedido[] {
  const salida: Pedido[] = []
  for (const [clave, f] of filas) {
    const vista = base[clave]
    if (!vista || vista[0] !== huella(f.datos)) salida.push({ tabla: f.tabla, id: f.id, datos: f.datos, version, borrado: false, visto: vista?.[1] ?? null })
  }
  for (const clave of borrados) {
    const vista = base[clave]
    if (filas.has(clave) || !vista || vista[0] === null) continue
    const corte = clave.indexOf('/')
    salida.push({ tabla: clave.slice(0, corte) as Tabla, id: clave.slice(corte + 1), version, borrado: true, visto: vista[1] })
  }
  return salida
}

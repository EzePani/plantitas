import { esquemaDatos, migrar } from './backup'
import type { DatosPersistidos } from './tipos'

/**
 * Copias automáticas en este dispositivo, para poder volver atrás. Se guarda una antes de pisar
 * datos (con la nube o con un archivo) y otra antes de pasar a un formato nuevo.
 */
const CLAVE = 'plantitas-copias'
const POR_MOTIVO = 5

export interface Copia {
  fecha: string
  motivo: 'reemplazo' | 'actualizacion'
  version: number
  datos: unknown
}

export function leerCopias(): Copia[] {
  try {
    const l = JSON.parse(localStorage.getItem(CLAVE) ?? '[]') as Copia[]
    return Array.isArray(l) ? l.filter((c) => c && typeof c.version === 'number') : []
  } catch {
    return []
  }
}

export function guardarCopia(datos: unknown, version: number, motivo: Copia['motivo'], ahora: Date = new Date()): void {
  // Sin haber pasado por la bienvenida no hay nada que valga la pena guardar
  if (!(datos as Partial<DatosPersistidos> | null)?.onboardingCompleto) return
  const previas = leerCopias()
  if (previas.some((c) => JSON.stringify(c.datos) === JSON.stringify(datos))) return
  const cuenta: Record<string, number> = {}
  const lista = [{ fecha: ahora.toISOString(), motivo, version, datos }, ...previas].filter((c) => (cuenta[c.motivo] = (cuenta[c.motivo] ?? 0) + 1) <= POR_MOTIVO)
  // Si no entra, se van sacando las más viejas
  while (lista.length) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lista))
      return
    } catch {
      lista.pop()
    }
  }
}

/** Los datos de una copia en el formato actual; null si no se pueden leer */
export function abrirCopia(c: Copia): DatosPersistidos | null {
  try {
    const r = esquemaDatos.safeParse(migrar(c.datos, c.version))
    return r.success ? r.data : null
  } catch {
    return null
  }
}

export const contenido = (d: DatosPersistidos) => ({
  espacios: d.espacios.length,
  plantas: d.espacios.reduce((t, e) => t + e.plantas.length, 0),
  guardia: d.casos.length,
})

/** Todo lo que se puede perder, cada cosa con su nombre propio */
const cosas = (d: DatosPersistidos): string[] => [
  ...d.espacios.flatMap((e) => [
    `espacio ${e.id}`,
    ...(e.plano ? [`plano ${e.id}`, ...e.plano.elementos.map((x) => `elemento ${e.id} ${x.id}`)] : []),
    ...e.plantas.map((p) => `planta ${e.id} ${p.id}`),
  ]),
  ...d.casos.flatMap((c) => [`caso ${c.id}`, ...c.controles.map((x) => `control ${c.id} ${x.fecha}`), ...c.controles.filter((x) => x.nota).map((x) => `nota ${c.id} ${x.fecha}`), ...(c.vivero ?? []).map((v) => `visita ${v.id}`), ...(c.foto ? [`foto ${c.id}`] : []), ...(c.notas ? [`nota ${c.id}`] : [])]),
  ...d.hijitos.map((h) => `hijito ${h.id}`),
  ...d.colecciones.map((c) => `coleccion ${c.id}`),
  ...d.favoritas.map((f) => `favorita ${f}`),
  ...Object.keys(d.completadas).map((l) => `leccion ${l}`),
]

/** Si al pasar de `antes` a `despues` desaparece algo */
export function sePierde(antes: DatosPersistidos, despues: DatosPersistidos): boolean {
  const quedan = new Set(cosas(despues))
  return cosas(antes).some((x) => !quedan.has(x))
}

import type { DatosPersistidos, UnidadId } from './tipos'

export type TipoNodo = 'leccion' | 'repaso' | 'cofre'
export type EstadoNodo = 'completado' | 'actual' | 'bloqueado'

export interface Nodo {
  id: string
  tipo: TipoNodo
  unidad: UnidadId
  estado: EstadoNodo
  /** posición global entre los nodos jugables, para la enredadera */
  indice: number
}

export interface Tramo {
  unidad: UnidadId
  /** false = "Próximamente" (tanda 2, todavía sin contenido) */
  disponible: boolean
  nodos: Nodo[]
  completa: boolean
  salteada: boolean
}

export interface Camino {
  tramos: Tramo[]
  nodoActual: Nodo | null
  totalNodos: number
  nodosHechos: number
  /** todas las unidades disponibles terminadas (habilita "Armá tu espacio") */
  terminado: boolean
}

export const idRepaso = (u: UnidadId) => `repaso-${u}`
export const idCofre = (u: UnidadId) => `cofre-${u}`

type Progreso = Pick<DatosPersistidos, 'completadas' | 'salteadas' | 'semillas'>

export function construirCamino(
  orden: UnidadId[],
  leccionesPorUnidad: Partial<Record<UnidadId, string[]>>,
  progreso: Progreso,
): Camino {
  const tramos: Tramo[] = []
  let indice = 0
  let actual: Nodo | null = null
  let hechos = 0

  for (const unidad of orden) {
    const lecciones = leccionesPorUnidad[unidad] ?? []
    const disponible = lecciones.length > 0
    const salteada = progreso.salteadas.includes(unidad)
    const nodos: Nodo[] = []

    if (disponible) {
      const defs: { id: string; tipo: TipoNodo }[] = [
        ...lecciones.map((id) => ({ id, tipo: 'leccion' as const })),
        { id: idRepaso(unidad), tipo: 'repaso' },
        { id: idCofre(unidad), tipo: 'cofre' },
      ]
      for (const def of defs) {
        const hecho =
          def.tipo === 'cofre'
            ? progreso.semillas.includes(unidad)
            : salteada || Boolean(progreso.completadas[def.id])
        let estado: EstadoNodo = 'bloqueado'
        if (hecho) {
          estado = 'completado'
          hechos++
        } else if (!actual) {
          estado = 'actual'
        }
        const nodo: Nodo = { ...def, unidad, estado, indice: indice++ }
        if (estado === 'actual') actual = nodo
        nodos.push(nodo)
      }
    }

    tramos.push({
      unidad,
      disponible,
      nodos,
      salteada,
      completa: disponible && nodos.every((n) => n.estado === 'completado'),
    })
  }

  return {
    tramos,
    nodoActual: actual,
    totalNodos: indice,
    nodosHechos: hechos,
    terminado: indice > 0 && hechos === indice,
  }
}

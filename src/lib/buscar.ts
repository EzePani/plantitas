import type { Planta } from '../data/plantas/esquema'
import { TC } from '../data/textosCatalogo'
import { UNIDADES, idsDelPlan } from '../data/unidades'
import type { Entrada } from '../data/wiki'
import type { UnidadId } from './tipos'

/** Sin tildes ni mayúsculas, para comparar lo que se escribe con los textos */
export const normal = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** Por nombre común, otros nombres o nombre científico; también por tipo ("cactus") o forma ("trepadora") */
export function buscarPlantas(plantas: Planta[], consulta: string): Planta[] {
  const q = normal(consulta)
  if (!q) return []
  const textos = (p: Planta) => [p.nombre_comun, p.nombre_cientifico, ...p.otros_nombres, ...p.clases.map((c) => TC.plantas.clase[c]), ...p.cultivo.porte.map((x) => TC.plantas.porte[x])]
  return plantas.filter((p) => textos(p).some((n) => normal(n).includes(q))).sort((a, b) => a.nombre_comun.localeCompare(b.nombre_comun, 'es'))
}

/** Primero las entradas cuyo término o sinónimo coincide; después las que lo nombran en el resumen */
export function buscarEntradas(entradas: Entrada[], consulta: string): Entrada[] {
  const q = normal(consulta)
  if (!q) return []
  const porNombre = entradas.filter((e) => [e.termino, ...e.sinonimos].some((n) => normal(n).includes(q)))
  const porTexto = entradas.filter((e) => !porNombre.includes(e) && normal(e.resumen).includes(q))
  return [...porNombre, ...porTexto]
}

export interface LeccionListada {
  id: string
  titulo: string
  unidad: UnidadId
}

/** Todas las lecciones del plan, con el título que figura en las unidades (no hace falta cargar el contenido) */
export const LECCIONES_LISTADAS: LeccionListada[] = (Object.keys(UNIDADES) as UnidadId[]).flatMap((u) => idsDelPlan(u).map((id, i) => ({ id, titulo: UNIDADES[u].plan[i], unidad: u })))

export function buscarLecciones(consulta: string): LeccionListada[] {
  const q = normal(consulta)
  if (!q) return []
  return LECCIONES_LISTADAS.filter((l) => normal(l.titulo).includes(q))
}

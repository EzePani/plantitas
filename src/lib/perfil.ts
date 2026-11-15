import type { DatosMascotas, Experiencia, Objetivo, Perfil, UnidadId } from './tipos'

export const ORDEN_BASE: UnidadId[] = [
  'basico',
  'luz',
  'riego',
  'familias',
  'macetas',
  'abono',
  'agua',
  'mascotas',
  'comprar',
]

/** Aciertos mínimos (de 3) en el mini test para confirmar el perfil Experimentado */
export const MINIMO_TEST = 2

export function asignarPerfil(experiencia: Experiencia, aciertosTest = 0): Perfil {
  switch (experiencia) {
    case 'nunca':
      return 'primerizo'
    case 'murieron':
      return 'sobreviviente'
    case 'algunas':
      return 'en_camino'
    case 'bastante':
      return aciertosTest >= MINIMO_TEST ? 'experimentado' : 'en_camino'
  }
}

export function mascotaMuerde(m: DatosMascotas): boolean {
  return m.tipo !== 'ninguna' && (m.muerde === 'siempre' || m.muerde === 'a_veces')
}

export interface PlanCamino {
  orden: UnidadId[]
  recomendadas: UnidadId[]
  salteables: UnidadId[]
}

function alFrente(orden: UnidadId[], ids: UnidadId[]): UnidadId[] {
  return [...ids, ...orden.filter((u) => !ids.includes(u))]
}

/** Define el orden de las unidades y cuáles se destacan o se pueden saltear */
export function planDeCamino(
  perfil: Perfil,
  mascotas: DatosMascotas,
  objetivo: Objetivo,
): PlanCamino {
  let orden = [...ORDEN_BASE]
  const recomendadas = new Set<UnidadId>()
  let salteables: UnidadId[] = []

  if (perfil === 'primerizo') recomendadas.add('basico')
  if (perfil === 'sobreviviente') {
    // A quien se le murieron plantas: primero luz y riego, que es donde suele estar el problema
    orden = alFrente(orden, ['luz', 'riego'])
    recomendadas.add('luz').add('riego')
  }
  if (perfil === 'en_camino') salteables = ['basico']
  if (perfil === 'experimentado') salteables = ['basico', 'luz', 'riego', 'macetas']

  if (objetivo === 'basico') recomendadas.add('basico').add('luz').add('riego')
  if (objetivo === 'elegir') recomendadas.add('comprar').add('familias')
  if (objetivo === 'a_fondo') recomendadas.add('familias').add('abono').add('agua')

  if (mascotas.tipo !== 'ninguna') recomendadas.add('mascotas')
  // Seguridad primero: si la mascota muerde plantas, la unidad de mascotas va antes que todo
  if (mascotaMuerde(mascotas)) orden = alFrente(orden, ['mascotas'])

  for (const s of salteables) recomendadas.delete(s)

  return { orden, recomendadas: orden.filter((u) => recomendadas.has(u)), salteables }
}

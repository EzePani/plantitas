import type { UnidadId } from '../lib/tipos'

export interface Unidad {
  id: UnidadId
  numero: number
  titulo: string
  descripcion: string
  /** 1 = lanzamiento, 2 = "Próximamente" */
  tanda: 1 | 2
  /** cantidad de lecciones planificadas */
  lecciones: number
  color: string
  colorOsc: string
  /** nombre de la semilla coleccionable que da el cofre */
  semilla: string
}

export const UNIDADES: Record<UnidadId, Unidad> = {
  basico: { id: 'basico', numero: 1, titulo: 'Lo básico', descripcion: 'Qué es una planta y qué necesita para vivir.', tanda: 1, lecciones: 3, color: '#2f7d4a', colorOsc: '#1f5a36', semilla: 'Semilla de potus' },
  luz: { id: 'luz', numero: 2, titulo: 'Luz y tu espacio', descripcion: 'Cómo leer el sol de tu casa.', tanda: 1, lecciones: 3, color: '#d99a1c', colorOsc: '#a87210', semilla: 'Semilla de girasol' },
  riego: { id: 'riego', numero: 3, titulo: 'Riego', descripcion: 'Cuándo, cuánto y por qué menos es más.', tanda: 1, lecciones: 3, color: '#3d8fb8', colorOsc: '#2a6a8c', semilla: 'Semilla de helecho' },
  familias: { id: 'familias', numero: 4, titulo: 'Familias', descripcion: 'Suculentas, tropicales, helechos y con flor.', tanda: 2, lecciones: 4, color: '#7a9a3a', colorOsc: '#566f24', semilla: 'Semilla de monstera' },
  macetas: { id: 'macetas', numero: 5, titulo: 'Macetas y tierra', descripcion: 'Drenaje, sustrato y trasplante.', tanda: 1, lecciones: 3, color: '#c9603a', colorOsc: '#9a4526', semilla: 'Semilla de jade' },
  abono: { id: 'abono', numero: 6, titulo: 'Abono', descripcion: 'Qué comen las plantas y cuándo darles.', tanda: 2, lecciones: 2, color: '#8a6a3a', colorOsc: '#644b26', semilla: 'Semilla de begonia' },
  agua: { id: 'agua', numero: 7, titulo: 'Plantas en agua', descripcion: 'Esquejes y por qué algunas viven en agua.', tanda: 2, lecciones: 2, color: '#3aa39a', colorOsc: '#27766f', semilla: 'Semilla de filodendro' },
  mascotas: { id: 'mascotas', numero: 8, titulo: 'Plantas y mascotas', descripcion: 'Que convivan sin sustos.', tanda: 1, lecciones: 3, color: '#b0567d', colorOsc: '#823a5a', semilla: 'Semilla de pasto para gatos' },
  comprar: { id: 'comprar', numero: 9, titulo: 'Comprar bien', descripcion: 'Elegir en el vivero y aclimatar en casa.', tanda: 2, lecciones: 3, color: '#6b6fb5', colorOsc: '#4b4e8a', semilla: 'Semilla de calatea' },
}

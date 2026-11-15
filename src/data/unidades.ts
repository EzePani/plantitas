import type { UnidadId } from '../lib/tipos'

export interface Unidad {
  id: UnidadId
  numero: number
  titulo: string
  descripcion: string
  /** 1 = lanzamiento; 2 y 3 = "Próximamente" */
  tanda: 1 | 2 | 3
  /** Títulos de las lecciones planificadas, en orden. El id de cada lección es `<unidad>-<posición>`. */
  plan: string[]
  color: string
  colorOsc: string
  /** nombre de la semilla coleccionable que da el cofre */
  semilla: string
}

const u = (id: UnidadId, numero: number, tanda: 1 | 2 | 3, titulo: string, descripcion: string, color: string, colorOsc: string, semilla: string, plan: string[]): Unidad => ({
  id,
  numero,
  tanda,
  titulo,
  descripcion,
  color,
  colorOsc,
  semilla,
  plan,
})

/** 12 unidades, 46 lecciones, 3 tandas */
export const UNIDADES: Record<UnidadId, Unidad> = {
  basico: u('basico', 1, 1, 'Lo básico', 'Qué es una planta y qué necesita para vivir.', '#2f7d4a', '#1f5a36', 'Semilla de potus', [
    'Qué necesita una planta',
    'Las raíces',
    'Leer las señales de una planta',
    'Por qué adentro es distinto',
  ]),
  luz: u('luz', 2, 1, 'Luz y tu espacio', 'Cómo leer el sol de cada rincón de tu casa.', '#d99a1c', '#a87210', 'Semilla de girasol', [
    'Luz directa y luz indirecta',
    'El mapa del sol de tu casa',
    'Sol de mañana y sol de tarde',
    'Señales de poca o mucha luz',
  ]),
  riego: u('riego', 3, 1, 'Riego', 'Cuándo, cuánto y por qué menos es más.', '#3d8fb8', '#2a6a8c', 'Semilla de helecho', [
    'El exceso mata más que la falta',
    'Cómo saber si hay que regar',
    'Cómo regar bien',
    'Formas de regar',
    'El riego según la estación',
  ]),
  macetas: u('macetas', 4, 2, 'Macetas y tierra', 'Materiales, drenaje, sustratos y trasplante.', '#c9603a', '#9a4526', 'Semilla de jade', [
    'Macetas según el material',
    'Forma, tamaño y drenaje',
    'Tipos de tierra y sustrato',
    'Compost y tierra de vivero',
    'Piedras: para qué sí y para qué no',
    'Trasplante',
  ]),
  abono: u('abono', 5, 2, 'Abono', 'Qué comen las plantas y cuándo darles.', '#8a6a3a', '#644b26', 'Semilla de begonia', [
    'Qué comen las plantas',
    'Tipos de abono',
    'En la tierra, en el agua o en las hojas',
    'Cuándo abonar y cuándo no',
  ]),
  familias: u('familias', 6, 2, 'Familias', 'Suculentas, tropicales, helechos y con flor.', '#7a9a3a', '#566f24', 'Semilla de monstera', [
    'Suculentas y cactus',
    'Follaje tropical',
    'Amigas de la humedad',
    'Con flor y orquídeas',
  ]),
  estaciones: u('estaciones', 7, 2, 'Estaciones, calor y viajes', 'El año de tus plantas, y qué hacer si te vas.', '#d0803a', '#9c5a20', 'Semilla de cactus', [
    'Calor y verano',
    'Invierno, frío y calefacción',
    'Cuándo es normal que pierda hojas',
    'Si te vas de viaje',
  ]),
  rutina: u('rutina', 8, 3, 'Rutina de cuidados', 'Limpiar, podar y rotar.', '#3aa39a', '#27766f', 'Semilla de peperomia', ['Limpiar las hojas', 'Hojas secas, poda y rotación']),
  plagas: u('plagas', 9, 3, 'Bichos y problemas', 'Reconocer plagas y qué funciona de verdad.', '#a05a4a', '#743c30', 'Semilla de cinta', [
    'Plagas comunes',
    'Prevención',
    'Remedios que sirven y mitos',
    'Hongos y otros problemas',
  ]),
  multiplicar: u('multiplicar', 10, 3, 'Multiplicar tus plantas', 'Esquejes, hijos y plantas en agua.', '#4f9ac9', '#356f95', 'Semilla de filodendro', [
    'Propagar en agua',
    'Vivir en agua o pasar por el agua',
    'Hijos y división',
    'Hijos de cactus y suculentas',
  ]),
  comprar: u('comprar', 11, 3, 'Comprar bien', 'Elegir en el vivero y aclimatar en casa.', '#6b6fb5', '#4b4e8a', 'Semilla de calatea', ['Elegir una planta sana', 'Las primeras semanas en casa']),
  mascotas: u('mascotas', 12, 1, 'Plantas y mascotas', 'Que convivan sin sustos.', '#b0567d', '#823a5a', 'Semilla de pasto para gatos', [
    'Por qué algunas plantas hacen mal',
    'Qué hacer si mordió una planta',
    'Organizar el espacio',
  ]),
}

/** Ids de las lecciones planificadas de una unidad, en orden */
export const idsDelPlan = (unidad: UnidadId): string[] => UNIDADES[unidad].plan.map((_, i) => `${unidad}-${i + 1}`)

export const TOTAL_LECCIONES = Object.values(UNIDADES).reduce((n, x) => n + x.plan.length, 0)

import type { Obstaculo, PerfilLuz, TramoSol } from './tipos'

/** Las cuatro categorías del Modelo de luz. El catálogo usa las mismas en "luz_requerida". */
export type CategoriaLuz = 'directa' | 'indirecta_brillante' | 'indirecta_media' | 'baja'
export type Momento = 'manana' | 'mediodia' | 'tarde'
export type Orientacion = 'norte' | 'este' | 'oeste' | 'sur' | 'desconocida'

export interface LuzDerivada {
  /** Luz que recibe la planta en ese lugar, ya considerando lo que filtra el sol */
  categoria: CategoriaLuz
  /** Horas de sol directo que declaró el usuario (suma de los tramos) */
  horasSol: number
  /** Horas de sol que realmente le pegan a la planta (0 si una cortina lo filtra) */
  horasEfectivas: number
  /** null si no hay sol directo o no se saben las horas */
  momento: Momento | null
  orientacion: Orientacion
  /** Sol directo de tarde, o sol directo a través de un vidrio: puede quemar o sofocar */
  avisoCalor: boolean
  /** true cuando faltaron datos y se asumió un valor conservador */
  asumida: boolean
}

/**
 * Heurística para Buenos Aires (hemisferio sur, el sol recorre el cielo por el NORTE).
 * Todo lo que sale de acá es una ESTIMACIÓN y así se muestra en la app.
 */
export const HORA_MIN = 6
export const HORA_MAX = 20
/** El mediodía solar en Buenos Aires cae cerca de las 13 hs de reloj */
const MEDIODIA_SOLAR = 13
const FIN_MANANA = 12
const INICIO_TARDE = 15
/** Sol directo que se asume cuando hay sol pero no se saben las horas */
const HORAS_SI_NO_SABE = 3

export function tramosValidos(tramos: TramoSol[]): TramoSol[] {
  return tramos
    .filter((t) => Number.isFinite(t.desde) && Number.isFinite(t.hasta) && t.hasta > t.desde)
    .map((t) => ({ desde: Math.max(0, t.desde), hasta: Math.min(24, t.hasta) }))
    .sort((a, b) => a.desde - b.desde)
    .slice(0, 2)
}

/** Horas de sol sin contar dos veces lo que se superpone */
export function horasDeSol(tramos: TramoSol[]): number {
  let total = 0
  let fin = -Infinity
  for (const t of tramosValidos(tramos)) {
    const desde = Math.max(t.desde, fin)
    if (t.hasta > desde) total += t.hasta - desde
    fin = Math.max(fin, t.hasta)
  }
  return total
}

function horasEn(tramos: TramoSol[], desde: number, hasta: number): number {
  return horasDeSol(tramosValidos(tramos).map((t) => ({ desde: Math.max(t.desde, desde), hasta: Math.min(t.hasta, hasta) })))
}

export function momentoDominante(tramos: TramoSol[]): Momento | null {
  const manana = horasEn(tramos, 0, FIN_MANANA)
  const mediodia = horasEn(tramos, FIN_MANANA, INICIO_TARDE)
  const tarde = horasEn(tramos, INICIO_TARDE, 24)
  if (manana + mediodia + tarde === 0) return null
  // En empate gana el más exigente para la planta: tarde > mediodía > mañana
  if (tarde >= mediodia && tarde >= manana) return 'tarde'
  if (mediodia >= manana) return 'mediodia'
  return 'manana'
}

/**
 * Orientación aproximada: sol que empieza y termina temprano → este; sol concentrado
 * al mediodía o que dura muchas horas → norte; sol que empieza tarde → oeste;
 * casi sin sol directo → sur.
 */
export function orientacionAprox(tramos: TramoSol[]): Orientacion {
  const validos = tramosValidos(tramos)
  const horas = horasDeSol(validos)
  if (horas < 1) return 'sur'
  if (horas >= 7) return 'norte'
  const centro = validos.reduce((s, t) => s + ((t.desde + t.hasta) / 2) * (t.hasta - t.desde), 0) / validos.reduce((s, t) => s + (t.hasta - t.desde), 0)
  if (centro < MEDIODIA_SOLAR - 1.25) return 'este'
  if (centro > MEDIODIA_SOLAR + 1.25) return 'oeste'
  return 'norte'
}

const tiene = (p: PerfilLuz, o: Obstaculo) => p.obstaculos.includes(o)

export function derivarLuz(p: PerfilLuz): LuzDerivada {
  if (p.tipo === 'no_se') {
    // Regla del Modelo de luz: si no sabe, asumir indirecta media (conservador) y dejar editar
    return { categoria: 'indirecta_media', horasSol: 0, horasEfectivas: 0, momento: null, orientacion: 'desconocida', avisoCalor: false, asumida: true }
  }
  if (p.tipo === 'baja') {
    return { categoria: 'baja', horasSol: 0, horasEfectivas: 0, momento: null, orientacion: 'sur', avisoCalor: false, asumida: false }
  }
  if (p.tipo === 'indirecta') {
    return { categoria: 'indirecta_brillante', horasSol: 0, horasEfectivas: 0, momento: null, orientacion: 'sur', avisoCalor: false, asumida: false }
  }

  const tramos = tramosValidos(p.tramos)
  const sinHoras = tramos.length === 0
  const horasSol = sinHoras ? HORAS_SI_NO_SABE : horasDeSol(tramos)
  const momento = sinHoras ? null : momentoDominante(tramos)
  const orientacion = sinHoras ? 'desconocida' : orientacionAprox(tramos)

  // Una cortina filtra el sol: la planta recibe claridad, no sol directo.
  // Un árbol lo tamiza: cuenta como la mitad. Edificios y techos ya están reflejados
  // en las horas que cargó el usuario (son la razón de que el sol dure menos).
  const horasEfectivas = tiene(p, 'cortina') ? 0 : tiene(p, 'arbol') ? horasSol / 2 : horasSol
  const categoria: CategoriaLuz = horasEfectivas >= 1 ? 'directa' : 'indirecta_brillante'

  const solDeTarde = sinHoras ? false : horasEn(tramos, INICIO_TARDE, 24) >= 1.5
  const avisoCalor = categoria === 'directa' && (solDeTarde || tiene(p, 'vidrio'))

  return { categoria, horasSol, horasEfectivas, momento, orientacion, avisoCalor, asumida: sinHoras }
}

export const LUZ_POR_DEFECTO: PerfilLuz = { tipo: 'no_se', tramos: [], obstaculos: [] }

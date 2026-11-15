export type Experiencia = 'nunca' | 'murieron' | 'algunas' | 'bastante'
export type Lugar = 'interior' | 'balcon' | 'ambos'
export type Abertura = 'ventana' | 'balcon' | 'ambas'
export type HoraSol = 'manana' | 'mediodia' | 'tarde' | 'todo_el_dia' | 'casi_nunca' | 'no_se'
export type TipoMascota = 'gato' | 'perro' | 'ambos' | 'ninguna'
export type Muerde = 'siempre' | 'a_veces' | 'nunca' | 'no_se'
export type Alcance = 'todo' | 'bajo' | 'puedo_aislar'
export type Tiempo = 'casi_nada' | 'un_rato' | 'me_encanta'
export type Objetivo = 'basico' | 'elegir' | 'a_fondo'
export type Perfil = 'primerizo' | 'sobreviviente' | 'en_camino' | 'experimentado'

export type UnidadId =
  | 'basico'
  | 'luz'
  | 'riego'
  | 'familias'
  | 'macetas'
  | 'abono'
  | 'agua'
  | 'mascotas'
  | 'comprar'

export interface DatosMascotas {
  tipo: TipoMascota
  muerde?: Muerde
  alcance?: Alcance
}

export interface Respuestas {
  experiencia: Experiencia
  /** Aciertos del mini test (solo si eligió "Ya sé bastante") */
  aciertosTest?: number
  lugar: Lugar
  abertura: Abertura
  horaSol: HoraSol
  tiempo: Tiempo
  objetivo: Objetivo
}

export interface RegistroNodo {
  fecha: string
  aciertos: number
  total: number
}

export interface Racha {
  dias: number
  /** Último día (AAAA-MM-DD, hora local) en que se completó una lección */
  ultima: string | null
}

/** Espacio guardado por el recomendador (se completa en la fase 5) */
export interface Espacio {
  id: string
  nombre: string
  creado: string
  datos: Record<string, string>
  plantas: string[]
}

/** Todo lo que se persiste en localStorage y viaja en el backup */
export interface DatosPersistidos {
  onboardingCompleto: boolean
  respuestas: Respuestas | null
  perfil: Perfil | null
  mascotas: DatosMascotas
  completadas: Record<string, RegistroNodo>
  salteadas: UnidadId[]
  xp: number
  racha: Racha
  insignias: Record<string, string>
  semillas: UnidadId[]
  espacios: Espacio[]
}

import type { CategoriaLuz } from './luz'
export type Experiencia = 'nunca' | 'murieron' | 'algunas' | 'bastante'
export type Lugar = 'interior' | 'balcon' | 'ambos'
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
  | 'macetas'
  | 'abono'
  | 'familias'
  | 'estaciones'
  | 'rutina'
  | 'plagas'
  | 'multiplicar'
  | 'comprar'
  | 'mascotas'

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

// ---------- Modelo de luz ----------

/** Lo que el usuario ve en el lugar. Nunca se le pide la orientación. */
export type TipoLuz = 'directa' | 'indirecta' | 'baja' | 'no_se'
export type Obstaculo = 'edificio' | 'arbol' | 'techo' | 'vidrio' | 'cortina'

/** Tramo de sol directo, en horas del día (0 a 24, admite medias horas) */
export interface TramoSol {
  desde: number
  hasta: number
}

/** Perfil de luz de un espacio: solo lo que el usuario cargó. Lo demás se deriva (lib/luz.ts). */
export interface PerfilLuz {
  tipo: TipoLuz
  /** Hasta 2 tramos de sol directo. Vacío si no hay sol directo o si no sabe las horas. */
  tramos: TramoSol[]
  obstaculos: Obstaculo[]
}

export type TipoEspacio = 'living' | 'dormitorio' | 'cocina' | 'bano' | 'balcon' | 'escritorio'
export type TamanoEspacio = 'chico' | 'mediano' | 'amplio'
export type Esfuerzo = 'poco' | 'medio' | 'mucho'

/** Una planta que vive en un espacio. Siempre es del catálogo; el `id` es interno y distingue dos plantas iguales. */
export interface PlantaEnEspacio {
  id: string
  plantaId: string
  /** Id de un elemento del plano o `piso-<celda>`. Sin valor: todavía sin ubicar. */
  lugar?: string
}

/** Todo lo que se puede dibujar en un plano. Qué se ofrece en cada espacio lo define `plano.ts`. */
export const TIPOS_ELEMENTO = [
  'ventana', 'puerta',
  'sillon', 'tele', 'cama', 'placard', 'horno', 'heladera', 'bacha', 'ducha', 'inodoro', 'bidet', 'parrilla', 'lavarropas', 'silla', 'compu',
  'mesa', 'mueble', 'estante', 'gancho', 'mesada', 'baranda',
] as const
export type TipoElemento = (typeof TIPOS_ELEMENTO)[number]

export interface ElementoPlano {
  id: string
  tipo: TipoElemento
  /** Los cuadraditos que ocupa (fila * 6 + columna), ordenados. El usuario los tilda uno por uno. */
  celdas: number[]
  /** Nombre propio ("Estante arriba de la tele"); sin él se muestra el tipo */
  nombre?: string
}

/** El espacio visto desde arriba, sobre una cuadrícula */
export interface Plano {
  /** Celdas que forman el piso */
  suelo: number[]
  elementos: ElementoPlano[]
  /** Luz corregida a mano, por lugar (id de elemento o `piso-<celda>`). Sin entrada: se estima. */
  luces?: Record<string, CategoriaLuz>
}

/** Un espacio de la casa, con su propio perfil de luz. Las recomendaciones se calculan al mostrarlo. */
export interface Espacio {
  id: string
  nombre: string
  creado: string
  tipo: TipoEspacio
  luz: PerfilLuz
  tamano: TamanoEspacio
  mascotas: TipoMascota
  esfuerzo: Esfuerzo
  /** Plantas que ya están en este lugar, en el orden en que se agregaron */
  plantas: PlantaEnEspacio[]
  plano?: Plano
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
  /** Ids de plantas del catálogo marcadas con el corazón */
  favoritas: string[]
  /** Grupos de plantas con nombre propio (tipo colecciones de Instagram) */
  colecciones: Coleccion[]
  /** Esquejes e hijitos que se están enraizando en casa */
  hijitos: Hijito[]
  /** Plantas enfermas en Guardia: en tratamiento y ya cerradas */
  casos: Caso[]
  refuerzo: Refuerzo
}

export const SINTOMAS = ['amarillas', 'puntas', 'caidas', 'manchas', 'bichos', 'tallo_blando', 'se_caen', 'moho', 'enrolladas', 'arrugadas', 'estirada'] as const
export type Sintoma = (typeof SINTOMAS)[number]
export const TIERRAS = ['mojada', 'humeda', 'seca'] as const
export type Tierra = (typeof TIERRAS)[number]
export const CAMBIOS = ['trasplante', 'vivero', 'lugar', 'riego', 'temperatura', 'abono', 'poda', 'nada'] as const
export type Cambio = (typeof CAMBIOS)[number]
export const CAUSAS = ['exceso_riego', 'raices_podridas', 'falta_riego', 'falta_luz', 'demasiado_sol', 'aire_seco', 'plaga', 'mosquitas', 'hongos', 'exceso_abono', 'adaptacion', 'temperatura', 'hoja_vieja', 'sin_pista'] as const
export type CausaId = (typeof CAUSAS)[number]
export const ESTADOS_CONTROL = ['mejor', 'igual', 'peor'] as const
export type EstadoControl = (typeof ESTADOS_CONTROL)[number]

/** Lo que se contesta al ingresar una planta (o al revisarla si empeora) */
export interface RespuestasGuardia {
  sintomas: Sintoma[]
  tierra: Tierra
  cambios: Cambio[]
  notas: string
}

/** Un control del seguimiento. Hay a lo sumo uno por día. */
export interface Control {
  fecha: string
  estado: EstadoControl
  tierra: Tierra
  nota: string
  /** Si ese día se revisaron los síntomas porque empeoró */
  sintomas?: Sintoma[]
}

/** Lo que le dijeron en una ida al vivero */
export interface VisitaVivero {
  id: string
  fecha: string
  dijo: string
}

/** La historia clínica de una planta, desde que ingresa hasta el alta o la despedida */
export interface Caso extends RespuestasGuardia {
  id: string
  plantaId: string
  /** Nombre de la planta al ingresar (así el aviso no necesita cargar el catálogo) */
  nombre: string
  /** De dónde es, en palabras ("Estante · Living"); vacío si se buscó en el catálogo */
  donde: string
  espacioId?: string
  /** Lugar del plano, si estaba ubicada */
  lugar?: string
  ingreso: string
  /** Causas posibles según la última revisión, de más a menos probable */
  causas: CausaId[]
  controles: Control[]
  /** Visitas al vivero, de la más vieja a la más nueva. Sin el dato no se contestó; vacío es "no la llevé" */
  vivero?: VisitaVivero[]
  cierre?: { fecha: string; tipo: 'alta' | 'despedida' }
  /** Marca de la foto guardada (cambia con cada foto nueva). La imagen va aparte: en el dispositivo y en el almacenamiento de la nube */
  foto?: string
}

/** Un esqueje o hijito en seguimiento. Las fechas son AAAA-MM-DD, hora local. */
export interface Hijito {
  id: string
  /** Planta del catálogo de la que salió, si se eligió una */
  plantaId: string | null
  nombre: string
  /** 'corte': un pedacito sin raíces que hay que enraizar. 'separada': salió con raíces y fue directo a otra maceta */
  origen: 'corte' | 'separada'
  /** Las separadas siempre van en tierra */
  medio: 'agua' | 'tierra'
  /** Día en que se cortó o se separó */
  inicio: string
  /** Último cambio de agua (arranca igual que `inicio`) */
  agua: string
  /** Día en que se le vieron raíces */
  raices: string | null
  /** Día en que pasó a su maceta: ahí termina el seguimiento de un corte */
  maceta: string | null
  /** Solo separadas: día en que prendió en su maceta nueva (ahí termina su seguimiento) */
  prendio: string | null
}

/** Quiz de refuerzo: cuándo fue el último y qué preguntas conviene repetir */
export interface Refuerzo {
  /** Día del último refuerzo hecho o pospuesto */
  ultimo: string | null
  /** Cuántas lecciones había completadas en ese momento */
  leccionesAlUltimo: number
  /** Preguntas falladas, como `<leccion>:<posición>`; salen de la lista al acertarlas */
  fallidas: string[]
}

export interface Coleccion {
  id: string
  nombre: string
  /** Ids de plantas del catálogo; la última agregada va primero */
  plantas: string[]
}

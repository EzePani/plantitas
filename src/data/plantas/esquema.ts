import { z } from 'zod'
import { esquemaFuente } from '../lessons/esquema'

const texto = z.string().min(1)
const confianza = z.enum(['alta', 'media', 'baja'])
/** Categorías del Modelo de luz */
export const categoriaLuz = z.enum(['directa', 'indirecta_brillante', 'indirecta_media', 'baja'])
export const toxicidad = z.enum(['segura', 'toxica', 'no_verificada'])

export const clase = z.enum(['follaje', 'suculenta', 'cactus', 'con_flor'])
export const porte = z.enum(['erguida', 'trepadora', 'colgante', 'roseta'])
export const metodoPropagacion = z.enum(['esqueje_agua', 'esqueje_tierra', 'hoja', 'division', 'hijuelos', 'acodo', 'semilla'])
const meses = z.array(z.number().int().min(1).max(12))
const foto = z.object({ archivo: texto, autor: texto, licencia: texto, url: z.string().url() })

/** Cómo crece y cómo se multiplica (src/data/plantas/cultivo-*.json). Meses del hemisferio sur. */
export const esquemaCultivo = z.object({
  porte: z.array(porte).min(1).max(2),
  tutor: z.object({ recomendado: z.enum(['si', 'opcional', 'no']), detalle: z.string() }),
  /** meses vacíos = no se poda o las fuentes no dan época: el detalle lo aclara */
  poda: z.object({ meses, detalle: texto }),
  propagacion: z.object({
    metodos: z.array(metodoPropagacion),
    /** los esquejes o hijitos enraízan en agua */
    en_agua: z.boolean(),
    meses,
    detalle: texto,
  }),
  fuentes: z.array(esquemaFuente).min(1),
  confianza,
  adaptaciones: z.array(z.string()),
})

export const esquemaPlanta = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  nombre_comun: texto,
  otros_nombres: z.array(texto),
  nombre_cientifico: texto,
  familia: texto,
  grupo: z.enum(['follaje_tropical', 'suculenta_cactus', 'amiga_humedad', 'con_flor', 'palmera']),
  /** luz con la que mejor crece */
  luz_requerida: categoriaLuz,
  /** otras categorías que aguanta sin sufrir demasiado */
  luz_tolerada: z.array(categoriaLuz),
  /** horas de sol directo por día que tolera (0 = ninguna) */
  horas_sol_directo: z.number().min(0).max(12),
  /** aguanta el sol fuerte de la tarde */
  tolera_sol_tarde: z.boolean(),
  sensibilidad_calor: z.enum(['baja', 'media', 'alta']),
  luz: z.object({
    detalle: texto,
    /** confianza de luz_requerida y luz_tolerada */
    confianza,
    /** confianza de horas de sol, sol de tarde y calor ("baja" = estimación sin verificar) */
    confianza_sol: confianza,
  }),
  riego: z.object({
    nivel: z.enum(['bajo', 'medio', 'alto']),
    verano: texto,
    invierno: texto,
    confianza,
  }),
  humedad: z.object({ nivel: z.enum(['baja', 'media', 'alta']), detalle: texto, confianza }),
  sustrato: z.object({ tipo: texto, confianza }),
  /** 1 = se resiente enseguida, 5 = aguanta semanas de olvido */
  tolerancia_descuido: z.number().int().min(1).max(5),
  apta: z.object({ interior: z.boolean(), balcon: z.boolean(), nota_balcon: z.string() }),
  tamano: z.enum(['chica', 'mediana', 'grande']),
  dificultad: z.enum(['facil', 'media', 'dificil']),
  tip: texto,
  /** qué tipo de planta es, para clasificar el catálogo (una planta puede ser cactus y con flor) */
  clases: z.array(clase).min(1),
  cultivo: esquemaCultivo,
  imagen: z.string().nullable(),
  /** fotos que se suman a la principal en el carrusel de la ficha */
  fotos_extra: z.array(foto),
  atribucion_imagen: z.object({ autor: texto, licencia: texto, url: z.string().url() }).nullable(),
  mascotas: z.object({
    toxicidad_gato: toxicidad,
    toxicidad_perro: toxicidad,
    gravedad: z.enum(['leve', 'moderada', 'grave']).nullable(),
    sintomas: z.string().nullable(),
    partes: z.string().nullable(),
    atractivo_para_mascotas: z.enum(['alto', 'medio', 'bajo', 'desconocido']),
    atractivo_motivo: z.string(),
    repelencia_por_olor: z.enum(['reconocida', 'anecdotica', 'ninguna']),
    nota_mascotas: texto,
    /** solo para casos especialmente peligrosos: se muestra como advertencia grande */
    advertencia_grave: z.string().nullable(),
    confianza,
    fuentes_toxicidad: z.array(esquemaFuente),
  }),
  fuentes: z.array(esquemaFuente),
  confianza,
  /** adaptaciones hechas desde fuentes del hemisferio norte */
  adaptaciones: z.array(z.string()),
  discrepancias: z.array(z.string()),
})

export type Planta = z.infer<typeof esquemaPlanta>
export type Cultivo = z.infer<typeof esquemaCultivo>
export type Clase = z.infer<typeof clase>
export type Porte = z.infer<typeof porte>
export type MetodoPropagacion = z.infer<typeof metodoPropagacion>
export type FotoExtra = z.infer<typeof foto>
export type CategoriaLuz = z.infer<typeof categoriaLuz>
export type Toxicidad = z.infer<typeof toxicidad>

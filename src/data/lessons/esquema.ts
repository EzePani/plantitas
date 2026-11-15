import { z } from 'zod'

const texto = z.string().min(1)

const tarjetaSimple = z.object({
  tipo: z.enum(['concepto', 'por_que', 'dato_ba']),
  imagen: texto,
  texto,
})
const tarjetaComparativa = z.object({
  tipo: z.literal('comparativa'),
  imagen_mal: texto,
  imagen_bien: texto,
  texto,
})
const tarjetaTactil = z.object({
  tipo: z.literal('tactil'),
  imagen: texto,
  texto,
  zonas: z.array(z.object({ id: texto, etiqueta: texto, texto })).min(2),
})
export const esquemaTarjeta = z.union([tarjetaSimple, tarjetaComparativa, tarjetaTactil])

export const esquemaPregunta = z.union([
  z.object({
    tipo: z.literal('opcion_multiple'),
    pregunta: texto,
    opciones: z.array(texto).min(2).max(4),
    correcta: z.number().int().min(0),
    explicacion: texto,
  }),
  z.object({
    tipo: z.literal('verdadero_falso'),
    pregunta: texto,
    correcta: z.boolean(),
    explicacion: texto,
  }),
  z.object({
    tipo: z.literal('que_le_pasa'),
    pregunta: texto,
    imagen: texto,
    opciones: z.array(texto).min(2).max(4),
    correcta: z.number().int().min(0),
    explicacion: texto,
  }),
  z.object({
    tipo: z.literal('unir'),
    pregunta: texto,
    pares: z.array(z.object({ a: texto, b: texto })).min(2).max(5),
    explicacion: texto,
  }),
])

export const esquemaFuente = z.object({
  titulo: texto,
  org: texto,
  url: z.string().url(),
  fecha_consulta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const esquemaLeccion = z.object({
  id: z.string().regex(/^[a-z]+-\d+$/),
  unidad: texto,
  titulo: texto,
  gancho: texto,
  tarjetas: z.array(esquemaTarjeta).min(1).max(6),
  para_llevarte: z.array(texto).length(3),
  quiz: z.array(esquemaPregunta).min(1).max(5),
  fuentes: z.array(esquemaFuente),
  confianza: z.enum(['alta', 'media', 'baja']),
  /** "no_verificado": borrador sin fuentes contrastadas (se muestra con aviso) */
  estado: z.literal('no_verificado').optional(),
  xp: z.number().int().positive(),
})

export type Tarjeta = z.infer<typeof esquemaTarjeta>
export type Pregunta = z.infer<typeof esquemaPregunta>
export type Fuente = z.infer<typeof esquemaFuente>
export type Leccion = z.infer<typeof esquemaLeccion>

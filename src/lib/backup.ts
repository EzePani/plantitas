import { z } from 'zod'
import type { DatosPersistidos } from './tipos'

/** Versión del formato de datos persistidos. Subir al cambiar el modelo y agregar migración. */
export const VERSION_DATOS = 1
const MAX_BYTES = 1_000_000

const idSeguro = z.string().regex(/^[a-z0-9-]{1,60}$/)
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const unidad = z.enum([
  'basico',
  'luz',
  'riego',
  'familias',
  'macetas',
  'abono',
  'agua',
  'mascotas',
  'comprar',
])

export const esquemaDatos = z.object({
  onboardingCompleto: z.boolean(),
  respuestas: z
    .object({
      experiencia: z.enum(['nunca', 'murieron', 'algunas', 'bastante']),
      aciertosTest: z.number().int().min(0).max(3).optional(),
      lugar: z.enum(['interior', 'balcon', 'ambos']),
      abertura: z.enum(['ventana', 'balcon', 'ambas']),
      horaSol: z.enum(['manana', 'mediodia', 'tarde', 'todo_el_dia', 'casi_nunca', 'no_se']),
      tiempo: z.enum(['casi_nada', 'un_rato', 'me_encanta']),
      objetivo: z.enum(['basico', 'elegir', 'a_fondo']),
    })
    .nullable(),
  perfil: z.enum(['primerizo', 'sobreviviente', 'en_camino', 'experimentado']).nullable(),
  mascotas: z.object({
    tipo: z.enum(['gato', 'perro', 'ambos', 'ninguna']),
    muerde: z.enum(['siempre', 'a_veces', 'nunca', 'no_se']).optional(),
    alcance: z.enum(['todo', 'bajo', 'puedo_aislar']).optional(),
  }),
  completadas: z.record(
    idSeguro,
    z.object({
      fecha,
      aciertos: z.number().int().min(0).max(100),
      total: z.number().int().min(0).max(100),
    }),
  ),
  salteadas: z.array(unidad).max(20),
  xp: z.number().int().min(0).max(1_000_000),
  racha: z.object({ dias: z.number().int().min(0).max(100_000), ultima: fecha.nullable() }),
  insignias: z.record(idSeguro, fecha),
  semillas: z.array(unidad).max(20),
  espacios: z
    .array(
      z.object({
        id: idSeguro,
        nombre: z.string().max(80),
        creado: fecha,
        datos: z.record(idSeguro, z.string().max(80)),
        plantas: z.array(idSeguro).max(20),
      }),
    )
    .max(50),
})

const esquemaBackup = z.object({
  app: z.literal('plantitas'),
  version: z.number().int().min(1),
  exportado: z.string().max(40),
  datos: z.unknown(),
})

export interface Backup {
  app: 'plantitas'
  version: number
  exportado: string
  datos: DatosPersistidos
}

/**
 * Migraciones entre versiones del formato: MIGRACIONES[n] lleva los datos de la versión n a la n+1.
 * Hoy solo existe la versión 1, así que está vacío.
 */
const MIGRACIONES: Record<number, (datos: unknown) => unknown> = {}

export function migrar(datos: unknown, desde: number): unknown {
  let actual = datos
  for (let v = desde; v < VERSION_DATOS; v++) {
    const paso = MIGRACIONES[v]
    if (paso) actual = paso(actual)
  }
  return actual
}

export function crearBackup(datos: DatosPersistidos, ahora: Date = new Date()): Backup {
  return { app: 'plantitas', version: VERSION_DATOS, exportado: ahora.toISOString(), datos }
}

export type ErrorImportacion = 'vacio' | 'muy_grande' | 'no_es_json' | 'no_es_backup' | 'version_futura' | 'datos_invalidos'

export type ResultadoImportacion =
  | { ok: true; datos: DatosPersistidos }
  | { ok: false; error: ErrorImportacion }

/** Valida un backup. Nunca tira excepciones ni toca el estado: solo devuelve el resultado. */
export function leerBackup(texto: string): ResultadoImportacion {
  if (!texto.trim()) return { ok: false, error: 'vacio' }
  if (texto.length > MAX_BYTES) return { ok: false, error: 'muy_grande' }
  let crudo: unknown
  try {
    crudo = JSON.parse(texto)
  } catch {
    return { ok: false, error: 'no_es_json' }
  }
  const sobre = esquemaBackup.safeParse(crudo)
  if (!sobre.success) return { ok: false, error: 'no_es_backup' }
  if (sobre.data.version > VERSION_DATOS) return { ok: false, error: 'version_futura' }
  let migrado: unknown
  try {
    migrado = migrar(sobre.data.datos, sobre.data.version)
  } catch {
    return { ok: false, error: 'datos_invalidos' }
  }
  const datos = esquemaDatos.safeParse(migrado)
  if (!datos.success) return { ok: false, error: 'datos_invalidos' }
  return { ok: true, datos: datos.data }
}

export function nombreDeBackup(hoy: string): string {
  return `plantitas-backup-${hoy}.json`
}

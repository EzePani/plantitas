import { describe, expect, it } from 'vitest'
import { VERSION_DATOS, esquemaDatos, leerBackup, migrar } from './backup'
import { derivarLuz } from './luz'

/** Estado tal como lo guardaba la versión 1 de la app (9 unidades, luz por horario de sol) */
const v1 = {
  onboardingCompleto: true,
  respuestas: { experiencia: 'murieron', lugar: 'ambos', abertura: 'ventana', horaSol: 'tarde', tiempo: 'casi_nada', objetivo: 'basico' },
  perfil: 'sobreviviente',
  mascotas: { tipo: 'gato', muerde: 'a_veces', alcance: 'bajo' },
  completadas: {
    'basico-1': { fecha: '2026-11-10', aciertos: 3, total: 3 },
    'basico-2': { fecha: '2026-11-11', aciertos: 2, total: 3 },
    'basico-3': { fecha: '2026-11-12', aciertos: 3, total: 3 },
    'repaso-basico': { fecha: '2026-11-12', aciertos: 4, total: 4 },
    'luz-3': { fecha: '2026-11-13', aciertos: 1, total: 2 },
    'riego-1': { fecha: '2026-11-13', aciertos: 2, total: 2 },
    'macetas-1': { fecha: '2026-11-14', aciertos: 4, total: 4 },
    'macetas-3': { fecha: '2026-11-14', aciertos: 3, total: 4 },
    'mascotas-2': { fecha: '2026-11-14', aciertos: 5, total: 5 },
  },
  salteadas: ['luz'],
  xp: 312,
  racha: { dias: 5, ultima: '2026-11-14' },
  insignias: { 'primera-leccion': '2026-11-10', 'racha-3': '2026-11-12', 'modulo-completo': '2026-11-12' },
  semillas: ['basico'],
  espacios: [
    { id: 'living-abc', nombre: 'Living', creado: '2026-11-13', datos: { tipo: 'living', horaSol: 'manana', tamano: 'mediano', mascotas: 'gato', esfuerzo: 'poco' }, plantas: ['cinta', 'peperomia'] },
    { id: 'bano-abd', nombre: 'Baño', creado: '2026-11-14', datos: { tipo: 'bano', horaSol: 'casi_nunca', tamano: 'chico', mascotas: 'ninguna', esfuerzo: 'medio' }, plantas: [] },
  ],
}

const migrado = () => {
  const r = esquemaDatos.safeParse(migrar(structuredClone(v1), 1))
  if (!r.success) throw new Error(r.error.message)
  return r.data
}

describe('migración v1 → v2', () => {
  it('el resultado es un estado válido de la versión actual', () => {
    expect(VERSION_DATOS).toBe(4)
    expect(esquemaDatos.safeParse(migrar(structuredClone(v1), 1)).success).toBe(true)
  })

  it('no pierde perfil, mascotas, XP, racha ni insignias', () => {
    const d = migrado()
    expect(d.perfil).toBe('sobreviviente')
    expect(d.onboardingCompleto).toBe(true)
    expect(d.mascotas).toEqual(v1.mascotas)
    expect(d.xp).toBe(312)
    expect(d.racha).toEqual(v1.racha)
    expect(d.insignias).toEqual(v1.insignias)
    expect(d.semillas).toEqual(['basico'])
    expect(d.salteadas).toEqual(['luz'])
  })

  it('conserva todas las lecciones hechas, con sus ids nuevos y sus puntajes', () => {
    const d = migrado()
    expect(Object.keys(d.completadas)).toHaveLength(Object.keys(v1.completadas).length)
    expect(d.completadas['basico-1']).toEqual(v1.completadas['basico-1'])
    expect(d.completadas['basico-3']).toEqual(v1.completadas['basico-2'])
    expect(d.completadas['basico-4']).toEqual(v1.completadas['basico-3'])
    expect(d.completadas['basico-2']).toBeUndefined()
    expect(d.completadas['luz-4']).toEqual(v1.completadas['luz-3'])
    expect(d.completadas['luz-3']).toBeUndefined()
    expect(d.completadas['riego-1']).toEqual(v1.completadas['riego-1'])
    expect(d.completadas['macetas-2']).toEqual(v1.completadas['macetas-1'])
    expect(d.completadas['macetas-6']).toEqual(v1.completadas['macetas-3'])
    expect(d.completadas['mascotas-2']).toEqual(v1.completadas['mascotas-2'])
    expect(d.completadas['repaso-basico']).toEqual(v1.completadas['repaso-basico'])
  })

  it('convierte los espacios guardados al perfil de luz nuevo', () => {
    const d = migrado()
    expect(d.espacios).toHaveLength(2)
    expect(d.espacios[0]).toEqual({
      id: 'living-abc',
      nombre: 'Living',
      creado: '2026-11-13',
      tipo: 'living',
      luz: { tipo: 'directa', tramos: [{ desde: 8, hasta: 12 }], obstaculos: [] },
      tamano: 'mediano',
      mascotas: 'gato',
      esfuerzo: 'poco',
    })
    expect(d.espacios[1].luz).toEqual({ tipo: 'baja', tramos: [], obstaculos: [] })
  })

  it('el horario viejo y el perfil nuevo dan la misma orientación', () => {
    const casos = { manana: 'este', mediodia: 'norte', tarde: 'oeste', todo_el_dia: 'norte', casi_nunca: 'sur', no_se: 'desconocida' }
    for (const [horaSol, orientacion] of Object.entries(casos)) {
      const d = esquemaDatos.parse(migrar({ ...structuredClone(v1), espacios: [{ ...v1.espacios[0], datos: { ...v1.espacios[0].datos, horaSol } }] }, 1))
      expect(derivarLuz(d.espacios[0].luz).orientacion, horaSol).toBe(orientacion)
    }
  })

  it('saca del perfil las respuestas de luz viejas', () => {
    expect(migrado().respuestas).toEqual({ experiencia: 'murieron', lugar: 'ambos', tiempo: 'casi_nada', objetivo: 'basico' })
  })

  it('si no había espacios guardados, arma los del onboarding con el horario que se había cargado', () => {
    const d = esquemaDatos.parse(migrar({ ...structuredClone(v1), espacios: [] }, 1))
    expect(d.espacios.map((e) => e.tipo)).toEqual(['living', 'balcon'])
    for (const e of d.espacios) {
      expect(e.luz).toEqual({ tipo: 'directa', tramos: [{ desde: 14, hasta: 18 }], obstaculos: [] })
      expect(e).toMatchObject({ mascotas: 'gato', esfuerzo: 'poco', tamano: 'mediano' })
    }
  })

  it('un estado sin onboarding migra sin inventar espacios', () => {
    const vacio = { onboardingCompleto: false, respuestas: null, perfil: null, mascotas: { tipo: 'ninguna' }, completadas: {}, salteadas: [], xp: 0, racha: { dias: 0, ultima: null }, insignias: {}, semillas: [], espacios: [] }
    expect(esquemaDatos.parse(migrar(vacio, 1))).toEqual({ ...vacio, favoritas: [], colecciones: [] })
  })

  it('renombra la unidad "agua" si estaba salteada o con semilla', () => {
    const d = esquemaDatos.parse(migrar({ ...structuredClone(v1), salteadas: ['agua', 'luz'], semillas: ['agua'] }, 1))
    expect(d.salteadas).toEqual(['multiplicar', 'luz'])
    expect(d.semillas).toEqual(['multiplicar'])
  })

  it('un backup exportado con la versión 1 se importa sin perder nada', () => {
    const r = leerBackup(JSON.stringify({ app: 'plantitas', version: 1, exportado: '2026-11-14T12:00:00.000Z', datos: v1 }))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.datos.xp).toBe(312)
    expect(r.datos.espacios).toHaveLength(2)
    expect(r.datos.completadas['basico-4']).toBeDefined()
  })

  it('migrar datos rotos no tira excepciones', () => {
    for (const roto of [null, 5, 'x', [], { espacios: 'no', completadas: 7, respuestas: 3 }]) {
      expect(() => migrar(roto, 1)).not.toThrow()
      expect(esquemaDatos.safeParse(migrar(roto, 1)).success).toBe(false)
    }
  })

  it('los datos de la versión actual no se tocan', () => {
    const d = migrado()
    expect(migrar(d, VERSION_DATOS)).toBe(d)
  })
})

describe('migración v2 → v3', () => {
  const v2 = () => ({ ...structuredClone(migrado()), favoritas: undefined })

  it('agrega la lista de favoritas vacía y no toca nada más', () => {
    const { favoritas: _f, ...base } = v2()
    const d = esquemaDatos.parse(migrar(structuredClone(base), 2))
    expect(d.favoritas).toEqual([])
    expect(d.xp).toBe(312)
    expect(d.espacios).toHaveLength(2)
    expect(d.completadas['basico-4']).toBeDefined()
  })

  it('un backup de la versión 2 se importa y arranca sin favoritas', () => {
    const { favoritas: _f, ...base } = v2()
    const r = leerBackup(JSON.stringify({ app: 'plantitas', version: 2, exportado: '2026-11-15T12:00:00.000Z', datos: base }))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.datos.favoritas).toEqual([])
  })

  it('si ya traía favoritas, las conserva', () => {
    const d = esquemaDatos.parse(migrar({ ...v2(), favoritas: ['monstera'] }, 2))
    expect(d.favoritas).toEqual(['monstera'])
  })
})


describe('migración v3 → v4', () => {
  const v3 = () => {
    const { colecciones: _c, ...base } = structuredClone(migrado())
    return base
  }

  it('agrega la lista de colecciones vacía y no toca nada más', () => {
    const d = esquemaDatos.parse(migrar(v3(), 3))
    expect(d.colecciones).toEqual([])
    expect(d.favoritas).toEqual(migrado().favoritas)
    expect(d.xp).toBe(312)
  })

  it('un backup de la versión 3 se importa y arranca sin colecciones', () => {
    const r = leerBackup(JSON.stringify({ app: 'plantitas', version: 3, exportado: '2026-11-20T12:00:00.000Z', datos: v3() }))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.datos.colecciones).toEqual([])
  })

  it('si ya traía colecciones, las conserva', () => {
    const cols = [{ id: 'col-a', nombre: 'Sala', plantas: ['monstera'] }]
    expect(esquemaDatos.parse(migrar({ ...v3(), colecciones: cols }, 3)).colecciones).toEqual(cols)
  })
})

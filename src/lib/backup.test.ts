import { describe, expect, it } from 'vitest'
import { VERSION_DATOS, crearBackup, leerBackup, nombreDeBackup } from './backup'
import type { DatosPersistidos } from './tipos'

const datos: DatosPersistidos = {
  onboardingCompleto: true,
  respuestas: { experiencia: 'bastante', aciertosTest: 2, lugar: 'ambos', abertura: 'ventana', horaSol: 'manana', tiempo: 'un_rato', objetivo: 'a_fondo' },
  perfil: 'experimentado',
  mascotas: { tipo: 'gato', muerde: 'a_veces', alcance: 'bajo' },
  completadas: { 'riego-1': { fecha: '2026-11-14', aciertos: 2, total: 3 }, 'repaso-riego': { fecha: '2026-11-14', aciertos: 4, total: 4 } },
  salteadas: ['basico'],
  xp: 134,
  racha: { dias: 3, ultima: '2026-11-14' },
  insignias: { 'primera-leccion': '2026-11-12' },
  semillas: ['basico'],
  espacios: [{ id: 'living-1', nombre: 'Living', creado: '2026-11-14', datos: { sol: 'manana' }, plantas: ['potus'] }],
}

const serializar = (d: unknown, version = VERSION_DATOS) => JSON.stringify({ app: 'plantitas', version, exportado: '2026-11-14T12:00:00.000Z', datos: d })

describe('backup', () => {
  it('exportar → importar devuelve el mismo estado', () => {
    const r = leerBackup(JSON.stringify(crearBackup(datos)))
    expect(r).toEqual({ ok: true, datos })
  })

  it('arma el nombre del archivo con la fecha', () => {
    expect(nombreDeBackup('2026-11-14')).toBe('plantitas-backup-2026-11-14.json')
  })

  it('rechaza archivos que no son un backup, sin tirar excepciones', () => {
    expect(leerBackup('')).toEqual({ ok: false, error: 'vacio' })
    expect(leerBackup('hola {')).toEqual({ ok: false, error: 'no_es_json' })
    expect(leerBackup('null')).toEqual({ ok: false, error: 'no_es_backup' })
    expect(leerBackup('[1,2,3]')).toEqual({ ok: false, error: 'no_es_backup' })
    expect(leerBackup(JSON.stringify({ app: 'otra', version: 1, exportado: '', datos }))).toEqual({ ok: false, error: 'no_es_backup' })
    expect(leerBackup('x'.repeat(1_000_001))).toEqual({ ok: false, error: 'muy_grande' })
  })

  it('rechaza un backup de una versión futura', () => {
    expect(leerBackup(serializar(datos, VERSION_DATOS + 1))).toEqual({ ok: false, error: 'version_futura' })
  })

  it('rechaza datos con tipos o valores inválidos', () => {
    const malos: unknown[] = [
      { ...datos, xp: -5 },
      { ...datos, xp: '134' },
      { ...datos, perfil: 'hacker' },
      { ...datos, mascotas: { tipo: 'dragon' } },
      { ...datos, racha: { dias: 3, ultima: 'ayer' } },
      { ...datos, completadas: { 'riego-1': { fecha: '2026-11-14', aciertos: 2 } } },
      { ...datos, completadas: { '<script>alert(1)</script>': { fecha: '2026-11-14', aciertos: 1, total: 1 } } },
      { ...datos, salteadas: ['no-existe'] },
      { ...datos, espacios: 'muchos' },
      { xp: 10 },
    ]
    for (const m of malos) expect(leerBackup(serializar(m))).toEqual({ ok: false, error: 'datos_invalidos' })
  })

  it('un backup malicioso no contamina prototipos ni cuela campos extra', () => {
    const texto = `{"app":"plantitas","version":1,"exportado":"x","__proto__":{"admin":true},"datos":${JSON.stringify({ ...datos, reiniciar: 'pisado', completarNodo: 1 }).replace('{', '{"__proto__":{"contaminado":true},')}}`
    const r = leerBackup(texto)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.datos).toEqual(datos)
    expect(Object.keys(r.datos)).not.toContain('reiniciar')
    expect(({} as Record<string, unknown>).contaminado).toBeUndefined()
    expect(({} as Record<string, unknown>).admin).toBeUndefined()
    expect((r.datos as unknown as Record<string, unknown>).contaminado).toBeUndefined()
  })

  it('descarta claves peligrosas dentro de los registros sin contaminar nada', () => {
    const texto = serializar(datos).replace('"riego-1"', '"__proto__"')
    const r = leerBackup(texto)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(Object.keys(r.datos.completadas)).toEqual(['repaso-riego'])
    expect(Object.getPrototypeOf(r.datos.completadas)).toBe(Object.prototype)
    expect(({} as Record<string, unknown>).fecha).toBeUndefined()
  })
})

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PLANTAS } from './index'
import { esquemaPlanta } from './esquema'

/**
 * Valida un lote de plantas nuevas antes de sumarlo al catálogo:
 *   LOTE=investigacion/nuevas/plantas-d.json npx vitest run src/data/plantas/validar-lote.test.ts
 * Sin LOTE, el test se saltea.
 */
const archivo = process.env.LOTE
describe.skipIf(!archivo)('lote de plantas nuevas', () => {
  const lote = archivo ? (JSON.parse(readFileSync(archivo, 'utf8')) as Record<string, any>[]) : []
  const existentes = new Set(PLANTAS.map((p) => p.id))

  it('cada planta cumple el esquema completo (cuidados, cultivo y clases)', () => {
    expect(lote.length).toBeGreaterThan(0)
    for (const p of lote) {
      const r = esquemaPlanta.safeParse(p)
      expect(r.success, `${p.id}: ${r.success ? '' : JSON.stringify(r.error.issues.slice(0, 4))}`).toBe(true)
    }
  })

  it('ids nuevos y únicos', () => {
    const ids = lote.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(existentes.has(id), `${id} ya existe`).toBe(false)
  })

  it('al menos 2 fuentes de cuidados, sin URLs repetidas, y sin foto todavía', () => {
    for (const p of lote) {
      expect(p.fuentes.length, p.id).toBeGreaterThanOrEqual(2)
      expect(new Set(p.fuentes.map((f: any) => f.url)).size, p.id).toBe(p.fuentes.length)
      expect(p.imagen, p.id).toBeNull()
      expect(p.fotos_extra, p.id).toEqual([])
    }
  })

  it('toxicidad: lo afirmado tiene fuente; las tóxicas informan gravedad y síntomas; las seguras no', () => {
    for (const p of lote) {
      const m = p.mascotas
      const afirma = m.toxicidad_gato !== 'no_verificada' || m.toxicidad_perro !== 'no_verificada'
      if (afirma) expect(m.fuentes_toxicidad.length, p.id).toBeGreaterThanOrEqual(1)
      if (afirma && m.confianza === 'alta') expect(m.fuentes_toxicidad.length, `${p.id} (alta)`).toBeGreaterThanOrEqual(2)
      const toxica = m.toxicidad_gato === 'toxica' || m.toxicidad_perro === 'toxica'
      if (toxica) {
        expect(m.gravedad, p.id).not.toBeNull()
        expect(m.sintomas, p.id).toBeTruthy()
      } else {
        expect(m.gravedad, p.id).toBeNull()
        expect(m.advertencia_grave, p.id).toBeNull()
      }
    }
  })

  it('luz coherente con el Modelo de luz', () => {
    for (const p of lote) {
      expect(p.luz_tolerada, p.id).not.toContain(p.luz_requerida)
      if (p.luz_requerida === 'directa') expect(p.horas_sol_directo, p.id).toBeGreaterThan(0)
      if (p.horas_sol_directo === 0) expect(p.tolera_sol_tarde, p.id).toBe(false)
    }
  })

  it('cultivo: meses entre 1 y 12, y fuentes sin repetir', () => {
    for (const p of lote) {
      const c = p.cultivo
      for (const m of [...c.poda.meses, ...c.propagacion.meses]) expect(m >= 1 && m <= 12, p.id).toBe(true)
      expect(new Set(c.fuentes.map((f: any) => f.url)).size, p.id).toBe(c.fuentes.length)
    }
  })
})

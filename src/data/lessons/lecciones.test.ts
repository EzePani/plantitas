import { describe, expect, it } from 'vitest'
import { TOTAL_LECCIONES, UNIDADES, idsDelPlan } from '../unidades'
import { esquemaLeccion } from './esquema'
import { LECCIONES, preguntasDeUnidad } from './contenido'
import type { UnidadId } from '../../lib/tipos'

const todas = Object.values(LECCIONES).flat()

describe('lecciones', () => {
  it('todas cumplen el esquema', () => {
    for (const l of todas) {
      const r = esquemaLeccion.safeParse(l)
      expect(r.success, `${l.id}: ${r.success ? '' : r.error.message}`).toBe(true)
    }
  })

  it('la estructura tiene 12 unidades y 49 lecciones, en 3 tandas', () => {
    const us = Object.values(UNIDADES)
    expect(us).toHaveLength(12)
    expect(us.map((x) => x.numero).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect(TOTAL_LECCIONES).toBe(49)
    const porTanda = (t: number) => us.filter((x) => x.tanda === t)
    expect(porTanda(1).map((x) => x.numero).sort((a, b) => a - b)).toEqual([1, 2, 3, 12])
    expect(porTanda(1).reduce((n, x) => n + x.plan.length, 0)).toBe(16)
    expect(porTanda(2).reduce((n, x) => n + x.plan.length, 0)).toBe(21)
    expect(porTanda(3).reduce((n, x) => n + x.plan.length, 0)).toBe(12)
  })

  it('ids únicos, dentro del plan de su unidad, y en el orden del plan', () => {
    expect(new Set(todas.map((l) => l.id)).size).toBe(todas.length)
    for (const [unidad, ls] of Object.entries(LECCIONES)) {
      const plan = idsDelPlan(unidad as UnidadId)
      for (const l of ls) {
        expect(l.unidad).toBe(unidad)
        expect(plan, l.id).toContain(l.id)
      }
      // en el mismo orden que el plan
      expect(ls.map((l) => l.id)).toEqual(plan.filter((id) => ls.some((l) => l.id === id)))
    }
  })

  it('las 3 tandas están completas: 49 lecciones con contenido', () => {
    for (const x of Object.values(UNIDADES)) expect((LECCIONES[x.id] ?? []).map((l) => l.id), x.id).toEqual(idsDelPlan(x.id))
    expect(todas).toHaveLength(TOTAL_LECCIONES)
    for (const l of todas) expect(l.estado, l.id).toBeUndefined()
  })

  it('las respuestas correctas apuntan a una opción que existe', () => {
    for (const l of todas)
      for (const p of l.quiz)
        if (p.tipo === 'opcion_multiple' || p.tipo === 'que_le_pasa') expect(p.correcta, l.id).toBeLessThan(p.opciones.length)
  })

  it('máximo 2 oraciones por tarjeta', () => {
    for (const l of todas)
      for (const t of l.tarjetas) {
        const oraciones = t.texto.split(/[.!?]+(?:\s|$)/).filter((o) => o.trim()).length
        expect(oraciones, `${l.id}: "${t.texto}"`).toBeLessThanOrEqual(2)
      }
  })

  it('lo que no tiene fuentes está marcado como no verificado y con confianza baja', () => {
    for (const l of todas)
      if (l.fuentes.length < 2) {
        expect(l.estado, l.id).toBe('no_verificado')
        expect(l.confianza, l.id).toBe('baja')
      }
  })

  it('arma repasos parejos entre las lecciones de la unidad', () => {
    const ps = preguntasDeUnidad('basico', 4)
    expect(ps).toHaveLength(4)
    expect(preguntasDeUnidad('plagas', 4)).toHaveLength(4)
  })
})

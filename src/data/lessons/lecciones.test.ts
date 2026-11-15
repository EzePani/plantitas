import { describe, expect, it } from 'vitest'
import { UNIDADES } from '../unidades'
import { esquemaLeccion } from './esquema'
import { LECCIONES, preguntasDeUnidad } from './index'
import type { UnidadId } from '../../lib/tipos'

const todas = Object.values(LECCIONES).flat()

describe('lecciones', () => {
  it('todas cumplen el esquema', () => {
    for (const l of todas) {
      const r = esquemaLeccion.safeParse(l)
      expect(r.success, `${l.id}: ${r.success ? '' : r.error.message}`).toBe(true)
    }
  })

  it('ids únicos y unidad coherente con el archivo', () => {
    expect(new Set(todas.map((l) => l.id)).size).toBe(todas.length)
    for (const [unidad, ls] of Object.entries(LECCIONES)) {
      expect(ls).toHaveLength(UNIDADES[unidad as UnidadId].lecciones)
      for (const l of ls) expect(l.unidad).toBe(unidad)
    }
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
    expect(preguntasDeUnidad('familias', 4)).toEqual([])
  })
})

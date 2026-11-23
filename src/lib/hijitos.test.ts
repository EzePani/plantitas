import { describe, expect, it } from 'vitest'
import { LECCIONES, leccionPorId } from '../data/lessons/contenido'
import { PLANTAS } from '../data/plantas'
import { UNIDADES } from '../data/unidades'
import { WIKI } from '../data/wiki'
import { DATOS_INICIALES } from '../store/useStore'
import { fusionar } from './fusion'
import { DIAS_CAMBIO_AGUA, estadoHijito, hijitosConAviso, ordenarHijitos } from './hijitos'
import { PREGUNTAS_REFUERZO, actualizarFallidas, armarRefuerzo, refuerzoDisponible, umbrales } from './refuerzo'
import type { Hijito } from './tipos'

const h = (x: Partial<Hijito> = {}): Hijito => ({ id: 'hij-1', plantaId: 'potus', nombre: 'Potus', medio: 'agua', inicio: '2026-11-10', agua: '2026-11-10', raices: null, maceta: null, ...x })

describe('hijitos', () => {
  it('avisa del agua recién a los días indicados, y solo si está en agua', () => {
    expect(DIAS_CAMBIO_AGUA).toBe(4)
    expect(estadoHijito(h(), '2026-11-13')).toEqual({ etapa: 'enraizando', dias: 3, tocaAgua: false })
    expect(estadoHijito(h(), '2026-11-14').tocaAgua).toBe(true)
    expect(estadoHijito(h({ agua: '2026-11-14' }), '2026-11-15').tocaAgua).toBe(false)
    expect(estadoHijito(h({ medio: 'tierra' }), '2026-11-30').tocaAgua).toBe(false)
  })

  it('pasa de enraizando a con raíces y a maceta, y en maceta deja de contar y de avisar', () => {
    expect(estadoHijito(h({ raices: '2026-11-25' }), '2026-11-26').etapa).toBe('con_raices')
    expect(estadoHijito(h({ raices: '2026-11-25', maceta: '2026-11-30' }), '2026-12-20')).toEqual({ etapa: 'en_maceta', dias: 20, tocaAgua: false })
  })

  it('ordena primero los que piden agua y al final los que ya están en maceta', () => {
    const lista = [h({ id: 'maceta', maceta: '2026-11-12' }), h({ id: 'al-dia', agua: '2026-11-19' }), h({ id: 'agua' })]
    expect(ordenarHijitos(lista, '2026-11-20').map((x) => x.id)).toEqual(['agua', 'al-dia', 'maceta'])
    expect(hijitosConAviso(lista, '2026-11-20')).toBe(1)
  })

  it('al sincronizar se juntan por id y cada dato queda con lo más avanzado', () => {
    const a = { ...DATOS_INICIALES, hijitos: [h({ agua: '2026-11-18' }), h({ id: 'hij-2' })] }
    const b = { ...DATOS_INICIALES, hijitos: [h({ agua: '2026-11-14', raices: '2026-11-17' }), h({ id: 'hij-3' })] }
    const r = fusionar(a, b).hijitos
    expect(r.map((x) => x.id)).toEqual(['hij-1', 'hij-2', 'hij-3'])
    expect(r[0]).toMatchObject({ agua: '2026-11-18', raices: '2026-11-17' })
  })

  it('la ficha de la guía que enlaza la tarjeta existe', () => {
    expect(WIKI.some((e) => e.id === 'propagar-en-agua')).toBe(true)
  })
})

describe('quiz de refuerzo', () => {
  const reg = { fecha: '2026-11-10', aciertos: 3, total: 3 }
  const completadas = (n: number) => Object.fromEntries(['basico-1', 'basico-2', 'basico-3', 'basico-4', 'luz-1', 'luz-2', 'luz-3'].slice(0, n).map((id) => [id, reg]))
  const sin = { ultimo: null, leccionesAlUltimo: 0, fallidas: [] }

  it('no aparece con menos de 3 lecciones hechas', () => {
    expect(refuerzoDisponible({ completadas: completadas(2), refuerzo: sin }, '2026-11-20')).toBe(false)
    expect(refuerzoDisponible({ completadas: { ...completadas(2), 'repaso-basico': reg }, refuerzo: sin }, '2026-11-20')).toBe(false)
  })

  it('aparece después de 2 a 4 lecciones nuevas o de 3 a 5 días', () => {
    for (let n = 0; n < 40; n++) {
      const u = umbrales({ ultimo: `2026-11-${String((n % 28) + 1).padStart(2, '0')}`, leccionesAlUltimo: n, fallidas: [] })
      expect(u.lecciones).toBeGreaterThanOrEqual(2)
      expect(u.lecciones).toBeLessThanOrEqual(4)
      expect(u.dias).toBeGreaterThanOrEqual(3)
      expect(u.dias).toBeLessThanOrEqual(5)
    }
    expect(refuerzoDisponible({ completadas: completadas(4), refuerzo: sin }, '2026-11-20')).toBe(true)
    // Recién hecho: no vuelve el mismo día, pero sí cuando pasan los días
    const hecho = { ultimo: '2026-11-20', leccionesAlUltimo: 4, fallidas: [] }
    expect(refuerzoDisponible({ completadas: completadas(4), refuerzo: hecho }, '2026-11-20')).toBe(false)
    expect(refuerzoDisponible({ completadas: completadas(4), refuerzo: hecho }, '2026-11-26')).toBe(true)
    expect(refuerzoDisponible({ completadas: completadas(7), refuerzo: hecho }, '2026-11-20')).toBe(true)
  })

  it('arma 5 preguntas de lecciones hechas, con las falladas adentro y sin repetir', () => {
    const hechas = ['basico-1', 'basico-2', 'luz-1']
    const quiz = armarRefuerzo(hechas, ['luz-1:0', 'basico-2:1', 'riego-1:0'], leccionPorId, () => 0.42)
    expect(quiz).toHaveLength(PREGUNTAS_REFUERZO)
    const claves = quiz.map((q) => q.clave)
    expect(new Set(claves).size).toBe(claves.length)
    expect(claves).toContain('luz-1:0')
    expect(claves).toContain('basico-2:1')
    // riego-1 no está hecha: su pregunta fallada no entra
    expect(claves.every((c) => hechas.includes(c.split(':')[0]))).toBe(true)
    expect(quiz.every((q) => q.pregunta.explicacion)).toBe(true)
  })

  it('reparte entre lecciones distintas cuando hay de dónde elegir', () => {
    const hechas = Object.values(LECCIONES).flat().slice(0, 10).map((l) => l.id)
    const quiz = armarRefuerzo(hechas, [], leccionPorId, () => 0.7)
    expect(new Set(quiz.map((q) => q.clave.split(':')[0])).size).toBe(PREGUNTAS_REFUERZO)
  })

  it('las falladas se anotan sin repetir y salen al acertarlas', () => {
    expect(actualizarFallidas(['a-1:0', 'a-1:1'], ['a-1:1', 'b-2:0'], ['a-1:0'])).toEqual(['a-1:1', 'b-2:0'])
  })

  it('al sincronizar vale el refuerzo más reciente y se suman las preguntas a repetir', () => {
    const a = { ...DATOS_INICIALES, refuerzo: { ultimo: '2026-11-18', leccionesAlUltimo: 6, fallidas: ['luz-1:0'] } }
    const b = { ...DATOS_INICIALES, refuerzo: { ultimo: '2026-11-20', leccionesAlUltimo: 5, fallidas: ['luz-2:1'] } }
    expect(fusionar(a, b).refuerzo).toEqual({ ultimo: '2026-11-20', leccionesAlUltimo: 6, fallidas: ['luz-1:0', 'luz-2:1'] })
  })
})

describe('mi jardín', () => {
  it('cada unidad tiene su planta del catálogo, con foto y sin repetir', () => {
    const plantas = Object.values(UNIDADES).map((u) => u.planta)
    expect(new Set(plantas).size).toBe(plantas.length)
    for (const id of plantas) expect(PLANTAS.find((p) => p.id === id)?.imagen, id).toBeTruthy()
  })
})

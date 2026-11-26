import { describe, expect, it } from 'vitest'
import { LECCIONES, leccionPorId } from '../data/lessons/contenido'
import { PLANTAS } from '../data/plantas'
import { UNIDADES } from '../data/unidades'
import { WIKI } from '../data/wiki'
import { DATOS_INICIALES } from '../store/useStore'
import { fusionar } from './fusion'
import { fechaCorta } from './fecha'
import { DIAS_CAMBIO_AGUA, corregirFechas, errorDeFechas, estadoHijito, hijitosConAviso, ordenarHijitos } from './hijitos'
import { TC } from '../data/textosCatalogo'
import { PREGUNTAS_REFUERZO, actualizarFallidas, armarRefuerzo, refuerzoDisponible, umbrales } from './refuerzo'
import type { Hijito } from './tipos'

const h = (x: Partial<Hijito> = {}): Hijito => ({ id: 'hij-1', plantaId: 'potus', nombre: 'Potus', medio: 'agua', inicio: '2026-11-10', agua: '2026-11-10', raices: null, maceta: null, ...x })

describe('fechas de los hijitos', () => {
  const hoy = '2026-11-26'
  it('acepta fechas en orden y hasta hoy', () => {
    expect(errorDeFechas({ inicio: '2026-11-01', raices: null, maceta: null }, hoy)).toBeNull()
    expect(errorDeFechas({ inicio: '2026-11-01', raices: '2026-11-19', maceta: hoy }, hoy)).toBeNull()
    expect(errorDeFechas({ inicio: hoy, raices: hoy, maceta: hoy }, hoy)).toBeNull()
    // Sin raíces anotadas igual puede haber pasado a maceta
    expect(errorDeFechas({ inicio: '2026-11-01', raices: null, maceta: '2026-11-20' }, hoy)).toBeNull()
  })
  it('rechaza fechas futuras, desordenadas o mal escritas', () => {
    expect(errorDeFechas({ inicio: '2026-11-27', raices: null, maceta: null }, hoy)).toBe('futuro')
    expect(errorDeFechas({ inicio: '2026-11-10', raices: '2026-11-09', maceta: null }, hoy)).toBe('orden')
    expect(errorDeFechas({ inicio: '2026-11-10', raices: '2026-11-20', maceta: '2026-11-15' }, hoy)).toBe('orden')
    expect(errorDeFechas({ inicio: '2026-11-10', raices: null, maceta: '2026-11-05' }, hoy)).toBe('orden')
    expect(errorDeFechas({ inicio: '', raices: null, maceta: null }, hoy)).toBe('formato')
    expect(errorDeFechas({ inicio: '2026-13-40', raices: null, maceta: null }, hoy)).toBe('formato')
  })
  it('corregir cambia las tres fechas y arrastra el agua si quedó antes del inicio', () => {
    const base = h({ inicio: '2026-11-10', agua: '2026-11-12' })
    expect(corregirFechas(base, { inicio: '2026-10-20', raices: '2026-11-07', maceta: null }, hoy)).toEqual({ ...base, inicio: '2026-10-20', raices: '2026-11-07', agua: '2026-11-12' })
    expect(corregirFechas(base, { inicio: '2026-11-20', raices: null, maceta: null }, hoy).agua).toBe('2026-11-20')
    // Se puede deshacer un "ya tiene raíces" tocado por error
    expect(corregirFechas(h({ raices: '2026-11-20' }), { inicio: '2026-11-10', raices: null, maceta: null }, hoy).raices).toBeNull()
  })
  it('si las fechas no son válidas, no toca nada', () => {
    const base = h()
    expect(corregirFechas(base, { inicio: '2026-12-01', raices: null, maceta: null }, hoy)).toBe(base)
  })
  it('muestra cuánto tardó cada etapa', () => {
    const e = estadoHijito(h({ inicio: '2026-10-01', raices: '2026-10-19', maceta: '2026-11-02' }), hoy)
    expect(TC.plantas.hijitos.tiempos(e.diasRaices, e.diasMaceta)).toBe('Raíces a los 18 días · Maceta a los 32')
    expect(TC.plantas.hijitos.tiempos(18, null)).toBe('Raíces a los 18 días')
    expect(TC.plantas.hijitos.tiempos(null, 32)).toBe('Maceta a los 32 días')
    expect(TC.plantas.hijitos.tiempos(1, 1)).toBe('Raíces al día siguiente · Maceta al día siguiente')
    expect(TC.plantas.hijitos.tiempos(null, null)).toBe('')
  })
  it('fecha corta, con año solo si es otro', () => {
    expect(fechaCorta('2026-11-04', hoy)).toBe('4 nov')
    expect(fechaCorta('2025-12-31', hoy)).toBe('31 dic 2025')
  })
})

describe('hijitos', () => {
  it('avisa del agua recién a los días indicados, y solo si está en agua', () => {
    expect(DIAS_CAMBIO_AGUA).toBe(4)
    expect(estadoHijito(h(), '2026-11-13')).toEqual({ etapa: 'enraizando', dias: 3, tocaAgua: false, diasRaices: null, diasMaceta: null })
    expect(estadoHijito(h(), '2026-11-14').tocaAgua).toBe(true)
    expect(estadoHijito(h({ agua: '2026-11-14' }), '2026-11-15').tocaAgua).toBe(false)
    expect(estadoHijito(h({ medio: 'tierra' }), '2026-11-30').tocaAgua).toBe(false)
  })

  it('pasa de enraizando a con raíces y a maceta, y en maceta deja de contar y de avisar', () => {
    expect(estadoHijito(h({ raices: '2026-11-25' }), '2026-11-26').etapa).toBe('con_raices')
    expect(estadoHijito(h({ raices: '2026-11-25', maceta: '2026-11-30' }), '2026-12-20')).toEqual({ etapa: 'en_maceta', dias: 20, tocaAgua: false, diasRaices: 15, diasMaceta: 20 })
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

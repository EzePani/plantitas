import { describe, expect, it } from 'vitest'
import { PLANTAS } from '../data/plantas'
import { WIKI } from '../data/wiki'
import { buscarEntradas, buscarLecciones, buscarPlantas } from './buscar'
import { SIN_FILTROS, alternar, filtrosActivos, pasaFiltros, rangoMeses } from './catalogo'

describe('filtros del catálogo', () => {
  it('sin filtros pasan todas', () => {
    expect(PLANTAS.every((p) => pasaFiltros(p, SIN_FILTROS))).toBe(true)
    expect(filtrosActivos(SIN_FILTROS)).toBe(0)
  })

  it('dentro de un grupo suma opciones; entre grupos las cruza', () => {
    const cactus = PLANTAS.filter((p) => pasaFiltros(p, { ...SIN_FILTROS, clases: ['cactus'] }))
    const cactusOFlor = PLANTAS.filter((p) => pasaFiltros(p, { ...SIN_FILTROS, clases: ['cactus', 'con_flor'] }))
    expect(cactus.length).toBeGreaterThan(0)
    expect(cactusOFlor.length).toBeGreaterThan(cactus.length)
    const faciles = PLANTAS.filter((p) => pasaFiltros(p, { ...SIN_FILTROS, clases: ['cactus', 'con_flor'], facil: true }))
    expect(faciles.length).toBeLessThan(cactusOFlor.length)
    expect(faciles.every((p) => p.dificultad === 'facil')).toBe(true)
  })

  it('la luz incluye la que pide y las que aguanta', () => {
    const baja = PLANTAS.filter((p) => pasaFiltros(p, { ...SIN_FILTROS, luz: ['baja'] }))
    expect(baja.length).toBeGreaterThan(0)
    expect(baja.every((p) => p.luz_requerida === 'baja' || p.luz_tolerada.includes('baja'))).toBe(true)
  })

  it('porte, tutor e hijitos en agua', () => {
    const trepadoras = PLANTAS.filter((p) => pasaFiltros(p, { ...SIN_FILTROS, porte: ['trepadora'] }))
    expect(trepadoras.map((p) => p.id)).toContain('potus')
    expect(PLANTAS.filter((p) => pasaFiltros(p, { ...SIN_FILTROS, conTutor: true })).every((p) => p.cultivo.tutor.recomendado !== 'no')).toBe(true)
    expect(PLANTAS.filter((p) => pasaFiltros(p, { ...SIN_FILTROS, enAgua: true })).every((p) => p.cultivo.propagacion.en_agua)).toBe(true)
  })

  it('cuenta los filtros activos y alterna valores', () => {
    expect(filtrosActivos({ ...SIN_FILTROS, mascotas: 'gato', clases: ['cactus', 'suculenta'], facil: true })).toBe(4)
    expect(alternar(['a'], 'b')).toEqual(['a', 'b'])
    expect(alternar(['a', 'b'], 'a')).toEqual(['b'])
  })
})

describe('rangoMeses', () => {
  it('junta meses seguidos', () => {
    expect(rangoMeses([9, 10, 11])).toBe('septiembre a noviembre')
    expect(rangoMeses([10])).toBe('octubre')
  })
  it('cruza el fin de año sin partir el tramo', () => {
    expect(rangoMeses([9, 10, 11, 12, 1, 2])).toBe('septiembre a febrero')
    expect(rangoMeses([1, 2, 12])).toBe('diciembre a febrero')
  })
  it('separa tramos sueltos', () => {
    expect(rangoMeses([3, 4, 9, 10])).toBe('marzo a abril y septiembre a octubre')
  })
  it('vacío y año completo', () => {
    expect(rangoMeses([])).toBe('')
    expect(rangoMeses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('todo el año')
  })
})

describe('buscador', () => {
  it('encuentra plantas sin importar tildes ni mayúsculas', () => {
    expect(buscarPlantas(PLANTAS, 'ORQUIDEA').map((p) => p.id)).toContain('orquidea-phalaenopsis')
    expect(buscarPlantas(PLANTAS, 'epipremnum').length).toBeGreaterThan(0)
    expect(buscarPlantas(PLANTAS, '  ')).toEqual([])
    expect(buscarPlantas(PLANTAS, 'trepadora').map((p) => p.id)).toContain('monstera')
    expect(buscarPlantas(PLANTAS, 'cactus').map((p) => p.id)).toContain('cola-de-mono-dorada')
  })
  it('encuentra conceptos por término o sinónimo, y lecciones por título', () => {
    expect(buscarEntradas(WIKI, 'sustrato')[0].id).toBe('sustrato')
    expect(buscarLecciones('trasplante').map((l) => l.id)).toContain('macetas-6')
  })
})

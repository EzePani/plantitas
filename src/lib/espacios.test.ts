import { describe, expect, it } from 'vitest'
import { DATOS_INICIALES } from '../store/useStore'
import { esquemaDatos, migrar } from './backup'
import { MAX_PLANTAS_ESPACIO, agregarPlanta, agruparPlantas, quitarPlanta, unirPlantas } from './espacios'
import { fusionar } from './fusion'
import type { Espacio } from './tipos'

const living = (plantas: Espacio['plantas'] = []): Espacio => ({ id: 'living-1', nombre: 'Living', creado: '2026-11-14', tipo: 'living', luz: { tipo: 'indirecta', tramos: [], obstaculos: [] }, tamano: 'mediano', mascotas: 'gato', esfuerzo: 'medio', plantas })

describe('plantas de un espacio', () => {
  it('se agregan del catálogo y se pueden repetir', () => {
    const e = agregarPlanta(agregarPlanta(agregarPlanta(living(), 'potus', 'pl-1'), 'sansevieria', 'pl-2'), 'potus', 'pl-3')
    expect(e.plantas).toEqual([{ id: 'pl-1', plantaId: 'potus' }, { id: 'pl-2', plantaId: 'sansevieria' }, { id: 'pl-3', plantaId: 'potus' }])
    expect(agruparPlantas(e.plantas)).toEqual([{ plantaId: 'potus', cantidad: 2 }, { plantaId: 'sansevieria', cantidad: 1 }])
  })

  it('quitar saca una sola, la última de ese tipo', () => {
    const e = living([{ id: 'pl-1', plantaId: 'potus' }, { id: 'pl-2', plantaId: 'sansevieria' }, { id: 'pl-3', plantaId: 'potus' }])
    expect(quitarPlanta(e, 'potus').plantas.map((p) => p.id)).toEqual(['pl-1', 'pl-2'])
    expect(quitarPlanta(quitarPlanta(e, 'potus'), 'potus').plantas.map((p) => p.id)).toEqual(['pl-2'])
    expect(quitarPlanta(e, 'monstera')).toBe(e)
  })

  it('no pasa del tope', () => {
    const lleno = living(Array.from({ length: MAX_PLANTAS_ESPACIO }, (_, i) => ({ id: `pl-${i}`, plantaId: 'potus' })))
    expect(agregarPlanta(lleno, 'potus', 'pl-x')).toBe(lleno)
    expect(esquemaDatos.safeParse({ ...DATOS_INICIALES, espacios: [lleno] }).success).toBe(true)
  })

  it('al sincronizar se juntan las plantas del mismo espacio sin duplicar', () => {
    expect(unirPlantas([{ id: 'pl-1', plantaId: 'potus' }], [{ id: 'pl-1', plantaId: 'potus' }, { id: 'pl-2', plantaId: 'potus' }]).map((p) => p.id)).toEqual(['pl-1', 'pl-2'])
    const a = { ...DATOS_INICIALES, espacios: [living([{ id: 'pl-1', plantaId: 'potus' }])] }
    const b = { ...DATOS_INICIALES, espacios: [living([{ id: 'pl-2', plantaId: 'monstera' }]), { ...living([{ id: 'pl-3', plantaId: 'cinta' }]), id: 'balcon-1' }] }
    const r = fusionar(a, b)
    expect(r.espacios.map((e) => e.plantas.map((p) => p.id))).toEqual([['pl-1', 'pl-2'], ['pl-3']])
    expect(esquemaDatos.safeParse(r).success).toBe(true)
  })

  it('los espacios guardados antes (v5) migran con la lista vacía y sin perder nada', () => {
    const { plantas: _p, ...viejo } = living()
    const d = esquemaDatos.parse(migrar({ ...DATOS_INICIALES, espacios: [viejo] }, 5))
    expect(d.espacios).toEqual([living()])
    // Si ya traía plantas, se conservan
    const con = living([{ id: 'pl-1', plantaId: 'potus' }])
    expect(esquemaDatos.parse(migrar({ ...DATOS_INICIALES, espacios: [con] }, 5)).espacios).toEqual([con])
  })
})

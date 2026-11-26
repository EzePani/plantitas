import { describe, expect, it } from 'vitest'
import { DATOS_INICIALES } from '../store/useStore'
import { esquemaDatos, migrar } from './backup'
import { agregarPlanta, moverPlanta, quitarPlanta } from './espacios'
import { fusionar } from './fusion'
import { CELDAS, alternarSuelo, conSuelo, contraPared, formaDe, lugarPiso, lugarValido, numeroDe, plantasEn, ponerPlano, sueloDe, tocarElemento } from './plano'
import type { Espacio, Plano } from './tipos'

const plano: Plano = {
  suelo: sueloDe('rectangulo'),
  elementos: [
    { id: 'el-v', tipo: 'ventana', celda: 2 },
    { id: 'el-e', tipo: 'estante', celda: 6 },
    { id: 'el-p', tipo: 'puerta', celda: 30 },
  ],
}
const living: Espacio = { id: 'living-1', nombre: 'Living', creado: '2026-11-14', tipo: 'living', luz: { tipo: 'indirecta', tramos: [], obstaculos: [] }, tamano: 'mediano', mascotas: 'gato', esfuerzo: 'medio', plantas: [], plano }

describe('forma del espacio', () => {
  it('rectángulo, L y U', () => {
    expect(sueloDe('rectangulo')).toHaveLength(CELDAS)
    expect(sueloDe('l')).toHaveLength(CELDAS - 9)
    expect(sueloDe('u')).toHaveLength(CELDAS - 6)
    expect(formaDe(sueloDe('l'))).toBe('l')
    expect(formaDe(sueloDe('l').slice(1))).toBeNull()
  })
  it('se retoca de a un cuadradito y nunca queda vacío', () => {
    const sin = alternarSuelo(plano, 0)
    expect(sin.suelo).not.toContain(0)
    expect(alternarSuelo(sin, 0).suelo).toEqual(plano.suelo)
    const uno: Plano = { suelo: [7], elementos: [] }
    expect(alternarSuelo(uno, 7)).toBe(uno)
  })
  it('al sacar piso se van los elementos de ahí', () => {
    expect(alternarSuelo(plano, 6).elementos.map((e) => e.id)).toEqual(['el-v', 'el-p'])
  })
  it('una ventana que deja de estar contra la pared se va', () => {
    const chico: Plano = { suelo: [0, 1, 2], elementos: [{ id: 'el-v', tipo: 'ventana', celda: 7 }] }
    expect(conSuelo({ ...chico, suelo: [7] }, [7]).elementos).toHaveLength(1)
    expect(conSuelo(chico, [1, 6, 7, 8, 13]).elementos).toHaveLength(0)
  })
})

describe('elementos', () => {
  it('ventana y puerta solo contra una pared', () => {
    expect(contraPared(plano.suelo, 0)).toBe(true)
    expect(contraPared(plano.suelo, 14)).toBe(false)
    // En la L, la celda junto al recorte también es pared
    expect(contraPared(sueloDe('l'), 20)).toBe(true)
    expect(tocarElemento(plano, 14, 'ventana', 'el-x')).toBeNull()
    expect(tocarElemento(plano, 14, 'mesa', 'el-x')?.elementos).toHaveLength(4)
  })
  it('tocar uno puesto lo quita; fuera del piso no se pone nada', () => {
    expect(tocarElemento(plano, 6, 'mesa', 'el-x')?.elementos.map((e) => e.id)).toEqual(['el-v', 'el-p'])
    expect(tocarElemento({ ...plano, suelo: sueloDe('l') }, 35, 'mesa', 'el-x')).toBeNull()
  })
  it('numera solo los repetidos', () => {
    const dos = tocarElemento(plano, 14, 'estante', 'el-e2')!
    expect(numeroDe(dos, dos.elementos[1])).toBe(1)
    expect(numeroDe(dos, dos.elementos[3])).toBe(2)
    expect(numeroDe(plano, plano.elementos[0])).toBeNull()
  })
})

describe('plantas en el plano', () => {
  it('van en elementos o en el piso libre, nunca en la puerta', () => {
    expect(lugarValido(plano, 'el-e')).toBe(true)
    expect(lugarValido(plano, lugarPiso(14))).toBe(true)
    expect(lugarValido(plano, 'el-p')).toBe(false)
    expect(lugarValido(plano, lugarPiso(6))).toBe(false)
    expect(lugarValido(undefined, 'el-e')).toBe(false)
  })
  it('se agregan en un lugar, se mueven y se quitan de ahí', () => {
    let e = agregarPlanta(agregarPlanta(living, 'potus', 'pl-1'), 'potus', 'pl-2', 'el-e')
    expect(plantasEn(e, 'el-e').map((p) => p.id)).toEqual(['pl-2'])
    expect(plantasEn(e, null).map((p) => p.id)).toEqual(['pl-1'])
    // Desde la lista del espacio se saca primero la que está sin ubicar
    expect(quitarPlanta(e, 'potus').plantas.map((p) => p.id)).toEqual(['pl-2'])
    expect(quitarPlanta(e, 'potus', 'el-e').plantas.map((p) => p.id)).toEqual(['pl-1'])
    expect(quitarPlanta(e, 'potus', 'el-v')).toBe(e)
    e = moverPlanta(e, 'potus', null, 'el-v')
    expect(plantasEn(e, 'el-v').map((p) => p.id)).toEqual(['pl-1'])
    expect(moverPlanta(e, 'potus', 'el-v', null).plantas[0]).toEqual({ id: 'pl-1', plantaId: 'potus' })
  })
  it('si desaparece el lugar o el plano, quedan sin ubicar', () => {
    const e = agregarPlanta(living, 'potus', 'pl-1', 'el-e')
    for (const nuevo of [ponerPlano(e, tocarElemento(plano, 6, 'mesa', 'x')!), ponerPlano(e, undefined)]) {
      expect(nuevo.plantas).toEqual([{ id: 'pl-1', plantaId: 'potus' }])
    }
    expect(ponerPlano(e, undefined)).not.toHaveProperty('plano')
    expect(ponerPlano(e, plano).plantas[0].lugar).toBe('el-e')
  })
  it('el plano se guarda, sincroniza y los datos anteriores siguen valiendo', () => {
    const e = agregarPlanta(living, 'potus', 'pl-1', 'el-e')
    expect(esquemaDatos.parse({ ...DATOS_INICIALES, espacios: [e] }).espacios[0]).toEqual(e)
    const { plano: _p, ...sin } = living
    expect(esquemaDatos.parse(migrar({ ...DATOS_INICIALES, espacios: [sin] }, 7)).espacios[0]).toEqual(sin)
    const r = fusionar({ ...DATOS_INICIALES, espacios: [sin] }, { ...DATOS_INICIALES, espacios: [e] })
    expect(r.espacios[0].plano).toEqual(plano)
    expect(r.espacios[0].plantas[0].lugar).toBe('el-e')
  })
})

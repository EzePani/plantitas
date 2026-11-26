import { describe, expect, it } from 'vitest'
import { DATOS_INICIALES } from '../store/useStore'
import { esquemaDatos, migrar } from './backup'
import { agregarPlanta, moverPlanta, quitarPlanta } from './espacios'
import { fusionar } from './fusion'
import { CELDAS, LUGARES, REFERENCIAS, esReferencia, agregarElemento, alternarSuelo, celdasDe, conSuelo, contraPared, formaDe, limpiarNombres, lugarPiso, lugarValido, numeroDe, plantasEn, ponerPlano, quitarElemento, redimensionar, renombrar, sueloDe } from './plano'
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
  it('cada tipo es referencia o lugar para plantas, nunca las dos cosas', () => {
    expect([...REFERENCIAS, ...LUGARES].sort()).toEqual(['estante', 'gancho', 'mesa', 'mueble', 'puerta', 'ventana'])
    expect(REFERENCIAS.every(esReferencia)).toBe(true)
    expect(LUGARES.some(esReferencia)).toBe(false)
  })
  it('ventana y puerta solo contra una pared', () => {
    expect(contraPared(plano.suelo, 0)).toBe(true)
    expect(contraPared(plano.suelo, 14)).toBe(false)
    // En la L, la celda junto al recorte también es pared
    expect(contraPared(sueloDe('l'), 20)).toBe(true)
    expect(agregarElemento(plano, 14, 'ventana', 'el-x')).toBeNull()
    expect(agregarElemento(plano, 14, 'mesa', 'el-x')?.elementos).toHaveLength(4)
  })
  it('no se pone sobre otro ni fuera del piso, y se puede quitar', () => {
    expect(agregarElemento(plano, 6, 'mesa', 'el-x')).toBeNull()
    expect(agregarElemento({ ...plano, suelo: sueloDe('l') }, 35, 'mesa', 'el-x')).toBeNull()
    expect(quitarElemento(plano, 'el-e').elementos.map((e) => e.id)).toEqual(['el-v', 'el-p'])
  })
  it('numera solo los repetidos sin nombre propio', () => {
    const dos = agregarElemento(plano, 14, 'estante', 'el-e2')!
    expect(numeroDe(dos, dos.elementos[1])).toBe(1)
    expect(numeroDe(dos, dos.elementos[3])).toBe(2)
    expect(numeroDe(plano, plano.elementos[0])).toBeNull()
    expect(numeroDe(renombrar(dos, 'el-e2', 'Arriba de la tele'), dos.elementos[1])).toBeNull()
  })
  it('se guardan los nombres sin espacios de más y sin vacíos', () => {
    expect(limpiarNombres(renombrar(plano, 'el-e', '  Tele  ')).elementos[1].nombre).toBe('Tele')
    expect(limpiarNombres(renombrar(plano, 'el-e', '   ')).elementos[1]).not.toHaveProperty('nombre')
    expect(renombrar(plano, 'el-e', 'x'.repeat(50)).elementos[1].nombre).toHaveLength(30)
  })
})

describe('tamaño de los elementos', () => {
  const mesa = (celda: number) => agregarElemento({ suelo: sueloDe('rectangulo'), elementos: [] }, celda, 'mesa', 'el-m')!
  it('ocupa dos o tres cuadraditos a lo ancho y a lo alto', () => {
    const p = redimensionar(mesa(7), 'el-m', 3, 2)!
    expect(celdasDe(p.elementos[0])).toEqual([7, 8, 9, 13, 14, 15])
    expect(redimensionar(p, 'el-m', 1, 1)!.elementos[0]).toEqual({ id: 'el-m', tipo: 'mesa', celda: 7 })
    expect(redimensionar(p, 'el-m', 4, 1)).toBeNull()
  })
  it('contra el borde se corre para entrar, sin dejar su cuadradito', () => {
    expect(celdasDe(redimensionar(mesa(35), 'el-m', 2, 2)!.elementos[0])).toEqual([28, 29, 34, 35])
    expect(celdasDe(redimensionar(mesa(5), 'el-m', 3, 1)!.elementos[0])).toEqual([3, 4, 5])
  })
  it('no pisa a otro elemento', () => {
    const p = agregarElemento(mesa(0), 1, 'mueble', 'el-x')!
    expect(redimensionar(p, 'el-m', 2, 1)).toBeNull()
    expect(redimensionar(p, 'el-m', 1, 2)).not.toBeNull()
  })
  it('una ventana ancha va entera contra la pared', () => {
    expect(redimensionar(plano, 'el-v', 3, 1)).not.toBeNull()
    expect(redimensionar(plano, 'el-v', 1, 2)).toBeNull()
  })
  it('todos sus cuadraditos son el mismo lugar y tapan el piso', () => {
    const p = redimensionar(plano, 'el-e', 3, 1)!
    expect(lugarValido(p, lugarPiso(8))).toBe(false)
    expect(agregarElemento(p, 8, 'mesa', 'el-x')).toBeNull()
    // Si se le saca un pedazo de piso, se va entero
    expect(alternarSuelo(p, 8).elementos.map((e) => e.id)).toEqual(['el-v', 'el-p'])
  })
  it('tamaño y nombre se guardan', () => {
    const p = renombrar(redimensionar(plano, 'el-e', 2, 1)!, 'el-e', 'Estante tele')
    expect(esquemaDatos.parse({ ...DATOS_INICIALES, espacios: [{ ...living, plano: p }] }).espacios[0].plano).toEqual(p)
  })
})

describe('plantas en el plano', () => {
  it('van en lugares para plantas o en el piso libre, nunca en puertas ni ventanas', () => {
    expect(lugarValido(plano, 'el-e')).toBe(true)
    expect(lugarValido(plano, 'el-v')).toBe(false)
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
    e = moverPlanta(e, 'potus', null, lugarPiso(14))
    expect(plantasEn(e, lugarPiso(14)).map((p) => p.id)).toEqual(['pl-1'])
    expect(moverPlanta(e, 'potus', lugarPiso(14), null).plantas[0]).toEqual({ id: 'pl-1', plantaId: 'potus' })
  })
  it('si desaparece el lugar o el plano, quedan sin ubicar', () => {
    const e = agregarPlanta(living, 'potus', 'pl-1', 'el-e')
    for (const nuevo of [ponerPlano(e, quitarElemento(plano, 'el-e')), ponerPlano(e, undefined)]) {
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

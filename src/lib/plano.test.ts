import { describe, expect, it } from 'vitest'
import { DATOS_INICIALES } from '../store/useStore'
import { esquemaDatos, migrar } from './backup'
import { agregarPlanta, moverPlanta, quitarPlanta } from './espacios'
import { fusionar } from './fusion'
import { CELDAS, alternarCelda, conSuelo, contraPared, esReferencia, formaDe, franja, limpiar, lugarPiso, lugarValido, lugaresDe, nuevoElemento, numeroDe, pintarSuelo, plantasEn, ponerPlano, puedeIr, quitarElemento, referenciasDe, renombrar, sueloDe, vaEnPared } from './plano'
import { TIPOS_ELEMENTO, type Espacio, type Plano, type TipoEspacio } from './tipos'

const plano: Plano = {
  suelo: sueloDe('rectangulo'),
  elementos: [
    { id: 'el-v', tipo: 'ventana', celdas: [2] },
    { id: 'el-e', tipo: 'estante', celdas: [6] },
    { id: 'el-p', tipo: 'puerta', celdas: [30] },
  ],
}
const living: Espacio = { id: 'living-1', nombre: 'Living', creado: '2026-11-14', tipo: 'living', luz: { tipo: 'indirecta', tramos: [], obstaculos: [] }, tamano: 'mediano', mascotas: 'gato', esfuerzo: 'medio', plantas: [], plano }
/** Tilda varios cuadraditos seguidos; falla si alguno no se puede */
const tildar = (p: Plano, id: string, ...celdas: number[]): Plano =>
  celdas.reduce((q, c) => {
    const r = alternarCelda(q, id, c)
    if (typeof r === 'string') throw new Error(`${c}: ${r}`)
    return r
  }, p)

describe('forma del espacio', () => {
  it('rectángulo, L y U', () => {
    expect(sueloDe('rectangulo')).toHaveLength(CELDAS)
    expect(sueloDe('l')).toHaveLength(CELDAS - 9)
    expect(sueloDe('u')).toHaveLength(CELDAS - 6)
    expect(formaDe(sueloDe('l'))).toBe('l')
    expect(formaDe(sueloDe('l').slice(1))).toBeNull()
  })
  it('se pinta y se despinta de a un cuadradito, hasta quedar en blanco', () => {
    const sin = pintarSuelo(plano, 0, false)
    expect(sin.suelo).not.toContain(0)
    expect(pintarSuelo(sin, 0, false)).toBe(sin)
    expect(pintarSuelo(sin, 0, true).suelo).toEqual(plano.suelo)
    expect(pintarSuelo({ suelo: [7], elementos: [] }, 7, false).suelo).toEqual([])
  })
  it('despintar y volver a pintar no pierde lo que había', () => {
    const p = pintarSuelo(pintarSuelo(plano, 6, false), 6, true)
    expect(conSuelo(p, p.suelo)).toEqual(plano)
  })
  it('al cerrar la forma, un elemento pierde lo que quedó afuera y se va si no le queda nada', () => {
    const p = tildar(plano, 'el-e', 7)
    const sin = pintarSuelo(p, 6, false)
    expect(conSuelo(sin, sin.suelo).elementos[1].celdas).toEqual([7])
    expect(conSuelo(plano, pintarSuelo(plano, 6, false).suelo).elementos.map((e) => e.id)).toEqual(['el-v', 'el-p'])
  })
  it('una ventana que deja de dar a la pared se va', () => {
    const chico: Plano = { suelo: [0, 1, 2], elementos: [{ id: 'el-v', tipo: 'ventana', celdas: [1] }] }
    expect(conSuelo(chico, [0, 1, 2]).elementos).toHaveLength(1)
    expect(conSuelo({ ...chico, elementos: [{ id: 'el-v', tipo: 'ventana', celdas: [7] }] }, [1, 6, 7, 8, 13]).elementos).toHaveLength(0)
  })
})

describe('elementos', () => {
  const ESPACIOS: TipoEspacio[] = ['living', 'dormitorio', 'cocina', 'bano', 'balcon', 'escritorio']
  it('cada tipo es referencia o lugar para plantas, nunca las dos cosas', () => {
    const ofrecidos = ESPACIOS.flatMap((t) => [...referenciasDe(t), ...lugaresDe(t)])
    expect(new Set(ofrecidos)).toEqual(new Set(TIPOS_ELEMENTO))
    for (const t of ESPACIOS) {
      expect(referenciasDe(t).every(esReferencia)).toBe(true)
      expect(lugaresDe(t).some(esReferencia)).toBe(false)
    }
  })
  it('cada espacio ofrece lo suyo, y puertas y ventanas en todos', () => {
    expect(referenciasDe('bano')).toEqual(['ventana', 'puerta', 'ducha', 'inodoro', 'bidet', 'bacha'])
    expect(lugaresDe('cocina')).toContain('mesada')
    expect(lugaresDe('living')).not.toContain('mesada')
    for (const t of ESPACIOS) expect(referenciasDe(t).slice(0, 2)).toEqual(['ventana', 'puerta'])
  })
  it('solo puertas y ventanas piden pared; el resto va en cualquier lado del piso y no lleva plantas', () => {
    expect(TIPOS_ELEMENTO.filter(vaEnPared)).toEqual(['ventana', 'puerta'])
    const p = tildar(nuevoElemento(plano, 'inodoro', 'el-i'), 'el-i', 14)
    expect(lugarValido(p, 'el-i')).toBe(false)
    expect(esquemaDatos.safeParse({ ...DATOS_INICIALES, espacios: [{ ...living, tipo: 'bano', plano: p }] }).success).toBe(true)
  })
  it('se arman tildando cuadraditos, con cualquier forma', () => {
    const p = tildar(nuevoElemento(plano, 'mesa', 'el-m'), 'el-m', 15, 14, 20)
    expect(p.elementos[3]).toEqual({ id: 'el-m', tipo: 'mesa', celdas: [14, 15, 20] })
    // Tocar uno tildado lo saca
    expect(tildar(p, 'el-m', 15).elementos[3].celdas).toEqual([14, 20])
  })
  it('no se tilda un cuadradito de otro elemento ni fuera del piso', () => {
    const p = nuevoElemento({ ...plano, suelo: sueloDe('l') }, 'mesa', 'el-m')
    expect(alternarCelda(p, 'el-m', 6)).toBe('ocupado')
    expect(alternarCelda(p, 'el-m', 35)).toBe('ocupado')
  })
  it('ventana y puerta solo contra una pared', () => {
    expect(contraPared(plano.suelo, 0)).toBe(true)
    expect(contraPared(plano.suelo, 14)).toBe(false)
    // En la L, la celda junto al recorte también es pared
    expect(contraPared(sueloDe('l'), 20)).toBe(true)
    expect(alternarCelda(plano, 'el-v', 14)).toBe('pared')
    expect(tildar(plano, 'el-v', 3, 4).elementos[0].celdas).toEqual([2, 3, 4])
    expect(puedeIr(plano, 'ventana', 14)).toBe(false)
    expect(puedeIr(plano, 'mesa', 14)).toBe(true)
    expect(puedeIr(plano, 'mesa', 6)).toBe(false)
  })
  it('numera solo los repetidos sin nombre propio', () => {
    const dos = tildar(nuevoElemento(plano, 'estante', 'el-e2'), 'el-e2', 14)
    expect(numeroDe(dos, dos.elementos[1])).toBe(1)
    expect(numeroDe(dos, dos.elementos[3])).toBe(2)
    expect(numeroDe(plano, plano.elementos[0])).toBeNull()
    expect(numeroDe(renombrar(dos, 'el-e2', 'Arriba de la tele'), dos.elementos[1])).toBeNull()
  })
  it('al terminar se van los vacíos y se prolijan los nombres', () => {
    const p = nuevoElemento(renombrar(plano, 'el-e', '  Tele  '), 'mesa', 'el-m')
    expect(limpiar(p).elementos.map((e) => e.id)).toEqual(['el-v', 'el-e', 'el-p'])
    expect(limpiar(p).elementos[1].nombre).toBe('Tele')
    expect(limpiar(renombrar(plano, 'el-e', '   ')).elementos[1]).not.toHaveProperty('nombre')
    expect(renombrar(plano, 'el-e', 'x'.repeat(50)).elementos[1].nombre).toHaveLength(30)
    expect(quitarElemento(plano, 'el-e').elementos.map((e) => e.id)).toEqual(['el-v', 'el-p'])
  })
  it('el nombre se escribe en su tira más larga', () => {
    expect(franja({ id: 'x', tipo: 'mesa', celdas: [14, 20, 21, 22] })).toEqual({ celda: 20, largo: 3 })
    // El final de una fila no sigue en la siguiente
    expect(franja({ id: 'x', tipo: 'mesa', celdas: [5, 6] })).toEqual({ celda: 5, largo: 1 })
  })
})

describe('plantas en el plano', () => {
  it('van en lugares para plantas o en el piso libre, nunca en puertas ni ventanas', () => {
    expect(lugarValido(plano, 'el-e')).toBe(true)
    expect(lugarValido(plano, 'el-v')).toBe(false)
    expect(lugarValido(plano, lugarPiso(14))).toBe(true)
    expect(lugarValido(plano, 'el-p')).toBe(false)
    expect(lugarValido(plano, lugarPiso(6))).toBe(false)
    expect(lugarValido(tildar(plano, 'el-e', 7), lugarPiso(7))).toBe(false)
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
  it('si desaparece el lugar o el plano, quedan sin ubicar; si solo cambia de forma, siguen ahí', () => {
    const e = agregarPlanta(living, 'potus', 'pl-1', 'el-e')
    for (const nuevo of [ponerPlano(e, quitarElemento(plano, 'el-e')), ponerPlano(e, undefined)]) {
      expect(nuevo.plantas).toEqual([{ id: 'pl-1', plantaId: 'potus' }])
    }
    expect(ponerPlano(e, undefined)).not.toHaveProperty('plano')
    expect(ponerPlano(e, tildar(plano, 'el-e', 7, 6)).plantas[0].lugar).toBe('el-e')
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
  it('un plano guardado con ancho y alto (v8) pasa a cuadraditos sin perder nada', () => {
    const viejo = {
      ...living,
      plantas: [{ id: 'pl-1', plantaId: 'potus', lugar: 'el-e' }],
      plano: { suelo: plano.suelo, elementos: [{ id: 'el-v', tipo: 'ventana', celda: 2 }, { id: 'el-e', tipo: 'estante', celda: 6, ancho: 3, nombre: 'Tele' }, { id: 'el-m', tipo: 'mesa', celda: 13, ancho: 2, alto: 2 }] },
    }
    const d = esquemaDatos.parse(migrar({ ...DATOS_INICIALES, espacios: [viejo] }, 8)).espacios[0]
    expect(d.plano?.elementos).toEqual([
      { id: 'el-v', tipo: 'ventana', celdas: [2] },
      { id: 'el-e', tipo: 'estante', celdas: [6, 7, 8], nombre: 'Tele' },
      { id: 'el-m', tipo: 'mesa', celdas: [13, 14, 19, 20] },
    ])
    expect(d.plantas[0].lugar).toBe('el-e')
  })
})

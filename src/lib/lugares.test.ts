import { describe, expect, it } from 'vitest'
import { PLANTAS } from '../data/plantas'
import type { Planta } from '../data/plantas/esquema'
import { DATOS_INICIALES } from '../store/useStore'
import { esquemaDatos } from './backup'
import { avisosDeMascotas, distanciaAVentana, luzDeLugar, luzParaPlanta, ponerLuz } from './lugares'
import { conSuelo, lugarPiso, ponerPlano, quitarElemento, sueloDe } from './plano'
import type { Espacio, Plano } from './tipos'

// Ventana arriba a la izquierda; estante pegado, mesa a media distancia y gancho al fondo
const plano: Plano = {
  suelo: sueloDe('rectangulo'),
  elementos: [
    { id: 'el-v', tipo: 'ventana', celdas: [0] },
    { id: 'el-e', tipo: 'estante', celdas: [6] },
    { id: 'el-m', tipo: 'mesa', celdas: [14, 15] },
    { id: 'el-g', tipo: 'gancho', celdas: [35] },
  ],
}
const living: Espacio = { id: 'living-1', nombre: 'Living', creado: '2026-11-14', tipo: 'living', luz: { tipo: 'indirecta', tramos: [], obstaculos: [] }, tamano: 'mediano', mascotas: 'ambos', esfuerzo: 'medio', plantas: [], plano }
const conSol: Espacio = { ...living, luz: { tipo: 'directa', tramos: [{ desde: 15, hasta: 19 }], obstaculos: [] } }

const base = PLANTAS[0]
const planta = (x: Partial<Planta> = {}, gato: Planta['mascotas']['toxicidad_gato'] = 'segura', perro = gato, colgante = false): Planta => ({
  ...base,
  luz_requerida: 'indirecta_brillante',
  luz_tolerada: [],
  horas_sol_directo: 0,
  tolera_sol_tarde: false,
  sensibilidad_calor: 'media',
  apta: { interior: true, balcon: false, nota_balcon: '' },
  mascotas: { ...base.mascotas, toxicidad_gato: gato, toxicidad_perro: perro },
  cultivo: { ...base.cultivo, porte: colgante ? ['colgante'] : ['erguida'] },
  ...x,
})

describe('luz de cada lugar', () => {
  it('se mide en cuadraditos hasta la ventana más cercana', () => {
    expect(distanciaAVentana(plano, 'el-e')).toBe(1)
    expect(distanciaAVentana(plano, 'el-m')).toBe(2)
    expect(distanciaAVentana(plano, 'el-g')).toBe(5)
    expect(distanciaAVentana(plano, lugarPiso(7))).toBe(1)
    expect(distanciaAVentana(quitarElemento(plano, 'el-v'), 'el-e')).toBeNull()
  })
  it('baja al alejarse de la ventana', () => {
    expect(['el-e', 'el-m', 'el-g'].map((l) => luzDeLugar(living, l).luz.categoria)).toEqual(['indirecta_brillante', 'indirecta_media', 'baja'])
    expect(['el-e', 'el-m', 'el-g'].map((l) => luzDeLugar(conSol, l).luz.categoria)).toEqual(['directa', 'indirecta_brillante', 'indirecta_media'])
    expect(luzDeLugar({ ...living, luz: { tipo: 'baja', tramos: [], obstaculos: [] } }, 'el-e').luz.categoria).toBe('indirecta_media')
  })
  it('el sol y el aviso de calor solo llegan junto a la ventana', () => {
    expect(luzDeLugar(conSol, 'el-e').luz.avisoCalor).toBe(true)
    expect(luzDeLugar(conSol, 'el-m').luz).toMatchObject({ avisoCalor: false, horasEfectivas: 0 })
  })
  it('sin ventanas dibujadas y en el balcón vale la luz del espacio', () => {
    const sin = luzDeLugar({ ...living, plano: quitarElemento(plano, 'el-v') }, 'el-g')
    expect(sin).toMatchObject({ origen: 'sin_ventana', distancia: null })
    expect(sin.luz.categoria).toBe('indirecta_brillante')
    expect(luzDeLugar({ ...conSol, tipo: 'balcon' }, 'el-g')).toMatchObject({ origen: 'balcon', luz: { categoria: 'directa' } })
  })
  it('se corrige a mano y se puede volver a la estimada', () => {
    const e = ponerLuz(living, 'el-g', 'directa')
    expect(luzDeLugar(e, 'el-g')).toMatchObject({ origen: 'corregida', luz: { categoria: 'directa', horasEfectivas: 3 } })
    expect(luzDeLugar(e, 'el-e').origen).toBe('ventana')
    expect(ponerLuz(e, 'el-g', null)).toEqual(living)
    expect(ponerLuz(living, 'el-v', 'baja')).toBe(living)
    expect(ponerLuz({ ...living, plano: undefined }, 'el-g', 'baja').plano).toBeUndefined()
  })
  it('la corrección se guarda, sigue al editar la forma y se va con su lugar', () => {
    const e = ponerLuz(ponerLuz(living, 'el-g', 'baja'), lugarPiso(7), 'directa')
    expect(esquemaDatos.parse({ ...DATOS_INICIALES, espacios: [e] }).espacios[0]).toEqual(e)
    expect(conSuelo(e.plano!, e.plano!.suelo).luces).toEqual(e.plano!.luces)
    expect(ponerPlano(e, quitarElemento(e.plano!, 'el-g')).plano?.luces).toEqual({ [lugarPiso(7)]: 'directa' })
    const vacio = ponerPlano(e, { ...e.plano!, elementos: [], suelo: [0] })
    expect(vacio.plano).not.toHaveProperty('luces')
  })
})

describe('avisos de una planta en un lugar', () => {
  it('avisa si no le sirve la luz', () => {
    expect(luzParaPlanta(planta(), living, 'el-e')).toBe('bien')
    expect(luzParaPlanta(planta(), living, 'el-g')).toBe('poca_luz')
    expect(luzParaPlanta(planta(), conSol, 'el-e')).toBe('con_ajuste')
    expect(luzParaPlanta(planta({ apta: { interior: false, balcon: true, nota_balcon: '' } }), living, 'el-e')).toBe('lugar')
    expect(luzParaPlanta(planta(), ponerLuz(living, 'el-g', 'indirecta_brillante'), 'el-g')).toBe('bien')
  })
  it('una planta segura o una casa sin mascotas no generan aviso', () => {
    expect(avisosDeMascotas(planta(), living, 'el-m')).toEqual([])
    expect(avisosDeMascotas(planta({}, 'toxica'), { ...living, mascotas: 'ninguna' }, 'el-m')).toEqual([])
  })
  it('la altura sale del elemento: el gato trepa, el perro no llega a un estante', () => {
    const toxica = planta({}, 'toxica')
    expect(avisosDeMascotas(toxica, living, 'el-m')).toEqual([{ estado: 'toxica', alcance: 'si', especies: ['gato', 'perro'] }])
    expect(avisosDeMascotas(toxica, living, lugarPiso(7))[0].alcance).toBe('si')
    expect(avisosDeMascotas(toxica, living, 'el-e')).toEqual([
      { estado: 'toxica', alcance: 'si', especies: ['gato'] },
      { estado: 'toxica', alcance: 'no', especies: ['perro'] },
    ])
    expect(avisosDeMascotas(toxica, living, 'el-g')).toEqual([{ estado: 'toxica', alcance: 'no', especies: ['gato', 'perro'] }])
  })
  it('si cuelga puede alcanzarla igual, y sin verificar también avisa', () => {
    expect(avisosDeMascotas(planta({}, 'toxica', 'toxica', true), living, 'el-g')[0].alcance).toBe('colgando')
    expect(avisosDeMascotas(planta({}, 'no_verificada', 'segura'), living, 'el-m')).toEqual([{ estado: 'no_verificada', alcance: 'si', especies: ['gato'] }])
  })
})

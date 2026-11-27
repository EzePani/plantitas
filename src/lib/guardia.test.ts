import { describe, expect, it } from 'vitest'
import { PLANTAS } from '../data/plantas'
import { CAUSA } from '../data/textosGuardia'
import { entradaPorId } from '../data/wiki'
import { DATOS_INICIALES } from '../store/useStore'
import { esquemaDatos, migrar } from './backup'
import { medidas } from './fotos'
import { fusionar } from './fusion'
import { GRUPOS_SINTOMAS, SIN_CONTEXTO, anotarControl, anotarVisita, borrarVisita, sinVisitas, cerrarEl, contextoDe, corregirFecha, corregirNota, diagnosticar, enTratamiento, limitesDeFecha, pendientes, proximoControl, revisarCaso, tocaControl, unirCasos } from './guardia'
import { CAUSAS, SINTOMAS, type Caso, type Control, type Espacio, type RespuestasGuardia } from './tipos'

const r = (x: Partial<RespuestasGuardia> = {}): RespuestasGuardia => ({ sintomas: [], tierra: 'humeda', cambios: [], notas: '', ...x })
const con = (x: Partial<typeof SIN_CONTEXTO>) => ({ ...SIN_CONTEXTO, ...x })
const caso: Caso = { id: 'caso-1', plantaId: 'potus', nombre: 'Potus', donde: 'Estante · Living', ingreso: '2026-11-01', causas: ['exceso_riego'], controles: [], ...r({ sintomas: ['amarillas'], tierra: 'mojada' }) }
const control = (fecha: string, estado: Control['estado'] = 'igual'): Control => ({ fecha, estado, tierra: 'humeda', nota: '' })

describe('causas posibles', () => {
  it('amarillas y caídas con la tierra mojada: sobra agua', () => {
    expect(diagnosticar(r({ sintomas: ['amarillas', 'caidas'], tierra: 'mojada' }))[0]).toBe('exceso_riego')
  })
  it('caídas con la tierra seca: falta agua, nunca exceso', () => {
    const c = diagnosticar(r({ sintomas: ['caidas', 'amarillas'], tierra: 'seca', cambios: ['riego'] }))
    expect(c[0]).toBe('falta_riego')
    expect(c).not.toContain('exceso_riego')
  })
  it('tallo blando: raíces podridas', () => {
    expect(diagnosticar(r({ sintomas: ['tallo_blando'], tierra: 'mojada' }))[0]).toBe('raices_podridas')
  })
  it('bichos: plaga, y mosquitas solo si la tierra no está seca', () => {
    expect(diagnosticar(r({ sintomas: ['bichos'] }))).toEqual(['plaga', 'mosquitas'])
    expect(diagnosticar(r({ sintomas: ['bichos'], tierra: 'seca' }))).toEqual(['plaga'])
  })
  it('la luz solo pesa si el lugar no le sirve', () => {
    const q = r({ sintomas: ['manchas'], cambios: ['lugar'] })
    expect(diagnosticar(q, con({ luz: 'mucha' }))[0]).toBe('demasiado_sol')
    expect(diagnosticar(q)).not.toContain('demasiado_sol')
    expect(diagnosticar(r({ sintomas: ['se_caen'] }), con({ luz: 'poca' }))[0]).toBe('falta_luz')
  })
  it('puntas marrones: aire seco; con abono reciente también exceso de abono', () => {
    expect(diagnosticar(r({ sintomas: ['puntas'] }))).toEqual(['aire_seco'])
    expect(diagnosticar(r({ sintomas: ['puntas'], cambios: ['abono'] }))[0]).toBe('exceso_abono')
  })
  it('después de una mudanza: se está adaptando', () => {
    expect(diagnosticar(r({ sintomas: ['se_caen'], cambios: ['vivero'] }))[0]).toBe('adaptacion')
  })
  it('una hoja amarilla sola es normal; sin pistas lo dice', () => {
    expect(diagnosticar(r({ sintomas: ['amarillas'], cambios: ['nada'] }))).toEqual(['hoja_vieja'])
    expect(diagnosticar(r({ sintomas: ['caidas'] }))).toEqual(['sin_pista'])
  })
  it('hojas enrolladas: sed si está seca; si no, mirar si hay plaga', () => {
    expect(diagnosticar(r({ sintomas: ['enrolladas'], tierra: 'seca' }))).toEqual(['falta_riego', 'plaga'])
    expect(diagnosticar(r({ sintomas: ['enrolladas'] }))).toEqual(['plaga'])
    expect(diagnosticar(r({ sintomas: ['enrolladas'] }), con({ luz: 'mucha' }))[0]).toBe('demasiado_sol')
  })
  it('hojas arrugadas: sed, o raíces podridas si la tierra está mojada', () => {
    expect(diagnosticar(r({ sintomas: ['arrugadas'], tierra: 'seca' }))[0]).toBe('falta_riego')
    expect(diagnosticar(r({ sintomas: ['arrugadas'], tierra: 'mojada' }))[0]).toBe('raices_podridas')
  })
  it('estirada: le falta luz', () => {
    expect(diagnosticar(r({ sintomas: ['estirada'] }))).toEqual(['falta_luz'])
  })
  it('cada síntoma tiene una sola tarjeta', () => {
    expect([...GRUPOS_SINTOMAS.hojas, ...GRUPOS_SINTOMAS.resto].sort()).toEqual([...SINTOMAS].sort())
  })
  it('muestra como mucho tres', () => {
    expect(diagnosticar(r({ sintomas: [...SINTOMAS], tierra: 'mojada', cambios: ['abono', 'temperatura', 'vivero'] }))).toHaveLength(3)
  })
  it('toda causa tiene su texto y una ficha de la guía que existe', () => {
    for (const id of CAUSAS) {
      expect(CAUSA[id].hacer.length).toBeGreaterThan(0)
      expect(entradaPorId(CAUSA[id].guia ?? ''), id).toBeDefined()
    }
  })
  it('el contexto usa la luz del espacio o del lugar', () => {
    const potus = PLANTAS.find((p) => p.id === 'potus')!
    const oscuro: Espacio = { id: 'bano-1', nombre: 'Baño', creado: '2026-11-01', tipo: 'bano', luz: { tipo: 'baja', tramos: [], obstaculos: [] }, tamano: 'chico', mascotas: 'ninguna', esfuerzo: 'poco', plantas: [] }
    const aloe = PLANTAS.find((p) => p.id === 'aloe-vera')!
    expect(contextoDe(aloe, '2026-07-10', oscuro)).toMatchObject({ luz: 'poca', invierno: true })
    expect(contextoDe(potus, '2026-11-10')).toMatchObject({ luz: null, invierno: false })
  })
})

describe('controles', () => {
  it('diarios la primera semana', () => {
    expect(proximoControl(caso)).toBe('2026-11-02')
    expect(proximoControl(anotarControl(caso, control('2026-11-07')))).toBe('2026-11-08')
  })
  it('después cada 3 días si va mejor y cada 2 si no', () => {
    expect(proximoControl(anotarControl(caso, control('2026-11-08', 'mejor')))).toBe('2026-11-11')
    expect(proximoControl(anotarControl(caso, control('2026-11-08', 'peor')))).toBe('2026-11-10')
  })
  it('avisa cuando toca y nunca en un caso cerrado', () => {
    expect(tocaControl(caso, '2026-11-01')).toBe(false)
    expect(tocaControl(caso, '2026-11-05')).toBe(true)
    const alta: Caso = { ...caso, cierre: { fecha: '2026-11-03', tipo: 'alta' } }
    expect(pendientes([caso, alta], '2026-11-05')).toEqual([caso])
    expect(enTratamiento([alta, caso])).toEqual([caso])
    expect(anotarControl(alta, control('2026-11-05'))).toBe(alta)
  })
  it('uno por día, ordenados', () => {
    const c = anotarControl(anotarControl(anotarControl(caso, control('2026-11-03')), control('2026-11-02')), control('2026-11-03', 'mejor'))
    expect(c.controles.map((x) => [x.fecha, x.estado])).toEqual([['2026-11-02', 'igual'], ['2026-11-03', 'mejor']])
  })
  it('revisar síntomas cambia las causas, queda en el control del día y no toca el ingreso', () => {
    const c = revisarCaso(anotarControl(caso, { ...control('2026-11-03', 'peor'), nota: 'sigue mal' }), r({ sintomas: ['tallo_blando'], tierra: 'mojada' }), ['raices_podridas'], '2026-11-03')
    expect(c.causas).toEqual(['raices_podridas'])
    expect(c.sintomas).toEqual(['amarillas'])
    expect(c.controles).toEqual([{ fecha: '2026-11-03', estado: 'peor', tierra: 'mojada', nota: 'sigue mal', sintomas: ['tallo_blando'] }])
    // Corregir el control del mismo día no borra la revisión
    expect(anotarControl(c, control('2026-11-03', 'igual')).controles[0].sintomas).toEqual(['tallo_blando'])
  })
})

describe('fechas del caso', () => {
  const hoy = '2026-11-20'
  const seguido = anotarControl(anotarControl(caso, control('2026-11-05')), control('2026-11-08'))
  it('el ingreso se corrige sin pasar del primer control', () => {
    expect(limitesDeFecha(seguido, 'ingreso', hoy).max).toBe('2026-11-05')
    expect(corregirFecha(seguido, 'ingreso', '2026-10-28', hoy).ingreso).toBe('2026-10-28')
    expect(corregirFecha(seguido, 'ingreso', '2026-11-06', hoy)).toBe(seguido)
    expect(corregirFecha(seguido, 'ingreso', '', hoy)).toBe(seguido)
    expect(limitesDeFecha(caso, 'ingreso', hoy).max).toBe(hoy)
  })
  it('el alta va entre el último control y hoy, y se puede corregir', () => {
    expect(cerrarEl(seguido, 'alta', '2026-11-07', hoy)).toBe(seguido)
    expect(cerrarEl(seguido, 'alta', '2026-11-21', hoy)).toBe(seguido)
    const alta = cerrarEl(seguido, 'alta', '2026-11-10', hoy)
    expect(alta.cierre).toEqual({ fecha: '2026-11-10', tipo: 'alta' })
    expect(corregirFecha(alta, 'cierre', '2026-11-09', hoy).cierre).toEqual({ fecha: '2026-11-09', tipo: 'alta' })
    expect(corregirFecha(alta, 'cierre', '2026-11-07', hoy)).toBe(alta)
    expect(corregirFecha(seguido, 'cierre', '2026-11-10', hoy)).toBe(seguido)
    // Sin controles, el ingreso tampoco puede quedar después del alta
    expect(limitesDeFecha(cerrarEl(caso, 'alta', '2026-11-03', hoy), 'ingreso', hoy).max).toBe('2026-11-03')
  })
  it('al sincronizar, el ingreso no queda después de un control', () => {
    const movido = corregirFecha(caso, 'ingreso', '2026-11-04', hoy)
    expect(unirCasos([movido], [anotarControl(caso, control('2026-11-02'))])[0].ingreso).toBe('2026-11-02')
  })
})

describe('nota del ingreso', () => {
  const caso = { id: 'c', plantaId: 'potus', nombre: 'Potus', donde: '', sintomas: [], tierra: 'seca' as const, cambios: [], notas: 'vieja', causas: ['falta_riego' as const], ingreso: '2026-11-01', controles: [] }

  it('se corrige, se recorta y se puede quitar', () => {
    expect(corregirNota(caso, '  nueva ', 't1')).toMatchObject({ notas: 'nueva', notasCambiadas: 't1' })
    expect(corregirNota(caso, 'x'.repeat(400), 't1').notas).toHaveLength(300)
    expect(corregirNota(caso, '   ', 't1').notas).toBe('')
    expect(corregirNota(caso, ' vieja ', 't1')).toBe(caso)
  })

  it('al juntar dos versiones vale la corregida más tarde', () => {
    const antes = corregirNota(caso, 'primera', '2026-11-02T10:00:00.000Z')
    const despues = corregirNota(caso, '', '2026-11-03T10:00:00.000Z')
    for (const [a, b] of [[antes, despues], [despues, antes], [caso, despues]]) expect(unirCasos([a], [b])[0].notas).toBe('')
    expect(unirCasos([caso], [antes])[0].notas).toBe('primera')
  })
})

describe('visitas al vivero', () => {
  const hoy = '2026-11-20'
  const visita = { id: 'visita-1', fecha: '2026-11-10', dijo: ' Tiene cochinilla ' }
  const con1 = anotarVisita(caso, visita, hoy)
  it('guarda cuándo fue y qué le dijeron, en orden de fecha', () => {
    expect(con1.vivero).toEqual([{ ...visita, dijo: 'Tiene cochinilla' }])
    // Puede haber ido antes de ingresarla a la Guardia
    expect(anotarVisita(con1, { id: 'visita-2', fecha: '2026-10-30', dijo: 'Poca luz' }, hoy).vivero?.map((v) => v.id)).toEqual(['visita-2', 'visita-1'])
  })
  it('se corrige por id y no acepta vacíos ni fechas futuras', () => {
    expect(anotarVisita(con1, { ...visita, fecha: '2026-11-12', dijo: 'Hongos' }, hoy).vivero).toEqual([{ id: 'visita-1', fecha: '2026-11-12', dijo: 'Hongos' }])
    expect(anotarVisita(con1, { ...visita, dijo: '  ' }, hoy)).toBe(con1)
    expect(anotarVisita(caso, { ...visita, fecha: '2026-11-21' }, hoy)).toBe(caso)
  })
  it('"no" se recuerda, no pisa visitas y al borrar la última vuelve la pregunta', () => {
    expect(sinVisitas(caso).vivero).toEqual([])
    expect(sinVisitas(con1)).toBe(con1)
    expect(borrarVisita(con1, 'visita-1')).not.toHaveProperty('vivero')
  })
  it('se guarda y al sincronizar se juntan', () => {
    for (const c of [con1, sinVisitas(caso)]) expect(esquemaDatos.parse({ ...DATOS_INICIALES, casos: [c] }).casos[0]).toEqual(c)
    const otra = anotarVisita(caso, { id: 'visita-2', fecha: '2026-11-15', dijo: 'Mejorando' }, hoy)
    expect(unirCasos([con1], [otra])[0].vivero?.map((v) => v.id)).toEqual(['visita-1', 'visita-2'])
    expect(unirCasos([caso], [con1])[0].vivero).toEqual(con1.vivero)
    expect(unirCasos([caso], [caso])[0]).not.toHaveProperty('vivero')
  })
})

describe('fotos', () => {
  it('se achican sin deformarse y las chicas quedan igual', () => {
    expect(medidas(4000, 3000)).toEqual([1280, 960])
    expect(medidas(3000, 4000)).toEqual([960, 1280])
    expect(medidas(800, 600)).toEqual([800, 600])
    expect(medidas(5000, 1)).toEqual([1280, 1])
  })
})

describe('guardado', () => {
  it('los datos anteriores suman la lista vacía y un caso es válido', () => {
    const { casos: _c, ...viejo } = DATOS_INICIALES
    expect(esquemaDatos.parse(migrar(viejo, 11)).casos).toEqual([])
    const lleno = { ...anotarControl(caso, control('2026-11-02')), espacioId: 'living-1', lugar: 'el-e', cierre: { fecha: '2026-11-09', tipo: 'despedida' as const } }
    expect(esquemaDatos.parse({ ...DATOS_INICIALES, casos: [lleno] }).casos[0]).toEqual(lleno)
  })
  it('un caso con los síntomas nuevos es válido', () => {
    const todos = { ...caso, sintomas: [...SINTOMAS] }
    expect(esquemaDatos.parse({ ...DATOS_INICIALES, casos: [todos] }).casos[0]).toEqual(todos)
  })
  it('al sincronizar se juntan los controles y vale el alta', () => {
    const local = anotarControl(caso, control('2026-11-02'))
    const nube: Caso = { ...anotarControl(caso, control('2026-11-03', 'mejor')), causas: ['sin_pista'], cierre: { fecha: '2026-11-03', tipo: 'alta' } }
    const [u] = unirCasos([local], [nube, { ...caso, id: 'caso-2' }])
    expect(u.controles.map((x) => x.fecha)).toEqual(['2026-11-02', '2026-11-03'])
    expect(u.cierre?.tipo).toBe('alta')
    expect(u.causas).toEqual(['sin_pista'])
    expect(fusionar({ ...DATOS_INICIALES, casos: [local] }, { ...DATOS_INICIALES, casos: [{ ...caso, id: 'caso-2' }] }).casos).toHaveLength(2)
  })
})

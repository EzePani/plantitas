import { describe, expect, it } from 'vitest'
import { PLANTAS } from '../data/plantas'
import { CAUSA } from '../data/textosGuardia'
import { entradaPorId } from '../data/wiki'
import { DATOS_INICIALES } from '../store/useStore'
import { esquemaDatos, migrar } from './backup'
import { fusionar } from './fusion'
import { SIN_CONTEXTO, anotarControl, contextoDe, diagnosticar, enTratamiento, pendientes, proximoControl, revisarCaso, tocaControl, unirCasos } from './guardia'
import { CAUSAS, type Caso, type Control, type Espacio, type RespuestasGuardia } from './tipos'

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
  it('muestra como mucho tres', () => {
    expect(diagnosticar(r({ sintomas: ['amarillas', 'puntas', 'caidas', 'manchas', 'bichos', 'tallo_blando', 'se_caen', 'moho'], tierra: 'mojada', cambios: ['abono', 'temperatura', 'vivero'] }))).toHaveLength(3)
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

describe('guardado', () => {
  it('los datos anteriores suman la lista vacía y un caso es válido', () => {
    const { casos: _c, ...viejo } = DATOS_INICIALES
    expect(esquemaDatos.parse(migrar(viejo, 11)).casos).toEqual([])
    const lleno = { ...anotarControl(caso, control('2026-11-02')), espacioId: 'living-1', lugar: 'el-e', cierre: { fecha: '2026-11-09', tipo: 'despedida' as const } }
    expect(esquemaDatos.parse({ ...DATOS_INICIALES, casos: [lleno] }).casos[0]).toEqual(lleno)
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

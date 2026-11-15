import { describe, expect, it } from 'vitest'
import { derivarLuz, horasDeSol, momentoDominante, orientacionAprox } from './luz'
import type { PerfilLuz } from './tipos'

const directa = (tramos: [number, number][], obstaculos: PerfilLuz['obstaculos'] = []): PerfilLuz => ({
  tipo: 'directa',
  tramos: tramos.map(([desde, hasta]) => ({ desde, hasta })),
  obstaculos,
})

describe('horas de sol', () => {
  it('suma los tramos y no cuenta dos veces lo superpuesto', () => {
    expect(horasDeSol([{ desde: 8, hasta: 12 }])).toBe(4)
    expect(horasDeSol([{ desde: 8, hasta: 10 }, { desde: 16, hasta: 18.5 }])).toBe(4.5)
    expect(horasDeSol([{ desde: 8, hasta: 12 }, { desde: 10, hasta: 14 }])).toBe(6)
  })

  it('ignora tramos inválidos', () => {
    expect(horasDeSol([{ desde: 12, hasta: 9 }])).toBe(0)
    expect(horasDeSol([{ desde: NaN, hasta: 9 }])).toBe(0)
  })
})

describe('orientación aproximada (hemisferio sur)', () => {
  it('sol que empieza y termina temprano → este', () => {
    expect(orientacionAprox([{ desde: 7, hasta: 11 }])).toBe('este')
    expect(orientacionAprox([{ desde: 8, hasta: 12 }])).toBe('este')
  })

  it('sol concentrado al mediodía o que dura muchas horas → norte', () => {
    expect(orientacionAprox([{ desde: 11, hasta: 15 }])).toBe('norte')
    expect(orientacionAprox([{ desde: 9, hasta: 17 }])).toBe('norte')
    expect(orientacionAprox([{ desde: 12, hasta: 14 }])).toBe('norte')
  })

  it('sol que empieza tarde → oeste', () => {
    expect(orientacionAprox([{ desde: 15, hasta: 19 }])).toBe('oeste')
    expect(orientacionAprox([{ desde: 14, hasta: 18 }])).toBe('oeste')
  })

  it('casi sin sol directo → sur', () => {
    expect(orientacionAprox([])).toBe('sur')
    expect(orientacionAprox([{ desde: 9, hasta: 9.5 }])).toBe('sur')
  })

  it('con dos tramos pesa cada uno por su duración', () => {
    expect(orientacionAprox([{ desde: 8, hasta: 11 }, { desde: 17, hasta: 18 }])).toBe('este')
    expect(orientacionAprox([{ desde: 9, hasta: 10 }, { desde: 15, hasta: 19 }])).toBe('oeste')
  })
})

describe('momento del día', () => {
  it('toma el tramo con más horas', () => {
    expect(momentoDominante([{ desde: 7, hasta: 11 }])).toBe('manana')
    expect(momentoDominante([{ desde: 11, hasta: 15 }])).toBe('mediodia')
    expect(momentoDominante([{ desde: 14, hasta: 19 }])).toBe('tarde')
  })

  it('en empate gana el más exigente', () => {
    expect(momentoDominante([{ desde: 13, hasta: 17 }])).toBe('tarde')
    expect(momentoDominante([{ desde: 10, hasta: 14 }])).toBe('mediodia')
  })

  it('sin sol no hay momento', () => {
    expect(momentoDominante([])).toBeNull()
  })
})

describe('perfil de luz de un espacio', () => {
  it('balcón con sol de mañana: directa, este, sin aviso de calor', () => {
    expect(derivarLuz(directa([[8, 12]]))).toEqual({
      categoria: 'directa',
      horasSol: 4,
      horasEfectivas: 4,
      momento: 'manana',
      orientacion: 'este',
      avisoCalor: false,
      asumida: false,
    })
  })

  it('sol de tarde → aviso de calor', () => {
    const d = derivarLuz(directa([[15, 19]]))
    expect(d).toMatchObject({ categoria: 'directa', momento: 'tarde', orientacion: 'oeste', avisoCalor: true })
  })

  it('sol directo a través de un vidrio → aviso de calor aunque sea de mañana', () => {
    expect(derivarLuz(directa([[8, 12]], ['vidrio'])).avisoCalor).toBe(true)
    expect(derivarLuz(directa([[8, 12]], ['edificio'])).avisoCalor).toBe(false)
  })

  it('una cortina filtra el sol: pasa a indirecta brillante y sin aviso de calor', () => {
    const d = derivarLuz(directa([[14, 19]], ['cortina', 'vidrio']))
    expect(d).toMatchObject({ categoria: 'indirecta_brillante', horasSol: 5, horasEfectivas: 0, avisoCalor: false, orientacion: 'oeste' })
  })

  it('un árbol tamiza el sol a la mitad', () => {
    expect(derivarLuz(directa([[9, 13]], ['arbol']))).toMatchObject({ categoria: 'directa', horasSol: 4, horasEfectivas: 2 })
    expect(derivarLuz(directa([[9, 10.5]], ['arbol'])).categoria).toBe('indirecta_brillante')
  })

  it('living con mucha claridad sin sol: indirecta brillante', () => {
    expect(derivarLuz({ tipo: 'indirecta', tramos: [], obstaculos: [] })).toMatchObject({ categoria: 'indirecta_brillante', horasSol: 0, orientacion: 'sur', asumida: false })
  })

  it('lugar oscuro: baja', () => {
    expect(derivarLuz({ tipo: 'baja', tramos: [], obstaculos: [] }).categoria).toBe('baja')
  })

  it('"no sé" asume indirecta media y lo marca como supuesto', () => {
    expect(derivarLuz({ tipo: 'no_se', tramos: [], obstaculos: [] })).toMatchObject({ categoria: 'indirecta_media', orientacion: 'desconocida', asumida: true })
  })

  it('sol directo sin saber las horas: asume pocas horas y lo marca', () => {
    expect(derivarLuz(directa([]))).toMatchObject({ categoria: 'directa', horasSol: 3, momento: null, orientacion: 'desconocida', asumida: true, avisoCalor: false })
  })

  it('ignora tramos de un espacio que no tiene sol directo', () => {
    expect(derivarLuz({ tipo: 'indirecta', tramos: [{ desde: 9, hasta: 17 }], obstaculos: [] }).horasSol).toBe(0)
  })
})

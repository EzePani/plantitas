import { describe, expect, it } from 'vitest'
import { construirCamino, idCofre, idRepaso } from './camino'
import { diasEntre, hoyLocal } from './fecha'
import {
  insigniasMerecidas,
  metaDeHoyCumplida,
  nivelPara,
  rachaVigente,
  sumarARacha,
  xpDeLeccion,
} from './gamificacion'
import { deducirLuz } from './luz'
import { asignarPerfil, planDeCamino } from './perfil'

describe('perfil', () => {
  it('asigna el perfil según la experiencia', () => {
    expect(asignarPerfil('nunca')).toBe('primerizo')
    expect(asignarPerfil('murieron')).toBe('sobreviviente')
    expect(asignarPerfil('algunas')).toBe('en_camino')
  })

  it('"Ya sé bastante" solo es Experimentado si aprueba el mini test', () => {
    expect(asignarPerfil('bastante', 3)).toBe('experimentado')
    expect(asignarPerfil('bastante', 2)).toBe('experimentado')
    expect(asignarPerfil('bastante', 1)).toBe('en_camino')
    expect(asignarPerfil('bastante', 0)).toBe('en_camino')
  })

  it('al Sobreviviente le prioriza luz y riego', () => {
    const p = planDeCamino('sobreviviente', { tipo: 'ninguna' }, 'basico')
    expect(p.orden.slice(0, 2)).toEqual(['luz', 'riego'])
    expect(p.recomendadas).toEqual(expect.arrayContaining(['luz', 'riego']))
    expect(p.orden).toHaveLength(9)
  })

  it('si la mascota muerde plantas, la unidad de mascotas va primero', () => {
    for (const muerde of ['siempre', 'a_veces'] as const) {
      const p = planDeCamino('sobreviviente', { tipo: 'gato', muerde, alcance: 'todo' }, 'basico')
      expect(p.orden[0]).toBe('mascotas')
      expect(p.orden.slice(1, 3)).toEqual(['luz', 'riego'])
    }
    const tranqui = planDeCamino('primerizo', { tipo: 'perro', muerde: 'nunca', alcance: 'bajo' }, 'basico')
    expect(tranqui.orden[0]).toBe('basico')
    expect(tranqui.recomendadas).toContain('mascotas')
  })

  it('sin mascotas no recomienda la unidad de mascotas', () => {
    expect(planDeCamino('primerizo', { tipo: 'ninguna' }, 'basico').recomendadas).not.toContain('mascotas')
  })

  it('solo los perfiles avanzados pueden saltear, y lo salteable no se recomienda', () => {
    expect(planDeCamino('primerizo', { tipo: 'ninguna' }, 'basico').salteables).toEqual([])
    const exp = planDeCamino('experimentado', { tipo: 'ninguna' }, 'basico')
    expect(exp.salteables).toEqual(expect.arrayContaining(['basico', 'luz', 'riego']))
    for (const u of exp.salteables) expect(exp.recomendadas).not.toContain(u)
  })
})

describe('luz (hemisferio sur)', () => {
  it('deduce orientación y luz por la hora del sol', () => {
    expect(deducirLuz('manana')).toMatchObject({ orientacion: 'este', luz: 'media' })
    expect(deducirLuz('tarde')).toMatchObject({ orientacion: 'oeste', luz: 'mucha' })
    expect(deducirLuz('mediodia')).toMatchObject({ orientacion: 'norte', luz: 'mucha' })
    expect(deducirLuz('todo_el_dia')).toMatchObject({ orientacion: 'norte', luz: 'mucha' })
    expect(deducirLuz('casi_nunca')).toMatchObject({ orientacion: 'sur', luz: 'poca' })
  })

  it('"no sé" asume luz media y lo marca como supuesto', () => {
    expect(deducirLuz('no_se')).toEqual({ orientacion: 'desconocida', luz: 'media', asumida: true })
  })
})

describe('XP, nivel y racha', () => {
  it('suma XP base más aciertos', () => {
    expect(xpDeLeccion(20, 3)).toBe(26)
    expect(xpDeLeccion(20, 0)).toBe(20)
  })

  it('calcula el nivel y el progreso dentro del nivel', () => {
    expect(nivelPara(0)).toMatchObject({ indice: 0, progreso: 0, xpSiguiente: 100 })
    expect(nivelPara(99).indice).toBe(0)
    expect(nivelPara(100).indice).toBe(1)
    expect(nivelPara(175)).toMatchObject({ indice: 1, progreso: 0.5 })
    expect(nivelPara(5000)).toMatchObject({ indice: 4, xpSiguiente: null, progreso: 1 })
  })

  it('la racha sube un día por día, no por lección', () => {
    let r = sumarARacha({ dias: 0, ultima: null }, '2026-11-14')
    expect(r).toEqual({ dias: 1, ultima: '2026-11-14' })
    r = sumarARacha(r, '2026-11-14')
    expect(r.dias).toBe(1)
    r = sumarARacha(r, '2026-11-15')
    expect(r.dias).toBe(2)
  })

  it('la racha se corta si se saltea un día y cruza bien el fin de mes', () => {
    expect(sumarARacha({ dias: 5, ultima: '2026-11-10' }, '2026-11-12')).toEqual({ dias: 1, ultima: '2026-11-12' })
    expect(sumarARacha({ dias: 5, ultima: '2026-11-30' }, '2026-12-01').dias).toBe(6)
    expect(sumarARacha({ dias: 5, ultima: '2026-12-31' }, '2027-01-01').dias).toBe(6)
  })

  it('muestra 0 si la racha ya se cortó, y la meta diaria depende de hoy', () => {
    const r = { dias: 4, ultima: '2026-11-12' }
    expect(rachaVigente(r, '2026-11-12')).toBe(4)
    expect(rachaVigente(r, '2026-11-13')).toBe(4)
    expect(rachaVigente(r, '2026-11-14')).toBe(0)
    expect(metaDeHoyCumplida(r, '2026-11-12')).toBe(true)
    expect(metaDeHoyCumplida(r, '2026-11-13')).toBe(false)
  })

  it('fechas locales', () => {
    expect(hoyLocal(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(diasEntre('2026-02-28', '2026-03-01')).toBe(1)
  })

  it('otorga insignias según el progreso', () => {
    const ctx = { leccionesPorUnidad: { riego: ['riego-1', 'riego-2'] } }
    const reg = (aciertos: number) => ({ fecha: '2026-11-14', aciertos, total: 3 })
    const base = { completadas: {}, racha: { dias: 0, ultima: null }, semillas: [], salteadas: [] }
    expect(insigniasMerecidas(base, ctx)).toEqual([])
    expect(insigniasMerecidas({ ...base, completadas: { 'riego-1': reg(2) } }, ctx)).toEqual(['primera-leccion'])
    const todo = insigniasMerecidas(
      { ...base, completadas: { 'riego-1': reg(3), 'riego-2': reg(1) }, racha: { dias: 3, ultima: '2026-11-14' }, semillas: ['riego'] },
      ctx,
    )
    expect(todo).toEqual(expect.arrayContaining(['primera-leccion', 'racha-3', 'experto-riego', 'modulo-completo', 'puntaje-perfecto', 'primer-cofre']))
    expect(todo).not.toContain('racha-7')
  })
})

describe('camino', () => {
  const lecciones = { basico: ['basico-1', 'basico-2'], luz: ['luz-1'] }
  const vacio = { completadas: {}, salteadas: [], semillas: [] }
  const reg = { fecha: '2026-11-14', aciertos: 1, total: 1 }

  it('arranca con el primer nodo actual y el resto bloqueado', () => {
    const c = construirCamino(['basico', 'familias', 'luz'], lecciones, vacio)
    expect(c.totalNodos).toBe(7)
    expect(c.nodoActual?.id).toBe('basico-1')
    const estados = c.tramos.flatMap((t) => t.nodos.map((n) => n.estado))
    expect(estados.filter((e) => e === 'actual')).toHaveLength(1)
    expect(estados.filter((e) => e === 'bloqueado')).toHaveLength(6)
  })

  it('las unidades sin contenido quedan como "Próximamente" y no traban el avance', () => {
    const c = construirCamino(['basico', 'familias', 'luz'], lecciones, {
      ...vacio,
      completadas: { 'basico-1': reg, 'basico-2': reg, [idRepaso('basico')]: reg },
      semillas: ['basico'],
    })
    expect(c.tramos[1]).toMatchObject({ disponible: false, nodos: [] })
    expect(c.tramos[0].completa).toBe(true)
    expect(c.nodoActual?.id).toBe('luz-1')
  })

  it('el cofre se desbloquea al terminar lecciones y repaso', () => {
    const c = construirCamino(['basico'], lecciones, {
      ...vacio,
      completadas: { 'basico-1': reg, 'basico-2': reg, [idRepaso('basico')]: reg },
    })
    expect(c.nodoActual?.id).toBe(idCofre('basico'))
    expect(c.terminado).toBe(false)
  })

  it('saltear una unidad completa sus lecciones pero deja el cofre para abrir', () => {
    const c = construirCamino(['basico', 'luz'], lecciones, { ...vacio, salteadas: ['basico'] })
    expect(c.nodoActual?.id).toBe(idCofre('basico'))
    expect(c.nodosHechos).toBe(3)
  })

  it('marca el camino como terminado', () => {
    const c = construirCamino(['luz'], lecciones, {
      ...vacio,
      completadas: { 'luz-1': reg, [idRepaso('luz')]: reg },
      semillas: ['luz'],
    })
    expect(c.terminado).toBe(true)
    expect(c.nodoActual).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { esquemaDatos } from './backup'
import { aFilas, canonico, conciliar, deFilas, huella, pendientes, type Base, type Remota } from './filas'
import type { DatosPersistidos } from './tipos'

const VACIO: DatosPersistidos = { onboardingCompleto: false, respuestas: null, perfil: null, mascotas: { tipo: 'ninguna' }, completadas: {}, salteadas: [], xp: 0, racha: { dias: 0, ultima: null }, insignias: {}, semillas: [], espacios: [], favoritas: [], colecciones: [], hijitos: [], casos: [], refuerzo: { ultimo: null, leccionesAlUltimo: 0, fallidas: [] } }
const espacio = { id: 'living-1', nombre: 'Living', creado: '2026-11-14', tipo: 'living' as const, luz: { tipo: 'indirecta' as const, tramos: [], obstaculos: [] }, tamano: 'mediano' as const, mascotas: 'gato' as const, esfuerzo: 'medio' as const }
const caso = { plantaId: 'potus', nombre: 'Potus', donde: '', sintomas: ['amarillas' as const], tierra: 'mojada' as const, cambios: [], notas: '', causas: ['exceso_riego' as const] }
const TODO: DatosPersistidos = {
  ...VACIO,
  onboardingCompleto: true,
  respuestas: { experiencia: 'algunas', lugar: 'ambos', tiempo: 'casi_nada', objetivo: 'a_fondo' },
  perfil: 'en_camino',
  mascotas: { tipo: 'gato', muerde: 'siempre' },
  completadas: { 'luz-1': { fecha: '2026-11-17', aciertos: 4, total: 4 } },
  salteadas: ['plagas'],
  xp: 120,
  racha: { dias: 3, ultima: '2026-11-26' },
  insignias: { 'racha-3': '2026-11-19' },
  semillas: ['basico'],
  espacios: [
    { ...espacio, plano: { suelo: [0, 1], elementos: [{ id: 'el-m', tipo: 'mesa', celdas: [1] }], luces: { 'el-m': 'baja' } }, plantas: [{ id: 'pl-1', plantaId: 'potus', lugar: 'el-m' }, { id: 'pl-2', plantaId: 'potus' }] },
    { ...espacio, id: 'balcon-2', nombre: 'Balcón', plantas: [{ id: 'pl-1', plantaId: 'cinta' }] },
  ],
  favoritas: ['gomero', 'cinta'],
  colecciones: [{ id: 'col-1', nombre: 'Ya tengo', plantas: ['potus'] }],
  hijitos: [
    { id: 'hij-2', plantaId: 'potus', nombre: 'Potus', origen: 'corte', medio: 'agua', inicio: '2026-11-24', agua: '2026-11-24', raices: null, maceta: null, prendio: null },
    { id: 'hij-1', plantaId: null, nombre: 'Otro', origen: 'corte', medio: 'tierra', inicio: '2026-11-20', agua: '2026-11-20', raices: null, maceta: null, prendio: null },
  ],
  casos: [
    { ...caso, id: 'caso-2', ingreso: '2026-11-25', controles: [], vivero: [], foto: 'f1' },
    { ...caso, id: 'caso-1', ingreso: '2026-11-20', controles: [{ fecha: '2026-11-21', estado: 'igual', tierra: 'humeda', nota: '' }], vivero: [{ id: 'v1', fecha: '2026-11-22', dijo: 'Menos agua' }], cierre: { fecha: '2026-11-26', tipo: 'alta' } },
    { ...caso, id: 'caso-0', ingreso: '2026-11-18', controles: [] },
  ],
  refuerzo: { ultimo: '2026-11-26', leccionesAlUltimo: 1, fallidas: ['luz-1:2'] },
}

let reloj = 0
const remota = (clave: string, datos: Record<string, unknown>, mas: Partial<Remota> = {}): Remota => {
  const corte = clave.indexOf('/')
  return { tabla: clave.slice(0, corte) as Remota['tabla'], id: clave.slice(corte + 1), datos, version: 16, creado: `c${++reloj}`, actualizado: `a${++reloj}`, borrado: false, ...mas }
}
/** Todo sincronizado: la base tiene exactamente lo local */
function alDia(d: DatosPersistidos) {
  const filas = aFilas(d)
  const remotas = [...filas].map(([k, f]) => remota(k, f.datos))
  const base: Base = Object.fromEntries(remotas.map((r) => [`${r.tabla}/${r.id}`, [huella(r.datos), r.actualizado]]))
  return { filas, remotas, base }
}
const NADIE = new Set<string>()
const op = { version: 16 }

describe('de los datos a filas y de vuelta', () => {
  it('ida y vuelta da lo mismo, en el mismo orden', () => {
    const vuelta = deFilas(aFilas(TODO), VACIO)
    expect(vuelta).toEqual(TODO)
    expect(esquemaDatos.parse(vuelta)).toEqual(TODO)
    expect(deFilas(aFilas(VACIO), VACIO)).toEqual(VACIO)
  })

  it('cada cosa tiene su fila, también el plano y dos plantas con el mismo id en espacios distintos', () => {
    const claves = [...aFilas(TODO).keys()]
    expect(claves).toContain('planos/living-1')
    expect(claves).toContain('espacio_plantas/living-1:pl-1')
    expect(claves).toContain('espacio_plantas/balcon-2:pl-1')
    expect(claves).toContain('controles/caso-1:2026-11-21')
    expect(claves).toContain('visitas_vivero/caso-1:v1')
    expect(new Set(claves).size).toBe(claves.length)
  })

  it('no contestar lo del vivero y contestar que no son cosas distintas', () => {
    const [si, , no] = deFilas(aFilas(TODO), VACIO).casos
    expect(si.vivero).toEqual([])
    expect(no.vivero).toBeUndefined()
  })

  it('la huella no depende del orden de los campos ni de los que no tienen valor', () => {
    expect(canonico({ b: 1, a: [{ d: null, c: undefined }] })).toBe(canonico({ a: [{ d: null }], b: 1 }))
    expect(huella({ a: 1 })).not.toBe(huella({ a: 2 }))
  })
})

describe('conciliar', () => {
  it('sin cambios en ningún lado no hay nada que hacer', () => {
    const { filas, remotas, base } = alDia(TODO)
    const c = conciliar(filas, remotas, base, NADIE, op)
    expect(deFilas(c.filas, VACIO)).toEqual(TODO)
    expect(pendientes(c.filas, c.base, NADIE, 16)).toEqual([])
    expect(c.faltan).toEqual([])
  })

  it('lo que falta acá sin haberse borrado se pide de nuevo y vuelve', () => {
    const { remotas, base } = alDia(TODO)
    const recortado = aFilas({ ...TODO, espacios: TODO.espacios.map(({ plano: _p, ...e }) => ({ ...e, plantas: [] })), casos: [] })
    // Con solo las novedades no alcanza: avisa qué falta
    const parcial = conciliar(recortado, [], base, NADIE, op)
    expect(parcial.faltan).toContain('planos/living-1')
    expect(pendientes(parcial.filas, parcial.base, NADIE, 16)).toEqual([])
    // Con todo, vuelve
    const c = conciliar(recortado, remotas, base, NADIE, op)
    expect(deFilas(c.filas, VACIO)).toEqual(TODO)
    expect(pendientes(c.filas, c.base, NADIE, 16)).toEqual([])
  })

  it('lo borrado a propósito no vuelve y se avisa a la base', () => {
    const { remotas, base } = alDia(TODO)
    const sinCaso = aFilas({ ...TODO, casos: TODO.casos.filter((c) => c.id !== 'caso-1') })
    const borrados = new Set(['casos/caso-1', 'controles/caso-1:2026-11-21', 'visitas_vivero/caso-1:v1'])
    const c = conciliar(sinCaso, remotas, base, borrados, op)
    expect(deFilas(c.filas, VACIO).casos.map((x) => x.id)).toEqual(['caso-2', 'caso-0'])
    expect(c.faltan).toEqual([])
    expect(pendientes(c.filas, c.base, borrados, 16).map((p) => [p.tabla, p.borrado])).toEqual([['casos', true], ['controles', true], ['visitas_vivero', true]])
  })

  it('una fila borrada en otro dispositivo se va de acá, con todo lo que cuelga de ella', () => {
    const { filas, remotas, base } = alDia(TODO)
    const borrado = remotas.filter((r) => r.id === 'living-1' && r.tabla === 'espacios').map((r) => ({ ...r, borrado: true, actualizado: 'despues' }))
    const c = conciliar(filas, borrado, base, NADIE, op)
    const d = deFilas(c.filas, VACIO)
    expect(d.espacios.map((e) => e.id)).toEqual(['balcon-2'])
    // Lo que quedó suelto no se sube ni se pide de nuevo
    const despues = conciliar(aFilas(d), [], c.base, NADIE, op)
    expect(pendientes(despues.filas, despues.base, NADIE, 16)).toEqual([])
  })

  it('una planta de un espacio que no está no entra', () => {
    const c = conciliar(aFilas(VACIO), [remota('espacio_plantas/x:pl-9', { id: 'pl-9', plantaId: 'potus', espacio: 'x' }), remota('planos/x', { suelo: [0], elementos: [] })], {}, NADIE, op)
    expect(deFilas(c.filas, VACIO).espacios).toEqual([])
    expect(c.faltan).toEqual([])
  })

  it('cambios en filas distintas se suman; en la misma fila gana lo de acá y se sube', () => {
    const { remotas, base } = alDia(TODO)
    const local = aFilas({ ...TODO, espacios: TODO.espacios.map((e) => (e.id === 'living-1' ? { ...e, nombre: 'Comedor' } : e)) })
    const delOtro = [
      { ...remotas.find((r) => r.tabla === 'espacios' && r.id === 'living-1')!, datos: { ...espacio, nombre: 'Sala' }, actualizado: 'despues-1' },
      { ...remotas.find((r) => r.tabla === 'hijitos' && r.id === 'hij-1')!, datos: { ...TODO.hijitos[1], raices: '2026-11-27' }, actualizado: 'despues-2' },
      remota('favoritas/potus', {}),
    ]
    const c = conciliar(local, delOtro, base, NADIE, op)
    const d = deFilas(c.filas, VACIO)
    expect(d.espacios[0].nombre).toBe('Comedor')
    expect(d.hijitos[1].raices).toBe('2026-11-27')
    expect(d.favoritas).toEqual(['potus', 'gomero', 'cinta'])
    expect(pendientes(c.filas, c.base, NADIE, 16)).toMatchObject([{ tabla: 'espacios', id: 'living-1', visto: 'despues-1', datos: { nombre: 'Comedor' } }])
  })

  it('los puntos, la racha y las lecciones se quedan con lo mejor de cada lado', () => {
    const { remotas, base } = alDia(TODO)
    const local = aFilas({ ...TODO, xp: 150, completadas: { 'luz-1': { fecha: '2026-11-17', aciertos: 4, total: 4 }, 'luz-2': { fecha: '2026-11-27', aciertos: 2, total: 4 } } })
    const delOtro = [
      { ...remotas.find((r) => r.id === 'xp')!, datos: { xp: 200 }, actualizado: 'despues-1' },
      remota('lecciones/luz-2', { fecha: '2026-11-27', aciertos: 4, total: 4 }),
    ]
    const d = deFilas(conciliar(local, delOtro, base, NADIE, op).filas, VACIO)
    expect(d.xp).toBe(200)
    expect(d.completadas['luz-2'].aciertos).toBe(4)
  })

  it('filas escritas por una app más nueva: avisa y no las toca', () => {
    const { filas, remotas, base } = alDia(TODO)
    const c = conciliar(filas, [{ ...remotas[0], version: 17, datos: { otro: 1 }, actualizado: 'despues' }], base, NADIE, op)
    expect(c.nuevas).toBe(true)
    expect(deFilas(c.filas, VACIO)).toEqual(TODO)
  })

  it('primera vez de un dispositivo sin cambios propios: vale la base, salvo lo copiado del bloque viejo', () => {
    const viejo = aFilas({ ...TODO, espacios: TODO.espacios.map((e) => ({ ...e, nombre: 'Viejo' })) })
    const { remotas } = alDia(TODO)
    const escritasPorLaApp = conciliar(viejo, remotas, {}, NADIE, { version: 16, ganaRemoto: true, delBloque: 15 })
    expect(deFilas(escritasPorLaApp.filas, VACIO)).toEqual(TODO)
    const copiadasDelBloque = conciliar(viejo, remotas.map((r) => ({ ...r, version: 15 })), {}, NADIE, { version: 16, ganaRemoto: true, delBloque: 15 })
    expect(deFilas(copiadasDelBloque.filas, VACIO).espacios.map((e) => e.nombre)).toEqual(['Viejo', 'Viejo'])
  })
})

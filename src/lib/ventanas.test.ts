/**
 * Las formas en que se podían perder datos: varias ventanas sobre el mismo guardado, versiones viejas
 * de la app y la sincronización pisando lo local. Cada "ventana" es una carga aparte de la app y
 * cada dispositivo tiene su propio guardado.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VERSION_DATOS } from './backup'
import { aFilas, deFilas, type Fila, type Tabla } from './filas'
import type { DatosPersistidos } from './tipos'

// Base falsa, con las mismas reglas que `supabase/migrations`: filas con versión, borrado y `actualizado`
interface FilaBase extends Fila {
  version: number
  creado: string
  actualizado: string
  borrado: boolean
}
const nube = {
  filas: new Map<string, FilaBase>(),
  historial: [] as FilaBase[],
  bloque: null as { datos: unknown; version: number; actualizado: string } | null,
  /** Si está, los pedidos fallan con este mensaje */
  caida: null as string | null,
  alGuardar: null as (() => void) | null,
  pedidos: 0,
}
let reloj = 0
const hora = () => new Date(Date.UTC(2026, 10, 27, 12, 0, 0, ++reloj)).toISOString()

function rpc(nombre: string, args: Record<string, unknown>) {
  nube.pedidos++
  if (nube.caida) return { data: null, error: { message: nube.caida } }
  if (nombre === 'plantitas_cambios') {
    const desde = args.desde as string | null
    return { data: structuredClone([...nube.filas.values()].filter((f) => !desde || f.actualizado > desde).sort((a, b) => a.creado.localeCompare(b.creado))), error: null }
  }
  const pedido = args.filas as { tabla: Tabla; id: string; datos?: Record<string, unknown>; version: number; borrado: boolean; visto: string | null }[]
  // O entran todas o ninguna
  const copia = new Map(nube.filas)
  const salida = []
  for (const p of structuredClone(pedido)) {
    const clave = `${p.tabla}/${p.id}`
    const hay = copia.get(clave)
    let escrito = true
    let actualizado = hay?.actualizado ?? null
    if (!hay) {
      if (!p.borrado) copia.set(clave, { tabla: p.tabla, id: p.id, datos: p.datos!, version: p.version, creado: hora(), actualizado: (actualizado = hora()), borrado: false })
    } else if (p.visto !== hay.actualizado) escrito = false
    else {
      if (p.version < hay.version) return { data: null, error: { message: 'PLANTITAS_VERSION_VIEJA' } }
      nube.historial.push(hay)
      copia.set(clave, { ...hay, datos: p.borrado ? hay.datos : p.datos!, version: Math.max(hay.version, p.version), borrado: p.borrado, actualizado: (actualizado = hora()) })
    }
    salida.push({ tabla: p.tabla, id: p.id, actualizado, escrito })
  }
  nube.filas = copia
  nube.alGuardar?.()
  return { data: salida, error: null }
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }), onAuthStateChange: () => {}, signOut: async () => {} },
    rpc: async (nombre: string, args: Record<string, unknown>) => rpc(nombre, args),
    from: (tabla: string) => {
      const q = {
        select: () => q,
        update: () => q,
        eq: () => q,
        upsert: async (v: { datos: unknown; version: number; actualizado: string }) => {
          if (nube.caida) return { error: { message: nube.caida } }
          if (tabla === 'progreso') nube.bloque = structuredClone({ datos: v.datos, version: v.version, actualizado: v.actualizado })
          return { error: null }
        },
        maybeSingle: async () => (nube.caida ? { data: null, error: { message: nube.caida } } : { data: tabla === 'dispositivos' ? { id: 'd' } : structuredClone(nube.bloque), error: null }),
        then: (listo: (r: unknown) => void) => listo({ data: [], error: null }),
      }
      return q
    },
  }),
}))

// Cada dispositivo tiene su guardado; `disco` es el del que se está usando
type Disco = Map<string, string>
let disco: Disco = new Map()
const almacenamiento = { getItem: (k: string) => disco.get(k) ?? null, setItem: (k: string, v: string) => void disco.set(k, v), removeItem: (k: string) => void disco.delete(k) }
vi.stubGlobal('localStorage', almacenamiento)
vi.stubGlobal('window', { localStorage: almacenamiento })
vi.stubGlobal('document', { addEventListener: () => {}, visibilityState: 'visible' })
vi.stubGlobal('addEventListener', () => {})
vi.stubGlobal('location', { origin: 'x', pathname: '/', hash: '', search: '' })

/** Abre la app en una ventana nueva */
async function abrir() {
  vi.resetModules()
  const { useStore } = await import('../store/useStore')
  const { leerBloqueo } = await import('../store/disco')
  const copias = await import('./copias')
  const n = await import('./nube')
  return { s: () => useStore.getState(), bloqueo: leerBloqueo, copias, nube: n }
}

const espacio = { id: 'living-1', nombre: 'Living', creado: '2026-11-14', tipo: 'living' as const, luz: { tipo: 'indirecta' as const, tramos: [], obstaculos: [] }, tamano: 'mediano' as const, mascotas: 'gato' as const, esfuerzo: 'medio' as const, plantas: [] }
const plano = { suelo: [0, 1, 6, 7], elementos: [{ id: 'el-m', tipo: 'mesa' as const, celdas: [7] }] }
const caso = { plantaId: 'potus', nombre: 'Potus', donde: '', sintomas: ['amarillas' as const], tierra: 'mojada' as const, cambios: [], notas: '', causas: ['exceso_riego' as const] }

type Ventana = Awaited<ReturnType<typeof abrir>>
function cargarTodo(v: Ventana) {
  v.s().guardarPlano('living-1', plano)
  v.s().agregarPlantaAEspacio('living-1', 'potus', 'el-m')
  v.s().ingresarCaso(caso)
}
const completo = (d: DatosPersistidos) => ({ plantas: d.espacios[0]?.plantas.length ?? 0, plano: Boolean(d.espacios[0]?.plano), guardia: d.casos.length })
const TODO = { plantas: 1, plano: true, guardia: 1 }
const NADA = { plantas: 0, plano: false, guardia: 0 }
const guardado = () => JSON.parse(disco.get('plantitas-estado')!) as { version: number; state: DatosPersistidos }

const vincular = (sucio = true) => disco.set('plantitas-dispositivo', JSON.stringify({ id: 'd', nombre: 'Celu', registrado: true, visto: null, sucio }))

/** Una app con la bienvenida hecha y un espacio */
async function arrancar() {
  const v = await abrir()
  v.s().completarOnboarding({ experiencia: 'algunas', lugar: 'interior', tiempo: 'un_rato', objetivo: 'basico' }, { tipo: 'gato' }, [])
  v.s().guardarEspacio(espacio)
  return v
}

/** Lo que hay en la base, armado como lo vería una app recién instalada */
function enBase(): DatosPersistidos {
  const vivas = [...nube.filas.values()].filter((f) => !f.borrado).sort((a, b) => a.creado.localeCompare(b.creado))
  return deFilas(new Map(vivas.map((f) => [`${f.tabla}/${f.id}`, f])), VACIO)
}
const VACIO: DatosPersistidos = { onboardingCompleto: false, respuestas: null, perfil: null, mascotas: { tipo: 'ninguna' }, completadas: {}, salteadas: [], xp: 0, racha: { dias: 0, ultima: null }, insignias: {}, semillas: [], espacios: [], favoritas: [], colecciones: [], hijitos: [], casos: [], refuerzo: { ultimo: null, leccionesAlUltimo: 0, fallidas: [] } }

beforeEach(() => {
  disco = new Map()
  nube.filas = new Map()
  nube.historial = []
  nube.bloque = null
  nube.caida = null
  nube.alGuardar = null
  nube.pedidos = 0
})

describe('varias ventanas', () => {
  it('tocar algo en una ventana abierta de antes no pisa lo cargado en otra', async () => {
    await arrancar()
    vincular()
    const deAntes = await abrir()
    const otra = await abrir()
    cargarTodo(otra)
    await otra.nube.sincronizar()
    deAntes.s().alternarFavorita('potus')
    await deAntes.nube.sincronizar()
    expect(completo(guardado().state)).toEqual(TODO)
    expect(completo(enBase())).toEqual(TODO)
    expect(enBase().favoritas).toEqual(['potus'])
    expect(deAntes.s().favoritas).toEqual(['potus'])
  })

  it('guardar un formulario que quedó abierto no saca las plantas ni el plano', async () => {
    const v = await arrancar()
    cargarTodo(v)
    v.s().guardarEspacio({ ...espacio, nombre: 'Comedor' })
    expect(guardado().state.espacios[0].nombre).toBe('Comedor')
    expect(completo(guardado().state)).toEqual(TODO)
  })

  it('lo que escribe una ventana con la app vieja se suma, no reemplaza', async () => {
    const v = await arrancar()
    const viejo = { version: 14, state: guardado().state }
    cargarTodo(v)
    // La ventana vieja guarda lo que tenía en memoria
    disco.set('plantitas-estado', JSON.stringify({ ...viejo, state: { ...viejo.state, favoritas: ['cinta'] } }))
    v.s().alternarFavorita('potus')
    expect(completo(guardado().state)).toEqual(TODO)
    expect(guardado().state.favoritas.sort()).toEqual(['cinta', 'potus'])
    expect(guardado().version).toBe(VERSION_DATOS)
  })

  it('una ventana desactualizada no escribe sobre datos de una versión más nueva', async () => {
    const v = await arrancar()
    const nuevo = JSON.stringify({ version: VERSION_DATOS + 1, state: { ...guardado().state, algoNuevo: 1 } })
    disco.set('plantitas-estado', nuevo)
    v.s().alternarFavorita('potus')
    expect(disco.get('plantitas-estado')).toBe(nuevo)
    expect(v.bloqueo()).toBe('nueva')
    const reabierta = await abrir()
    reabierta.s().alternarFavorita('cinta')
    expect(disco.get('plantitas-estado')).toBe(nuevo)
  })
})

describe('guardado que no se entiende o de otra versión', () => {
  it('si no se puede leer, no se pisa y queda una copia', async () => {
    await arrancar()
    const roto = JSON.stringify({ version: VERSION_DATOS - 1, state: { ...guardado().state, xp: 'muchos' } })
    disco.set('plantitas-estado', roto)
    const v = await abrir()
    expect(v.bloqueo()).toBe('ilegible')
    v.s().alternarFavorita('potus')
    expect(disco.get('plantitas-estado')).toBe(roto)
    expect(v.copias.leerCopias()).toHaveLength(1)
  })

  it('al actualizarse guarda una copia de lo que había', async () => {
    const v = await arrancar()
    cargarTodo(v)
    disco.set('plantitas-estado', JSON.stringify({ version: VERSION_DATOS - 1, state: guardado().state }))
    const nueva = await abrir()
    const [copia] = nueva.copias.leerCopias()
    expect(copia.motivo).toBe('actualizacion')
    expect(completo(nueva.copias.abrirCopia(copia)!)).toEqual(TODO)
  })
})

describe('sincronización: cada cosa en su fila', () => {
  /** Un dispositivo: su guardado y su app abierta. Antes de usarlo hay que ponerlo en uso */
  interface Dispositivo {
    disco: Disco
    v: Ventana
  }
  const usar = (d: Dispositivo) => ((disco = d.disco), d.v)
  async function sincronizar(d: Dispositivo) {
    await usar(d).nube.sincronizar()
  }
  /** Otro dispositivo de la misma cuenta, recién vinculado y sin nada cargado */
  async function otroDispositivo(): Promise<Dispositivo> {
    disco = new Map()
    vincular(false)
    const v = await abrir()
    v.nube.iniciar()
    return { disco, v }
  }
  /** El celu, con todo cargado y subido */
  async function celuConTodo(): Promise<Dispositivo> {
    const v = await arrancar()
    cargarTodo(v)
    vincular()
    v.nube.iniciar()
    const d = { disco, v }
    await sincronizar(d)
    return d
  }
  const recortada = (d: DatosPersistidos): DatosPersistidos => ({ ...d, espacios: d.espacios.map(({ plano: _p, ...e }) => ({ ...e, plantas: [] })), casos: [] })
  const error = (d: Dispositivo) => usar(d).nube.leerEstado().error

  it('lo cargado en el celu queda en la base, cada cosa por separado, y aparece igual en la compu', async () => {
    const celu = await celuConTodo()
    expect(error(celu)).toBeNull()
    const tablas = new Set([...nube.filas.values()].map((f) => f.tabla))
    expect([...tablas].sort()).toEqual(['avance', 'casos', 'espacio_plantas', 'espacios', 'planos'])
    expect(completo(enBase())).toEqual(TODO)

    const compu = await otroDispositivo()
    await sincronizar(compu)
    expect(error(compu)).toBeNull()
    expect(usar(compu).s().espacios).toEqual(usar(celu).s().espacios)
    expect(usar(compu).s().casos).toEqual(usar(celu).s().casos)
    expect(usar(compu).s().onboardingCompleto).toBe(true)
  })

  it('sincronizar sin cambios no escribe nada', async () => {
    const celu = await celuConTodo()
    const antes = [...nube.filas.values()].map((f) => f.actualizado).join()
    await sincronizar(celu)
    await sincronizar(celu)
    expect([...nube.filas.values()].map((f) => f.actualizado).join()).toBe(antes)
    expect(nube.historial).toHaveLength(0)
  })

  it('dos dispositivos cargan cosas distintas a la vez y quedan las dos', async () => {
    const celu = await celuConTodo()
    const compu = await otroDispositivo()
    await sincronizar(compu)
    usar(celu).s().agregarPlantaAEspacio('living-1', 'cinta')
    usar(compu).s().ingresarCaso({ ...caso, plantaId: 'cinta', nombre: 'Cinta' })
    usar(compu).s().alternarFavorita('potus')
    await sincronizar(celu)
    await sincronizar(compu)
    await sincronizar(celu)
    for (const d of [celu, compu]) {
      expect(usar(d).s().espacios[0].plantas.map((p) => p.plantaId)).toEqual(['potus', 'cinta'])
      expect(usar(d).s().casos.map((c) => c.plantaId).sort()).toEqual(['cinta', 'potus'])
      expect(usar(d).s().favoritas).toEqual(['potus'])
      expect(Boolean(usar(d).s().espacios[0].plano)).toBe(true)
    }
  })

  it('un dispositivo que perdió datos sin borrarlos no los saca de la base: los recupera', async () => {
    const celu = await celuConTodo()
    // Lo que pasó el 27/11: el guardado queda recortado sin que nadie haya borrado nada
    const g = guardado()
    disco.set('plantitas-estado', JSON.stringify({ ...g, state: recortada(g.state) }))
    const reabierta = { disco: celu.disco, v: await abrir() }
    expect(completo(usar(reabierta).s())).toEqual(NADA)
    usar(reabierta).nube.iniciar()
    usar(reabierta).s().alternarFavorita('potus')
    await sincronizar(reabierta)
    expect(completo(usar(reabierta).s())).toEqual(TODO)
    expect(completo(enBase())).toEqual(TODO)
    expect(enBase().favoritas).toEqual(['potus'])
  })

  it('lo mismo si pasa mientras la app está abierta y sin recargar', async () => {
    const celu = await celuConTodo()
    await sincronizar(celu)
    usar(celu).s().reemplazarDatos(recortada(usar(celu).s()))
    await sincronizar(celu)
    expect(completo(usar(celu).s())).toEqual(TODO)
    expect(completo(enBase())).toEqual(TODO)
  })

  it('una foto agregada en un dispositivo no se pierde si en el otro se tocó el mismo caso', async () => {
    const celu = await celuConTodo()
    const compu = await otroDispositivo()
    await sincronizar(compu)
    const id = usar(celu).s().casos[0].id
    usar(celu).s().marcarFotoCaso(id, 'f-nueva')
    usar(compu).s().cerrarCaso(id, 'alta')
    await sincronizar(celu)
    await sincronizar(compu)
    await sincronizar(celu)
    for (const d of [celu, compu]) expect(usar(d).s().casos[0]).toMatchObject({ foto: 'f-nueva', cierre: { tipo: 'alta' } })
  })

  it('la nota corregida en un dispositivo llega al otro', async () => {
    const celu = await celuConTodo()
    const compu = await otroDispositivo()
    await sincronizar(compu)
    const id = usar(celu).s().casos[0].id
    usar(celu).s().corregirNotaCaso(id, '  La regué de más  ')
    await sincronizar(celu)
    await sincronizar(compu)
    expect(usar(compu).s().casos[0].notas).toBe('La regué de más')
    // Quitarla también viaja
    usar(compu).s().corregirNotaCaso(id, '')
    await sincronizar(compu)
    await sincronizar(celu)
    expect(usar(celu).s().casos[0].notas).toBe('')
    expect(nube.historial.some((f) => f.tabla === 'casos' && f.datos.notas === 'La regué de más')).toBe(true)
  })

  for (const primero of ['quien escribe', 'el otro'] as const) {
    it(`la nota corregida no la pisa un dispositivo atrasado que tocó el mismo caso (sincroniza primero ${primero})`, async () => {
      const celu = await celuConTodo()
      const compu = await otroDispositivo()
      await sincronizar(compu)
      const id = usar(celu).s().casos[0].id
      usar(celu).s().corregirNotaCaso(id, 'Nota nueva')
      usar(compu).s().cerrarCaso(id, 'alta')
      const orden = primero === 'quien escribe' ? [celu, compu, celu] : [compu, celu, compu]
      for (const d of orden) await sincronizar(d)
      for (const d of [celu, compu]) expect(usar(d).s().casos[0]).toMatchObject({ notas: 'Nota nueva', cierre: { tipo: 'alta' } })
    })
  }

  it('lo que se borra a propósito se borra en todos lados, y la base lo conserva marcado', async () => {
    const celu = await celuConTodo()
    const compu = await otroDispositivo()
    await sincronizar(compu)
    const idCaso = usar(celu).s().casos[0].id
    usar(celu).s().borrarCaso(idCaso)
    usar(celu).s().quitarPlantaDeEspacio('living-1', 'potus', 'el-m')
    await sincronizar(celu)
    await sincronizar(compu)
    expect(completo(usar(compu).s())).toEqual({ plantas: 0, plano: true, guardia: 0 })
    expect(nube.filas.get(`casos/${idCaso}`)).toMatchObject({ borrado: true, datos: { plantaId: 'potus' } })
    // En la compu queda una copia de lo que se fue
    const [copia] = usar(compu).copias.leerCopias()
    expect(completo(usar(compu).copias.abrirCopia(copia)!)).toEqual(TODO)
    // Y no vuelve en las siguientes
    await sincronizar(celu)
    await sincronizar(compu)
    expect(usar(celu).s().casos).toHaveLength(0)
  })

  it('borrar un espacio se lleva sus plantas y no deja nada suelto', async () => {
    const celu = await celuConTodo()
    const compu = await otroDispositivo()
    await sincronizar(compu)
    usar(celu).s().borrarEspacio('living-1')
    await sincronizar(celu)
    await sincronizar(compu)
    expect(usar(compu).s().espacios).toHaveLength(0)
    const pedidos = nube.pedidos
    await sincronizar(compu)
    // Una vuelta normal: trae y nada más
    expect(nube.pedidos - pedidos).toBe(1)
  })

  it('la misma cosa cambiada en dos dispositivos: se junta lo que se puede y nada se rompe', async () => {
    const celu = await celuConTodo()
    const compu = await otroDispositivo()
    await sincronizar(compu)
    usar(celu).s().completarNodo('basico-1', 10, 3, 5)
    usar(compu).s().completarNodo('basico-2', 10, 5, 5)
    const xpCelu = usar(celu).s().xp
    const xpCompu = usar(compu).s().xp
    usar(celu).s().guardarEspacio({ ...espacio, nombre: 'Comedor' })
    usar(compu).s().guardarEspacio({ ...espacio, nombre: 'Sala' })
    await sincronizar(celu)
    await sincronizar(compu)
    await sincronizar(celu)
    for (const d of [celu, compu]) {
      expect(Object.keys(usar(d).s().completadas).sort()).toEqual(['basico-1', 'basico-2'])
      expect(usar(d).s().xp).toBe(Math.max(xpCelu, xpCompu))
      // La última en subir gana, y la otra versión queda en el historial
      expect(usar(d).s().espacios[0].nombre).toBe('Sala')
      expect(completo(usar(d).s())).toEqual(TODO)
    }
    expect(nube.historial.some((f) => f.tabla === 'espacios' && f.datos.nombre === 'Comedor')).toBe(true)
  })

  it('si el envío falla no se pierde nada y sale en el siguiente', async () => {
    const celu = await celuConTodo()
    nube.caida = 'fetch failed'
    usar(celu).s().agregarPlantaAEspacio('living-1', 'cinta')
    await sincronizar(celu)
    expect(error(celu)).not.toBeNull()
    expect(usar(celu).s().espacios[0].plantas).toHaveLength(2)
    expect(enBase().espacios[0].plantas).toHaveLength(1)
    nube.caida = null
    await sincronizar(celu)
    expect(error(celu)).toBeNull()
    expect(enBase().espacios[0].plantas).toHaveLength(2)
  })

  it('lo que se carga sin conexión en una app recién abierta se sube al volver', async () => {
    const celu = await celuConTodo()
    nube.caida = 'fetch failed'
    const reabierta = { disco: celu.disco, v: await abrir() }
    usar(reabierta).nube.iniciar()
    usar(reabierta).s().agregarPlantaAEspacio('living-1', 'cinta')
    usar(reabierta).s().borrarCaso(usar(reabierta).s().casos[0].id)
    await sincronizar(reabierta)
    nube.caida = null
    const otraVez = { disco: celu.disco, v: await abrir() }
    await sincronizar(otraVez)
    expect(completo(enBase())).toEqual({ plantas: 2, plano: true, guardia: 0 })
  })

  it('lo que se cambia mientras sube queda pendiente y se sube después', async () => {
    const celu = await celuConTodo()
    usar(celu).s().alternarFavorita('potus')
    nube.alGuardar = () => {
      nube.alGuardar = null
      celu.v.s().alternarFavorita('cinta')
    }
    await sincronizar(celu)
    expect(enBase().favoritas).toEqual(['potus'])
    await sincronizar(celu)
    expect(enBase().favoritas).toEqual(['cinta', 'potus'])
  })

  it('si en la base hay filas de una versión más nueva no toca nada', async () => {
    const celu = await celuConTodo()
    const clave = [...nube.filas.keys()].find((k) => k.startsWith('casos/'))!
    nube.filas.set(clave, { ...nube.filas.get(clave)!, version: VERSION_DATOS + 1, datos: { algoNuevo: 1 }, actualizado: hora() })
    const antes = structuredClone([...nube.filas.values()])
    usar(celu).s().alternarFavorita('potus')
    await sincronizar(celu)
    expect([...nube.filas.values()]).toEqual(antes)
    expect(completo(usar(celu).s())).toEqual(TODO)
    expect(error(celu)).toMatch(/versión más nueva/)
  })

  it('pegar o importar un progreso con menos cosas no borra nada de la base', async () => {
    const celu = await celuConTodo()
    usar(celu).s().reemplazarDatos({ ...recortada(usar(celu).s()), favoritas: ['cinta'] })
    await sincronizar(celu)
    expect(completo(enBase())).toEqual(TODO)
    expect(enBase().favoritas).toEqual(['cinta'])
    expect(completo(usar(celu).s())).toEqual(TODO)
  })

  describe('el paso desde el bloque único', () => {
    /** Como estaba antes de las tablas: todo en el bloque `progreso`, con el formato 15 */
    async function conBloque(sucio = false) {
      const v = await arrancar()
      cargarTodo(v)
      nube.bloque = { datos: structuredClone(guardado().state), version: 15, actualizado: 'bloque-1' }
      disco.set('plantitas-dispositivo', JSON.stringify({ id: 'd', nombre: 'Celu', registrado: true, visto: 'bloque-1', sucio }))
      return { disco, v }
    }
    /** Lo que hace la migración de la base con ese bloque */
    function pasarBloqueAFilas() {
      for (const [clave, f] of aFilas(nube.bloque!.datos as DatosPersistidos)) nube.filas.set(clave, { ...f, version: 15, creado: hora(), actualizado: hora(), borrado: false })
    }

    it('el celu actualizado sube todo a las tablas sin perder nada', async () => {
      const celu = await conBloque()
      usar(celu).nube.iniciar()
      await sincronizar(celu)
      expect(error(celu)).toBeNull()
      expect(completo(enBase())).toEqual(TODO)
      expect(completo(usar(celu).s())).toEqual(TODO)
      // El bloque queda como respaldo, con la versión nueva: una app vieja no lo va a pisar
      expect(nube.bloque).toMatchObject({ version: VERSION_DATOS })
      expect(completo(nube.bloque!.datos as DatosPersistidos)).toEqual(TODO)
    })

    it('las filas copiadas del bloque no pisan lo que el celu cargó después', async () => {
      const celu = await conBloque()
      pasarBloqueAFilas()
      // Después de esa copia el celu siguió cargando, y la app vieja lo subió al bloque
      usar(celu).s().guardarPlano('living-1', { ...plano, elementos: [...plano.elementos, { id: 'el-e', tipo: 'estante', celdas: [0] }] })
      usar(celu).s().agregarPlantaAEspacio('living-1', 'cinta', 'el-e')
      usar(celu).s().guardarEspacio({ ...espacio, nombre: 'Comedor' })
      nube.bloque = { datos: structuredClone(guardado().state), version: 15, actualizado: 'bloque-2' }
      disco.set('plantitas-dispositivo', JSON.stringify({ id: 'd', nombre: 'Celu', registrado: true, visto: 'bloque-2', sucio: false }))
      const actualizado = { disco: celu.disco, v: await abrir() }
      usar(actualizado).nube.iniciar()
      await sincronizar(actualizado)
      expect(error(actualizado)).toBeNull()
      const b = enBase()
      expect(b.espacios[0].nombre).toBe('Comedor')
      expect(b.espacios[0].plano!.elementos).toHaveLength(2)
      expect(b.espacios[0].plantas).toHaveLength(2)
      expect(b.casos).toHaveLength(1)
    })

    it('una compu atrasada no pisa lo que el celu ya pasó a las tablas', async () => {
      // La compu quedó con una copia vieja: el espacio sin plano ni plantas, y nada pendiente de subir
      const v = await arrancar()
      const compu = { disco, v }
      disco.set('plantitas-dispositivo', JSON.stringify({ id: 'd', nombre: 'Compu', registrado: true, visto: 'bloque-0', sucio: false }))
      // El celu, ya actualizado, cargó todo
      disco = new Map()
      const celu = await celuConTodo()
      expect(completo(enBase())).toEqual(TODO)

      const compuActualizada = { disco: compu.disco, v: await (usar(compu), abrir()) }
      usar(compuActualizada).nube.iniciar()
      await sincronizar(compuActualizada)
      expect(error(compuActualizada)).toBeNull()
      expect(completo(enBase())).toEqual(TODO)
      expect(completo(usar(compuActualizada).s())).toEqual(TODO)
      await sincronizar(celu)
      expect(completo(usar(celu).s())).toEqual(TODO)
    })

    it('una compu con cosas propias sin subir las suma', async () => {
      const v = await arrancar()
      v.s().alternarFavorita('cinta')
      const compu = { disco, v }
      disco.set('plantitas-dispositivo', JSON.stringify({ id: 'd', nombre: 'Compu', registrado: true, visto: 'bloque-0', sucio: true }))
      disco = new Map()
      await celuConTodo()
      const abierta = { disco: compu.disco, v: await (usar(compu), abrir()) }
      usar(abierta).nube.iniciar()
      await sincronizar(abierta)
      expect(completo(enBase())).toEqual(TODO)
      expect(enBase().favoritas).toEqual(['cinta'])
    })

    it('un bloque de una app muy vieja se suma, no reemplaza', async () => {
      const celu = await conBloque()
      nube.bloque = { datos: recortada(guardado().state), version: 14, actualizado: 'vieja' }
      usar(celu).nube.iniciar()
      await sincronizar(celu)
      expect(completo(usar(celu).s())).toEqual(TODO)
      expect(completo(enBase())).toEqual(TODO)
    })
  })
})

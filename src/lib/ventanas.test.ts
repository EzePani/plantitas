/**
 * Las formas en que se podían perder datos: varias ventanas sobre el mismo guardado, versiones viejas
 * de la app y la sincronización pisando lo local. Cada "ventana" es una carga aparte de la app.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VERSION_DATOS } from './backup'
import type { DatosPersistidos } from './tipos'

// Nube falsa: una fila de progreso y el dispositivo ya vinculado
const nube: { fila: { datos: DatosPersistidos; version: number; actualizado: string } | null; alSubir: (() => void) | null } = { fila: null, alSubir: null }
let reloj = 0
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }), onAuthStateChange: () => {}, signOut: async () => {} },
    from: (tabla: string) => {
      let accion = 'leer'
      let valores: Record<string, unknown> = {}
      const filtros: Record<string, unknown> = {}
      const q = {
        select: () => q,
        insert: (v: Record<string, unknown>) => ((accion = 'insertar'), (valores = v), q),
        update: (v: Record<string, unknown>) => ((accion = 'cambiar'), (valores = v), q),
        eq: (k: string, v: unknown) => ((filtros[k] = v), q),
        maybeSingle: async () => ({ data: tabla === 'dispositivos' ? { id: 'd' } : nube.fila && structuredClone(nube.fila), error: null }),
        then: (listo: (r: unknown) => void) => {
          if (tabla !== 'progreso' || accion === 'leer') return listo({ data: [], error: null })
          if (accion === 'cambiar' && filtros.actualizado !== nube.fila?.actualizado) return listo({ data: [], error: null })
          nube.fila = structuredClone({ ...valores, actualizado: `t${++reloj}` }) as typeof nube.fila
          nube.alSubir?.()
          return listo({ data: [{ actualizado: nube.fila!.actualizado }], error: null })
        },
      }
      return q
    },
  }),
}))

const disco = new Map<string, string>()
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

beforeEach(() => {
  disco.clear()
  nube.fila = null
  nube.alSubir = null
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
    expect(completo(nube.fila!.datos)).toEqual(TODO)
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

describe('sincronización', () => {
  /** La nube cambia por otro lado y este dispositivo no tiene nada pendiente */
  async function conTodoSubido() {
    const v = await arrancar()
    cargarTodo(v)
    vincular()
    // Como en la app: desde acá cada cambio queda marcado como pendiente de subir
    v.nube.iniciar()
    await v.nube.sincronizar()
    return v
  }
  const recortada = (d: DatosPersistidos): DatosPersistidos => ({ ...d, espacios: d.espacios.map(({ plano: _p, ...e }) => ({ ...e, plantas: [] })), casos: [] })

  it('lo que subió una app vieja sin lo nuevo no borra nada', async () => {
    const v = await conTodoSubido()
    nube.fila = { datos: recortada(nube.fila!.datos), version: 14, actualizado: 'vieja' }
    await v.nube.sincronizar()
    expect(completo(v.s())).toEqual(TODO)
    expect(completo(nube.fila!.datos)).toEqual(TODO)
    expect(nube.fila!.version).toBe(VERSION_DATOS)
  })

  it('un borrado hecho en otro dispositivo al día llega, y se puede volver atrás', async () => {
    const v = await conTodoSubido()
    nube.fila = { datos: recortada(nube.fila!.datos), version: VERSION_DATOS, actualizado: 'otro' }
    await v.nube.sincronizar()
    expect(completo(v.s())).toEqual(NADA)
    const [copia] = v.copias.leerCopias()
    expect(copia.motivo).toBe('reemplazo')
    v.s().recuperarCopia(v.copias.abrirCopia(copia)!)
    expect(completo(v.s())).toEqual(TODO)
    await v.nube.sincronizar()
    expect(completo(nube.fila!.datos)).toEqual(TODO)
  })

  it('si la nube es de una versión más nueva no toca nada', async () => {
    const v = await conTodoSubido()
    const futura = { datos: recortada(nube.fila!.datos), version: VERSION_DATOS + 1, actualizado: 'futura' }
    nube.fila = structuredClone(futura)
    v.s().alternarFavorita('potus')
    await v.nube.sincronizar()
    expect(nube.fila).toEqual(futura)
    expect(completo(v.s())).toEqual(TODO)
    expect(v.nube.leerEstado().fase).toBe('error')
  })

  it('lo que se cambia mientras sube queda pendiente y se sube después', async () => {
    const v = await conTodoSubido()
    v.s().alternarFavorita('potus')
    nube.alSubir = () => {
      nube.alSubir = null
      v.s().alternarFavorita('cinta')
    }
    await v.nube.sincronizar()
    expect(JSON.parse(disco.get('plantitas-dispositivo')!).sucio).toBe(true)
    await v.nube.sincronizar()
    expect(nube.fila!.datos.favoritas.sort()).toEqual(['cinta', 'potus'])
  })
})

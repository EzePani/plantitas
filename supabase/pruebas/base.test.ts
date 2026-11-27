/**
 * La app de verdad contra una base de verdad (la local de `supabase start`): las tablas, los permisos,
 * el historial, el paso desde el bloque viejo y dos dispositivos sincronizando.
 * No corre con `npm test`: necesita Docker. Se corre con `npm run test:base`.
 */
import { execSync } from 'node:child_process'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { aFilas, canonico, type Remota } from '../../src/lib/filas'
import type { DatosPersistidos } from '../../src/lib/tipos'

const entorno = Object.fromEntries(
  execSync('supabase status -o env', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]),
) as Record<string, string>
vi.stubEnv('VITE_SUPABASE_URL', entorno.API_URL)
vi.stubEnv('VITE_SUPABASE_CLAVE', entorno.ANON_KEY)
const admin = createClient(entorno.API_URL, entorno.SERVICE_ROLE_KEY, { auth: { persistSession: false } })
// Solo en la base de prueba: la llave de servicio puede mirar todo, para comprobar qué quedó guardado
execSync(`psql "${entorno.DB_URL}" -q -c "grant all on all tables in schema public to service_role"`, { stdio: 'ignore' })
const sql = (archivo: string) => execSync(`psql "${entorno.DB_URL}" -v ON_ERROR_STOP=1 -q -f ${archivo}`, { stdio: ['ignore', 'pipe', 'pipe'] })

type Disco = Map<string, string>
let disco: Disco = new Map()
const almacenamiento = { getItem: (k: string) => disco.get(k) ?? null, setItem: (k: string, v: string) => void disco.set(k, v), removeItem: (k: string) => void disco.delete(k) }
vi.stubGlobal('localStorage', almacenamiento)
vi.stubGlobal('window', { localStorage: almacenamiento })
vi.stubGlobal('document', { addEventListener: () => {}, visibilityState: 'visible' })
vi.stubGlobal('addEventListener', () => {})
vi.stubGlobal('location', { origin: 'x', pathname: '/', hash: '', search: '' })

const CLAVE_DE_PRUEBA = `prueba-${Math.random().toString(36).slice(2)}-${Date.now()}`
let cuentas = 0
async function crearCuenta() {
  const email = `prueba-${Date.now()}-${++cuentas}@plantitas.test`
  const { data, error } = await admin.auth.admin.createUser({ email, password: CLAVE_DE_PRUEBA, email_confirm: true })
  if (error) throw error
  return { email, id: data.user.id }
}
type Cuenta = Awaited<ReturnType<typeof crearCuenta>>

/** Un dispositivo: su guardado y la app abierta con la sesión de la cuenta */
async function dispositivo(cuenta: Cuenta, nombre: string, guardado: Disco = new Map()) {
  disco = guardado
  vi.resetModules()
  const { useStore } = await import('../../src/store/useStore')
  const n = await import('../../src/lib/nube')
  const { error } = await n.cliente.auth.signInWithPassword({ email: cuenta.email, password: CLAVE_DE_PRUEBA })
  if (error) throw error
  const d = {
    disco: guardado,
    nube: n,
    s: () => useStore.getState(),
    usar: () => ((disco = guardado), d),
    sincronizar: async () => {
      disco = guardado
      await n.sincronizar()
      expect(n.leerEstado().error).toBeNull()
    },
  }
  n.iniciar()
  if (!n.dispositivoVinculado()) expect(await n.vincular(nombre)).toBeNull()
  else await d.sincronizar()
  return d
}

const espacio = { id: 'living-1', nombre: 'Living', creado: '2026-11-14', tipo: 'living' as const, luz: { tipo: 'indirecta' as const, tramos: [], obstaculos: [] }, tamano: 'mediano' as const, mascotas: 'gato' as const, esfuerzo: 'medio' as const, plantas: [] }
const plano = { suelo: [0, 1, 6, 7], elementos: [{ id: 'el-m', tipo: 'mesa' as const, celdas: [7] }] }
const caso = { plantaId: 'potus', nombre: 'Potus', donde: '', sintomas: ['amarillas' as const], tierra: 'mojada' as const, cambios: [], notas: '', causas: ['exceso_riego' as const] }

/** Un progreso con de todo, en el formato del bloque viejo */
const COMPLETO: DatosPersistidos = {
  onboardingCompleto: true,
  respuestas: { experiencia: 'algunas', lugar: 'ambos', tiempo: 'casi_nada', objetivo: 'a_fondo' },
  perfil: 'en_camino',
  mascotas: { tipo: 'gato', muerde: 'siempre', alcance: 'bajo' },
  completadas: { 'luz-1': { fecha: '2026-11-17', aciertos: 4, total: 4 }, 'repaso-luz': { fecha: '2026-11-18', aciertos: 3, total: 4 } },
  salteadas: ['plagas'],
  xp: 1402,
  racha: { dias: 10, ultima: '2026-11-26' },
  insignias: { 'racha-3': '2026-11-19', 'primer-cofre': '2026-11-15' },
  semillas: ['mascotas', 'basico'],
  espacios: [
    { ...espacio, plano: { ...plano, luces: { 'el-m': 'baja' } }, plantas: [{ id: 'pl-1', plantaId: 'potus', lugar: 'el-m' }, { id: 'pl-2', plantaId: 'potus' }] },
    { ...espacio, id: 'balcon-2', nombre: 'Balcón', tipo: 'balcon', luz: { tipo: 'directa', tramos: [{ desde: 13, hasta: 16.5 }], obstaculos: ['vidrio'] }, plantas: [{ id: 'pl-1', plantaId: 'cinta' }] },
  ],
  favoritas: ['gomero', 'bananero', 'cinta'],
  colecciones: [{ id: 'col-1', nombre: 'Ya tengo', plantas: ['potus', 'aglaonema'] }, { id: 'col-2', nombre: 'Me gustaría', plantas: [] }],
  hijitos: [
    { id: 'hij-2', plantaId: 'aglaonema', nombre: 'Aglaonema', origen: 'corte', medio: 'tierra', inicio: '2026-11-24', agua: '2026-11-24', raices: null, maceta: null, prendio: null },
    { id: 'hij-1', plantaId: null, nombre: 'Uno sin planta', origen: 'separada', medio: 'tierra', inicio: '2026-11-20', agua: '2026-11-21', raices: null, maceta: null, prendio: '2026-11-25' },
  ],
  casos: [
    { ...caso, id: 'caso-2', ingreso: '2026-11-25', controles: [], vivero: [] },
    {
      ...caso,
      id: 'caso-1',
      donde: 'Mesa · Living',
      espacioId: 'living-1',
      lugar: 'el-m',
      ingreso: '2026-11-20',
      notas: 'Con "comillas" y ñ',
      controles: [{ fecha: '2026-11-21', estado: 'igual', tierra: 'humeda', nota: '' }, { fecha: '2026-11-23', estado: 'peor', tierra: 'mojada', nota: 'peor', sintomas: ['moho'] }],
      vivero: [{ id: 'visita-1', fecha: '2026-11-22', dijo: 'Menos agua' }],
      cierre: { fecha: '2026-11-26', tipo: 'alta' },
    },
    { ...caso, id: 'caso-0', ingreso: '2026-11-18', controles: [] },
  ],
  refuerzo: { ultimo: '2026-11-26', leccionesAlUltimo: 37, fallidas: ['familias-6:3'] },
}

const filasDe = async (cuenta: Cuenta, tabla: string) => (await admin.from(tabla).select('*').eq('user_id', cuenta.id)).data ?? []
const contenido = (d: DatosPersistidos) => ({ plantas: d.espacios.reduce((t, e) => t + e.plantas.length, 0), planos: d.espacios.filter((e) => e.plano).length, guardia: d.casos.length })

describe('dos dispositivos de una cuenta', () => {
  let cuenta: Cuenta
  let celu: Awaited<ReturnType<typeof dispositivo>>
  let compu: Awaited<ReturnType<typeof dispositivo>>

  beforeAll(async () => {
    cuenta = await crearCuenta()
    disco = new Map()
    vi.resetModules()
    // El celu ya tenía cosas cargadas antes de conectar la cuenta
    const { useStore } = await import('../../src/store/useStore')
    const guardado = disco
    useStore.getState().completarOnboarding({ experiencia: 'algunas', lugar: 'interior', tiempo: 'un_rato', objetivo: 'basico' }, { tipo: 'gato' }, [])
    useStore.getState().guardarEspacio(espacio)
    useStore.getState().guardarPlano('living-1', plano)
    useStore.getState().agregarPlantaAEspacio('living-1', 'potus', 'el-m')
    useStore.getState().ingresarCaso(caso)
    celu = await dispositivo(cuenta, 'Celu', guardado)
    compu = await dispositivo(cuenta, 'Compu')
  })

  it('lo del celu queda en las tablas y la compu lo ve igual', async () => {
    expect(await filasDe(cuenta, 'espacios')).toHaveLength(1)
    expect(await filasDe(cuenta, 'planos')).toHaveLength(1)
    expect(await filasDe(cuenta, 'espacio_plantas')).toMatchObject([{ espacio_id: 'living-1', planta_id: 'potus', borrado: false }])
    expect(await filasDe(cuenta, 'casos')).toMatchObject([{ planta_id: 'potus' }])
    expect(await filasDe(cuenta, 'avance')).toHaveLength(7)
    expect(compu.usar().s().espacios).toEqual(celu.usar().s().espacios)
    expect(compu.usar().s().casos).toEqual(celu.usar().s().casos)
    // El bloque viejo queda como respaldo
    expect((await admin.from('progreso').select('version').eq('user_id', cuenta.id)).data).toEqual([{ version: 16 }])
  })

  it('cargan cosas distintas a la vez y quedan las dos', async () => {
    celu.usar().s().agregarPlantaAEspacio('living-1', 'cinta')
    celu.s().controlarCaso(celu.s().casos[0].id, { estado: 'mejor', tierra: 'humeda', nota: 'va bien' })
    compu.usar().s().agregarHijito({ plantaId: 'potus', nombre: 'Potus', origen: 'corte', medio: 'agua' })
    compu.s().alternarFavorita('gomero')
    compu.s().anotarVisitaCaso(compu.s().casos[0].id, { fecha: '2026-11-27', dijo: 'Menos agua' })
    await celu.sincronizar()
    await compu.sincronizar()
    await celu.sincronizar()
    for (const d of [celu, compu]) {
      d.usar()
      expect(d.s().espacios[0].plantas.map((p) => p.plantaId)).toEqual(['potus', 'cinta'])
      expect(d.s().casos[0].controles).toHaveLength(1)
      expect(d.s().casos[0].vivero).toMatchObject([{ dijo: 'Menos agua' }])
      expect(d.s().hijitos).toHaveLength(1)
      expect(d.s().favoritas).toEqual(['gomero'])
    }
    expect(compu.usar().s().espacios).toEqual(celu.usar().s().espacios)
    expect(compu.usar().s().casos).toEqual(celu.usar().s().casos)
  })

  it('un cambio guarda la versión anterior en el historial, y la app no lo puede leer', async () => {
    celu.usar().s().guardarEspacio({ ...espacio, nombre: 'Comedor' })
    await celu.sincronizar()
    const { data } = await admin.from('historial').select('tabla,id,datos').eq('user_id', cuenta.id).eq('tabla', 'espacios')
    expect(data).toMatchObject([{ id: 'living-1', datos: { nombre: 'Living' } }])
    expect((await celu.nube.cliente.from('historial').select('*')).data ?? []).toEqual([])
  })

  it('borrar marca la fila y llega al otro dispositivo; la app no puede eliminar filas', async () => {
    const id = celu.usar().s().casos[0].id
    celu.s().borrarCaso(id)
    await celu.sincronizar()
    await compu.sincronizar()
    expect(compu.usar().s().casos).toHaveLength(0)
    expect(await filasDe(cuenta, 'casos')).toMatchObject([{ id, borrado: true, datos: { plantaId: 'potus' } }])
    expect((await filasDe(cuenta, 'controles')).every((f) => f.borrado)).toBe(true)
    await celu.nube.cliente.from('casos').delete().eq('id', id)
    expect(await filasDe(cuenta, 'casos')).toHaveLength(1)
  })

  it('un guardado recortado sin haber borrado nada no saca nada de la base: se recupera', async () => {
    const antes = contenido(celu.usar().s())
    expect(antes).toMatchObject({ plantas: 2, planos: 1 })
    const crudo = JSON.parse(celu.disco.get('plantitas-estado')!) as { state: DatosPersistidos }
    crudo.state.espacios = crudo.state.espacios.map(({ plano: _p, ...e }) => ({ ...e, plantas: [] }))
    crudo.state.hijitos = []
    celu.disco.set('plantitas-estado', JSON.stringify(crudo))
    const reabierto = await dispositivo(cuenta, 'Celu', celu.disco)
    reabierto.s().alternarFavorita('cinta')
    await reabierto.sincronizar()
    expect(contenido(reabierto.s())).toEqual(antes)
    expect(reabierto.s().hijitos).toHaveLength(1)
    await compu.sincronizar()
    expect(contenido(compu.usar().s())).toEqual(antes)
    expect(compu.s().favoritas).toEqual(['cinta', 'gomero'])
    celu = reabierto
  })

  it('una fila que cambió en la base desde la última vez no se pisa', async () => {
    const c = celu.usar().nube.cliente
    const pedido = { tabla: 'favoritas', id: 'gomero', datos: { nota: 1 }, version: 16, borrado: false }
    const { data: viejo } = await c.rpc('plantitas_guardar', { filas: [{ ...pedido, visto: '2020-01-01T00:00:00+00:00' }] })
    expect(viejo).toMatchObject([{ escrito: false }])
    expect(await filasDe(cuenta, 'favoritas').then((f) => f.find((x) => x.id === 'gomero')!.datos)).toEqual({})
    // Con el `actualizado` correcto sí entra
    const { data: bien } = await c.rpc('plantitas_guardar', { filas: [{ ...pedido, datos: {}, visto: viejo[0].actualizado }] })
    expect(bien).toMatchObject([{ escrito: true }])
  })

  it('un pedido con algo mal no guarda nada, y una app vieja no pisa filas más nuevas', async () => {
    const c = celu.usar().nube.cliente
    const mal = await c.rpc('plantitas_guardar', { filas: [{ tabla: 'favoritas', id: 'nueva', datos: {}, version: 16, borrado: false, visto: null }, { tabla: 'progreso', id: 'x', datos: {}, version: 16, borrado: false, visto: null }] })
    expect(mal.error?.message).toContain('PLANTITAS_TABLA')
    expect((await filasDe(cuenta, 'favoritas')).some((f) => f.id === 'nueva')).toBe(false)

    const [fila] = (await filasDe(cuenta, 'espacios')) as { id: string; actualizado: string }[]
    const { data: cambios } = await c.rpc('plantitas_cambios', { desde: null })
    const visto = (cambios as Remota[]).find((r) => r.tabla === 'espacios' && r.id === fila.id)!.actualizado
    const vieja = await c.rpc('plantitas_guardar', { filas: [{ tabla: 'espacios', id: fila.id, datos: { nombre: 'Recortado' }, version: 15, borrado: false, visto }] })
    expect(vieja.error?.message).toContain('PLANTITAS_VERSION_VIEJA')
    expect(await filasDe(cuenta, 'espacios')).toMatchObject([{ nombre: 'Comedor' }])
  })

  it('otra cuenta no ve ni toca nada, y sin sesión tampoco', async () => {
    const otra = await crearCuenta()
    const ajeno = createClient(entorno.API_URL, entorno.ANON_KEY, { auth: { persistSession: false } })
    await ajeno.auth.signInWithPassword({ email: otra.email, password: CLAVE_DE_PRUEBA })
    expect((await ajeno.rpc('plantitas_cambios', { desde: null })).data).toEqual([])
    for (const tabla of ['espacios', 'planos', 'espacio_plantas', 'casos', 'controles', 'visitas_vivero', 'hijitos', 'colecciones', 'favoritas', 'avance', 'lecciones', 'insignias']) {
      expect((await ajeno.from(tabla).select('id')).data, tabla).toEqual([])
      expect((await ajeno.from(tabla).insert({ user_id: cuenta.id, id: 'intruso', datos: {}, version: 16 })).error, tabla).not.toBeNull()
      await ajeno.from(tabla).update({ borrado: true }).eq('user_id', cuenta.id)
    }
    expect((await filasDe(cuenta, 'espacios')).every((f) => !f.borrado)).toBe(true)
    // Guardar con el id de una fila ajena crea una propia: la de la otra cuenta no cambia
    await ajeno.rpc('plantitas_guardar', { filas: [{ tabla: 'espacios', id: 'living-1', datos: { nombre: 'Intruso' }, version: 16, borrado: false, visto: null }] })
    expect(await filasDe(cuenta, 'espacios')).toMatchObject([{ nombre: 'Comedor' }])

    const anonimo = createClient(entorno.API_URL, entorno.ANON_KEY, { auth: { persistSession: false } })
    expect((await anonimo.rpc('plantitas_cambios', { desde: null })).error).not.toBeNull()
    expect((await anonimo.rpc('plantitas_guardar', { filas: [] })).error).not.toBeNull()
    expect((await anonimo.from('espacios').select('id')).data ?? []).toEqual([])
  })

  it('las fotos: cada cuenta sube y ve solo las suyas, y no se pueden eliminar', async () => {
    const c: SupabaseClient = celu.usar().nube.cliente
    const foto = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' })
    expect((await c.storage.from('fotos').upload(`${cuenta.id}/caso-1.jpg`, foto, { upsert: true, contentType: 'image/jpeg' })).error).toBeNull()
    expect((await c.storage.from('fotos').upload(`${cuenta.id}/caso-1.jpg`, foto, { upsert: true, contentType: 'image/jpeg' })).error).toBeNull()
    expect((await c.storage.from('fotos').download(`${cuenta.id}/caso-1.jpg`)).data?.size).toBe(4)

    const otra = await crearCuenta()
    const ajeno = createClient(entorno.API_URL, entorno.ANON_KEY, { auth: { persistSession: false } })
    await ajeno.auth.signInWithPassword({ email: otra.email, password: CLAVE_DE_PRUEBA })
    expect((await ajeno.storage.from('fotos').download(`${cuenta.id}/caso-1.jpg`)).error).not.toBeNull()
    expect((await ajeno.storage.from('fotos').upload(`${cuenta.id}/intruso.jpg`, foto, { contentType: 'image/jpeg' })).error).not.toBeNull()
    expect((await ajeno.storage.from('fotos').upload(`${cuenta.id}/caso-1.jpg`, foto, { upsert: true, contentType: 'image/jpeg' })).error).not.toBeNull()
    expect((await ajeno.storage.from('fotos').list(cuenta.id)).data ?? []).toEqual([])
    expect((await c.storage.from('fotos').upload(`${cuenta.id}/texto.jpg`, new Blob(['hola'], { type: 'text/plain' }), { contentType: 'text/plain' })).error).not.toBeNull()

    await c.storage.from('fotos').remove([`${cuenta.id}/caso-1.jpg`])
    expect((await c.storage.from('fotos').download(`${cuenta.id}/caso-1.jpg`)).data?.size).toBe(4)
  })
})

describe('el paso desde el bloque viejo', () => {
  it('la migración copia el bloque a las tablas tal como lo arma la app', async () => {
    const cuenta = await crearCuenta()
    expect((await admin.from('progreso').insert({ user_id: cuenta.id, datos: COMPLETO, version: 15 })).error).toBeNull()
    sql('supabase/migrations/20261127020000_pasar_bloque_a_filas.sql')
    // Correrla dos veces no duplica ni cambia nada
    sql('supabase/migrations/20261127020000_pasar_bloque_a_filas.sql')

    const c = createClient(entorno.API_URL, entorno.ANON_KEY, { auth: { persistSession: false } })
    await c.auth.signInWithPassword({ email: cuenta.email, password: CLAVE_DE_PRUEBA })
    const remotas = (await c.rpc('plantitas_cambios', { desde: null })).data as Remota[]
    const esperadas = aFilas(COMPLETO)
    expect(remotas.map((r) => `${r.tabla}/${r.id}`).sort()).toEqual([...esperadas.keys()].sort())
    for (const r of remotas) expect(canonico(r.datos), `${r.tabla}/${r.id}`).toBe(canonico(esperadas.get(`${r.tabla}/${r.id}`)!.datos))
    expect(remotas.every((r) => r.version === 15 && !r.borrado)).toBe(true)

    // Un dispositivo nuevo arma exactamente lo mismo, en el mismo orden
    const nuevo = await dispositivo(cuenta, 'Compu nueva')
    const { soloDatos } = await import('../../src/store/useStore')
    expect(soloDatos(nuevo.s())).toEqual(COMPLETO)
    // Y como no cambió nada, no quedó historial
    expect((await admin.from('historial').select('n').eq('user_id', cuenta.id)).data).toEqual([])
  })

  it('un celu con el bloque viejo y cosas cargadas después pasa todo sin perder nada', async () => {
    const cuenta = await crearCuenta()
    const viejo: DatosPersistidos = { ...COMPLETO, espacios: COMPLETO.espacios.map(({ plano: _p, ...e }) => ({ ...e, plantas: [] })), casos: [] }
    await admin.from('progreso').insert({ user_id: cuenta.id, datos: viejo, version: 15, actualizado: '2026-11-27T16:23:42.788+00:00' })
    sql('supabase/migrations/20261127020000_pasar_bloque_a_filas.sql')
    // El celu volvió a cargar todo con la app anterior y lo subió al bloque
    await admin.from('progreso').update({ datos: COMPLETO, actualizado: '2026-11-27T18:00:00+00:00' }).eq('user_id', cuenta.id)
    const guardado: Disco = new Map([
      ['plantitas-estado', JSON.stringify({ version: 15, state: COMPLETO })],
      ['plantitas-dispositivo', JSON.stringify({ id: crypto.randomUUID(), nombre: 'Celu', registrado: false, visto: '2026-11-27T18:00:00+00:00', sucio: false })],
    ])
    const celu = await dispositivo(cuenta, 'Celu', guardado)
    const { soloDatos } = await import('../../src/store/useStore')
    expect(soloDatos(celu.s())).toEqual(COMPLETO)
    const compu = await dispositivo(cuenta, 'Compu')
    expect(soloDatos(compu.s())).toEqual(COMPLETO)
    expect(await filasDe(cuenta, 'planos')).toHaveLength(1)
    expect(await filasDe(cuenta, 'espacio_plantas')).toHaveLength(3)
    expect(await filasDe(cuenta, 'controles')).toHaveLength(2)
    // El bloque anterior quedó en su historial
    expect((await admin.from('progreso_historial').select('version').eq('user_id', cuenta.id)).data!.length).toBeGreaterThan(0)
  })
})

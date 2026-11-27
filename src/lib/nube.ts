import { createClient } from '@supabase/supabase-js'
import { VERSION_DATOS, esquemaDatos, migrar } from './backup'
import { aFilas, canonico, claveDe, conciliar, deFilas, huella, pendientes, type Base, type Remota } from './filas'
import { guardarEstadoFotos, leerEstadoFotos } from './fotos'
import { fusionar } from './fusion'
import { sincronizarFotos } from './nubeFotos'
import type { DatosPersistidos } from './tipos'
import { leerBloqueo } from '../store/disco'
import { DATOS_INICIALES, alDia, esReemplazo, estaRefrescando, soloDatos, useStore } from '../store/useStore'

// La clave "publishable" es pública por diseño: la seguridad la dan las reglas por usuario (RLS) de la base.
// En desarrollo se puede apuntar a una base de prueba con VITE_SUPABASE_URL y VITE_SUPABASE_CLAVE.
const URL = import.meta.env?.VITE_SUPABASE_URL ?? 'https://kliipodfdabuyhiceryw.supabase.co'
const CLAVE = import.meta.env?.VITE_SUPABASE_CLAVE ?? 'sb_publishable_Kec2CFSHtIENyJHTohXv2g_PetFQjr_'

export const cliente = createClient(URL, CLAVE, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

// ---------- Estado de este dispositivo (solo local) ----------

interface Meta {
  id: string
  nombre: string
  registrado: boolean
  /** `actualizado` del último bloque `progreso` que este dispositivo vio */
  visto: string | null
  /** Hay cambios locales que todavía no se subieron */
  sucio: boolean
}
const CLAVE_META = 'plantitas-dispositivo'

function leerMeta(): Meta {
  try {
    const m = JSON.parse(localStorage.getItem(CLAVE_META) ?? 'null') as Meta | null
    if (m && typeof m.id === 'string') return m
  } catch {
    // se arma uno nuevo
  }
  return { id: crypto.randomUUID(), nombre: '', registrado: false, visto: null, sucio: false }
}
function guardarMeta(m: Meta) {
  try {
    localStorage.setItem(CLAVE_META, JSON.stringify(m))
  } catch {
    // sin almacenamiento: la sincronización sigue en memoria
  }
}
export const dispositivoVinculado = (): boolean => leerMeta().registrado

// ---------- Estado visible para la pantalla ----------

export interface EstadoNube {
  email: string | null
  registrado: boolean
  idLocal: string
  fase: 'quieto' | 'sincronizando' | 'ok' | 'error'
  ultima: string | null
  error: string | null
}
let estado: EstadoNube = { email: null, registrado: leerMeta().registrado, idLocal: leerMeta().id, fase: 'quieto', ultima: null, error: null }
const oyentes = new Set<() => void>()
function poner(p: Partial<EstadoNube>) {
  estado = { ...estado, ...p }
  oyentes.forEach((f) => f())
}
export const leerEstado = () => estado
export function suscribir(f: () => void) {
  oyentes.add(f)
  return () => void oyentes.delete(f)
}

// ---------- Ingreso ----------

const urlDeVuelta = () => location.origin + location.pathname

/** Errores de Supabase en castellano */
export function traducirError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('rate limit') || m.includes('seconds')) return 'Pediste muchos códigos seguidos. Esperá unos minutos y probá de nuevo.'
  if (m.includes('expired') || m.includes('invalid')) return 'Ese código no es válido o venció. Pedí uno nuevo.'
  if (m.includes('fetch') || m.includes('network')) return 'No hay conexión. Probá de nuevo cuando tengas internet.'
  return 'No se pudo. Probá de nuevo en un rato.'
}

export const correoValido = (c: string) => /^\S+@\S+\.\S+$/.test(c.trim())

/** Nombre automático para el dispositivo (se ve en la lista de dispositivos) */
export function nombreDispositivo(): string {
  const ua = navigator.userAgent
  if (/iPad/.test(ua)) return 'iPad'
  if (/iPhone|iPod/.test(ua)) return 'iPhone'
  if (/Android/.test(ua)) return /Mobile/.test(ua) ? 'Celu Android' : 'Tablet Android'
  if (/Macintosh/.test(ua)) return navigator.maxTouchPoints > 1 ? 'iPad' : 'Mac'
  if (/Windows/.test(ua)) return 'PC con Windows'
  return 'Este dispositivo'
}

export async function enviarLink(email: string): Promise<string | null> {
  const { error } = await cliente.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: urlDeVuelta() } })
  return error ? traducirError(error.message) : null
}
export async function entrarConCodigo(email: string, token: string): Promise<string | null> {
  const { error } = await cliente.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: 'email' })
  return error ? traducirError(error.message) : null
}
export async function cerrarSesion() {
  const m = leerMeta()
  guardarMeta({ ...m, registrado: false, visto: null, sucio: false })
  // Lo que este dispositivo sabía de la base ya no vale: al volver a entrar se junta todo de nuevo
  try {
    localStorage.removeItem(CLAVE_SINC)
    guardarEstadoFotos({ ...leerEstadoFotos(), subida: {} })
  } catch {
    // sin almacenamiento no había nada guardado
  }
  poner({ registrado: false, fase: 'quieto', error: null })
  await cliente.auth.signOut()
}

// ---------- Dispositivos ----------

export interface Dispositivo {
  id: string
  nombre: string
  ultima_sync: string
}
export async function listarDispositivos(): Promise<Dispositivo[]> {
  const { data } = await cliente.from('dispositivos').select('id,nombre,ultima_sync').order('creado')
  return data ?? []
}
export async function quitarDispositivo(id: string) {
  await cliente.from('dispositivos').delete().eq('id', id)
  if (id === leerMeta().id) await cerrarSesion()
}
export async function vincular(nombre: string): Promise<string | null> {
  const { data } = await cliente.auth.getUser()
  if (!data.user) return 'Primero entrá con tu correo.'
  const m = leerMeta()
  const { error } = await cliente.from('dispositivos').upsert({ id: m.id, user_id: data.user.id, nombre, ultima_sync: new Date().toISOString() })
  if (error) return error.message
  const d = soloDatos(useStore.getState())
  // Si ya hay progreso acá, se junta con el de la nube en la primera sincronización
  guardarMeta({ ...m, nombre, registrado: true, visto: null, sucio: d.onboardingCompleto || d.xp > 0 })
  poner({ registrado: true })
  await sincronizar()
  return null
}

// ---------- Sincronización ----------
//
// La base guarda cada cosa en su fila (ver `filas.ts` y `supabase/migrations`). Este dispositivo conserva
// una copia completa para funcionar sin conexión y, de cada fila, una huella de cómo estaba la última vez
// que coincidió con la base. Con eso sabe qué cambió acá (se sube) y qué cambió allá (se trae).
// Borrar es explícito: solo se quita de la base lo que la persona borró a propósito. Si algo falta acá
// sin haberse borrado, se vuelve a traer.

/** El último formato que usó el bloque único `progreso`. Las filas con esa versión salieron de ahí */
const VERSION_BLOQUE = 15

interface Sinc {
  usuario: string
  base: Base
  /** Claves de filas que la persona borró y todavía no se avisó a la base */
  borrados: string[]
  /** El `actualizado` más nuevo que se trajo */
  visto: string | null
  /** Ya se sumó lo que había en el bloque viejo */
  bloque: boolean
  /** Huella de lo último que se copió al bloque de respaldo */
  respaldo: string | null
}
const CLAVE_SINC = 'plantitas-filas'

function leerSinc(usuario?: string): Sinc {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_SINC) ?? 'null') as Sinc | null
    if (s && typeof s.usuario === 'string' && s.base && Array.isArray(s.borrados) && (!usuario || s.usuario === usuario)) return s
  } catch {
    // se arma uno nuevo
  }
  return { usuario: usuario ?? '', base: {}, borrados: [], visto: null, bloque: false, respaldo: null }
}
function guardarSinc(s: Sinc) {
  try {
    localStorage.setItem(CLAVE_SINC, JSON.stringify(s))
  } catch {
    // sin almacenamiento: la próxima vez se compara todo de nuevo
  }
}

/** Anota lo que la persona acaba de borrar, para quitarlo también de la base */
function anotarBorrados(antes: DatosPersistidos, despues: DatosPersistidos) {
  const s = leerSinc()
  if (!s.usuario) return
  const a = aFilas(antes)
  const d = aFilas(despues)
  const borrados = new Set(s.borrados)
  const tamano = borrados.size
  let cambio = false
  for (const k of a.keys()) if (!d.has(k) && s.base[k]?.[0] != null) borrados.add(k)
  for (const k of d.keys()) if (borrados.delete(k)) cambio = true
  if (cambio || borrados.size !== tamano) guardarSinc({ ...s, borrados: [...borrados] })
}

let aplicando = false
let enCurso: Promise<void> | null = null
let temporizador: ReturnType<typeof setTimeout> | undefined
/** La primera sincronización de cada apertura trae todo, no solo lo que cambió */
let primera = true

function aplicar(d: DatosPersistidos) {
  aplicando = true
  try {
    useStore.getState().reemplazarDatos(d)
  } finally {
    aplicando = false
  }
}

export function sincronizar(): Promise<void> {
  enCurso ??= correr().finally(() => (enCurso = null))
  return enCurso
}

/** Una sola ventana sincroniza a la vez */
function conCandado<T>(hacer: () => Promise<T>): Promise<T> {
  const candados = typeof navigator !== 'undefined' ? navigator.locks : undefined
  return candados ? (candados.request('plantitas-sincronizacion', hacer) as Promise<T>) : hacer()
}

const NUEVA = 'La nube tiene datos de una versión más nueva. Cerrá la app y volvé a abrirla para actualizarla.'

async function correr() {
  const meta = leerMeta()
  if (!meta.registrado) return
  const { data: sesion } = await cliente.auth.getSession()
  const uid = sesion.session?.user.id
  if (!uid) return
  poner({ fase: 'sincronizando', error: null })
  try {
    // Si este dispositivo se quitó desde otro, se desvincula
    const { data: fila, error: e0 } = await cliente.from('dispositivos').select('id').eq('id', meta.id).maybeSingle()
    if (e0) throw e0
    if (!fila) {
      await cerrarSesion()
      return
    }

    const pendiente = await conCandado(() => porFilas(uid))
    if (pendiente) {
      clearTimeout(temporizador)
      temporizador = setTimeout(() => void sincronizar(), 1500)
    }
    // Las fotos van aparte y nunca frenan los datos
    void sincronizarFotos(cliente, uid).catch(() => {})

    const ahora = new Date().toISOString()
    await cliente.from('dispositivos').update({ ultima_sync: ahora }).eq('id', meta.id)
    poner({ fase: 'ok', ultima: ahora })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String((e as { message?: unknown } | null)?.message ?? '')
    poner({ fase: 'error', error: msg.includes('PLANTITAS_VERSION_VIEJA') ? NUEVA : e instanceof Error ? msg : 'No se pudo sincronizar.' })
  }
}

/** Trae lo que cambió en la base, lo suma a lo local y sube lo que cambió acá. Devuelve si quedó algo por subir */
async function porFilas(uid: string): Promise<boolean> {
  let todo = primera
  for (let intento = 0; intento < 4; intento++) {
    let s = leerSinc(uid)
    const completo = todo || !s.visto
    const desde = completo ? null : new Date(Date.parse(s.visto!) - 10 * 60_000).toISOString()
    const { data, error } = await cliente.rpc('plantitas_cambios', { desde })
    if (error) throw error
    const remotas = (data ?? []) as Remota[]

    // La primera vez también se mira el bloque viejo, por si tiene algo que no llegó a las filas
    let bloque: { datos: DatosPersistidos; version: number; actualizado: string } | null = null
    if (!s.bloque) {
      const { data: b, error: eb } = await cliente.from('progreso').select('datos,version,actualizado').maybeSingle()
      if (eb) throw eb
      if (b) {
        if (b.version > VERSION_DATOS) throw new Error(NUEVA)
        const leido = esquemaDatos.safeParse(migrar(b.datos, b.version))
        if (leido.success) bloque = { datos: leido.data, version: b.version, actualizado: b.actualizado }
      }
    }

    // Recién después de esperar a la red: mientras tanto pudo escribir otra ventana
    alDia()
    if (leerBloqueo()) throw new Error('Cerrá la app y volvé a abrirla para sincronizar.')
    s = leerSinc(uid)
    const m = leerMeta()
    const enPantalla = soloDatos(useStore.getState())
    let local = enPantalla
    let teniaCambios = m.sucio
    if (bloque && bloque.actualizado !== m.visto) {
      if (!m.sucio && bloque.version >= VERSION_BLOQUE) local = bloque.datos
      else {
        // Cambió en los dos lados, o lo escribió una app vieja que pudo no tener todo: se junta
        local = fusionar(local, bloque.datos)
        teniaCambios = true
      }
    }

    const borrados = new Set(s.borrados)
    const nunca = Object.keys(s.base).length === 0
    const c = conciliar(aFilas(local), remotas, s.base, borrados, { version: VERSION_DATOS, ganaRemoto: nunca && !teniaCambios, delBloque: VERSION_BLOQUE })
    if (c.nuevas) throw new Error(NUEVA)
    if (c.faltan.length && !completo) {
      todo = true
      continue
    }
    // Lo que tampoco está en la base ya no existe
    for (const k of c.faltan) delete c.base[k]

    const leido = esquemaDatos.safeParse(deFilas(c.filas, DATOS_INICIALES))
    if (!leido.success) throw new Error('Los datos de la nube no se pueden leer.')
    const nuevo = leido.data
    if (canonico(nuevo) !== canonico(enPantalla)) aplicar(nuevo)

    const filas = aFilas(nuevo)
    const pedido = pendientes(filas, c.base, borrados, VERSION_DATOS)
    const visto = remotas.reduce<string | null>((v, r) => (!v || Date.parse(r.actualizado) > Date.parse(v) ? r.actualizado : v), s.visto)
    s = { ...s, usuario: uid, base: c.base, visto, bloque: true }
    guardarSinc(s)
    primera = false

    if (pedido.length) {
      const { data: escritas, error: e2 } = await cliente.rpc('plantitas_guardar', { filas: pedido })
      if (e2) throw e2
      // Otra ventana pudo anotar borrados mientras tanto: se parte de lo guardado
      s = leerSinc(uid)
      const quedan = new Set(s.borrados)
      let choques = 0
      ;(escritas as { tabla: string; id: string; actualizado: string | null; escrito: boolean }[]).forEach((x, i) => {
        const clave = claveDe(x.tabla, x.id)
        const p = pedido[i]
        if (!x.escrito) return void choques++
        if (p.borrado) quedan.delete(clave)
        if (!x.actualizado) delete s.base[clave]
        else s.base[clave] = [p.borrado ? null : huella(p.datos), x.actualizado]
      })
      s.borrados = [...quedan]
      guardarSinc(s)
      // Alguna fila cambió en la base justo antes: se vuelve a traer y a unir
      if (choques) continue
    }

    // Borrados de cosas que la base nunca tuvo: no hay nada que avisar
    const vivos = s.borrados.filter((k) => s.base[k]?.[0] != null)
    if (vivos.length !== s.borrados.length) guardarSinc({ ...s, borrados: vivos })
    guardarMeta({ ...leerMeta(), sucio: false })

    await respaldar(uid, nuevo)
    alDia()
    return canonico(soloDatos(useStore.getState())) !== canonico(nuevo)
  }
  return true
}

/**
 * Copia de respaldo en el bloque viejo, con la versión nueva: una app sin actualizar la ve, no la
 * entiende y deja de sincronizar en vez de pisar algo. Si falla no pasa nada: las filas ya están.
 */
async function respaldar(uid: string, datos: DatosPersistidos) {
  const h = huella(datos)
  if (leerSinc(uid).respaldo === h) return
  const actualizado = new Date().toISOString()
  const { error } = await cliente.from('progreso').upsert({ user_id: uid, datos, version: VERSION_DATOS, actualizado })
  if (error) return
  guardarSinc({ ...leerSinc(uid), respaldo: h })
  guardarMeta({ ...leerMeta(), visto: actualizado })
}

let iniciado = false
/** Engancha la sincronización: al abrir, al volver a la app, al recuperar conexión y al cambiar algo. */
export function iniciar() {
  if (iniciado) return
  iniciado = true
  cliente.auth.onAuthStateChange((_e, s) => {
    poner({ email: s?.user.email ?? null })
    if (s) setTimeout(() => void sincronizar(), 0)
  })
  void cliente.auth.getSession().then(({ data }) => poner({ email: data.session?.user.email ?? null }))
  useStore.subscribe((ahora, antes) => {
    if (aplicando || estaRefrescando()) return
    const m = leerMeta()
    if (!m.registrado) return
    if (!esReemplazo()) anotarBorrados(soloDatos(antes), soloDatos(ahora))
    guardarMeta({ ...m, sucio: true })
    clearTimeout(temporizador)
    temporizador = setTimeout(() => void sincronizar(), 1500)
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void sincronizar()
  })
  addEventListener('online', () => void sincronizar())
  void sincronizar()
}

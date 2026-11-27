import { createClient } from '@supabase/supabase-js'
import { VERSION_DATOS, esquemaDatos, migrar } from './backup'
import { guardarCopia, sePierde } from './copias'
import { fusionar } from './fusion'
import type { DatosPersistidos } from './tipos'
import { leerBloqueo } from '../store/disco'
import { alDia, estaRefrescando, soloDatos, useStore } from '../store/useStore'

// La clave "publishable" es pública por diseño: la seguridad la dan las reglas por usuario (RLS) de la base.
const URL = 'https://kliipodfdabuyhiceryw.supabase.co'
const CLAVE = 'sb_publishable_Kec2CFSHtIENyJHTohXv2g_PetFQjr_'

export const cliente = createClient(URL, CLAVE, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

// ---------- Estado de este dispositivo (solo local) ----------

interface Meta {
  id: string
  nombre: string
  registrado: boolean
  /** `actualizado` de la última versión remota que este dispositivo vio */
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

let aplicando = false
let enCurso: Promise<void> | null = null
let temporizador: ReturnType<typeof setTimeout> | undefined

function aplicar(d: DatosPersistidos) {
  aplicando = true
  useStore.getState().reemplazarDatos(d)
  aplicando = false
}

export function sincronizar(): Promise<void> {
  enCurso ??= correr().finally(() => (enCurso = null))
  return enCurso
}

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

    let pendiente = false
    for (let intento = 0; intento < 3; intento++) {
      const { data: remoto, error } = await cliente.from('progreso').select('datos,version,actualizado').maybeSingle()
      if (error) throw error
      // Recién después de esperar a la red: mientras tanto pudo escribir otra ventana
      alDia()
      if (leerBloqueo()) throw new Error('Cerrá la app y volvé a abrirla para sincronizar.')
      const m = leerMeta()
      const local = soloDatos(useStore.getState())

      let subir: DatosPersistidos | null = null
      let visto = m.visto
      if (!remoto) {
        subir = local
      } else {
        if (remoto.version > VERSION_DATOS) throw new Error('La nube tiene datos de una versión más nueva. Cerrá la app y volvé a abrirla para actualizarla.')
        const leido = esquemaDatos.safeParse(migrar(remoto.datos, remoto.version))
        if (!leido.success) throw new Error('Los datos de la nube no se pueden leer.')
        if (remoto.actualizado === m.visto) {
          if (m.sucio) subir = local
        } else if (!m.sucio && remoto.version === VERSION_DATOS) {
          aplicar(leido.data)
          visto = remoto.actualizado
        } else {
          // Cambió en los dos lados, o lo escribió una app vieja que pudo no tener todo: se junta
          subir = fusionar(local, leido.data)
          guardarMeta({ ...m, sucio: true })
          aplicar(subir)
        }
        // Antes de pisar la nube queda una copia de lo que se perdería
        if (subir && sePierde(leido.data, subir)) guardarCopia(leido.data, VERSION_DATOS, 'reemplazo')
      }

      if (subir) {
        const antes = JSON.stringify(soloDatos(useStore.getState()))
        const fila = { datos: subir, version: VERSION_DATOS, actualizado: new Date().toISOString() }
        const q = remoto
          ? cliente.from('progreso').update(fila).eq('user_id', uid).eq('actualizado', remoto.actualizado).select('actualizado')
          : cliente.from('progreso').insert({ ...fila, user_id: uid }).select('actualizado')
        const { data: filas, error: e2 } = await q
        if (e2) throw e2
        if (!filas?.length) continue // otro dispositivo se adelantó: se vuelve a leer y a unir
        visto = filas[0].actualizado
        // Lo que se haya cambiado mientras subía queda para la próxima
        alDia()
        pendiente = JSON.stringify(soloDatos(useStore.getState())) !== antes
      }

      guardarMeta({ ...leerMeta(), visto, sucio: pendiente })
      break
    }
    if (pendiente) {
      clearTimeout(temporizador)
      temporizador = setTimeout(() => void sincronizar(), 1500)
    }
    const ahora = new Date().toISOString()
    await cliente.from('dispositivos').update({ ultima_sync: ahora }).eq('id', meta.id)
    poner({ fase: 'ok', ultima: ahora })
  } catch (e) {
    poner({ fase: 'error', error: e instanceof Error ? e.message : 'No se pudo sincronizar.' })
  }
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
  useStore.subscribe(() => {
    if (aplicando || estaRefrescando()) return
    const m = leerMeta()
    if (!m.registrado) return
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

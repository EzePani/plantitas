import type { StateStorage } from 'zustand/middleware'
import { VERSION_DATOS } from '../lib/backup'

/**
 * El acceso al guardado del dispositivo. La app puede estar abierta en varias ventanas (la instalada
 * y una pestaña) que comparten el mismo guardado: acá se sabe cuándo escribió otra y cuándo no hay
 * que escribir para no destruir datos.
 */
export const CLAVE_ESTADO = 'plantitas-estado'

/** 'nueva': escribió una versión más nueva de la app. 'ilegible': no se pudo leer lo guardado */
export type Bloqueo = 'nueva' | 'ilegible' | null

let disco: Storage | null = null
/** Lo último que esta ventana leyó o escribió */
let ultimo: string | null = null
let bloqueo: Bloqueo = null
const oyentes = new Set<() => void>()

export const leerBloqueo = (): Bloqueo => bloqueo
export function suscribirBloqueo(f: () => void) {
  oyentes.add(f)
  return () => void oyentes.delete(f)
}
/** Desde acá la ventana no vuelve a escribir */
export function bloquear(motivo: Bloqueo) {
  bloqueo = motivo
  oyentes.forEach((f) => f())
}

function sobre(crudo: string): { version: number; state: unknown } | null {
  try {
    const x = JSON.parse(crudo) as { version?: unknown; state?: unknown }
    return typeof x?.version === 'number' ? { version: x.version, state: x.state } : null
  } catch {
    return null
  }
}
const esMasNuevo = (crudo: string) => (sobre(crudo)?.version ?? 0) > VERSION_DATOS

export function almacen(real: Storage): StateStorage {
  disco = real
  return {
    getItem: (clave) => {
      ultimo = real.getItem(clave)
      if (ultimo && esMasNuevo(ultimo)) bloquear('nueva')
      return ultimo
    },
    setItem: (clave, valor) => {
      const actual = real.getItem(clave)
      if (actual && esMasNuevo(actual)) bloquear('nueva')
      if (bloqueo) return
      real.setItem(clave, valor)
      ultimo = valor
    },
    removeItem: (clave) => real.removeItem(clave),
  }
}

/** Lo que escribió otra ventana desde la última vez; null si no hay nada nuevo */
export function novedad(): { version: number; state: unknown } | null {
  const crudo = disco?.getItem(CLAVE_ESTADO)
  if (!crudo || crudo === ultimo || bloqueo) return null
  if (esMasNuevo(crudo)) {
    bloquear('nueva')
    return null
  }
  return sobre(crudo)
}

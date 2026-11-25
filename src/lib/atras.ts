/**
 * Botón "atrás" del celular (como en cualquier app): vuelve una pantalla, y en el inicio hay que
 * tocarlo dos veces seguidas para salir.
 *
 * Cada pantalla que se puede cerrar se anota en una pila. El navegador ignora las entradas de
 * historial que se agregan sin que el usuario haga nada, así que con cada toque se completa un colchón
 * de entradas: cada "atrás" consume una y cierra la pantalla de arriba. Sin pantallas abiertas se
 * vuelve al principio del historial, y el siguiente "atrás" sale de la app.
 */
type Volver = () => void

export const VENTANA_SALIR_MS = 2000
const MARCA = 'plantitasAtras'
/** Cuántas veces seguidas se puede volver sin tocar la pantalla en el medio */
const COLCHON = 10
const pila: { volver: Volver }[] = []

/** Anota una pantalla en la pila. Devuelve la función que la saca. */
export function registrarAtras(volver: Volver): () => void {
  const entrada = { volver }
  pila.push(entrada)
  return () => {
    const i = pila.indexOf(entrada)
    if (i >= 0) pila.splice(i, 1)
  }
}

/** Empieza a escuchar el botón atrás. `avisar` muestra u oculta el "tocá otra vez para salir". */
export function iniciarAtras(avisar: (visible: boolean) => void, ventana: Window = window): () => void {
  let espera: ReturnType<typeof setTimeout> | undefined
  let rebobinando = false
  const nivel = (): number => ventana.history.state?.[MARCA] ?? 0
  const ocultar = () => {
    clearTimeout(espera)
    avisar(false)
  }

  const contener = () => {
    ocultar()
    for (let n = nivel() + 1; n <= COLCHON; n++) ventana.history.pushState({ [MARCA]: n }, '')
  }
  const alVolver = () => {
    if (rebobinando) {
      rebobinando = false
      return
    }
    const arriba = pila[pila.length - 1]
    if (arriba) {
      arriba.volver()
      return
    }
    ocultar()
    avisar(true)
    espera = setTimeout(ocultar, VENTANA_SALIR_MS)
    if (nivel() > 0) {
      rebobinando = true
      ventana.history.go(-nivel())
    }
  }

  const gestos = ['pointerup', 'keydown'] as const
  gestos.forEach((g) => ventana.addEventListener(g, contener, true))
  ventana.addEventListener('popstate', alVolver)
  return () => {
    clearTimeout(espera)
    gestos.forEach((g) => ventana.removeEventListener(g, contener, true))
    ventana.removeEventListener('popstate', alVolver)
  }
}

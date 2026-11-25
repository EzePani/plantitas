import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { iniciarAtras, registrarAtras, VENTANA_SALIR_MS } from './atras'

/** Navegador mínimo: historial con entradas y eventos */
function navegador() {
  const entradas: unknown[] = [null]
  const eventos = new EventTarget()
  const history = {
    get state() {
      return entradas[entradas.length - 1]
    },
    pushState: (s: unknown) => void entradas.push(s),
    go: (d: number) => {
      entradas.length += d
      eventos.dispatchEvent(new Event('popstate'))
    },
  }
  const ventana = Object.assign(eventos, { history }) as unknown as Window
  const tocar = () => eventos.dispatchEvent(new Event('pointerup'))
  const atras = () => {
    entradas.pop()
    if (entradas.length) eventos.dispatchEvent(new Event('popstate'))
  }
  return { ventana, entradas, tocar, atras, afuera: () => entradas.length === 0 }
}

describe('botón atrás', () => {
  beforeEach(() => void vi.useFakeTimers())
  afterEach(() => void vi.useRealTimers())

  it('cierra las pantallas de a una, la última primero', () => {
    const n = navegador()
    const parar = iniciarAtras(() => {}, n.ventana)
    const cerradas: string[] = []
    const sacarA = registrarAtras(() => (cerradas.push('a'), sacarA()))
    const sacarB = registrarAtras(() => (cerradas.push('b'), sacarB()))
    n.tocar()
    n.tocar()
    expect(n.entradas).toHaveLength(11)
    n.atras()
    n.atras()
    expect(cerradas).toEqual(['b', 'a'])
    expect(n.afuera()).toBe(false)
    parar()
  })

  it('en el inicio avisa y el segundo toque sale', () => {
    const n = navegador()
    const avisar = vi.fn()
    const parar = iniciarAtras(avisar, n.ventana)
    n.tocar()
    n.atras()
    expect(avisar).toHaveBeenLastCalledWith(true)
    n.atras()
    expect(n.afuera()).toBe(true)
    parar()
  })

  it('pasado el aviso, con un toque vuelve a pedir dos', () => {
    const n = navegador()
    const avisar = vi.fn()
    const parar = iniciarAtras(avisar, n.ventana)
    n.tocar()
    n.atras()
    vi.advanceTimersByTime(VENTANA_SALIR_MS)
    expect(avisar).toHaveBeenLastCalledWith(false)
    n.tocar()
    n.atras()
    expect(n.afuera()).toBe(false)
    parar()
  })
})

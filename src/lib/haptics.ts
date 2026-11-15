type Patron = 'toque' | 'acierto' | 'error' | 'festejo'

const PATRONES: Record<Patron, number | number[]> = {
  toque: 8,
  acierto: [12, 40, 18],
  error: [40, 30, 40],
  festejo: [15, 40, 15, 40, 40],
}

/** Vibración suave donde el dispositivo la soporte (Android). En iOS no hace nada. */
export function vibrar(patron: Patron = 'toque'): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(PATRONES[patron])
    }
  } catch {
    // sin soporte: no pasa nada
  }
}

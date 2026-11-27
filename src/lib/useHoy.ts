import { useEffect, useState } from 'react'
import { hoyLocal } from './fecha'

/** La fecha de hoy, que se actualiza al volver a la app (puede quedar abierta de un día para otro) */
export function useHoy(): string {
  const [hoy, setHoy] = useState(() => hoyLocal())
  useEffect(() => {
    const mirar = () => setHoy(hoyLocal())
    document.addEventListener('visibilitychange', mirar)
    return () => document.removeEventListener('visibilitychange', mirar)
  }, [])
  return hoy
}

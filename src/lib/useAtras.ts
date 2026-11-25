import { useEffect, useRef } from 'react'
import { registrarAtras } from './atras'

/** Mientras `activo`, el botón atrás del celular ejecuta `volver` (gana lo último que se abrió) */
export function useAtras(activo: boolean, volver: () => void) {
  const ultimo = useRef(volver)
  useEffect(() => {
    ultimo.current = volver
  })
  useEffect(() => {
    if (activo) return registrarAtras(() => ultimo.current())
  }, [activo])
}

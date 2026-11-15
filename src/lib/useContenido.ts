import { useEffect, useState } from 'react'

type Contenido = typeof import('../data/lessons/contenido')

let cache: Contenido | null = null
let promesa: Promise<Contenido> | null = null

/** Carga los textos de las lecciones aparte del resto de la app (una sola vez) */
export function cargarContenido(): Promise<Contenido> {
  promesa ??= import('../data/lessons/contenido').then((m) => (cache = m))
  return promesa
}

/** null hasta que el contenido esté cargado */
export function useContenido(): Contenido | null {
  const [contenido, setContenido] = useState<Contenido | null>(cache)
  useEffect(() => {
    if (!contenido) void cargarContenido().then(setContenido)
  }, [contenido])
  return contenido
}

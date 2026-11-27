import { useEffect, useState } from 'react'

/**
 * Las fotos de los casos de la Guardia viven solo en este dispositivo (IndexedDB), guardadas con el
 * id del caso: pesan demasiado para ir con el resto de los datos, así que no se sincronizan ni se exportan.
 */
const BASE = 'plantitas-fotos'
const ALMACEN = 'casos'
const LADO_MAX = 1280
const CALIDAD = 0.8

/** El tamaño achicado, sin deformar ni agrandar */
export function medidas(ancho: number, alto: number, max = LADO_MAX): [number, number] {
  const f = Math.min(1, max / Math.max(ancho, alto))
  return [Math.max(1, Math.round(ancho * f)), Math.max(1, Math.round(alto * f))]
}

/** Achica una foto elegida y la pasa a JPEG; null si no se puede abrir */
export async function reducir(archivo: Blob): Promise<Blob | null> {
  try {
    const imagen = await createImageBitmap(archivo)
    const lienzo = document.createElement('canvas')
    ;[lienzo.width, lienzo.height] = medidas(imagen.width, imagen.height)
    const dibujo = lienzo.getContext('2d')!
    // JPEG no tiene transparencia: sin esto quedaría negra
    dibujo.fillStyle = '#fff'
    dibujo.fillRect(0, 0, lienzo.width, lienzo.height)
    dibujo.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
    imagen.close()
    return await new Promise((listo) => lienzo.toBlob(listo, 'image/jpeg', CALIDAD))
  } catch {
    return null
  }
}

function abrir(): Promise<IDBDatabase> {
  return new Promise((listo, error) => {
    const pedido = indexedDB.open(BASE, 1)
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(ALMACEN)
    pedido.onsuccess = () => listo(pedido.result)
    pedido.onerror = () => error(pedido.error)
  })
}

async function operar<T>(modo: IDBTransactionMode, hacer: (almacen: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const base = await abrir()
  try {
    return await new Promise<T>((listo, error) => {
      const t = base.transaction(ALMACEN, modo)
      const pedido = hacer(t.objectStore(ALMACEN))
      t.oncomplete = () => listo(pedido.result)
      t.onabort = () => error(t.error)
    })
  } finally {
    base.close()
  }
}

const oyentes = new Set<() => void>()
/** Casos cuya última foto no se pudo guardar */
const fallidas = new Set<string>()

/** Hace el cambio y avisa a quienes muestran fotos; false si el dispositivo no lo permitió */
async function cambiar(id: string, hacer: (almacen: IDBObjectStore) => IDBRequest): Promise<boolean> {
  let salio = true
  try {
    await operar('readwrite', hacer)
    fallidas.delete(id)
  } catch {
    salio = false
    fallidas.add(id)
  }
  oyentes.forEach((f) => f())
  return salio
}

export const guardarFoto = (id: string, foto: Blob) => cambiar(id, (a) => a.put(foto, id))
export const borrarFoto = (id: string) => cambiar(id, (a) => a.delete(id))
export const borrarFotos = () => cambiar('', (a) => a.clear())

async function leerFoto(id: string): Promise<Blob | undefined> {
  try {
    return (await operar('readonly', (a) => a.get(id))) as Blob | undefined
  } catch {
    return undefined
  }
}

/** Una dirección para mostrar una foto que todavía está en memoria */
export function useUrlDe(foto: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!foto) return setUrl(null)
    const nueva = URL.createObjectURL(foto)
    setUrl(nueva)
    return () => URL.revokeObjectURL(nueva)
  }, [foto])
  return url
}

/** La foto guardada de un caso; se actualiza sola cuando cambia */
export function useFoto(id: string | undefined): { url: string | null; fallo: boolean } {
  const [estado, setEstado] = useState<{ id?: string; url: string | null; fallo: boolean }>({ url: null, fallo: false })
  useEffect(() => {
    if (!id) return
    let vigente = true
    let url: string | null = null
    const leer = () =>
      void leerFoto(id).then((foto) => {
        if (!vigente) return
        if (url) URL.revokeObjectURL(url)
        url = foto ? URL.createObjectURL(foto) : null
        setEstado({ id, url, fallo: fallidas.has(id) })
      })
    leer()
    oyentes.add(leer)
    return () => {
      vigente = false
      oyentes.delete(leer)
      if (url) URL.revokeObjectURL(url)
      setEstado({ url: null, fallo: false })
    }
  }, [id])
  return estado.id === id ? estado : { url: null, fallo: false }
}

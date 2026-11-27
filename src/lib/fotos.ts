import { useEffect, useState } from 'react'

/**
 * Las fotos de los casos de la Guardia se guardan en este dispositivo (IndexedDB) con el id del caso.
 * Pesan demasiado para ir con el resto de los datos: el caso lleva solo una marca (`foto`) y, con una
 * cuenta conectada, la imagen se sube aparte (`nubeFotos.ts`). No entran en la exportación.
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

// ---------- Qué foto hay de cada caso ----------

/** `tengo`: la marca de la foto que está en este dispositivo. `subida`: la marca que ya está en la nube */
export interface EstadoFotos {
  tengo: Record<string, string>
  subida: Record<string, string>
}
const CLAVE_ESTADO = 'plantitas-fotos-estado'
export function leerEstadoFotos(): EstadoFotos {
  try {
    const e = JSON.parse(localStorage.getItem(CLAVE_ESTADO) ?? 'null') as Partial<EstadoFotos> | null
    return { tengo: { ...e?.tengo }, subida: { ...e?.subida } }
  } catch {
    return { tengo: {}, subida: {} }
  }
}
export function guardarEstadoFotos(e: EstadoFotos) {
  try {
    localStorage.setItem(CLAVE_ESTADO, JSON.stringify(e))
  } catch {
    // sin almacenamiento: se vuelve a calcular en la próxima sincronización
  }
}
function anotar(id: string, marca: string | null) {
  const e = leerEstadoFotos()
  if (marca) e.tengo[id] = marca
  else delete e.tengo[id]
  guardarEstadoFotos(e)
}
export const nuevaMarca = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** A quién avisarle que la persona puso o quitó una foto (el caso lleva la marca) */
let alCambiar: (id: string, marca: string | null) => void = () => {}
export function avisarFotos(f: typeof alCambiar) {
  alCambiar = f
}

/** La persona eligió una foto */
export async function guardarFoto(id: string, foto: Blob): Promise<boolean> {
  const salio = await cambiar(id, (a) => a.put(foto, id))
  if (salio) {
    const marca = nuevaMarca()
    anotar(id, marca)
    alCambiar(id, marca)
  }
  return salio
}
/** La persona quitó la foto (o borró el caso) */
export async function borrarFoto(id: string): Promise<boolean> {
  const salio = await cambiar(id, (a) => a.delete(id))
  if (salio) {
    anotar(id, null)
    alCambiar(id, null)
  }
  return salio
}
export async function borrarFotos(): Promise<boolean> {
  const salio = await cambiar('', (a) => a.clear())
  if (salio) guardarEstadoFotos({ tengo: {}, subida: {} })
  return salio
}

/** Lo que trae o saca la sincronización: no es un cambio hecho acá */
export async function ponerFotoTraida(id: string, foto: Blob, marca: string): Promise<boolean> {
  const salio = await cambiar(id, (a) => a.put(foto, id))
  if (salio) anotar(id, marca)
  return salio
}
export async function sacarFotoTraida(id: string): Promise<boolean> {
  const salio = await cambiar(id, (a) => a.delete(id))
  if (salio) anotar(id, null)
  return salio
}

export async function leerFoto(id: string): Promise<Blob | undefined> {
  try {
    return (await operar('readonly', (a) => a.get(id))) as Blob | undefined
  } catch {
    return undefined
  }
}
/** Los casos que tienen foto en este dispositivo */
export async function idsDeFotos(): Promise<string[]> {
  try {
    return ((await operar('readonly', (a) => a.getAllKeys())) as IDBValidKey[]).map(String)
  } catch {
    return []
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

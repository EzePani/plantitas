import type { SupabaseClient } from '@supabase/supabase-js'
import { guardarEstadoFotos, idsDeFotos, leerEstadoFotos, leerFoto, nuevaMarca, ponerFotoTraida, sacarFotoTraida } from './fotos'
import { useStore } from '../store/useStore'

/**
 * Las fotos de la Guardia entre dispositivos. Cada caso lleva una marca (`foto`) que viaja con los
 * datos; la imagen se guarda en el almacenamiento privado de la cuenta como <cuenta>/<caso>.jpg.
 * - Si este dispositivo tiene la foto de la marca y no está subida, la sube.
 * - Si la marca es de una foto que no tiene, la baja.
 * - Si el caso ya no lleva marca y la foto de acá estaba subida, la quitaron en otro dispositivo.
 * Del almacenamiento no se borra nada: una foto quitada se puede recuperar desde el panel.
 */
const CUBO = 'fotos'
let enCurso: Promise<void> | null = null

export function sincronizarFotos(cliente: SupabaseClient, uid: string): Promise<void> {
  enCurso ??= correr(cliente, uid).finally(() => (enCurso = null))
  return enCurso
}

async function correr(cliente: SupabaseClient, uid: string) {
  const enDisco = new Set(await idsDeFotos())
  const casos = useStore.getState().casos
  if (!enDisco.size && !casos.some((c) => c.foto)) return
  const cubo = cliente.storage.from(CUBO)
  const ruta = (id: string) => `${uid}/${id}.jpg`
  /** Se relee cada vez: mientras tanto la persona pudo sacar otra foto */
  const anotarSubida = (id: string, marca: string | null) => {
    const e = leerEstadoFotos()
    if (marca) e.subida[id] = marca
    else delete e.subida[id]
    guardarEstadoFotos(e)
  }

  for (const caso of casos) {
    const id = caso.id
    const { tengo, subida } = leerEstadoFotos()
    const hay = enDisco.has(id)

    if (caso.foto) {
      if (hay && tengo[id] === caso.foto) {
        if (subida[id] === caso.foto) continue
        const foto = await leerFoto(id)
        if (!foto) continue
        const { error } = await cubo.upload(ruta(id), foto, { upsert: true, contentType: 'image/jpeg', cacheControl: '0' })
        if (!error) anotarSubida(id, caso.foto)
        continue
      }
      // La foto que hay acá es otra más nueva, todavía sin anotar en el caso: se anota y sube la próxima
      if (hay && tengo[id] && subida[id] !== tengo[id]) {
        useStore.getState().marcarFotoCaso(id, tengo[id])
        continue
      }
      const { data, error } = await cubo.download(ruta(id))
      // Si todavía no la subió el otro dispositivo, se prueba en la próxima
      if (error || !data) continue
      if (await ponerFotoTraida(id, data, caso.foto)) anotarSubida(id, caso.foto)
      continue
    }

    if (!hay) continue
    if (tengo[id] && subida[id] === tengo[id]) {
      // Estaba subida y el caso ya no la nombra: la quitaron en otro dispositivo
      if (await sacarFotoTraida(id)) anotarSubida(id, null)
      continue
    }
    // Una foto de antes de que se sincronizaran, o cuya marca no llegó a anotarse: se anota
    let marca = tengo[id]
    if (!marca) {
      marca = nuevaMarca()
      const e = leerEstadoFotos()
      e.tengo[id] = marca
      guardarEstadoFotos(e)
    }
    useStore.getState().marcarFotoCaso(id, marca)
  }
}

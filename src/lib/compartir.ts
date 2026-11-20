import type { Planta } from '../data/plantas'
import { TC } from '../data/textosCatalogo'

const C = TC.plantas.compartir
const ESTADO = TC.plantas.estado

const enlace = () => `${location.origin}${import.meta.env.BASE_URL}`

export function textoDePlanta(p: Planta): string {
  const m = p.mascotas
  return [
    `🌿 ${p.nombre_comun} (${p.nombre_cientifico})`,
    `${C.luz}: ${TC.luz.categorias[p.luz_requerida]} · ${C.riego}: ${TC.plantas.riego[p.riego.nivel]}`,
    `${C.gatos}: ${ESTADO[m.toxicidad_gato]} · ${C.perros}: ${ESTADO[m.toxicidad_perro]}`,
    '',
    `${C.pie} ${enlace()}`,
  ].join('\n')
}

export function textoDeLista(nombre: string, plantas: Planta[]): string {
  return [`🌿 ${C.lista(nombre)}`, ...plantas.map((p) => `• ${p.nombre_comun} (${p.nombre_cientifico})`), '', `${C.pie} ${enlace()}`].join('\n')
}

/** Abre el menú de compartir del dispositivo; si no hay, copia el texto. Devuelve qué pasó. */
export async function compartirTexto(texto: string, titulo: string): Promise<'compartido' | 'copiado' | 'cancelado' | 'error'> {
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title: titulo, text: texto })
      return 'compartido'
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'cancelado'
  }
  try {
    await navigator.clipboard.writeText(texto)
    return 'copiado'
  } catch {
    return 'error'
  }
}

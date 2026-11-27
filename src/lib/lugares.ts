import type { Planta } from '../data/plantas/esquema'
import { HORAS_SI_NO_SABE, derivarLuz, type CategoriaLuz, type LuzDerivada } from './luz'
import { especiesDe, toxicidadPara, type Especie } from './mascotas'
import { LADO, lugarPiso, lugarValido } from './plano'
import { calceDeLuz } from './recomendador'
import type { Espacio, Plano, TipoElemento } from './tipos'

/** De dónde sale la luz de un lugar. Salvo 'corregida', todo es una estimación. */
export type OrigenLuz = 'corregida' | 'ventana' | 'balcon' | 'sin_ventana'
export interface LuzDeLugar {
  luz: LuzDerivada
  origen: OrigenLuz
  /** Cuadraditos hasta la ventana más cercana (1 = pegado); solo con origen 'ventana' */
  distancia: number | null
}

/** Hasta esta distancia un lugar está "junto a la ventana"; hasta la segunda, a media distancia */
const CERCA = 1
const MEDIO = 3

/** Según la luz del espacio: la que queda junto a la ventana, a media distancia y lejos */
const POR_DISTANCIA: Record<CategoriaLuz, [CategoriaLuz, CategoriaLuz, CategoriaLuz]> = {
  directa: ['directa', 'indirecta_brillante', 'indirecta_media'],
  indirecta_brillante: ['indirecta_brillante', 'indirecta_media', 'baja'],
  // Es lo que se asume cuando no sabe cómo es la luz: junto a una ventana suele haber más
  indirecta_media: ['indirecta_brillante', 'indirecta_media', 'baja'],
  baja: ['indirecta_media', 'baja', 'baja'],
}

const celdasDe = (p: Plano, lugar: string): number[] => p.elementos.find((e) => e.id === lugar)?.celdas ?? p.suelo.filter((c) => lugarPiso(c) === lugar)

/** Distancia en cuadraditos (contando las diagonales) a la ventana más cercana; null si no hay ventanas */
export function distanciaAVentana(p: Plano, lugar: string): number | null {
  const ventanas = p.elementos.filter((e) => e.tipo === 'ventana').flatMap((e) => e.celdas)
  const distancias = celdasDe(p, lugar).flatMap((a) => ventanas.map((b) => Math.max(Math.abs(Math.floor(a / LADO) - Math.floor(b / LADO)), Math.abs((a % LADO) - (b % LADO)))))
  return distancias.length ? Math.min(...distancias) : null
}

/** La luz del espacio llevada a otra categoría: sin sol directo no hay horas ni aviso de calor */
function conCategoria(base: LuzDerivada, categoria: CategoriaLuz): LuzDerivada {
  if (categoria === base.categoria) return base
  const directa = categoria === 'directa'
  return { ...base, categoria, horasSol: directa ? HORAS_SI_NO_SABE : 0, horasEfectivas: directa ? HORAS_SI_NO_SABE : 0, avisoCalor: false }
}

export function luzDeLugar(e: Espacio, lugar: string): LuzDeLugar {
  const base = derivarLuz(e.luz)
  const corregida = e.plano?.luces?.[lugar]
  if (corregida) return { luz: conCategoria(base, corregida), origen: 'corregida', distancia: null }
  // El balcón está afuera: la distancia a una ventana no cambia nada
  if (e.tipo === 'balcon') return { luz: base, origen: 'balcon', distancia: null }
  const distancia = e.plano ? distanciaAVentana(e.plano, lugar) : null
  if (distancia === null) return { luz: base, origen: 'sin_ventana', distancia }
  const escala = POR_DISTANCIA[base.categoria]
  return { luz: conCategoria(base, escala[distancia <= CERCA ? 0 : distancia <= MEDIO ? 1 : 2]), origen: 'ventana', distancia }
}

/** Corrige a mano la luz de un lugar; con null vuelve a la estimada */
export function ponerLuz(e: Espacio, lugar: string, categoria: CategoriaLuz | null): Espacio {
  if (!e.plano || !lugarValido(e.plano, lugar)) return e
  const { [lugar]: _anterior, ...resto } = e.plano.luces ?? {}
  const luces = categoria ? { ...resto, [lugar]: categoria } : resto
  const { luces: _luces, ...plano } = e.plano
  return { ...e, plano: Object.keys(luces).length ? { ...plano, luces } : plano }
}

/**
 * A qué lugares llega cada mascota (la altura sale del elemento). Ante la duda se asume que llega:
 * un gato trepa a casi todo y solo se salva lo que está colgado.
 */
const ALCANCE: Record<Especie, (TipoElemento | 'piso')[]> = {
  gato: ['piso', 'mesa', 'mueble', 'estante', 'mesada', 'baranda'],
  perro: ['piso', 'mesa', 'mueble', 'baranda'],
}

export interface AvisoMascota {
  estado: 'toxica' | 'no_verificada'
  especies: Especie[]
  /** 'colgando': está en alto, pero sus ramas cuelgan */
  alcance: 'si' | 'colgando' | 'no'
}

/** Mascotas de la casa para las que esta planta no es segura, según si en ese lugar la alcanzan */
export function avisosDeMascotas(p: Planta, e: Espacio, lugar: string): AvisoMascota[] {
  const tipo = e.plano?.elementos.find((x) => x.id === lugar)?.tipo ?? 'piso'
  const avisos: AvisoMascota[] = []
  for (const especie of especiesDe(e.mascotas)) {
    const estado = toxicidadPara(p, especie)
    if (estado === 'segura') continue
    const alcance = ALCANCE[especie].includes(tipo) ? 'si' : p.cultivo.porte.includes('colgante') ? 'colgando' : 'no'
    const igual = avisos.find((a) => a.estado === estado && a.alcance === alcance)
    if (igual) igual.especies.push(especie)
    else avisos.push({ estado, alcance, especies: [especie] })
  }
  return avisos
}

export type AvisoDeLuz = 'bien' | 'con_ajuste' | 'poca_luz' | 'demasiado_sol' | 'calor' | 'lugar'

/** Cómo le va a la planta en ese lugar puntual, solo por la luz y por si es de interior o de balcón */
export function luzParaPlanta(p: Planta, e: Espacio, lugar: string): AvisoDeLuz {
  const interior = e.tipo !== 'balcon'
  if (!(interior ? p.apta.interior : p.apta.balcon)) return 'lugar'
  const c = calceDeLuz(p, luzDeLugar(e, lugar).luz, interior)
  return c.nivel === 'no' ? c.motivo : c.nivel
}

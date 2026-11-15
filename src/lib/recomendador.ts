import type { Planta } from '../data/plantas/esquema'
import { deducirLuz, type NivelLuz } from './luz'
import { esApta, especiesDe, seguridadPara } from './mascotas'
import type { HoraSol, TipoMascota } from './tipos'

export type TipoEspacio = 'living' | 'dormitorio' | 'cocina' | 'bano' | 'balcon' | 'escritorio'
export type TamanoEspacio = 'chico' | 'mediano' | 'amplio'
export type Esfuerzo = 'poco' | 'medio' | 'mucho'

export interface DatosEspacio {
  tipo: TipoEspacio
  horaSol: HoraSol
  tamano: TamanoEspacio
  mascotas: TipoMascota
  esfuerzo: Esfuerzo
}

export type Motivo =
  | 'luz_ideal'
  | 'luz_tolera'
  | 'luz_filtrada'
  | 'aguanta_descuido'
  | 'facil'
  | 'tamano_justo'
  | 'ama_humedad'
  | 'segura_mascotas'
  | 'desafio'
  | 'aguanta_sol'

export type MotivoEvitar = 'toxica' | 'no_verificada' | 'poca_luz' | 'demasiado_sol' | 'muy_grande' | 'pide_dedicacion'

export interface Recomendada {
  planta: Planta
  puntaje: number
  motivos: Motivo[]
}

export interface Evitar {
  planta: Planta
  motivo: MotivoEvitar
}

export interface Recomendacion {
  luz: NivelLuz
  luzAsumida: boolean
  recomendadas: Recomendada[]
  evitar: Evitar[]
}

const PUNTOS_TAMANO: Record<TamanoEspacio, Record<Planta['tamano'], number>> = {
  chico: { chica: 20, mediana: 8, grande: -15 },
  mediano: { chica: 14, mediana: 20, grande: 8 },
  amplio: { chica: 10, mediana: 16, grande: 20 },
}

/** El sol pega directo varias horas (norte u oeste en Buenos Aires) */
const solFuerte = (h: HoraSol) => h === 'tarde' || h === 'mediodia' || h === 'todo_el_dia'

type Compatibilidad = 'ideal' | 'tolera' | 'filtrada' | 'no'

function luzCompatible(p: Planta, luz: NivelLuz, interior: boolean): Compatibilidad {
  if (p.luz.necesidad === luz) return 'ideal'
  if (p.luz.tolera.includes(luz)) return 'tolera'
  // Adentro, un lugar muy luminoso también sirve para las de luz brillante indirecta:
  // alcanza con correrlas un poco de la ventana o filtrar el sol con una cortina.
  // En el balcón el sol directo no se puede esquivar, así que ahí no vale.
  if (interior && luz === 'mucha' && p.luz.necesidad === 'media') return 'filtrada'
  return 'no'
}

function puntuar(p: Planta, d: DatosEspacio, luz: NivelLuz): Recomendada | null {
  const motivos: Motivo[] = []
  const comp = luzCompatible(p, luz, d.tipo !== 'balcon')
  if (comp === 'no') return null
  let puntaje = comp === 'ideal' ? 40 : comp === 'tolera' ? 26 : 22
  motivos.push(comp === 'ideal' ? 'luz_ideal' : comp === 'tolera' ? 'luz_tolera' : 'luz_filtrada')

  if (luz === 'mucha' && solFuerte(d.horaSol)) {
    if (p.luz.sol_directo) {
      puntaje += 6
      motivos.push('aguanta_sol')
    } else if (d.tipo === 'balcon') puntaje -= 12
  }

  const t = PUNTOS_TAMANO[d.tamano][p.tamano]
  puntaje += t
  if (t >= 20) motivos.push('tamano_justo')

  if (d.esfuerzo === 'poco') {
    puntaje += p.tolerancia_descuido * 4 + (p.dificultad === 'facil' ? 4 : p.dificultad === 'dificil' ? -12 : 0)
    if (p.tolerancia_descuido >= 4) motivos.push('aguanta_descuido')
  } else if (d.esfuerzo === 'medio') {
    puntaje += 12 + (p.dificultad === 'facil' ? 6 : p.dificultad === 'dificil' ? -6 : 2)
    if (p.dificultad === 'facil') motivos.push('facil')
  } else {
    puntaje += 14 + (p.dificultad === 'facil' ? 0 : 5)
    if (p.dificultad !== 'facil') motivos.push('desafio')
  }

  if (d.tipo === 'bano') {
    if (p.humedad.nivel === 'alta') {
      puntaje += 10
      motivos.push('ama_humedad')
    } else if (p.humedad.nivel === 'baja') puntaje -= 6
  } else if (d.tipo !== 'balcon' && p.humedad.nivel === 'alta') {
    // Ambientes con calefacción en invierno: el aire seco le cuesta
    puntaje -= 4
  }

  if (p.confianza === 'baja') puntaje -= 10
  if (d.mascotas !== 'ninguna') motivos.push('segura_mascotas')

  return { planta: p, puntaje, motivos }
}

/**
 * Motor de "Armá tu espacio". Filtros duros: mascotas (solo plantas verificadas como seguras
 * para TODAS las especies de la casa), tipo de lugar (interior / balcón) y luz. El resto ordena.
 */
export function recomendar(plantas: Planta[], d: DatosEspacio, cantidad = 5): Recomendacion {
  const { luz, asumida } = deducirLuz(d.horaSol)
  const delLugar = plantas.filter((p) => (d.tipo === 'balcon' ? p.apta.balcon : p.apta.interior))

  const recomendadas = delLugar
    .filter((p) => esApta(p, d.mascotas))
    .map((p) => puntuar(p, d, luz))
    .filter((r): r is Recomendada => r !== null)
    .sort((a, b) => b.puntaje - a.puntaje || a.planta.nombre_comun.localeCompare(b.planta.nombre_comun))
    .slice(0, cantidad)

  const evitar: Evitar[] = []
  const elegidas = new Set(recomendadas.map((r) => r.planta.id))

  // 1) Con mascotas: la planta tóxica que mejor encajaría si no fuera por eso (la tentación más probable)
  if (especiesDe(d.mascotas).length > 0) {
    const tentadora = delLugar
      .filter((p) => !esApta(p, d.mascotas))
      .map((p) => ({ p, r: puntuar(p, { ...d, mascotas: 'ninguna' }, luz) }))
      .filter((x) => x.r !== null)
      .sort((a, b) => b.r!.puntaje - a.r!.puntaje)[0]
    if (tentadora) {
      evitar.push({ planta: tentadora.p, motivo: seguridadPara(tentadora.p, d.mascotas) === 'toxica' ? 'toxica' : 'no_verificada' })
    }
  }

  // 2) La que peor se lleva con este lugar por luz, tamaño o dedicación
  const candidatas = delLugar.filter((p) => !elegidas.has(p.id) && !evitar.some((e) => e.planta.id === p.id))
  const interior = d.tipo !== 'balcon'
  const porLuz = candidatas.find((p) => luzCompatible(p, luz, interior) === 'no')
  const porSol = !interior && luz === 'mucha' && solFuerte(d.horaSol) ? candidatas.find((p) => !p.luz.sol_directo) : undefined
  const porTamano = d.tamano === 'chico' ? candidatas.find((p) => p.tamano === 'grande') : undefined
  const porEsfuerzo = d.esfuerzo === 'poco' ? candidatas.find((p) => p.dificultad === 'dificil') : undefined
  if (porSol) evitar.push({ planta: porSol, motivo: 'demasiado_sol' })
  else if (porLuz) evitar.push({ planta: porLuz, motivo: luz === 'mucha' ? 'demasiado_sol' : 'poca_luz' })
  else if (porTamano) evitar.push({ planta: porTamano, motivo: 'muy_grande' })
  else if (porEsfuerzo) evitar.push({ planta: porEsfuerzo, motivo: 'pide_dedicacion' })

  return { luz, luzAsumida: asumida, recomendadas, evitar: evitar.slice(0, 2) }
}

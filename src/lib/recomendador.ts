import type { Planta } from '../data/plantas/esquema'
import { derivarLuz, type LuzDerivada } from './luz'
import { esApta, especiesDe, seguridadPara } from './mascotas'
import type { Esfuerzo, PerfilLuz, TamanoEspacio, TipoEspacio, TipoMascota } from './tipos'

export type { Esfuerzo, TamanoEspacio, TipoEspacio } from './tipos'

/** Lo que el recomendador necesita de un espacio (un Espacio guardado lo cumple) */
export interface DatosEspacio {
  tipo: TipoEspacio
  luz: PerfilLuz
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

export type MotivoEvitar = 'toxica' | 'no_verificada' | 'poca_luz' | 'demasiado_sol' | 'calor' | 'muy_grande' | 'pide_dedicacion'

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
  /** Perfil de luz derivado del espacio (estimación) */
  luz: LuzDerivada
  recomendadas: Recomendada[]
  evitar: Evitar[]
}

const PUNTOS_TAMANO: Record<TamanoEspacio, Record<Planta['tamano'], number>> = {
  chico: { chica: 20, mediana: 8, grande: -15 },
  mediano: { chica: 14, mediana: 20, grande: 8 },
  amplio: { chica: 10, mediana: 16, grande: 20 },
}

type Compatibilidad = 'ideal' | 'tolera' | 'filtrada' | 'no'

/** Margen de tolerancia al comparar horas de sol (lo que carga el usuario es aproximado) */
const MARGEN_HORAS = 1
/** Desde estas horas de sol directo se considera planta de pleno sol: aguanta el día entero */
const PLENO_SOL = 6

function luzCompatible(p: Planta, luz: LuzDerivada, interior: boolean): Compatibilidad {
  if (luz.categoria === 'directa') {
    const aguantaHoras = p.horas_sol_directo > 0 && (p.horas_sol_directo >= PLENO_SOL || p.horas_sol_directo + MARGEN_HORAS >= luz.horasEfectivas)
    const aguantaCalor = !luz.avisoCalor || p.tolera_sol_tarde
    if (aguantaHoras && aguantaCalor) return p.luz_requerida === 'directa' ? 'ideal' : 'tolera'
    // Adentro, un lugar con sol directo también sirve para las de luz indirecta brillante:
    // alcanza con correrlas de la ventana o filtrar el sol con una cortina.
    // En el balcón el sol no se puede esquivar, así que ahí no vale.
    if (interior && (p.luz_requerida === 'indirecta_brillante' || p.luz_requerida === 'directa')) return 'filtrada'
    return 'no'
  }
  if (p.luz_requerida === luz.categoria) return 'ideal'
  if (p.luz_tolerada.includes(luz.categoria)) return 'tolera'
  return 'no'
}

/** Cómo le va una planta puntual a un espacio puntual. Mismos filtros duros que el recomendador. */
export type Calce =
  | { nivel: 'bien' | 'con_ajuste' }
  | { nivel: 'no'; motivo: 'toxica' | 'no_verificada' | 'lugar' | 'poca_luz' | 'demasiado_sol' | 'calor' }

export function calceEnEspacio(p: Planta, d: DatosEspacio): Calce {
  const interior = d.tipo !== 'balcon'
  if (!(interior ? p.apta.interior : p.apta.balcon)) return { nivel: 'no', motivo: 'lugar' }
  // La seguridad de las mascotas pesa más que la luz: se avisa primero
  const seguridad = seguridadPara(p, d.mascotas)
  if (seguridad === 'toxica') return { nivel: 'no', motivo: 'toxica' }
  if (seguridad === 'no_verificada') return { nivel: 'no', motivo: 'no_verificada' }
  const luz = derivarLuz(d.luz)
  const comp = luzCompatible(p, luz, interior)
  if (comp === 'no') return { nivel: 'no', motivo: luz.categoria === 'directa' ? (luz.avisoCalor && !p.tolera_sol_tarde ? 'calor' : 'demasiado_sol') : 'poca_luz' }
  // Con aviso de calor, las muy sensibles sufren aunque la luz sea compatible
  if (comp === 'filtrada' || (luz.avisoCalor && p.sensibilidad_calor === 'alta')) return { nivel: 'con_ajuste' }
  return { nivel: 'bien' }
}

function puntuar(p: Planta, d: DatosEspacio, luz: LuzDerivada): Recomendada | null {
  const motivos: Motivo[] = []
  const comp = luzCompatible(p, luz, d.tipo !== 'balcon')
  if (comp === 'no') return null
  let puntaje = comp === 'ideal' ? 40 : comp === 'tolera' ? 26 : 22
  motivos.push(comp === 'ideal' ? 'luz_ideal' : comp === 'tolera' ? 'luz_tolera' : 'luz_filtrada')
  // Luz baja: se aguanta, no se disfruta
  if (luz.categoria === 'baja' && comp === 'tolera') puntaje -= 6

  if (luz.categoria === 'directa' && comp !== 'filtrada') {
    puntaje += 6
    motivos.push('aguanta_sol')
  }
  // Aviso de calor: a las sensibles les cuesta aunque estén corridas de la ventana
  if (luz.avisoCalor) puntaje -= p.sensibilidad_calor === 'alta' ? 12 : p.sensibilidad_calor === 'media' ? 4 : 0

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
 * para TODAS las especies de la casa), tipo de lugar (interior / balcón) y luz del espacio
 * (categoría, horas de sol directo y aviso de calor). El resto ordena.
 */
export function recomendar(plantas: Planta[], d: DatosEspacio, cantidad = 5): Recomendacion {
  const luz = derivarLuz(d.luz)
  const interior = d.tipo !== 'balcon'
  const delLugar = plantas.filter((p) => (interior ? p.apta.interior : p.apta.balcon))

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

  // 2) La que peor se lleva con este lugar: por calor, luz, tamaño o dedicación
  const candidatas = delLugar.filter((p) => !elegidas.has(p.id) && !evitar.some((e) => e.planta.id === p.id))
  const porCalor = luz.avisoCalor ? candidatas.find((p) => p.sensibilidad_calor === 'alta') : undefined
  const porLuz = candidatas.find((p) => luzCompatible(p, luz, interior) === 'no')
  const porTamano = d.tamano === 'chico' ? candidatas.find((p) => p.tamano === 'grande') : undefined
  const porEsfuerzo = d.esfuerzo === 'poco' ? candidatas.find((p) => p.dificultad === 'dificil') : undefined
  if (porCalor) evitar.push({ planta: porCalor, motivo: 'calor' })
  else if (porLuz) evitar.push({ planta: porLuz, motivo: luz.categoria === 'directa' ? 'demasiado_sol' : 'poca_luz' })
  else if (porTamano) evitar.push({ planta: porTamano, motivo: 'muy_grande' })
  else if (porEsfuerzo) evitar.push({ planta: porEsfuerzo, motivo: 'pide_dedicacion' })

  return { luz, recomendadas, evitar: evitar.slice(0, 2) }
}

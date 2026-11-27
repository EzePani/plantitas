import type { Planta } from '../data/plantas/esquema'
import { diasEntre, sumarDias } from './fecha'
import { luzParaPlanta } from './lugares'
import { derivarLuz } from './luz'
import { lugarValido } from './plano'
import { calceDeLuz } from './recomendador'
import type { Caso, CausaId, Control, Espacio, RespuestasGuardia, Sintoma, Cambio } from './tipos'

export const MAX_CASOS = 60
export const MAX_CONTROLES = 200
export const MAX_NOTA = 300
/** Durante la primera semana se controla todos los días */
const PRIMERA_SEMANA = 7

/** Lo que se sabe de la planta y de su lugar, además de las respuestas */
export interface Contexto {
  /** La especie pide mucha humedad en el aire */
  humedadAlta: boolean
  /** Cómo es la luz donde está respecto de lo que necesita; null si le sirve o no se sabe */
  luz: 'poca' | 'mucha' | null
  /** Junio a agosto en Buenos Aires */
  invierno: boolean
}

export const SIN_CONTEXTO: Contexto = { humedadAlta: false, luz: null, invierno: false }
export const esInvierno = (hoy: string): boolean => ['06', '07', '08'].includes(hoy.slice(5, 7))

/** Arma el contexto con la ficha de la planta y, si se sabe dónde está, la luz de ese lugar */
export function contextoDe(p: Planta, hoy: string, espacio?: Espacio, lugar?: string): Contexto {
  let luz: Contexto['luz'] = null
  if (espacio) {
    const enPlano = lugar && lugarValido(espacio.plano, lugar)
    const calce = enPlano ? null : calceDeLuz(p, derivarLuz(espacio.luz), espacio.tipo !== 'balcon')
    const estado = enPlano ? luzParaPlanta(p, espacio, lugar) : calce!.nivel === 'no' ? calce!.motivo : calce!.nivel
    luz = estado === 'poca_luz' ? 'poca' : estado === 'demasiado_sol' || estado === 'calor' || estado === 'con_ajuste' ? 'mucha' : null
  }
  return { humedadAlta: p.humedad.nivel === 'alta', luz, invierno: esInvierno(hoy) }
}

/** Desde este puntaje una causa se considera posible */
const MINIMO = 3
const MAX_CAUSAS = 3

/**
 * Orientación por reglas, basada en lo que explica la Guía rápida de la app. No es un diagnóstico:
 * cada pista suma puntos a una causa y se muestran las que más juntan, de más a menos probable.
 */
export function diagnosticar(r: RespuestasGuardia, c: Contexto = SIN_CONTEXTO): CausaId[] {
  const si = (s: Sintoma) => r.sintomas.includes(s)
  const cambio = (x: Cambio) => r.cambios.includes(x)
  const suma = (...puntos: [boolean, number][]) => puntos.reduce((t, [vale, n]) => t + (vale ? n : 0), 0)
  const mojada = r.tierra === 'mojada'
  const seca = r.tierra === 'seca'
  const mudanza = Number(cambio('lugar')) + Number(cambio('vivero')) + Number(cambio('trasplante'))

  const puntos: Partial<Record<CausaId, number>> = {
    raices_podridas: suma([si('tallo_blando'), 5], [mojada && si('caidas'), 4], [mojada && si('amarillas'), 1]),
    exceso_riego: seca ? 0 : suma([mojada, 3], [si('amarillas'), 2], [mojada && si('caidas'), 2], [si('moho'), 2], [si('se_caen'), 1], [cambio('riego'), 1]),
    falta_riego: !seca ? 0 : suma([true, 2], [si('caidas'), 3], [si('puntas'), 1], [si('amarillas'), 1], [si('se_caen'), 1], [cambio('riego'), 1]),
    plaga: suma([si('bichos'), 6], [si('bichos') && cambio('vivero'), 1]),
    mosquitas: seca ? 0 : suma([si('bichos'), 4], [si('bichos') && mojada, 1]),
    hongos: suma([si('manchas'), 3], [si('moho'), 3], [si('manchas') && mojada, 1]),
    falta_luz: c.luz !== 'poca' ? 0 : suma([true, 3], [si('amarillas'), 1], [si('se_caen'), 1]),
    demasiado_sol: c.luz !== 'mucha' ? 0 : suma([true, 3], [si('manchas'), 2], [si('puntas'), 2], [cambio('lugar'), 1]),
    aire_seco: mojada ? 0 : suma([si('puntas'), 3], [si('puntas') && c.humedadAlta, 2], [si('puntas') && c.invierno, 1]),
    exceso_abono: !cambio('abono') ? 0 : suma([true, 2], [si('puntas'), 2], [si('se_caen'), 1], [si('caidas'), 1]),
    adaptacion: !mudanza ? 0 : suma([true, 1 + mudanza], [si('se_caen'), 2], [si('caidas'), 1], [si('amarillas'), 1]),
    temperatura: !cambio('temperatura') ? 0 : suma([true, 3], [si('se_caen'), 1], [si('caidas'), 1], [si('manchas'), 1]),
  }
  const causas = (Object.entries(puntos) as [CausaId, number][])
    .filter(([, n]) => n >= MINIMO)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_CAUSAS)
    .map(([id]) => id)
  if (causas.length) return causas
  // Una hoja amarilla o caída sin nada más suele ser parte de crecer
  const soloHojas = r.sintomas.length > 0 && r.sintomas.every((s) => s === 'amarillas' || s === 'se_caen')
  return soloHojas && !mojada && !seca ? ['hoja_vieja'] : ['sin_pista']
}

/** El último día en que se la miró: el control más reciente o el ingreso */
const ultimaRevision = (c: Caso): string => c.controles.reduce((f, x) => (x.fecha > f ? x.fecha : f), c.ingreso)

export const controlDe = (c: Caso, dia: string): Control | undefined => c.controles.find((x) => x.fecha === dia)

/** Diario la primera semana; después cada 3 días si va mejor y cada 2 si no */
export function proximoControl(c: Caso): string {
  const ultima = ultimaRevision(c)
  const enPrimeraSemana = diasEntre(c.ingreso, ultima) < PRIMERA_SEMANA
  return sumarDias(ultima, enPrimeraSemana ? 1 : controlDe(c, ultima)?.estado === 'mejor' ? 3 : 2)
}

export const abierto = (c: Caso): boolean => !c.cierre
export const tocaControl = (c: Caso, hoy: string): boolean => abierto(c) && proximoControl(c) <= hoy
export const pendientes = (casos: Caso[], hoy: string): Caso[] => casos.filter((c) => tocaControl(c, hoy))
/** Día de tratamiento: el del ingreso es el 1 */
export const diaDe = (c: Caso, fecha: string): number => diasEntre(c.ingreso, fecha) + 1

/** Los que tienen control más urgente primero */
export const enTratamiento = (casos: Caso[]): Caso[] => casos.filter(abierto).sort((a, b) => proximoControl(a).localeCompare(proximoControl(b)))
export const cerrados = (casos: Caso[]): Caso[] => casos.filter((c) => !abierto(c)).sort((a, b) => b.cierre!.fecha.localeCompare(a.cierre!.fecha))

/** Anota el control del día (si ya había uno, lo reemplaza conservando la revisión de síntomas) */
export function anotarControl(c: Caso, nuevo: Control): Caso {
  if (c.cierre) return c
  const previo = controlDe(c, nuevo.fecha)
  const control = { ...nuevo, nota: nuevo.nota.trim().slice(0, MAX_NOTA), ...(previo?.sintomas && !nuevo.sintomas && { sintomas: previo.sintomas }) }
  const controles = [...c.controles.filter((x) => x.fecha !== nuevo.fecha), control].sort((a, b) => a.fecha.localeCompare(b.fecha))
  return { ...c, controles: controles.slice(-MAX_CONTROLES) }
}

/** Revisión por empeoramiento: cambian las causas y queda anotado en el control del día; el ingreso no se toca */
export function revisarCaso(c: Caso, r: RespuestasGuardia, causas: CausaId[], hoy: string): Caso {
  const previo = controlDe(c, hoy)
  const nota = r.notas.trim() || previo?.nota || ''
  return { ...anotarControl(c, { fecha: hoy, estado: previo?.estado ?? 'peor', tierra: r.tierra, nota, sintomas: r.sintomas }), causas }
}

/** Un caso de dos dispositivos: se juntan los controles; el cierre de cualquiera vale */
export function unirCasos(a: Caso[], b: Caso[]): Caso[] {
  const salida = a.map((c) => {
    const otro = b.find((x) => x.id === c.id)
    if (!otro) return c
    const controles = [...c.controles, ...otro.controles.filter((x) => !controlDe(c, x.fecha))].sort((x, y) => x.fecha.localeCompare(y.fecha)).slice(-MAX_CONTROLES)
    const cierre = c.cierre ?? otro.cierre
    // Las causas salen de quien vio la planta por última vez
    const causas = ultimaRevision(otro) > ultimaRevision(c) ? otro.causas : c.causas
    return { ...c, causas, controles, ...(cierre && { cierre }) }
  })
  const ids = new Set(a.map((c) => c.id))
  return [...salida, ...b.filter((c) => !ids.has(c.id))].slice(0, MAX_CASOS)
}

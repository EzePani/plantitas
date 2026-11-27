import type { Planta } from '../data/plantas/esquema'
import { diasEntre, sumarDias } from './fecha'
import { luzParaPlanta } from './lugares'
import { derivarLuz } from './luz'
import { lugarValido } from './plano'
import { calceDeLuz } from './recomendador'
import type { Caso, CausaId, Control, Espacio, RespuestasGuardia, Sintoma, Cambio, VisitaVivero } from './tipos'

export const MAX_CASOS = 60
export const MAX_CONTROLES = 200
export const MAX_NOTA = 300
export const MAX_VISITAS = 20
export const MAX_DIAGNOSTICO = 500
/** Durante la primera semana se controla todos los días */
const PRIMERA_SEMANA = 7
/** Cuánto para atrás se puede anotar un ingreso */
const MAX_ATRAS = 365

/** Cómo se agrupan los síntomas para mirarlos */
export const GRUPOS_SINTOMAS: Record<'hojas' | 'resto', Sintoma[]> = {
  hojas: ['amarillas', 'puntas', 'manchas', 'enrolladas', 'arrugadas', 'caidas', 'se_caen', 'estirada', 'bichos'],
  resto: ['tallo_blando', 'moho'],
}

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
    raices_podridas: suma([si('tallo_blando'), 5], [mojada && si('caidas'), 4], [mojada && si('amarillas'), 1], [mojada && si('arrugadas'), 4]),
    exceso_riego: seca ? 0 : suma([mojada, 3], [si('amarillas'), 2], [mojada && si('caidas'), 2], [si('moho'), 2], [si('se_caen'), 1], [cambio('riego'), 1]),
    falta_riego: !seca ? 0 : suma([true, 2], [si('caidas'), 3], [si('arrugadas'), 3], [si('enrolladas'), 3], [si('puntas'), 1], [si('amarillas'), 1], [si('se_caen'), 1], [cambio('riego'), 1]),
    plaga: suma([si('bichos'), 6], [si('bichos') && cambio('vivero'), 1], [si('enrolladas'), 3]),
    mosquitas: seca ? 0 : suma([si('bichos'), 4], [si('bichos') && mojada, 1]),
    hongos: suma([si('manchas'), 3], [si('moho'), 3], [si('manchas') && mojada, 1]),
    // Estirarse es la señal típica, aunque el lugar parezca tener buena luz
    falta_luz: suma([si('estirada'), 4], [c.luz === 'poca', 3], [c.luz === 'poca' && si('amarillas'), 1], [c.luz === 'poca' && si('se_caen'), 1]),
    demasiado_sol: c.luz !== 'mucha' ? 0 : suma([true, 3], [si('manchas'), 2], [si('puntas'), 2], [si('enrolladas'), 2], [cambio('lugar'), 1]),
    aire_seco: mojada ? 0 : suma([si('puntas'), 3], [si('puntas') && c.humedadAlta, 2], [si('puntas') && c.invierno, 1]),
    exceso_abono: !cambio('abono') ? 0 : suma([true, 2], [si('puntas'), 2], [si('se_caen'), 1], [si('caidas'), 1]),
    adaptacion: !mudanza ? 0 : suma([true, 1 + mudanza], [si('se_caen'), 2], [si('caidas'), 1], [si('amarillas'), 1]),
    temperatura: !cambio('temperatura') ? 0 : suma([true, 3], [si('se_caen'), 1], [si('caidas'), 1], [si('manchas'), 1], [si('enrolladas'), 1]),
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

export type FechaDeCaso = 'ingreso' | 'cierre'
export interface Limites {
  min: string
  max: string
}

export const limitesDeIngresoNuevo = (hoy: string): Limites => ({ min: sumarDias(hoy, -MAX_ATRAS), max: hoy })
export const dentroDe = (f: string, l: Limites): boolean => /^\d{4}-\d{2}-\d{2}$/.test(f) && f >= l.min && f <= l.max

/** El ingreso no puede quedar después de nada de lo anotado, ni el cierre antes */
export function limitesDeFecha(c: Caso, cual: FechaDeCaso, hoy: string): Limites {
  if (cual === 'cierre') return { min: ultimaRevision(c), max: hoy }
  const { min } = limitesDeIngresoNuevo(hoy)
  const primero = [c.controles[0]?.fecha, c.cierre?.fecha, hoy].filter((f): f is string => !!f).sort()[0]
  return { min: c.ingreso < min ? c.ingreso : min, max: primero }
}

export function corregirFecha(c: Caso, cual: FechaDeCaso, fecha: string, hoy: string): Caso {
  if (!dentroDe(fecha, limitesDeFecha(c, cual, hoy))) return c
  if (cual === 'ingreso') return { ...c, ingreso: fecha }
  return c.cierre ? { ...c, cierre: { ...c.cierre, fecha } } : c
}

/** Alta o despedida, en el día que se elija */
export function cerrarEl(c: Caso, tipo: 'alta' | 'despedida', fecha: string, hoy: string): Caso {
  return !c.cierre && dentroDe(fecha, limitesDeFecha(c, 'cierre', hoy)) ? { ...c, cierre: { fecha, tipo } } : c
}

/** Cambia la nota que se escribió al ingresar; vacía la quita. `ahora` es fecha y hora */
export function corregirNota(c: Caso, nota: string, ahora: string): Caso {
  const notas = nota.trim().slice(0, MAX_NOTA)
  return notas === c.notas ? c : { ...c, notas, notasCambiadas: ahora }
}

/** De dos versiones de la nota del ingreso vale la corregida más tarde; ante un empate, la de `a` */
export function notaVigente(a: Pick<Caso, 'notas' | 'notasCambiadas'>, b: Pick<Caso, 'notas' | 'notasCambiadas'>): Pick<Caso, 'notas' | 'notasCambiadas'> {
  const { notas, notasCambiadas } = (b.notasCambiadas ?? '') > (a.notasCambiadas ?? '') ? b : a
  return { notas, ...(notasCambiadas && { notasCambiadas }) }
}

/** Cambia la nota de un control ya anotado; vacía la quita. Vale también en casos cerrados */
export function corregirNotaControl(c: Caso, fecha: string, nota: string, ahora: string): Caso {
  const control = controlDe(c, fecha)
  const nueva = nota.trim().slice(0, MAX_NOTA)
  if (!control || nueva === control.nota) return c
  return { ...c, controles: c.controles.map((x) => (x === control ? { ...x, nota: nueva, notaCambiada: ahora } : x)) }
}

/** El control de un mismo día visto en dos dispositivos: vale `a`, con la nota corregida más tarde y sin perder los síntomas */
export function unirControl<T extends Control>(a: T, b: Control): T {
  const { nota, notaCambiada } = (b.notaCambiada ?? '') > (a.notaCambiada ?? '') ? b : a
  const sintomas = a.sintomas ?? b.sintomas
  return { ...a, nota, ...(notaCambiada && { notaCambiada }), ...(sintomas && { sintomas }) }
}

/** Anota el control del día (si ya había uno, lo reemplaza conservando la revisión de síntomas) */
export function anotarControl(c: Caso, nuevo: Control, ahora?: string): Caso {
  if (c.cierre) return c
  const previo = controlDe(c, nuevo.fecha)
  const nota = nuevo.nota.trim().slice(0, MAX_NOTA)
  // La marca de la nota solo se renueva si lo escrito cambió
  const notaCambiada = (nota !== (previo?.nota ?? '') && ahora) || previo?.notaCambiada
  const control = { ...nuevo, nota, ...(previo?.sintomas && !nuevo.sintomas && { sintomas: previo.sintomas }), ...(notaCambiada && { notaCambiada }) }
  const controles = [...c.controles.filter((x) => x.fecha !== nuevo.fecha), control].sort((a, b) => a.fecha.localeCompare(b.fecha))
  return { ...c, controles: controles.slice(-MAX_CONTROLES) }
}

/** Revisión por empeoramiento: cambian las causas y queda anotado en el control del día; el ingreso no se toca */
export function revisarCaso(c: Caso, r: RespuestasGuardia, causas: CausaId[], hoy: string, ahora?: string): Caso {
  const previo = controlDe(c, hoy)
  const nota = r.notas.trim() || previo?.nota || ''
  return { ...anotarControl(c, { fecha: hoy, estado: previo?.estado ?? 'peor', tierra: r.tierra, nota, sintomas: r.sintomas }, ahora), causas }
}

const porFecha = (a: VisitaVivero, b: VisitaVivero) => a.fecha.localeCompare(b.fecha)

/** Contesta que no la llevó al vivero; no borra visitas ya anotadas */
export const sinVisitas = (c: Caso): Caso => (c.vivero?.length ? c : { ...c, vivero: [] })

/** Anota una visita al vivero o corrige la que tiene ese mismo id */
export function anotarVisita(c: Caso, visita: VisitaVivero, hoy: string): Caso {
  const previas = c.vivero ?? []
  const previa = previas.find((v) => v.id === visita.id)
  const dijo = visita.dijo.trim().slice(0, MAX_DIAGNOSTICO)
  const fechaVale = visita.fecha === previa?.fecha || dentroDe(visita.fecha, limitesDeIngresoNuevo(hoy))
  if (!dijo || !fechaVale || (!previa && previas.length >= MAX_VISITAS)) return c
  return { ...c, vivero: [...previas.filter((v) => v.id !== visita.id), { ...visita, dijo }].sort(porFecha) }
}

/** Al borrar la última, vuelve a quedar sin contestar */
export function borrarVisita(c: Caso, id: string): Caso {
  const quedan = (c.vivero ?? []).filter((v) => v.id !== id)
  const { vivero: _antes, ...resto } = c
  return quedan.length ? { ...c, vivero: quedan } : resto
}

/** Un caso de dos dispositivos: se juntan los controles; el cierre de cualquiera vale */
export function unirCasos(a: Caso[], b: Caso[]): Caso[] {
  const salida = a.map((c) => {
    const otro = b.find((x) => x.id === c.id)
    if (!otro) return c
    const propios = c.controles.map((x) => {
      const del = controlDe(otro, x.fecha)
      return del ? unirControl(x, del) : x
    })
    const controles = [...propios, ...otro.controles.filter((x) => !controlDe(c, x.fecha))].sort((x, y) => x.fecha.localeCompare(y.fecha)).slice(-MAX_CONTROLES)
    const cierre = c.cierre ?? otro.cierre
    // Las causas salen de quien vio la planta por última vez
    const causas = ultimaRevision(otro) > ultimaRevision(c) ? otro.causas : c.causas
    // Si en el otro dispositivo hay un control anterior al ingreso corregido acá, manda el control
    const ingreso = controles[0] && controles[0].fecha < c.ingreso ? controles[0].fecha : c.ingreso
    const nuevas = otro.vivero?.filter((v) => !c.vivero?.some((x) => x.id === v.id)) ?? []
    const vivero = c.vivero || otro.vivero ? [...(c.vivero ?? []), ...nuevas].sort(porFecha).slice(-MAX_VISITAS) : undefined
    const foto = c.foto ?? otro.foto
    return { ...c, ...notaVigente(c, otro), ingreso, causas, controles, ...(vivero && { vivero }), ...(cierre && { cierre }), ...(foto && { foto }) }
  })
  const ids = new Set(a.map((c) => c.id))
  return [...salida, ...b.filter((c) => !ids.has(c.id))].slice(0, MAX_CASOS)
}

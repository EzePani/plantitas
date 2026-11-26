import { unirPlantas } from './espacios'
import { normalizar } from './hijitos'
import type { Coleccion, DatosPersistidos, Hijito, Refuerzo } from './tipos'

/**
 * Une dos versiones del progreso cuando se tocó en los dos dispositivos antes de sincronizar.
 * Prioriza no perder nada: lecciones, insignias, semillas, espacios y favoritas se juntan;
 * XP y racha se quedan con lo más alto. Lo único que puede "resucitar" es algo borrado en un solo lado.
 * `a` es el dispositivo local: gana los empates.
 */
export function fusionar(a: DatosPersistidos, b: DatosPersistidos): DatosPersistidos {
  const base = b.xp > a.xp ? b : a // perfil, respuestas y mascotas vienen del lado con más progreso

  const completadas = { ...b.completadas }
  for (const [id, x] of Object.entries(a.completadas)) {
    const y = completadas[id]
    if (!y || x.aciertos > y.aciertos || (x.aciertos === y.aciertos && x.fecha >= y.fecha)) completadas[id] = x
  }

  const insignias = { ...b.insignias }
  for (const [id, f] of Object.entries(a.insignias)) insignias[id] = insignias[id] && insignias[id] < f ? insignias[id] : f

  const ids = new Set(a.espacios.map((e) => e.id))
  // Un espacio que está en los dos lados conserva la versión local y suma las plantas anotadas en el otro
  const conPlantas = a.espacios.map((e) => {
    const otro = b.espacios.find((x) => x.id === e.id)
    return otro ? { ...e, plantas: unirPlantas(e.plantas, otro.plantas) } : e
  })
  const espacios = [...conPlantas, ...b.espacios.filter((e) => !ids.has(e.id))].slice(0, 50)

  const rachaA = a.racha
  const rachaB = b.racha
  const racha =
    (rachaA.ultima ?? '') !== (rachaB.ultima ?? '')
      ? (rachaA.ultima ?? '') > (rachaB.ultima ?? '') ? rachaA : rachaB
      : { ...rachaA, dias: Math.max(rachaA.dias, rachaB.dias) }

  return {
    onboardingCompleto: a.onboardingCompleto || b.onboardingCompleto,
    respuestas: base.respuestas ?? a.respuestas ?? b.respuestas,
    perfil: base.perfil ?? a.perfil ?? b.perfil,
    mascotas: base.mascotas,
    completadas,
    salteadas: [...new Set([...a.salteadas, ...b.salteadas])],
    xp: Math.max(a.xp, b.xp),
    racha,
    insignias,
    semillas: [...new Set([...a.semillas, ...b.semillas])],
    espacios,
    favoritas: [...new Set([...a.favoritas, ...b.favoritas])].slice(0, 200),
    colecciones: fusionarColecciones(a.colecciones, b.colecciones),
    hijitos: fusionarHijitos(a.hijitos, b.hijitos),
    refuerzo: fusionarRefuerzo(a.refuerzo, b.refuerzo),
  }
}

/** Los hijitos se juntan por id; si está en los dos lados, cada dato se queda con lo más avanzado */
function fusionarHijitos(a: Hijito[], b: Hijito[]): Hijito[] {
  const salida = a.map((h) => {
    const otro = b.find((x) => x.id === h.id)
    return otro ? normalizar({ ...h, agua: h.agua > otro.agua ? h.agua : otro.agua, raices: h.raices ?? otro.raices, maceta: h.maceta ?? otro.maceta, prendio: h.prendio ?? otro.prendio }) : h
  })
  const ids = new Set(a.map((h) => h.id))
  return [...salida, ...b.filter((h) => !ids.has(h.id))].slice(0, 60)
}

/** Vale el refuerzo más reciente; las preguntas a repetir se suman */
function fusionarRefuerzo(a: Refuerzo, b: Refuerzo): Refuerzo {
  const base = (b.ultimo ?? '') > (a.ultimo ?? '') ? b : a
  return { ...base, leccionesAlUltimo: Math.max(a.leccionesAlUltimo, b.leccionesAlUltimo), fallidas: [...new Set([...a.fallidas, ...b.fallidas])].slice(0, 60) }
}

/** Las colecciones se juntan por id: las plantas de las dos versiones se suman y el nombre local gana */
function fusionarColecciones(a: Coleccion[], b: Coleccion[]): Coleccion[] {
  const salida = a.map((c) => {
    const otra = b.find((x) => x.id === c.id)
    return otra ? { ...c, plantas: [...new Set([...c.plantas, ...otra.plantas])].slice(0, 200) } : c
  })
  const ids = new Set(a.map((c) => c.id))
  return [...salida, ...b.filter((c) => !ids.has(c.id))].slice(0, 20)
}

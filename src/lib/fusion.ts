import type { DatosPersistidos } from './tipos'

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
  const espacios = [...a.espacios, ...b.espacios.filter((e) => !ids.has(e.id))].slice(0, 50)

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
  }
}

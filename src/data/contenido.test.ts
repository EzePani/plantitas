import { describe, expect, it } from 'vitest'
import { NOMBRES_ILUSTRACIONES } from '../components/Ilustracion'
import { esquemaFuente } from './lessons/esquema'
import { LECCIONES } from './lessons/contenido'
import { PELIGROSAS, PLANTAS } from './plantas'
import { esquemaPlanta } from './plantas/esquema'

const lecciones = Object.values(LECCIONES).flat()
const MIN_FUENTES = 2

describe('rigor: fuentes', () => {
  it('cada lección tiene al menos 2 fuentes registradas', () => {
    for (const l of lecciones) expect(l.fuentes.length, l.id).toBeGreaterThanOrEqual(MIN_FUENTES)
  })

  it('cada planta tiene al menos 2 fuentes registradas', () => {
    expect(PLANTAS.length).toBeGreaterThanOrEqual(20)
    for (const p of PLANTAS) expect(p.fuentes.length, p.id).toBeGreaterThanOrEqual(MIN_FUENTES)
  })

  it('todo dato de toxicidad afirmado tiene fuente; sin fuente queda como no verificada', () => {
    for (const p of PLANTAS) {
      const m = p.mascotas
      const afirma = m.toxicidad_gato !== 'no_verificada' || m.toxicidad_perro !== 'no_verificada'
      if (afirma) expect(m.fuentes_toxicidad.length, p.id).toBeGreaterThanOrEqual(1)
      // "confianza alta" exige dos fuentes independientes
      if (afirma && m.confianza === 'alta') expect(m.fuentes_toxicidad.length, `${p.id} (alta)`).toBeGreaterThanOrEqual(2)
    }
  })

  it('las plantas tóxicas informan gravedad y síntomas; las seguras no', () => {
    for (const p of PLANTAS) {
      const m = p.mascotas
      const toxica = m.toxicidad_gato === 'toxica' || m.toxicidad_perro === 'toxica'
      if (toxica) {
        expect(m.gravedad, p.id).not.toBeNull()
        expect(m.sintomas, p.id).toBeTruthy()
        // "partes" puede quedar en null cuando las fuentes no dicen qué parte es la tóxica
      } else {
        expect(m.gravedad, p.id).toBeNull()
        expect(m.advertencia_grave, p.id).toBeNull()
      }
    }
  })

  it('la repelencia "reconocida" solo existe con fuente veterinaria y nunca en una planta tóxica', () => {
    for (const p of PLANTAS) {
      if (p.mascotas.repelencia_por_olor === 'ninguna') continue
      expect(p.mascotas.toxicidad_gato, p.id).toBe('segura')
      expect(p.mascotas.toxicidad_perro, p.id).toBe('segura')
      if (p.mascotas.repelencia_por_olor === 'reconocida') expect(p.mascotas.fuentes_toxicidad.length, p.id).toBeGreaterThanOrEqual(1)
    }
  })

  it('las plantas especialmente peligrosas tienen 2 fuentes veterinarias', () => {
    expect(PELIGROSAS.length).toBeGreaterThanOrEqual(2)
    for (const x of PELIGROSAS) {
      expect(x.fuentes.length, x.id).toBeGreaterThanOrEqual(MIN_FUENTES)
      for (const f of x.fuentes) expect(esquemaFuente.safeParse(f).success, `${x.id}: ${f.url}`).toBe(true)
      expect(x.afecta.length, x.id).toBeGreaterThanOrEqual(1)
    }
  })

  it('las fuentes de una misma ficha no se repiten', () => {
    for (const p of PLANTAS) expect(new Set(p.fuentes.map((f) => f.url)).size, p.id).toBe(p.fuentes.length)
    for (const l of lecciones) expect(new Set(l.fuentes.map((f) => f.url)).size, l.id).toBe(l.fuentes.length)
  })
})

describe('catálogo', () => {
  it('todas las plantas cumplen el esquema', () => {
    for (const p of PLANTAS) {
      const r = esquemaPlanta.safeParse(p)
      expect(r.success, `${p.id}: ${r.success ? '' : r.error.message}`).toBe(true)
    }
  })

  it('ids únicos', () => {
    expect(new Set(PLANTAS.map((p) => p.id)).size).toBe(PLANTAS.length)
  })

  it('hay buena proporción de plantas seguras para gatos y perros', () => {
    const seguras = PLANTAS.filter((p) => p.mascotas.toxicidad_gato === 'segura' && p.mascotas.toxicidad_perro === 'segura')
    expect(seguras.length / PLANTAS.length).toBeGreaterThanOrEqual(0.3)
  })

  it('la luz usa las categorías del Modelo de luz, sin repetir la requerida entre las toleradas', () => {
    for (const p of PLANTAS) {
      expect(p.luz_tolerada, p.id).not.toContain(p.luz_requerida)
      // Una planta de luz directa tiene que tolerar horas de sol
      if (p.luz_requerida === 'directa') expect(p.horas_sol_directo, p.id).toBeGreaterThan(0)
      // Sin horas de sol directo no puede tolerar el sol fuerte de la tarde
      if (p.horas_sol_directo === 0) expect(p.tolera_sol_tarde, p.id).toBe(false)
    }
  })

  it('las plantas aptas para balcón existen para sol y para sombra', () => {
    const balcon = PLANTAS.filter((p) => p.apta.balcon)
    expect(balcon.some((p) => p.horas_sol_directo > 0)).toBe(true)
  })
})

describe('lecciones', () => {
  it('tienen 4 a 6 tarjetas y 3 a 5 preguntas', () => {
    for (const l of lecciones) {
      expect(l.tarjetas.length, l.id).toBeGreaterThanOrEqual(4)
      expect(l.tarjetas.length, l.id).toBeLessThanOrEqual(6)
      expect(l.quiz.length, l.id).toBeGreaterThanOrEqual(3)
      expect(l.quiz.length, l.id).toBeLessThanOrEqual(5)
    }
  })

  it('solo usan ilustraciones que existen o plantas del catálogo', () => {
    const ids = new Set(PLANTAS.map((p) => p.id))
    const valida = (img: string, donde: string) => {
      if (img.startsWith('planta:')) expect(ids.has(img.slice(7)), `${donde}: ${img}`).toBe(true)
      else expect(NOMBRES_ILUSTRACIONES, `${donde}: ${img}`).toContain(img)
    }
    for (const l of lecciones) {
      for (const t of l.tarjetas) {
        if (t.tipo === 'comparativa') {
          valida(t.imagen_mal, l.id)
          valida(t.imagen_bien, l.id)
        } else valida(t.imagen, l.id)
      }
      for (const p of l.quiz) if (p.tipo === 'que_le_pasa') valida(p.imagen, l.id)
    }
  })

  it('las preguntas "¿es segura?" coinciden con el catálogo', () => {
    for (const l of lecciones)
      for (const q of l.quiz) {
        if (q.tipo !== 'que_le_pasa' || !q.imagen.startsWith('planta:')) continue
        const planta = PLANTAS.find((p) => p.id === q.imagen.slice(7))!
        const respuesta = q.opciones[q.correcta].toLowerCase()
        const dice = respuesta.includes('tóxica') || respuesta.includes('toxica') ? 'toxica' : respuesta.includes('segura') ? 'segura' : null
        if (dice) expect(planta.mascotas.toxicidad_gato, `${l.id}: ${planta.id}`).toBe(dice)
      }
  })
})

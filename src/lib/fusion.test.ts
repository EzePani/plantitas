import { describe, expect, it } from 'vitest'
import { fusionar } from './fusion'
import { esquemaDatos } from './backup'
import { DATOS_INICIALES } from '../store/useStore'

const a = { ...DATOS_INICIALES, onboardingCompleto: true, xp: 100, completadas: { 'luz-1': { fecha: '2026-11-17', aciertos: 3, total: 4 } }, racha: { dias: 2, ultima: '2026-11-18' }, favoritas: ['x'], semillas: ['luz' as const] }
const b = { ...DATOS_INICIALES, onboardingCompleto: true, xp: 150, completadas: { 'luz-1': { fecha: '2026-11-16', aciertos: 4, total: 4 }, 'luz-2': { fecha: '2026-11-18', aciertos: 2, total: 4 } }, racha: { dias: 5, ultima: '2026-11-17' }, favoritas: ['y'], semillas: ['basico' as const] }

describe('fusionar', () => {
  const r = fusionar(a, b)
  it('junta lecciones y se queda con el mejor resultado', () => {
    expect(Object.keys(r.completadas).sort()).toEqual(['luz-1', 'luz-2'])
    expect(r.completadas['luz-1'].aciertos).toBe(4)
  })
  it('XP máximo, racha más reciente, uniones', () => {
    expect(r.xp).toBe(150)
    expect(r.racha).toEqual({ dias: 2, ultima: '2026-11-18' })
    expect(r.favoritas.sort()).toEqual(['x', 'y'])
    expect(r.semillas.sort()).toEqual(['basico', 'luz'])
  })
  it('el resultado cumple el esquema', () => {
    expect(esquemaDatos.safeParse(r).success).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { esquemaLeccion } from './esquema'
import { NOMBRES_ILUSTRACIONES } from '../../components/Ilustracion'

// Valida cada JSON de lecciones de la carpeta, esté o no registrado en index.ts
const archivos = import.meta.glob<{ default: unknown[] }>('./*.json', { eager: true })

describe('archivos de lecciones', () => {
  for (const [ruta, mod] of Object.entries(archivos)) {
    it(`${ruta} es válido`, () => {
      const unidad = ruta.replace('./', '').replace('.json', '')
      mod.default.forEach((cruda, i) => {
        const r = esquemaLeccion.safeParse(cruda)
        expect(r.success, `${ruta}[${i}]: ${r.success ? '' : r.error.message}`).toBe(true)
        if (!r.success) return
        const l = r.data
        expect(l.id).toBe(`${unidad}-${i + 1}`)
        expect(l.unidad).toBe(unidad)
        expect(l.para_llevarte, l.id).toHaveLength(3)
        const imagenes: string[] = []
        for (const t of l.tarjetas) {
          const oraciones = t.texto.split(/[.!?]+(?:\s|$)/).filter((o) => o.trim()).length
          expect(oraciones, `${l.id}: "${t.texto}"`).toBeLessThanOrEqual(2)
          const x = t as Record<string, unknown>
          for (const k of ['imagen', 'imagen_mal', 'imagen_bien']) if (typeof x[k] === 'string') imagenes.push(x[k] as string)
        }
        for (const p of l.quiz) {
          const x = p as Record<string, unknown>
          if (typeof x.imagen === 'string') imagenes.push(x.imagen)
          if (p.tipo === 'opcion_multiple' || p.tipo === 'que_le_pasa') expect(p.correcta, l.id).toBeLessThan(p.opciones.length)
        }
        for (const img of imagenes) if (!img.startsWith('planta:')) expect(NOMBRES_ILUSTRACIONES, `${l.id}: ${img}`).toContain(img)
      })
    })
  }
})

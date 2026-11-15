import { describe, expect, it } from 'vitest'
import type { Planta } from '../data/plantas/esquema'
import { esApta, seguridadPara } from './mascotas'
import { recomendar, type DatosEspacio } from './recomendador'

type Extra = { luz?: Partial<Planta['luz']>; gato?: Planta['mascotas']['toxicidad_gato']; perro?: Planta['mascotas']['toxicidad_perro'] } & Partial<Omit<Planta, 'luz' | 'mascotas'>>

function planta(id: string, x: Extra = {}): Planta {
  const { luz, gato = 'segura', perro = 'segura', ...resto } = x
  return {
    id,
    nombre_comun: id,
    otros_nombres: [],
    nombre_cientifico: id,
    familia: 'x',
    grupo: 'follaje_tropical',
    luz: { necesidad: 'media', tolera: [], sol_directo: false, detalle: 'x', confianza: 'alta', ...luz },
    riego: { nivel: 'medio', verano: 'x', invierno: 'x', confianza: 'alta' },
    humedad: { nivel: 'media', detalle: 'x', confianza: 'alta' },
    sustrato: { tipo: 'x', confianza: 'alta' },
    tolerancia_descuido: 3,
    apta: { interior: true, balcon: false, nota_balcon: '' },
    tamano: 'mediana',
    dificultad: 'facil',
    tip: 'x',
    imagen: null,
    atribucion_imagen: null,
    mascotas: {
      toxicidad_gato: gato,
      toxicidad_perro: perro,
      gravedad: null,
      sintomas: null,
      partes: null,
      atractivo_para_mascotas: 'desconocido',
      atractivo_motivo: '',
      repelencia_por_olor: 'ninguna',
      nota_mascotas: 'x',
      advertencia_grave: null,
      confianza: 'alta',
      fuentes_toxicidad: [],
    },
    fuentes: [],
    confianza: 'alta',
    adaptaciones: [],
    discrepancias: [],
    ...resto,
  }
}

const base: DatosEspacio = { tipo: 'living', horaSol: 'manana', tamano: 'mediano', mascotas: 'ninguna', esfuerzo: 'medio' }

describe('seguridad para mascotas', () => {
  const soloGato = planta('a', { gato: 'toxica' })
  const dudosaPerro = planta('b', { perro: 'no_verificada' })

  it('evalúa cada especie por separado', () => {
    expect(seguridadPara(soloGato, 'gato')).toBe('toxica')
    expect(seguridadPara(soloGato, 'perro')).toBe('segura')
    expect(seguridadPara(soloGato, 'ninguna')).toBeNull()
  })

  it('con gato y perro aplica el criterio más estricto', () => {
    expect(seguridadPara(soloGato, 'ambos')).toBe('toxica')
    expect(seguridadPara(dudosaPerro, 'ambos')).toBe('no_verificada')
    expect(seguridadPara(planta('c', { gato: 'no_verificada', perro: 'toxica' }), 'ambos')).toBe('toxica')
  })

  it('"no verificada" no cuenta como apta', () => {
    expect(esApta(dudosaPerro, 'perro')).toBe(false)
    expect(esApta(dudosaPerro, 'gato')).toBe(true)
    expect(esApta(dudosaPerro, 'ninguna')).toBe(true)
  })

  it('el atractivo nunca cambia la seguridad', () => {
    const p = planta('d', { gato: 'toxica' })
    p.mascotas.atractivo_para_mascotas = 'alto'
    expect(esApta(p, 'gato')).toBe(false)
    const q = planta('e')
    q.mascotas.atractivo_para_mascotas = 'bajo'
    expect(esApta(q, 'gato')).toBe(true)
  })
})

describe('recomendador', () => {
  const catalogo = [
    planta('segura-media'),
    planta('toxica-gato', { gato: 'toxica', tolerancia_descuido: 5 }),
    planta('dudosa-perro', { perro: 'no_verificada' }),
    planta('toxica-ambos', { gato: 'toxica', perro: 'toxica' }),
    planta('sol', { luz: { necesidad: 'mucha', sol_directo: true }, apta: { interior: true, balcon: true, nota_balcon: '' } }),
    planta('sombra', { luz: { necesidad: 'poca', tolera: ['media'] } }),
    planta('grande', { tamano: 'grande' }),
    planta('dificil', { dificultad: 'dificil', tolerancia_descuido: 1 }),
    planta('helecho', { humedad: { nivel: 'alta', detalle: 'x', confianza: 'alta' } }),
  ]
  const ids = (d: Partial<DatosEspacio>, n = 20) => recomendar(catalogo, { ...base, ...d }, n).recomendadas.map((r) => r.planta.id)

  it('filtro estricto: con gato nunca recomienda tóxicas para gatos', () => {
    const r = ids({ mascotas: 'gato' })
    expect(r).not.toContain('toxica-gato')
    expect(r).not.toContain('toxica-ambos')
    expect(r).toContain('dudosa-perro')
  })

  it('filtro estricto: con perro excluye tóxicas y no verificadas para perros', () => {
    const r = ids({ mascotas: 'perro' })
    expect(r).not.toContain('dudosa-perro')
    expect(r).not.toContain('toxica-ambos')
    expect(r).toContain('toxica-gato')
  })

  it('con ambos solo quedan las seguras para las dos especies', () => {
    const r = ids({ mascotas: 'ambos' })
    for (const id of ['toxica-gato', 'dudosa-perro', 'toxica-ambos']) expect(r).not.toContain(id)
    expect(r).toContain('segura-media')
  })

  it('el filtro se cumple en todas las combinaciones de espacio', () => {
    for (const tipo of ['living', 'dormitorio', 'cocina', 'bano', 'balcon', 'escritorio'] as const)
      for (const horaSol of ['manana', 'mediodia', 'tarde', 'todo_el_dia', 'casi_nunca', 'no_se'] as const)
        for (const mascotas of ['gato', 'perro', 'ambos'] as const)
          for (const esfuerzo of ['poco', 'medio', 'mucho'] as const) {
            const r = recomendar(catalogo, { tipo, horaSol, tamano: 'mediano', mascotas, esfuerzo }, 20)
            for (const x of r.recomendadas) expect(esApta(x.planta, mascotas), `${x.planta.id} con ${mascotas}`).toBe(true)
          }
  })

  it('sin mascotas no filtra por toxicidad', () => {
    expect(ids({})).toContain('toxica-gato')
  })

  it('respeta la luz deducida del horario de sol', () => {
    expect(ids({ horaSol: 'casi_nunca' })).toEqual(['sombra'])
    const mucha = ids({ horaSol: 'todo_el_dia' })
    expect(mucha[0]).toBe('sol')
    expect(mucha).not.toContain('sombra')
    const media = ids({ horaSol: 'manana' })
    expect(media).toContain('sombra')
    expect(media).not.toContain('sol')
  })

  it('adentro, con mucha luz, acepta las de luz indirecta avisando que hay que filtrarla; en el balcón no', () => {
    const r = recomendar(catalogo, { ...base, horaSol: 'todo_el_dia' }, 20)
    const media = r.recomendadas.find((x) => x.planta.id === 'segura-media')
    expect(media?.motivos).toContain('luz_filtrada')
    expect(ids({ tipo: 'balcon', horaSol: 'todo_el_dia' })).not.toContain('segura-media')
  })

  it('"no sé" usa luz media y lo avisa', () => {
    const r = recomendar(catalogo, { ...base, horaSol: 'no_se' })
    expect(r).toMatchObject({ luz: 'media', luzAsumida: true })
  })

  it('en el balcón solo van las aptas para balcón', () => {
    expect(ids({ tipo: 'balcon', horaSol: 'todo_el_dia' })).toEqual(['sol'])
  })

  it('con poco esfuerzo prioriza las que aguantan descuido', () => {
    const r = ids({ esfuerzo: 'poco' })
    expect(r[0]).toBe('toxica-gato')
    expect(r.indexOf('dificil')).toBe(r.length - 1)
  })

  it('en el baño suben las que aman la humedad', () => {
    expect(ids({ tipo: 'bano' })[0]).toBe('helecho')
  })

  it('devuelve entre 3 y 5 y explica el porqué', () => {
    const r = recomendar(catalogo, base)
    expect(r.recomendadas.length).toBeGreaterThanOrEqual(3)
    expect(r.recomendadas.length).toBeLessThanOrEqual(5)
    for (const x of r.recomendadas) expect(x.motivos.length).toBeGreaterThan(0)
  })

  it('"mejor evitar": con mascotas señala una tóxica tentadora, y nunca repite una recomendada', () => {
    const r = recomendar(catalogo, { ...base, mascotas: 'gato', esfuerzo: 'poco' })
    expect(r.evitar.length).toBeGreaterThanOrEqual(1)
    expect(r.evitar.length).toBeLessThanOrEqual(2)
    expect(r.evitar[0]).toMatchObject({ motivo: 'toxica' })
    expect(r.evitar[0].planta.id).toBe('toxica-gato')
    const rec = new Set(r.recomendadas.map((x) => x.planta.id))
    for (const e of r.evitar) expect(rec.has(e.planta.id)).toBe(false)
  })

  it('"mejor evitar" por luz cuando no hay mascotas', () => {
    const r = recomendar(catalogo, { ...base, horaSol: 'casi_nunca' })
    expect(r.evitar).toHaveLength(1)
    expect(r.evitar[0].motivo).toBe('poca_luz')
  })
})

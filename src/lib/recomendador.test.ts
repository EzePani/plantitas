import { describe, expect, it } from 'vitest'
import type { Planta } from '../data/plantas/esquema'
import { esApta, seguridadPara } from './mascotas'
import { calceEnEspacio, recomendar, type DatosEspacio } from './recomendador'
import type { PerfilLuz } from './tipos'

type Extra = { gato?: Planta['mascotas']['toxicidad_gato']; perro?: Planta['mascotas']['toxicidad_perro'] } & Partial<Omit<Planta, 'mascotas'>>

function planta(id: string, x: Extra = {}): Planta {
  const { gato = 'segura', perro = 'segura', ...resto } = x
  return {
    id,
    nombre_comun: id,
    otros_nombres: [],
    nombre_cientifico: id,
    familia: 'x',
    grupo: 'follaje_tropical',
    luz_requerida: 'indirecta_brillante',
    luz_tolerada: [],
    horas_sol_directo: 0,
    tolera_sol_tarde: false,
    sensibilidad_calor: 'media',
    luz: { detalle: 'x', confianza: 'alta', confianza_sol: 'alta' },
    riego: { nivel: 'medio', verano: 'x', invierno: 'x', confianza: 'alta' },
    humedad: { nivel: 'media', detalle: 'x', confianza: 'alta' },
    sustrato: { tipo: 'x', confianza: 'alta' },
    tolerancia_descuido: 3,
    apta: { interior: true, balcon: false, nota_balcon: '' },
    tamano: 'mediana',
    dificultad: 'facil',
    clases: ['follaje'],
    cultivo: {
      porte: ['erguida'],
      tutor: { recomendado: 'no', detalle: '' },
      poda: { meses: [], detalle: 'x' },
      propagacion: { metodos: [], en_agua: false, meses: [], detalle: 'x' },
      fuentes: [],
      confianza: 'alta',
      adaptaciones: [],
    },
    fotos_extra: [],
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

const sol = (desde: number, hasta: number, obstaculos: PerfilLuz['obstaculos'] = []): PerfilLuz => ({ tipo: 'directa', tramos: [{ desde, hasta }], obstaculos })
const INDIRECTA: PerfilLuz = { tipo: 'indirecta', tramos: [], obstaculos: [] }
const BAJA: PerfilLuz = { tipo: 'baja', tramos: [], obstaculos: [] }
const NO_SE: PerfilLuz = { tipo: 'no_se', tramos: [], obstaculos: [] }
const MANANA = sol(8, 12)
const TARDE = sol(15, 19)

const base: DatosEspacio = { tipo: 'living', luz: INDIRECTA, tamano: 'mediano', mascotas: 'ninguna', esfuerzo: 'medio' }

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
    planta('sol', { luz_requerida: 'directa', luz_tolerada: ['indirecta_brillante'], horas_sol_directo: 6, tolera_sol_tarde: true, sensibilidad_calor: 'baja', apta: { interior: true, balcon: true, nota_balcon: '' } }),
    planta('sol-suave', { horas_sol_directo: 3, apta: { interior: true, balcon: true, nota_balcon: '' } }),
    planta('sombra', { luz_tolerada: ['indirecta_media', 'baja'] }),
    planta('grande', { tamano: 'grande' }),
    planta('dificil', { dificultad: 'dificil', tolerancia_descuido: 1 }),
    planta('helecho', { humedad: { nivel: 'alta', detalle: 'x', confianza: 'alta' }, sensibilidad_calor: 'alta' }),
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
      for (const luz of [MANANA, TARDE, sol(9, 17), sol(8, 12, ['cortina']), INDIRECTA, BAJA, NO_SE])
        for (const mascotas of ['gato', 'perro', 'ambos'] as const)
          for (const esfuerzo of ['poco', 'medio', 'mucho'] as const) {
            const r = recomendar(catalogo, { tipo, luz, tamano: 'mediano', mascotas, esfuerzo }, 20)
            for (const x of r.recomendadas) expect(esApta(x.planta, mascotas), `${x.planta.id} con ${mascotas}`).toBe(true)
          }
  })

  it('sin mascotas no filtra por toxicidad', () => {
    expect(ids({})).toContain('toxica-gato')
  })

  it('cada espacio usa su propio perfil de luz', () => {
    expect(ids({ luz: BAJA })).toEqual(['sombra'])
    expect(ids({ luz: NO_SE })).toEqual(['sombra'])
    const brillante = ids({ luz: INDIRECTA })
    expect(brillante).toContain('segura-media')
    expect(brillante).toContain('sol')
    expect(brillante[brillante.length - 1]).not.toBe('segura-media')
  })

  it('"no sé" asume luz indirecta media y lo avisa', () => {
    expect(recomendar(catalogo, { ...base, luz: NO_SE }).luz).toMatchObject({ categoria: 'indirecta_media', asumida: true })
  })

  it('en el balcón con sol, solo van las que toleran esas horas de sol directo', () => {
    expect(ids({ tipo: 'balcon', luz: MANANA })).toEqual(['sol', 'sol-suave'])
    // 8 horas: la de sol suave (3 h) ya no alcanza
    expect(ids({ tipo: 'balcon', luz: sol(9, 17) })).toEqual(['sol'])
  })

  it('aviso de calor: con sol de tarde en el balcón solo quedan las que lo toleran', () => {
    expect(recomendar(catalogo, { ...base, tipo: 'balcon', luz: TARDE }).luz.avisoCalor).toBe(true)
    expect(ids({ tipo: 'balcon', luz: TARDE })).toEqual(['sol'])
    // Sol de mañana pero a través de un vidrio: también hay aviso de calor
    expect(ids({ tipo: 'balcon', luz: sol(8, 12, ['vidrio']) })).toEqual(['sol'])
  })

  it('adentro, con sol directo, acepta las de luz indirecta avisando que hay que filtrarla', () => {
    const r = recomendar(catalogo, { ...base, luz: MANANA }, 20)
    expect(r.recomendadas[0].planta.id).toBe('sol')
    expect(r.recomendadas.find((x) => x.planta.id === 'segura-media')?.motivos).toContain('luz_filtrada')
    expect(r.recomendadas.find((x) => x.planta.id === 'sol')?.motivos).toEqual(expect.arrayContaining(['luz_ideal', 'aguanta_sol']))
  })

  it('una cortina convierte el sol directo en luz indirecta brillante', () => {
    const r = recomendar(catalogo, { ...base, luz: sol(14, 19, ['cortina']) }, 20)
    expect(r.luz).toMatchObject({ categoria: 'indirecta_brillante', avisoCalor: false })
    expect(r.recomendadas.find((x) => x.planta.id === 'segura-media')?.motivos).toContain('luz_ideal')
  })

  it('con aviso de calor, las sensibles bajan y aparecen en "mejor evitar"', () => {
    const tarde = recomendar(catalogo, { ...base, luz: TARDE }, 20)
    const manana = recomendar(catalogo, { ...base, luz: MANANA }, 20)
    const pos = (r: typeof tarde, id: string) => r.recomendadas.findIndex((x) => x.planta.id === id)
    expect(pos(tarde, 'helecho')).toBeGreaterThan(pos(manana, 'helecho'))
    const corto = recomendar(catalogo, { ...base, luz: TARDE }, 3)
    expect(corto.evitar).toContainEqual({ planta: catalogo.find((p) => p.id === 'helecho'), motivo: 'calor' })
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
    const r = recomendar(catalogo, { ...base, luz: BAJA })
    expect(r.evitar).toHaveLength(1)
    expect(r.evitar[0].motivo).toBe('poca_luz')
  })
})

describe('calce de una planta en un espacio', () => {
  it('le va bien con la luz que pide', () => {
    expect(calceEnEspacio(planta('a'), base)).toEqual({ nivel: 'bien' })
  })

  it('con mascotas, la toxicidad pesa más que la luz', () => {
    expect(calceEnEspacio(planta('a', { gato: 'toxica' }), { ...base, mascotas: 'gato' })).toEqual({ nivel: 'no', motivo: 'toxica' })
    expect(calceEnEspacio(planta('a', { perro: 'no_verificada' }), { ...base, mascotas: 'perro' })).toEqual({ nivel: 'no', motivo: 'no_verificada' })
    // La toxicidad para otra especie no cuenta
    expect(calceEnEspacio(planta('a', { gato: 'toxica' }), { ...base, mascotas: 'perro' })).toEqual({ nivel: 'bien' })
  })

  it('sin luz suficiente avisa que le falta luz', () => {
    expect(calceEnEspacio(planta('a'), { ...base, luz: BAJA })).toEqual({ nivel: 'no', motivo: 'poca_luz' })
  })

  it('un lugar que no es apto para la planta lo descarta', () => {
    expect(calceEnEspacio(planta('a'), { ...base, tipo: 'balcon' })).toEqual({ nivel: 'no', motivo: 'lugar' })
  })

  it('con sol directo, adentro, la de luz indirecta brillante necesita un ajuste', () => {
    expect(calceEnEspacio(planta('a'), { ...base, luz: MANANA })).toEqual({ nivel: 'con_ajuste' })
  })

  it('coincide con el recomendador: si la recomienda, no dice que no', () => {
    const p = planta('a')
    for (const luz of [INDIRECTA, BAJA, NO_SE, MANANA, TARDE]) {
      const d = { ...base, luz }
      const recomendada = recomendar([p], d).recomendadas.length > 0
      expect(calceEnEspacio(p, d).nivel !== 'no').toBe(recomendada)
    }
  })
})


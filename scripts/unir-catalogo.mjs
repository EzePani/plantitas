// Une los lotes de investigación (src/data/plantas/lote-*.json) en src/data/plants.json.
// Conserva la foto y su atribución si la planta ya las tenía.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

const DIR = 'src/data/plantas'
const DESTINO = 'src/data/plants.json'
// Datos de luz verificados con fuentes, por id de planta. Pisan lo derivado.
const verificada = Object.assign({}, ...readdirSync(DIR).filter((f) => /^luz-verificada.*\.json$/.test(f)).sort().map((f) => JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8'))))

/**
 * Los lotes guardan la luz como la relevó la investigación: necesidad (poca / media / mucha),
 * niveles que tolera y si aguanta sol directo. Acá se pasa a las categorías del Modelo de luz.
 *   mucha + sol directo → directa
 *   mucha sin sol directo, o media ("luz brillante indirecta") → indirecta_brillante
 *   poca → indirecta_media
 * Las horas de sol directo, el sol de tarde y la sensibilidad al calor NO fueron relevados
 * dato por dato: se estiman de forma conservadora y quedan con confianza_sol "baja"
 * hasta que luz-verificada.json traiga el dato con fuentes.
 */
function luzNueva(p) {
  const l = p.luz
  const requerida = l.necesidad === 'mucha' ? (l.sol_directo ? 'directa' : 'indirecta_brillante') : l.necesidad === 'media' ? 'indirecta_brillante' : 'indirecta_media'
  const tolerada = new Set()
  if (requerida === 'directa' && l.tolera.includes('media')) tolerada.add('indirecta_brillante')
  if (l.tolera.includes('poca')) {
    tolerada.add('indirecta_media')
    tolerada.add('baja')
  }
  tolerada.delete(requerida)
  const estimado = {
    luz_requerida: requerida,
    luz_tolerada: [...tolerada],
    horas_sol_directo: l.sol_directo ? 6 : l.tolera.includes('mucha') ? 2 : 0,
    tolera_sol_tarde: Boolean(l.sol_directo),
    sensibilidad_calor: l.sol_directo ? 'baja' : p.humedad.nivel === 'alta' ? 'alta' : 'media',
    confianza_sol: 'baja',
  }
  // Lo verificado trae además sus fuentes y, si hace falta, discrepancias y adaptaciones propias
  const { fuentes_sol = [], discrepancias_sol = [], adaptaciones_sol = [], nota_sol, ...v } = verificada[p.id] ?? {}
  const { confianza_sol, ...campos } = { ...estimado, ...v }
  campos.luz_tolerada = campos.luz_tolerada.filter((c) => c !== campos.luz_requerida)
  if (campos.horas_sol_directo === 0) campos.tolera_sol_tarde = false
  const vistas = new Set(p.fuentes.map((f) => f.url))
  return {
    ...campos,
    luz: { detalle: l.detalle, confianza: l.confianza, confianza_sol },
    fuentes: [...p.fuentes, ...fuentes_sol.filter((f) => !vistas.has(f.url) && vistas.add(f.url))],
    discrepancias: [...p.discrepancias, ...discrepancias_sol],
    adaptaciones: [...p.adaptaciones, ...adaptaciones_sol],
  }
}

const previas = new Map((existsSync(DESTINO) ? JSON.parse(readFileSync(DESTINO, 'utf8')) : []).map((p) => [p.id, p]))

const plantas = readdirSync(DIR)
  .filter((f) => /^lote-.*\.json$/.test(f))
  .sort()
  .flatMap((f) => JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')))
  .map((p) => {
    // Confianza general = la más baja entre luz, riego y sustrato. La humedad lleva su propio
    // nivel (y su aviso en la ficha): es el dato menos documentado y no define si la planta vive.
    const orden = ['baja', 'media', 'alta']
    p = { ...p, confianza: orden[Math.min(...[p.luz, p.riego, p.sustrato].map((d) => orden.indexOf(d.confianza)))] }
    p = { ...p, ...luzNueva(p) }
    const antes = previas.get(p.id)
    return antes?.imagen ? { ...p, imagen: antes.imagen, atribucion_imagen: antes.atribucion_imagen } : p
  })
  .sort((a, b) => a.nombre_comun.localeCompare(b.nombre_comun, 'es'))

writeFileSync(DESTINO, JSON.stringify(plantas, null, 2) + '\n')
console.log(`${plantas.length} plantas en ${DESTINO}`)

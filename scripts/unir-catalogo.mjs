// Une los lotes de investigación (src/data/plantas/lote-*.json) en src/data/plants.json.
// Conserva la foto y su atribución si la planta ya las tenía.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

const DIR = 'src/data/plantas'
const DESTINO = 'src/data/plants.json'
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
    const antes = previas.get(p.id)
    return antes?.imagen ? { ...p, imagen: antes.imagen, atribucion_imagen: antes.atribucion_imagen } : p
  })
  .sort((a, b) => a.nombre_comun.localeCompare(b.nombre_comun, 'es'))

writeFileSync(DESTINO, JSON.stringify(plantas, null, 2) + '\n')
console.log(`${plantas.length} plantas en ${DESTINO}`)

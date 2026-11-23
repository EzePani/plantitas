// Suma al catálogo los lotes de plantas nuevas (investigacion/nuevas/plantas-<lote>.json).
// Cada entrada trae todo junto; acá se reparte donde vive cada dato:
//   - cuidados y mascotas → src/data/plants.json (sin clases, cultivo ni fotos_extra)
//   - clases              → src/data/plantas/clases.json
//   - cultivo             → src/data/plantas/cultivo-<lote>.json
//   - fotos               → plants.json (principal) y src/data/plantas/fotos-<lote>.json (extra),
//                           a partir de investigacion/nuevas/fotos-<lote>.json y public/img/extra/<id>-1.webp
//   - credits.json        → atribuciones de las principales
// Uso: node scripts/sumar-plantas.mjs d e f
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'

const leer = (ruta) => JSON.parse(readFileSync(ruta, 'utf8'))
const escribir = (ruta, datos) => writeFileSync(ruta, JSON.stringify(datos, null, 2) + '\n')
const lotes = process.argv.slice(2)
if (!lotes.length) throw new Error('Uso: node scripts/sumar-plantas.mjs <lote> [<lote>...]')

const plantas = leer('src/data/plants.json')
const clases = leer('src/data/plantas/clases.json')
const creditos = leer('src/data/credits.json')
const ids = new Set(plantas.map((p) => p.id))

for (const lote of lotes) {
  const nuevas = leer(`investigacion/nuevas/plantas-${lote}.json`)
  const fotosArchivo = `investigacion/nuevas/fotos-${lote}.json`
  const fotos = existsSync(fotosArchivo) ? leer(fotosArchivo) : {}
  const cultivo = {}
  const extras = {}
  for (const n of nuevas) {
    if (ids.has(n.id)) throw new Error(`${n.id} ya está en el catálogo`)
    const { clases: c, cultivo: cu, fotos_extra: _f, ...planta } = n
    clases[n.id] = c
    cultivo[n.id] = cu
    const [principal, ...resto] = fotos[n.id] ?? []
    if (principal && existsSync(`public/img/extra/${n.id}-1.webp`)) {
      renameSync(`public/img/extra/${n.id}-1.webp`, `public/img/${n.id}.webp`)
      planta.imagen = `img/${n.id}.webp`
      planta.atribucion_imagen = { autor: principal.autor, licencia: principal.licencia, url: principal.url }
      creditos.push({ id: n.id, planta: n.nombre_comun, archivo: planta.imagen, ...planta.atribucion_imagen })
    }
    extras[n.id] = resto
    plantas.push(planta)
    ids.add(n.id)
  }
  escribir(`src/data/plantas/cultivo-${lote}.json`, cultivo)
  escribir(`src/data/plantas/fotos-${lote}.json`, extras)
}

escribir('src/data/plants.json', plantas)
escribir('src/data/plantas/clases.json', clases)
escribir('src/data/credits.json', creditos)
console.log(`${plantas.length} plantas en el catálogo`)

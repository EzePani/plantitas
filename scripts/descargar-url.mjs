// Descarga fotos de fuentes abiertas distintas de Commons (iNaturalist, Flickr vía Openverse, GBIF),
// solo CC0, dominio público, CC BY y CC BY-SA. Misma salida que descargar-extras.mjs.
//
// Uso: node scripts/descargar-url.mjs <elegidas.json> <salida.json> [desde]
//   elegidas.json: { "id": [{ "imagen": "https://.../foto.jpg", "autor": "...", "licencia": "CC BY 4.0", "url": "https://pagina-de-la-foto" }] }
//   desde: número de la primera foto (por defecto 1, la principal).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const UA = 'PlantitasImageScript/1.0 (educational houseplant PWA)'
const ANCHO = 800
const SALIDA = 'public/img/extra'
const LICENCIA_OK = /^(cc0|public domain|pd\b|cc[ -]by(-sa)?[ -]\d)/i

const [archivoElegidas, archivoSalida, desdeArg] = process.argv.slice(2)
const DESDE = Number(desdeArg ?? 1)
if (!archivoElegidas || !archivoSalida) throw new Error('Uso: node scripts/descargar-url.mjs <elegidas.json> <salida.json> [desde]')

const elegidas = JSON.parse(readFileSync(archivoElegidas, 'utf8'))
const salida = existsSync(archivoSalida) ? JSON.parse(readFileSync(archivoSalida, 'utf8')) : {}
mkdirSync(SALIDA, { recursive: true })

for (const [id, lista] of Object.entries(elegidas)) {
  if (!/^[a-z-]+$/.test(id)) throw new Error(`id inválido: ${id}`)
  const fotos = []
  for (const f of lista) {
    try {
      if (!f.autor || !f.url?.startsWith('https://') || !f.imagen?.startsWith('https://')) throw new Error('falta autor, url o imagen')
      if (!LICENCIA_OK.test(f.licencia ?? '')) throw new Error(`licencia no permitida: ${f.licencia || 'sin dato'}`)
      const r = await fetch(f.imagen, { headers: { 'User-Agent': UA } })
      if (!r.ok) throw new Error(`respondió ${r.status}`)
      const n = fotos.length + DESDE
      await sharp(Buffer.from(await r.arrayBuffer())).rotate().resize({ width: ANCHO, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`${SALIDA}/${id}-${n}.webp`)
      fotos.push({ archivo: `img/extra/${id}-${n}.webp`, autor: f.autor.slice(0, 120), licencia: f.licencia, url: f.url })
      console.log(`✓ ${id}-${n}  ←  ${f.url}  (${f.licencia})`)
    } catch (e) {
      console.log(`✗ ${id}: ${f.url}: ${e.message}`)
    }
    await new Promise((ok) => setTimeout(ok, 1500))
  }
  salida[id] = fotos
}

writeFileSync(archivoSalida, JSON.stringify(salida, null, 2) + '\n')

// Descarga fotos extra (la 2ª y 3ª de cada planta) desde Wikimedia Commons, solo licencias abiertas.
// Las guarda en public/img/extra/<id>-<n>.webp y anota la atribución en el archivo de salida.
//
// Uso: node scripts/descargar-extras.mjs <elegidas.json> <salida.json> [desde]
//   desde: número de la primera foto (por defecto 2, porque la 1 es la principal de plants.json).
//          Con 1, la primera foto de cada planta es la principal: queda en public/img/extra/<id>-1.webp.
//   elegidas.json: { "potus": ["File:Uno.jpg", "File:Dos.jpg"] }
//   salida.json:   { "potus": [{ archivo, autor, licencia, url }] }  (se pisa solo lo de las plantas pedidas)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const API = 'https://commons.wikimedia.org/w/api.php'
const UA = 'PlantitasImageScript/1.0 (educational houseplant PWA)'
const ANCHO = 800
const SALIDA = 'public/img/extra'
// CC0, dominio público, CC BY y CC BY-SA (cualquier versión). Nada de NC ni ND.
const LICENCIA_OK = /^(cc0|public domain|pd\b|cc[ -]by(-sa)?[ -]\d)/i

const [archivoElegidas, archivoSalida, desdeArg] = process.argv.slice(2)
const DESDE = Number(desdeArg ?? 2)
if (!archivoElegidas || !archivoSalida) throw new Error('Uso: node scripts/descargar-extras.mjs <elegidas.json> <salida.json>')

const limpiar = (html = '') =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

async function pedir(url, intento = 0) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (r.status === 429 && intento < 4) {
    await new Promise((ok) => setTimeout(ok, (Number(r.headers.get('retry-after')) || 5 * (intento + 1)) * 1000))
    return pedir(url, intento + 1)
  }
  if (!r.ok) throw new Error(`Commons respondió ${r.status}`)
  return r
}

async function porTitulo(titulo) {
  const url = `${API}?${new URLSearchParams({ format: 'json', origin: '*', action: 'query', titles: titulo, prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: String(ANCHO) })}`
  const d = await (await pedir(url)).json()
  const ii = Object.values(d.query?.pages ?? {})[0]?.imageinfo?.[0]
  if (!ii) return null
  const meta = ii.extmetadata ?? {}
  const licencia = limpiar(meta.LicenseShortName?.value)
  return { miniatura: ii.thumburl ?? ii.url, pagina: ii.descriptionurl, licencia, autor: limpiar(meta.Artist?.value) || 'Autor desconocido', ok: LICENCIA_OK.test(licencia) && /^image\/(jpeg|png|webp)$/.test(ii.mime) }
}

const elegidas = JSON.parse(readFileSync(archivoElegidas, 'utf8'))
const salida = existsSync(archivoSalida) ? JSON.parse(readFileSync(archivoSalida, 'utf8')) : {}
mkdirSync(SALIDA, { recursive: true })

for (const [id, titulos] of Object.entries(elegidas)) {
  const fotos = []
  for (const titulo of titulos) {
    try {
      const c = await porTitulo(titulo)
      if (!c) throw new Error('no existe en Commons')
      if (!c.ok) throw new Error(`licencia no permitida: ${c.licencia || 'sin dato'}`)
      const n = fotos.length + DESDE
      const original = Buffer.from(await (await pedir(c.miniatura)).arrayBuffer())
      await sharp(original).rotate().resize({ width: ANCHO, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`${SALIDA}/${id}-${n}.webp`)
      fotos.push({ archivo: `img/extra/${id}-${n}.webp`, autor: c.autor.slice(0, 120), licencia: c.licencia, url: c.pagina })
      console.log(`✓ ${id}-${n}  ←  ${titulo}  (${c.licencia})`)
    } catch (e) {
      console.log(`✗ ${id}: ${titulo}: ${e.message}`)
    }
    await new Promise((ok) => setTimeout(ok, 1500))
  }
  salida[id] = fotos
}

writeFileSync(archivoSalida, JSON.stringify(salida, null, 2) + '\n')

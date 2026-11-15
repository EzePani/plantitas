// Descarga una foto por planta desde Wikimedia Commons (solo licencias abiertas),
// la optimiza (webp, ancho máx. 800 px) en public/img/ y actualiza:
//   - src/data/plants.json  → campos "imagen" y "atribucion_imagen"
//   - src/data/credits.json → listado para la pantalla Créditos
//
// Uso:
//   node scripts/descargar-imagenes.mjs            descarga las que faltan
//   node scripts/descargar-imagenes.mjs --todo     vuelve a descargar todas
//   node scripts/descargar-imagenes.mjs potus jade solo esas plantas
//
// Para elegir a mano la foto de una planta, agregá su archivo de Commons en
// scripts/imagenes.json:  { "potus": "File:Epipremnum aureum 31082012.jpg" }
// Si una planta no está ahí, el script busca por nombre científico y toma el primer
// resultado con licencia permitida. Conviene revisar el resultado a ojo.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const API = 'https://commons.wikimedia.org/w/api.php'
const UA = 'PlantitasImageScript/1.0 (educational houseplant PWA)'
const ANCHO = 800
const PLANTAS = 'src/data/plants.json'
const CREDITOS = 'src/data/credits.json'
const ELEGIDAS = 'scripts/imagenes.json'
const SALIDA = 'public/img'

// CC0, dominio público, CC BY y CC BY-SA (cualquier versión). Nada de NC ni ND.
const LICENCIA_OK = /^(cc0|public domain|pd\b|cc[ -]by(-sa)?[ -]\d)/i

const args = process.argv.slice(2)
const todo = args.includes('--todo')
const soloIds = args.filter((a) => !a.startsWith('--'))

const limpiar = (html = '') =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`
  return (await pedir(url)).json()
}

/** fetch con reintentos: Commons responde 429 si se le pide muy seguido */
async function pedir(url, intento = 0) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (r.status === 429 && intento < 4) {
    const espera = (Number(r.headers.get('retry-after')) || 5 * (intento + 1)) * 1000
    await new Promise((ok) => setTimeout(ok, espera))
    return pedir(url, intento + 1)
  }
  if (!r.ok) throw new Error(`Commons respondió ${r.status}`)
  return r
}

const PROPS = { prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: String(ANCHO) }

function aCandidata(pagina) {
  const ii = pagina.imageinfo?.[0]
  if (!ii) return null
  const meta = ii.extmetadata ?? {}
  const licencia = limpiar(meta.LicenseShortName?.value)
  return {
    titulo: pagina.title,
    mime: ii.mime,
    ancho: ii.width,
    alto: ii.height,
    miniatura: ii.thumburl ?? ii.url,
    pagina: ii.descriptionurl,
    licencia,
    autor: limpiar(meta.Artist?.value) || 'Autor desconocido',
    ok: LICENCIA_OK.test(licencia) && /^image\/(jpeg|png|webp)$/.test(ii.mime),
  }
}

async function porTitulo(titulo) {
  const d = await api({ action: 'query', titles: titulo, ...PROPS })
  const pagina = Object.values(d.query?.pages ?? {})[0]
  return pagina ? aCandidata(pagina) : null
}

async function buscar(nombreCientifico) {
  const d = await api({
    action: 'query',
    generator: 'search',
    gsrnamespace: '6',
    gsrlimit: '20',
    gsrsearch: `${nombreCientifico} filetype:bitmap`,
    ...PROPS,
  })
  return Object.values(d.query?.pages ?? {})
    .sort((a, b) => a.index - b.index)
    .map(aCandidata)
    .filter((c) => c && c.ok && c.ancho >= ANCHO && c.ancho >= c.alto * 0.7)
}

const plantas = JSON.parse(readFileSync(PLANTAS, 'utf8'))
const elegidas = existsSync(ELEGIDAS) ? JSON.parse(readFileSync(ELEGIDAS, 'utf8')) : {}
mkdirSync(SALIDA, { recursive: true })

let hechas = 0
const fallidas = []

for (const p of plantas) {
  if (soloIds.length && !soloIds.includes(p.id)) continue
  const destino = `${SALIDA}/${p.id}.webp`
  if (!todo && !soloIds.length && p.imagen && existsSync(destino)) continue

  try {
    let c = null
    if (elegidas[p.id]) {
      c = await porTitulo(elegidas[p.id])
      if (c && !c.ok) throw new Error(`"${elegidas[p.id]}" tiene licencia no permitida: ${c.licencia || 'sin dato'}`)
    } else {
      // Sin "(sin. …)" ni aclaraciones: solo el binomio principal
      const nombre = p.nombre_cientifico.replace(/\(.*?\)/g, '').split(/[,/]/)[0].trim()
      c = (await buscar(nombre))[0] ?? null
    }
    if (!c) throw new Error('no encontré una foto con licencia abierta')

    const r = await pedir(c.miniatura)
    const original = Buffer.from(await r.arrayBuffer())
    await sharp(original).rotate().resize({ width: ANCHO, withoutEnlargement: true }).webp({ quality: 78 }).toFile(destino)

    p.imagen = `img/${p.id}.webp`
    p.atribucion_imagen = { autor: c.autor.slice(0, 120), licencia: c.licencia, url: c.pagina }
    hechas++
    console.log(`✓ ${p.id}  ←  ${c.titulo}  (${c.licencia}, ${c.autor.slice(0, 40)})`)
  } catch (e) {
    fallidas.push(p.id)
    console.log(`✗ ${p.id}: ${e.message}`)
  }
  // Sin apuro: no cargar de más a los servidores de Wikimedia
  await new Promise((ok) => setTimeout(ok, 2000))
}

writeFileSync(PLANTAS, JSON.stringify(plantas, null, 2) + '\n')
writeFileSync(
  CREDITOS,
  JSON.stringify(
    plantas.filter((p) => p.imagen && p.atribucion_imagen).map((p) => ({ id: p.id, planta: p.nombre_comun, archivo: p.imagen, ...p.atribucion_imagen })),
    null,
    2,
  ) + '\n',
)

console.log(`\n${hechas} imágenes descargadas. ${fallidas.length ? `Sin foto: ${fallidas.join(', ')} (quedan con el placeholder ilustrado).` : 'Ninguna quedó sin foto.'}`)

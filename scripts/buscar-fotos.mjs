// Lista candidatas de Wikimedia Commons para elegir una foto a mano.
// Uso: node scripts/buscar-fotos.mjs "Monstera deliciosa leaf"
// Copiá el título elegido a scripts/imagenes.json y corré descargar-imagenes.mjs <id>.
const q = process.argv.slice(2).join(' ')
const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ format: 'json', action: 'query', generator: 'search', gsrnamespace: '6', gsrlimit: '12', gsrsearch: `${q} filetype:bitmap`, prop: 'imageinfo', iiprop: 'extmetadata|size' })}`
const r = await fetch(url, { headers: { 'User-Agent': 'PlantitasImageScript/1.0 (educational houseplant PWA)' } })
if (!r.ok) throw new Error(`Commons respondió ${r.status}`)
const d = await r.json()
for (const p of Object.values(d.query?.pages ?? {}).sort((a, b) => a.index - b.index)) {
  const ii = p.imageinfo?.[0]
  console.log(`${p.title}  [${ii?.extmetadata?.LicenseShortName?.value ?? '?'}, ${ii?.width}x${ii?.height}]`)
}

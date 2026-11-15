// Arma SOURCES.md y VERIFY.md a partir del contenido (lecciones, catálogo, advertencias)
// y de las notas de investigación (investigacion/*-notas.json).
// Uso: node scripts/generar-fuentes.mjs
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

const leer = (ruta) => JSON.parse(readFileSync(ruta, 'utf8'))
const plantas = leer('src/data/plants.json')
const peligrosas = existsSync('src/data/peligrosas.json') ? leer('src/data/peligrosas.json') : []
const lecciones = readdirSync('src/data/lessons')
  .filter((f) => f.endsWith('.json'))
  .flatMap((f) => leer(`src/data/lessons/${f}`))
const notas = readdirSync('investigacion')
  .filter((f) => f.endsWith('-notas.json'))
  .map((f) => leer(`investigacion/${f}`))

// url → { org, titulo, url, fecha, que: Set, usado: Set }
const fuentes = new Map()
function registrar(f, usadoEn, que) {
  if (!f?.url) return
  const x = fuentes.get(f.url) ?? { org: f.org, titulo: f.titulo, url: f.url, fecha: f.fecha_consulta, que: new Set(), usado: new Set() }
  if (usadoEn) x.usado.add(usadoEn)
  if (que) x.que.add(que)
  fuentes.set(f.url, x)
}
for (const l of lecciones) for (const f of l.fuentes) registrar(f, `lección ${l.id}`)
for (const p of plantas) {
  for (const f of p.fuentes) registrar(f, `planta ${p.id} (cuidados)`)
  for (const f of p.mascotas.fuentes_toxicidad) registrar(f, `planta ${p.id} (toxicidad)`)
}
for (const x of peligrosas) for (const f of x.fuentes) registrar(f, `advertencia ${x.id}`)
// Las notas aportan el "qué se tomó"; solo se listan las fuentes que quedaron citadas en el contenido
for (const n of notas) for (const f of n.fuentes ?? []) if (fuentes.has(f.url) && f.que_se_tomo) fuentes.get(f.url).que.add(f.que_se_tomo)

const porOrg = new Map()
for (const f of fuentes.values()) porOrg.set(f.org, [...(porOrg.get(f.org) ?? []), f])
const orgs = [...porOrg].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))

const cuenta = (lista, c) => lista.filter((x) => x.confianza === c).length
let s = `# Fuentes de Plantitas

Generado con \`node scripts/generar-fuentes.mjs\`. No editar a mano: se pisa.

Todo el contenido educativo sale de las fuentes listadas acá. Cada una fue abierta y leída durante la investigación (fecha de consulta en cada entrada). Los textos de la app están parafraseados.

## Niveles de confianza

- **alta**: 2 o más fuentes institucionales coinciden.
- **media**: 1 fuente institucional más consenso práctico, o instituciones que coinciden con matices.
- **baja**: poca evidencia. En la app se muestra con aviso. Todo lo de confianza baja está en [VERIFY.md](VERIFY.md).

| Contenido | Total | Alta | Media | Baja |
| --- | --- | --- | --- | --- |
| Lecciones | ${lecciones.length} | ${cuenta(lecciones, 'alta')} | ${cuenta(lecciones, 'media')} | ${cuenta(lecciones, 'baja')} |
| Plantas (cuidados) | ${plantas.length} | ${cuenta(plantas, 'alta')} | ${cuenta(plantas, 'media')} | ${cuenta(plantas, 'baja')} |
| Plantas (toxicidad) | ${plantas.length} | ${cuenta(plantas.map((p) => p.mascotas), 'alta')} | ${cuenta(plantas.map((p) => p.mascotas), 'media')} | ${cuenta(plantas.map((p) => p.mascotas), 'baja')} |
| Advertencias graves | ${peligrosas.length} | ${cuenta(peligrosas, 'alta')} | ${cuenta(peligrosas, 'media')} | ${cuenta(peligrosas, 'baja')} |

## Confianza por ítem

### Lecciones
| Lección | Título | Confianza | Fuentes |
| --- | --- | --- | --- |
${lecciones.map((l) => `| ${l.id} | ${l.titulo} | ${l.confianza}${l.estado ? ' (no verificado)' : ''} | ${l.fuentes.length} |`).join('\n')}

### Plantas
| Planta | Cuidados | Toxicidad (gato / perro) | Confianza toxicidad | Fuentes |
| --- | --- | --- | --- | --- |
${plantas.map((p) => `| ${p.nombre_comun} (*${p.nombre_cientifico}*) | ${p.confianza} | ${p.mascotas.toxicidad_gato} / ${p.mascotas.toxicidad_perro} | ${p.mascotas.confianza} | ${new Set([...p.fuentes, ...p.mascotas.fuentes_toxicidad].map((f) => f.url)).size} |`).join('\n')}

## Fuentes por organización (${fuentes.size} en total)
`
for (const [org, lista] of orgs) {
  s += `\n### ${org}\n\n`
  for (const f of lista.sort((a, b) => a.titulo.localeCompare(b.titulo))) {
    s += `- [${f.titulo}](${f.url}) · consultada el ${f.fecha}\n`
    if (f.que.size) s += `  - Qué se tomó: ${[...f.que].join(' / ')}\n`
    s += `  - Usada en: ${[...f.usado].join(', ')}\n`
  }
}
writeFileSync('SOURCES.md', s)

// ---------- VERIFY.md ----------
const items = []
const agregar = (id, dato, motivo, urls = []) => items.push({ id, dato, motivo, urls })
for (const n of notas) for (const r of n.revisar ?? []) agregar(r.id, r.dato, r.motivo, r.fuentes ?? [])
for (const l of lecciones) if (l.confianza === 'baja' || l.estado) agregar(l.id, 'lección completa', `Confianza ${l.confianza}${l.estado ? ', marcada como no verificada' : ''}.`)
for (const p of plantas) {
  for (const e of ['gato', 'perro']) if (p.mascotas[`toxicidad_${e}`] === 'no_verificada') agregar(p.id, `toxicidad_${e}`, 'Sin fuente veterinaria: figura como "no verificada" y la app la trata como no apta.')
  if (p.mascotas.confianza === 'baja') agregar(p.id, 'toxicidad', 'Confianza baja en el dato de mascotas.')
  for (const k of ['luz', 'riego', 'humedad', 'sustrato']) if (p[k].confianza === 'baja') agregar(p.id, k, 'Confianza baja.')
  for (const d of p.discrepancias) agregar(p.id, 'fuentes en conflicto', d)
}
const vistos = new Set()
const unicos = items.filter((i) => {
  const k = `${i.id}|${i.dato}|${i.motivo}`
  if (vistos.has(k)) return false
  vistos.add(k)
  return true
})
const porId = new Map()
for (const i of unicos) porId.set(i.id, [...(porId.get(i.id) ?? []), i])
const noAbiertos = [...new Set(notas.flatMap((n) => n.no_pude_abrir ?? []))]
const adaptaciones = plantas.filter((p) => p.adaptaciones.length)

let v = `# Para revisar a mano

Generado con \`node scripts/generar-fuentes.mjs\`. No editar a mano: se pisa.

Acá está todo lo que quedó con confianza baja, sin verificar o con fuentes en conflicto (${unicos.length} puntos en ${porId.size} ítems). Mientras no se revise, la app aplica el criterio más conservador.

`
for (const [id, lista] of [...porId].sort((a, b) => a[0].localeCompare(b[0]))) {
  v += `## ${id}\n\n`
  for (const i of lista) {
    v += `- [ ] **${i.dato}**: ${i.motivo}\n`
    for (const u of i.urls) v += `  - ${u}\n`
  }
  v += '\n'
}
v += `## Adaptaciones al hemisferio sur\n\nDatos convertidos desde fuentes del hemisferio norte (orientación de ventanas, meses). Conviene mirarlos con ojo local.\n\n`
for (const p of adaptaciones) v += `- **${p.id}**: ${p.adaptaciones.join(' / ')}\n`
if (noAbiertos.length) v += `\n## Sitios que no se pudieron abrir durante la investigación\n\n${noAbiertos.map((u) => `- ${u}`).join('\n')}\n`
writeFileSync('VERIFY.md', v)

console.log(`SOURCES.md: ${fuentes.size} fuentes de ${orgs.length} organizaciones. VERIFY.md: ${unicos.length} puntos para revisar.`)

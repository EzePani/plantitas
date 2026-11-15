// Comprueba que el marcado **negrita** no cambió ningún texto de las lecciones:
// sin los asteriscos, cada campo tiene que ser idéntico al de git HEAD.
import { execSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'

const quitar = (s) => s.replaceAll('**', '')
let mal = 0
let total = 0
const recorrer = (a, b, ruta) => {
  if (typeof a === 'string' && typeof b === 'string') {
    if (quitar(a) !== b) { mal++; console.log(`✗ ${ruta}\n   antes:   ${b}\n   después: ${a}`) }
    if ((a.match(/\*\*/g) ?? []).length % 2) { mal++; console.log(`✗ ${ruta}: asteriscos sin cerrar`) }
    if (a.includes('**')) total++
  } else if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) { mal++; console.log(`✗ ${ruta}: cambió la cantidad de elementos`) }
    a.forEach((x, i) => recorrer(x, b[i], `${ruta}[${i}]`))
  } else if (a && b && typeof a === 'object') {
    for (const k of Object.keys(b)) recorrer(a[k], b[k], `${ruta}.${k}`)
  } else if (a !== b) { mal++; console.log(`✗ ${ruta}: cambió`) }
}
for (const f of readdirSync('src/data/lessons').filter((x) => x.endsWith('.json'))) {
  const ruta = `src/data/lessons/${f}`
  const antes = JSON.parse(execSync(`git show HEAD:${ruta}`, { encoding: 'utf8', maxBuffer: 1e8 }))
  recorrer(JSON.parse(readFileSync(ruta, 'utf8')), antes, f)
}
console.log(mal ? `\n${mal} problemas` : `OK: ${total} textos con negrita, ninguno alterado`)
process.exit(mal ? 1 : 0)

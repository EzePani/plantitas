/** Fecha local en formato AAAA-MM-DD */
export function hoyLocal(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}

/** Días calendario entre dos fechas AAAA-MM-DD (b - a) */
export function diasEntre(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000)
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** "14 nov"; lleva el año solo si no es el de `hoy` ("14 nov 2025") */
export function fechaCorta(f: string, hoy: string = hoyLocal()): string {
  const [a, m, d] = f.split('-').map(Number)
  return `${d} ${MESES[m - 1]}${f.slice(0, 4) === hoy.slice(0, 4) ? '' : ` ${a}`}`
}

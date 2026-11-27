import { T } from '../../data/textos'
import { abrirCopia, contenido, leerCopias } from '../../lib/copias'
import { fechaCorta, hoyLocal } from '../../lib/fecha'
import type { DatosPersistidos } from '../../lib/tipos'

const P = T.perfil.copias

/** "27 nov, 12:18" en la hora del dispositivo */
function cuando(iso: string): string {
  const d = new Date(iso)
  return `${fechaCorta(hoyLocal(d))}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Las copias que la app fue guardando sola en este dispositivo, para volver atrás */
export function Copias({ onElegir }: { onElegir: (d: DatosPersistidos) => void }) {
  const copias = leerCopias().flatMap((c) => {
    const datos = abrirCopia(c)
    return datos ? [{ ...c, datos }] : []
  })
  if (copias.length === 0) return null
  return (
    <div className="mt-5">
      <h3 className="font-display text-tinta m-0 text-[18px] font-semibold">{P.titulo}</h3>
      <p className="text-tinta-suave m-0 mt-0.5 mb-2 text-[14px] leading-snug font-bold">{P.ayuda}</p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {copias.map((c) => {
          const { espacios, plantas, guardia } = contenido(c.datos)
          return (
            <li key={c.fecha + c.motivo} className="border-arena-osc flex items-center gap-3 rounded-2xl border-2 bg-white py-2 pr-2 pl-3.5">
              <span className="min-w-0 flex-1">
                <span className="text-tinta block text-[15px] leading-tight font-extrabold">{cuando(c.fecha)}</span>
                <span className="text-tinta-suave block text-[13px] leading-tight font-bold">{P.motivo[c.motivo]}</span>
                <span className="text-tinta block text-[13px] leading-snug font-bold">{P.contiene(espacios, plantas, guardia)}</span>
              </span>
              <button
                type="button"
                onClick={() => onElegir(c.datos)}
                className="border-arena-osc text-hoja-osc min-h-11 shrink-0 rounded-full border-2 bg-white px-3.5 text-[14px] font-extrabold"
              >
                {P.recuperar}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

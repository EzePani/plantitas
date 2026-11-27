import { BookOpen, Check, ChevronDown, X } from 'lucide-react'
import { useState } from 'react'
import { CAUSA, TG } from '../../data/textosGuardia'
import type { CausaId } from '../../lib/tipos'
import { ayuda, titulo } from './comunes'

/** Las causas posibles, la más probable abierta, con qué hacer y qué no */
export function Causas({ causas, onGuia }: { causas: CausaId[]; onGuia: (entrada: string) => void }) {
  const [abierta, setAbierta] = useState<CausaId | null>(causas[0])
  return (
    <div className="flex flex-col gap-2.5">
      {causas.map((id, i) => {
        const c = CAUSA[id]
        const ver = abierta === id
        return (
          <section key={id} className={`rounded-3xl border-2 bg-white ${ver ? 'border-hoja' : 'border-arena-osc'}`}>
            <button type="button" aria-expanded={ver} onClick={() => setAbierta(ver ? null : id)} className="flex min-h-14 w-full items-center gap-2 border-0 bg-transparent p-3 text-left">
              <span className="flex-1">
                {causas.length > 1 && <span className="text-hoja-osc block text-[12px] font-extrabold tracking-wide uppercase">{i === 0 ? TG.masProbable : TG.tambien}</span>}
                <span className={`${titulo} block leading-tight`}>{c.nombre}</span>
              </span>
              <ChevronDown size={20} className={`text-tinta-suave shrink-0 transition-transform ${ver ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {ver && (
              <div className="flex flex-col gap-2.5 px-3 pb-3">
                <p className="text-tinta m-0 text-[15px] leading-snug font-bold">{c.porque}</p>
                {(
                  [
                    [TG.hacer, c.hacer, Check, 'bg-brote text-hoja-osc'],
                    [TG.evitar, c.evitar, X, 'bg-alerta-clara text-alerta'],
                  ] as const
                ).map(([encabezado, lineas, Icono, tono]) => (
                  <div key={encabezado} className={`rounded-2xl p-2.5 ${tono}`}>
                    <h3 className="m-0 mb-1 text-[14px] font-extrabold">{encabezado}</h3>
                    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                      {lineas.map((l) => (
                        <li key={l} className="text-tinta flex items-start gap-2 text-[14px] leading-snug font-bold">
                          <Icono size={16} strokeWidth={3.5} className={`mt-0.5 shrink-0 ${Icono === X ? 'text-alerta' : 'text-hoja-osc'}`} aria-hidden />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {c.guia && (
                  <button type="button" onClick={() => onGuia(c.guia!)} className="text-hoja-osc flex min-h-11 items-center gap-2 self-start border-0 bg-transparent p-0 text-[14px] font-extrabold underline">
                    <BookOpen size={16} aria-hidden />
                    {TG.guia}
                  </button>
                )}
              </div>
            )}
          </section>
        )
      })}
      <p className={ayuda}>{TG.orientacion}</p>
    </div>
  )
}

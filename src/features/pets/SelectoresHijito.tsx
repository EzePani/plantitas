import { Scissors, Sprout } from 'lucide-react'
import { TC } from '../../data/textosCatalogo'
import { vibrar } from '../../lib/haptics'
import type { Hijito } from '../../lib/tipos'

const H = TC.plantas.hijitos

/** "¿Cómo la sacaste?": un pedacito sin raíces (hijito) o una planta que salió con raíces (separada) */
export function SelectorOrigen({ valor, onCambio }: { valor: Hijito['origen'] | null; onCambio: (o: Hijito['origen']) => void }) {
  return (
    <div className="flex flex-col gap-2" role="group" aria-label={H.comoSaco}>
      {(['corte', 'separada'] as const).map((o) => {
        const I = o === 'corte' ? Scissors : Sprout
        const elegido = valor === o
        return (
          <button
            key={o}
            type="button"
            aria-pressed={elegido}
            onClick={() => {
              vibrar('toque')
              onCambio(o)
            }}
            className={`flex min-h-16 w-full items-center gap-3 rounded-3xl border-2 p-3 text-left ${elegido ? 'border-hoja bg-brote' : 'border-arena-osc bg-white'}`}
          >
            <span className={`grid size-10 shrink-0 place-items-center rounded-full ${elegido ? 'bg-hoja text-white' : 'bg-arena text-tinta'}`}>
              <I size={19} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="text-tinta block text-[16px] leading-tight font-extrabold">{H.origen[o].titulo}</span>
              <span className="text-tinta-suave mt-0.5 block text-[13px] leading-snug font-bold">{H.origen[o].ayuda}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function SelectorMedio({ valor, onCambio }: { valor: Hijito['medio']; onCambio: (m: Hijito['medio']) => void }) {
  return (
    <div className="flex gap-2">
      {(['agua', 'tierra'] as const).map((m) => (
        <button key={m} type="button" aria-pressed={valor === m} onClick={() => onCambio(m)} className={`min-h-11 flex-1 rounded-full border-2 text-[15px] font-extrabold ${valor === m ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-tinta bg-white'}`}>
          {H.medio[m]}
        </button>
      ))}
    </div>
  )
}

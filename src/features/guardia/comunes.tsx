import { TG } from '../../data/textosGuardia'
import { vibrar } from '../../lib/haptics'

export const titulo = 'font-display text-tinta m-0 text-[18px] font-semibold'
export const ayuda = 'text-tinta-suave m-0 text-[14px] leading-snug font-bold'
export const fila = 'border-arena-osc text-tinta flex min-h-14 w-full items-center gap-3 rounded-3xl border-2 bg-white p-3 text-left'

/** Botones para elegir una o varias opciones */
export function Opciones<T extends string>({ valores, textos, elegidas, columnas = 2, onElegir }: { valores: readonly T[]; textos: Record<T, string>; elegidas: readonly T[]; columnas?: 2 | 3; onElegir: (v: T) => void }) {
  return (
    <div className={`grid gap-2 ${columnas === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {valores.map((v) => {
        const on = elegidas.includes(v)
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            onClick={() => {
              vibrar('toque')
              onElegir(v)
            }}
            className={`min-h-12 rounded-2xl border-2 px-2 py-1.5 text-[15px] leading-tight font-extrabold ${on ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-tinta bg-white'}`}
          >
            {textos[v]}
          </button>
        )
      })}
    </div>
  )
}

export function Notas({ valor, onCambio, etiqueta = TG.notas }: { valor: string; onCambio: (v: string) => void; etiqueta?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={titulo}>{etiqueta}</span>
      <textarea
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        maxLength={300}
        rows={3}
        placeholder={TG.notasEjemplo}
        className="border-arena-osc text-tinta focus:border-hoja w-full resize-none rounded-2xl border-2 bg-white p-3 text-[16px] font-bold outline-none"
        style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
      />
    </label>
  )
}

/** Al montarse, vuelve arriba la pantalla que lo contiene: cada paso empieza desde el principio */
export const alTope = (el: HTMLElement | null) => {
  if (el?.parentElement) el.parentElement.scrollTop = 0
}

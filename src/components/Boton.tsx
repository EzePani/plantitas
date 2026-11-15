import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { vibrar } from '../lib/haptics'

type Variante = 'primario' | 'secundario' | 'sol' | 'alerta' | 'fantasma'

const ESTILOS: Record<Variante, { clase: string; relieve: string }> = {
  primario: { clase: 'bg-hoja text-white', relieve: 'var(--color-hoja-osc)' },
  secundario: { clase: 'bg-white text-tinta border-2 border-arena-osc', relieve: 'var(--color-arena-osc)' },
  sol: { clase: 'bg-sol text-tinta', relieve: 'var(--color-sol-osc)' },
  alerta: { clase: 'bg-alerta text-white', relieve: '#8f2c1d' },
  fantasma: { clase: 'bg-transparent text-hoja-osc', relieve: 'transparent' },
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  ancho?: boolean
}

/** Botón grande con relieve y efecto de presión */
export function Boton({ variante = 'primario', ancho = true, className = '', onClick, children, ...resto }: Props) {
  const e = ESTILOS[variante]
  return (
    <button
      {...resto}
      onClick={(ev) => {
        vibrar('toque')
        onClick?.(ev)
      }}
      style={{ '--relieve': e.relieve } as CSSProperties}
      className={`relieve font-display min-h-13 rounded-2xl px-5 text-[17px] font-semibold tracking-wide disabled:cursor-not-allowed disabled:opacity-45 ${ancho ? 'w-full' : ''} ${e.clase} ${className}`}
    >
      {children}
    </button>
  )
}

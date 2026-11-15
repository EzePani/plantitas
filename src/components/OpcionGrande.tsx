import type { CSSProperties, ReactNode } from 'react'
import { vibrar } from '../lib/haptics'
import { Icono } from './Icono'

interface Props {
  texto: string
  icono?: string
  elegida?: boolean
  onClick: () => void
  compacta?: boolean
  derecha?: ReactNode
}

/** Tarjeta de opción táctil (onboarding, ajustes de mascotas) */
export function OpcionGrande({ texto, icono, elegida, onClick, compacta, derecha }: Props) {
  return (
    <button
      type="button"
      aria-pressed={elegida}
      onClick={() => {
        vibrar('toque')
        onClick()
      }}
      style={{ '--relieve': elegida ? 'var(--color-hoja)' : 'var(--color-arena-osc)' } as CSSProperties}
      className={`relieve flex w-full items-center gap-3 rounded-2xl border-2 text-left font-bold ${
        compacta ? 'min-h-12 px-3 py-2 text-[15px]' : 'min-h-16 px-4 py-3 text-[17px]'
      } ${elegida ? 'border-hoja bg-brote text-hoja-osc' : 'border-arena-osc bg-white text-tinta'}`}
    >
      {icono && (
        <span className={`grid shrink-0 place-items-center rounded-xl ${compacta ? 'size-8' : 'size-11'} ${elegida ? 'bg-hoja text-white' : 'bg-arena text-hoja-osc'}`}>
          <Icono nombre={icono} size={compacta ? 18 : 24} />
        </span>
      )}
      <span className="flex-1 leading-tight">{texto}</span>
      {derecha}
    </button>
  )
}

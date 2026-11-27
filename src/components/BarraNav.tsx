import { motion } from 'framer-motion'
import { Armchair, LeafyGreen, Map, Stethoscope, User, type LucideIcon } from 'lucide-react'
import { T } from '../data/textos'
import { TG } from '../data/textosGuardia'
import { pendientes } from '../lib/guardia'
import { vibrar } from '../lib/haptics'
import { useHoy } from '../lib/useHoy'
import { useStore } from '../store/useStore'

export type Pestana = 'aprender' | 'plantas' | 'espacio' | 'guardia' | 'perfil'

const PESTANAS: { id: Pestana; icono: LucideIcon }[] = [
  { id: 'aprender', icono: Map },
  { id: 'plantas', icono: LeafyGreen },
  { id: 'espacio', icono: Armchair },
  { id: 'guardia', icono: Stethoscope },
  { id: 'perfil', icono: User },
]

export function BarraNav({ activa, onCambiar }: { activa: Pestana; onCambiar: (p: Pestana) => void }) {
  const casos = useStore((s) => s.casos)
  const tocan = pendientes(casos, useHoy()).length > 0
  return (
    <nav className="safe-bottom border-arena-osc relative z-20 shrink-0 border-t-2 bg-white" aria-label="Secciones">
      <ul className="m-0 flex list-none p-0">
        {PESTANAS.map(({ id, icono: I }) => {
          const on = id === activa
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                aria-current={on ? 'page' : undefined}
                onClick={() => {
                  vibrar('toque')
                  onCambiar(id)
                }}
                className={`relative flex min-h-16 w-full flex-col items-center justify-center gap-0.5 border-0 bg-transparent pt-1 text-[12px] font-extrabold ${on ? 'text-hoja-osc' : 'text-tinta-suave'}`}
              >
                {on && <motion.span layoutId="pastilla-nav" className="bg-brote absolute top-1.5 h-9 w-16 rounded-full" transition={{ type: 'spring', damping: 26, stiffness: 340 }} />}
                <I size={24} strokeWidth={on ? 2.8 : 2.2} className="relative" aria-hidden />
                <span className="relative">{T.nav[id]}</span>
                {id === 'guardia' && tocan && (
                  <span className="bg-alerta absolute top-2 left-1/2 ml-2.5 size-2.5 rounded-full border border-white">
                    <span className="sr-only">{TG.pendiente}</span>
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

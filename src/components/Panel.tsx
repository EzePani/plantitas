import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { TC } from '../data/textosCatalogo'
import { useAtras } from '../lib/useAtras'

/** Pantalla que entra deslizando desde la derecha por encima de la pestaña actual */
export function Panel({ abierto, titulo, onCerrar, children, pie }: { abierto: boolean; titulo?: string; onCerrar: () => void; children: ReactNode; pie?: ReactNode }) {
  useAtras(abierto, onCerrar)
  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="bg-crema safe-top absolute inset-0 z-30 flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        >
          <header className="flex h-14 shrink-0 items-center gap-1 px-2">
            <button type="button" onClick={onCerrar} aria-label={TC.volver} className="text-tinta-suave grid size-11 place-items-center rounded-full border-0 bg-transparent">
              <ChevronLeft size={28} strokeWidth={2.6} />
            </button>
            {titulo && <h1 className="font-display text-hoja-osc m-0 text-[22px] font-semibold">{titulo}</h1>}
          </header>
          <div className="scroll-app min-h-0 flex-1">{children}</div>
          {pie && <footer className="shrink-0 px-5 pt-2 pb-4">{pie}</footer>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

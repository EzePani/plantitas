import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useAtras } from '../lib/useAtras'

/** Bottom sheet: se desliza desde abajo, se cierra tocando afuera o arrastrando hacia abajo */
export function HojaInferior({ abierta, onCerrar, children }: { abierta: boolean; onCerrar: () => void; children: ReactNode }) {
  useAtras(abierta, onCerrar)
  return (
    <AnimatePresence>
      {abierta && (
        <div className="absolute inset-0 z-40 flex items-end">
          <motion.button
            aria-label="Cerrar"
            className="absolute inset-0 bg-selva/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCerrar}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="safe-bottom relative w-full rounded-t-[32px] bg-crema px-5 pt-3 shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 600) onCerrar()
            }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-arena-osc" />
            <div className="pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

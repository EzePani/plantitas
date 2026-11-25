import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useAtras } from '../lib/useAtras'

/** Modal centrado para confirmaciones */
export function Dialogo({ abierto, titulo, texto, onCerrar, children }: { abierto: boolean; titulo: string; texto?: string; onCerrar: () => void; children: ReactNode }) {
  useAtras(abierto, onCerrar)
  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="absolute inset-0 z-50 grid place-items-center bg-selva/60 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={titulo}
            className="w-full rounded-[28px] bg-crema p-6 text-center shadow-2xl"
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <h2 className="font-display text-tinta text-[22px] leading-tight font-semibold">{titulo}</h2>
            {texto && <p className="text-tinta-suave mt-2 text-[15px] leading-snug font-semibold">{texto}</p>}
            <div className="mt-5 flex flex-col gap-3">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

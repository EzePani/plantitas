import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Ilustracion, ZONAS } from '../../components/Ilustracion'
import { Rico } from '../../components/Rico'
import type { Tarjeta } from '../../data/lessons'
import { T } from '../../data/textos'
import { vibrar } from '../../lib/haptics'

const CHIP: Record<Tarjeta['tipo'], string> = {
  concepto: 'bg-brote text-hoja-osc',
  por_que: 'bg-sol-claro text-sol-osc',
  dato_ba: 'bg-agua-clara text-agua',
  comparativa: 'bg-terracota-clara text-terracota-osc',
  tactil: 'bg-brote text-hoja-osc',
}

export function TarjetaVista({ tarjeta }: { tarjeta: Tarjeta }) {
  const [zona, setZona] = useState<string | null>(null)

  let imagen: React.ReactNode
  if (tarjeta.tipo === 'comparativa') {
    imagen = (
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            [tarjeta.imagen_mal, T.leccion.mal, 'bg-alerta', X],
            [tarjeta.imagen_bien, T.leccion.bien, 'bg-hoja', Check],
          ] as const
        ).map(([img, etiqueta, color, I]) => (
          <figure key={etiqueta} className="m-0">
            <Ilustracion nombre={img} className="w-full rounded-3xl" />
            <figcaption className={`mx-auto -mt-4 flex w-fit items-center gap-1 rounded-full px-3 py-1 text-[13px] font-extrabold text-white ${color} relative`}>
              <I size={15} strokeWidth={3.4} aria-hidden />
              {etiqueta}
            </figcaption>
          </figure>
        ))}
      </div>
    )
  } else if (tarjeta.tipo === 'tactil') {
    const posiciones = ZONAS[tarjeta.imagen] ?? {}
    const activa = tarjeta.zonas.find((z) => z.id === zona)
    imagen = (
      <div>
        <div className="relative">
          <Ilustracion nombre={tarjeta.imagen} className="w-full rounded-3xl" />
          {tarjeta.zonas.map((z) => {
            const p = posiciones[z.id]
            if (!p) return null
            const on = zona === z.id
            return (
              <button
                key={z.id}
                type="button"
                aria-label={z.etiqueta}
                aria-pressed={on}
                onClick={() => {
                  vibrar('toque')
                  setZona(z.id)
                }}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-0 bg-transparent"
              >
                <motion.span
                  className={`block size-6 rounded-full border-[3px] border-white shadow-md ${on ? 'bg-sol' : 'bg-terracota'}`}
                  animate={on ? { scale: 1.15 } : { scale: [1, 1.25, 1] }}
                  transition={on ? {} : { repeat: Infinity, duration: 1.6 }}
                />
              </button>
            )
          })}
        </div>
        <div className="border-arena-osc mt-3 min-h-18 rounded-2xl border-2 bg-white p-3" aria-live="polite">
          <AnimatePresence mode="wait">
            {activa ? (
              <motion.div key={activa.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="font-display text-hoja-osc text-[17px] font-semibold">{activa.etiqueta}</div>
                <div className="text-tinta text-[15px] leading-snug font-medium"><Rico texto={activa.texto} /></div>
              </motion.div>
            ) : (
              <motion.div key="vacio" className="text-tinta-suave py-2 text-center text-[15px] font-extrabold" exit={{ opacity: 0 }}>
                {T.leccion.tocaParte}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  } else {
    imagen = <Ilustracion nombre={tarjeta.imagen} className="w-full rounded-3xl" />
  }

  return (
    <article className="flex flex-col gap-4">
      <span className={`w-fit rounded-full px-3 py-1 text-[13px] font-extrabold tracking-wide uppercase ${CHIP[tarjeta.tipo]}`}>
        {T.leccion.tipos[tarjeta.tipo]}
      </span>
      {imagen}
      <p className="text-tinta m-0 text-[20px] leading-snug font-medium"><Rico texto={tarjeta.texto} /></p>
    </article>
  )
}

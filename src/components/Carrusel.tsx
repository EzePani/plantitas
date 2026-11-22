import { useRef, useState } from 'react'
import type { Planta } from '../data/plantas'
import { TC } from '../data/textosCatalogo'
import { FotoPlanta } from './FotoPlanta'

/** Fotos de la ficha: la principal y las extra, deslizando con el dedo. Con una sola foto queda igual que antes. */
export function Carrusel({ planta, className = '' }: { planta: Planta; className?: string }) {
  const [actual, setActual] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const extras = planta.imagen ? planta.fotos_extra : []
  if (extras.length === 0) return <FotoPlanta planta={planta} className={`aspect-[4/3] rounded-3xl ${className}`} />
  const total = extras.length + 1
  const ir = (i: number) => ref.current?.scrollTo({ left: i * ref.current.clientWidth, behavior: 'smooth' })
  return (
    <div className={className} role="group" aria-roledescription="carrusel" aria-label={planta.nombre_comun}>
      <div
        ref={ref}
        onScroll={(e) => setActual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <FotoPlanta planta={planta} className="aspect-[4/3] w-full shrink-0 snap-center" />
        {extras.map((f, i) => (
          <div key={f.archivo} className="bg-arena aspect-[4/3] w-full shrink-0 snap-center">
            <img src={`${import.meta.env.BASE_URL}${f.archivo}`} alt={`${planta.nombre_comun}: ${TC.plantas.fotos.de(i + 2, total)}`} loading="lazy" draggable={false} className="size-full object-cover" />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center">
        {Array.from({ length: total }, (_, i) => (
          <button key={i} type="button" aria-label={TC.plantas.fotos.de(i + 1, total)} aria-current={i === actual} onClick={() => ir(i)} className="grid size-7 place-items-center border-0 bg-transparent p-0">
            <span className={`block h-2 rounded-full transition-all ${i === actual ? 'bg-hoja w-5' : 'bg-arena-osc w-2'}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

import { Flower2, Leaf, Sprout, TreePalm, Droplets, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { Planta } from '../data/plantas'

const POR_GRUPO: Record<Planta['grupo'], { icono: LucideIcon; fondo: string; color: string }> = {
  follaje_tropical: { icono: Leaf, fondo: '#dff1cf', color: '#2f7d4a' },
  suculenta_cactus: { icono: Sprout, fondo: '#f1e7d0', color: '#7a9a3a' },
  amiga_humedad: { icono: Droplets, fondo: '#d8edf6', color: '#2a6a8c' },
  con_flor: { icono: Flower2, fondo: '#f6d9c8', color: '#b0567d' },
  palmera: { icono: TreePalm, fondo: '#e4f2d6', color: '#1f5a36' },
}

/** Foto de la planta (con skeleton mientras carga) o, si todavía no hay, un placeholder ilustrado */
export function FotoPlanta({ planta, className = '' }: { planta: Planta; className?: string }) {
  const [cargada, setCargada] = useState(false)
  const [fallo, setFallo] = useState(false)
  const g = POR_GRUPO[planta.grupo]
  const I = g.icono
  if (!planta.imagen || fallo) {
    return (
      <div className={`grid place-items-center ${className}`} style={{ background: g.fondo, color: g.color }} role="img" aria-label={planta.nombre_comun}>
        <I className="size-2/5" strokeWidth={1.8} aria-hidden />
      </div>
    )
  }
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: g.fondo }}>
      {!cargada && <div className="skeleton absolute inset-0 rounded-none" />}
      <img
        src={`${import.meta.env.BASE_URL}${planta.imagen}`}
        alt={planta.nombre_comun}
        loading="lazy"
        draggable={false}
        onLoad={() => setCargada(true)}
        onError={() => setFallo(true)}
        className={`size-full object-cover transition-opacity duration-300 ${cargada ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

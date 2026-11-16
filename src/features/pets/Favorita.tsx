import { Check, Heart, TriangleAlert, X } from 'lucide-react'
import type { Planta } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { vibrar } from '../../lib/haptics'
import { calceEnEspacio } from '../../lib/recomendador'
import { useStore } from '../../store/useStore'

const F = TC.plantas.favoritas

/** Corazón para marcar una planta. Es un botón aparte: nunca va adentro de otro botón. */
export function BotonFavorita({ planta, className = '' }: { planta: Planta; className?: string }) {
  const marcada = useStore((s) => s.favoritas.includes(planta.id))
  const alternar = useStore((s) => s.alternarFavorita)
  return (
    <button
      type="button"
      aria-pressed={marcada}
      aria-label={marcada ? F.quitar(planta.nombre_comun) : F.agregar(planta.nombre_comun)}
      onClick={() => {
        vibrar('toque')
        alternar(planta.id)
      }}
      className={`grid size-11 shrink-0 place-items-center rounded-full border-0 bg-transparent active:scale-90 ${marcada ? 'text-alerta' : 'text-tinta-suave'} ${className}`}
    >
      <Heart size={24} strokeWidth={2.4} fill={marcada ? 'currentColor' : 'none'} aria-hidden />
    </button>
  )
}

/** Una línea por espacio cargado: dónde le va bien a esta planta y dónde no */
export function CalceEspacios({ planta, compacto }: { planta: Planta; compacto?: boolean }) {
  const espacios = useStore((s) => s.espacios)
  const C = F.calce
  if (espacios.length === 0) return compacto ? null : <p className="text-tinta-suave m-0 text-[14px] leading-snug font-bold">{C.sinEspacios}</p>
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {espacios.map((e) => {
        const c = calceEnEspacio(planta, e)
        const Icono = c.nivel === 'bien' ? Check : c.nivel === 'con_ajuste' ? TriangleAlert : X
        const color = c.nivel === 'bien' ? 'text-hoja-osc' : c.nivel === 'con_ajuste' ? 'text-[#7a5200]' : 'text-alerta'
        const texto = c.nivel === 'no' ? C.no[c.motivo] : C[c.nivel]
        return (
          <li key={e.id} className={`flex items-start gap-1.5 text-[14px] leading-snug font-bold ${color}`}>
            <Icono size={16} strokeWidth={3} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              <span className="font-extrabold">{e.nombre}:</span> {texto}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

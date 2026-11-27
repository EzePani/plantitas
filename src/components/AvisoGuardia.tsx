import { Stethoscope } from 'lucide-react'
import { TG } from '../data/textosGuardia'
import { pendientes } from '../lib/guardia'
import { vibrar } from '../lib/haptics'
import { useHoy } from '../lib/useHoy'
import { useStore } from '../store/useStore'

/** Al abrir la app, recuerda los controles que tocan en Guardia */
export function AvisoGuardia({ onVer }: { onVer: (casoId: string | null) => void }) {
  const casos = useStore((s) => s.casos)
  const tocan = pendientes(casos, useHoy())
  if (tocan.length === 0) return null
  const una = tocan.length === 1 ? tocan[0] : null
  return (
    <button
      type="button"
      onClick={() => {
        vibrar('toque')
        onVer(una?.id ?? null)
      }}
      className="bg-hoja-osc mx-3 mt-3 flex min-h-13 shrink-0 items-center gap-3 rounded-2xl border-0 px-3 py-2 text-left text-white"
    >
      <Stethoscope className="shrink-0" aria-hidden />
      <span className="flex-1 text-[15px] leading-snug font-extrabold">{una ? TG.aviso(una.nombre) : TG.avisoVarias(tocan.length)}</span>
      <span className="text-[15px] font-extrabold underline">{TG.ver}</span>
    </button>
  )
}

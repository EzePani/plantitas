import { Cat, Dog, ShieldAlert, ShieldCheck, ShieldQuestionMark } from 'lucide-react'
import type { Planta, Toxicidad } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { toxicidadPara, type Especie } from '../../lib/mascotas'

export const COLOR_ESTADO: Record<Toxicidad, { fondo: string; texto: string; borde: string }> = {
  segura: { fondo: 'bg-brote', texto: 'text-hoja-osc', borde: 'border-hoja' },
  no_verificada: { fondo: 'bg-sol-claro', texto: 'text-[#7a5200]', borde: 'border-sol' },
  toxica: { fondo: 'bg-alerta-clara', texto: 'text-alerta', borde: 'border-alerta' },
}

const ICONO = { segura: ShieldCheck, no_verificada: ShieldQuestionMark, toxica: ShieldAlert }

/** Verde / amarillo / rojo para una especie. Siempre con ícono y texto, no solo color. */
export function Semaforo({ planta, especie, compacto }: { planta: Planta; especie: Especie; compacto?: boolean }) {
  const estado = toxicidadPara(planta, especie)
  const c = COLOR_ESTADO[estado]
  const Animal = especie === 'gato' ? Cat : Dog
  const Estado = ICONO[estado]
  const etiqueta = `${TC.plantas.estado[estado]} ${TC.plantas.para[especie]}`
  if (compacto) {
    return (
      <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-1 ${c.fondo} ${c.texto}`} role="img" aria-label={etiqueta}>
        <Animal size={16} strokeWidth={2.4} aria-hidden />
        <Estado size={16} strokeWidth={2.4} aria-hidden />
      </span>
    )
  }
  return (
    <div className={`flex flex-1 items-center gap-2 rounded-2xl border-2 p-3 ${c.fondo} ${c.texto} ${c.borde}`}>
      <Animal size={26} strokeWidth={2.2} aria-hidden />
      <div className="leading-tight">
        <div className="flex items-center gap-1 text-[16px] font-extrabold">
          <Estado size={18} strokeWidth={2.6} aria-hidden />
          {TC.plantas.estado[estado]}
        </div>
        <div className="text-[13px] font-bold opacity-90">{TC.plantas.para[especie]}</div>
      </div>
    </div>
  )
}

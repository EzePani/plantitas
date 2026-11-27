import { ChevronRight, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Boton } from '../../components/Boton'
import { FotoPlanta } from '../../components/FotoPlanta'
import { plantaPorId } from '../../data/plantas'
import { TG } from '../../data/textosGuardia'
import { MAX_CASOS, cerrados, enTratamiento, tocaControl } from '../../lib/guardia'
import { useFoto } from '../../lib/fotos'
import type { Caso } from '../../lib/tipos'
import { useHoy } from '../../lib/useHoy'
import { useStore } from '../../store/useStore'
import { Historia, cuandoToca } from './Historia'
import { Ingreso, type Consulta } from './Ingreso'
import { ayuda, fila, titulo } from './comunes'

function FilaCaso({ caso, estado, urgente, onClick }: { caso: Caso; estado: string; urgente?: boolean; onClick: () => void }) {
  const planta = plantaPorId(caso.plantaId)
  const foto = useFoto(caso.id)
  return (
    <button type="button" onClick={onClick} className={fila}>
      {/* Si le sacó una foto, se la reconoce mejor que con la del catálogo */}
      {foto.url ? <img src={foto.url} alt="" className="size-11 shrink-0 rounded-2xl object-cover" /> : planta && <FotoPlanta planta={planta} className="size-11 shrink-0 rounded-2xl" />}
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] leading-tight font-extrabold">{caso.nombre}</span>
        {caso.donde && <span className="text-tinta-suave block text-[13px] leading-tight font-bold">{caso.donde}</span>}
      </span>
      <span className={`shrink-0 text-[13px] font-extrabold ${urgente ? 'bg-hoja-osc rounded-full px-2.5 py-1 text-white' : 'text-tinta-suave'}`}>{estado}</span>
      <ChevronRight size={18} className="text-tinta-suave shrink-0" aria-hidden />
    </button>
  )
}

/** Plantas enfermas: ingreso, seguimiento e historial. `abrir` trae el caso elegido en el aviso. */
export function Guardia({ abrir, onAbierto, onGuia }: { abrir: string | null; onAbierto: () => void; onGuia: (entrada: string) => void }) {
  const casos = useStore((s) => s.casos)
  const hoy = useHoy()
  const [abiertoId, setAbiertoId] = useState(abrir)
  const [consulta, setConsulta] = useState<Consulta | null>(null)
  useEffect(() => onAbierto(), [])

  const activos = enTratamiento(casos)
  const historial = cerrados(casos)
  const lleno = casos.length >= MAX_CASOS
  const verCaso = (id: string) => {
    setConsulta(null)
    setAbiertoId(id)
  }

  return (
    <div className="safe-top relative flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 px-5 pt-4 pb-2">
        <h1 className="font-display text-hoja-osc m-0 text-[30px] font-semibold">{TG.titulo}</h1>
      </header>
      <div className="scroll-app flex min-h-0 flex-1 flex-col gap-2.5 px-5 pb-6">
        <p className={ayuda}>{TG.intro}</p>
        <div className="my-1">
          <Boton disabled={lleno} onClick={() => setConsulta({})}>
            <span className="flex items-center justify-center gap-2">
              <Plus size={20} strokeWidth={3} aria-hidden />
              {TG.ingresar}
            </span>
          </Boton>
        </div>
        {lleno && <p className={ayuda}>{TG.lleno}</p>}
        <h2 className={titulo}>{TG.enTratamiento}</h2>
        {activos.length === 0 && <p className={ayuda}>{TG.vacio}</p>}
        {activos.map((c) => (
          <FilaCaso key={c.id} caso={c} estado={cuandoToca(c, hoy)} urgente={tocaControl(c, hoy)} onClick={() => setAbiertoId(c.id)} />
        ))}
        {historial.length > 0 && (
          <>
            <h2 className={`${titulo} mt-3`}>{TG.historial}</h2>
            {historial.map((c) => (
              <FilaCaso key={c.id} caso={c} estado={c.cierre!.tipo === 'alta' ? TG.deAlta : TG.despedida} onClick={() => setAbiertoId(c.id)} />
            ))}
          </>
        )}
      </div>

      <Historia caso={casos.find((c) => c.id === abiertoId) ?? null} hoy={hoy} onCerrar={() => setAbiertoId(null)} onRevisar={(caso, tierra) => setConsulta({ caso, tierra })} onGuia={onGuia} />
      <Ingreso consulta={consulta} hoy={hoy} onCerrar={() => setConsulta(null)} onCaso={verCaso} onGuia={onGuia} />
    </div>
  )
}

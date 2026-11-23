import { Lock } from 'lucide-react'
import { useState } from 'react'
import { FotoPlanta } from '../../components/FotoPlanta'
import { Panel } from '../../components/Panel'
import { plantaPorId, type Planta } from '../../data/plantas'
import { T } from '../../data/textos'
import { UNIDADES } from '../../data/unidades'
import { useStore } from '../../store/useStore'
import { FichaPlanta } from '../pets/FichaPlanta'

const J = T.perfil.jardin
const EN_ORDEN = Object.values(UNIDADES).sort((a, b) => a.numero - b.numero)

/** "Mi jardín": cada semilla ganada en un cofre se ve como la planta del catálogo que le corresponde */
export function Jardin() {
  const semillas = useStore((s) => s.semillas)
  const [abierta, setAbierta] = useState<Planta | null>(null)
  return (
    <>
      <div className="px-5 pb-8">
        <p className="text-tinta mt-0 mb-1 text-[15px] leading-snug font-bold">{semillas.length ? J.intro : J.vacio}</p>
        <p className="text-tinta-suave mt-0 mb-4 text-[13px] font-extrabold">{J.cuenta(semillas.length, EN_ORDEN.length)}</p>
        <div className="grid grid-cols-2 gap-3">
          {EN_ORDEN.map((u) => {
            const planta = plantaPorId(u.planta)
            const ganada = semillas.includes(u.id)
            if (!planta) return null
            return ganada ? (
              <button key={u.id} type="button" onClick={() => setAbierta(planta)} className="border-arena-osc overflow-hidden rounded-3xl border-2 bg-white p-0 text-left shadow-[0_3px_0_var(--color-arena-osc)] active:opacity-80">
                <FotoPlanta planta={planta} className="aspect-square w-full" />
                <span className="block px-3 py-2">
                  <span className="font-display text-tinta block text-[16px] leading-tight font-semibold">{planta.nombre_comun}</span>
                  <span className="block text-[12px] font-extrabold" style={{ color: u.colorOsc }}>
                    {u.titulo}
                  </span>
                </span>
              </button>
            ) : (
              <div key={u.id} className="border-arena-osc overflow-hidden rounded-3xl border-2 border-dashed" role="img" aria-label={`${J.bloqueada}: ${J.falta(u.numero, u.titulo)}`}>
                <div className="bg-arena grid aspect-square w-full place-items-center text-[#b5a784]">
                  <Lock size={32} aria-hidden />
                </div>
                <span className="block px-3 py-2">
                  <span className="font-display text-tinta-suave block text-[16px] leading-tight font-semibold">{J.bloqueada}</span>
                  <span className="text-tinta-suave block text-[12px] font-extrabold">{J.falta(u.numero, u.titulo)}</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <Panel abierto={abierta !== null} onCerrar={() => setAbierta(null)}>
        {abierta && <FichaPlanta planta={abierta} />}
      </Panel>
    </>
  )
}

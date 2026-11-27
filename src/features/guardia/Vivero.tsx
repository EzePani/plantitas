import { useState } from 'react'
import { Boton } from '../../components/Boton'
import { CampoFecha } from '../../components/CampoFecha'
import { Dialogo } from '../../components/Dialogo'
import { Panel } from '../../components/Panel'
import { T } from '../../data/textos'
import { TG } from '../../data/textosGuardia'
import { fechaCorta } from '../../lib/fecha'
import { MAX_DIAGNOSTICO, MAX_VISITAS, dentroDe, limitesDeIngresoNuevo } from '../../lib/guardia'
import type { Caso, VisitaVivero } from '../../lib/tipos'
import { useStore } from '../../store/useStore'
import { ayuda, titulo } from './comunes'

/** La visita que se está escribiendo: una ya anotada o una nueva */
export type VisitaElegida = VisitaVivero | 'nueva'

const chico = 'border-arena-osc text-hoja-osc min-h-11 shrink-0 rounded-full border-2 bg-white px-4 text-[14px] font-extrabold'

/** En la historia: pregunta si la llevó al vivero y muestra lo que le dijeron */
export function SeccionVivero({ caso, hoy, onVisita }: { caso: Caso; hoy: string; onVisita: (v: VisitaElegida) => void }) {
  const noLaLleve = useStore((s) => s.sinVisitasCaso)
  const visitas = caso.vivero
  return (
    <section className="flex flex-col gap-2">
      <h2 className={titulo}>{TG.vivero.titulo}</h2>
      {!visitas ? (
        <div className="border-arena-osc rounded-2xl border-2 bg-white p-3">
          <p className="text-tinta m-0 mb-2 text-[15px] font-extrabold">{TG.vivero.pregunta}</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onVisita('nueva')} className={chico}>
              {TG.vivero.si}
            </button>
            <button type="button" onClick={() => noLaLleve(caso.id)} className={chico}>
              {TG.vivero.no}
            </button>
          </div>
        </div>
      ) : visitas.length === 0 ? (
        <div className="border-arena-osc flex items-center justify-between gap-3 rounded-2xl border-2 bg-white py-2 pr-2 pl-3.5">
          <span className="text-tinta-suave text-[15px] font-extrabold">{TG.vivero.noLlevada}</span>
          <button type="button" onClick={() => onVisita('nueva')} className={chico}>
            {TG.vivero.yaFui}
          </button>
        </div>
      ) : (
        <>
          {/* La más nueva arriba */}
          {[...visitas].reverse().map((v) => (
            <div key={v.id} className="border-arena-osc rounded-2xl border-2 bg-white py-2 pr-2 pl-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-tinta text-[15px] font-extrabold">{fechaCorta(v.fecha, hoy)}</span>
                <button type="button" onClick={() => onVisita(v)} aria-label={`${TG.vivero.editar}: ${fechaCorta(v.fecha, hoy)}`} className={chico}>
                  {TG.vivero.editar}
                </button>
              </div>
              <p className="text-tinta m-0 mt-1 mr-1.5 mb-1 text-[15px] leading-snug font-bold break-words whitespace-pre-line">{v.dijo}</p>
            </div>
          ))}
          {visitas.length < MAX_VISITAS && (
            <button type="button" onClick={() => onVisita('nueva')} className={`${chico} self-start`}>
              {TG.vivero.otra}
            </button>
          )}
        </>
      )}
    </section>
  )
}

/** Cuándo fue y qué le dijeron */
export function PanelVivero({ caso, visita, hoy, onCerrar }: { caso: Caso | null; visita: VisitaElegida | null; hoy: string; onCerrar: () => void }) {
  const anotar = useStore((s) => s.anotarVisitaCaso)
  const borrar = useStore((s) => s.borrarVisitaCaso)
  const [antes, setAntes] = useState<VisitaElegida | null>(null)
  const [fecha, setFecha] = useState('')
  const [dijo, setDijo] = useState('')
  const [borrando, setBorrando] = useState(false)
  // Al abrirse carga la visita elegida, o una en blanco con la fecha de hoy
  if (visita !== antes) {
    setAntes(visita)
    if (visita) {
      setFecha(visita === 'nueva' ? hoy : visita.fecha)
      setDijo(visita === 'nueva' ? '' : visita.dijo)
    }
  }
  const previa = visita && visita !== 'nueva' ? visita : null
  const limites = limitesDeIngresoNuevo(hoy)
  const fechaVale = fecha === previa?.fecha || dentroDe(fecha, limites)
  const guardar = () => {
    if (!caso) return
    anotar(caso.id, { ...(previa && { id: previa.id }), fecha, dijo })
    onCerrar()
  }

  return (
    <>
      <Panel
        abierto={visita !== null && caso !== null}
        titulo={TG.vivero.visita}
        onCerrar={onCerrar}
        pie={
          <Boton disabled={!fechaVale || !dijo.trim()} onClick={guardar}>
            {TG.vivero.guardar}
          </Boton>
        }
      >
        <div className="flex flex-col gap-3 px-5 pt-1 pb-6">
          <h2 className={titulo}>{TG.vivero.cuando}</h2>
          <CampoFecha etiqueta={TG.vivero.cuando} valor={fecha} min={limites.min} max={limites.max} onCambio={setFecha} />
          {!fechaVale && <p className={ayuda}>{TG.fechaEntre(fechaCorta(limites.min, hoy), fechaCorta(limites.max, hoy))}</p>}
          <label className="flex flex-col gap-1.5">
            <span className={titulo}>{TG.vivero.dijeron}</span>
            <textarea
              value={dijo}
              onChange={(e) => setDijo(e.target.value)}
              maxLength={MAX_DIAGNOSTICO}
              rows={6}
              placeholder={TG.vivero.ejemplo}
              className="border-arena-osc text-tinta focus:border-hoja w-full resize-none rounded-2xl border-2 bg-white p-3 text-[16px] font-bold outline-none"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            />
          </label>
          {previa && (
            <button type="button" onClick={() => setBorrando(true)} className="text-alerta min-h-11 border-0 bg-transparent text-[14px] font-extrabold underline">
              {TG.vivero.borrar}
            </button>
          )}
        </div>
      </Panel>

      <Dialogo abierto={borrando} titulo={TG.vivero.borrarTitulo} onCerrar={() => setBorrando(false)}>
        <Boton
          variante="alerta"
          onClick={() => {
            if (caso && previa) borrar(caso.id, previa.id)
            setBorrando(false)
            onCerrar()
          }}
        >
          {TG.vivero.borrarSi}
        </Boton>
        <Boton variante="fantasma" onClick={() => setBorrando(false)}>
          {T.comun.cancelar}
        </Boton>
      </Dialogo>
    </>
  )
}

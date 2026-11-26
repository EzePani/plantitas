import { CalendarDays, Check, Droplet, Flower2, Plus, Sprout, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { FotoPlanta } from '../../components/FotoPlanta'
import { Panel } from '../../components/Panel'
import { PLANTAS, plantaPorId, type Planta } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { buscarPlantas } from '../../lib/buscar'
import { fechaCorta, hoyLocal } from '../../lib/fecha'
import { vibrar } from '../../lib/haptics'
import { MAX_HIJITOS, errorDeFechas, estadoHijito, ordenarHijitos, type FechasHijito } from '../../lib/hijitos'
import type { Hijito } from '../../lib/tipos'
import { useStore } from '../../store/useStore'
import { BotonPie } from './Lista'

const H = TC.plantas.hijitos

/** Selector de fecha nativo del celular; nunca deja elegir un día posterior a hoy */
function CampoFecha({ etiqueta, valor, onCambio, min, hoy }: { etiqueta: string; valor: string; onCambio: (f: string) => void; min?: string; hoy: string }) {
  return (
    <input
      type="date"
      aria-label={etiqueta}
      value={valor}
      min={min}
      max={hoy}
      onChange={(e) => onCambio(e.target.value)}
      className="border-arena-osc text-tinta focus:border-hoja block min-h-12 w-full min-w-0 appearance-none rounded-full border-2 bg-white px-4 text-left text-[16px] font-bold outline-none"
    />
  )
}

/** Panel para corregir a mano cuándo empezó, cuándo echó raíces y cuándo pasó a maceta */
function EditorFechas({ hijito, hoy, onCerrar }: { hijito: Hijito | null; hoy: string; onCerrar: () => void }) {
  const corregir = useStore((s) => s.corregirHijito)
  const [f, setF] = useState<FechasHijito | null>(null)
  const [de, setDe] = useState<string | null>(null)
  // Al abrirlo para otro hijito se cargan sus fechas
  if (hijito && de !== hijito.id) {
    setDe(hijito.id)
    setF({ inicio: hijito.inicio, raices: hijito.raices, maceta: hijito.maceta })
  }
  if (!hijito && de !== null) setDe(null)
  const error = f ? errorDeFechas(f, hoy) : null
  const guardar = () => {
    if (!hijito || !f || error) return
    corregir(hijito.id, f)
    onCerrar()
  }
  const etapa = (campo: 'raices' | 'maceta', min: string) =>
    f && (
      <section>
        <h2 className="font-display text-tinta mt-5 mb-2 text-[18px] font-semibold">{H.fechas[campo]}</h2>
        {f[campo] === null ? (
          <button type="button" onClick={() => setF({ ...f, [campo]: hoy })} className="border-arena-osc text-tinta-suave min-h-12 w-full rounded-full border-2 border-dashed bg-transparent px-4 text-left text-[16px] font-bold">
            {H.fechas.sinFecha}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <CampoFecha etiqueta={H.fechas[campo]} valor={f[campo]} min={min} hoy={hoy} onCambio={(v) => setF({ ...f, [campo]: v })} />
            <button type="button" onClick={() => setF({ ...f, [campo]: null })} className="text-tinta-suave min-h-11 shrink-0 border-0 bg-transparent px-2 text-[14px] font-extrabold underline">
              {H.fechas.quitar}
            </button>
          </div>
        )}
      </section>
    )
  return (
    <Panel abierto={hijito !== null} titulo={H.fechas.titulo} onCerrar={onCerrar} pie={<BotonPie onClick={guardar}>{H.fechas.guardar}</BotonPie>}>
      {hijito && f && (
        <div className="px-5 pb-6">
          <p className="text-tinta m-0 text-[15px] leading-snug font-bold">
            <strong className="font-extrabold">{hijito.nombre}.</strong> {H.fechas.intro}
          </p>
          <h2 className="font-display text-tinta mt-5 mb-2 text-[18px] font-semibold">{H.fechas.inicio}</h2>
          <CampoFecha etiqueta={H.fechas.inicio} valor={f.inicio} hoy={hoy} onCambio={(v) => setF({ ...f, inicio: v })} />
          {etapa('raices', f.inicio)}
          {etapa('maceta', f.raices ?? f.inicio)}
          {error && (
            <p role="alert" className="text-alerta mt-4 mb-0 text-[14px] leading-snug font-extrabold">
              {H.fechas.error[error]}
            </p>
          )}
        </div>
      )}
    </Panel>
  )
}

function Tarjeta({ hijito: h, hoy, onGuia, onFechas }: { hijito: Hijito; hoy: string; onGuia: (id: string) => void; onFechas: (h: Hijito) => void }) {
  const marcar = useStore((s) => s.marcarHijito)
  const borrar = useStore((s) => s.borrarHijito)
  const [seguro, setSeguro] = useState(false)
  const e = estadoHijito(h, hoy)
  const planta = h.plantaId ? plantaPorId(h.plantaId) : undefined
  const accion = (que: 'agua' | 'raices' | 'maceta') => {
    vibrar('toque')
    marcar(h.id, que)
  }
  const ayuda = e.etapa === 'en_maceta' ? H.ayuda.en_maceta : H.ayuda[`${e.etapa}_${h.medio}`]
  const boton = 'min-h-11 flex-1 rounded-full border-2 px-3 text-[14px] font-extrabold'
  return (
    <article className={`rounded-3xl border-2 bg-white p-3 shadow-[0_3px_0_var(--color-arena-osc)] ${e.tocaAgua ? 'border-agua' : 'border-arena-osc'}`}>
      <div className="flex items-center gap-3">
        {planta ? (
          <FotoPlanta planta={planta} className="size-16 shrink-0 rounded-2xl" />
        ) : (
          <span className="bg-brote text-hoja-osc grid size-16 shrink-0 place-items-center rounded-2xl">
            <Sprout size={28} aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-tinta m-0 truncate text-[18px] leading-tight font-semibold">{h.nombre}</h3>
          <p className="text-tinta-suave m-0 text-[13px] font-bold">{e.etapa === 'en_maceta' ? H.empezo(fechaCorta(h.inicio, hoy)) : H.dia(e.dias, h.medio)}</p>
          <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-extrabold ${e.tocaAgua ? 'bg-agua text-white' : 'bg-brote text-hoja-osc'}`}>
            {e.etapa === 'en_maceta' ? <Flower2 size={13} aria-hidden /> : e.tocaAgua ? <Droplet size={13} aria-hidden /> : <Check size={13} strokeWidth={3.2} aria-hidden />}
            {e.etapa === 'en_maceta' ? H.etapaMaceta : e.tocaAgua ? H.tocaAgua : e.etapa === 'con_raices' ? H.conRaices : h.medio === 'agua' ? H.aguaOk : H.medio.tierra}
          </span>
        </div>
        <button
          type="button"
          aria-label={seguro ? H.borrarSeguro : H.borrar(h.nombre)}
          onClick={() => (seguro ? borrar(h.id) : setSeguro(true))}
          onBlur={() => setSeguro(false)}
          className={`grid size-11 shrink-0 place-items-center rounded-full border-0 ${seguro ? 'bg-alerta text-white' : 'text-tinta-suave bg-transparent'}`}
        >
          <Trash2 size={18} aria-hidden />
        </button>
      </div>
      {seguro && <p className="text-alerta mt-2 mb-0 text-right text-[13px] font-extrabold">{H.borrarSeguro}</p>}
      <button type="button" aria-label={H.fechas.boton(h.nombre)} onClick={() => onFechas(h)} className="bg-arena text-tinta mt-2.5 flex min-h-11 w-full items-center gap-2 rounded-2xl border-0 px-3 py-1.5 text-left text-[13px] leading-snug font-extrabold">
        <CalendarDays size={17} className="text-tinta-suave shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">{[e.etapa !== 'en_maceta' && H.desde(fechaCorta(h.inicio, hoy)), H.tiempos(e.diasRaices, e.diasMaceta)].filter(Boolean).join(' · ')}</span>
        <span className="text-hoja-osc shrink-0 underline">{H.fechas.corregir}</span>
      </button>
      <p className="text-tinta mt-2.5 mb-0 text-[14px] leading-snug font-bold">{ayuda}</p>
      {e.etapa !== 'en_maceta' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {h.medio === 'agua' && (
            <button type="button" onClick={() => accion('agua')} className={`${boton} ${e.tocaAgua ? 'border-agua bg-agua text-white' : 'border-arena-osc text-tinta bg-white'}`}>
              {H.cambieAgua}
            </button>
          )}
          {e.etapa === 'enraizando' ? (
            <button type="button" onClick={() => accion('raices')} className={`${boton} border-arena-osc text-tinta bg-white`}>
              {H.tieneRaices}
            </button>
          ) : (
            <button type="button" onClick={() => accion('maceta')} className={`${boton} border-hoja bg-hoja text-white`}>
              {H.aMaceta}
            </button>
          )}
        </div>
      )}
      {e.etapa === 'enraizando' && h.medio === 'agua' && (
        <button type="button" onClick={() => onGuia('propagar-en-agua')} className="text-hoja-osc mt-2 min-h-9 border-0 bg-transparent p-0 text-left text-[13px] font-extrabold underline">
          {H.leccion}
        </button>
      )}
    </article>
  )
}

/** Pestaña "Hijitos": esquejes en seguimiento, con aviso para cambiarles el agua */
export function Hijitos({ onGuia }: { onGuia: (entradaId: string) => void }) {
  const hijitos = useStore((s) => s.hijitos)
  const agregar = useStore((s) => s.agregarHijito)
  const hoy = hoyLocal()
  const [nuevo, setNuevo] = useState(false)
  const [nombre, setNombre] = useState('')
  const [planta, setPlanta] = useState<Planta | null>(null)
  const [medio, setMedio] = useState<Hijito['medio']>('agua')
  const [inicio, setInicio] = useState(hoy)
  const [fechasDe, setFechasDe] = useState<string | null>(null)
  const errorInicio = errorDeFechas({ inicio, raices: null, maceta: null }, hoy)
  const inicioOk = !errorInicio
  const lleno = hijitos.length >= MAX_HIJITOS
  // Mientras se escribe se sugieren plantas del catálogo; si se elige una, el hijito queda con su foto
  const sugeridas = planta ? [] : buscarPlantas(PLANTAS, nombre).slice(0, 4)

  const abrir = () => {
    setNombre('')
    setPlanta(null)
    setMedio('agua')
    setInicio(hoy)
    setNuevo(true)
  }
  const guardar = () => {
    if (inicioOk && agregar({ plantaId: planta?.id ?? null, nombre, medio, inicio })) setNuevo(false)
  }

  return (
    <>
      <div className="px-5 pt-3 pb-6">
        <p className="text-tinta mt-0 mb-3 text-[15px] leading-snug font-bold">{H.intro}</p>
        <button type="button" disabled={lleno} onClick={abrir} className="bg-hoja relieve flex min-h-13 w-full items-center justify-center gap-2 rounded-full border-0 text-[17px] font-extrabold text-white disabled:opacity-45">
          <Plus size={20} strokeWidth={3} aria-hidden />
          {H.nuevo}
        </button>
        {lleno && <p className="text-tinta-suave mt-2 mb-0 text-[13px] font-bold">{H.limite}</p>}
        {hijitos.length === 0 ? (
          <p className="text-tinta-suave py-10 text-center text-[15px] font-bold">{H.vacio}</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {ordenarHijitos(hijitos, hoy).map((h) => (
              <Tarjeta key={h.id} hijito={h} hoy={hoy} onGuia={onGuia} onFechas={(x) => setFechasDe(x.id)} />
            ))}
          </div>
        )}
      </div>

      <Panel abierto={nuevo} titulo={H.nuevoTitulo} onCerrar={() => setNuevo(false)} pie={<BotonPie onClick={guardar}>{H.guardar}</BotonPie>}>
        <div className="px-5 pb-6">
          <h2 className="font-display text-tinta mt-2 mb-2 text-[18px] font-semibold">{H.deQue}</h2>
          <input
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              setPlanta(null)
            }}
            maxLength={40}
            placeholder={H.nombre}
            aria-label={H.nombre}
            autoComplete="off"
            className="border-arena-osc text-tinta focus:border-hoja min-h-12 w-full rounded-full border-2 bg-white px-4 text-[16px] font-bold outline-none"
            style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
          />
          {sugeridas.length > 0 && (
            <div className="border-arena-osc mt-2 overflow-hidden rounded-3xl border-2 bg-white">
              {sugeridas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPlanta(p)
                    setNombre(p.nombre_comun)
                    setMedio(p.cultivo.propagacion.en_agua ? 'agua' : 'tierra')
                  }}
                  className="border-arena flex w-full items-center gap-3 border-0 border-b-2 bg-transparent px-3 py-2 text-left last:border-b-0"
                >
                  <FotoPlanta planta={p} className="size-11 shrink-0 rounded-xl" />
                  <span className="text-tinta text-[15px] font-extrabold">{p.nombre_comun}</span>
                </button>
              ))}
            </div>
          )}
          {planta && <p className="text-tinta-suave mt-2 mb-0 text-[14px] leading-snug font-bold">{planta.cultivo.propagacion.detalle}</p>}
          <h2 className="font-display text-tinta mt-6 mb-2 text-[18px] font-semibold">{H.donde}</h2>
          <div className="flex gap-2">
            {(['agua', 'tierra'] as const).map((m) => (
              <button key={m} type="button" aria-pressed={medio === m} onClick={() => setMedio(m)} className={`min-h-11 flex-1 rounded-full border-2 text-[15px] font-extrabold ${medio === m ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-tinta bg-white'}`}>
                {H.medio[m]}
              </button>
            ))}
          </div>
          <h2 className="font-display text-tinta mt-6 mb-1 text-[18px] font-semibold">{H.cuando}</h2>
          <p className="text-tinta-suave mt-0 mb-2 text-[13px] font-bold">{inicio === hoy ? `${H.hoy}. ${H.cuandoAyuda}` : errorInicio ? H.fechas.error[errorInicio] : H.empezo(fechaCorta(inicio, hoy))}</p>
          <CampoFecha etiqueta={H.cuando} valor={inicio} hoy={hoy} onCambio={setInicio} />
        </div>
      </Panel>

      <EditorFechas hijito={hijitos.find((h) => h.id === fechasDe) ?? null} hoy={hoy} onCerrar={() => setFechasDe(null)} />
    </>
  )
}

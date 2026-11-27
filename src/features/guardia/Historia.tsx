import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Boton } from '../../components/Boton'
import { Dialogo } from '../../components/Dialogo'
import { Panel } from '../../components/Panel'
import { T } from '../../data/textos'
import { TG } from '../../data/textosGuardia'
import { fechaCorta, sumarDias } from '../../lib/fecha'
import { controlDe, diaDe, proximoControl, tocaControl } from '../../lib/guardia'
import { ESTADOS_CONTROL, TIERRAS, type Caso, type EstadoControl, type Sintoma, type Tierra } from '../../lib/tipos'
import { useStore } from '../../store/useStore'
import { Causas } from './Causas'
import { Notas, Opciones, ayuda, fila, titulo } from './comunes'

/** "Hojas amarillas, manchas": mayúscula solo al principio */
const enFrase = (textos: string[]) => textos.map((t, i) => (i ? t.toLowerCase() : t)).join(', ')
const lista = (s: Sintoma[]) => enFrase(s.map((x) => TG.sintoma[x]))

/** "hoy", "mañana" o la fecha */
export function cuandoToca(c: Caso, hoy: string): string {
  const f = proximoControl(c)
  if (f <= hoy) return TG.controlHoy
  return f === sumarDias(hoy, 1) ? TG.manana : fechaCorta(f, hoy)
}

function Entrada({ dia, fecha, hoy, titulo: encabezado, detalle, nota }: { dia: number; fecha: string; hoy: string; titulo: string; detalle?: string; nota?: string }) {
  return (
    <li className="border-arena-osc rounded-2xl border-2 bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-tinta text-[15px] font-extrabold">
          {TG.dia(dia)} · {encabezado}
        </span>
        <span className="text-tinta-suave shrink-0 text-[13px] font-bold">{fechaCorta(fecha, hoy)}</span>
      </div>
      {detalle && <p className="text-tinta m-0 mt-0.5 text-[14px] leading-snug font-bold">{detalle}</p>}
      {nota && <p className="text-tinta-suave m-0 mt-0.5 text-[14px] leading-snug font-bold break-words">“{nota}”</p>}
    </li>
  )
}

/** El formulario del control del día */
function PanelControl({ caso, abierto, hoy, onCerrar, onRevisar }: { caso: Caso | null; abierto: boolean; hoy: string; onCerrar: () => void; onRevisar: (tierra: Tierra) => void }) {
  const controlar = useStore((s) => s.controlarCaso)
  const [antes, setAntes] = useState(false)
  const [estado, setEstado] = useState<EstadoControl | null>(null)
  const [tierra, setTierra] = useState<Tierra | null>(null)
  const [nota, setNota] = useState('')
  // Al abrirse muestra lo ya anotado hoy
  if (abierto !== antes) {
    setAntes(abierto)
    if (abierto && caso) {
      const previo = controlDe(caso, hoy)
      setEstado(previo?.estado ?? null)
      setTierra(previo?.tierra ?? null)
      setNota(previo?.nota ?? '')
    }
  }
  const listo = estado !== null && tierra !== null
  const guardar = () => {
    if (!caso || !estado || !tierra) return false
    controlar(caso.id, { estado, tierra, nota })
    return true
  }
  const pie =
    estado === 'peor' ? (
      <div className="flex flex-col gap-2">
        <Boton
          disabled={!listo}
          onClick={() => {
            if (guardar()) onRevisar(tierra!)
          }}
        >
          {TG.guardarYRevisar}
        </Boton>
        <Boton variante="fantasma" disabled={!listo} onClick={() => guardar() && onCerrar()}>
          {TG.soloGuardar}
        </Boton>
      </div>
    ) : (
      <Boton variante="sol" disabled={!listo} onClick={() => guardar() && onCerrar()}>
        {TG.guardar}
      </Boton>
    )
  return (
    <Panel abierto={abierto && caso !== null} titulo={TG.control} onCerrar={onCerrar} pie={pie}>
      {caso && (
        <div className="flex flex-col gap-3 px-5 pt-1 pb-6">
          <p className={ayuda}>{TG.controlAyuda(diaDe(caso, hoy))}</p>
          <h2 className={titulo}>{TG.comoVes}</h2>
          <Opciones valores={ESTADOS_CONTROL} textos={TG.estado} elegidas={estado ? [estado] : []} columnas={3} onElegir={setEstado} />
          <h2 className={titulo}>{TG.yTierra}</h2>
          <Opciones valores={TIERRAS} textos={TG.tierra} elegidas={tierra ? [tierra] : []} columnas={3} onElegir={setTierra} />
          <Notas valor={nota} onCambio={setNota} etiqueta={TG.nota} />
        </div>
      )}
    </Panel>
  )
}

/** La historia clínica de un caso, desde el ingreso hasta el alta o la despedida */
export function Historia({ caso, hoy, onCerrar, onRevisar, onGuia }: { caso: Caso | null; hoy: string; onCerrar: () => void; onRevisar: (caso: Caso, tierra: Tierra) => void; onGuia: (entrada: string) => void }) {
  const cerrar = useStore((s) => s.cerrarCaso)
  const borrar = useStore((s) => s.borrarCaso)
  const [controlando, setControlando] = useState(false)
  const [indicaciones, setIndicaciones] = useState(false)
  const [confirmar, setConfirmar] = useState<'alta' | 'despedida' | 'borrar' | null>(null)
  const textos = confirmar && {
    alta: [TG.altaTitulo, TG.altaTexto, TG.altaSi],
    despedida: [TG.murioTitulo, TG.murioTexto, TG.murioSi],
    borrar: [TG.borrarTitulo, caso?.nombre ?? '', TG.borrarSi],
  }[confirmar]

  const pie =
    caso && !caso.cierre ? (
      <div className="flex flex-col gap-2">
        <Boton variante={tocaControl(caso, hoy) ? 'primario' : 'secundario'} onClick={() => setControlando(true)}>
          {controlDe(caso, hoy) ? TG.cambiarControl : TG.controlar}
        </Boton>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setConfirmar('alta')} className="border-hoja text-hoja-osc min-h-12 rounded-2xl border-2 bg-white text-[15px] font-extrabold">
            {TG.darAlta}
          </button>
          <button type="button" onClick={() => setConfirmar('despedida')} className="border-arena-osc text-tinta-suave min-h-12 rounded-2xl border-2 bg-white text-[15px] font-extrabold">
            {TG.murio}
          </button>
        </div>
      </div>
    ) : undefined

  return (
    <>
      <Panel abierto={caso !== null} titulo={caso?.nombre} onCerrar={onCerrar} pie={pie}>
        {caso && (
          <div className="flex flex-col gap-3 px-5 pt-1 pb-6">
            <div>
              {caso.donde && <p className={ayuda}>{caso.donde}</p>}
              <p className="text-hoja-osc m-0 text-[16px] font-extrabold">
                {caso.cierre ? TG.cerradoEl(caso.cierre.tipo, fechaCorta(caso.cierre.fecha, hoy)) : tocaControl(caso, hoy) ? TG.pendienteHoy : TG.proximo(cuandoToca(caso, hoy).toLowerCase())}
              </p>
            </div>
            <button type="button" onClick={() => setIndicaciones(true)} className={fila}>
              <span className="flex-1">
                <span className="block text-[16px] font-extrabold">{TG.indicaciones}</span>
                <span className="text-tinta-suave block text-[13px] font-bold">{TG.causasTitulo}</span>
              </span>
              <ChevronRight size={20} className="text-tinta-suave shrink-0" aria-hidden />
            </button>
            {/* Lo más nuevo arriba; el ingreso queda al final */}
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {[...caso.controles].reverse().map((c) => (
                <Entrada
                  key={c.fecha}
                  dia={diaDe(caso, c.fecha)}
                  fecha={c.fecha}
                  hoy={hoy}
                  titulo={TG.estado[c.estado]}
                  detalle={[`Tierra ${TG.tierra[c.tierra].toLowerCase()}`, c.sintomas && `${TG.revision}: ${lista(c.sintomas).toLowerCase()}`].filter(Boolean).join('. ')}
                  nota={c.nota}
                />
              ))}
              <Entrada
                dia={1}
                fecha={caso.ingreso}
                hoy={hoy}
                titulo={TG.ingreso}
                detalle={[
                  `${lista(caso.sintomas)}. Tierra ${TG.tierra[caso.tierra].toLowerCase()}`,
                  caso.cambios.some((x) => x !== 'nada') && `Cambios: ${enFrase(caso.cambios.map((x) => TG.cambio[x])).toLowerCase()}`,
                ]
                  .filter(Boolean)
                  .join('. ')}
                nota={caso.notas}
              />
            </ul>
            {caso.cierre && (
              <button type="button" onClick={() => setConfirmar('borrar')} className="text-alerta min-h-11 border-0 bg-transparent text-[14px] font-extrabold underline">
                {TG.borrar}
              </button>
            )}
          </div>
        )}
      </Panel>

      <Panel abierto={indicaciones && caso !== null} titulo={TG.indicaciones} onCerrar={() => setIndicaciones(false)}>
        {caso && (
          <div className="px-5 pt-1 pb-6">
            <Causas causas={caso.causas} onGuia={onGuia} />
          </div>
        )}
      </Panel>

      <PanelControl
        caso={caso}
        abierto={controlando}
        hoy={hoy}
        onCerrar={() => setControlando(false)}
        onRevisar={(tierra) => {
          setControlando(false)
          if (caso) onRevisar(caso, tierra)
        }}
      />

      <Dialogo abierto={textos !== null} titulo={textos?.[0] ?? ''} texto={textos?.[1]} onCerrar={() => setConfirmar(null)}>
        <Boton
          variante={confirmar === 'alta' ? 'primario' : 'alerta'}
          onClick={() => {
            if (caso && confirmar === 'borrar') {
              borrar(caso.id)
              onCerrar()
            } else if (caso && confirmar) cerrar(caso.id, confirmar as 'alta' | 'despedida')
            setConfirmar(null)
          }}
        >
          {textos?.[2]}
        </Boton>
        <Boton variante="fantasma" onClick={() => setConfirmar(null)}>
          {T.comun.cancelar}
        </Boton>
      </Dialogo>
    </>
  )
}

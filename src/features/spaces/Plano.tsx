import { ChevronRight, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Boton } from '../../components/Boton'
import { Panel } from '../../components/Panel'
import type { Planta } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { MAX_PLANTAS_ESPACIO } from '../../lib/espacios'
import { vibrar } from '../../lib/haptics'
import { CELDAS, FORMAS, LADO, TIPOS_ELEMENTO, alternarSuelo, conSuelo, formaDe, llevaPlantas, lugarPiso, numeroDe, plantasEn, sueloDe, tocarElemento } from '../../lib/plano'
import type { Espacio, Plano, TipoElemento } from '../../lib/tipos'
import { useStore } from '../../store/useStore'
import { BotonAgregarPlanta, FilasPlantas } from './PlantasEspacio'

const T = TC.espacio.plano
const COLOR: Record<TipoElemento, string> = {
  ventana: 'border-agua bg-agua-clara',
  puerta: 'border-terracota bg-terracota-clara',
  mesa: 'border-hoja bg-brote',
  mueble: 'border-hoja bg-brote',
  estante: 'border-hoja bg-brote',
  gancho: 'border-hoja bg-brote',
}
const chip = (activo: boolean) => `min-h-11 rounded-full border-2 px-2 text-[14px] font-extrabold ${activo ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-tinta bg-white'}`

/** "Estante 2", "Piso" o "Sin ubicar" */
export function nombreDeLugar(plano: Plano | undefined, lugar: string | null): string {
  if (lugar === null) return T.sinUbicar
  const el = plano?.elementos.find((e) => e.id === lugar)
  if (!plano || !el) return T.piso
  const n = numeroDe(plano, el)
  return n ? `${T.tipo[el.tipo]} ${n}` : T.tipo[el.tipo]
}

/** El espacio visto desde arriba. En 'forma' se toca cualquier celda; en el resto, solo las del piso. */
function Cuadricula({ plano, modo, espacio, onCelda }: { plano: Plano; modo: 'forma' | 'elementos' | 'ver'; espacio?: Espacio; onCelda: (c: number) => void }) {
  return (
    <div className="mx-auto grid w-full max-w-[360px] grid-cols-6 gap-1">
      {Array.from({ length: CELDAS }, (_, c) => {
        const piso = plano.suelo.includes(c)
        const el = modo === 'forma' ? undefined : plano.elementos.find((e) => e.celda === c)
        const lugar = el ? el.id : lugarPiso(c)
        const n = espacio && piso ? plantasEn(espacio, lugar).length : 0
        const nombre = el ? nombreDeLugar(plano, el.id) : piso ? T.piso : T.afuera
        const etiqueta = T.celda(Math.floor(c / LADO) + 1, (c % LADO) + 1, nombre, n)
        if (!piso && modo !== 'forma') return <span key={c} className="aspect-square" aria-hidden />
        // En el editor de forma, el cuadradito marca si es piso; los elementos se ven recién en el paso siguiente
        const clase = el ? COLOR[el.tipo] : !piso ? 'border-dashed border-arena-osc bg-transparent' : modo === 'forma' ? 'border-hoja-osc bg-arena-osc' : 'border-arena-osc bg-white'
        return (
          <button
            key={c}
            type="button"
            aria-label={etiqueta}
            aria-pressed={modo === 'forma' ? piso : undefined}
            disabled={modo === 'ver' && el && !llevaPlantas(el.tipo)}
            onClick={() => {
              vibrar('toque')
              onCelda(c)
            }}
            className={`text-tinta relative grid aspect-square min-w-0 place-content-center rounded-xl border-2 p-0 text-center text-[10px] leading-tight font-extrabold ${clase}`}
          >
            {(el || (n > 0 && modo === 'ver')) && <span aria-hidden>{nombre}</span>}
            {n > 0 && (
              <span className="bg-hoja-osc absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full text-[11px] text-white" aria-hidden>
                {n}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Tarjeta del plano dentro de un espacio */
export function TarjetaPlano({ espacio, onEditar, onLugar }: { espacio: Espacio; onEditar: () => void; onLugar: (lugar: string | null) => void }) {
  const sueltas = plantasEn(espacio, null).length
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="font-display text-tinta m-0 text-[22px] font-semibold">{T.titulo}</h2>
      {!espacio.plano ? (
        <div className="border-arena-osc flex flex-col gap-3 rounded-3xl border-2 bg-white p-4">
          <p className="text-tinta-suave m-0 text-[15px] leading-snug font-bold">{T.vacio}</p>
          <Boton onClick={onEditar}>{T.armar}</Boton>
        </div>
      ) : (
        <>
          <p className="text-tinta-suave m-0 text-[14px] leading-snug font-bold">{T.ayudaVer}</p>
          <div className="py-1">
            <Cuadricula plano={espacio.plano} modo="ver" espacio={espacio} onCelda={(c) => onLugar(espacio.plano!.elementos.find((e) => e.celda === c)?.id ?? lugarPiso(c))} />
          </div>
          {sueltas > 0 && (
            <button type="button" onClick={() => onLugar(null)} className="bg-arena text-tinta flex min-h-12 w-full items-center gap-2 rounded-2xl border-0 px-3 text-left text-[15px] font-extrabold">
              <span className="flex-1">{T.sinUbicar}</span>
              {sueltas}
              <ChevronRight size={18} className="text-tinta-suave" aria-hidden />
            </button>
          )}
          <button type="button" onClick={onEditar} className="text-hoja-osc flex min-h-11 items-center justify-center gap-2 border-0 bg-transparent text-[15px] font-extrabold underline">
            <Pencil size={16} aria-hidden />
            {T.editar}
          </button>
        </>
      )}
    </section>
  )
}

/** Lo que hay en un lugar del plano (o sin ubicar) */
export function DetalleLugar({ espacio, lugar, onVerPlanta, onAgregar }: { espacio: Espacio; lugar: string | null; onVerPlanta: (p: Planta) => void; onAgregar: () => void }) {
  const vacio = plantasEn(espacio, lugar).length === 0
  return (
    <div className="flex flex-col gap-2.5 px-5 pb-6">
      {lugar === null && <p className="text-tinta-suave m-0 text-[14px] leading-snug font-bold">{T.sinUbicarAyuda}</p>}
      {vacio && <p className="text-tinta-suave m-0 text-[15px] leading-snug font-bold">{T.lugarVacio}</p>}
      <FilasPlantas espacio={espacio} lugar={lugar} onVerPlanta={onVerPlanta} />
      <BotonAgregarPlanta lleno={espacio.plantas.length >= MAX_PLANTAS_ESPACIO} onClick={onAgregar} />
    </div>
  )
}

/** Armado del plano en dos pasos: la forma y después los elementos. Nada se guarda hasta el final. */
export function EditorPlano({ espacio, onCerrar }: { espacio: Espacio | null; onCerrar: () => void }) {
  const guardar = useStore((s) => s.guardarPlano)
  const [de, setDe] = useState<string | null>(null)
  const [plano, setPlano] = useState<Plano>({ suelo: sueloDe('rectangulo'), elementos: [] })
  const [paso, setPaso] = useState<'forma' | 'elementos'>('forma')
  const [tipo, setTipo] = useState<TipoElemento>('ventana')
  const [aviso, setAviso] = useState(false)
  const [seguro, setSeguro] = useState(false)
  // Cada vez que se abre arranca desde lo guardado
  if (espacio && de !== espacio.id) {
    setDe(espacio.id)
    setPlano(espacio.plano ?? { suelo: sueloDe('rectangulo'), elementos: [] })
    setPaso('forma')
    setTipo('ventana')
    setAviso(false)
    setSeguro(false)
  }
  if (!espacio && de !== null) setDe(null)

  const tocar = (c: number) => {
    // Si en esa celda ya había uno igual, recupera su id: así sus plantas siguen ahí
    const previo = espacio?.plano?.elementos.find((e) => e.celda === c && e.tipo === tipo)
    const nuevo = tocarElemento(plano, c, tipo, previo?.id ?? `el-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`)
    setAviso(!nuevo)
    if (nuevo) setPlano(nuevo)
  }
  const terminar = (p: Plano | undefined) => {
    if (!espacio) return
    guardar(espacio.id, p)
    onCerrar()
  }
  const forma = paso === 'forma'

  return (
    <Panel
      abierto={espacio !== null}
      titulo={forma ? T.pasoForma : T.pasoElementos}
      onCerrar={() => (forma ? onCerrar() : setPaso('forma'))}
      pie={forma ? <Boton onClick={() => setPaso('elementos')}>{T.siguiente}</Boton> : <Boton onClick={() => terminar(plano)}>{T.guardar}</Boton>}
    >
      <div className="flex flex-col gap-4 px-5 pt-1 pb-6">
        <p className="text-tinta m-0 text-[14px] leading-snug font-bold">{forma ? T.ayudaForma : T.ayudaElementos}</p>
        {forma && (
          <div className="grid grid-cols-3 gap-2">
            {FORMAS.map((f) => (
              <button key={f} type="button" aria-pressed={formaDe(plano.suelo) === f} onClick={() => setPlano(conSuelo(plano, sueloDe(f)))} className={chip(formaDe(plano.suelo) === f)}>
                {T.formas[f]}
              </button>
            ))}
          </div>
        )}
        <Cuadricula plano={plano} modo={paso} onCelda={forma ? (c) => setPlano(alternarSuelo(plano, c)) : tocar} />
        {forma ? (
          espacio?.plano && (
            <button type="button" onClick={() => (seguro ? terminar(undefined) : setSeguro(true))} className="text-alerta min-h-11 border-0 bg-transparent text-[14px] font-extrabold underline">
              {seguro ? T.quitarSeguro : T.quitar}
            </button>
          )
        ) : (
          <>
            {aviso && (
              <p role="alert" className="text-alerta m-0 text-[14px] leading-snug font-extrabold">
                {T.pared}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              {TIPOS_ELEMENTO.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tipo === t}
                  onClick={() => {
                    setTipo(t)
                    setAviso(false)
                  }}
                  className={chip(tipo === t)}
                >
                  {T.tipo[t]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Panel>
  )
}

import { ChevronRight, Pencil } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Boton } from '../../components/Boton'
import { Panel } from '../../components/Panel'
import type { Planta } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { MAX_PLANTAS_ESPACIO } from '../../lib/espacios'
import { vibrar } from '../../lib/haptics'
import { CELDAS, FORMAS, LADO, MAX_LARGO, TIPOS_ELEMENTO, agregarElemento, alternarSuelo, conSuelo, elementoEn, formaDe, limpiarNombres, llevaPlantas, lugarPiso, numeroDe, plantasEn, quitarElemento, redimensionar, renombrar, sueloDe } from '../../lib/plano'
import type { ElementoPlano, Espacio, Plano, TipoElemento } from '../../lib/tipos'
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

/** El nombre propio o "Estante 2"; también "Piso" y "Sin ubicar" */
export function nombreDeLugar(plano: Plano | undefined, lugar: string | null): string {
  if (lugar === null) return T.sinUbicar
  const el = plano?.elementos.find((e) => e.id === lugar)
  if (!plano || !el) return T.piso
  if (el.nombre?.trim()) return el.nombre.trim()
  const n = numeroDe(plano, el)
  return n ? `${T.tipo[el.tipo]} ${n}` : T.tipo[el.tipo]
}

/** El espacio visto desde arriba. En 'forma' se toca cualquier celda; en el resto, solo las del piso. */
function Cuadricula({ plano, modo, espacio, elegido, onCelda }: { plano: Plano; modo: 'forma' | 'elementos' | 'ver'; espacio?: Espacio; elegido?: string | null; onCelda: (c: number) => void }) {
  return (
    <div className="mx-auto grid aspect-square w-full max-w-[360px] grid-cols-6 grid-rows-6 gap-1">
      {Array.from({ length: CELDAS }, (_, c) => {
        const piso = plano.suelo.includes(c)
        const el = modo === 'forma' ? undefined : elementoEn(plano, c)
        // Un elemento grande se dibuja una sola vez, desde su primer cuadradito
        if (el && el.celda !== c) return null
        const posicion = { gridColumn: `${(c % LADO) + 1} / span ${el?.ancho ?? 1}`, gridRow: `${Math.floor(c / LADO) + 1} / span ${el?.alto ?? 1}` }
        const lugar = el ? el.id : lugarPiso(c)
        const n = espacio && piso ? plantasEn(espacio, lugar).length : 0
        const nombre = el ? nombreDeLugar(plano, el.id) : piso ? T.piso : T.afuera
        const etiqueta = T.celda(Math.floor(c / LADO) + 1, (c % LADO) + 1, nombre, n)
        if (!piso && modo !== 'forma') return <span key={c} style={posicion} aria-hidden />
        // En el editor de forma, el cuadradito marca si es piso; los elementos se ven recién en el paso siguiente
        const clase = el ? COLOR[el.tipo] : !piso ? 'border-dashed border-arena-osc bg-transparent' : modo === 'forma' ? 'border-hoja-osc bg-arena-osc' : 'border-arena-osc bg-white'
        return (
          <button
            key={c}
            type="button"
            aria-label={etiqueta}
            aria-pressed={modo === 'forma' ? piso : el && modo === 'elementos' ? el.id === elegido : undefined}
            style={posicion}
            disabled={modo === 'ver' && el && !llevaPlantas(el.tipo)}
            onClick={() => {
              vibrar('toque')
              onCelda(c)
            }}
            className={`text-tinta relative grid min-h-0 min-w-0 place-content-center rounded-xl border-2 p-0 text-center text-[10px] leading-tight font-extrabold ${clase} ${el && el.id === elegido ? 'outline-tinta outline-3 outline-solid' : ''}`}
          >
            {(el || (n > 0 && modo === 'ver')) && (
              <span className="line-clamp-3 px-0.5 break-words" aria-hidden>
                {nombre}
              </span>
            )}
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
            <Cuadricula plano={espacio.plano} modo="ver" espacio={espacio} onCelda={(c) => onLugar(elementoEn(espacio.plano!, c)?.id ?? lugarPiso(c))} />
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

/** Nombre y tamaño del elemento tocado, con el plano a la vista */
function FichaElemento({ plano, elemento: el, onCambio, onListo }: { plano: Plano; elemento: ElementoPlano; onCambio: (p: Plano) => void; onListo: () => void }) {
  const sinNombre = { ...el, nombre: undefined }
  const caja = useRef<HTMLDivElement>(null)
  // Al elegir un elemento, la ficha queda entera a la vista
  useEffect(() => {
    caja.current?.scrollIntoView({ block: 'nearest' })
  }, [el.id])
  return (
    <div ref={caja} className="border-arena-osc flex flex-col gap-2.5 rounded-3xl border-2 bg-white p-3">
      <input
        value={el.nombre ?? ''}
        onChange={(e) => onCambio(renombrar(plano, el.id, e.target.value))}
        maxLength={30}
        placeholder={T.nombreEjemplo}
        aria-label={`${T.nombre}: ${nombreDeLugar({ ...plano, elementos: plano.elementos.map((x) => (x.id === el.id ? sinNombre : x)) }, el.id)}`}
        autoComplete="off"
        enterKeyHint="done"
        className="border-arena-osc text-tinta focus:border-hoja min-h-12 w-full min-w-0 rounded-full border-2 bg-white px-4 text-[16px] font-bold outline-none"
        style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
      />
      {(['ancho', 'alto'] as const).map((lado) => (
        <div key={lado} className="flex items-center gap-2">
          <span className="text-tinta w-14 text-[14px] font-extrabold">{T[lado]}</span>
          {Array.from({ length: MAX_LARGO }, (_, i) => i + 1).map((n) => {
            const actual = (el[lado] ?? 1) === n
            const nuevo = redimensionar(plano, el.id, lado === 'ancho' ? n : (el.ancho ?? 1), lado === 'alto' ? n : (el.alto ?? 1))
            return (
              <button key={n} type="button" aria-label={T.medida(T[lado], n)} aria-pressed={actual} disabled={!actual && !nuevo} onClick={() => nuevo && !actual && onCambio(nuevo)} className={`${chip(actual)} flex-1 disabled:opacity-35`}>
                {n}
              </button>
            )
          })}
        </div>
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            onCambio(quitarElemento(plano, el.id))
            onListo()
          }}
          className="text-alerta min-h-11 flex-1 border-0 bg-transparent text-[14px] font-extrabold underline"
        >
          {T.quitarElemento}
        </button>
        <button type="button" onClick={onListo} className={`${chip(true)} flex-1`}>
          {T.listo}
        </button>
      </div>
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
  const [elegido, setElegido] = useState<string | null>(null)
  const [aviso, setAviso] = useState(false)
  const [seguro, setSeguro] = useState(false)
  // Cada vez que se abre arranca desde lo guardado
  if (espacio && de !== espacio.id) {
    setDe(espacio.id)
    setPlano(espacio.plano ?? { suelo: sueloDe('rectangulo'), elementos: [] })
    setPaso('forma')
    setTipo('ventana')
    setElegido(null)
    setAviso(false)
    setSeguro(false)
  }
  if (!espacio && de !== null) setDe(null)

  const tocar = (c: number) => {
    const puesto = elementoEn(plano, c)
    if (puesto) {
      setElegido(puesto.id)
      setAviso(false)
      return
    }
    // Si en esa celda ya había uno igual guardado, recupera su id: así sus plantas siguen ahí
    const previo = espacio?.plano && elementoEn(espacio.plano, c)
    const libre = previo?.tipo === tipo && !plano.elementos.some((e) => e.id === previo.id)
    const id = libre ? previo.id : `el-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
    const nuevo = agregarElemento(plano, c, tipo, id)
    setAviso(!nuevo)
    if (!nuevo) return
    setPlano(nuevo)
    setElegido(id)
  }
  const actual = plano.elementos.find((e) => e.id === elegido)
  const terminar = (p: Plano | undefined) => {
    if (!espacio) return
    guardar(espacio.id, p && limpiarNombres(p))
    onCerrar()
  }
  const forma = paso === 'forma'

  return (
    <Panel
      abierto={espacio !== null}
      titulo={forma ? T.pasoForma : T.pasoElementos}
      onCerrar={() => {
        if (forma) return onCerrar()
        setElegido(null)
        setPaso('forma')
      }}
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
        <Cuadricula plano={plano} modo={paso} elegido={elegido} onCelda={forma ? (c) => setPlano(alternarSuelo(plano, c)) : tocar} />
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
            {actual ? (
              <FichaElemento plano={plano} elemento={actual} onCambio={setPlano} onListo={() => setElegido(null)} />
            ) : (
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
            )}
          </>
        )}
      </div>
    </Panel>
  )
}

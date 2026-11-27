import { Check, ChevronRight, Pencil, Plus, Sprout, Sun } from 'lucide-react'
import { useRef, useState, type CSSProperties, type PointerEvent as EventoPuntero } from 'react'
import { Boton } from '../../components/Boton'
import { Panel } from '../../components/Panel'
import type { Planta } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { MAX_PLANTAS_ESPACIO } from '../../lib/espacios'
import { vibrar } from '../../lib/haptics'
import type { CategoriaLuz } from '../../lib/luz'
import { luzDeLugar } from '../../lib/lugares'
import { CELDAS, FORMAS, LADO, alternarCelda, conSuelo, elementoEn, esReferencia, formaDe, franja, limpiar, lugarPiso, lugaresDe, nuevoElemento, numeroDe, pintarSuelo, plantasEn, puedeIr, quitarElemento, referenciasDe, renombrar, sueloDe, vaEnPared } from '../../lib/plano'
import type { ElementoPlano, Espacio, Plano, TipoElemento } from '../../lib/tipos'
import { useStore } from '../../store/useStore'
import { BotonAgregarPlanta, FilasPlantas } from './PlantasEspacio'

const T = TC.espacio.plano
/** Las referencias son bloques llenos y rectos (ventana y puerta con color propio, el resto gris); los lugares, tarjetas verdes con una hoja */
const REFERENCIA: Partial<Record<TipoElemento, string>> = { ventana: 'border-agua bg-agua text-white', puerta: 'border-terracota-osc bg-terracota-osc text-white' }
const FIJO = 'border-tinta-suave bg-tinta-suave text-white'
const LUGAR = 'border-hoja bg-brote text-hoja-osc'
const claseElemento = (t: TipoElemento) => (esReferencia(t) ? (REFERENCIA[t] ?? FIJO) : LUGAR)
type Paso = 'forma' | 'referencias' | 'lugares'

/** El color de cada cosa en chiquito, para la leyenda y la paleta */
const muestra = (t: TipoElemento | 'piso') =>
  `size-4 shrink-0 border-2 ${t === 'piso' ? 'rounded-xs border-arena-osc bg-white' : `${esReferencia(t) ? 'rounded-xs' : 'rounded-md'} ${claseElemento(t)}`}`
const chip = (activo: boolean) => `min-h-11 rounded-full border-2 px-2 text-[14px] font-extrabold ${activo ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-tinta bg-white'}`

/** El nombre propio o "Estante 2"; también "Piso" y "Sin ubicar" */
export function nombreDeLugar(plano: Plano | undefined, lugar: string | null): string {
  if (lugar === null) return T.sinUbicar
  const el = plano?.elementos.find((e) => e.id === lugar)
  if (!plano || !el) return T.enElPiso
  if (el.nombre?.trim()) return el.nombre.trim()
  const n = numeroDe(plano, el)
  return n ? `${T.tipo[el.tipo]} ${n}` : T.tipo[el.tipo]
}

/** Borde, separación y esquinas de un cuadradito de un elemento: se pega a sus vecinos del mismo elemento */
function forma(el: ElementoPlano, c: number): { caja: CSSProperties; fondo: CSSProperties } {
  const col = c % LADO
  const mismo = [el.celdas.includes(c - LADO), col < LADO - 1 && el.celdas.includes(c + 1), el.celdas.includes(c + LADO), col > 0 && el.celdas.includes(c - 1)]
  const r = esReferencia(el.tipo) ? 3 : 12
  const esquina = (a: number, b: number) => (mismo[a] || mismo[b] ? 0 : r)
  return {
    caja: { padding: mismo.map((m) => (m ? '0' : '2px')).join(' ') },
    fondo: { borderWidth: mismo.map((m) => (m ? '0' : '2px')).join(' '), borderRadius: `${esquina(3, 0)}px ${esquina(0, 1)}px ${esquina(1, 2)}px ${esquina(2, 3)}px` },
  }
}

/**
 * El espacio visto desde arriba. En 'forma' se toca cualquier celda; en el resto, solo las del piso.
 * `activo` es el elemento que se está tildando: marca dónde puede ir.
 * Con `onPintar` se puede deslizar el dedo: el primer cuadradito decide si se pinta o se despinta.
 */
function Cuadricula({ plano, modo, espacio, activo, onCelda, onPintar }: { plano: Plano; modo: Paso | 'ver'; espacio?: Espacio; activo?: ElementoPlano; onCelda: (c: number) => void; onPintar?: (c: number, pintar: boolean) => void }) {
  const trazo = useRef<{ pintar: boolean; x: number; y: number; ultima: number } | null>(null)
  const pintada = (c: number) => (activo ? activo.celdas.includes(c) : plano.suelo.includes(c))
  const celdaEn = (x: number, y: number) => {
    const c = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-celda]')?.dataset.celda
    return c === undefined ? null : Number(c)
  }
  const pasar = (c: number, pintar: boolean) => {
    if (pintada(c) !== pintar) vibrar('toque')
    onPintar?.(c, pintar)
  }
  const empezarTrazo = (e: EventoPuntero<HTMLDivElement>) => {
    const c = celdaEn(e.clientX, e.clientY)
    if (!onPintar || c === null || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    trazo.current = { pintar: !pintada(c), x: e.clientX, y: e.clientY, ultima: c }
    pasar(c, trazo.current.pintar)
  }
  const seguirTrazo = (e: EventoPuntero<HTMLDivElement>) => {
    const t = trazo.current
    if (!t) return
    // Se recorre el tramo de a poco para no saltearse cuadraditos si el dedo va rápido
    const pasos = Math.max(1, Math.ceil(Math.hypot(e.clientX - t.x, e.clientY - t.y) / 12))
    for (let i = 1; i <= pasos; i++) {
      const c = celdaEn(t.x + ((e.clientX - t.x) * i) / pasos, t.y + ((e.clientY - t.y) * i) / pasos)
      if (c === null || c === t.ultima) continue
      t.ultima = c
      pasar(c, t.pintar)
    }
    t.x = e.clientX
    t.y = e.clientY
  }
  const cortarTrazo = () => {
    trazo.current = null
  }
  const lugar = (c: number) => `${(c % LADO) + 1}`
  const renglon = (c: number) => `${Math.floor(c / LADO) + 1}`
  return (
    <div
      className={`mx-auto grid aspect-square w-full max-w-[360px] grid-cols-6 grid-rows-6 ${onPintar ? 'touch-none' : ''}`}
      onPointerDown={empezarTrazo}
      onPointerMove={seguirTrazo}
      onPointerUp={cortarTrazo}
      onPointerCancel={cortarTrazo}
    >
      {Array.from({ length: CELDAS }, (_, c) => {
        const piso = plano.suelo.includes(c)
        const el = modo === 'forma' ? undefined : elementoEn(plano, c)
        const posicion = { gridColumn: lugar(c), gridRow: renglon(c) }
        const n = espacio && piso && !el ? plantasEn(espacio, lugarPiso(c)).length : 0
        const nombre = el ? nombreDeLugar(plano, el.id) : !piso ? T.afuera : n > 0 ? T.enElPiso : T.piso
        const etiqueta = T.celda(Math.floor(c / LADO) + 1, (c % LADO) + 1, nombre, el && espacio ? plantasEn(espacio, el.id).length : n)
        if (!piso && modo !== 'forma') return <span key={c} style={posicion} aria-hidden />
        const tildado = el !== undefined && el.id === activo?.id
        const f = el ? forma(el, c) : null
        // Mientras se tilda un elemento, los cuadraditos donde puede ir se marcan con borde punteado y el resto se apaga
        const libre = activo && !el && puedeIr(plano, activo.tipo, c)
        const apagado = modo !== 'ver' && modo !== 'forma' && ((el && !tildado && (activo || esReferencia(el.tipo) !== (modo === 'referencias'))) || (activo && !el && !libre))
        const clase = el
          ? `${claseElemento(el.tipo)} ${tildado ? 'border-tinta!' : ''}`
          : !piso
            ? 'rounded-xl border-2 border-dashed border-arena-osc bg-transparent'
            : modo === 'forma'
              ? 'rounded-xl border-2 border-hoja-osc bg-arena-osc'
              : n > 0 || libre
                ? 'rounded-xl border-2 border-dashed border-hoja bg-white text-hoja-osc'
                : 'rounded-xl border-2 border-arena-osc bg-white text-tinta'
        return (
          <button
            key={c}
            type="button"
            data-celda={c}
            aria-label={etiqueta}
            aria-pressed={modo === 'forma' ? piso : activo ? tildado : undefined}
            style={{ ...posicion, ...(f ? f.caja : { padding: '2px' }) }}
            disabled={modo === 'ver' && el && esReferencia(el.tipo)}
            onClick={(ev) => {
              // Al pintar, el dedo y el mouse ya actuaron al apoyarse; el click queda para el teclado
              if (onPintar && ev.detail > 0) return
              vibrar('toque')
              onCelda(c)
            }}
            className={`relative grid min-h-0 min-w-0 border-0 bg-transparent ${apagado ? 'opacity-35' : ''}`}
          >
            <span style={f?.fondo} className={`grid min-h-0 min-w-0 place-content-center justify-items-center text-center text-[10px] leading-tight font-extrabold ${clase}`}>
              {tildado && <Check size={18} strokeWidth={3.5} aria-hidden />}
              {n > 0 && modo === 'ver' && (
                <>
                  <Sprout size={14} aria-hidden />
                  <span aria-hidden>{nombre}</span>
                </>
              )}
            </span>
            {n > 0 && (
              <span className="bg-hoja-osc absolute -top-1 -right-1 z-20 grid size-5 place-items-center rounded-full text-[11px] font-extrabold text-white" aria-hidden>
                {n}
              </span>
            )}
          </button>
        )
      })}
      {/* El nombre de cada elemento va una sola vez, sobre su tira más larga */}
      {modo !== 'forma' &&
        plano.elementos.map((el) => {
          const tira = franja(el)
          if (!tira.largo || el.id === activo?.id) return null
          const n = espacio ? plantasEn(espacio, el.id).length : 0
          const tenue = modo !== 'ver' && (activo || esReferencia(el.tipo) !== (modo === 'referencias'))
          return (
            <span
              key={el.id}
              aria-hidden
              style={{ gridColumn: `${lugar(tira.celda)} / span ${tira.largo}`, gridRow: renglon(tira.celda) }}
              className={`pointer-events-none relative z-10 grid min-w-0 place-content-center justify-items-center p-1 text-center text-[10px] leading-tight font-extrabold ${esReferencia(el.tipo) ? 'text-white' : 'text-hoja-osc'} ${tenue ? 'opacity-35' : ''}`}
            >
              {modo === 'ver' && !esReferencia(el.tipo) && <Sprout size={14} />}
              <span className="line-clamp-3 break-words">{nombreDeLugar(plano, el.id)}</span>
              {n > 0 && <span className="bg-hoja-osc absolute -top-1 -right-1 grid size-5 place-items-center rounded-full text-[11px] text-white">{n}</span>}
            </span>
          )
        })}
    </div>
  )
}

/** Qué es cada color del plano */
function Leyenda() {
  const filas = [
    ['ventana', T.tipo.ventana],
    ['puerta', T.tipo.puerta],
    ['placard', T.leyenda.fijo],
    ['mesa', T.leyenda.lugar],
    ['piso', T.leyenda.piso],
  ] as const
  return (
    <ul className="text-tinta m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-[13px] font-extrabold">
      {filas.map(([t, texto]) => (
        <li key={t} className="flex items-center gap-1.5">
          <span className={muestra(t)} aria-hidden />
          {texto}
        </li>
      ))}
    </ul>
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
          <Leyenda />
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

const CATEGORIAS: CategoriaLuz[] = ['directa', 'indirecta_brillante', 'indirecta_media', 'baja']

/** Cuánta luz hay en un lugar: estimada por la distancia a las ventanas, y se puede corregir */
function LuzDelLugar({ espacio, lugar }: { espacio: Espacio; lugar: string }) {
  const corregir = useStore((s) => s.corregirLuz)
  const [eligiendo, setEligiendo] = useState(false)
  const { luz, origen, distancia } = luzDeLugar(espacio, lugar)
  const L = T.luz
  const porQue = origen === 'ventana' ? L.distancia(distancia!) : { corregida: L.tuya, balcon: L.balcon, sin_ventana: L.sinVentana }[origen]
  const elegir = (c: CategoriaLuz | null) => {
    vibrar('toque')
    corregir(espacio.id, lugar, c)
    setEligiendo(false)
  }
  return (
    <section className="bg-sol-claro flex flex-col gap-1.5 rounded-2xl p-3">
      <div className="flex items-center gap-2">
        <Sun className="text-sol-osc shrink-0" aria-hidden />
        <h2 className="font-display text-tinta m-0 flex-1 text-[18px] leading-tight font-semibold">{TC.luz.categorias[luz.categoria]}</h2>
        <span className="text-sol-osc rounded-full bg-white px-2.5 py-0.5 text-[12px] font-extrabold tracking-wide uppercase">{origen === 'corregida' ? L.corregida : TC.luz.resumen.estimacion}</span>
      </div>
      <p className="text-tinta m-0 text-[14px] leading-snug font-bold">{porQue}</p>
      {eligiendo ? (
        <>
          <p className="text-tinta m-0 mt-1 text-[14px] font-extrabold">{L.pregunta}</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIAS.map((c) => (
              <button key={c} type="button" aria-pressed={luz.categoria === c} onClick={() => elegir(c)} className={chip(luz.categoria === c)}>
                {TC.luz.categorias[c]}
              </button>
            ))}
          </div>
          {origen === 'corregida' && (
            <button type="button" onClick={() => elegir(null)} className="text-hoja-osc min-h-11 border-0 bg-transparent text-[14px] font-extrabold underline">
              {L.automatica}
            </button>
          )}
        </>
      ) : (
        <button type="button" onClick={() => setEligiendo(true)} className="text-hoja-osc min-h-11 self-start border-0 bg-transparent p-0 text-[14px] font-extrabold underline">
          {L.corregir}
        </button>
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
      {lugar !== null && espacio.plano && <LuzDelLugar key={lugar} espacio={espacio} lugar={lugar} />}
      {vacio && <p className="text-tinta-suave m-0 text-[15px] leading-snug font-bold">{T.lugarVacio}</p>}
      <FilasPlantas espacio={espacio} lugar={lugar} onVerPlanta={onVerPlanta} />
      <BotonAgregarPlanta lleno={espacio.plantas.length >= MAX_PLANTAS_ESPACIO} onClick={onAgregar} />
    </div>
  )
}

/** Lo que se está poniendo: qué es, cómo tildarlo, su nombre y la opción de quitarlo */
function FichaElemento({ plano, elemento: el, onCambio, onQuitar }: { plano: Plano; elemento: ElementoPlano; onCambio: (p: Plano) => void; onQuitar: () => void }) {
  const tipo = T.tipo[el.tipo]
  return (
    <div className="border-tinta flex flex-col gap-2.5 rounded-3xl border-2 bg-white p-3">
      <div className="flex items-center gap-2">
        <span className={muestra(el.tipo)} aria-hidden />
        <h2 className="font-display text-tinta m-0 flex-1 text-[18px] font-semibold">{tipo}</h2>
        <button type="button" onClick={onQuitar} className="text-alerta min-h-11 border-0 bg-transparent px-1 text-[14px] font-extrabold underline">
          {T.quitarElemento(tipo)}
        </button>
      </div>
      <p className="text-tinta m-0 text-[14px] leading-snug font-bold">{vaEnPared(el.tipo) ? T.tildarPared : T.tildar}</p>
      <input
        value={el.nombre ?? ''}
        onChange={(e) => onCambio(renombrar(plano, el.id, e.target.value))}
        maxLength={30}
        placeholder={T.nombre}
        aria-label={`${T.nombre}: ${tipo}`}
        autoComplete="off"
        enterKeyHint="done"
        className="border-arena-osc text-tinta focus:border-hoja min-h-12 w-full min-w-0 rounded-full border-2 bg-white px-4 text-[15px] font-bold outline-none"
        style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
      />
    </div>
  )
}

/** Armado del plano en tres pasos: forma, referencias y lugares para plantas. Nada se guarda hasta el final. */
export function EditorPlano({ espacio, onCerrar }: { espacio: Espacio | null; onCerrar: () => void }) {
  const guardar = useStore((s) => s.guardarPlano)
  const [de, setDe] = useState<string | null>(null)
  const [plano, setPlano] = useState<Plano>({ suelo: sueloDe('rectangulo'), elementos: [] })
  const [paso, setPaso] = useState<Paso>('forma')
  /** El elemento que se está tildando; mientras haya uno, el botón grande lo termina en vez de cambiar de paso */
  const [activoId, setActivoId] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [seguro, setSeguro] = useState(false)
  // Cada vez que se abre arranca desde lo guardado
  if (espacio && de !== espacio.id) {
    setDe(espacio.id)
    setPlano(espacio.plano ?? { suelo: sueloDe('rectangulo'), elementos: [] })
    setPaso('forma')
    setActivoId(null)
    setAviso(null)
    setSeguro(false)
  }
  if (!espacio && de !== null) setDe(null)

  const activo = plano.elementos.find((e) => e.id === activoId)
  /** Termina el elemento que se estaba tildando; si quedó sin cuadraditos, no se agrega */
  const soltar = () => {
    setPlano(limpiar(plano))
    setActivoId(null)
    setAviso(null)
  }
  const empezar = (tipo: TipoElemento) => {
    const id = `el-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
    setPlano(nuevoElemento(plano, tipo, id))
    setActivoId(id)
    setAviso(null)
  }
  /** Tilda o destilda un cuadradito del elemento activo; si no se puede, avisa por qué */
  const tildar = (c: number, poner: boolean) => {
    if (!activo) return
    const id = activo.id
    const cambio = (p: Plano) => (p.elementos.find((e) => e.id === id)?.celdas.includes(c) === poner ? p : alternarCelda(p, id, c))
    const r = cambio(plano)
    setAviso(typeof r === 'string' ? (r === 'pared' ? T.pared : T.ocupado) : null)
    // Al deslizar llegan varios cambios seguidos: cada uno parte del anterior
    setPlano((p) => {
      const nuevo = cambio(p)
      return typeof nuevo === 'string' ? p : nuevo
    })
  }
  const pintar = (c: number, poner: boolean) => setPlano((p) => pintarSuelo(p, c, poner))
  const tocar = (c: number) => {
    if (activo) return tildar(c, !activo.celdas.includes(c))
    const puesto = elementoEn(plano, c)
    if (!puesto) return setAviso(T.primeroElegi)
    // Cada paso toca solo lo suyo
    const propio = esReferencia(puesto.tipo) === (paso === 'referencias')
    setActivoId(propio ? puesto.id : null)
    setAviso(propio ? null : esReferencia(puesto.tipo) ? T.esReferencia : T.esLugar)
  }
  const terminar = (p: Plano | undefined) => {
    if (!espacio) return
    guardar(espacio.id, p && limpiar(p))
    onCerrar()
  }
  const irA = (p: Paso) => {
    setPaso(p)
    setAviso(null)
  }
  /** Al dejar la forma, se va lo que quedó fuera del piso */
  const cerrarForma = () => {
    const nuevo = conSuelo(plano, plano.suelo)
    const perdidos = plano.elementos.length - nuevo.elementos.length
    setPlano(nuevo)
    irA('referencias')
    if (perdidos > 0) setAviso(T.quitadosPorForma(perdidos))
  }
  const esForma = paso === 'forma'
  const numero = { forma: 1, referencias: 2, lugares: 3 }[paso]
  const titulo = { forma: T.pasoForma, referencias: T.pasoReferencias, lugares: T.pasoLugares }[paso]
  const sinPiso = plano.suelo.length === 0
  const ayuda = { forma: sinPiso ? T.sinPiso : T.ayudaForma, referencias: T.ayudaReferencias(TC.espacio.enTu[espacio?.tipo ?? 'living']), lugares: T.ayudaLugares }[paso]
  const pie = activo ? (
    <Boton onClick={soltar}>{T.listoCon[activo.tipo]}</Boton>
  ) : esForma ? (
    <Boton disabled={sinPiso} onClick={cerrarForma}>
      {T.seguirReferencias}
    </Boton>
  ) : paso === 'referencias' ? (
    <Boton onClick={() => irA('lugares')}>{T.seguirLugares}</Boton>
  ) : (
    <Boton variante="sol" onClick={() => terminar(plano)}>
      {T.guardar}
    </Boton>
  )

  return (
    <Panel abierto={espacio !== null} titulo={titulo} onCerrar={() => (activo ? soltar() : esForma ? onCerrar() : irA(paso === 'lugares' ? 'referencias' : 'forma'))} pie={pie}>
      <div className="flex flex-col gap-3 px-5 pt-1 pb-6">
        <div>
          <p className="text-tinta-suave m-0 text-[13px] font-extrabold">{T.paso(numero)}</p>
          {!activo && <p className="text-tinta m-0 text-[14px] leading-snug font-bold">{ayuda}</p>}
        </div>
        {esForma && (
          <div className="grid grid-cols-3 gap-2">
            {FORMAS.map((f) => (
              <button key={f} type="button" aria-pressed={formaDe(plano.suelo) === f} onClick={() => setPlano({ ...plano, suelo: sueloDe(f) })} className={chip(formaDe(plano.suelo) === f)}>
                {T.formas[f]}
              </button>
            ))}
          </div>
        )}
        <Cuadricula
          plano={plano}
          modo={paso}
          activo={activo}
          onCelda={esForma ? (c) => pintar(c, !plano.suelo.includes(c)) : tocar}
          onPintar={esForma ? pintar : activo ? tildar : undefined}
        />
        {esForma ? (
          <>
            <button type="button" disabled={sinPiso} onClick={() => setPlano({ ...plano, suelo: [] })} className="text-hoja-osc min-h-11 border-0 bg-transparent text-[15px] font-extrabold underline disabled:opacity-40">
              {T.despintarTodo}
            </button>
            {espacio?.plano && (
              <button type="button" onClick={() => (seguro ? terminar(undefined) : setSeguro(true))} className="text-alerta min-h-11 border-0 bg-transparent text-[14px] font-extrabold underline">
                {seguro ? T.quitarSeguro : T.quitar}
              </button>
            )}
          </>
        ) : (
          <>
            {aviso && (
              <p role="alert" className="text-alerta m-0 text-[14px] leading-snug font-extrabold">
                {aviso}
              </p>
            )}
            {activo ? (
              <FichaElemento
                plano={plano}
                elemento={activo}
                onCambio={setPlano}
                onQuitar={() => {
                  setPlano(quitarElemento(plano, activo.id))
                  setActivoId(null)
                  setAviso(null)
                }}
              />
            ) : (
              <>
                <h2 className="font-display text-tinta m-0 text-[18px] font-semibold">{T.queAgregar}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {(!espacio ? [] : paso === 'referencias' ? referenciasDe(espacio.tipo) : lugaresDe(espacio.tipo)).map((t) => (
                    <button key={t} type="button" aria-label={T.agregar(T.tipo[t])} onClick={() => empezar(t)} className="border-arena-osc text-tinta flex min-h-12 items-center gap-2 rounded-full border-2 bg-white px-3 text-[15px] font-extrabold">
                      <Plus size={17} strokeWidth={3} className="text-hoja-osc shrink-0" aria-hidden />
                      <span className={muestra(t)} aria-hidden />
                      {T.tipo[t]}
                    </button>
                  ))}
                </div>
                {plano.elementos.some((e) => esReferencia(e.tipo) === (paso === 'referencias')) && <p className="text-tinta-suave m-0 text-[13px] leading-snug font-bold">{T.ayudaCambiar}</p>}
              </>
            )}
          </>
        )}
      </div>
    </Panel>
  )
}

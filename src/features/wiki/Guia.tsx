import { BookOpen, ChevronRight, Leaf, Lock, Search, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Boton } from '../../components/Boton'
import { FotoPlanta } from '../../components/FotoPlanta'
import { Panel } from '../../components/Panel'
import { Rico } from '../../components/Rico'
import { LECCIONES_POR_UNIDAD } from '../../data/lessons'
import { PLANTAS, type Planta } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { UNIDADES } from '../../data/unidades'
import { WIKI, entradaPorId, type Entrada } from '../../data/wiki'
import { LECCIONES_LISTADAS, buscarEntradas, buscarLecciones, buscarPlantas, type LeccionListada } from '../../lib/buscar'
import { construirCamino, type EstadoNodo } from '../../lib/camino'
import { planDeCamino } from '../../lib/perfil'
import type { UnidadId } from '../../lib/tipos'
import { useStore } from '../../store/useStore'
import { FichaPlanta } from '../pets/FichaPlanta'
import type { Sesion } from '../quiz/Reproductor'

const G = TC.guia
const LECCION = new Map(LECCIONES_LISTADAS.map((l) => [l.id, l]))
const UNIDADES_EN_ORDEN = Object.values(UNIDADES).sort((a, b) => a.numero - b.numero)

function Fila({ icono, titulo, texto, onClick, bloqueada }: { icono: ReactNode; titulo: string; texto?: string; onClick?: () => void; bloqueada?: boolean }) {
  return (
    <button type="button" disabled={!onClick} onClick={onClick} className="border-arena flex w-full items-center gap-3 border-0 border-b-2 bg-transparent px-3.5 py-3 text-left last:border-b-0 active:opacity-70 disabled:opacity-60">
      <span className="text-hoja-osc shrink-0">{icono}</span>
      <span className="min-w-0 flex-1">
        <span className="font-display text-tinta block text-[16px] leading-tight font-semibold">{titulo}</span>
        {texto && <span className="text-tinta-suave block text-[13px] leading-snug font-bold">{texto}</span>}
      </span>
      {bloqueada ? <Lock size={16} className="text-tinta-suave shrink-0" aria-hidden /> : <ChevronRight size={18} className="text-tinta-suave shrink-0" aria-hidden />}
    </button>
  )
}

const Tarjeta = ({ children }: { children: ReactNode }) => <div className="border-arena-osc overflow-hidden rounded-3xl border-2 bg-white">{children}</div>
const Subtitulo = ({ children }: { children: ReactNode }) => <h2 className="text-tinta-suave mt-5 mb-2 text-[13px] font-extrabold tracking-wide uppercase">{children}</h2>

interface Props {
  abierta: boolean
  /** Si viene, la guía se abre directo en esa ficha y al volver se cierra */
  entradaInicial: string | null
  onCerrar: () => void
  onJugar: (s: Sesion) => void
}

export function Guia({ abierta, entradaInicial, onCerrar, onJugar }: Props) {
  const s = useStore()
  const [busqueda, setBusqueda] = useState('')
  // Fichas abiertas, una arriba de la otra: al tocar una relacionada se apila, y "volver" la saca
  const [pila, setPila] = useState<string[]>(entradaInicial ? [entradaInicial] : [])
  const [planta, setPlanta] = useState<Planta | null>(null)

  const estados = useMemo(() => {
    const plan = planDeCamino(s.perfil ?? 'primerizo', s.mascotas, s.respuestas?.objetivo ?? 'basico')
    const camino = construirCamino(plan.orden, LECCIONES_POR_UNIDAD, s)
    return new Map<string, EstadoNodo>(camino.tramos.flatMap((t) => t.nodos.map((n) => [n.id, n.estado] as const)))
  }, [s])
  const abiertaLeccion = (id: string) => (estados.get(id) ?? 'bloqueado') !== 'bloqueado'
  const jugar = (id: string) => onJugar({ tipo: 'leccion', leccionId: id })

  const q = busqueda.trim()
  const entrada = pila.length ? entradaPorId(pila[pila.length - 1]) : undefined
  const volver = () => {
    if (pila.length === 1 && entradaInicial) onCerrar()
    else setPila(pila.slice(0, -1))
  }

  const filaEntrada = (e: Entrada) => <Fila key={e.id} icono={<BookOpen size={20} aria-hidden />} titulo={e.termino} texto={e.resumen} onClick={() => setPila([...pila, e.id])} />
  const filaLeccion = (l: LeccionListada) => (
    <Fila
      key={l.id}
      icono={<Leaf size={20} aria-hidden />}
      titulo={l.titulo}
      texto={G.unidad(UNIDADES[l.unidad].numero, UNIDADES[l.unidad].titulo)}
      bloqueada={!abiertaLeccion(l.id)}
      onClick={abiertaLeccion(l.id) ? () => jugar(l.id) : undefined}
    />
  )

  const conceptos = q ? buscarEntradas(WIKI, q) : []
  const lecciones = q ? buscarLecciones(q) : []
  const plantas = q ? buscarPlantas(PLANTAS, q) : []

  return (
    <>
      {/* Si se abrió directo en una ficha, la lista no se muestra: al volver se cierra todo */}
      <Panel abierto={abierta && !entradaInicial} titulo={G.titulo} onCerrar={onCerrar}>
        <div className="px-5 pb-8">
          <p className="text-tinta mt-0 mb-3 text-[15px] leading-snug font-bold">{G.intro}</p>
          <div className="border-arena-osc focus-within:border-hoja flex min-h-12 items-center gap-2 rounded-full border-2 bg-white px-4">
            <Search size={18} className="text-tinta-suave shrink-0" aria-hidden />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={G.buscar}
              aria-label={G.buscar}
              autoComplete="off"
              className="text-tinta min-w-0 flex-1 border-0 bg-transparent py-2 text-[16px] font-bold outline-none placeholder:font-semibold [&::-webkit-search-cancel-button]:hidden"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            />
            {busqueda && (
              <button type="button" aria-label={TC.plantas.borrarBusqueda} onClick={() => setBusqueda('')} className="text-tinta-suave grid size-8 shrink-0 place-items-center border-0 bg-transparent p-0">
                <X size={18} aria-hidden />
              </button>
            )}
          </div>

          {q ? (
            conceptos.length + lecciones.length + plantas.length === 0 ? (
              <p className="text-tinta-suave py-10 text-center text-[15px] font-bold">{G.sinResultados}</p>
            ) : (
              <>
                {conceptos.length > 0 && (
                  <>
                    <Subtitulo>{G.conceptos}</Subtitulo>
                    <Tarjeta>{conceptos.map(filaEntrada)}</Tarjeta>
                  </>
                )}
                {lecciones.length > 0 && (
                  <>
                    <Subtitulo>{G.lecciones}</Subtitulo>
                    <Tarjeta>{lecciones.map(filaLeccion)}</Tarjeta>
                  </>
                )}
                {plantas.length > 0 && (
                  <>
                    <Subtitulo>{G.plantas}</Subtitulo>
                    <Tarjeta>
                      {plantas.map((p) => (
                        <Fila key={p.id} icono={<FotoPlanta planta={p} className="size-11 rounded-xl" />} titulo={p.nombre_comun} texto={p.nombre_cientifico} onClick={() => setPlanta(p)} />
                      ))}
                    </Tarjeta>
                  </>
                )}
              </>
            )
          ) : (
            UNIDADES_EN_ORDEN.map((u) => {
              const suyas = WIKI.filter((e) => e.unidad === u.id).sort((a, b) => a.termino.localeCompare(b.termino, 'es'))
              if (suyas.length === 0) return null
              return (
                <section key={u.id}>
                  <h2 className="font-display mt-5 mb-2 flex items-center gap-2 text-[18px] font-semibold" style={{ color: u.colorOsc }}>
                    <span className="size-3 rounded-full" style={{ background: u.color }} aria-hidden />
                    {u.titulo}
                  </h2>
                  <Tarjeta>{suyas.map(filaEntrada)}</Tarjeta>
                </section>
              )
            })
          )}
        </div>
      </Panel>

      <Panel abierto={abierta && entrada !== undefined} titulo={G.titulo} onCerrar={volver}>
        {entrada && <Ficha key={entrada.id} entrada={entrada} abiertaLeccion={abiertaLeccion} hecha={(id) => estados.get(id) === 'completado'} onJugar={jugar} onEntrada={(id) => setPila([...pila, id])} />}
      </Panel>

      <Panel abierto={abierta && planta !== null} onCerrar={() => setPlanta(null)}>
        {planta && <FichaPlanta planta={planta} />}
      </Panel>
    </>
  )
}

function Ficha({ entrada: e, abiertaLeccion, hecha, onJugar, onEntrada }: { entrada: Entrada; abiertaLeccion: (id: string) => boolean; hecha: (id: string) => boolean; onJugar: (id: string) => void; onEntrada: (id: string) => void }) {
  const u = UNIDADES[e.unidad as UnidadId]
  const relacionadas = e.relacionadas.map(entradaPorId).filter((x): x is Entrada => Boolean(x))
  const lecciones = e.lecciones.map((id) => LECCION.get(id)).filter((x): x is LeccionListada => Boolean(x))
  return (
    <article className="px-5 pb-8">
      <span className="inline-block rounded-full px-3 py-1 text-[12px] font-extrabold tracking-wide text-white uppercase" style={{ background: u.colorOsc }}>
        {u.titulo}
      </span>
      <h2 className="font-display text-hoja-osc mt-2 mb-1 text-[30px] leading-tight font-semibold">{e.termino}</h2>
      {e.sinonimos.length > 0 && <p className="text-tinta-suave m-0 text-[13px] font-bold">{e.sinonimos.join(' · ')}</p>}
      <p className="bg-brote text-hoja-osc mt-3 mb-0 rounded-2xl p-3 text-[17px] leading-snug font-extrabold">{e.resumen}</p>
      {e.cuerpo.map((parrafo) => (
        <p key={parrafo} className="text-tinta mt-3 mb-0 text-[16px] leading-relaxed font-semibold">
          <Rico texto={parrafo} />
        </p>
      ))}
      {e.no_confundir && (
        <div className="bg-sol-claro mt-4 rounded-2xl p-3">
          <div className="text-tinta text-[13px] font-extrabold uppercase">{G.noConfundir}</div>
          <p className="text-tinta m-0 mt-1 text-[15px] leading-snug font-bold">{e.no_confundir}</p>
        </div>
      )}

      {lecciones.length > 0 && (
        <>
          <h3 className="font-display text-tinta mt-6 mb-2 text-[20px] font-semibold">{G.profundizar}</h3>
          <div className="flex flex-col gap-2.5">
            {lecciones.map((l) => {
              const ul = UNIDADES[l.unidad]
              const abierta = abiertaLeccion(l.id)
              return (
                <div key={l.id} className="border-arena-osc rounded-3xl border-2 bg-white p-3.5">
                  <p className="m-0 text-[12px] font-extrabold tracking-wide uppercase" style={{ color: ul.colorOsc }}>
                    {G.unidad(ul.numero, ul.titulo)}
                  </p>
                  <p className="font-display text-tinta mt-0.5 mb-3 text-[18px] leading-tight font-semibold">{l.titulo}</p>
                  {abierta ? (
                    <Boton variante={hecha(l.id) ? 'secundario' : 'primario'} onClick={() => onJugar(l.id)}>
                      {hecha(l.id) ? G.repasar : G.empezar}
                    </Boton>
                  ) : (
                    <p className="text-tinta-suave m-0 flex items-start gap-2 text-[14px] leading-snug font-bold">
                      <Lock size={16} className="mt-0.5 shrink-0" aria-hidden />
                      {G.bloqueada}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {relacionadas.length > 0 && (
        <>
          <h3 className="font-display text-tinta mt-6 mb-2 text-[20px] font-semibold">{G.relacionadas}</h3>
          <div className="flex flex-wrap gap-2">
            {relacionadas.map((r) => (
              <button key={r.id} type="button" onClick={() => onEntrada(r.id)} className="border-arena-osc text-tinta min-h-11 rounded-full border-2 bg-white px-4 text-[15px] font-extrabold">
                {r.termino}
              </button>
            ))}
          </div>
        </>
      )}
      <p className="text-tinta-suave mt-6 mb-0 text-[13px] leading-snug font-bold">{G.fuentes}</p>
    </article>
  )
}

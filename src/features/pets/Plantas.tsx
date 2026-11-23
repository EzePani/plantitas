import { BookOpen, ChevronRight, Search, SlidersHorizontal, TriangleAlert, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { FotoPlanta } from '../../components/FotoPlanta'
import { ListaFuentes } from '../../components/ListaFuentes'
import { Panel } from '../../components/Panel'
import { PELIGROSAS, PLANTAS, type CategoriaLuz, type Clase, type Planta, type Porte } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { WIKI } from '../../data/wiki'
import { buscarEntradas, buscarPlantas, normal } from '../../lib/buscar'
import { SIN_FILTROS, alternar, filtrosActivos, pasaFiltros, type Filtros } from '../../lib/catalogo'
import { vibrar } from '../../lib/haptics'
import type { TipoMascota } from '../../lib/tipos'
import { useStore } from '../../store/useStore'
import { BotonFavorita, CalceEspacios } from './Favorita'
import { BotonPie, MiLista } from './Lista'
import { FichaPlanta } from './FichaPlanta'
import { Hijitos } from './Hijitos'
import { hoyLocal } from '../../lib/fecha'
import { hijitosConAviso } from '../../lib/hijitos'
import { Semaforo } from './Semaforo'

const P = TC.plantas
const MASCOTAS: TipoMascota[] = ['ninguna', 'gato', 'perro', 'ambos']
const CLASES: Clase[] = ['follaje', 'suculenta', 'cactus', 'con_flor']
const LUCES: CategoriaLuz[] = ['directa', 'indirecta_brillante', 'indirecta_media', 'baja']
const PORTES: Porte[] = ['trepadora', 'colgante', 'erguida', 'roseta']

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={() => {
        vibrar('toque')
        onClick()
      }}
      className={`min-h-11 rounded-full border-2 px-4 text-[15px] font-extrabold ${activo ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-tinta bg-white'}`}
    >
      {children}
    </button>
  )
}

function Grupo({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="font-display text-tinta mt-0 mb-1 text-[18px] font-semibold">{titulo}</h2>
      {ayuda && <p className="text-tinta-suave mt-0 mb-2 text-[13px] font-bold">{ayuda}</p>}
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </section>
  )
}

export function TarjetaPlanta({ planta, onClick, detalle, corazon = true, calce, extra }: { planta: Planta; onClick: () => void; detalle?: string; corazon?: boolean; calce?: boolean; extra?: ReactNode }) {
  return (
    <div className="border-arena-osc rounded-3xl border-2 bg-white shadow-[0_3px_0_var(--color-arena-osc)]">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => {
            vibrar('toque')
            onClick()
          }}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-3xl border-0 bg-transparent p-2.5 text-left active:opacity-70"
        >
          <FotoPlanta planta={planta} className="size-[76px] shrink-0 rounded-2xl" />
          <span className="min-w-0 flex-1">
            <span className="font-display text-tinta block text-[18px] leading-tight font-semibold">{planta.nombre_comun}</span>
            <span className="text-tinta-suave block truncate text-[13px] font-bold italic">{planta.nombre_cientifico}</span>
            {detalle ? (
              <span className="text-tinta mt-1 block text-[14px] leading-snug font-bold">{detalle}</span>
            ) : (
              <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Semaforo planta={planta} especie="gato" compacto />
                <Semaforo planta={planta} especie="perro" compacto />
                <span className="text-tinta-suave text-[12px] font-extrabold">
                  {TC.luz.categorias[planta.luz_requerida]} · {P.dificultad[planta.dificultad]}
                </span>
              </span>
            )}
          </span>
          {!corazon && !extra && <ChevronRight size={20} className="text-tinta-suave shrink-0" aria-hidden />}
        </button>
        {extra}
        {corazon && <BotonFavorita planta={planta} className="mr-1.5" />}
      </div>
      {calce && (
        <div className="border-arena border-t-2 px-3.5 py-2.5">
          <CalceEspacios planta={planta} compacto />
        </div>
      )}
    </div>
  )
}

export function Plantas({ onGuia }: { onGuia: (entradaId: string) => void }) {
  const mascotas = useStore((s) => s.mascotas.tipo)
  // Si hay mascotas en el perfil, el catálogo arranca filtrado para ellas
  const [filtros, setFiltros] = useState<Filtros>({ ...SIN_FILTROS, mascotas })
  const cambiar = (cambio: Partial<Filtros>) => setFiltros((f) => ({ ...f, ...cambio }))
  const [abierta, setAbierta] = useState<Planta | null>(null)
  const [verPeligrosas, setVerPeligrosas] = useState(false)
  const [verFiltros, setVerFiltros] = useState(false)
  const [vista, setVista] = useState<'catalogo' | 'lista' | 'hijitos'>('catalogo')
  const avisos = useStore((s) => hijitosConAviso(s.hijitos, hoyLocal()))
  const [busqueda, setBusqueda] = useState('')
  const q = normal(busqueda)
  const activos = filtrosActivos(filtros)

  // Si se busca, se mira todo el catálogo (nombre común, otros nombres y científico), sin filtros
  const lista = q ? buscarPlantas(PLANTAS, q) : PLANTAS.filter((p) => pasaFiltros(p, filtros)).sort((a, b) => a.nombre_comun.localeCompare(b.nombre_comun, 'es'))
  const conceptos = q ? buscarEntradas(WIKI, q).slice(0, 4) : []

  return (
    <div className="safe-top relative flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 px-5 pt-4">
        <h1 className="font-display text-hoja-osc m-0 text-[30px] font-semibold">{P.titulo}</h1>
      </header>
      <div className="shrink-0 px-5 pt-3" role="tablist" aria-label={P.titulo}>
        <div className="bg-arena flex rounded-full p-1">
          {(['catalogo', 'lista', 'hijitos'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={vista === v}
              onClick={() => {
                vibrar('toque')
                setVista(v)
              }}
              className={`relative min-h-10 flex-1 rounded-full border-0 text-[14px] font-extrabold ${vista === v ? 'text-hoja-osc bg-white shadow-sm' : 'text-tinta-suave bg-transparent'}`}
            >
              {P.vistas[v]}
              {v === 'hijitos' && avisos > 0 && <span className="bg-agua absolute top-1 right-2 grid size-5 place-items-center rounded-full text-[11px] font-extrabold text-white">{avisos}</span>}
            </button>
          ))}
        </div>
      </div>
      {vista === 'catalogo' && (
        <div className="flex shrink-0 items-center gap-2 px-5 py-3">
          <div className="border-arena-osc focus-within:border-hoja flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-full border-2 bg-white px-4">
            <Search size={18} className="text-tinta-suave shrink-0" aria-hidden />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={P.buscar}
              aria-label={P.buscar}
              autoComplete="off"
              className="text-tinta min-w-0 flex-1 border-0 bg-transparent py-2 text-[16px] font-bold outline-none placeholder:font-semibold [&::-webkit-search-cancel-button]:hidden"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            />
            {busqueda && (
              <button type="button" aria-label={P.borrarBusqueda} onClick={() => setBusqueda('')} className="text-tinta-suave grid size-8 shrink-0 place-items-center border-0 bg-transparent p-0">
                <X size={18} aria-hidden />
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label={P.filtrosPanel.boton}
            onClick={() => {
              vibrar('toque')
              setVerFiltros(true)
            }}
            className={`relative grid size-12 shrink-0 place-items-center rounded-full border-2 ${activos ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-tinta bg-white'}`}
          >
            <SlidersHorizontal size={20} aria-hidden />
            {activos > 0 && <span className="bg-sol text-tinta absolute -top-1 -right-1 grid size-5 place-items-center rounded-full text-[11px] font-extrabold">{activos}</span>}
          </button>
        </div>
      )}

      {vista === 'hijitos' ? (
        <div className="scroll-app min-h-0 flex-1 overflow-x-hidden">
          <Hijitos onGuia={onGuia} />
        </div>
      ) : vista === 'lista' ? (
        <div className="scroll-app min-h-0 flex-1 overflow-x-hidden">
          <MiLista onAbrir={setAbierta} />
        </div>
      ) : (
      <div className="scroll-app min-h-0 flex-1 overflow-x-hidden px-5 pb-6">
        {PELIGROSAS.length > 0 && (
          <button
            type="button"
            onClick={() => setVerPeligrosas(true)}
            className="border-alerta bg-alerta-clara mb-3 flex w-full items-center gap-3 rounded-3xl border-2 p-3 text-left"
          >
            <span className="bg-alerta grid size-11 shrink-0 place-items-center rounded-full text-white">
              <TriangleAlert aria-hidden />
            </span>
            <span className="flex-1">
              <span className="font-display text-alerta block text-[17px] font-semibold">{P.peligrosas.titulo}</span>
              <span className="text-tinta block text-[13px] leading-snug font-bold">{P.peligrosas.texto}</span>
            </span>
            <ChevronRight size={20} className="text-alerta shrink-0" aria-hidden />
          </button>
        )}
        <p className="text-tinta-suave mt-0 mb-2 text-[13px] font-extrabold">{P.cuenta(lista.length)}</p>
        {lista.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-tinta-suave m-0 text-[15px] font-bold">{q ? (conceptos.length ? P.sinPlantas : P.sinResultados) : P.vacio}</p>
            {!q && activos > 0 && (
              <button type="button" onClick={() => setFiltros(SIN_FILTROS)} className="text-hoja-osc mt-3 min-h-11 border-0 bg-transparent p-0 text-[15px] font-extrabold underline">
                {P.filtrosPanel.limpiar}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {lista.map((p) => (
              <TarjetaPlanta key={p.id} planta={p} onClick={() => setAbierta(p)} />
            ))}
          </div>
        )}
        {conceptos.length > 0 && (
          <section className="mt-5">
            <h2 className="text-tinta-suave mt-0 mb-2 text-[13px] font-extrabold">{P.enLaGuia}</h2>
            <div className="border-arena-osc overflow-hidden rounded-3xl border-2 bg-white">
              {conceptos.map((e) => (
                <button key={e.id} type="button" onClick={() => onGuia(e.id)} className="border-arena flex w-full items-center gap-3 border-0 border-b-2 bg-transparent px-3.5 py-3 text-left last:border-b-0 active:opacity-70">
                  <BookOpen size={20} className="text-hoja-osc shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="font-display text-tinta block text-[16px] leading-tight font-semibold">{e.termino}</span>
                    <span className="text-tinta-suave block text-[13px] leading-snug font-bold">{e.resumen}</span>
                  </span>
                  <ChevronRight size={18} className="text-tinta-suave shrink-0" aria-hidden />
                </button>
              ))}
            </div>
          </section>
        )}
        <p className="text-tinta-suave mt-5 mb-0 text-[13px] leading-snug font-bold">{P.ficha.disclaimer}</p>
      </div>
      )}

      <Panel abierto={verFiltros} titulo={P.filtrosPanel.titulo} onCerrar={() => setVerFiltros(false)} pie={<BotonPie onClick={() => setVerFiltros(false)}>{P.filtrosPanel.listo(PLANTAS.filter((p) => pasaFiltros(p, filtros)).length)}</BotonPie>}>
        <div className="px-5 pt-2 pb-6">
          <Grupo titulo={P.filtrosPanel.tipo}>
            {CLASES.map((c) => (
              <Chip key={c} activo={filtros.clases.includes(c)} onClick={() => cambiar({ clases: alternar(filtros.clases, c) })}>
                {P.clase[c]}
              </Chip>
            ))}
          </Grupo>
          <Grupo titulo={P.filtrosPanel.mas}>
            <Chip activo={filtros.facil} onClick={() => cambiar({ facil: !filtros.facil })}>
              {P.filtrosPanel.facil}
            </Chip>
            <Chip activo={filtros.conTutor} onClick={() => cambiar({ conTutor: !filtros.conTutor })}>
              {P.filtrosPanel.conTutor}
            </Chip>
            <Chip activo={filtros.enAgua} onClick={() => cambiar({ enAgua: !filtros.enAgua })}>
              {P.filtrosPanel.enAgua}
            </Chip>
          </Grupo>
          <Grupo titulo={P.filtrosPanel.luz} ayuda={P.filtrosPanel.luzAyuda}>
            {LUCES.map((l) => (
              <Chip key={l} activo={filtros.luz.includes(l)} onClick={() => cambiar({ luz: alternar(filtros.luz, l) })}>
                {TC.luz.categorias[l]}
              </Chip>
            ))}
          </Grupo>
          <Grupo titulo={P.filtrosPanel.forma}>
            {PORTES.map((x) => (
              <Chip key={x} activo={filtros.porte.includes(x)} onClick={() => cambiar({ porte: alternar(filtros.porte, x) })}>
                {P.porte[x]}
              </Chip>
            ))}
          </Grupo>
          <Grupo titulo={P.filtrosPanel.aptaPara}>
            {MASCOTAS.map((m) => (
              <Chip key={m} activo={filtros.mascotas === m} onClick={() => cambiar({ mascotas: m })}>
                {P.filtros[m]}
              </Chip>
            ))}
          </Grupo>
          {activos > 0 && (
            <button type="button" onClick={() => setFiltros(SIN_FILTROS)} className="text-hoja-osc min-h-11 border-0 bg-transparent p-0 text-[15px] font-extrabold underline">
              {P.filtrosPanel.limpiar}
            </button>
          )}
        </div>
      </Panel>

      <Panel abierto={abierta !== null} onCerrar={() => setAbierta(null)}>
        {abierta && <FichaPlanta planta={abierta} />}
      </Panel>

      <Panel abierto={verPeligrosas} titulo={P.peligrosas.titulo} onCerrar={() => setVerPeligrosas(false)}>
        <div className="flex flex-col gap-4 px-5 pb-8">
          {PELIGROSAS.map((x) => (
            <section key={x.id} className="border-alerta rounded-3xl border-2 bg-white p-4">
              <h2 className="font-display text-alerta m-0 text-[20px] leading-tight font-semibold">{x.nombre}</h2>
              <p className="text-tinta-suave m-0 text-[13px] font-bold italic">{x.nombre_cientifico}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {x.afecta.map((a) => (
                  <span key={a} className="bg-alerta rounded-full px-3 py-1 text-[13px] font-extrabold text-white">
                    {P.peligrosas.afecta[a]}
                  </span>
                ))}
                <span className="bg-alerta-clara text-alerta rounded-full px-3 py-1 text-[13px] font-extrabold">{P.gravedad[x.gravedad]}</span>
              </div>
              <p className="text-tinta mt-3 mb-0 text-[16px] leading-snug font-extrabold">{x.advertencia}</p>
              <p className="text-tinta mt-2 mb-0 text-[14px] leading-snug font-bold">{x.que_pasa}</p>
              <p className="text-tinta-suave mt-2 mb-3 text-[14px] leading-snug font-bold">
                {P.peligrosas.partes}: {x.partes}
              </p>
              {x.no_confundir && (
                <p className="bg-sol-claro text-tinta mt-0 mb-3 rounded-2xl p-3 text-[14px] leading-snug font-bold">
                  {P.peligrosas.noConfundir}: {x.no_confundir}
                </p>
              )}
              <ListaFuentes fuentes={x.fuentes} />
            </section>
          ))}
          <p className="text-tinta-suave m-0 text-[13px] leading-snug font-bold">{P.ficha.disclaimer}</p>
        </div>
      </Panel>
    </div>
  )
}

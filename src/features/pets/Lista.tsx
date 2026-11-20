import { Bookmark, Check, Heart, Pencil, Plus, Share2, Trash2, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { FotoPlanta } from '../../components/FotoPlanta'
import { Panel } from '../../components/Panel'
import { plantaPorId, type Planta } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { compartirTexto, textoDeLista, textoDePlanta } from '../../lib/compartir'
import { vibrar } from '../../lib/haptics'
import { useStore } from '../../store/useStore'
import { TarjetaPlanta } from './Plantas'

const C = TC.plantas.colecciones
const S = TC.plantas.compartir

const botonIcono = 'text-tinta-suave grid size-11 shrink-0 place-items-center rounded-full border-0 bg-transparent active:scale-90'

/** Botón de compartir: menú del celu o, si no hay, copia el texto */
export function BotonCompartir({ texto, titulo, etiqueta, className = '' }: { texto: () => string; titulo: string; etiqueta: string; className?: string }) {
  const [copiado, setCopiado] = useState(false)
  return (
    <button
      type="button"
      aria-label={etiqueta}
      onClick={async () => {
        vibrar('toque')
        const r = await compartirTexto(texto(), titulo)
        if (r === 'copiado') {
          setCopiado(true)
          setTimeout(() => setCopiado(false), 1800)
        }
      }}
      className={`${botonIcono} ${className}`}
    >
      {copiado ? <Check size={22} strokeWidth={2.6} className="text-hoja" aria-hidden /> : <Share2 size={22} strokeWidth={2.4} aria-hidden />}
      {copiado && <span className="sr-only" role="status">{S.copiado}</span>}
    </button>
  )
}

export const BotonCompartirPlanta = ({ planta, className }: { planta: Planta; className?: string }) => (
  <BotonCompartir texto={() => textoDePlanta(planta)} titulo={planta.nombre_comun} etiqueta={S.etiqueta(planta.nombre_comun)} className={className} />
)

function Campo({ valor, onCambio, onEnviar, boton, placeholder }: { valor: string; onCambio: (v: string) => void; onEnviar: () => void; boton: string; placeholder: string }) {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onEnviar()
      }}
    >
      <input
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        maxLength={40}
        placeholder={placeholder}
        aria-label={placeholder}
        className="border-arena-osc text-tinta focus:border-hoja min-h-12 min-w-0 flex-1 rounded-full border-2 bg-white px-4 text-[16px] font-bold outline-none"
        style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
      />
      <button type="submit" disabled={!valor.trim()} className="bg-hoja min-h-12 shrink-0 rounded-full border-0 px-5 text-[15px] font-extrabold text-white disabled:opacity-40">
        {boton}
      </button>
    </form>
  )
}

/** Botón "Guardar" de la ficha: abre una pantalla para tildar en qué colecciones va la planta */
export function GuardarEnColeccion({ planta }: { planta: Planta }) {
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const colecciones = useStore((s) => s.colecciones)
  const favorita = useStore((s) => s.favoritas.includes(planta.id))
  const alternarFav = useStore((s) => s.alternarFavorita)
  const alternar = useStore((s) => s.alternarEnColeccion)
  const crear = useStore((s) => s.crearColeccion)
  const en = colecciones.filter((c) => c.plantas.includes(planta.id)).length + (favorita ? 1 : 0)

  const fila = (clave: string, icono: ReactNode, texto: string, marcada: boolean, alClick: () => void) => (
    <button
      key={clave}
      type="button"
      aria-pressed={marcada}
      onClick={() => {
        vibrar('toque')
        alClick()
      }}
      className="border-arena-osc flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 text-left"
    >
      <span className="text-hoja-osc shrink-0">{icono}</span>
      <span className="text-tinta min-w-0 flex-1 truncate text-[16px] font-extrabold">{texto}</span>
      <span className={`grid size-7 shrink-0 place-items-center rounded-full border-2 ${marcada ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-transparent'}`}>
        <Check size={16} strokeWidth={3.4} aria-hidden />
      </span>
    </button>
  )

  return (
    <>
      <button
        type="button"
        aria-label={C.guardarEn}
        onClick={() => {
          vibrar('toque')
          setAbierto(true)
        }}
        className={`${botonIcono} ${en > 0 ? 'text-hoja' : ''}`}
      >
        <Bookmark size={22} strokeWidth={2.4} fill={en > 0 ? 'currentColor' : 'none'} aria-hidden />
      </button>
      <Panel abierto={abierto} titulo={C.guardarEn} onCerrar={() => setAbierto(false)} pie={<BotonPie onClick={() => setAbierto(false)}>{C.listoPie}</BotonPie>}>
        <div className="flex flex-col gap-2.5 px-5 pb-6">
          <p className="text-tinta-suave m-0 text-[14px] font-bold">{planta.nombre_comun}</p>
          {fila('fav', <Heart size={20} aria-hidden />, C.favoritas, favorita, () => alternarFav(planta.id))}
          {colecciones.map((c) => fila(c.id, <Bookmark size={20} aria-hidden />, c.nombre, c.plantas.includes(planta.id), () => alternar(c.id, planta.id)))}
          {colecciones.length < 20 ? (
            <div className="mt-2">
              <Campo
                valor={nombre}
                onCambio={setNombre}
                placeholder={C.nombre}
                boton={C.crear}
                onEnviar={() => {
                  const id = crear(nombre)
                  if (id) {
                    alternar(id, planta.id)
                    setNombre('')
                  }
                }}
              />
            </div>
          ) : (
            <p className="text-tinta-suave m-0 text-[13px] font-bold">{C.limite}</p>
          )}
        </div>
      </Panel>
    </>
  )
}

function BotonPie({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="bg-hoja relieve min-h-13 w-full rounded-full border-0 text-[17px] font-extrabold text-white">
      {children}
    </button>
  )
}
export { BotonPie }

type Abierta = 'fav' | string | null

/** Pestaña "Mi lista": favoritas y colecciones armadas a mano */
export function MiLista({ onAbrir }: { onAbrir: (p: Planta) => void }) {
  const favoritas = useStore((s) => s.favoritas)
  const colecciones = useStore((s) => s.colecciones)
  const crear = useStore((s) => s.crearColeccion)
  const renombrar = useStore((s) => s.renombrarColeccion)
  const borrar = useStore((s) => s.borrarColeccion)
  const alternar = useStore((s) => s.alternarEnColeccion)
  const alternarFav = useStore((s) => s.alternarFavorita)
  const [abierta, setAbierta] = useState<Abierta>(null)
  const [creando, setCreando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [editando, setEditando] = useState(false)
  const [seguro, setSeguro] = useState(false)

  const col = abierta && abierta !== 'fav' ? colecciones.find((c) => c.id === abierta) : undefined
  const ids = abierta === 'fav' ? favoritas : (col?.plantas ?? [])
  const plantas = ids.map(plantaPorId).filter((p): p is Planta => !!p)
  const titulo = abierta === 'fav' ? C.favoritas : (col?.nombre ?? '')
  const cerrar = () => {
    setAbierta(null)
    setEditando(false)
    setSeguro(false)
  }

  const tarjeta = (clave: string, nombreT: string, lista: Planta[], icono: ReactNode, alClick: () => void) => (
    <button key={clave} type="button" onClick={alClick} className="border-arena-osc flex flex-col overflow-hidden rounded-3xl border-2 bg-white p-0 text-left shadow-[0_3px_0_var(--color-arena-osc)] active:opacity-80">
      <span className="bg-arena relative block aspect-square w-full">
        {lista[0] ? <FotoPlanta planta={lista[0]} className="size-full" /> : <span className="text-hoja grid size-full place-items-center">{icono}</span>}
      </span>
      <span className="block px-3 py-2">
        <span className="font-display text-tinta block truncate text-[16px] leading-tight font-semibold">{nombreT}</span>
        <span className="text-tinta-suave block text-[13px] font-extrabold">{C.cuenta(lista.length)}</span>
      </span>
    </button>
  )

  return (
    <div className="px-5 pt-3 pb-6">
      <div className="grid grid-cols-2 gap-3">
        {tarjeta('fav', C.favoritas, favoritas.map(plantaPorId).filter((p): p is Planta => !!p), <Heart size={36} aria-hidden />, () => setAbierta('fav'))}
        {colecciones.map((c) =>
          tarjeta(c.id, c.nombre, c.plantas.map(plantaPorId).filter((p): p is Planta => !!p), <Bookmark size={36} aria-hidden />, () => setAbierta(c.id)),
        )}
        {colecciones.length < 20 && (
          <button
            type="button"
            onClick={() => setCreando(true)}
            className="border-arena-osc text-hoja-osc flex min-h-40 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed bg-transparent text-[15px] font-extrabold"
          >
            <Plus size={30} aria-hidden />
            {C.nueva}
          </button>
        )}
      </div>
      {creando && (
        <div className="mt-4">
          <Campo
            valor={nombre}
            onCambio={setNombre}
            placeholder={C.nombre}
            boton={C.crear}
            onEnviar={() => {
              const id = crear(nombre)
              if (id) {
                setNombre('')
                setCreando(false)
                setAbierta(id)
              }
            }}
          />
        </div>
      )}

      <Panel abierto={abierta !== null && (abierta === 'fav' || !!col)} titulo={titulo} onCerrar={cerrar}>
        <div className="px-5 pb-8">
          <div className="mb-3 flex items-center gap-1">
            <p className="text-tinta-suave m-0 flex-1 text-[13px] font-extrabold">{C.cuenta(plantas.length)}</p>
            {plantas.length > 0 && <BotonCompartir texto={() => textoDeLista(titulo, plantas)} titulo={titulo} etiqueta={S.lista(titulo)} />}
            {col && (
              <button type="button" aria-label={C.renombrar} onClick={() => setEditando((v) => !v)} className={botonIcono}>
                <Pencil size={20} aria-hidden />
              </button>
            )}
            {col && (
              <button
                type="button"
                aria-label={C.borrar}
                onClick={() => {
                  if (!seguro) return setSeguro(true)
                  borrar(col.id)
                  cerrar()
                }}
                className={`${botonIcono} ${seguro ? 'text-alerta' : ''}`}
              >
                <Trash2 size={20} aria-hidden />
              </button>
            )}
          </div>
          {seguro && <p className="text-alerta mt-0 mb-3 text-[13px] font-extrabold">{C.borrarSeguro}</p>}
          {col && editando && (
            <div className="mb-3">
              <Campo
                valor={nombre || col.nombre}
                onCambio={setNombre}
                placeholder={C.nombre}
                boton={C.guardarNombre}
                onEnviar={() => {
                  renombrar(col.id, nombre || col.nombre)
                  setNombre('')
                  setEditando(false)
                }}
              />
            </div>
          )}
          {plantas.length === 0 ? (
            <p className="text-tinta-suave py-8 text-center text-[15px] font-bold">{abierta === 'fav' ? TC.plantas.favoritas.vacio : C.vacia}</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {plantas.map((p) => (
                <TarjetaPlanta
                  key={p.id}
                  planta={p}
                  corazon={false}
                  onClick={() => onAbrir(p)}
                  extra={
                    <>
                      <BotonCompartirPlanta planta={p} />
                      <button
                        type="button"
                        aria-label={C.quitar(p.nombre_comun)}
                        onClick={() => {
                          vibrar('toque')
                          if (abierta === 'fav') alternarFav(p.id)
                          else if (col) alternar(col.id, p.id)
                        }}
                        className={`${botonIcono} mr-1`}
                      >
                        <X size={20} aria-hidden />
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}

import { ChevronRight, Heart, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { FotoPlanta } from '../../components/FotoPlanta'
import { ListaFuentes } from '../../components/ListaFuentes'
import { Panel } from '../../components/Panel'
import { PELIGROSAS, PLANTAS, type Planta } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { vibrar } from '../../lib/haptics'
import { esApta } from '../../lib/mascotas'
import type { TipoMascota } from '../../lib/tipos'
import { useStore } from '../../store/useStore'
import { BotonFavorita, CalceEspacios } from './Favorita'
import { FichaPlanta } from './FichaPlanta'
import { Semaforo } from './Semaforo'

const P = TC.plantas
const FILTROS: TipoMascota[] = ['ninguna', 'gato', 'perro', 'ambos']

export function TarjetaPlanta({ planta, onClick, detalle, corazon = true, calce }: { planta: Planta; onClick: () => void; detalle?: string; corazon?: boolean; calce?: boolean }) {
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
          {!corazon && <ChevronRight size={20} className="text-tinta-suave shrink-0" aria-hidden />}
        </button>
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

export function Plantas() {
  const mascotas = useStore((s) => s.mascotas.tipo)
  // Si hay mascotas en el perfil, el catálogo arranca filtrado para ellas
  const [filtro, setFiltro] = useState<TipoMascota>(mascotas)
  const [abierta, setAbierta] = useState<Planta | null>(null)
  const [verPeligrosas, setVerPeligrosas] = useState(false)
  const [soloFavoritas, setSoloFavoritas] = useState(false)
  const favoritas = useStore((s) => s.favoritas)

  // En "Favoritas" se ve todo lo marcado, aun si el filtro de mascotas la dejaría afuera: el semáforo avisa
  const lista = PLANTAS.filter((p) => (soloFavoritas ? favoritas.includes(p.id) : esApta(p, filtro))).sort((a, b) => a.nombre_comun.localeCompare(b.nombre_comun, 'es'))

  return (
    <div className="safe-top relative flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 px-5 pt-4">
        <h1 className="font-display text-hoja-osc m-0 text-[30px] font-semibold">{P.titulo}</h1>
      </header>
      <div className="scroll-app -mx-0 flex shrink-0 gap-2 overflow-x-auto px-5 py-3" role="group" aria-label={P.titulo}>
        <button
          type="button"
          aria-pressed={soloFavoritas}
          onClick={() => {
            vibrar('toque')
            setSoloFavoritas((v) => !v)
          }}
          className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-2 px-4 text-[14px] font-extrabold whitespace-nowrap ${soloFavoritas ? 'border-alerta bg-alerta text-white' : 'border-arena-osc text-tinta bg-white'}`}
        >
          <Heart size={16} strokeWidth={2.6} fill={soloFavoritas ? 'currentColor' : 'none'} aria-hidden />
          {P.favoritas.filtro}
          {favoritas.length > 0 && ` · ${favoritas.length}`}
        </button>
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={!soloFavoritas && filtro === f}
            onClick={() => {
              vibrar('toque')
              setFiltro(f)
              setSoloFavoritas(false)
            }}
            className={`min-h-11 shrink-0 rounded-full border-2 px-4 text-[14px] font-extrabold whitespace-nowrap ${!soloFavoritas && filtro === f ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-tinta bg-white'}`}
          >
            {P.filtros[f]}
          </button>
        ))}
      </div>

      <div className="scroll-app min-h-0 flex-1 px-5 pb-6">
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
          <p className="text-tinta-suave py-10 text-center text-[15px] font-bold">{soloFavoritas ? P.favoritas.vacio : P.vacio}</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {lista.map((p) => (
              <TarjetaPlanta key={p.id} planta={p} onClick={() => setAbierta(p)} calce={soloFavoritas} />
            ))}
          </div>
        )}
        <p className="text-tinta-suave mt-5 mb-0 text-[13px] leading-snug font-bold">{P.ficha.disclaimer}</p>
      </div>

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

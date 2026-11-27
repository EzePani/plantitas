import { Check, Minus, PawPrint, Plus, Search, Trash2, TriangleAlert, X } from 'lucide-react'
import { useState } from 'react'
import { FotoPlanta } from '../../components/FotoPlanta'
import { PLANTAS, plantaPorId, type Planta } from '../../data/plantas'
import { TC } from '../../data/textosCatalogo'
import { buscarPlantas } from '../../lib/buscar'
import { MAX_PLANTAS_ESPACIO, agruparPlantas } from '../../lib/espacios'
import { vibrar } from '../../lib/haptics'
import { avisosDeMascotas, luzParaPlanta } from '../../lib/lugares'
import { plantasEn } from '../../lib/plano'
import type { Espacio, PlantaEnEspacio } from '../../lib/tipos'
import { useStore } from '../../store/useStore'

const L = TC.espacio.plantas
const ALFABETICO = [...PLANTAS].sort((a, b) => a.nombre_comun.localeCompare(b.nombre_comun, 'es'))
const redondo = 'grid size-11 shrink-0 place-items-center rounded-full border-2'

/** Agrupa por tipo, con la ficha del catálogo de cada uno */
const conFicha = (plantas: PlantaEnEspacio[]) =>
  agruparPlantas(plantas).flatMap((g) => {
    const planta = plantaPorId(g.plantaId)
    return planta ? [{ planta, cantidad: g.cantidad }] : []
  })

const TONO = { mal: 'bg-alerta-clara text-alerta', cuidado: 'bg-sol-claro text-tinta', bien: 'text-hoja-osc' }

/** Lo que conviene saber de esa planta en ese lugar: primero las mascotas, después la luz */
function Avisos({ planta, espacio, lugar }: { planta: Planta; espacio: Espacio; lugar: string }) {
  const A = TC.espacio.plano.avisos
  const luz = luzParaPlanta(planta, espacio, lugar)
  const lineas = [
    ...avisosDeMascotas(planta, espacio, lugar).map((a) => ({
      Icono: PawPrint,
      tono: a.alcance === 'no' ? TONO.cuidado : TONO.mal,
      texto: A.mascota[a.estado][a.alcance](A.quien(a.especies), a.especies.length > 1),
    })),
    {
      Icono: luz === 'bien' ? Check : luz === 'con_ajuste' ? TriangleAlert : X,
      tono: luz === 'bien' ? TONO.bien : luz === 'con_ajuste' ? TONO.cuidado : TONO.mal,
      texto: luz === 'lugar' ? A.noEsPara(espacio.tipo === 'balcon') : A.luz[luz],
    },
  ]
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {lineas.map(({ Icono, tono, texto }) => (
        <li key={texto} className={`flex items-start gap-2 rounded-xl px-2 py-1.5 text-[14px] leading-snug font-extrabold ${tono}`}>
          <Icono size={16} strokeWidth={3} className="mt-0.5 shrink-0" aria-hidden />
          {texto}
        </li>
      ))}
    </ul>
  )
}

/**
 * Una fila por tipo de planta, con − y +. Sin `lugar` trabaja sobre todo el espacio;
 * con un lugar del plano, solo sobre lo que hay ahí (y permite dejarlas sin ubicar).
 */
export function FilasPlantas({ espacio, lugar, onVerPlanta }: { espacio: Espacio; lugar?: string | null; onVerPlanta: (p: Planta) => void }) {
  const sumar = useStore((s) => s.agregarPlantaAEspacio)
  const quitar = useStore((s) => s.quitarPlantaDeEspacio)
  const mover = useStore((s) => s.moverPlantaEnEspacio)
  const grupos = conFicha(lugar === undefined ? espacio.plantas : plantasEn(espacio, lugar))
  const lleno = espacio.plantas.length >= MAX_PLANTAS_ESPACIO
  return grupos.map(({ planta, cantidad }) => (
    <div key={planta.id} className="border-arena-osc flex flex-col gap-1.5 rounded-3xl border-2 bg-white p-2 shadow-[0_3px_0_var(--color-arena-osc)]">
      <div className="flex items-center gap-1.5 pr-0.5">
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => onVerPlanta(planta)} className="flex min-h-12 w-full items-center gap-3 border-0 bg-transparent p-0 text-left active:opacity-70">
            <FotoPlanta planta={planta} className="size-12 shrink-0 rounded-2xl" />
            <span className="font-display text-tinta min-w-0 text-[17px] leading-tight font-semibold">{planta.nombre_comun}</span>
          </button>
          {typeof lugar === 'string' && (
            <button type="button" aria-label={L.sacarDeAca(planta.nombre_comun)} onClick={() => mover(espacio.id, planta.id, lugar, null)} className="text-hoja-osc min-h-9 border-0 bg-transparent p-0 text-[13px] font-extrabold underline">
              {L.sacar}
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label={L.quitar(planta.nombre_comun)}
          onClick={() => {
            vibrar('toque')
            quitar(espacio.id, planta.id, lugar)
          }}
          className={`${redondo} border-arena-osc text-tinta bg-white`}
        >
          {cantidad === 1 ? <Trash2 size={17} aria-hidden /> : <Minus size={18} strokeWidth={3} aria-hidden />}
        </button>
        <span className="text-tinta w-6 text-center text-[17px] font-extrabold" aria-label={L.tenes(cantidad)}>
          {cantidad}
        </span>
        <button
          type="button"
          disabled={lleno}
          aria-label={L.sumar(planta.nombre_comun)}
          onClick={() => {
            vibrar('toque')
            sumar(espacio.id, planta.id, lugar)
          }}
          className={`${redondo} border-hoja bg-hoja text-white disabled:opacity-45`}
        >
          <Plus size={18} strokeWidth={3} aria-hidden />
        </button>
      </div>
      {typeof lugar === 'string' && espacio.plano && <Avisos planta={planta} espacio={espacio} lugar={lugar} />}
    </div>
  ))
}

export function BotonAgregarPlanta({ lleno, onClick }: { lleno: boolean; onClick: () => void }) {
  return (
    <>
      <button type="button" disabled={lleno} onClick={onClick} className="border-hoja text-hoja-osc flex min-h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-dashed bg-transparent text-[16px] font-extrabold disabled:opacity-45">
        <Plus size={19} strokeWidth={3} aria-hidden />
        {L.agregar}
      </button>
      {lleno && <p className="text-tinta-suave m-0 text-[13px] font-bold">{L.limite}</p>}
    </>
  )
}

/** Las plantas que ya viven en el espacio: se ven, se abren, se suman y se quitan. Siempre del catálogo. */
export function PlantasDelEspacio({ espacio, onVerPlanta, onAgregar }: { espacio: Espacio; onVerPlanta: (p: Planta) => void; onAgregar: () => void }) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-tinta m-0 text-[22px] font-semibold">{L.titulo}</h2>
        {espacio.plantas.length > 0 && <span className="text-tinta-suave text-[14px] font-extrabold">{L.cuenta(espacio.plantas.length)}</span>}
      </div>
      {espacio.plantas.length === 0 && <p className="text-tinta-suave m-0 text-[15px] leading-snug font-bold">{L.vacio}</p>}
      <FilasPlantas espacio={espacio} onVerPlanta={onVerPlanta} />
      <BotonAgregarPlanta lleno={espacio.plantas.length >= MAX_PLANTAS_ESPACIO} onClick={onAgregar} />
    </section>
  )
}

function Opcion({ planta, cuantas, etiqueta, disabled, onClick }: { planta: Planta; cuantas: number; etiqueta: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={etiqueta}
      onClick={() => {
        vibrar('toque')
        onClick()
      }}
      className={`flex min-h-14 w-full items-center gap-3 rounded-3xl border-2 p-2 pr-2.5 text-left active:opacity-70 disabled:opacity-45 ${cuantas ? 'border-hoja bg-brote' : 'border-arena-osc bg-white'}`}
    >
      <FotoPlanta planta={planta} className="size-11 shrink-0 rounded-2xl" />
      <span className="min-w-0 flex-1">
        <span className="text-tinta block text-[16px] leading-tight font-extrabold">{planta.nombre_comun}</span>
        {cuantas > 0 && <span className="text-hoja-osc block text-[13px] font-extrabold">{L.tenes(cuantas)}</span>}
      </span>
      <span className={`${redondo} size-9 ${cuantas ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-tinta bg-white'}`}>
        <Plus size={17} strokeWidth={3} aria-hidden />
      </span>
    </button>
  )
}

/**
 * Catálogo para sumar plantas: se toca y listo, sin nombres ni formularios.
 * Si se abrió desde un lugar del plano, primero ofrece acomodar las que están sin ubicar.
 */
export function ElegirPlantas({ espacio, lugar }: { espacio: Espacio; lugar?: string }) {
  const sumar = useStore((s) => s.agregarPlantaAEspacio)
  const mover = useStore((s) => s.moverPlantaEnEspacio)
  const [q, setQ] = useState('')
  const lista = q.trim() ? buscarPlantas(PLANTAS, q) : ALFABETICO
  const cuantas = new Map(agruparPlantas(lugar ? plantasEn(espacio, lugar) : espacio.plantas).map((g) => [g.plantaId, g.cantidad]))
  const sueltas = lugar ? conFicha(plantasEn(espacio, null)) : []
  const lleno = espacio.plantas.length >= MAX_PLANTAS_ESPACIO
  const titulo = 'font-display text-tinta mt-0 mb-2 text-[18px] font-semibold'
  return (
    <div className="px-5 pb-6">
      <p className="text-tinta mt-0 mb-3 text-[14px] leading-snug font-bold">{lleno ? L.limite : L.ayuda}</p>
      {sueltas.length > 0 && (
        <section className="mb-5 flex flex-col gap-2">
          <h2 className={`${titulo} mb-0`}>{TC.espacio.plano.sinUbicar}</h2>
          {sueltas.map(({ planta, cantidad }) => (
            <Opcion key={planta.id} planta={planta} cuantas={cantidad} etiqueta={L.ubicar(planta.nombre_comun)} onClick={() => mover(espacio.id, planta.id, null, lugar!)} />
          ))}
        </section>
      )}
      {lugar && <h2 className={titulo}>{L.delCatalogo}</h2>}
      <label className="border-arena-osc focus-within:border-hoja mb-3 flex min-h-12 items-center gap-2 rounded-full border-2 bg-white px-4">
        <Search size={18} className="text-tinta-suave shrink-0" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={40}
          placeholder={L.buscar}
          aria-label={L.buscar}
          autoComplete="off"
          className="text-tinta min-w-0 flex-1 border-0 bg-transparent text-[16px] font-bold outline-none"
          style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
        />
      </label>
      {lista.length === 0 && <p className="text-tinta-suave py-6 text-center text-[15px] font-bold">{L.sinResultados}</p>}
      <div className="flex flex-col gap-2">
        {lista.map((p) => (
          <Opcion key={p.id} planta={p} cuantas={cuantas.get(p.id) ?? 0} etiqueta={L.sumar(p.nombre_comun)} disabled={lleno} onClick={() => sumar(espacio.id, p.id, lugar)} />
        ))}
      </div>
    </div>
  )
}

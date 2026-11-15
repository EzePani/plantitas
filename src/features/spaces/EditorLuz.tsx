import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Compass, Flame, Minus, Plus, Sun, Trash2 } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Ilustracion } from '../../components/Ilustracion'
import { OpcionGrande } from '../../components/OpcionGrande'
import { TC } from '../../data/textosCatalogo'
import { vibrar } from '../../lib/haptics'
import { HORA_MAX, HORA_MIN, derivarLuz } from '../../lib/luz'
import type { Obstaculo, PerfilLuz, TipoLuz, TramoSol } from '../../lib/tipos'

const L = TC.luz
type Cambio = (p: PerfilLuz) => void

const TRAMO_INICIAL: TramoSol = { desde: 9, hasta: 13 }
const SEGUNDO_TRAMO: TramoSol = { desde: 16, hasta: 18 }

/** Pasos del flujo de luz que corresponden a un perfil: las horas y los obstáculos solo si hay sol directo */
export function pasosDeLuz(p: PerfilLuz | undefined): ('tipo' | 'horas' | 'obstaculos')[] {
  return p?.tipo === 'directa' ? ['tipo', 'horas', 'obstaculos'] : ['tipo']
}

/** 3a. ¿Cómo es la luz ahí? */
export function PasoTipoLuz({ luz, onCambio }: { luz: PerfilLuz | undefined; onCambio: Cambio }) {
  const elegir = (tipo: TipoLuz) => {
    vibrar('toque')
    // Al cambiar de tipo se descarta lo que ya no aplica
    if (tipo === 'directa') onCambio({ tipo, tramos: luz?.tipo === 'directa' ? luz.tramos : [TRAMO_INICIAL], obstaculos: luz?.tipo === 'directa' ? luz.obstaculos : [] })
    else onCambio({ tipo, tramos: [], obstaculos: [] })
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5">
        {L.tipo.opciones.map((o) => {
          const on = luz?.tipo === o.valor
          return (
            <button
              key={o.valor}
              type="button"
              aria-pressed={on}
              onClick={() => elegir(o.valor)}
              style={{ '--relieve': on ? 'var(--color-hoja)' : 'var(--color-arena-osc)' } as CSSProperties}
              className={`relieve flex flex-col rounded-2xl border-2 p-2 text-left ${on ? 'border-hoja bg-brote' : 'border-arena-osc bg-white'}`}
            >
              <Ilustracion nombre={o.ilustracion} className="w-full rounded-xl" titulo={o.texto} />
              <span className={`mt-2 block text-[15px] leading-tight font-extrabold ${on ? 'text-hoja-osc' : 'text-tinta'}`}>{o.texto}</span>
              <span className="text-tinta-suave mt-1 block text-[13px] leading-tight font-bold">{o.ayuda}</span>
            </button>
          )
        })}
      </div>
      <AnimatePresence>
        {luz?.tipo === 'no_se' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <PruebaDeLaSombra />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PruebaDeLaSombra() {
  const P = L.pruebaSombra
  return (
    <div className="bg-sol-claro border-sol mt-4 rounded-2xl border-2 p-4">
      <h3 className="font-display text-tinta m-0 text-[18px] font-semibold">{P.titulo}</h3>
      <p className="text-tinta mt-1 mb-2 text-[14px] leading-snug font-bold">{P.texto}</p>
      <ul className="text-tinta m-0 mb-3 list-none p-0 text-[14px] leading-snug font-bold">
        {P.pasos.map((t) => (
          <li key={t} className="flex gap-2 py-0.5">
            <span className="bg-sol-osc mt-1.5 size-2 shrink-0 rounded-full" />
            {t}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        {P.momentos.map((m) => (
          <div key={m} className="flex flex-1 flex-col items-center rounded-xl bg-white py-2">
            <Sun size={20} className="text-sol-osc" aria-hidden />
            <span className="text-tinta text-[14px] font-extrabold">{m}</span>
          </div>
        ))}
      </div>
      <p className="text-tinta-suave mt-3 mb-0 text-[13px] leading-snug font-bold">{P.cierre}</p>
    </div>
  )
}

const formato = (h: number) => `${Math.floor(h)}:${h % 1 ? '30' : '00'}`

function SelectorHora({ etiqueta, valor, min, max, onCambio }: { etiqueta: string; valor: number; min: number; max: number; onCambio: (h: number) => void }) {
  const boton = (delta: number, nombre: string, icono: ReactNode) => {
    const destino = valor + delta
    const fuera = destino < min || destino > max
    return (
      <button
        type="button"
        disabled={fuera}
        aria-label={`${etiqueta}: ${nombre}`}
        onClick={() => {
          vibrar('toque')
          onCambio(destino)
        }}
        style={{ '--relieve': 'var(--color-arena-osc)' } as CSSProperties}
        className="relieve border-arena-osc text-hoja-osc grid size-12 shrink-0 place-items-center rounded-2xl border-2 bg-white disabled:opacity-35"
      >
        {icono}
      </button>
    )
  }
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-tinta text-[15px] leading-tight font-extrabold">{etiqueta}</div>
      <div className="flex shrink-0 items-center gap-1.5">
        {boton(-1, L.horas.antes, <Minus strokeWidth={3} aria-hidden />)}
        <div className="font-display text-tinta w-[84px] text-center text-[26px] leading-none font-semibold" aria-live="polite">
          {formato(valor)}
          <span className="text-tinta-suave ml-0.5 text-[13px]">{L.horas.hs}</span>
        </div>
        {boton(1, L.horas.despues, <Plus strokeWidth={3} aria-hidden />)}
      </div>
    </div>
  )
}

/** Barra del día (6 a 20 hs) con los tramos de sol marcados */
function BarraDelDia({ tramos }: { tramos: TramoSol[] }) {
  const total = HORA_MAX - HORA_MIN
  return (
    <div className="mb-4" aria-hidden>
      <div className="bg-arena-osc relative h-5 overflow-hidden rounded-full">
        {tramos.map((t, i) => (
          <motion.div
            key={i}
            className="bg-sol absolute inset-y-0 rounded-full"
            initial={false}
            animate={{ left: `${((t.desde - HORA_MIN) / total) * 100}%`, width: `${((t.hasta - t.desde) / total) * 100}%` }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          />
        ))}
      </div>
      <div className="text-tinta-suave mt-1 flex justify-between text-[12px] font-extrabold">
        {[6, 9, 12, 15, 18, 20].map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
    </div>
  )
}

/** 3b. ¿A qué hora empieza a pegar el sol y a qué hora deja de pegar? (con segundo tramo opcional) */
export function PasoHoras({ luz, onCambio }: { luz: PerfilLuz; onCambio: Cambio }) {
  const noSabe = luz.tramos.length === 0
  const setTramo = (i: number, t: TramoSol) => onCambio({ ...luz, tramos: luz.tramos.map((x, n) => (n === i ? t : x)) })
  return (
    <div>
      <p className="text-tinta-suave -mt-2 mb-4 text-[15px] font-bold">{L.horas.texto}</p>
      {!noSabe && (
        <>
          <BarraDelDia tramos={luz.tramos} />
          {luz.tramos.map((t, i) => {
            // El segundo tramo no puede pisar al primero
            const min = i === 0 ? HORA_MIN : luz.tramos[0].hasta
            const max = i === 0 && luz.tramos[1] ? luz.tramos[1].desde : HORA_MAX
            return (
              <div key={i} className="border-arena-osc mb-3 rounded-2xl border-2 bg-white p-3">
                {i === 1 && (
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-tinta text-[14px] font-extrabold">{L.horas.segundoTramo}</span>
                    <button type="button" onClick={() => onCambio({ ...luz, tramos: [luz.tramos[0]] })} className="text-tinta-suave flex min-h-11 items-center gap-1 border-0 bg-transparent text-[14px] font-extrabold">
                      <Trash2 size={16} aria-hidden />
                      {L.horas.quitar}
                    </button>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <SelectorHora etiqueta={L.horas.desde} valor={t.desde} min={min} max={t.hasta - 1} onCambio={(h) => setTramo(i, { ...t, desde: h })} />
                  <SelectorHora etiqueta={L.horas.hasta} valor={t.hasta} min={t.desde + 1} max={max} onCambio={(h) => setTramo(i, { ...t, hasta: h })} />
                </div>
              </div>
            )
          })}
          {luz.tramos.length === 1 && luz.tramos[0].hasta <= HORA_MAX - 2 && (
            <button
              type="button"
              onClick={() => {
                const desde = Math.max(SEGUNDO_TRAMO.desde, luz.tramos[0].hasta + 1)
                onCambio({ ...luz, tramos: [luz.tramos[0], { desde, hasta: Math.min(HORA_MAX, Math.max(SEGUNDO_TRAMO.hasta, desde + 1)) }] })
              }}
              className="text-hoja-osc mb-3 flex min-h-11 items-center gap-2 border-0 bg-transparent text-[15px] font-extrabold"
            >
              <Plus size={18} strokeWidth={3} aria-hidden />
              {L.horas.otroTramo}
            </button>
          )}
        </>
      )}
      <OpcionGrande compacta icono="duda" texto={L.horas.noSe} elegida={noSabe} onClick={() => onCambio({ ...luz, tramos: noSabe ? [TRAMO_INICIAL] : [] })} />
      {noSabe && <p className="bg-sol-claro text-tinta mt-3 mb-0 rounded-2xl p-3 text-[14px] leading-snug font-bold">{L.horas.noSeTexto}</p>}
    </div>
  )
}

/** 3c. ¿Hay algo que tape o filtre el sol? */
export function PasoObstaculos({ luz, onCambio }: { luz: PerfilLuz; onCambio: Cambio }) {
  const alternar = (o: Obstaculo) => onCambio({ ...luz, obstaculos: luz.obstaculos.includes(o) ? luz.obstaculos.filter((x) => x !== o) : [...luz.obstaculos, o] })
  return (
    <div>
      <p className="text-tinta-suave -mt-2 mb-4 text-[15px] font-bold">{L.obstaculos.texto}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {L.obstaculos.opciones.map((o) => (
          <OpcionGrande key={o.valor} compacta icono={o.icono} texto={o.texto} elegida={luz.obstaculos.includes(o.valor)} onClick={() => alternar(o.valor)} />
        ))}
        <OpcionGrande compacta icono="no" texto={L.obstaculos.nada} elegida={luz.obstaculos.length === 0} onClick={() => onCambio({ ...luz, obstaculos: [] })} />
      </div>
    </div>
  )
}

/** Una línea para listas: "Luz directa · 4 horas de sol directo" */
export function lineaDeLuz(p: PerfilLuz): string {
  const d = derivarLuz(p)
  return d.horasSol > 0 ? `${L.categorias[d.categoria]} · ${L.resumen.horas(d.horasSol)}` : L.categorias[d.categoria]
}

function Fila({ icono, children }: { icono: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-1">
      <span className="text-sol-osc mt-0.5 shrink-0">{icono}</span>
      <span className="text-tinta text-[14px] leading-snug font-bold">{children}</span>
    </div>
  )
}

/** Perfil de luz derivado de un espacio. Todo lo calculado va marcado como estimación. */
export function ResumenLuz({ luz, compacto }: { luz: PerfilLuz; compacto?: boolean }) {
  const d = derivarLuz(luz)
  const R = L.resumen
  const filtrado = luz.tipo === 'directa' && d.horasEfectivas === 0
  const tamizado = luz.tipo === 'directa' && d.horasEfectivas > 0 && d.horasEfectivas < d.horasSol
  return (
    <div className="bg-sol-claro rounded-2xl p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="font-display text-tinta flex items-center gap-2 text-[18px] font-semibold">
          <Sun className="text-sol-osc shrink-0" aria-hidden />
          {L.categorias[d.categoria]}
        </div>
        <span className="text-sol-osc rounded-full bg-white px-2.5 py-0.5 text-[12px] font-extrabold tracking-wide uppercase">{R.estimacion}</span>
      </div>
      <div className="mt-1.5">
        {luz.tipo === 'no_se' && <Fila icono={<Clock size={18} aria-hidden />}>{R.asumidaTipo}</Fila>}
        {luz.tipo === 'directa' && (
          <Fila icono={<Clock size={18} aria-hidden />}>
            {R.horas(d.horasSol)}
            {d.momento && ` · ${R.momento[d.momento]}`}
            {d.asumida && <span className="text-tinta-suave block">{R.asumidaHoras}</span>}
            {filtrado && <span className="text-tinta-suave block">{R.horasFiltradas}</span>}
            {tamizado && <span className="text-tinta-suave block">{R.horasTamizadas}</span>}
          </Fila>
        )}
        {d.orientacion !== 'desconocida' && luz.tipo === 'directa' && <Fila icono={<Compass size={18} aria-hidden />}>{R.orientacion[d.orientacion]}</Fila>}
        {d.avisoCalor && (
          <div className="bg-terracota-clara mt-1.5 flex items-start gap-2.5 rounded-xl p-2.5" role="note">
            <Flame size={18} className="text-terracota-osc mt-0.5 shrink-0" aria-hidden />
            <span className="text-tinta text-[14px] leading-snug font-extrabold">{R.calor}</span>
          </div>
        )}
      </div>
      {!compacto && (
        <p className="text-tinta-suave mt-2 mb-0 text-[13px] leading-snug font-bold">
          {R.estimacionTexto} {luz.tipo === 'directa' && R.estacion}
        </p>
      )}
    </div>
  )
}

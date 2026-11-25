import { InvitacionCuenta } from '../../components/InvitacionCuenta'
import { motion } from 'framer-motion'
import { BookOpen, Check, Dumbbell, FastForward, Flame, Gift, Leaf, Lock, Star, Zap, type LucideIcon } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Boton } from '../../components/Boton'
import { HojaInferior } from '../../components/HojaInferior'
import { Ilustracion } from '../../components/Ilustracion'
import { NIVELES } from '../../data/gamificacion'
import { LECCIONES_POR_UNIDAD } from '../../data/lessons'
import { useContenido } from '../../lib/useContenido'
import { T } from '../../data/textos'
import { TC } from '../../data/textosCatalogo'
import { UNIDADES, idsDelPlan } from '../../data/unidades'
import { construirCamino, type Nodo, type Tramo } from '../../lib/camino'
import { hoyLocal } from '../../lib/fecha'
import { metaDeHoyCumplida, nivelPara, rachaVigente } from '../../lib/gamificacion'
import { vibrar } from '../../lib/haptics'
import { planDeCamino } from '../../lib/perfil'
import { PREGUNTAS_REFUERZO, refuerzoDisponible } from '../../lib/refuerzo'
import { useStore } from '../../store/useStore'
import type { Sesion } from '../quiz/Reproductor'
import { Enredadera } from './Enredadera'

const ICONO_NODO: Record<Nodo['tipo'], LucideIcon> = { leccion: Leaf, repaso: Dumbbell, cofre: Gift }
/** Corrimiento horizontal de cada nodo para armar el zigzag */
const ZIGZAG = [0, 46, 72, 46, 0, -46, -72, -46]
/** Corre el contenido con márgenes (no con transform) para que la fila nunca se salga del ancho */
const corrido = (i: number): React.CSSProperties => {
  const z = ZIGZAG[i % ZIGZAG.length]
  return { marginLeft: z > 0 ? z * 2 : 0, marginRight: z < 0 ? -z * 2 : 0 }
}

function BotonNodo({ nodo, color, colorOsc, posicion, onClick, refActual }: { nodo: Nodo; color: string; colorOsc: string; posicion: number; onClick: () => void; refActual?: React.Ref<HTMLDivElement> }) {
  const I = nodo.estado === 'completado' && nodo.tipo !== 'cofre' ? Check : nodo.estado === 'bloqueado' && nodo.tipo !== 'cofre' ? Lock : ICONO_NODO[nodo.tipo]
  const bloqueado = nodo.estado === 'bloqueado'
  const fondo = bloqueado ? 'var(--color-arena-osc)' : nodo.tipo === 'cofre' ? 'var(--color-sol)' : color
  const relieve = bloqueado ? '#c4b592' : nodo.tipo === 'cofre' ? 'var(--color-sol-osc)' : colorOsc
  return (
    <div ref={refActual} className="relative flex justify-center py-3" style={corrido(posicion)}>
      {nodo.estado === 'actual' && (
        <>
          <motion.span
            className="absolute top-1.5 size-[84px] rounded-full border-4"
            style={{ borderColor: fondo }}
            animate={{ scale: [1, 1.22, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
          <motion.span
            className="font-display text-tinta border-arena-osc absolute -top-7 z-[1] rounded-xl border-2 bg-white px-3 py-1 text-[14px] font-semibold uppercase"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            {nodo.tipo === 'cofre' ? T.aprender.nodo.abrir : T.aprender.nodo.empezar}
          </motion.span>
        </>
      )}
      <button
        type="button"
        aria-label={`${T.aprender.nodo[nodo.tipo]} ${nodo.estado}`}
        onClick={() => {
          vibrar('toque')
          onClick()
        }}
        style={{ '--relieve': relieve, background: fondo, boxShadow: `0 7px 0 ${relieve}` } as CSSProperties}
        className={`relative grid size-[72px] place-items-center rounded-full border-0 transition-transform active:translate-y-1 ${bloqueado ? 'text-[#a3946f]' : 'text-white'}`}
      >
        <I size={32} strokeWidth={3} aria-hidden />
        {nodo.estado === 'completado' && nodo.tipo === 'cofre' && (
          <span className="bg-hoja absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-2 border-white">
            <Check size={15} strokeWidth={4} aria-hidden />
          </span>
        )}
      </button>
    </div>
  )
}

interface Props {
  onJugar: (s: Sesion) => void
  onIrAEspacio: () => void
  onGuia: () => void
}

export function Aprender({ onJugar, onIrAEspacio, onGuia }: Props) {
  const s = useStore()
  const hoy = hoyLocal()
  const [elegido, setElegido] = useState<Nodo | null>(null)
  const refActual = useRef<HTMLDivElement>(null)
  const refScroll = useRef<HTMLDivElement>(null)

  const plan = useMemo(() => planDeCamino(s.perfil ?? 'primerizo', s.mascotas, s.respuestas?.objetivo ?? 'basico'), [s.perfil, s.mascotas, s.respuestas])
  const camino = useMemo(() => construirCamino(plan.orden, LECCIONES_POR_UNIDAD, s), [plan, s])

  // Al abrir, el mapa se ubica solo en el nodo actual
  useLayoutEffect(() => {
    const el = refActual.current
    const cont = refScroll.current
    if (!el || !cont) return
    cont.scrollTop = el.offsetTop - cont.clientHeight / 2 + 60
  }, [])

  const nivel = nivelPara(s.xp)
  const racha = rachaVigente(s.racha, hoy)
  const metaOk = metaDeHoyCumplida(s.racha, hoy)
  const hayRefuerzo = refuerzoDisponible(s, hoy)
  const flores = camino.tramos.filter((t) => t.completa).map((t) => t.nodos[t.nodos.length - 1].indice)

  const jugar = (n: Nodo) => {
    setElegido(null)
    if (n.tipo === 'leccion') onJugar({ tipo: 'leccion', leccionId: n.id })
    else if (n.tipo === 'repaso') onJugar({ tipo: 'repaso', unidad: n.unidad })
    else onJugar({ tipo: 'cofre', unidad: n.unidad })
  }

  const contenido = useContenido()
  const leccionElegida = elegido?.tipo === 'leccion' ? contenido?.leccionPorId(elegido.id) : undefined

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="safe-top border-arena-osc z-20 shrink-0 border-b-2 bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div className={`flex items-center gap-1 text-[17px] font-extrabold ${racha > 0 ? 'text-terracota' : 'text-tinta-suave'}`} aria-label={`${T.aprender.racha}: ${racha}`}>
            <Flame size={24} fill={racha > 0 ? 'currentColor' : 'none'} aria-hidden />
            {racha}
          </div>
          <div className="text-sol-osc flex items-center gap-1 text-[17px] font-extrabold" aria-label={`${s.xp} ${T.comun.xp}`}>
            <Zap size={22} fill="currentColor" aria-hidden />
            {s.xp}
          </div>
          <button
            type="button"
            aria-label={TC.guia.titulo}
            onClick={() => {
              vibrar('toque')
              onGuia()
            }}
            className="border-arena-osc text-hoja-osc flex min-h-10 items-center gap-1.5 rounded-full border-2 bg-white px-3 text-[14px] font-extrabold active:opacity-70"
          >
            <BookOpen size={18} aria-hidden />
            {TC.guia.boton}
          </button>
          <div className="flex items-center gap-2" aria-label={`${T.aprender.nivel}: ${NIVELES[nivel.indice]}`}>
            <div className="text-right">
              <div className="font-display text-hoja-osc text-[15px] leading-none font-semibold">{NIVELES[nivel.indice]}</div>
              <div className="bg-arena-osc mt-1 h-1.5 w-16 overflow-hidden rounded-full">
                <div className="bg-hoja-clara h-full rounded-full" style={{ width: `${nivel.progreso * 100}%` }} />
              </div>
            </div>
            <span className="bg-brote text-hoja-osc grid size-9 place-items-center rounded-full">
              <Star size={18} fill="currentColor" aria-hidden />
            </span>
          </div>
        </div>
      </header>

      <InvitacionCuenta />

      <div className="relative min-h-0 flex-1">
        <Enredadera total={camino.totalNodos} hechos={camino.nodosHechos} flores={flores} />
        <div ref={refScroll} className="scroll-app absolute inset-0 overflow-x-hidden pl-11">
          <div className={`mx-3 mt-3 flex items-center gap-2 rounded-2xl px-3 py-2 text-[14px] font-extrabold ${metaOk ? 'bg-brote text-hoja-osc' : 'bg-sol-claro text-tinta'}`}>
            {metaOk ? <Check size={18} strokeWidth={3.4} aria-hidden /> : <Flame size={18} aria-hidden />}
            {metaOk ? T.aprender.metaHecha : T.aprender.metaPendiente}
          </div>

          {camino.tramos.map((tramo) => (
            <TramoVista
              key={tramo.unidad}
              tramo={tramo}
              recomendada={plan.recomendadas.includes(tramo.unidad)}
              salteable={plan.salteables.includes(tramo.unidad)}
              onNodo={setElegido}
              onSaltear={() => onJugar({ tipo: 'salteo', unidad: tramo.unidad })}
              refActual={refActual}
            />
          ))}

          <section className="px-3 pt-6 pb-10">
            <div className="border-hoja bg-brote rounded-3xl border-2 p-4 text-center">
              <Ilustracion nombre="ventana-sol" className="mx-auto w-3/5 rounded-2xl" />
              <h2 className="font-display text-hoja-osc mt-2 mb-0 text-[22px] font-semibold">{T.aprender.final.titulo}</h2>
              <p className="text-tinta mt-1 mb-3 text-[15px] font-bold">{T.aprender.final.texto}</p>
              <Boton onClick={onIrAEspacio}>{T.aprender.final.boton}</Boton>
            </div>
          </section>
        </div>
      </div>

      {/* Quiz de refuerzo: aparece cada tanto, flotando sobre el mapa, y se puede dejar para después */}
      {hayRefuerzo && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="border-sol absolute inset-x-3 bottom-3 z-10 rounded-3xl border-2 bg-white p-3 shadow-[0_4px_0_var(--color-sol-osc)]" role="region" aria-label={T.aprender.refuerzo.titulo}>
          <div className="flex items-center gap-3">
            <span className="bg-sol text-tinta grid size-11 shrink-0 place-items-center rounded-full">
              <Dumbbell size={22} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-tinta m-0 text-[17px] leading-tight font-semibold">{T.aprender.refuerzo.titulo}</p>
              <p className="text-tinta-suave m-0 text-[13px] font-bold">{T.aprender.refuerzo.texto(PREGUNTAS_REFUERZO)}</p>
            </div>
          </div>
          <div className="mt-2.5 flex gap-2">
            <button type="button" onClick={s.posponerRefuerzo} className="border-arena-osc text-tinta-suave min-h-11 flex-1 rounded-full border-2 bg-white text-[14px] font-extrabold">
              {T.aprender.refuerzo.despues}
            </button>
            <button
              type="button"
              onClick={() => {
                vibrar('toque')
                onJugar({ tipo: 'refuerzo' })
              }}
              className="bg-sol text-tinta min-h-11 flex-1 rounded-full border-0 text-[15px] font-extrabold"
            >
              {T.aprender.refuerzo.empezar}
            </button>
          </div>
        </motion.div>
      )}

      <HojaInferior abierta={elegido !== null} onCerrar={() => setElegido(null)}>
        {elegido && (
          <div>
            <p className="m-0 text-[13px] font-extrabold tracking-widest uppercase" style={{ color: UNIDADES[elegido.unidad].colorOsc }}>
              {T.aprender.unidad} {UNIDADES[elegido.unidad].numero} · {T.aprender.nodo[elegido.tipo]}
            </p>
            <h2 className="font-display text-tinta mt-1 mb-1 text-[24px] leading-tight font-semibold">
              {leccionElegida?.titulo ?? (elegido.tipo === 'repaso' ? `${T.aprender.nodo.repaso}: ${UNIDADES[elegido.unidad].titulo}` : UNIDADES[elegido.unidad].semilla)}
            </h2>
            <p className="text-tinta-suave mt-0 mb-4 text-[15px] font-bold">
              {elegido.estado === 'bloqueado'
                ? T.aprender.nodo.bloqueado
                : elegido.tipo === 'leccion'
                  ? `${leccionElegida?.gancho} · ${T.aprender.nodo.minutos}`
                  : elegido.tipo === 'repaso'
                    ? T.aprender.nodo.repasoTexto
                    : elegido.estado === 'completado'
                      ? T.aprender.nodo.cofreAbierto
                      : T.leccion.cofre.texto}
            </p>
            {elegido.estado === 'bloqueado' || (elegido.tipo === 'cofre' && elegido.estado === 'completado') ? (
              <Boton variante="secundario" onClick={() => setElegido(null)}>
                {T.comun.listo}
              </Boton>
            ) : (
              <Boton variante={elegido.tipo === 'cofre' ? 'sol' : 'primario'} onClick={() => jugar(elegido)}>
                {elegido.tipo === 'cofre' ? T.aprender.nodo.abrir : elegido.estado === 'completado' ? T.aprender.nodo.repetir : `${T.aprender.nodo.empezar} · +${leccionElegida?.xp ?? 10} ${T.comun.xp}`}
              </Boton>
            )}
          </div>
        )}
      </HojaInferior>
    </div>
  )
}

function TramoVista({ tramo, recomendada, salteable, onNodo, onSaltear, refActual }: { tramo: Tramo; recomendada: boolean; salteable: boolean; onNodo: (n: Nodo) => void; onSaltear: () => void; refActual: React.Ref<HTMLDivElement> }) {
  const u = UNIDADES[tramo.unidad]
  const puedeSaltear = salteable && tramo.disponible && !tramo.salteada && tramo.nodos.some((n) => n.tipo !== 'cofre' && n.estado !== 'completado')
  return (
    <section className="pt-4" aria-label={`${T.aprender.unidad} ${u.numero}: ${u.titulo}`}>
      <div
        className="sticky top-2 z-10 mx-3 rounded-3xl px-4 py-3 text-white"
        style={{ background: tramo.disponible ? u.color : '#9a9382', boxShadow: `0 5px 0 ${tramo.disponible ? u.colorOsc : '#77715f'}` }}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="m-0 text-[13px] font-extrabold tracking-widest uppercase opacity-90">
            {T.aprender.unidad} {u.numero}
          </p>
          {!tramo.disponible ? (
            <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[12px] font-extrabold">{T.comun.proximamente}</span>
          ) : tramo.salteada ? (
            <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[12px] font-extrabold">{T.aprender.salteada}</span>
          ) : recomendada ? (
            <span className="text-tinta bg-sol flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-extrabold">
              <Star size={12} fill="currentColor" aria-hidden />
              {T.aprender.recomendada}
            </span>
          ) : null}
        </div>
        <h2 className="font-display m-0 text-[22px] leading-tight font-semibold">{u.titulo}</h2>
        <p className="m-0 text-[14px] leading-snug font-bold opacity-95">{u.descripcion}</p>
        {puedeSaltear && (
          <button type="button" onClick={onSaltear} className="mt-2 flex min-h-11 items-center gap-1.5 rounded-xl border-0 bg-white/20 px-3 text-[14px] font-extrabold text-white">
            <FastForward size={16} fill="currentColor" aria-hidden />
            {T.aprender.saltear}
          </button>
        )}
      </div>

      {tramo.disponible ? (
        <div className="flex flex-col pt-9 pb-2">
          {/* Las lecciones se muestran en el orden del plan; las que todavía no tienen contenido quedan como "Próximamente" */}
          {[...idsDelPlan(tramo.unidad), ...tramo.nodos.filter((n) => n.tipo !== 'leccion').map((n) => n.id)].map((id, i) => {
            const n = tramo.nodos.find((x) => x.id === id)
            if (n) return <BotonNodo key={id} nodo={n} posicion={i} color={u.color} colorOsc={u.colorOsc} onClick={() => onNodo(n)} refActual={n.estado === 'actual' ? refActual : undefined} />
            return (
              <div key={id} className="flex flex-col items-center py-2" style={corrido(i)}>
                <span className="border-arena-osc grid size-14 place-items-center rounded-full border-[3px] border-dashed text-[#b5a784]" role="img" aria-label={`${u.plan[i]}: ${T.comun.proximamente}`}>
                  <Leaf size={22} aria-hidden />
                </span>
                <span className="text-tinta-suave mt-1 max-w-36 text-center text-[12px] leading-tight font-extrabold">
                  {u.plan[i]} · {T.comun.proximamente}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="px-3 pt-5 pb-2 text-center">
          <div className="flex flex-wrap justify-center gap-3" aria-hidden>
            {u.plan.map((t) => (
              <span key={t} className="border-arena-osc grid size-12 place-items-center rounded-full border-[3px] border-dashed text-[#b5a784]">
                <Lock size={18} />
              </span>
            ))}
          </div>
          <p className="text-tinta-suave mt-3 mb-0 text-[14px] font-bold">{T.aprender.proximamenteTexto}</p>
        </div>
      )}
    </section>
  )
}

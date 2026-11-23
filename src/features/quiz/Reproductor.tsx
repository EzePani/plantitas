import { AnimatePresence, motion } from 'framer-motion'
import { Check, Flame, Gift, X, Zap } from 'lucide-react'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Boton } from '../../components/Boton'
import { Rico } from '../../components/Rico'
import { Dialogo } from '../../components/Dialogo'
import { FotoPlanta } from '../../components/FotoPlanta'
import { Icono } from '../../components/Icono'
import { Brote } from '../../components/Ilustracion'
import { INSIGNIAS } from '../../data/gamificacion'
import type { Pregunta } from '../../data/lessons'
import { leccionPorId, preguntasDeUnidad } from '../../data/lessons/contenido'
import { plantaPorId } from '../../data/plantas'
import { T } from '../../data/textos'
import { UNIDADES } from '../../data/unidades'
import { idRepaso } from '../../lib/camino'
import { vibrar } from '../../lib/haptics'
import { armarRefuerzo, clavePregunta, leccionesHechas } from '../../lib/refuerzo'
import type { UnidadId } from '../../lib/tipos'
import { useStore, type Resumen } from '../../store/useStore'
import { PreguntaVista } from './PreguntaVista'
import { TarjetaVista } from './TarjetaVista'

export type Sesion =
  | { tipo: 'leccion'; leccionId: string }
  | { tipo: 'repaso'; unidad: UnidadId }
  | { tipo: 'salteo'; unidad: UnidadId }
  | { tipo: 'cofre'; unidad: UnidadId }
  | { tipo: 'refuerzo' }

const PREGUNTAS_REPASO = 4
const PREGUNTAS_SALTEO = 5
/** Proporción de aciertos necesaria para saltear una unidad */
export const MINIMO_SALTEO = 0.8

type Etapa = 'gancho' | 'tarjetas' | 'llevar' | 'quiz' | 'fin'

const elegir = (lista: string[], n: number) => lista[n % lista.length]

export function Reproductor({ sesion, onCerrar }: { sesion: Sesion; onCerrar: () => void }) {
  const completarNodo = useStore((s) => s.completarNodo)
  const abrirCofre = useStore((s) => s.abrirCofre)
  const saltarUnidad = useStore((s) => s.saltarUnidad)
  const anotarRespuestas = useStore((s) => s.anotarRespuestas)
  const completarRefuerzo = useStore((s) => s.completarRefuerzo)
  // El refuerzo se arma una sola vez al abrir: si no, cada respuesta cambiaría las preguntas
  const [refuerzo] = useState(() => {
    if (sesion.tipo !== 'refuerzo') return []
    const s = useStore.getState()
    return armarRefuerzo(leccionesHechas(s.completadas), s.refuerzo.fallidas, leccionPorId)
  })
  /** Cómo se respondió cada pregunta, en orden */
  const resultados = useRef<boolean[]>([])

  const leccion = sesion.tipo === 'leccion' ? leccionPorId(sesion.leccionId) : undefined
  const preguntas: Pregunta[] = useMemo(() => {
    if (sesion.tipo === 'leccion') return leccion?.quiz ?? []
    if (sesion.tipo === 'repaso') return preguntasDeUnidad(sesion.unidad, PREGUNTAS_REPASO)
    if (sesion.tipo === 'salteo') return preguntasDeUnidad(sesion.unidad, PREGUNTAS_SALTEO)
    if (sesion.tipo === 'refuerzo') return refuerzo.map((r) => r.pregunta)
    return []
  }, [sesion, leccion, refuerzo])
  const tarjetas = leccion?.tarjetas ?? []

  const [etapa, setEtapa] = useState<Etapa>(sesion.tipo === 'leccion' ? 'gancho' : sesion.tipo === 'cofre' ? 'fin' : 'quiz')
  const [iTarjeta, setITarjeta] = useState(0)
  const [iPregunta, setIPregunta] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [respuesta, setRespuesta] = useState<boolean | null>(null)
  const [salir, setSalir] = useState(false)
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [cofreAbierto, setCofreAbierto] = useState(false)

  const pasosTotales = tarjetas.length + (leccion ? 1 : 0) + preguntas.length
  const pasosHechos =
    etapa === 'gancho' ? 0 : etapa === 'tarjetas' ? iTarjeta : etapa === 'llevar' ? tarjetas.length : etapa === 'quiz' ? tarjetas.length + (leccion ? 1 : 0) + iPregunta + (respuesta !== null ? 1 : 0) : pasosTotales

  const terminar = (aciertosFinales: number) => {
    // Claves de las preguntas de esta sesión, para anotar cuáles conviene repetir
    const claves = sesion.tipo === 'leccion' && leccion ? preguntas.map((_, i) => clavePregunta(leccion.id, i)) : refuerzo.map((r) => r.clave)
    const falladas = claves.filter((_, i) => resultados.current[i] === false)
    const acertadas = claves.filter((_, i) => resultados.current[i] === true)
    if (sesion.tipo === 'refuerzo') {
      setResumen(completarRefuerzo(aciertosFinales, preguntas.length, falladas, acertadas))
    } else if (sesion.tipo === 'leccion' && leccion) {
      anotarRespuestas(falladas, acertadas)
      setResumen(completarNodo(leccion.id, leccion.xp, aciertosFinales, preguntas.length))
    } else if (sesion.tipo === 'repaso') {
      setResumen(completarNodo(idRepaso(sesion.unidad), 0, aciertosFinales, preguntas.length))
    } else if (sesion.tipo === 'salteo') {
      if (aciertosFinales / preguntas.length >= MINIMO_SALTEO) saltarUnidad(sesion.unidad)
    }
    vibrar('festejo')
    setEtapa('fin')
  }

  const siguientePregunta = () => {
    setRespuesta(null)
    if (iPregunta < preguntas.length - 1) setIPregunta(iPregunta + 1)
    else terminar(aciertos)
  }

  const avanzarTarjeta = (delta: number) => {
    const n = iTarjeta + delta
    if (n < 0) return
    if (n >= tarjetas.length) setEtapa('llevar')
    else setITarjeta(n)
  }

  let cuerpo: ReactNode
  let pie: ReactNode = null

  if (etapa === 'gancho' && leccion) {
    cuerpo = (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <motion.div animate={{ rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
          <Brote animo="pensando" className="h-40 w-36" />
        </motion.div>
        <p className="text-tinta-suave mt-2 mb-1 text-[14px] font-extrabold tracking-widest uppercase">{leccion.titulo}</p>
        <h1 className="font-display text-hoja-osc m-0 text-[30px] leading-tight font-semibold">{leccion.gancho}</h1>
        {leccion.estado === 'no_verificado' && (
          <p className="bg-sol-claro text-tinta mt-5 rounded-2xl px-4 py-2 text-[13px] font-bold">{T.aprender.nodo.borrador}</p>
        )}
      </div>
    )
    pie = <Boton onClick={() => setEtapa('tarjetas')}>{T.leccion.empezar}</Boton>
  } else if (etapa === 'tarjetas') {
    cuerpo = (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={iTarjeta}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.2 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.x < -70) avanzarTarjeta(1)
            else if (info.offset.x > 70) avanzarTarjeta(-1)
          }}
        >
          <TarjetaVista tarjeta={tarjetas[iTarjeta]} />
        </motion.div>
      </AnimatePresence>
    )
    pie = <Boton onClick={() => avanzarTarjeta(1)}>{T.comun.continuar}</Boton>
  } else if (etapa === 'llevar' && leccion) {
    cuerpo = (
      <div className="flex flex-col gap-4 pt-2">
        <h1 className="font-display text-hoja-osc m-0 text-[30px] font-semibold">{T.leccion.paraLlevarte}</h1>
        {leccion.para_llevarte.map((p, n) => (
          <motion.div
            key={p}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + n * 0.18 }}
            className="border-arena-osc flex items-center gap-3 rounded-2xl border-2 bg-white p-4"
          >
            <span className="font-display bg-hoja grid size-9 shrink-0 place-items-center rounded-full text-[18px] font-semibold text-white">{n + 1}</span>
            <span className="text-tinta text-[17px] leading-snug font-medium"><Rico texto={p} /></span>
          </motion.div>
        ))}
      </div>
    )
    pie = (
      <Boton variante="sol" onClick={() => setEtapa('quiz')}>
        {T.leccion.irAlQuiz}
      </Boton>
    )
  } else if (etapa === 'quiz') {
    const p = preguntas[iPregunta]
    cuerpo = (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={iPregunta} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.2 }}>
          <PreguntaVista
            pregunta={p}
            onResponder={(ok) => {
              resultados.current[iPregunta] = ok
              if (ok) setAciertos((a) => a + 1)
              setRespuesta(ok)
            }}
          />
        </motion.div>
      </AnimatePresence>
    )
  } else {
    cuerpo = <Fin sesion={sesion} resumen={resumen} aciertos={aciertos} total={preguntas.length} cofreAbierto={cofreAbierto} />
    if (sesion.tipo === 'cofre' && !cofreAbierto) {
      pie = (
        <Boton
          variante="sol"
          onClick={() => {
            setResumen(abrirCofre(sesion.unidad))
            setCofreAbierto(true)
            vibrar('festejo')
          }}
        >
          {T.aprender.nodo.abrir}
        </Boton>
      )
    } else {
      pie = <Boton onClick={onCerrar}>{T.comun.continuar}</Boton>
    }
  }

  const p = preguntas[iPregunta]

  return (
    <div className="safe-top relative flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 px-4">
        {etapa !== 'fin' && (
          <>
            <button
              type="button"
              aria-label={T.comun.cerrar}
              onClick={() => setSalir(true)}
              className="text-tinta-suave -ml-2 grid size-11 place-items-center rounded-full border-0 bg-transparent"
            >
              <X size={28} strokeWidth={2.6} />
            </button>
            <div className="bg-arena-osc h-4 flex-1 overflow-hidden rounded-full">
              <motion.div className="bg-hoja-clara h-full rounded-full" initial={false} animate={{ width: `${(pasosHechos / Math.max(1, pasosTotales)) * 100}%` }} transition={{ type: 'spring', damping: 24 }} />
            </div>
          </>
        )}
      </header>

      <div className="scroll-app flex min-h-0 flex-1 flex-col px-5 pb-4">{cuerpo}</div>

      {pie && <footer className="shrink-0 px-5 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]">{pie}</footer>}

      {/* Feedback inmediato: panel que sube desde abajo */}
      <AnimatePresence>
        {etapa === 'quiz' && respuesta !== null && (
          <motion.div
            role="status"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`safe-bottom absolute inset-x-0 bottom-0 z-10 rounded-t-[28px] px-5 pt-5 ${respuesta ? 'bg-brote' : 'bg-alerta-clara'}`}
          >
            <div className="flex items-center gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full text-white ${respuesta ? 'bg-hoja' : 'bg-alerta'}`}>
                {respuesta ? <Check strokeWidth={3.4} aria-hidden /> : <X strokeWidth={3.4} aria-hidden />}
              </span>
              <h2 className={`font-display m-0 text-[24px] font-semibold ${respuesta ? 'text-hoja-osc' : 'text-alerta'}`}>
                {respuesta ? elegir(T.leccion.correcto, iPregunta) : elegir(T.leccion.incorrecto, iPregunta)}
              </h2>
            </div>
            {!respuesta && <p className="text-tinta mt-2 mb-0 text-[16px] leading-snug font-medium"><Rico texto={p.explicacion} /></p>}
            <div className="pt-4 pb-9">
              <Boton variante={respuesta ? 'primario' : 'alerta'} onClick={siguientePregunta}>
                {T.comun.continuar}
              </Boton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialogo abierto={salir} titulo={T.leccion.salirTitulo} texto={T.leccion.salirTexto}>
        <Boton onClick={() => setSalir(false)}>{T.leccion.salirNo}</Boton>
        <Boton variante="fantasma" onClick={onCerrar}>
          {T.leccion.salirSi}
        </Boton>
      </Dialogo>
    </div>
  )
}

/** Lluvia de hojitas para festejar */
function Hojitas() {
  const hojas = Array.from({ length: 16 }, (_, i) => i)
  const colores = ['#2f7d4a', '#8fd16a', '#f2b33d', '#c9603a']
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {hojas.map((i) => (
        <motion.svg
          key={i}
          viewBox="-14 -44 28 46"
          className="absolute top-0 h-7 w-5"
          style={{ left: `${(i * 37) % 96}%` }}
          initial={{ y: -40, rotate: i * 40, opacity: 0 }}
          animate={{ y: 620, rotate: i * 40 + 300, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2 + (i % 5) * 0.3, delay: (i % 8) * 0.12, ease: 'easeIn' }}
        >
          <path d="M0 0C-13-10-13-30 0-42 13-30 13-10 0 0z" fill={colores[i % colores.length]} />
        </motion.svg>
      ))}
    </div>
  )
}

function Dato({ icono, valor, etiqueta, color }: { icono: ReactNode; valor: string; etiqueta: string; color: string }) {
  return (
    <div className={`flex flex-1 flex-col items-center rounded-2xl p-3 ${color}`}>
      {icono}
      <span className="font-display text-tinta text-[22px] leading-tight font-semibold">{valor}</span>
      <span className="text-tinta-suave text-[12px] font-extrabold uppercase">{etiqueta}</span>
    </div>
  )
}

function Fin({ sesion, resumen, aciertos, total, cofreAbierto }: { sesion: Sesion; resumen: Resumen | null; aciertos: number; total: number; cofreAbierto: boolean }) {
  const F = T.leccion.fin

  if (sesion.tipo === 'salteo') {
    const aprobo = aciertos / total >= MINIMO_SALTEO
    const S = T.aprender.salteo
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        {aprobo && <Hojitas />}
        <Brote animo={aprobo ? 'festejo' : 'feliz'} className="h-44 w-40" />
        <h1 className="font-display text-hoja-osc mt-2 mb-0 text-[30px] leading-tight font-semibold">{aprobo ? S.aprobado : S.desaprobado}</h1>
        <p className="text-tinta mt-2 text-[17px] leading-snug font-bold">{aprobo ? S.aprobadoTexto : S.desaprobadoTexto}</p>
        <p className="text-tinta-suave text-[15px] font-extrabold">
          {F.aciertos}: {aciertos}/{total}
        </p>
      </div>
    )
  }

  if (sesion.tipo === 'cofre') {
    const u = UNIDADES[sesion.unidad]
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        {cofreAbierto && <Hojitas />}
        <motion.div
          animate={cofreAbierto ? { scale: [1, 1.25, 1], rotate: 0 } : { rotate: [-5, 5, -5] }}
          transition={cofreAbierto ? { duration: 0.5 } : { repeat: Infinity, duration: 0.9 }}
          className="bg-sol grid size-36 place-items-center rounded-[40px] text-white shadow-[0_8px_0_var(--color-sol-osc)]"
        >
          {cofreAbierto ? <Icono nombre="semilla" size={72} /> : <Gift size={72} strokeWidth={2.2} aria-hidden />}
        </motion.div>
        {cofreAbierto && plantaPorId(u.planta) && (
          <motion.div initial={{ scale: 0, rotate: -8 }} animate={{ scale: 1, rotate: 4 }} transition={{ delay: 0.35, type: 'spring', damping: 11 }} className="-mt-10 ml-28 rounded-3xl border-4 border-white shadow-lg">
            <FotoPlanta planta={plantaPorId(u.planta)!} className="size-24 rounded-[20px]" />
          </motion.div>
        )}
        {cofreAbierto && resumen && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h1 className="font-display text-hoja-osc m-0 text-[30px] font-semibold">{T.leccion.cofre.titulo}</h1>
            <p className="text-tinta mt-1 text-[17px] font-bold">{T.leccion.cofre.texto}</p>
            <p className="text-tinta-suave -mt-2 text-[14px] font-bold">{T.leccion.cofre.jardin}</p>
            <p className="font-display bg-brote text-hoja-osc mx-auto w-fit rounded-full px-4 py-2 text-[18px] font-semibold">{u.semilla}</p>
            <p className="text-sol-osc text-[18px] font-extrabold">
              +{resumen.xpGanada} {T.comun.xp}
            </p>
            <Insignias resumen={resumen} />
          </motion.div>
        )}
      </div>
    )
  }

  if (!resumen) return null
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center text-center">
      <Hojitas />
      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 9 }}>
        <Brote animo="festejo" className="h-44 w-40" />
      </motion.div>
      <h1 className="font-display text-hoja-osc mt-2 mb-4 text-[32px] leading-tight font-semibold">{sesion.tipo === 'refuerzo' ? F.tituloRefuerzo : sesion.tipo === 'repaso' ? F.tituloRepaso : F.titulo}</h1>
      <div className="flex w-full gap-2">
        <Dato color="bg-brote" icono={<Check className="text-hoja" strokeWidth={3.2} aria-hidden />} valor={`${resumen.aciertos}/${resumen.total}`} etiqueta={F.aciertos} />
        <Dato color="bg-sol-claro" icono={<Zap className="text-sol-osc" fill="currentColor" aria-hidden />} valor={`+${resumen.xpGanada}`} etiqueta={F.xpGanada} />
        <Dato color="bg-terracota-clara" icono={<Flame className="text-terracota" fill="currentColor" aria-hidden />} valor={`${resumen.rachaDias}`} etiqueta={resumen.rachaDias === 1 ? F.dia : F.dias} />
      </div>
      {resumen.subioDeNivel && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="font-display bg-sol text-tinta mt-4 mb-0 rounded-full px-5 py-2 text-[18px] font-semibold">
          {F.subisteDeNivel}
        </motion.p>
      )}
      <Insignias resumen={resumen} />
    </div>
  )
}

function Insignias({ resumen }: { resumen: Resumen }) {
  if (resumen.insigniasNuevas.length === 0) return null
  return (
    <div className="mt-4 flex w-full flex-col gap-2">
      {resumen.insigniasNuevas.map((id, n) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + n * 0.2 }}
          className="border-sol flex items-center gap-3 rounded-2xl border-2 bg-white p-3 text-left"
        >
          <span className="bg-sol grid size-11 shrink-0 place-items-center rounded-full text-white">
            <Icono nombre={INSIGNIAS[id].icono} />
          </span>
          <div>
            <div className="text-sol-osc text-[12px] font-extrabold uppercase">{T.leccion.fin.insigniaNueva}</div>
            <div className="font-display text-tinta text-[17px] font-semibold">{INSIGNIAS[id].nombre}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

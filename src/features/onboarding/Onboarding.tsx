import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, PawPrint } from 'lucide-react'
import { lazy, Suspense, useState, type ReactNode } from 'react'
import { Recuperar } from '../profile/Recuperar'
import { TCU, TR } from '../../data/textosNube'
import { posponerInvitacionCuenta } from '../../components/InvitacionCuenta'
import { Boton } from '../../components/Boton'
import { Brote } from '../../components/Ilustracion'
import { OpcionGrande } from '../../components/OpcionGrande'
import { ONBOARDING as O, PERFILES, type Opcion } from '../../data/onboarding'
import { UNIDADES } from '../../data/unidades'
import { asignarPerfil, planDeCamino } from '../../lib/perfil'
import { TC } from '../../data/textosCatalogo'
import type { DatosMascotas, PerfilLuz, Respuestas, TipoEspacio } from '../../lib/tipos'
import { useStore, type EspacioInicial } from '../../store/useStore'
import { PasoHoras, PasoObstaculos, PasoTipoLuz, ResumenLuz, pasosDeLuz } from '../spaces/EditorLuz'
import { useAtras } from '../../lib/useAtras'

// El cliente de la nube pesa bastante: solo se baja al llegar al paso de cuenta
const Nube = lazy(() => import('../profile/Nube').then((m) => ({ default: m.Nube })))

/** Los pasos de luz llevan el índice del espacio: "luz-tipo-0", "luz-horas-1"… */
type PasoLuz = `luz-${'tipo' | 'horas' | 'obstaculos'}-${number}`
type Paso = 'bienvenida' | 'cuenta' | 'experiencia' | 'test' | 'lugar' | PasoLuz | 'otro' | 'mascotas' | 'muerde' | 'alcance' | 'tiempo' | 'objetivo' | 'resultado'

/** En el onboarding se cargan como mucho 2 espacios; el resto se suma desde "Mi espacio" */
const MAX_ESPACIOS = 2

interface EspacioBorrador {
  tipo: TipoEspacio
  luz?: PerfilLuz
}

type Borrador = Partial<Respuestas> & { mascota?: DatosMascotas['tipo']; muerde?: DatosMascotas['muerde']; alcance?: DatosMascotas['alcance'] }

const ESPACIOS_POR_LUGAR: Record<NonNullable<Respuestas['lugar']>, TipoEspacio[]> = { interior: ['living'], balcon: ['balcon'], ambos: ['living', 'balcon'] }

function pasosPara(b: Borrador, espacios: EspacioBorrador[], sumoOtro: boolean): Paso[] {
  const pasos: Paso[] = ['bienvenida', 'cuenta', 'experiencia']
  if (b.experiencia === 'bastante') pasos.push('test')
  pasos.push('lugar')
  const deLuz = (i: number) => pasosDeLuz(espacios[i]?.luz).map((p): PasoLuz => `luz-${p}-${i}`)
  // 3a-3c por cada espacio de la pregunta 2; 3d ofrece sumar otro si todavía hay lugar
  const base = sumoOtro ? espacios.length - 1 : espacios.length
  for (let i = 0; i < base; i++) pasos.push(...deLuz(i))
  if (base < MAX_ESPACIOS) pasos.push('otro')
  if (sumoOtro) pasos.push(...deLuz(espacios.length - 1))
  pasos.push('mascotas')
  if (b.mascota && b.mascota !== 'ninguna') pasos.push('muerde', 'alcance')
  pasos.push('tiempo', 'objetivo', 'resultado')
  return pasos
}

function Lista<T extends string>({ opciones, valor, onElegir }: { opciones: Opcion<T>[]; valor?: T; onElegir: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {opciones.map((o) => (
        <OpcionGrande key={o.valor} texto={o.texto} icono={o.icono} elegida={valor === o.valor} onClick={() => onElegir(o.valor)} />
      ))}
    </div>
  )
}

function Encabezado({ titulo, animo = 'feliz' }: { titulo: string; animo?: 'feliz' | 'pensando' }) {
  return (
    <div className="mb-5 flex items-end gap-2">
      <Brote animo={animo} className="h-24 w-22 shrink-0" />
      <div className="border-arena-osc relative mb-3 rounded-3xl rounded-bl-md border-2 bg-white px-4 py-3">
        <h1 className="font-display text-tinta m-0 text-[21px] leading-tight font-semibold">{titulo}</h1>
      </div>
    </div>
  )
}

export function Onboarding() {
  const completar = useStore((s) => s.completarOnboarding)
  const [b, setB] = useState<Borrador>({})
  const [espacios, setEspacios] = useState<EspacioBorrador[]>([])
  const [sumoOtro, setSumoOtro] = useState(false)
  const [paso, setPaso] = useState<Paso>('bienvenida')
  const [recuperando, setRecuperando] = useState(false)
  const [dir, setDir] = useState(1)
  const [preguntaTest, setPreguntaTest] = useState(0)
  const [aciertos, setAciertos] = useState(0)

  const pasos = pasosPara(b, espacios, sumoOtro)
  const i = pasos.indexOf(paso)
  const set = (cambios: Borrador) => setB((prev) => ({ ...prev, ...cambios }))

  const avanzar = () => {
    setDir(1)
    setPaso(pasos[i + 1])
  }
  const volver = () => {
    setDir(-1)
    // El paso de cuenta no se revisita: desde ahí atrás se vuelve a la bienvenida
    const anterior = pasos[i - 1] === 'cuenta' ? pasos[i - 2] : pasos[i - 1]
    if (paso === 'test' || pasos[i - 1] === 'test') {
      setPreguntaTest(0)
      setAciertos(0)
    }
    setPaso(anterior)
  }
  useAtras(paso !== 'bienvenida', volver)

  // Paso de luz actual: qué sub-paso es y de qué espacio
  const luzActual = paso.startsWith('luz-') ? { sub: paso.split('-')[1] as 'tipo' | 'horas' | 'obstaculos', i: Number(paso.split('-')[2]) } : null
  const setLuz = (i: number, luz: PerfilLuz) => setEspacios((es) => es.map((e, n) => (n === i ? { ...e, luz } : e)))

  const puedeSeguirFijo: Partial<Record<Paso, boolean>> = {
    experiencia: Boolean(b.experiencia),
    test: false,
    lugar: Boolean(b.lugar),
    otro: false,
    mascotas: Boolean(b.mascota),
    muerde: Boolean(b.muerde),
    alcance: Boolean(b.alcance),
    tiempo: Boolean(b.tiempo),
    objetivo: Boolean(b.objetivo),
  }
  const puedeSeguir = luzActual ? luzActual.sub !== 'tipo' || Boolean(espacios[luzActual.i]?.luz) : (puedeSeguirFijo[paso] ?? true)

  const elegirLugar = (lugar: NonNullable<Respuestas['lugar']>) => {
    set({ lugar })
    // Cambiar la respuesta arma los espacios de nuevo, conservando la luz de los que siguen
    setEspacios((es) => ESPACIOS_POR_LUGAR[lugar].map((tipo) => es.find((e) => e.tipo === tipo) ?? { tipo }))
    setSumoOtro(false)
  }

  const iniciales: EspacioInicial[] = espacios.filter((e): e is Required<EspacioBorrador> => Boolean(e.luz)).map((e) => ({ tipo: e.tipo, nombre: TC.espacio.nombres[e.tipo], luz: e.luz }))

  const mascotas: DatosMascotas =
    b.mascota && b.mascota !== 'ninguna' ? { tipo: b.mascota, muerde: b.muerde, alcance: b.alcance } : { tipo: 'ninguna' }

  const terminar = () => {
    completar(
      {
        experiencia: b.experiencia!,
        aciertosTest: b.experiencia === 'bastante' ? aciertos : undefined,
        lugar: b.lugar!,
        tiempo: b.tiempo!,
        objetivo: b.objetivo!,
      },
      mascotas,
      iniciales,
    )
  }

  const responderTest = (opcion: number) => {
    const ok = opcion === O.test.preguntas[preguntaTest].correcta
    const total = aciertos + (ok ? 1 : 0)
    setAciertos(total)
    if (preguntaTest < O.test.preguntas.length - 1) setPreguntaTest(preguntaTest + 1)
    else avanzar()
  }

  let contenido: ReactNode
  if (luzActual) {
    const e = espacios[luzActual.i]
    const lugar = TC.espacio.enTu[e.tipo]
    contenido =
      luzActual.sub === 'tipo' ? (
        <>
          <Encabezado titulo={TC.luz.tipo.titulo(lugar)} />
          <PasoTipoLuz luz={e.luz} onCambio={(l) => setLuz(luzActual.i, l)} />
        </>
      ) : luzActual.sub === 'horas' ? (
        <>
          <Encabezado titulo={TC.luz.horas.titulo} />
          <PasoHoras luz={e.luz!} onCambio={(l) => setLuz(luzActual.i, l)} />
        </>
      ) : (
        <>
          <Encabezado titulo={TC.luz.obstaculos.titulo} />
          <PasoObstaculos luz={e.luz!} onCambio={(l) => setLuz(luzActual.i, l)} />
        </>
      )
  }
  switch (paso) {
    case 'bienvenida':
      contenido = (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}>
            <Brote className="h-52 w-48" />
          </motion.div>
          <h1 className="font-display text-hoja-osc mt-2 text-[34px] leading-none font-semibold">{O.bienvenida.titulo}</h1>
          <p className="text-tinta mt-3 max-w-[18rem] text-[18px] leading-snug font-bold">{O.bienvenida.texto}</p>
          <p className="text-tinta-suave mt-3 text-[14px] font-bold">{O.bienvenida.nota}</p>
        </div>
      )
      break
    case 'cuenta':
      contenido = (
        <>
          <Encabezado titulo={TCU.titulo} />
          <p className="text-tinta-suave m-0 text-[15px] leading-snug font-bold">{TCU.texto}</p>
          <Suspense fallback={null}>
            <Nube compacto onListo={avanzar} />
          </Suspense>
          <Boton
            variante="fantasma"
            className="mt-2"
            onClick={() => {
              posponerInvitacionCuenta(1)
              avanzar()
            }}
          >
            {TCU.saltar}
          </Boton>
        </>
      )
      break
    case 'experiencia':
      contenido = (
        <>
          <Encabezado titulo={O.experiencia.titulo} />
          <Lista opciones={O.experiencia.opciones} valor={b.experiencia} onElegir={(v) => set({ experiencia: v })} />
        </>
      )
      break
    case 'test': {
      const p = O.test.preguntas[preguntaTest]
      contenido = (
        <>
          <Encabezado titulo={O.test.titulo} animo="pensando" />
          <p className="text-tinta-suave -mt-2 mb-4 text-[15px] font-bold">{O.test.texto}</p>
          <div className="mb-4 flex gap-2" aria-hidden>
            {O.test.preguntas.map((_, n) => (
              <span key={n} className={`h-2 flex-1 rounded-full ${n <= preguntaTest ? 'bg-sol' : 'bg-arena-osc'}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={preguntaTest} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <h2 className="text-tinta mb-4 text-[19px] leading-snug font-extrabold">{p.pregunta}</h2>
              <div className="flex flex-col gap-3">
                {p.opciones.map((t, n) => (
                  <OpcionGrande key={t} texto={t} onClick={() => responderTest(n)} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )
      break
    }
    case 'lugar':
      contenido = (
        <>
          <Encabezado titulo={O.lugar.titulo} />
          <Lista opciones={O.lugar.opciones} valor={b.lugar} onElegir={elegirLugar} />
        </>
      )
      break
    case 'otro': {
      const libres = TC.espacio.pasos.tipo.opciones.filter((o) => !espacios.some((e) => e.tipo === o.valor))
      const sumar = (tipo: TipoEspacio) => {
        setEspacios((es) => [...es.slice(0, sumoOtro ? -1 : undefined), { tipo }])
        setSumoOtro(true)
        setDir(1)
        setPaso(`luz-tipo-${sumoOtro ? espacios.length - 1 : espacios.length}`)
      }
      const noSumar = () => {
        if (sumoOtro) setEspacios((es) => es.slice(0, -1))
        setSumoOtro(false)
        setDir(1)
        setPaso('mascotas')
      }
      contenido = (
        <>
          <Encabezado titulo={O.otroEspacio.titulo} />
          <p className="text-tinta-suave -mt-2 mb-4 text-[15px] leading-snug font-bold">{O.otroEspacio.texto}</p>
          <div className="mb-3 grid grid-cols-2 gap-2.5">
            {libres.map((o) => (
              <OpcionGrande key={o.valor} compacta icono={o.icono} texto={o.texto} elegida={sumoOtro && espacios[espacios.length - 1]?.tipo === o.valor} onClick={() => sumar(o.valor)} />
            ))}
          </div>
          <OpcionGrande icono="no" texto={O.otroEspacio.no} onClick={noSumar} />
          <p className="text-tinta-suave mt-4 text-[14px] leading-snug font-bold">{O.otroEspacio.nota}</p>
        </>
      )
      break
    }
    case 'mascotas':
      contenido = (
        <>
          <Encabezado titulo={O.mascotas.titulo} />
          <Lista opciones={O.mascotas.opciones} valor={b.mascota} onElegir={(v) => set({ mascota: v, muerde: undefined, alcance: undefined })} />
          <p className="text-tinta-suave mt-4 text-[14px] leading-snug font-bold">{O.mascotas.nota}</p>
        </>
      )
      break
    case 'muerde':
      contenido = (
        <>
          <Encabezado titulo={O.muerde.titulo} />
          <Lista opciones={O.muerde.opciones} valor={b.muerde} onElegir={(v) => set({ muerde: v })} />
        </>
      )
      break
    case 'alcance':
      contenido = (
        <>
          <Encabezado titulo={O.alcance.titulo} />
          <Lista opciones={O.alcance.opciones} valor={b.alcance} onElegir={(v) => set({ alcance: v })} />
        </>
      )
      break
    case 'tiempo':
      contenido = (
        <>
          <Encabezado titulo={O.tiempo.titulo} />
          <Lista opciones={O.tiempo.opciones} valor={b.tiempo} onElegir={(v) => set({ tiempo: v })} />
        </>
      )
      break
    case 'objetivo':
      contenido = (
        <>
          <Encabezado titulo={O.objetivo.titulo} />
          <Lista opciones={O.objetivo.opciones} valor={b.objetivo} onElegir={(v) => set({ objetivo: v })} />
        </>
      )
      break
    case 'resultado': {
      const perfil = asignarPerfil(b.experiencia!, aciertos)
      const plan = planDeCamino(perfil, mascotas, b.objetivo!)
      const primera = UNIDADES[plan.orden.find((u) => UNIDADES[u].tanda === 1)!]
      contenido = (
        <div className="flex flex-1 flex-col items-center pt-2 text-center">
          <motion.div initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 10 }}>
            <Brote animo="festejo" className="h-40 w-36" />
          </motion.div>
          <p className="text-tinta-suave m-0 text-[14px] font-extrabold tracking-widest uppercase">{O.resultado.listo}</p>
          <h1 className="font-display text-hoja-osc m-0 text-[36px] leading-tight font-semibold">{PERFILES[perfil].nombre}</h1>
          <p className="text-tinta mt-2 text-[17px] leading-snug font-bold">{PERFILES[perfil].bienvenida}</p>
          <div className="mt-5 flex w-full flex-col gap-2 text-left">
            {iniciales.map((e) => (
              <div key={e.tipo}>
                <div className="text-tinta-suave mb-1 text-[12px] font-extrabold tracking-widest uppercase">{e.nombre}</div>
                <ResumenLuz luz={e.luz} compacto />
              </div>
            ))}
            {mascotas.tipo !== 'ninguna' && (
              <div className="bg-terracota-clara flex items-center gap-3 rounded-2xl p-3">
                <PawPrint className="text-terracota-osc shrink-0" aria-hidden />
                <div className="text-tinta text-[15px] font-extrabold">{O.resultado.mascotasActivas}</div>
              </div>
            )}
            <div className="bg-brote flex items-center gap-3 rounded-2xl p-3">
              <span className="font-display bg-hoja grid size-8 shrink-0 place-items-center rounded-full text-white">{primera.numero}</span>
              <div className="text-tinta text-[15px] font-extrabold">
                {O.resultado.arrancaPor}: {primera.titulo}
              </div>
            </div>
          </div>
        </div>
      )
      break
    }
  }

  const conBarra = paso !== 'bienvenida' && paso !== 'cuenta' && paso !== 'resultado'
  // El progreso cuenta solo las pantallas de preguntas
  const totalPreguntas = pasos.length - 3
  const progreso = Math.min(1, Math.max(0, (i - 1) / totalPreguntas))

  return (
    <div className="safe-top safe-bottom relative flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 px-4">
        {conBarra && (
          <>
            <button type="button" onClick={volver} aria-label={O.atras} className="text-tinta-suave -ml-2 grid size-11 place-items-center rounded-full border-0 bg-transparent">
              <ChevronLeft size={28} strokeWidth={2.6} />
            </button>
            <div className="bg-arena-osc h-4 flex-1 overflow-hidden rounded-full" role="progressbar" aria-valuenow={Math.round(progreso * 100)} aria-valuemin={0} aria-valuemax={100}>
              <motion.div className="bg-hoja-clara h-full rounded-full" animate={{ width: `${progreso * 100}%` }} transition={{ type: 'spring', damping: 24 }} />
            </div>
          </>
        )}
      </header>

      <div className="scroll-app relative min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={paso}
            custom={dir}
            variants={{
              entra: (d: number) => ({ x: 60 * d, opacity: 0 }),
              quieta: { x: 0, opacity: 1 },
              sale: (d: number) => ({ x: -60 * d, opacity: 0 }),
            }}
            initial="entra"
            animate="quieta"
            exit="sale"
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex min-h-full flex-col px-5 pb-4"
          >
            {contenido}
          </motion.div>
        </AnimatePresence>
      </div>

      {paso !== 'test' && paso !== 'otro' && paso !== 'cuenta' && (
        <footer className="shrink-0 px-5 pt-2 pb-5">
          <Boton
            disabled={!puedeSeguir}
            variante={paso === 'resultado' ? 'sol' : 'primario'}
            onClick={paso === 'resultado' ? terminar : avanzar}
          >
            {paso === 'bienvenida' ? O.bienvenida.boton : paso === 'resultado' ? O.resultado.boton : O.continuar}
          </Boton>
          {paso === 'bienvenida' && (
            <Boton variante="fantasma" className="mt-2" onClick={() => setRecuperando(true)}>
              {TR.entrada}
            </Boton>
          )}
        </footer>
      )}
      <Recuperar abierto={recuperando} onCerrar={() => setRecuperando(false)} />
    </div>
  )
}

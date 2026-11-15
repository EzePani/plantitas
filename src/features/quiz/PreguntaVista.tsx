import { motion } from 'framer-motion'
import { useMemo, useState, type CSSProperties } from 'react'
import { Ilustracion } from '../../components/Ilustracion'
import type { Pregunta } from '../../data/lessons'
import { T } from '../../data/textos'
import { vibrar } from '../../lib/haptics'
import { FotoPlanta } from '../../components/FotoPlanta'
import { plantaPorId } from '../../data/plantas'

type Marca = 'neutra' | 'bien' | 'mal' | 'apagada' | 'elegida'

const CLASES: Record<Marca, { clase: string; relieve: string }> = {
  neutra: { clase: 'border-arena-osc bg-white text-tinta', relieve: 'var(--color-arena-osc)' },
  elegida: { clase: 'border-agua bg-agua-clara text-tinta', relieve: 'var(--color-agua)' },
  bien: { clase: 'border-hoja bg-brote text-hoja-osc', relieve: 'var(--color-hoja)' },
  mal: { clase: 'border-alerta bg-alerta-clara text-alerta', relieve: 'var(--color-alerta)' },
  apagada: { clase: 'border-arena bg-white text-tinta-suave opacity-60', relieve: 'var(--color-arena)' },
}

function Opcion({ texto, marca, onClick, bloqueada, centrada, alta }: { texto: string; marca: Marca; onClick: () => void; bloqueada: boolean; centrada?: boolean; alta?: boolean }) {
  const c = CLASES[marca]
  return (
    <motion.button
      type="button"
      disabled={bloqueada}
      onClick={onClick}
      animate={marca === 'mal' ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      style={{ '--relieve': c.relieve } as CSSProperties}
      className={`relieve ${alta ? 'h-[68px] text-[16px]' : 'min-h-14 text-[17px]'} w-full rounded-2xl border-2 px-3 py-2 leading-tight font-extrabold ${centrada ? 'text-center' : 'text-left'} ${c.clase}`}
    >
      {texto}
    </motion.button>
  )
}

/** Mezcla estable (no cambia entre renders) para la columna derecha de "unir" */
function mezclar<T>(lista: T[], semilla: number): T[] {
  const out = [...lista]
  let s = semilla || 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  // Que nunca quede en el mismo orden que la columna izquierda
  if (out.every((v, i) => v === lista[i])) out.push(out.shift()!)
  return out
}

interface Props {
  pregunta: Pregunta
  /** Se llama una sola vez, cuando la pregunta queda respondida */
  onResponder: (correcta: boolean) => void
}

export function PreguntaVista({ pregunta, onResponder }: Props) {
  const [elegida, setElegida] = useState<number | null>(null)
  const respondida = elegida !== null

  const responder = (indice: number, correcta: boolean) => {
    if (respondida) return
    setElegida(indice)
    vibrar(correcta ? 'acierto' : 'error')
    onResponder(correcta)
  }

  const titulo = <h2 className="text-tinta m-0 text-[22px] leading-snug font-extrabold">{pregunta.pregunta}</h2>

  if (pregunta.tipo === 'unir') return <Unir pregunta={pregunta} onResponder={onResponder} titulo={titulo} />

  if (pregunta.tipo === 'verdadero_falso') {
    const opciones = [true, false]
    return (
      <div className="flex flex-col gap-5">
        {titulo}
        <div className="grid grid-cols-2 gap-3">
          {opciones.map((v, i) => {
            const marca: Marca = !respondida ? 'neutra' : v === pregunta.correcta ? 'bien' : elegida === i ? 'mal' : 'apagada'
            return <Opcion key={String(v)} centrada texto={v ? T.leccion.verdadero : T.leccion.falso} marca={marca} bloqueada={respondida} onClick={() => responder(i, v === pregunta.correcta)} />
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {titulo}
      {pregunta.tipo === 'que_le_pasa' && <ImagenPregunta nombre={pregunta.imagen} />}
      <div className="flex flex-col gap-3">
        {pregunta.opciones.map((o, i) => {
          const marca: Marca = !respondida ? 'neutra' : i === pregunta.correcta ? 'bien' : elegida === i ? 'mal' : 'apagada'
          return <Opcion key={o} texto={o} marca={marca} bloqueada={respondida} onClick={() => responder(i, i === pregunta.correcta)} />
        })}
      </div>
    </div>
  )
}

/** "planta:<id>" muestra la foto y el nombre de una planta del catálogo; el resto son ilustraciones */
function ImagenPregunta({ nombre }: { nombre: string }) {
  const planta = nombre.startsWith('planta:') ? plantaPorId(nombre.slice(7)) : undefined
  if (!planta) return <Ilustracion nombre={nombre} className="mx-auto w-4/5 rounded-3xl" />
  return (
    <figure className="m-0 mx-auto w-4/5">
      <FotoPlanta planta={planta} className="aspect-[4/3] w-full rounded-3xl" />
      <figcaption className="font-display text-tinta mt-2 text-center text-[20px] font-semibold">{planta.nombre_comun}</figcaption>
    </figure>
  )
}

function Unir({ pregunta, onResponder, titulo }: { pregunta: Extract<Pregunta, { tipo: 'unir' }>; onResponder: (ok: boolean) => void; titulo: React.ReactNode }) {
  const derecha = useMemo(() => mezclar(pregunta.pares.map((p, i) => ({ texto: p.b, par: i })), pregunta.pregunta.length), [pregunta])
  const [izq, setIzq] = useState<number | null>(null)
  const [unidos, setUnidos] = useState<number[]>([])
  const [fallo, setFallo] = useState<{ a: number; b: number } | null>(null)
  const [errores, setErrores] = useState(0)

  const tocarDerecha = (par: number) => {
    if (izq === null || unidos.includes(par)) return
    if (par === izq) {
      const nuevos = [...unidos, par]
      setUnidos(nuevos)
      setIzq(null)
      setFallo(null)
      vibrar('acierto')
      if (nuevos.length === pregunta.pares.length) onResponder(errores === 0)
    } else {
      setFallo({ a: izq, b: par })
      setErrores(errores + 1)
      setIzq(null)
      vibrar('error')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {titulo}
      <p className="text-tinta-suave m-0 text-[15px] font-bold">{T.leccion.unirAyuda}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {pregunta.pares.map((p, i) => {
            const marca: Marca = unidos.includes(i) ? 'bien' : fallo?.a === i ? 'mal' : izq === i ? 'elegida' : 'neutra'
            return (
              <Opcion
                key={p.a}
                centrada
                alta
                texto={p.a}
                marca={marca}
                bloqueada={unidos.includes(i)}
                onClick={() => {
                  vibrar('toque')
                  setFallo(null)
                  setIzq(i)
                }}
              />
            )
          })}
        </div>
        <div className="flex flex-col gap-3">
          {derecha.map((d) => {
            const marca: Marca = unidos.includes(d.par) ? 'bien' : fallo?.b === d.par ? 'mal' : 'neutra'
            return <Opcion key={d.texto} centrada alta texto={d.texto} marca={marca} bloqueada={unidos.includes(d.par)} onClick={() => tocarDerecha(d.par)} />
          })}
        </div>
      </div>
    </div>
  )
}

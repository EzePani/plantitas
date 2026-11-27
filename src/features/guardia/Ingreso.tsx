import { ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'
import { Boton } from '../../components/Boton'
import { FotoPlanta } from '../../components/FotoPlanta'
import { Panel } from '../../components/Panel'
import { PLANTAS, plantaPorId, type Planta } from '../../data/plantas'
import { TG } from '../../data/textosGuardia'
import { buscarPlantas } from '../../lib/buscar'
import { agruparPlantas } from '../../lib/espacios'
import { contextoDe, diagnosticar } from '../../lib/guardia'
import { lugarDe, plantasEn } from '../../lib/plano'
import { CAMBIOS, SINTOMAS, TIERRAS, type Cambio, type Caso, type Espacio, type RespuestasGuardia, type Sintoma, type Tierra } from '../../lib/tipos'
import { useStore } from '../../store/useStore'
import { nombreDeLugar } from '../spaces/Plano'
import { Causas } from './Causas'
import { Notas, Opciones, alTope, ayuda, fila, titulo } from './comunes'

/** La planta sobre la que se está preguntando */
export type Sujeto = Pick<Caso, 'plantaId' | 'nombre' | 'donde' | 'espacioId' | 'lugar'>
type Paso = 'elegir' | 'sintomas' | 'cambios' | 'resultado'
/** Con `caso` es una revisión porque empeoró; sin él, un ingreso nuevo */
export interface Consulta {
  caso?: Caso
  tierra?: Tierra
}

/** Las plantas anotadas en un espacio, una vez por tipo y lugar */
function anotadas(e: Espacio): Sujeto[] {
  const lugares = [...new Set(e.plantas.map((p) => lugarDe(e, p)))]
  return lugares.flatMap((lugar) =>
    agruparPlantas(plantasEn(e, lugar)).flatMap((g) => {
      const p = plantaPorId(g.plantaId)
      if (!p) return []
      const donde = lugar && e.plano ? `${nombreDeLugar(e.plano, lugar)} · ${e.nombre}` : e.nombre
      return [{ plantaId: p.id, nombre: p.nombre_comun, donde: donde.slice(0, 120), espacioId: e.id, ...(lugar && { lugar }) }]
    }),
  )
}

function FilaPlanta({ planta, detalle, onClick }: { planta: Planta; detalle?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={fila}>
      <FotoPlanta planta={planta} className="size-11 shrink-0 rounded-2xl" />
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] leading-tight font-extrabold">{planta.nombre_comun}</span>
        {detalle && <span className="text-tinta-suave block text-[13px] leading-tight font-bold">{detalle}</span>}
      </span>
      <ChevronRight size={20} className="text-tinta-suave shrink-0" aria-hidden />
    </button>
  )
}

function Elegir({ onElegir, onCaso }: { onElegir: (s: Sujeto) => void; onCaso: (id: string) => void }) {
  const espacios = useStore((s) => s.espacios)
  const casos = useStore((s) => s.casos)
  const grupos = espacios.map((e) => ({ e, plantas: anotadas(e) })).filter((g) => g.plantas.length > 0)
  const [catalogo, setCatalogo] = useState(grupos.length === 0)
  const [q, setQ] = useState('')
  const lista = q.trim() ? buscarPlantas(PLANTAS, q) : [...PLANTAS].sort((a, b) => a.nombre_comun.localeCompare(b.nombre_comun, 'es'))
  const enCurso = (s: Sujeto) => casos.find((c) => !c.cierre && c.plantaId === s.plantaId && c.espacioId === s.espacioId && c.lugar === s.lugar)

  if (!catalogo) {
    return (
      <>
        {grupos.map(({ e, plantas }) => (
          <section key={e.id} className="flex flex-col gap-2">
            <h2 className={titulo}>{e.nombre}</h2>
            {plantas.map((s) => {
              const caso = enCurso(s)
              const lugar = s.donde === e.nombre ? '' : s.donde.slice(0, -e.nombre.length - 3)
              return (
                <FilaPlanta
                  key={`${s.plantaId}-${s.lugar ?? ''}`}
                  planta={plantaPorId(s.plantaId)!}
                  detalle={[lugar, caso && TG.yaIngresada].filter(Boolean).join(' · ')}
                  onClick={() => (caso ? onCaso(caso.id) : onElegir(s))}
                />
              )
            })}
          </section>
        ))}
        <Boton variante="secundario" onClick={() => setCatalogo(true)}>
          {TG.sinAnotar}
        </Boton>
      </>
    )
  }
  return (
    <>
      <label className="border-arena-osc focus-within:border-hoja flex min-h-12 items-center gap-2 rounded-full border-2 bg-white px-4">
        <Search size={18} className="text-tinta-suave shrink-0" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={40}
          placeholder={TG.buscar}
          aria-label={TG.catalogo}
          autoComplete="off"
          className="text-tinta min-w-0 flex-1 border-0 bg-transparent text-[16px] font-bold outline-none"
          style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
        />
      </label>
      {lista.length === 0 && <p className={ayuda}>{TG.sinResultados}</p>}
      <div className="flex flex-col gap-2">
        {lista.map((p) => (
          <FilaPlanta key={p.id} planta={p} onClick={() => onElegir({ plantaId: p.id, nombre: p.nombre_comun, donde: '' })} />
        ))}
      </div>
    </>
  )
}

/**
 * Elegir la planta → síntomas → cambios → causas posibles. Nada se guarda hasta confirmar el final.
 * Para revisar un caso se empieza directo en los síntomas.
 */
export function Ingreso({ consulta, hoy, onCerrar, onCaso, onGuia }: { consulta: Consulta | null; hoy: string; onCerrar: () => void; onCaso: (id: string) => void; onGuia: (entrada: string) => void }) {
  const espacios = useStore((s) => s.espacios)
  const ingresar = useStore((s) => s.ingresarCaso)
  const revisar = useStore((s) => s.revisarSintomas)
  const [de, setDe] = useState<Consulta | null>(null)
  const [paso, setPaso] = useState<Paso>('elegir')
  const [sujeto, setSujeto] = useState<Sujeto | null>(null)
  const [sintomas, setSintomas] = useState<Sintoma[]>([])
  const [tierra, setTierra] = useState<Tierra | null>(null)
  const [cambios, setCambios] = useState<Cambio[]>([])
  const [notas, setNotas] = useState('')
  // Cada consulta arranca en blanco
  if (consulta && consulta !== de) {
    setDe(consulta)
    setPaso(consulta.caso ? 'sintomas' : 'elegir')
    setSujeto(consulta.caso ?? null)
    setSintomas([])
    setTierra(consulta.tierra ?? null)
    setCambios([])
    setNotas('')
  }

  const respuestas: RespuestasGuardia | null = tierra ? { sintomas, tierra, cambios, notas } : null
  const planta = sujeto ? plantaPorId(sujeto.plantaId) : undefined
  const espacio = espacios.find((e) => e.id === sujeto?.espacioId)
  const causas = paso === 'resultado' && respuestas ? diagnosticar(respuestas, planta && contextoDe(planta, hoy, espacio, sujeto?.lugar)) : []

  const alternar = <T,>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v])
  // "Nada" no convive con otros cambios
  const elegirCambio = (v: Cambio) => setCambios((l) => (v === 'nada' ? (l.includes('nada') ? [] : ['nada']) : alternar(l.filter((x) => x !== 'nada'), v)))
  const atras = () => {
    if (paso === 'resultado') return setPaso('cambios')
    if (paso === 'cambios') return setPaso('sintomas')
    if (paso === 'sintomas' && !de?.caso) return setPaso('elegir')
    onCerrar()
  }
  const confirmar = () => {
    if (!respuestas || !sujeto) return
    if (de?.caso) {
      revisar(de.caso.id, respuestas, causas)
      return onCaso(de.caso.id)
    }
    const { plantaId, nombre, donde, espacioId, lugar } = sujeto
    const id = ingresar({ plantaId, nombre, donde, ...(espacioId && { espacioId }), ...(lugar && { lugar }), ...respuestas, causas })
    if (id) onCaso(id)
  }

  const pie =
    paso === 'sintomas' ? (
      <Boton disabled={sintomas.length === 0 || !tierra} onClick={() => setPaso('cambios')}>
        {TG.siguiente}
      </Boton>
    ) : paso === 'cambios' ? (
      <Boton onClick={() => setPaso('resultado')}>{TG.verCausas}</Boton>
    ) : paso === 'resultado' ? (
      <Boton variante="sol" onClick={confirmar}>
        {de?.caso ? TG.actualizar : TG.empezar}
      </Boton>
    ) : undefined
  const encabezado = { elegir: TG.elegir, sintomas: TG.sintomasTitulo, cambios: TG.cambiosTitulo, resultado: TG.causasTitulo }[paso]

  return (
    <Panel abierto={consulta !== null} titulo={paso === 'sintomas' || paso === 'cambios' ? sujeto?.nombre : encabezado} onCerrar={atras} pie={pie}>
      <div key={paso} ref={alTope} className="flex flex-col gap-3 px-5 pt-1 pb-6">
        {paso === 'elegir' && (
          <Elegir
            onCaso={onCaso}
            onElegir={(s) => {
              setSujeto(s)
              setPaso('sintomas')
            }}
          />
        )}
        {paso === 'sintomas' && (
          <>
            <div>
              <p className="text-tinta-suave m-0 text-[13px] font-extrabold">{TG.paso(1)}</p>
              <h2 className={titulo}>{TG.sintomasTitulo}</h2>
              <p className={ayuda}>{TG.sintomasAyuda}</p>
            </div>
            <Opciones valores={SINTOMAS} textos={TG.sintoma} elegidas={sintomas} onElegir={(v) => setSintomas((l) => alternar(l, v))} />
            <div className="mt-1">
              <h2 className={titulo}>{TG.tierraTitulo}</h2>
              <p className={ayuda}>{TG.tierraAyuda}</p>
            </div>
            <Opciones valores={TIERRAS} textos={TG.tierra} elegidas={tierra ? [tierra] : []} columnas={3} onElegir={setTierra} />
          </>
        )}
        {paso === 'cambios' && (
          <>
            <div>
              <p className="text-tinta-suave m-0 text-[13px] font-extrabold">{TG.paso(2)}</p>
              <h2 className={titulo}>{TG.cambiosTitulo}</h2>
              <p className={ayuda}>{TG.cambiosAyuda}</p>
            </div>
            <Opciones valores={CAMBIOS} textos={TG.cambio} elegidas={cambios} onElegir={elegirCambio} />
            <Notas valor={notas} onCambio={setNotas} />
          </>
        )}
        {paso === 'resultado' && <Causas causas={causas} onGuia={onGuia} />}
      </div>
    </Panel>
  )
}

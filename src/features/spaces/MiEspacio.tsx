import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Minus, Pencil, Plus, Search, ShieldCheck, Trash2, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Boton } from '../../components/Boton'
import { Dialogo } from '../../components/Dialogo'
import { FotoPlanta } from '../../components/FotoPlanta'
import { Icono } from '../../components/Icono'
import { Ilustracion } from '../../components/Ilustracion'
import { OpcionGrande } from '../../components/OpcionGrande'
import { Panel } from '../../components/Panel'
import { ONBOARDING as O } from '../../data/onboarding'
import { PLANTAS, plantaPorId, type Planta } from '../../data/plantas'
import { T } from '../../data/textos'
import { TC } from '../../data/textosCatalogo'
import { buscarPlantas } from '../../lib/buscar'
import { MAX_PLANTAS_ESPACIO, agruparPlantas } from '../../lib/espacios'
import { hoyLocal } from '../../lib/fecha'
import { vibrar } from '../../lib/haptics'
import { recomendar, type Motivo, type Recomendada } from '../../lib/recomendador'
import type { Espacio } from '../../lib/tipos'
import { ESFUERZO_POR_TIEMPO, useStore } from '../../store/useStore'
import { FichaPlanta } from '../pets/FichaPlanta'
import { TarjetaPlanta } from '../pets/Plantas'
import { PasoHoras, PasoObstaculos, PasoTipoLuz, ResumenLuz, lineaDeLuz, pasosDeLuz } from './EditorLuz'

const E = TC.espacio
type Borrador = Partial<Espacio>
type PasoForm = 'tipo' | 'luz-tipo' | 'luz-horas' | 'luz-obstaculos' | 'tamano' | 'mascotas' | 'esfuerzo'
/** Los 5 pasos del formulario; la luz (paso 2) se despliega en hasta 3 pantallas */
const BLOQUES: Record<PasoForm, number> = { tipo: 0, 'luz-tipo': 1, 'luz-horas': 1, 'luz-obstaculos': 1, tamano: 2, mascotas: 3, esfuerzo: 4 }

function pasosDelForm(b: Borrador): PasoForm[] {
  return ['tipo', ...pasosDeLuz(b.luz).map((p): PasoForm => `luz-${p}`), 'tamano', 'mascotas', 'esfuerzo']
}

/** Orden en que se nombran los motivos en la frase de "por qué sí" */
const PRIORIDAD: Motivo[] = ['segura_mascotas', 'luz_ideal', 'luz_tolera', 'luz_filtrada', 'aguanta_sol', 'ama_humedad', 'aguanta_descuido', 'facil', 'tamano_justo', 'desafio']

export function frasePorQue(r: Recomendada): string {
  const partes = PRIORIDAD.filter((m) => r.motivos.includes(m))
    .slice(0, 3)
    .map((m) => E.motivos[m])
  const frase = partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : partes[0]
  return `${frase.charAt(0).toUpperCase()}${frase.slice(1)}.`
}

const ALFABETICO = [...PLANTAS].sort((a, b) => a.nombre_comun.localeCompare(b.nombre_comun, 'es'))
const redondo = 'grid size-11 shrink-0 place-items-center rounded-full border-2'

/** Las plantas que ya viven en el espacio: se ven, se abren, se suman y se quitan. Siempre del catálogo. */
function PlantasDelEspacio({ espacio, onVerPlanta, onAgregar }: { espacio: Espacio; onVerPlanta: (p: Planta) => void; onAgregar: () => void }) {
  const sumar = useStore((s) => s.agregarPlantaAEspacio)
  const quitar = useStore((s) => s.quitarPlantaDeEspacio)
  const L = E.plantas
  const grupos = agruparPlantas(espacio.plantas).flatMap((g) => {
    const planta = plantaPorId(g.plantaId)
    return planta ? [{ planta, cantidad: g.cantidad }] : []
  })
  const lleno = espacio.plantas.length >= MAX_PLANTAS_ESPACIO
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-tinta m-0 text-[22px] font-semibold">{L.titulo}</h2>
        {espacio.plantas.length > 0 && <span className="text-tinta-suave text-[14px] font-extrabold">{L.cuenta(espacio.plantas.length)}</span>}
      </div>
      {grupos.length === 0 && <p className="text-tinta-suave m-0 text-[15px] leading-snug font-bold">{L.vacio}</p>}
      {grupos.map(({ planta, cantidad }) => (
        <div key={planta.id} className="border-arena-osc flex items-center gap-1.5 rounded-3xl border-2 bg-white p-2 pr-2.5 shadow-[0_3px_0_var(--color-arena-osc)]">
          <button type="button" onClick={() => onVerPlanta(planta)} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 border-0 bg-transparent p-0 text-left active:opacity-70">
            <FotoPlanta planta={planta} className="size-12 shrink-0 rounded-2xl" />
            <span className="font-display text-tinta min-w-0 text-[17px] leading-tight font-semibold">{planta.nombre_comun}</span>
          </button>
          <button
            type="button"
            aria-label={L.quitar(planta.nombre_comun)}
            onClick={() => {
              vibrar('toque')
              quitar(espacio.id, planta.id)
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
              sumar(espacio.id, planta.id)
            }}
            className={`${redondo} border-hoja bg-hoja text-white disabled:opacity-45`}
          >
            <Plus size={18} strokeWidth={3} aria-hidden />
          </button>
        </div>
      ))}
      <button type="button" disabled={lleno} onClick={onAgregar} className="border-hoja text-hoja-osc flex min-h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-dashed bg-transparent text-[16px] font-extrabold disabled:opacity-45">
        <Plus size={19} strokeWidth={3} aria-hidden />
        {L.agregar}
      </button>
      {lleno && <p className="text-tinta-suave m-0 text-[13px] font-bold">{L.limite}</p>}
    </section>
  )
}

/** Catálogo para sumar plantas al espacio: se toca y listo, sin nombres ni formularios */
function ElegirPlantas({ espacio }: { espacio: Espacio }) {
  const sumar = useStore((s) => s.agregarPlantaAEspacio)
  const [q, setQ] = useState('')
  const L = E.plantas
  const lista = q.trim() ? buscarPlantas(PLANTAS, q) : ALFABETICO
  const cuantas = new Map(agruparPlantas(espacio.plantas).map((g) => [g.plantaId, g.cantidad]))
  const lleno = espacio.plantas.length >= MAX_PLANTAS_ESPACIO
  return (
    <div className="px-5 pb-6">
      <p className="text-tinta mt-0 mb-3 text-[14px] leading-snug font-bold">{lleno ? L.limite : L.ayuda}</p>
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
        {lista.map((p) => {
          const n = cuantas.get(p.id) ?? 0
          return (
            <button
              key={p.id}
              type="button"
              disabled={lleno}
              aria-label={L.sumar(p.nombre_comun)}
              onClick={() => {
                vibrar('toque')
                sumar(espacio.id, p.id)
              }}
              className={`flex min-h-14 w-full items-center gap-3 rounded-3xl border-2 p-2 pr-2.5 text-left active:opacity-70 disabled:opacity-45 ${n ? 'border-hoja bg-brote' : 'border-arena-osc bg-white'}`}
            >
              <FotoPlanta planta={p} className="size-11 shrink-0 rounded-2xl" />
              <span className="min-w-0 flex-1">
                <span className="text-tinta block text-[16px] leading-tight font-extrabold">{p.nombre_comun}</span>
                {n > 0 && <span className="text-hoja-osc block text-[13px] font-extrabold">{L.tenes(n)}</span>}
              </span>
              <span className={`${redondo} size-9 ${n ? 'border-hoja bg-hoja text-white' : 'border-arena-osc text-tinta bg-white'}`}>
                <Plus size={17} strokeWidth={3} aria-hidden />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Resultado({ espacio, onVerPlanta, onAgregar }: { espacio: Espacio; onVerPlanta: (p: Planta) => void; onAgregar: () => void }) {
  // Las recomendaciones dependen del lugar, no de las plantas anotadas: no se recalculan al sumar o quitar
  const r = useMemo(() => recomendar(PLANTAS, espacio), [espacio.tipo, espacio.luz, espacio.tamano, espacio.mascotas, espacio.esfuerzo])
  const R = E.resultado
  return (
    <div className="flex flex-col gap-3 px-5 pb-6">
      <PlantasDelEspacio espacio={espacio} onVerPlanta={onVerPlanta} onAgregar={onAgregar} />
      <span className="h-1" />
      <ResumenLuz luz={espacio.luz} />
      {espacio.mascotas !== 'ninguna' && (
        <div className="bg-brote flex items-center gap-3 rounded-2xl p-3">
          <ShieldCheck className="text-hoja-osc shrink-0" aria-hidden />
          <div className="text-tinta text-[14px] font-extrabold">{R.filtroMascotas[espacio.mascotas]}</div>
        </div>
      )}

      <h2 className="font-display text-tinta mt-2 mb-0 text-[22px] font-semibold">{R.recomendadas}</h2>
      {r.recomendadas.length === 0 ? (
        <p className="text-tinta-suave m-0 text-[15px] leading-snug font-bold">{r.luz.avisoCalor ? R.sinResultadosCalor : R.sinResultados}</p>
      ) : (
        r.recomendadas.map((x, i) => (
          <motion.div key={x.planta.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
            <TarjetaPlanta planta={x.planta} detalle={frasePorQue(x)} onClick={() => onVerPlanta(x.planta)} />
          </motion.div>
        ))
      )}

      {r.evitar.length > 0 && (
        <>
          <h2 className="font-display text-tinta mt-3 mb-0 text-[22px] font-semibold">{R.evitar}</h2>
          {r.evitar.map((x) => {
            const m = E.motivosEvitar[x.motivo]
            return (
              <button key={x.planta.id} type="button" onClick={() => onVerPlanta(x.planta)} className="border-alerta bg-alerta-clara flex w-full items-center gap-3 rounded-3xl border-2 p-3 text-left">
                <span className="bg-alerta grid size-10 shrink-0 place-items-center rounded-full text-white">
                  <TriangleAlert size={20} aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="font-display text-tinta block text-[17px] font-semibold">{x.planta.nombre_comun}</span>
                  <span className="text-tinta block text-[14px] leading-snug font-bold">{typeof m === 'string' ? m : m[espacio.mascotas]}</span>
                </span>
                <ChevronRight size={20} className="text-alerta shrink-0" aria-hidden />
              </button>
            )
          })}
        </>
      )}
      <p className="text-tinta-suave mt-2 mb-0 text-[13px] leading-snug font-bold">{TC.plantas.ficha.disclaimer}</p>
    </div>
  )
}

export function MiEspacio() {
  const espacios = useStore((s) => s.espacios)
  const mascotasPerfil = useStore((s) => s.mascotas.tipo)
  const tiempo = useStore((s) => s.respuestas?.tiempo)
  const guardar = useStore((s) => s.guardarEspacio)
  const borrar = useStore((s) => s.borrarEspacio)

  const [b, setB] = useState<Borrador | null>(null)
  const [paso, setPaso] = useState<PasoForm>('tipo')
  const [abiertoId, setAbiertoId] = useState<string | null>(null)
  const [planta, setPlanta] = useState<Planta | null>(null)
  const [aBorrar, setABorrar] = useState<Espacio | null>(null)
  const [eligiendo, setEligiendo] = useState(false)

  const abierto = espacios.find((e) => e.id === abiertoId) ?? null
  const editando = Boolean(b?.id)
  const set = (c: Borrador) => setB((p) => ({ ...p, ...c }))

  const nuevo = () => {
    // Mascotas y dedicación se precargan del perfil; se pueden cambiar para este lugar
    setB({ mascotas: mascotasPerfil, esfuerzo: tiempo ? ESFUERZO_POR_TIEMPO[tiempo] : undefined })
    setPaso('tipo')
  }
  const editar = (e: Espacio) => {
    setB({ ...e })
    setPaso('luz-tipo')
  }

  const pasos = b ? pasosDelForm(b) : []
  const i = pasos.indexOf(paso)
  const completo: Record<PasoForm, boolean> = {
    tipo: Boolean(b?.tipo),
    'luz-tipo': Boolean(b?.luz),
    'luz-horas': true,
    'luz-obstaculos': true,
    tamano: Boolean(b?.tamano),
    mascotas: Boolean(b?.mascotas),
    esfuerzo: Boolean(b?.esfuerzo),
  }
  const ultimo = i === pasos.length - 1

  const siguiente = () => {
    if (!b) return
    if (!ultimo) return setPaso(pasos[i + 1])
    const repetidos = espacios.filter((e) => e.tipo === b.tipo && e.id !== b.id).length
    const espacio: Espacio = {
      id: b.id ?? `${b.tipo}-${Date.now().toString(36)}`,
      // Al editar se conserva el nombre, salvo que haya cambiado el tipo de lugar
      nombre: b.id && b.nombre && espacios.find((e) => e.id === b.id)?.tipo === b.tipo ? b.nombre : repetidos ? `${E.nombres[b.tipo!]} ${repetidos + 1}` : E.nombres[b.tipo!],
      creado: b.creado ?? hoyLocal(),
      tipo: b.tipo!,
      luz: b.luz!,
      tamano: b.tamano!,
      mascotas: b.mascotas!,
      esfuerzo: b.esfuerzo!,
      plantas: b.plantas ?? [],
    }
    guardar(espacio)
    setB(null)
    setAbiertoId(espacio.id)
  }
  const atras = () => (i <= 0 ? setB(null) : setPaso(pasos[i - 1]))

  const titulo: Record<PasoForm, string> = {
    tipo: E.pasos.tipo.titulo,
    'luz-tipo': TC.luz.tipo.titulo(b?.tipo ? E.enTu[b.tipo] : ''),
    'luz-horas': TC.luz.horas.titulo,
    'luz-obstaculos': TC.luz.obstaculos.titulo,
    tamano: E.pasos.tamano.titulo,
    mascotas: E.pasos.mascotas.titulo,
    esfuerzo: E.pasos.esfuerzo.titulo,
  }

  return (
    <div className="safe-top relative flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 px-5 pt-4 pb-2">
        <h1 className="font-display text-hoja-osc m-0 text-[30px] font-semibold">{E.titulo}</h1>
      </header>

      <div className="scroll-app min-h-0 flex-1 px-5 pb-6">
        {espacios.length === 0 ? (
          <div className="flex flex-col items-center pt-4 text-center">
            <Ilustracion nombre="luz-indirecta" className="w-4/5 rounded-3xl" />
            <h2 className="font-display text-tinta mt-5 mb-0 text-[22px] font-semibold">{E.vacioTitulo}</h2>
            <p className="text-tinta-suave mt-2 mb-5 text-[15px] leading-snug font-bold">{E.vacioTexto}</p>
          </div>
        ) : (
          <>
            <p className="text-tinta-suave mt-0 mb-3 text-[14px] leading-snug font-bold">{E.intro}</p>
            <div className="mb-5 flex flex-col gap-2.5">
              {espacios.map((e) => (
                <div key={e.id} className="border-arena-osc flex items-center rounded-3xl border-2 bg-white shadow-[0_3px_0_var(--color-arena-osc)]">
                  <button type="button" onClick={() => setAbiertoId(e.id)} className="flex min-h-16 min-w-0 flex-1 items-center gap-3 border-0 bg-transparent p-3 text-left">
                    <span className="bg-brote text-hoja-osc grid size-11 shrink-0 place-items-center rounded-2xl">
                      <Icono nombre={E.pasos.tipo.opciones.find((o) => o.valor === e.tipo)?.icono ?? 'casa'} />
                    </span>
                    <span className="min-w-0">
                      <span className="font-display text-tinta block text-[18px] font-semibold">{e.nombre}</span>
                      <span className={`block text-[14px] leading-tight font-extrabold ${e.plantas.length ? 'text-hoja-osc' : 'text-tinta-suave'}`}>{E.plantas.cuenta(e.plantas.length)}</span>
                      <span className="text-tinta-suave mt-0.5 block text-[13px] leading-tight font-bold">{lineaDeLuz(e.luz)}</span>
                    </span>
                  </button>
                  <button type="button" aria-label={`${E.editar}: ${e.nombre}`} onClick={() => editar(e)} className="text-tinta-suave grid size-11 place-items-center border-0 bg-transparent">
                    <Pencil size={19} aria-hidden />
                  </button>
                  <button type="button" aria-label={`${E.borrar} ${e.nombre}`} onClick={() => setABorrar(e)} className="text-tinta-suave mr-1 grid size-11 place-items-center border-0 bg-transparent">
                    <Trash2 size={19} aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        <Boton onClick={nuevo}>
          <span className="flex items-center justify-center gap-2">
            <Plus size={20} strokeWidth={3} aria-hidden />
            {E.nuevo}
          </span>
        </Boton>
      </div>

      {/* Recomendaciones de un espacio */}
      <Panel
        abierto={abierto !== null}
        titulo={abierto?.nombre}
        onCerrar={() => setAbiertoId(null)}
        pie={
          abierto && (
            <Boton variante="secundario" onClick={() => editar(abierto)}>
              <span className="flex items-center justify-center gap-2">
                <Pencil size={18} aria-hidden />
                {E.editar}
              </span>
            </Boton>
          )
        }
      >
        {abierto && <Resultado espacio={abierto} onVerPlanta={setPlanta} onAgregar={() => setEligiendo(true)} />}
      </Panel>

      {/* Catálogo para sumar plantas al espacio abierto */}
      <Panel abierto={eligiendo && abierto !== null} titulo={abierto ? E.plantas.panel(abierto.nombre) : undefined} onCerrar={() => setEligiendo(false)} pie={<Boton onClick={() => setEligiendo(false)}>{E.plantas.listo}</Boton>}>
        {abierto && <ElegirPlantas espacio={abierto} />}
      </Panel>

      {/* Formulario: tipo → luz → tamaño → mascotas → dedicación */}
      <Panel
        abierto={b !== null}
        onCerrar={atras}
        pie={
          <Boton disabled={!completo[paso]} variante={ultimo ? 'sol' : 'primario'} onClick={siguiente}>
            {ultimo ? (editando ? E.guardarCambios : E.verResultado) : T.comun.continuar}
          </Boton>
        }
      >
        {b && (
          <div className="px-5 pb-4">
            <div className="mb-5 flex gap-1.5" role="progressbar" aria-valuenow={BLOQUES[paso] + 1} aria-valuemin={1} aria-valuemax={5}>
              {[0, 1, 2, 3, 4].map((n) => (
                <span key={n} className={`h-2.5 flex-1 rounded-full ${n <= BLOQUES[paso] ? 'bg-hoja-clara' : 'bg-arena-osc'}`} />
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={paso} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}>
                <h2 className="font-display text-tinta mt-0 mb-4 text-[26px] leading-tight font-semibold">{titulo[paso]}</h2>
                {paso === 'tipo' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {E.pasos.tipo.opciones.map((o) => (
                      <OpcionGrande key={o.valor} compacta icono={o.icono} texto={o.texto} elegida={b.tipo === o.valor} onClick={() => set({ tipo: o.valor })} />
                    ))}
                  </div>
                )}
                {paso === 'luz-tipo' && <PasoTipoLuz luz={b.luz} onCambio={(luz) => set({ luz })} />}
                {paso === 'luz-horas' && b.luz && <PasoHoras luz={b.luz} onCambio={(luz) => set({ luz })} />}
                {paso === 'luz-obstaculos' && b.luz && <PasoObstaculos luz={b.luz} onCambio={(luz) => set({ luz })} />}
                {paso === 'tamano' && (
                  <div className="flex flex-col gap-3">
                    {E.pasos.tamano.opciones.map((o) => (
                      <OpcionGrande key={o.valor} icono={o.icono} texto={o.texto} elegida={b.tamano === o.valor} onClick={() => set({ tamano: o.valor })} />
                    ))}
                  </div>
                )}
                {paso === 'mascotas' && (
                  <>
                    <div className="grid grid-cols-2 gap-2.5">
                      {O.mascotas.opciones.map((o) => (
                        <OpcionGrande key={o.valor} compacta icono={o.icono} texto={o.texto} elegida={b.mascotas === o.valor} onClick={() => set({ mascotas: o.valor })} />
                      ))}
                    </div>
                    <p className="text-tinta-suave mt-4 mb-0 text-[14px] leading-snug font-bold">{E.pasos.mascotas.nota}</p>
                  </>
                )}
                {paso === 'esfuerzo' && (
                  <div className="flex flex-col gap-3">
                    {E.pasos.esfuerzo.opciones.map((o) => (
                      <OpcionGrande key={o.valor} icono={o.icono} texto={o.texto} elegida={b.esfuerzo === o.valor} onClick={() => set({ esfuerzo: o.valor })} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </Panel>

      <Panel abierto={planta !== null} onCerrar={() => setPlanta(null)}>
        {planta && <FichaPlanta planta={planta} />}
      </Panel>

      <Dialogo abierto={aBorrar !== null} titulo={E.borrarTitulo} texto={aBorrar?.nombre} onCerrar={() => setABorrar(null)}>
        <Boton
          variante="alerta"
          onClick={() => {
            if (aBorrar) borrar(aBorrar.id)
            setABorrar(null)
          }}
        >
          {E.borrarSi}
        </Boton>
        <Boton variante="fantasma" onClick={() => setABorrar(null)}>
          {T.comun.cancelar}
        </Boton>
      </Dialogo>
    </div>
  )
}

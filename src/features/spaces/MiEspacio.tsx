import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Pencil, Plus, ShieldCheck, Trash2, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Boton } from '../../components/Boton'
import { Dialogo } from '../../components/Dialogo'
import { Icono } from '../../components/Icono'
import { Ilustracion } from '../../components/Ilustracion'
import { OpcionGrande } from '../../components/OpcionGrande'
import { Panel } from '../../components/Panel'
import { ONBOARDING as O } from '../../data/onboarding'
import { PLANTAS, type Planta } from '../../data/plantas'
import { T } from '../../data/textos'
import { TC } from '../../data/textosCatalogo'
import { hoyLocal } from '../../lib/fecha'
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

function Resultado({ espacio, onVerPlanta }: { espacio: Espacio; onVerPlanta: (p: Planta) => void }) {
  const r = useMemo(() => recomendar(PLANTAS, espacio), [espacio])
  const R = E.resultado
  return (
    <div className="flex flex-col gap-3 px-5 pb-6">
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
                      <span className="text-tinta-suave block text-[13px] leading-tight font-bold">{lineaDeLuz(e.luz)}</span>
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
        {abierto && <Resultado espacio={abierto} onVerPlanta={setPlanta} />}
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

      <Dialogo abierto={aBorrar !== null} titulo={E.borrarTitulo} texto={aBorrar?.nombre}>
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

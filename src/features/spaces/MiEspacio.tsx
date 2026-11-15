import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, Plus, ShieldCheck, Sun, Trash2, TriangleAlert } from 'lucide-react'
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
import { recomendar, type DatosEspacio, type Motivo, type Recomendada } from '../../lib/recomendador'
import type { Abertura, Espacio } from '../../lib/tipos'
import { useStore } from '../../store/useStore'
import { FichaPlanta } from '../pets/FichaPlanta'
import { TarjetaPlanta } from '../pets/Plantas'

const E = TC.espacio
type Borrador = Partial<DatosEspacio> & { abertura?: Abertura }
const PASOS = ['tipo', 'sol', 'tamano', 'mascotas', 'esfuerzo'] as const

/** Orden en que se nombran los motivos en la frase de "por qué sí" */
const PRIORIDAD: Motivo[] = ['segura_mascotas', 'luz_ideal', 'luz_tolera', 'luz_filtrada', 'aguanta_sol', 'ama_humedad', 'aguanta_descuido', 'facil', 'tamano_justo', 'desafio']

export function frasePorQue(r: Recomendada): string {
  const partes = PRIORIDAD.filter((m) => r.motivos.includes(m))
    .slice(0, 3)
    .map((m) => E.motivos[m])
  const frase = partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : partes[0]
  return `${frase.charAt(0).toUpperCase()}${frase.slice(1)}.`
}

function aDatos(e: Espacio): DatosEspacio {
  return e.datos as unknown as DatosEspacio
}

function Resultado({ datos, onVerPlanta }: { datos: DatosEspacio; onVerPlanta: (p: Planta) => void }) {
  const r = useMemo(() => recomendar(PLANTAS, datos), [datos])
  const R = E.resultado
  return (
    <div className="flex flex-col gap-3 px-5 pb-6">
      <div className="bg-sol-claro flex items-center gap-3 rounded-2xl p-3">
        <Sun className="text-sol-osc shrink-0" aria-hidden />
        <div>
          <div className="text-tinta text-[15px] font-extrabold">
            {R.luz}: {TC.plantas.luz[r.luz]}
          </div>
          {r.luzAsumida && <div className="text-tinta-suave text-[13px] leading-snug font-bold">{R.luzAsumida}</div>}
        </div>
      </div>
      {datos.mascotas !== 'ninguna' && (
        <div className="bg-brote flex items-center gap-3 rounded-2xl p-3">
          <ShieldCheck className="text-hoja-osc shrink-0" aria-hidden />
          <div className="text-tinta text-[14px] font-extrabold">{R.filtroMascotas[datos.mascotas]}</div>
        </div>
      )}

      <h2 className="font-display text-tinta mt-2 mb-0 text-[22px] font-semibold">{R.recomendadas}</h2>
      {r.recomendadas.length === 0 ? (
        <p className="text-tinta-suave m-0 text-[15px] leading-snug font-bold">{R.sinResultados}</p>
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
              <button
                key={x.planta.id}
                type="button"
                onClick={() => onVerPlanta(x.planta)}
                className="border-alerta bg-alerta-clara flex w-full items-center gap-3 rounded-3xl border-2 p-3 text-left"
              >
                <span className="bg-alerta grid size-10 shrink-0 place-items-center rounded-full text-white">
                  <TriangleAlert size={20} aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="font-display text-tinta block text-[17px] font-semibold">{x.planta.nombre_comun}</span>
                  <span className="text-tinta block text-[14px] leading-snug font-bold">{typeof m === 'string' ? m : m[datos.mascotas]}</span>
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
  const horaPerfil = useStore((s) => s.respuestas?.horaSol)
  const guardar = useStore((s) => s.guardarEspacio)
  const borrar = useStore((s) => s.borrarEspacio)

  const [armando, setArmando] = useState(false)
  const [paso, setPaso] = useState(0)
  const [b, setB] = useState<Borrador>({})
  const [resultado, setResultado] = useState<{ datos: DatosEspacio; guardado: boolean } | null>(null)
  const [planta, setPlanta] = useState<Planta | null>(null)
  const [aBorrar, setABorrar] = useState<Espacio | null>(null)

  const empezar = () => {
    // Mascotas y horario de sol se precargan del onboarding; se pueden cambiar
    setB({ mascotas: mascotasPerfil, horaSol: horaPerfil })
    setPaso(0)
    setArmando(true)
  }
  const set = (c: Borrador) => setB((p) => ({ ...p, ...c }))
  const nombrePaso = PASOS[paso]
  const completo: Record<(typeof PASOS)[number], boolean> = {
    tipo: Boolean(b.tipo),
    sol: Boolean(b.horaSol && (b.abertura || b.tipo === 'balcon')),
    tamano: Boolean(b.tamano),
    mascotas: Boolean(b.mascotas),
    esfuerzo: Boolean(b.esfuerzo),
  }

  const siguiente = () => {
    if (paso < PASOS.length - 1) return setPaso(paso + 1)
    const datos: DatosEspacio = { tipo: b.tipo!, horaSol: b.horaSol!, tamano: b.tamano!, mascotas: b.mascotas!, esfuerzo: b.esfuerzo! }
    setResultado({ datos, guardado: false })
    setArmando(false)
  }

  const guardarActual = () => {
    if (!resultado) return
    const r = recomendar(PLANTAS, resultado.datos)
    const repetidos = espacios.filter((e) => e.datos.tipo === resultado.datos.tipo).length
    guardar({
      id: `${resultado.datos.tipo}-${Date.now().toString(36)}`,
      nombre: repetidos ? `${E.nombres[resultado.datos.tipo]} ${repetidos + 1}` : E.nombres[resultado.datos.tipo],
      creado: hoyLocal(),
      datos: { ...resultado.datos },
      plantas: r.recomendadas.map((x) => x.planta.id),
    })
    setResultado({ ...resultado, guardado: true })
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
            <h2 className="text-tinta-suave mt-1 mb-2 text-[13px] font-extrabold tracking-widest uppercase">{E.guardados}</h2>
            <div className="mb-5 flex flex-col gap-2.5">
              {espacios.map((e) => (
                <div key={e.id} className="border-arena-osc flex items-center rounded-3xl border-2 bg-white shadow-[0_3px_0_var(--color-arena-osc)]">
                  <button type="button" onClick={() => setResultado({ datos: aDatos(e), guardado: true })} className="flex min-h-16 flex-1 items-center gap-3 border-0 bg-transparent p-3 text-left">
                    <span className="bg-brote text-hoja-osc grid size-11 shrink-0 place-items-center rounded-2xl">
                      <Icono nombre={E.pasos.tipo.opciones.find((o) => o.valor === e.datos.tipo)?.icono ?? 'casa'} />
                    </span>
                    <span>
                      <span className="font-display text-tinta block text-[18px] font-semibold">{e.nombre}</span>
                      <span className="text-tinta-suave block text-[13px] font-bold">{TC.plantas.cuenta(e.plantas.length)}</span>
                    </span>
                  </button>
                  <button type="button" aria-label={`${E.borrar} ${e.nombre}`} onClick={() => setABorrar(e)} className="text-tinta-suave grid size-12 place-items-center border-0 bg-transparent">
                    <Trash2 size={20} aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        <Boton onClick={empezar}>
          <span className="flex items-center justify-center gap-2">
            <Plus size={20} strokeWidth={3} aria-hidden />
            {E.nuevo}
          </span>
        </Boton>
      </div>

      {/* Formulario de 5 pasos */}
      <Panel
        abierto={armando}
        onCerrar={() => (paso === 0 ? setArmando(false) : setPaso(paso - 1))}
        pie={
          <Boton disabled={!completo[nombrePaso]} variante={paso === PASOS.length - 1 ? 'sol' : 'primario'} onClick={siguiente}>
            {paso === PASOS.length - 1 ? E.verResultado : T.comun.continuar}
          </Boton>
        }
      >
        <div className="px-5 pb-4">
          <div className="mb-5 flex gap-1.5" role="progressbar" aria-valuenow={paso + 1} aria-valuemin={1} aria-valuemax={PASOS.length}>
            {PASOS.map((p, i) => (
              <span key={p} className={`h-2.5 flex-1 rounded-full ${i <= paso ? 'bg-hoja-clara' : 'bg-arena-osc'}`} />
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={nombrePaso} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}>
              <h2 className="font-display text-tinta mt-0 mb-4 text-[26px] leading-tight font-semibold">{E.pasos[nombrePaso].titulo}</h2>
              {nombrePaso === 'tipo' && (
                <div className="grid grid-cols-2 gap-2.5">
                  {E.pasos.tipo.opciones.map((o) => (
                    <OpcionGrande key={o.valor} compacta icono={o.icono} texto={o.texto} elegida={b.tipo === o.valor} onClick={() => set({ tipo: o.valor })} />
                  ))}
                </div>
              )}
              {nombrePaso === 'sol' && (
                <>
                  {b.tipo !== 'balcon' && (
                    <>
                      <h3 className="text-tinta mt-0 mb-2 text-[16px] font-extrabold">{O.sol.preguntaAbertura}</h3>
                      <div className="mb-5 grid grid-cols-3 gap-2">
                        {O.sol.aberturas.map((o) => (
                          <OpcionGrande key={o.valor} compacta texto={o.texto} elegida={b.abertura === o.valor} onClick={() => set({ abertura: o.valor })} />
                        ))}
                      </div>
                    </>
                  )}
                  <h3 className="text-tinta mt-0 mb-2 text-[16px] font-extrabold">{O.sol.preguntaHora}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {O.sol.horas.map((o) => (
                      <OpcionGrande key={o.valor} compacta icono={o.icono} texto={o.texto} elegida={b.horaSol === o.valor} onClick={() => set({ horaSol: o.valor })} />
                    ))}
                  </div>
                  {b.horaSol === 'no_se' && (
                    <p className="bg-sol-claro text-tinta mt-4 mb-0 rounded-2xl p-3 text-[14px] leading-snug font-bold">
                      {O.sol.ayudaNoSe.texto} {O.sol.ayudaNoSe.momentos.join(', ')}.
                    </p>
                  )}
                </>
              )}
              {nombrePaso === 'tamano' && (
                <div className="flex flex-col gap-3">
                  {E.pasos.tamano.opciones.map((o) => (
                    <OpcionGrande key={o.valor} icono={o.icono} texto={o.texto} elegida={b.tamano === o.valor} onClick={() => set({ tamano: o.valor })} />
                  ))}
                </div>
              )}
              {nombrePaso === 'mascotas' && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    {O.mascotas.opciones.map((o) => (
                      <OpcionGrande key={o.valor} compacta icono={o.icono} texto={o.texto} elegida={b.mascotas === o.valor} onClick={() => set({ mascotas: o.valor })} />
                    ))}
                  </div>
                  <p className="text-tinta-suave mt-4 mb-0 text-[14px] leading-snug font-bold">{E.pasos.mascotas.nota}</p>
                </>
              )}
              {nombrePaso === 'esfuerzo' && (
                <div className="flex flex-col gap-3">
                  {E.pasos.esfuerzo.opciones.map((o) => (
                    <OpcionGrande key={o.valor} icono={o.icono} texto={o.texto} elegida={b.esfuerzo === o.valor} onClick={() => set({ esfuerzo: o.valor })} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Panel>

      <Panel
        abierto={resultado !== null}
        titulo={resultado ? E.nombres[resultado.datos.tipo] : undefined}
        onCerrar={() => setResultado(null)}
        pie={
          resultado &&
          (resultado.guardado ? (
            <Boton variante="secundario" onClick={() => setResultado(null)}>
              <span className="flex items-center justify-center gap-2">
                <Check size={20} strokeWidth={3} aria-hidden />
                {E.resultado.listo}
              </span>
            </Boton>
          ) : (
            <Boton onClick={guardarActual}>{E.resultado.guardar}</Boton>
          ))
        }
      >
        {resultado && <Resultado datos={resultado.datos} onVerPlanta={setPlanta} />}
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

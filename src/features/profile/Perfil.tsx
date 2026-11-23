import { ChevronRight, ClipboardPaste, Copy, Download, Flame, PawPrint, RotateCcw, Upload, Zap, BookOpen, Image, Leaf } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { Boton } from '../../components/Boton'
import { Dialogo } from '../../components/Dialogo'
import { HojaInferior } from '../../components/HojaInferior'
import { Icono } from '../../components/Icono'
import { Brote } from '../../components/Ilustracion'
import { INSIGNIAS, NIVELES } from '../../data/gamificacion'
import { LECCIONES_POR_UNIDAD } from '../../data/lessons'
import { PERFILES } from '../../data/onboarding'
import { T } from '../../data/textos'
import { UNIDADES } from '../../data/unidades'
import { crearBackup, leerBackup, nombreDeBackup, type ErrorImportacion } from '../../lib/backup'
import { hoyLocal } from '../../lib/fecha'
import { nivelPara, rachaVigente, type InsigniaId } from '../../lib/gamificacion'
import type { DatosPersistidos, UnidadId } from '../../lib/tipos'
import { soloDatos, useStore } from '../../store/useStore'
import { EditorMascotas } from '../pets/EditorMascotas'
import { Panel } from '../../components/Panel'
import { TC } from '../../data/textosCatalogo'
import { Creditos, Fuentes } from './Fuentes'
import { Jardin } from './Jardin'
import { Nube } from './Nube'
import { FotoPlanta } from '../../components/FotoPlanta'
import { plantaPorId } from '../../data/plantas'

const P = T.perfil

/** Lee el archivo como texto. File.text() no existe en Safari viejo: se cae a FileReader. */
function leerArchivo(f: File): Promise<string> {
  if (typeof f.text === 'function') return f.text()
  return new Promise((ok, mal) => {
    const r = new FileReader()
    r.onload = () => ok(String(r.result ?? ''))
    r.onerror = () => mal(r.error)
    r.readAsText(f)
  })
}

function Fila({ icono, titulo, detalle, onClick, deshabilitada }: { icono: ReactNode; titulo: string; detalle?: string; onClick?: () => void; deshabilitada?: boolean }) {
  return (
    <button
      type="button"
      disabled={deshabilitada}
      onClick={onClick}
      className="border-arena flex min-h-14 w-full items-center gap-3 border-0 border-b-2 bg-transparent px-4 py-2.5 text-left last:border-b-0 disabled:opacity-55"
    >
      <span className="text-hoja-osc shrink-0">{icono}</span>
      <span className="flex-1">
        <span className="text-tinta block text-[16px] font-extrabold">{titulo}</span>
        {detalle && <span className="text-tinta-suave block text-[13px] font-bold">{detalle}</span>}
      </span>
      {!deshabilitada && <ChevronRight size={20} className="text-tinta-suave" aria-hidden />}
    </button>
  )
}

export function Perfil() {
  const s = useStore()
  const hoy = hoyLocal()
  const nivel = nivelPara(s.xp)
  const [editarMascotas, setEditarMascotas] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [pendiente, setPendiente] = useState<DatosPersistidos | null>(null)
  const [reiniciar, setReiniciar] = useState(false)
  const [panel, setPanel] = useState<'fuentes' | 'creditos' | 'jardin' | null>(null)
  const archivo = useRef<HTMLInputElement>(null)
  const [pegando, setPegando] = useState(false)
  const [pegado, setPegado] = useState('')

  const leccionesHechas = Object.keys(s.completadas).filter((id) => !id.startsWith('repaso-')).length
  const unidades = Object.keys(LECCIONES_POR_UNIDAD) as UnidadId[]

  const exportar = () => {
    const blob = new Blob([JSON.stringify(crearBackup(soloDatos(s)), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombreDeBackup(hoy)
    a.click()
    URL.revokeObjectURL(url)
    setAviso({ tipo: 'ok', texto: P.exportado })
  }

  const resumen = (d: DatosPersistidos) => P.resumen(Object.keys(d.completadas).length, d.xp, d.espacios.length)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(crearBackup(soloDatos(s))))
      setAviso({ tipo: 'ok', texto: P.copiado })
    } catch {
      setAviso({ tipo: 'error', texto: P.copiarError })
    }
  }

  const leerPegado = () => {
    const r = leerBackup(pegado)
    setPegando(false)
    setPegado('')
    if (r.ok) setPendiente(r.datos)
    else setAviso({ tipo: 'error', texto: P.erroresImportacion[r.error as ErrorImportacion] })
  }

  const alElegirArchivo = async (f: File | undefined) => {
    if (!f) return
    let texto = ''
    try {
      texto = await leerArchivo(f)
    } catch {
      // se trata como archivo ilegible
    }
    const r = leerBackup(texto)
    if (r.ok) setPendiente(r.datos)
    else setAviso({ tipo: 'error', texto: P.erroresImportacion[r.error as ErrorImportacion] })
    if (archivo.current) archivo.current.value = ''
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
    <div className="safe-top scroll-app min-h-0 flex-1">
      <header className="flex items-center gap-3 px-5 pt-4">
        <Brote className="h-24 w-22 shrink-0" />
        <div>
          <h1 className="font-display text-hoja-osc m-0 text-[28px] leading-tight font-semibold">{s.perfil ? PERFILES[s.perfil].nombre : P.titulo}</h1>
          <p className="text-tinta-suave m-0 text-[15px] font-extrabold">
            {P.nivel}: {NIVELES[nivel.indice]}
          </p>
        </div>
      </header>

      <section className="px-5 pt-3">
        <div className="bg-arena-osc h-4 overflow-hidden rounded-full">
          <div className="bg-hoja-clara h-full rounded-full" style={{ width: `${nivel.progreso * 100}%` }} />
        </div>
        <p className="text-tinta-suave mt-1 mb-0 text-[13px] font-bold">
          {nivel.xpSiguiente === null ? P.nivelMaximo : `${nivel.xpSiguiente - s.xp} ${P.xpPara} ${NIVELES[nivel.indice + 1]}`}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              [<Flame key="i" className="text-terracota" fill="currentColor" aria-hidden />, rachaVigente(s.racha, hoy), P.racha, 'bg-terracota-clara'],
              [<Zap key="i" className="text-sol-osc" fill="currentColor" aria-hidden />, s.xp, T.comun.xp, 'bg-sol-claro'],
              [<Leaf key="i" className="text-hoja" aria-hidden />, leccionesHechas, P.lecciones, 'bg-brote'],
            ] as const
          ).map(([icono, valor, etiqueta, color]) => (
            <div key={etiqueta} className={`flex flex-col items-center rounded-2xl p-3 ${color}`}>
              {icono}
              <span className="font-display text-tinta text-[22px] leading-tight font-semibold">{valor}</span>
              <span className="text-tinta-suave text-[12px] font-extrabold uppercase">{etiqueta}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="font-display text-tinta m-0 mb-2 text-[20px] font-semibold">{P.insignias}</h2>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(INSIGNIAS) as InsigniaId[]).map((id) => {
            const ganada = Boolean(s.insignias[id])
            return (
              <div key={id} className={`flex items-center gap-2 rounded-2xl border-2 p-2.5 ${ganada ? 'border-sol bg-white' : 'border-arena bg-arena/50'}`}>
                <span className={`grid size-10 shrink-0 place-items-center rounded-full ${ganada ? 'bg-sol text-white' : 'bg-arena-osc text-[#a3946f]'}`}>
                  <Icono nombre={INSIGNIAS[id].icono} size={20} />
                </span>
                <span className={`text-[13px] leading-tight font-extrabold ${ganada ? 'text-tinta' : 'text-tinta-suave'}`}>{INSIGNIAS[id].nombre}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="font-display text-tinta m-0 mb-2 text-[20px] font-semibold">{P.jardin.titulo}</h2>
        <button type="button" onClick={() => setPanel('jardin')} className="border-arena-osc flex w-full items-center gap-3 rounded-3xl border-2 bg-white p-3 text-left shadow-[0_3px_0_var(--color-arena-osc)] active:opacity-80">
          <span className="flex shrink-0 -space-x-3">
            {s.semillas.length === 0 ? (
              <span className="bg-brote text-hoja-osc grid size-12 place-items-center rounded-full">
                <Icono nombre="semilla" size={22} />
              </span>
            ) : (
              s.semillas.slice(-3).map((u) => {
                const planta = plantaPorId(UNIDADES[u].planta)
                return planta ? <FotoPlanta key={u} planta={planta} className="size-12 rounded-full border-2 border-white" /> : null
              })
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-tinta block text-[16px] font-extrabold">{P.jardin.ver}</span>
            <span className="text-tinta-suave block text-[13px] font-bold">{P.jardin.cuenta(s.semillas.length, Object.keys(UNIDADES).length)}</span>
          </span>
          <ChevronRight size={20} className="text-tinta-suave shrink-0" aria-hidden />
        </button>
      </section>

      <section className="px-5 pt-6">
        <h2 className="font-display text-tinta m-0 mb-2 text-[20px] font-semibold">{P.progreso}</h2>
        <div className="flex flex-col gap-2.5">
          {unidades.map((u) => {
            const ids = LECCIONES_POR_UNIDAD[u] ?? []
            const hechas = s.salteadas.includes(u) ? ids.length : ids.filter((id) => s.completadas[id]).length
            return (
              <div key={u}>
                <div className="text-tinta flex justify-between text-[14px] font-extrabold">
                  <span>{UNIDADES[u].titulo}</span>
                  <span className="text-tinta-suave">
                    {hechas}/{ids.length}
                  </span>
                </div>
                <div className="bg-arena-osc mt-1 h-3 overflow-hidden rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${(hechas / ids.length) * 100}%`, background: UNIDADES[u].color }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Nube />

      <section className="px-5 pt-6">
        <h2 className="font-display text-tinta m-0 mb-2 text-[20px] font-semibold">{P.ajustes}</h2>
        <div className="border-arena-osc overflow-hidden rounded-3xl border-2 bg-white">
          <Fila icono={<PawPrint aria-hidden />} titulo={P.mascotas} detalle={`${P.mascotasResumen[s.mascotas.tipo]} · ${P.mascotasTexto}`} onClick={() => setEditarMascotas(true)} />
          <Fila icono={<Download aria-hidden />} titulo={P.exportar} onClick={exportar} />
          <Fila icono={<Upload aria-hidden />} titulo={P.importar} onClick={() => archivo.current?.click()} />
          <Fila icono={<Copy aria-hidden />} titulo={P.copiar} onClick={() => void copiar()} />
          <Fila icono={<ClipboardPaste aria-hidden />} titulo={P.pegar} onClick={() => setPegando(true)} />
          <Fila icono={<BookOpen aria-hidden />} titulo={P.fuentes} onClick={() => setPanel('fuentes')} />
          <Fila icono={<Image aria-hidden />} titulo={P.creditos} onClick={() => setPanel('creditos')} />
          <Fila icono={<RotateCcw aria-hidden />} titulo={P.reiniciar} onClick={() => setReiniciar(true)} />
        </div>
        <input ref={archivo} type="file" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => void alElegirArchivo(e.target.files?.[0])} />

        <div className="bg-sol-claro mt-3 rounded-2xl p-4">
          <p className="text-tinta m-0 text-[15px] font-extrabold">{P.respaldoTitulo}</p>
          <p className="text-tinta-suave m-0 mt-1 text-[14px] leading-snug font-bold">{P.respaldoTexto}</p>
        </div>
        {aviso && (
          <p role="status" className={`mt-3 mb-0 rounded-2xl p-3 text-[14px] font-extrabold ${aviso.tipo === 'ok' ? 'bg-brote text-hoja-osc' : 'bg-alerta-clara text-alerta'}`}>
            {aviso.texto}
          </p>
        )}
        <p className="text-tinta-suave mt-4 mb-8 text-[13px] leading-snug font-bold">{P.disclaimer}</p>
      </section>
    </div>

      <Panel abierto={panel === 'fuentes'} titulo={TC.fuentes.titulo} onCerrar={() => setPanel(null)}>
        <Fuentes />
      </Panel>
      <Panel abierto={panel === 'jardin'} titulo={P.jardin.titulo} onCerrar={() => setPanel(null)}>
        <Jardin />
      </Panel>
      <Panel abierto={panel === 'creditos'} titulo={TC.creditos.titulo} onCerrar={() => setPanel(null)}>
        <Creditos />
      </Panel>

      <HojaInferior abierta={editarMascotas} onCerrar={() => setEditarMascotas(false)}>
        <EditorMascotas
          inicial={s.mascotas}
          onGuardar={(m) => {
            s.actualizarMascotas(m)
            setEditarMascotas(false)
          }}
        />
      </HojaInferior>

      <Dialogo abierto={pegando} titulo={P.pegarTitulo} texto={P.pegarTexto}>
        <textarea
          aria-label={P.pegarTitulo}
          value={pegado}
          onChange={(e) => setPegado(e.target.value)}
          rows={5}
          className="border-arena-osc text-tinta w-full rounded-2xl border-2 bg-white p-3 text-[14px]"
        />
        <Boton disabled={!pegado.trim()} onClick={leerPegado}>
          {P.pegarLeer}
        </Boton>
        <Boton variante="fantasma" onClick={() => setPegando(false)}>
          {T.comun.cancelar}
        </Boton>
      </Dialogo>

      <Dialogo abierto={pendiente !== null} titulo={P.importarConfirmarTitulo} texto={pendiente ? `${resumen(pendiente)} ${P.importarConfirmarTexto}` : P.importarConfirmarTexto}>
        <Boton
          onClick={() => {
            if (pendiente) s.reemplazarDatos(pendiente)
            setPendiente(null)
            setAviso({ tipo: 'ok', texto: `${P.importado} ${pendiente ? resumen(pendiente) : ''}` })
          }}
        >
          {P.importarSi}
        </Boton>
        <Boton variante="fantasma" onClick={() => setPendiente(null)}>
          {T.comun.cancelar}
        </Boton>
      </Dialogo>

      <Dialogo abierto={reiniciar} titulo={P.reiniciarTitulo} texto={P.reiniciarTexto}>
        <Boton variante="alerta" onClick={() => s.reiniciar()}>
          {P.reiniciarSi}
        </Boton>
        <Boton variante="fantasma" onClick={() => setReiniciar(false)}>
          {T.comun.cancelar}
        </Boton>
      </Dialogo>
    </div>
  )
}

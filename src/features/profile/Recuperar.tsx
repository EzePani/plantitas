import { lazy, Suspense, useRef, useState } from 'react'
import { Boton } from '../../components/Boton'
import { Panel } from '../../components/Panel'
import { T } from '../../data/textos'
import { TR } from '../../data/textosNube'
import { leerBackup } from '../../lib/backup'
import type { DatosPersistidos } from '../../lib/tipos'
import { useStore } from '../../store/useStore'

// El cliente de la nube pesa bastante: solo se baja si se abre esta pantalla
const Nube = lazy(() => import('./Nube').then((m) => ({ default: m.Nube })))

const campo = 'border-arena-osc text-tinta w-full rounded-2xl border-2 bg-white p-3 text-[14px]'

function leerArchivo(f: File): Promise<string> {
  if (typeof f.text === 'function') return f.text()
  return new Promise((ok, mal) => {
    const r = new FileReader()
    r.onload = () => ok(String(r.result ?? ''))
    r.onerror = () => mal(r.error)
    r.readAsText(f)
  })
}

/** Pantalla de bienvenida: recuperar un progreso ya existente (nube, texto pegado o archivo) */
export function Recuperar({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const reemplazar = useStore((s) => s.reemplazarDatos)
  const [texto, setTexto] = useState('')
  const [pendiente, setPendiente] = useState<DatosPersistidos | null>(null)
  const [error, setError] = useState<string | null>(null)
  const archivo = useRef<HTMLInputElement>(null)

  const revisar = (t: string) => {
    const r = leerBackup(t)
    if (r.ok) {
      setPendiente(r.datos)
      setError(null)
    } else setError(T.perfil.erroresImportacion[r.error])
  }

  return (
    <Panel abierto={abierto} titulo={TR.titulo} onCerrar={onCerrar}>
      <div className="flex flex-col gap-6 px-5 pb-8">
        {pendiente ? (
          <div className="border-arena-osc flex flex-col gap-3 rounded-3xl border-2 bg-white p-4">
            <p className="text-tinta m-0 text-[16px] font-extrabold">{TR.resumen(Object.keys(pendiente.completadas).length, pendiente.xp, pendiente.espacios.length)}</p>
            <Boton onClick={() => reemplazar(pendiente)}>{TR.usar}</Boton>
            <Boton variante="fantasma" onClick={() => setPendiente(null)}>
              {TR.descartar}
            </Boton>
          </div>
        ) : (
          <>
            <section>
              <h2 className="font-display text-tinta m-0 text-[18px] font-semibold">{TR.vincularTitulo}</h2>
              <p className="text-tinta-suave m-0 text-[14px] font-bold">{TR.vincularTexto}</p>
              <Suspense fallback={null}>
                <Nube compacto />
              </Suspense>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-display text-tinta m-0 text-[18px] font-semibold">{TR.textoTitulo}</h2>
              <textarea aria-label={TR.textoPista} placeholder={TR.textoPista} rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} className={campo} />
              <Boton disabled={!texto.trim()} onClick={() => revisar(texto)}>
                {TR.leer}
              </Boton>
              <Boton variante="secundario" onClick={() => archivo.current?.click()}>
                {TR.archivo}
              </Boton>
              <input
                ref={archivo}
                type="file"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  let t = ''
                  try {
                    t = await leerArchivo(f)
                  } catch {
                    // se trata como archivo ilegible
                  }
                  revisar(t)
                  e.target.value = ''
                }}
              />
              {error && (
                <p role="status" className="bg-alerta-clara text-alerta m-0 rounded-2xl p-3 text-[14px] font-extrabold">
                  {error}
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </Panel>
  )
}

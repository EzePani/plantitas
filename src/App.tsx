import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react'
import { InvitacionInstalar } from './components/InvitacionInstalar'
import { BarraNav, type Pestana } from './components/BarraNav'
import { Bloqueada } from './components/Bloqueada'
import { T } from './data/textos'
import { iniciarAtras } from './lib/atras'
import { useAtras } from './lib/useAtras'
import { Onboarding } from './features/onboarding/Onboarding'
import { Aprender } from './features/learn/Aprender'
import type { Sesion } from './features/quiz/Reproductor'
import { cargarContenido } from './lib/useContenido'
import { leerBloqueo, suscribirBloqueo } from './store/disco'
import { useStore } from './store/useStore'

// Estas pantallas (y los datos pesados que usan) se cargan aparte; se precargan apenas la app queda en reposo
const cargarPlantas = () => import('./features/pets/Plantas').then((m) => ({ default: m.Plantas }))
const cargarEspacio = () => import('./features/spaces/MiEspacio').then((m) => ({ default: m.MiEspacio }))
const cargarGuardia = () => import('./features/guardia/Guardia').then((m) => ({ default: m.Guardia }))
const cargarPerfil = () => import('./features/profile/Perfil').then((m) => ({ default: m.Perfil }))
const cargarReproductor = () => import('./features/quiz/Reproductor').then((m) => ({ default: m.Reproductor }))
const cargarGuia = () => import('./features/wiki/Guia').then((m) => ({ default: m.Guia }))
const Plantas = lazy(cargarPlantas)
const MiEspacio = lazy(cargarEspacio)
const Guardia = lazy(cargarGuardia)
const Perfil = lazy(cargarPerfil)
const Reproductor = lazy(cargarReproductor)
const Guia = lazy(cargarGuia)

const ORDEN: Pestana[] = ['aprender', 'plantas', 'espacio', 'guardia', 'perfil']

export function App() {
  const listo = useStore((s) => s.onboardingCompleto)
  const bloqueo = useSyncExternalStore(suscribirBloqueo, leerBloqueo)
  const [pestana, setPestana] = useState<Pestana>('aprender')
  const [direccion, setDireccion] = useState(1)
  // Pestañas por las que se pasó, para que el botón atrás las recorra hasta volver a Aprender
  const [anteriores, setAnteriores] = useState<Pestana[]>([])
  const [avisoSalir, setAvisoSalir] = useState(false)
  useEffect(() => iniciarAtras(setAvisoSalir), [])
  const [sesion, setSesion] = useState<Sesion | null>(null)
  /** Caso de Guardia a abrir al llegar desde el aviso */
  const [caso, setCaso] = useState<string | null>(null)
  // La guía rápida se abre desde Aprender (lista completa) o desde el buscador de Plantas (directo en una ficha).
  // `vez` cambia en cada apertura para que arranque limpia.
  const [guia, setGuia] = useState<{ abierta: boolean; entrada: string | null; vez: number }>({ abierta: false, entrada: null, vez: 0 })
  const abrirGuia = (entrada: string | null = null) => setGuia((g) => ({ abierta: true, entrada, vez: g.vez + 1 }))

  useEffect(() => {
    const precargar = () => {
      void cargarReproductor()
      void cargarContenido()
      void cargarPlantas()
      void cargarEspacio()
      void cargarGuardia()
      void cargarPerfil()
      void cargarGuia()
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(precargar, { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(precargar, 1500)
    return () => clearTimeout(id)
  }, [])

  // Si este dispositivo está vinculado, se engancha la sincronización (el cliente de la nube se carga aparte)
  useEffect(() => {
    if (!listo) return
    try {
      // También al volver del link del mail, para que la sesión se tome aunque el dispositivo todavía no esté vinculado
      const vuelveDelLink = location.hash.includes('access_token') || location.search.includes('code=')
      if (vuelveDelLink || localStorage.getItem('plantitas-dispositivo')?.includes('"registrado":true')) void import('./lib/nube').then((m) => m.iniciar())
    } catch {
      // sin almacenamiento no hay sincronización
    }
  }, [listo])

  const mostrar = (p: Pestana) => {
    setGuia((g) => ({ ...g, abierta: false }))
    setDireccion(ORDEN.indexOf(p) >= ORDEN.indexOf(pestana) ? 1 : -1)
    setPestana(p)
  }
  const cambiar = (p: Pestana) => {
    if (p !== pestana) setAnteriores((h) => (p === 'aprender' ? [] : [...h.filter((x) => x !== p && x !== pestana), pestana]))
    mostrar(p)
  }
  useAtras(listo && pestana !== 'aprender', () => {
    mostrar(anteriores[anteriores.length - 1] ?? 'aprender')
    setAnteriores(anteriores.slice(0, -1))
  })

  if (bloqueo) return <Bloqueada motivo={bloqueo} />

  return (
    <div className="marco">
      <AnimatePresence mode="wait" initial={false}>
        {!listo ? (
          <motion.div key="onboarding" className="flex min-h-0 flex-1 flex-col" exit={{ opacity: 0, scale: 0.98 }}>
            <Onboarding />
          </motion.div>
        ) : (
          <motion.div key="app" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <main className="relative min-h-0 flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false} custom={direccion}>
                <motion.div
                  key={pestana}
                  custom={direccion}
                  className="absolute inset-0 flex flex-col"
                  variants={{
                    entra: (d: number) => ({ x: 40 * d, opacity: 0 }),
                    quieta: { x: 0, opacity: 1 },
                    sale: (d: number) => ({ x: -40 * d, opacity: 0 }),
                  }}
                  initial="entra"
                  animate="quieta"
                  exit="sale"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {pestana === 'aprender' && (
                    <Aprender
                      onJugar={setSesion}
                      onIrAEspacio={() => cambiar('espacio')}
                      onGuia={() => abrirGuia()}
                      onGuardia={(id) => {
                        setCaso(id)
                        cambiar('guardia')
                      }}
                    />
                  )}
                  <Suspense fallback={null}>
                    {pestana === 'plantas' && <Plantas onGuia={abrirGuia} />}
                    {pestana === 'espacio' && <MiEspacio />}
                    {pestana === 'guardia' && <Guardia abrir={caso} onAbierto={() => setCaso(null)} onGuia={abrirGuia} />}
                    {pestana === 'perfil' && <Perfil />}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
              {guia.vez > 0 && (
                <Suspense fallback={null}>
                  <Guia key={guia.vez} abierta={guia.abierta} entradaInicial={guia.entrada} onCerrar={() => setGuia((g) => ({ ...g, abierta: false }))} onJugar={setSesion} />
                </Suspense>
              )}
            </main>
            <BarraNav activa={pestana} onCambiar={cambiar} />
          </motion.div>
        )}
      </AnimatePresence>

      <InvitacionInstalar />

      {avisoSalir && (
        <p role="status" className="bg-selva pointer-events-none absolute bottom-24 left-1/2 z-50 m-0 -translate-x-1/2 rounded-full px-4 py-2 text-[14px] font-bold whitespace-nowrap text-white shadow-lg">
          {T.comun.salirAtras}
        </p>
      )}

      {/* La lección se abre por encima de todo, deslizando desde abajo */}
      <AnimatePresence>
        {sesion && (
          <motion.div
            key="reproductor"
            className="bg-crema absolute inset-0 z-30 flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
          >
            <Suspense fallback={null}>
              <Reproductor sesion={sesion} onCerrar={() => setSesion(null)} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

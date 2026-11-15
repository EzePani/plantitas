import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import { BarraNav, type Pestana } from './components/BarraNav'
import { Onboarding } from './features/onboarding/Onboarding'
import { Aprender } from './features/learn/Aprender'
import type { Sesion } from './features/quiz/Reproductor'
import { cargarContenido } from './lib/useContenido'
import { useStore } from './store/useStore'

// Estas pantallas (y los datos pesados que usan) se cargan aparte; se precargan apenas la app queda en reposo
const cargarPlantas = () => import('./features/pets/Plantas').then((m) => ({ default: m.Plantas }))
const cargarEspacio = () => import('./features/spaces/MiEspacio').then((m) => ({ default: m.MiEspacio }))
const cargarPerfil = () => import('./features/profile/Perfil').then((m) => ({ default: m.Perfil }))
const cargarReproductor = () => import('./features/quiz/Reproductor').then((m) => ({ default: m.Reproductor }))
const Plantas = lazy(cargarPlantas)
const MiEspacio = lazy(cargarEspacio)
const Perfil = lazy(cargarPerfil)
const Reproductor = lazy(cargarReproductor)

const ORDEN: Pestana[] = ['aprender', 'plantas', 'espacio', 'perfil']

export function App() {
  const listo = useStore((s) => s.onboardingCompleto)
  const [pestana, setPestana] = useState<Pestana>('aprender')
  const [direccion, setDireccion] = useState(1)
  const [sesion, setSesion] = useState<Sesion | null>(null)

  useEffect(() => {
    const precargar = () => {
      void cargarReproductor()
      void cargarContenido()
      void cargarPlantas()
      void cargarEspacio()
      void cargarPerfil()
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(precargar, { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(precargar, 1500)
    return () => clearTimeout(id)
  }, [])

  const cambiar = (p: Pestana) => {
    setDireccion(ORDEN.indexOf(p) >= ORDEN.indexOf(pestana) ? 1 : -1)
    setPestana(p)
  }

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
                  {pestana === 'aprender' && <Aprender onJugar={setSesion} onIrAEspacio={() => cambiar('espacio')} />}
                  <Suspense fallback={null}>
                    {pestana === 'plantas' && <Plantas />}
                    {pestana === 'espacio' && <MiEspacio />}
                    {pestana === 'perfil' && <Perfil />}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </main>
            <BarraNav activa={pestana} onCambiar={cambiar} />
          </motion.div>
        )}
      </AnimatePresence>

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

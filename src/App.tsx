import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { BarraNav, type Pestana } from './components/BarraNav'
import { Onboarding } from './features/onboarding/Onboarding'
import { Aprender } from './features/learn/Aprender'
import { Plantas } from './features/pets/Plantas'
import { MiEspacio } from './features/spaces/MiEspacio'
import { Perfil } from './features/profile/Perfil'
import { Reproductor, type Sesion } from './features/quiz/Reproductor'
import { useStore } from './store/useStore'

const ORDEN: Pestana[] = ['aprender', 'plantas', 'espacio', 'perfil']

export function App() {
  const listo = useStore((s) => s.onboardingCompleto)
  const [pestana, setPestana] = useState<Pestana>('aprender')
  const [direccion, setDireccion] = useState(1)
  const [sesion, setSesion] = useState<Sesion | null>(null)

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
                  {pestana === 'plantas' && <Plantas />}
                  {pestana === 'espacio' && <MiEspacio />}
                  {pestana === 'perfil' && <Perfil />}
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
            <Reproductor sesion={sesion} onCerrar={() => setSesion(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

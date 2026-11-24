import { AnimatePresence, motion } from 'framer-motion'
import { Share, Smartphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Boton } from './Boton'

const CLAVE = 'plantitas-invitacion-instalar'

interface EventoInstalar extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const instalada = () => matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
const yaVista = () => {
  try {
    return localStorage.getItem(CLAVE) !== null
  } catch {
    return false
  }
}
const marcarVista = () => {
  try {
    localStorage.setItem(CLAVE, '1')
  } catch {
    // sin almacenamiento, se vuelve a mostrar la próxima vez
  }
}

type Plataforma = 'ios' | 'compu' | 'android'
const plataforma = (): Plataforma => {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'compu'
}

/** Aviso que se muestra una sola vez al primer ingreso: invita a instalar la app en el celular */
export function InvitacionInstalar() {
  const [visible, setVisible] = useState(false)
  const [evento, setEvento] = useState<EventoInstalar | null>(null)
  const [plat] = useState(plataforma)

  useEffect(() => {
    if (yaVista() || instalada()) return
    const alPrompt = (e: Event) => {
      e.preventDefault()
      setEvento(e as EventoInstalar)
    }
    const alInstalar = () => {
      marcarVista()
      setVisible(false)
    }
    window.addEventListener('beforeinstallprompt', alPrompt)
    window.addEventListener('appinstalled', alInstalar)
    const id = setTimeout(() => setVisible(true), 2500)
    return () => {
      clearTimeout(id)
      window.removeEventListener('beforeinstallprompt', alPrompt)
      window.removeEventListener('appinstalled', alInstalar)
    }
  }, [])

  const cerrar = () => {
    marcarVista()
    setVisible(false)
  }
  const instalar = async () => {
    if (!evento) return
    await evento.prompt()
    await evento.userChoice
    cerrar()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Instalar Plantitas"
          className="safe-top absolute inset-x-0 top-0 z-50 px-3 pt-3"
          initial={{ y: '-120%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-120%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          <div className="rounded-3xl border-2 border-arena-osc bg-white p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="bg-brote text-hoja-osc grid size-11 shrink-0 place-items-center rounded-2xl">
                <Smartphone size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-selva text-[17px] font-semibold leading-tight">
                  {plat === 'compu' ? 'Plantitas va mejor en tu celu' : 'Instalá Plantitas en tu celu'}
                </p>
                <p className="text-tinta-suave mt-1 text-[14px] leading-snug">
                  {plat === 'compu'
                    ? 'Abrí esta dirección desde tu celular y agregala a la pantalla de inicio.'
                    : 'Queda en tu pantalla de inicio y funciona sin conexión.'}
                </p>
                {plat === 'ios' && (
                  <p className="text-tinta mt-2 flex flex-wrap items-center gap-1 text-[14px] font-semibold leading-snug">
                    <Share size={16} className="text-agua" /> → «Agregar a inicio».
                  </p>
                )}
                {plat === 'android' && !evento && (
                  <p className="text-tinta mt-2 text-[14px] font-semibold leading-snug">Menú ⋮ → «Instalar app».</p>
                )}
              </div>
              <button aria-label="Cerrar" onClick={cerrar} className="text-tinta-suave -m-1 grid size-9 place-items-center rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              {evento && plat !== 'compu' && (
                <Boton onClick={() => void instalar()} className="min-h-11! text-[16px]!">
                  Instalar
                </Boton>
              )}
              <Boton variante="secundario" onClick={cerrar} className="min-h-11! text-[16px]!">
                {evento && plat !== 'compu' ? 'Ahora no' : 'Entendido'}
              </Boton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

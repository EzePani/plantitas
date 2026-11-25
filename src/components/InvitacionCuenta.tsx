import { CloudUpload, X } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { TCU } from '../data/textosNube'
import { Boton } from './Boton'
import { Panel } from './Panel'

// El cliente de la nube pesa bastante: solo se baja al abrir el panel
const Nube = lazy(() => import('../features/profile/Nube').then((m) => ({ default: m.Nube })))

const CLAVE = 'plantitas-invitacion-cuenta'
const DIA = 86_400_000

/** Guarda "no mostrar antes de" (ahora + días) */
export function posponerInvitacionCuenta(dias: number) {
  try {
    localStorage.setItem(CLAVE, String(Date.now() + dias * DIA))
  } catch {
    // sin almacenamiento, se vuelve a mostrar la próxima vez
  }
}

function debeMostrarse(): boolean {
  try {
    if (localStorage.getItem('plantitas-dispositivo')?.includes('"registrado":true')) return false
    return Date.now() >= Number(localStorage.getItem(CLAVE) ?? 0)
  } catch {
    return false
  }
}

/** Tarjeta en la pantalla principal para quien se salteó la cuenta al empezar: más visible que el Perfil */
export function InvitacionCuenta() {
  const [visible, setVisible] = useState(debeMostrarse)
  const [abierto, setAbierto] = useState(false)
  if (!visible) return null

  return (
    <>
      <div className="border-arena-osc z-10 mx-3 mt-2 flex shrink-0 items-center gap-3 rounded-2xl border-2 bg-white p-3" role="region" aria-label={TCU.avisoTitulo}>
        <span className="bg-brote text-hoja-osc grid size-10 shrink-0 place-items-center rounded-full">
          <CloudUpload size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-tinta m-0 text-[16px] leading-tight font-semibold">{TCU.avisoTitulo}</p>
          <p className="text-tinta-suave m-0 text-[13px] font-bold">{TCU.avisoTexto}</p>
          <Boton ancho={false} className="mt-2 min-h-10! px-4! text-[14px]!" onClick={() => setAbierto(true)}>
            {TCU.avisoBoton}
          </Boton>
        </div>
        <button
          type="button"
          aria-label={TCU.avisoCerrar}
          onClick={() => {
            posponerInvitacionCuenta(5)
            setVisible(false)
          }}
          className="text-tinta-suave -mt-6 grid size-9 shrink-0 place-items-center rounded-full border-0 bg-transparent"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
      <Panel abierto={abierto} titulo={TCU.titulo} onCerrar={() => setAbierto(false)}>
        <div className="px-5 pb-8">
          <p className="text-tinta-suave m-0 text-[15px] leading-snug font-bold">{TCU.texto}</p>
          <Suspense fallback={null}>
            <Nube
              compacto
              onListo={() => {
                setAbierto(false)
                setVisible(false)
              }}
            />
          </Suspense>
        </div>
      </Panel>
    </>
  )
}

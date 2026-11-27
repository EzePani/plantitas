import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { TG } from '../../data/textosGuardia'
import { GRUPOS_SINTOMAS } from '../../lib/guardia'
import { vibrar } from '../../lib/haptics'
import type { Sintoma } from '../../lib/tipos'
import { titulo } from './comunes'

// Dibujos genéricos para reconocer el síntoma de un vistazo (no representan una especie)
const VERDE = '#7aa95c'
const NERVIO = '#456b30'
const MARRON = '#8a5a2b'

const Hoja = ({ color = VERDE, children }: { color?: string; children?: ReactNode }) => (
  <>
    <path d="M10 35Q45 0 80 35Q45 70 10 35Z" fill={color} />
    <path d="M1 35H70M44 35l10-9M44 35l10 9M28 35l10-9M28 35l10 9" stroke={NERVIO} fill="none" />
    {children}
  </>
)
const Tallo = ({ d }: { d: string }) => <path d={d} stroke={NERVIO} strokeWidth={3} fill="none" />
const Hojita = ({ x, y, giro, escala = 0.3 }: { x: number; y: number; giro: number; escala?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro} 14 11) scale(${escala})`}>
    <Hoja />
  </g>
)
const Puntos = ({ color, en, radio }: { color: string; en: [number, number][]; radio: number }) => (
  <>
    {en.map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={radio} fill={color} />
    ))}
  </>
)
const Maceta = () => (
  <>
    <path d="M22 46H68L61 68H29Z" fill="#c8805a" />
    <path d="M22 46H68" stroke={MARRON} strokeWidth={5} />
  </>
)

const DIBUJOS: Record<Sintoma, ReactNode> = {
  amarillas: <Hoja color="#e8cf45" />,
  puntas: (
    <Hoja>
      <path d="M60 20Q72 26 80 35Q72 44 60 50Q66 35 60 20Z" fill={MARRON} />
    </Hoja>
  ),
  manchas: (
    <Hoja>
      <Puntos color={MARRON} en={[[32, 26], [52, 42], [58, 27]]} radio={6} />
    </Hoja>
  ),
  enrolladas: (
    <>
      <path d="M8 42Q40 8 82 24Q56 50 8 42Z" fill="#5f8c45" />
      <path d="M8 42Q42 22 82 24Q50 38 8 42Z" fill="#a9c98d" />
      <path d="M80 25q8 2 4 9t-9 2q-3-5 3-6" stroke={NERVIO} fill="none" />
    </>
  ),
  arrugadas: (
    <>
      <path d="M10 35q6-14 14-10q4-12 14-7q8-8 15 3q10-3 12 7q10 3 15 7q-5 5-15 8q-2 11-13 7q-7 11-15 2q-10 6-13-7q-9 3-14-10Z" fill="#8f9f5a" />
      <path d="M24 30l8 8M40 24l5 12M56 28l-3 14M12 35H72" stroke="#4d5a2a" fill="none" />
    </>
  ),
  caidas: (
    <>
      <Tallo d="M8 14Q42 6 48 24" />
      <g transform="translate(25 18) rotate(80 24 20) scale(.55)">
        <Hoja />
      </g>
    </>
  ),
  se_caen: (
    <>
      <Tallo d="M45 62V8" />
      <Hojita x={40} y={6} giro={-30} />
      <Hojita x={8} y={50} giro={15} />
      <Hojita x={56} y={52} giro={-10} />
    </>
  ),
  estirada: (
    <>
      <Tallo d="M40 68Q36 36 56 4" />
      <Hojita x={24} y={44} giro={20} escala={0.2} />
      <Hojita x={40} y={26} giro={-25} escala={0.2} />
      <Hojita x={40} y={6} giro={15} escala={0.2} />
    </>
  ),
  bichos: (
    <Hoja>
      <Puntos color="#222" en={[[30, 30], [36, 40], [55, 32]]} radio={2.5} />
      <Puntos color="#fff" en={[[46, 24], [50, 26], [48, 28], [62, 40], [65, 38]]} radio={3} />
    </Hoja>
  ),
  tallo_blando: (
    <>
      <Tallo d="M45 46Q42 24 58 8" />
      <Hojita x={52} y={2} giro={-20} />
      <Maceta />
      <path d="M45 46Q43 38 45 32" stroke="#3b2a1a" strokeWidth={8} fill="none" />
    </>
  ),
  moho: (
    <>
      <Tallo d="M45 46V10" />
      <Hojita x={40} y={8} giro={-30} />
      <Maceta />
      <Puntos color="#eee" en={[[31, 43], [37, 41], [55, 43], [60, 42]]} radio={4} />
    </>
  ),
}

/** Los síntomas como tarjetas con dibujo, separados por dónde se ven. Se pueden marcar varios. */
export function TarjetasSintomas({ elegidos, onElegir }: { elegidos: Sintoma[]; onElegir: (s: Sintoma) => void }) {
  return (
    <>
      {(['hojas', 'resto'] as const).map((grupo) => (
        <section key={grupo} className="flex flex-col gap-2">
          <h3 className={`${titulo} text-[16px]`}>{TG.grupoSintomas[grupo]}</h3>
          <div className="grid grid-cols-2 gap-2">
            {GRUPOS_SINTOMAS[grupo].map((s) => {
              const on = elegidos.includes(s)
              const { nombre, detalle } = TG.tarjeta[s]
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    vibrar('toque')
                    onElegir(s)
                  }}
                  className={`relative flex flex-col items-center gap-0.5 rounded-3xl border-3 p-2 text-center ${on ? 'border-hoja bg-brote' : 'border-arena-osc bg-white'}`}
                >
                  {on && (
                    <span className="bg-hoja absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full text-white">
                      <Check size={15} strokeWidth={4} aria-hidden />
                    </span>
                  )}
                  <svg viewBox="0 0 90 70" className="h-18 w-full" aria-hidden>
                    {DIBUJOS[s]}
                  </svg>
                  <span className="text-tinta text-[15px] leading-tight font-extrabold">{nombre}</span>
                  <span className="text-tinta-suave text-[12px] leading-tight font-bold">{detalle}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </>
  )
}

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const ANCHO = 44
const CENTRO = 25
const ONDA = 7

interface Props {
  /** nodos jugables del camino */
  total: number
  /** nodos completados */
  hechos: number
  /** índices de nodo (0..total-1) donde se completó una unidad: ahí florece */
  flores: number[]
}

/**
 * Enredadera del borde izquierdo: nace abajo y trepa hacia arriba a medida que se avanza.
 * Queda fija en pantalla, así acompaña todo el scroll del camino. Su largo depende solo
 * del progreso guardado, por eso se mantiene entre sesiones.
 */
export function Enredadera({ total, hechos, flores }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [alto, setAlto] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => setAlto(el.clientHeight)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const n = Math.max(1, total)
  const margen = 14
  const paso = alto > 0 ? (alto - margen * 2) / n : 0
  const punto = (k: number) => ({ x: CENTRO + (k % 2 === 0 ? -ONDA : ONDA), y: alto - margen - k * paso })

  let d = ''
  if (alto > 0) {
    const p0 = punto(0)
    d = `M${CENTRO} ${alto} Q${CENTRO} ${p0.y + 6} ${p0.x} ${p0.y}`
    for (let k = 1; k <= n; k++) {
      const a = punto(k - 1)
      const b = punto(k)
      const my = (a.y + b.y) / 2
      d += ` C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`
    }
  }
  const progreso = hechos / n

  return (
    <div ref={ref} className="pointer-events-none absolute inset-y-0 left-0 z-10" style={{ width: ANCHO }} aria-hidden>
      {alto > 0 && (
        <svg width={ANCHO} height={alto} viewBox={`0 0 ${ANCHO} ${alto}`} className="overflow-visible">
          <path d={d} fill="none" stroke="var(--color-arena-osc)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" />
          {hechos > 0 && <motion.path
            d={d}
            fill="none"
            stroke="var(--color-hoja)"
            strokeWidth="5"
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: progreso }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />}
          {Array.from({ length: hechos }, (_, k) => {
            const p = punto(k + 1)
            const derecha = (k + 1) % 2 === 1
            const florece = flores.includes(k)
            return (
              <motion.g
                key={k}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 9, delay: 0.6 }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              >
                <path
                  d="M0 0C-7-5-7-16 0-22 7-16 7-5 0 0z"
                  fill={k % 2 ? 'var(--color-hoja-clara)' : 'var(--color-hoja)'}
                  transform={`translate(${p.x} ${p.y}) rotate(${derecha ? 62 : -62}) scale(0.85)`}
                />
                {florece && (
                  <g transform={`translate(${p.x + (derecha ? -9 : 9)} ${p.y - 4})`}>
                    {[0, 72, 144, 216, 288].map((a) => (
                      <ellipse key={a} cx="0" cy="-6" rx="3.6" ry="5.5" fill="#f3a585" transform={`rotate(${a})`} />
                    ))}
                    <circle r="3.4" fill="var(--color-sol)" />
                  </g>
                )}
              </motion.g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

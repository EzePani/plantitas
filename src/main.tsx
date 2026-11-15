import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import '@fontsource-variable/fredoka'
import '@fontsource-variable/nunito'
import './index.css'
import { App } from './App'
import { Ilustracion, NOMBRES_ILUSTRACIONES } from './components/Ilustracion'

/** Ayuda de desarrollo: /?ilustraciones muestra todas las ilustraciones juntas */
function Galeria() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, padding: 12, background: '#fff', height: '100dvh', overflow: 'auto' }}>
      {NOMBRES_ILUSTRACIONES.map((n) => (
        <figure key={n} style={{ margin: 0 }}>
          <Ilustracion nombre={n} />
          <figcaption style={{ font: '600 13px sans-serif', textAlign: 'center' }}>{n}</figcaption>
        </figure>
      ))}
    </div>
  )
}
const verGaleria = new URLSearchParams(location.search).has('ilustraciones')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user": respeta prefers-reduced-motion en todas las animaciones */}
    <MotionConfig reducedMotion="user">
      {verGaleria ? <Galeria /> : <App />}
    </MotionConfig>
  </StrictMode>,
)

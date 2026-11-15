import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import '@fontsource-variable/fredoka'
import '@fontsource-variable/nunito'
import './index.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user": respeta prefers-reduced-motion en todas las animaciones */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)

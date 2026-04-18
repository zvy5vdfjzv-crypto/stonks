import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 🎨 FASE 1 — Design tokens: 3 familias de fonte
// Geist Sans (body), JetBrains Mono (numeros/terminal), Space Grotesk (display)
import '@fontsource-variable/geist'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/space-grotesk'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

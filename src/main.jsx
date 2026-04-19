import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 🎨 FASE 1 — Design tokens: 3 familias de fonte
// Geist Sans (body), JetBrains Mono (numeros/terminal), Space Grotesk (display)
import '@fontsource-variable/geist'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/space-grotesk'
import './index.css'
import App from './App.jsx'

// ⚙️ Aplicar settings salvas ANTES de renderizar — evita flash de tema/tamanho errado
try {
  // Tema (dark/light)
  const darkRaw = localStorage.getItem('stonks_theme_dark')
  const dark = darkRaw === null ? true : JSON.parse(darkRaw)
  document.documentElement.classList.toggle('light', !dark)
  // Fontsize
  const sizes = { P: '14px', M: '16px', G: '18px' }
  const fsRaw = localStorage.getItem('stonks_fontsize')
  const fs = (fsRaw ? JSON.parse(fsRaw) : 'M')
  document.documentElement.style.fontSize = sizes[fs] || '16px'
  // Reduce motion
  const rmRaw = localStorage.getItem('stonks_reduce_motion')
  const rm = rmRaw === null ? false : JSON.parse(rmRaw)
  if (rm) document.documentElement.classList.add('reduce-motion')
} catch { /* ignora — fallback pros defaults */ }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

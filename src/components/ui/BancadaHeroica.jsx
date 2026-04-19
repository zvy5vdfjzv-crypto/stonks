// 🔥 Mundo B — Momento heroico de bancada (briefing 3.1: "meme-caotico").
// Dispara em compras > threshold. Screen shake + overlay ALL CAPS + noise.
// Pegada Balatro/Vampire Survivors: faz cada ganho parecer grande.
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const HEROIC_LINES = [
  'BANCADA PESADA',
  'GRANDE JOGADA',
  'DIAMOND HANDS',
  'APOSTA LENDARIA',
  'HOLD SAGRADO',
  'YOLO CONFIRMADO',
]

export default function BancadaHeroica({ active, value = 0, onDone }) {
  const [line, setLine] = useState(HEROIC_LINES[0])

  useEffect(() => {
    if (!active) return
    setLine(HEROIC_LINES[Math.floor(Math.random() * HEROIC_LINES.length)])
    // Screen shake via body transform
    const body = document.body
    const shakeKeyframes = [
      'translate(0, 0)', 'translate(-4px, 2px)', 'translate(3px, -2px)',
      'translate(-2px, 1px)', 'translate(1px, 0)', 'translate(0, 0)',
    ]
    body.style.transition = 'transform 60ms'
    let i = 0
    const interval = setInterval(() => {
      body.style.transform = shakeKeyframes[i]
      i++
      if (i >= shakeKeyframes.length) {
        clearInterval(interval)
        body.style.transform = ''
        body.style.transition = ''
      }
    }, 60)
    const timer = setTimeout(() => { onDone?.() }, 1800)
    return () => { clearTimeout(timer); clearInterval(interval); body.style.transform = ''; body.style.transition = '' }
  }, [active, onDone])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[998] pointer-events-none flex items-center justify-center overflow-hidden"
        >
          {/* Flash gradient */}
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.6), rgba(255,107,26,0.2) 50%, transparent 80%)' }}
          />

          {/* Linhas diagonais de impacto */}
          <motion.svg
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.5, 2, 2.5] }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 400"
          >
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i / 16) * 360
              return (
                <line
                  key={i}
                  x1="200" y1="200"
                  x2={200 + 300 * Math.cos(angle * Math.PI / 180)}
                  y2={200 + 300 * Math.sin(angle * Math.PI / 180)}
                  stroke="#00FF88"
                  strokeWidth="3"
                  opacity="0.7"
                />
              )
            })}
          </motion.svg>

          {/* ALL CAPS overlay — texto-soco (Mundo B) */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 20 }}
            animate={{ scale: [0.3, 1.15, 1], opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
            transition={{ duration: 1.8, times: [0, 0.25, 0.75, 1], ease: 'easeOut' }}
            className="relative z-10 text-center"
          >
            <p
              translate="no"
              className="font-display font-black italic tracking-tighter leading-none"
              style={{
                fontSize: 'clamp(48px, 10vw, 96px)',
                background: 'linear-gradient(135deg, #00FF88 0%, #FFD700 50%, #FF6B1A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(0,255,136,0.6))',
              }}
            >
              {line}
            </p>
            {value > 0 && (
              <p className="mt-2 font-mono-stonks font-bold text-money text-2xl tabular-nums"
                translate="no"
                style={{ textShadow: '0 0 16px rgba(0,255,136,0.8)' }}>
                +{value.toFixed(0)} COTAS
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

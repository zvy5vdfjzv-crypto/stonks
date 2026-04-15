// 🧠 NEUROMARKETING: Chuva de moedas — recompensa visual dopaminergica.
// Efeito de "jackpot" que reforça comportamento de venda com lucro.
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const COINS = ['🪙', '💰', '💎', '✨', '🤑', '💵']

function Particle({ emoji, delay, x }) {
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, scale: 0 }}
      animate={{
        y: window.innerHeight + 50,
        x: x + (Math.random() - 0.5) * 100,
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.8],
        rotate: Math.random() * 720 - 360,
      }}
      transition={{ duration: 1.8 + Math.random() * 0.8, delay, ease: 'easeIn' }}
      className="fixed top-0 text-2xl pointer-events-none z-[9999]"
    >
      {emoji}
    </motion.div>
  )
}

export default function CoinRain({ active, onDone }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!active) { setParticles([]); return }
    const w = window.innerWidth
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      emoji: COINS[Math.floor(Math.random() * COINS.length)],
      delay: Math.random() * 0.6,
      x: Math.random() * w,
    }))
    setParticles(newParticles)
    const timer = setTimeout(() => { setParticles([]); onDone?.() }, 2800)
    return () => clearTimeout(timer)
  }, [active, onDone])

  return (
    <AnimatePresence>
      {particles.map(p => (
        <Particle key={p.id} emoji={p.emoji} delay={p.delay} x={p.x} />
      ))}
    </AnimatePresence>
  )
}

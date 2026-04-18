// 🧠 FASE 4 — Momento dopaminergico: moedas voando.
// Quando o user BANCA, moedas emergem do ponto de click e voam em direcao ao wallet (header).
// Sensacao tatil de "dinheiro movendo". Briefing 4.4.
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

const COIN_GLYPHS = ['🪙', '💰', '💵', '🤑']

// Posicao aproximada do wallet no header — usado como target padrao
function getWalletTargetPosition() {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  // Procura o elemento do wallet (ele tem data-wallet-hero)
  const el = document.querySelector('[data-wallet-hero]')
  if (el) {
    const rect = el.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }
  // Fallback: topo-centro
  return { x: window.innerWidth / 2, y: 32 }
}

function Coin({ startX, startY, endX, endY, delay, glyph }) {
  // Trajetoria arc — sobe e cai em direcao ao target
  const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 80
  const midY = Math.min(startY, endY) - 60 - Math.random() * 40

  return (
    <motion.div
      initial={{ x: startX, y: startY, scale: 0, opacity: 0 }}
      animate={{
        x: [startX, midX, endX],
        y: [startY, midY, endY],
        scale: [0, 1.1, 0.6],
        opacity: [0, 1, 0],
        rotate: Math.random() * 540 - 270,
      }}
      transition={{ duration: 0.9, delay, ease: [0.4, 0, 0.6, 1], times: [0, 0.4, 1] }}
      className="fixed text-xl pointer-events-none z-[9999]"
      style={{ left: 0, top: 0 }}
    >
      {glyph}
    </motion.div>
  )
}

export default function FlyingCoins({ origin, count = 6, onDone }) {
  const [coins, setCoins] = useState([])
  const idRef = useRef(0)

  useEffect(() => {
    if (!origin) return
    const target = getWalletTargetPosition()
    const newCoins = Array.from({ length: count }, (_, i) => ({
      id: ++idRef.current,
      startX: origin.x + (Math.random() - 0.5) * 20,
      startY: origin.y + (Math.random() - 0.5) * 20,
      endX: target.x + (Math.random() - 0.5) * 16,
      endY: target.y + (Math.random() - 0.5) * 16,
      delay: i * 0.06,
      glyph: COIN_GLYPHS[Math.floor(Math.random() * COIN_GLYPHS.length)],
    }))
    setCoins(newCoins)
    const timer = setTimeout(() => { setCoins([]); onDone?.() }, 1400)
    return () => clearTimeout(timer)
  }, [origin, count, onDone])

  return (
    <AnimatePresence>
      {coins.map(c => (
        <Coin key={c.id} {...c} />
      ))}
    </AnimatePresence>
  )
}

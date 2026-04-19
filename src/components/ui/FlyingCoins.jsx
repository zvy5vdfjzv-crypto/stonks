// 🧠 FlyingCoins — briefing 4.4: moedas saindo DA CARTEIRA → pro item.
// Semantica correta: voce ve o dinheiro fisicamente saindo do cofre pra
// "comprar" o meme. Origem = wallet (data-wallet-hero no Header).
// Destino = ponto de click (o botao Bancar que o user apertou).
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

const COIN_GLYPHS = ['🪙', '💰', '💵', '🤑']

function getWalletOrigin() {
  if (typeof window === 'undefined') return { x: 0, y: 32 }
  const el = document.querySelector('[data-wallet-hero]')
  if (el) {
    const rect = el.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.bottom - 6 }
  }
  return { x: window.innerWidth / 2, y: 32 }
}

function Coin({ startX, startY, endX, endY, delay, glyph }) {
  // Arc trajectory: sobe + cai em parabola pro destino
  const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 60
  const midY = Math.min(startY, endY) - 80 - Math.random() * 40

  return (
    <motion.div
      initial={{ x: startX, y: startY, scale: 0, opacity: 0 }}
      animate={{
        x: [startX, midX, endX],
        y: [startY, midY, endY],
        scale: [0, 1.15, 0.7],
        opacity: [0, 1, 0],
        rotate: Math.random() * 540 - 270,
      }}
      transition={{ duration: 0.95, delay, ease: [0.4, 0, 0.6, 1], times: [0, 0.45, 1] }}
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
    // `origin` aqui e o TARGET (ponto de click/item) — nome legacy mantido
    // pra nao quebrar callers existentes. Fisicamente: saida = wallet.
    if (!origin) return
    const walletPos = getWalletOrigin()
    const target = origin
    const newCoins = Array.from({ length: count }, (_, i) => ({
      id: ++idRef.current,
      startX: walletPos.x + (Math.random() - 0.5) * 16,
      startY: walletPos.y + (Math.random() - 0.5) * 8,
      endX: target.x + (Math.random() - 0.5) * 24,
      endY: target.y + (Math.random() - 0.5) * 24,
      delay: i * 0.05,
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

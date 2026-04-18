// 🧠 FASE 4 — Ritual de abertura de caixa misteriosa.
// Briefing 4.6: "Momento dopaminergico maximo. Precisa ser um ritual."
// Tela cheia → suspense → reveal → celebrar (cada fase com animacao propria).
// Raridade define intensidade do reveal (lendario = slow-mo + luz + particulas).
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { RARITY } from '../../lib/design-tokens'
import { sound } from '../../lib/sound'
import { haptics } from '../../lib/haptics'

const RARITY_BG_GRADIENT = {
  common: 'from-gray-800 via-gray-900 to-black',
  rare: 'from-blue-900 via-blue-950 to-black',
  epic: 'from-purple-900 via-purple-950 to-black',
  legendary: 'from-yellow-900 via-amber-950 to-black',
  mythic: 'from-pink-900 via-rose-950 to-black',
}

const RARITY_LABEL = {
  common: 'COMUM',
  rare: 'RARO',
  epic: 'EPICO',
  legendary: 'LENDARIO',
  mythic: 'MITICO',
}

// Explosao de particulas no reveal — mais e maior pra rarer
function Particles({ rarity }) {
  const count = rarity === 'legendary' ? 40 : rarity === 'mythic' ? 60 : rarity === 'epic' ? 24 : 12
  const color = RARITY[rarity]?.color || '#8888a0'
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3
        const distance = 150 + Math.random() * 250
        const delay = Math.random() * 0.3
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: [0, 1.2, 0.4],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1.8, delay, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full pointer-events-none"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
        )
      })}
    </>
  )
}

export default function LootboxReveal({ isOpen, phase, box, result, onClose, onSkip }) {
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    if (phase === 'spinning') {
      // 🎵 Swoosh de abertura + haptic anticipation
      sound.swoosh()
      haptics.fire('anticipation')
      const t = setTimeout(() => setCanSkip(true), 600)
      return () => clearTimeout(t)
    }
    setCanSkip(false)
  }, [phase])

  // 🎵 Reveal: ding pra rarezas baixas, fanfare pra lendary/mythic
  useEffect(() => {
    if (phase === 'reveal' && result) {
      const r = result.rarity
      if (r === 'legendary' || r === 'mythic') {
        sound.fanfare()
        haptics.fire('jackpot')
      } else if (r === 'epic') {
        sound.gain()
        haptics.fire('success')
      } else {
        sound.ding('market')
        haptics.fire('medium')
      }
    }
  }, [phase, result])

  const rarity = result?.rarity || 'common'
  const bgGradient = RARITY_BG_GRADIENT[rarity]
  const rarityInfo = RARITY[rarity]
  const isHighRarity = rarity === 'legendary' || rarity === 'mythic'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center"
        >
          {/* Background */}
          <motion.div
            className={`absolute inset-0 transition-all ${phase === 'reveal' ? `bg-gradient-to-b ${bgGradient}` : 'bg-black/95'} backdrop-blur-xl`}
          />

          {/* Close/Skip (aparece depois de 600ms) */}
          {canSkip && phase !== 'reveal' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onSkip}
              className="absolute top-6 right-6 z-10 text-white/60 hover:text-white text-xs font-mono-stonks uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/50 bg-black/40 cursor-pointer"
            >
              Pular <X size={12} />
            </motion.button>
          )}

          {/* Conteudo central */}
          <div className="relative flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {/* FASE 1: suspense — caixa tremendo */}
              {phase === 'spinning' && box && (
                <motion.div
                  key="suspense"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{
                      x: [0, -3, 3, -3, 3, 0],
                      scale: [1, 1.05, 1, 1.08, 1],
                      rotate: [0, -2, 2, -1, 1, 0],
                    }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
                    className="text-[160px] drop-shadow-[0_0_40px_rgba(255,184,0,0.6)]"
                  >
                    {box.emoji}
                  </motion.div>
                  <motion.p
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="text-white/70 font-mono-stonks text-sm mt-6 uppercase tracking-widest"
                  >
                    Abrindo {box.name}...
                  </motion.p>
                </motion.div>
              )}

              {/* FASE 2: reveal — luz, particulas, item */}
              {phase === 'reveal' && result && (
                <motion.div
                  key="reveal"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: isHighRarity ? 150 : 300,
                    damping: isHighRarity ? 18 : 22,
                    // Lendario/Mitico = slow motion
                    duration: isHighRarity ? 1.2 : 0.5,
                  }}
                  className="relative flex flex-col items-center"
                >
                  {/* Flash central */}
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 8, opacity: 0 }}
                    transition={{ duration: 0.9 }}
                    className="absolute w-32 h-32 rounded-full"
                    style={{ background: `radial-gradient(circle, ${rarityInfo?.color}dd, transparent 70%)` }}
                  />

                  {/* Particulas explodindo do centro */}
                  <Particles rarity={rarity} />

                  {/* Item emoji */}
                  <motion.div
                    animate={isHighRarity ? {
                      y: [0, -8, 0],
                      rotate: [0, -3, 3, 0],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-[140px] relative z-10"
                    style={isHighRarity ? { filter: `drop-shadow(0 0 30px ${rarityInfo?.color})` } : {}}
                  >
                    {result.emoji}
                  </motion.div>

                  {/* Raridade label */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 px-4 py-1 rounded-lg border"
                    style={{
                      borderColor: rarityInfo?.color,
                      boxShadow: isHighRarity ? `0 0 24px ${rarityInfo?.glow}` : undefined,
                    }}
                  >
                    <span
                      className="font-mono-stonks font-bold text-lg tracking-[0.3em]"
                      style={{ color: rarityInfo?.color }}
                    >
                      {RARITY_LABEL[rarity]}
                    </span>
                  </motion.div>

                  {/* Item name */}
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white font-display text-2xl font-bold mt-3"
                  >
                    {result.name}
                  </motion.p>

                  {/* Botao */}
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={onClose}
                    className="mt-8 bg-money text-[#0a0a0f] font-mono-stonks font-bold uppercase tracking-wider text-sm px-6 py-3 rounded-lg glow-money cursor-pointer hover:bg-money-dim"
                  >
                    {isHighRarity ? 'Epico demais!' : 'Continuar'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

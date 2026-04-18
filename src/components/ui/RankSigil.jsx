// 🏰 FASE 7 — Sigil RPG/Warcraft pros titulos de ranking.
// Container circular ornado com cor por tier + raios + pulse nos tiers altos.
import { motion } from 'framer-motion'

// Tier → cores do sigil (briefing: shan especial, RPG titulos)
const TIER_STYLES = [
  // Tier 0 (Novato): bronze opaco
  { ring: '#5a4a3a', inner: '#3a2e22', glow: null, rays: 0 },
  // Tier 1 (Observador): prata
  { ring: '#9ca3af', inner: '#4b5563', glow: null, rays: 0 },
  // Tier 2 (Trend Spotter): azul elite
  { ring: '#3b82f6', inner: '#1e3a8a', glow: '#3b82f655', rays: 4 },
  // Tier 3 (Hype Builder): roxo arcano
  { ring: '#a855f7', inner: '#581c87', glow: '#a855f777', rays: 6 },
  // Tier 4 (Meme Lord): rosa real
  { ring: '#ec4899', inner: '#831843', glow: '#ec489988', rays: 8 },
  // Tier 5 (Oraculo): esmeralda mistica
  { ring: '#10b981', inner: '#064e3b', glow: '#10b98199', rays: 10 },
  // Tier 6 (Warren Buffett dos Memes): dourado lendario
  { ring: '#fbbf24', inner: '#78350f', glow: '#fbbf24cc', rays: 12 },
]

export default function RankSigil({ tier = 0, badge, size = 40, animated = true }) {
  const style = TIER_STYLES[Math.min(tier, TIER_STYLES.length - 1)] || TIER_STYLES[0]
  const hasRays = style.rays > 0
  const isLegendary = tier >= 6

  return (
    <motion.span
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      whileHover={animated ? { scale: 1.1, rotate: 5 } : {}}
    >
      <svg width={size} height={size} viewBox="0 0 48 48" className="absolute inset-0">
        <defs>
          <radialGradient id={`sg-inner-${tier}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={style.inner} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
          </radialGradient>
          <linearGradient id={`sg-ring-${tier}`} x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor={style.ring} />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="100%" stopColor={style.ring} />
          </linearGradient>
        </defs>

        {/* Rays (tiers 2+) */}
        {hasRays && Array.from({ length: style.rays }).map((_, i) => {
          const angle = (i / style.rays) * 360
          return (
            <g key={i} transform={`rotate(${angle} 24 24)`}>
              <polygon
                points="24,0 25.5,6 22.5,6"
                fill={style.ring}
                opacity="0.6"
              />
            </g>
          )
        })}

        {/* Outer ring — anel principal */}
        <circle cx="24" cy="24" r="20" fill="none" stroke={`url(#sg-ring-${tier})`} strokeWidth="2.5" />
        {/* Inner circle — fundo gemado */}
        <circle cx="24" cy="24" r="17" fill={`url(#sg-inner-${tier})`} />
        {/* Filigrana superior (pequenos ornamentos) */}
        {isLegendary && (
          <>
            <circle cx="24" cy="5" r="1.5" fill={style.ring} />
            <circle cx="24" cy="43" r="1.5" fill={style.ring} />
            <circle cx="5" cy="24" r="1.5" fill={style.ring} />
            <circle cx="43" cy="24" r="1.5" fill={style.ring} />
          </>
        )}
      </svg>

      {/* Badge emoji centro */}
      <span className="relative z-10" style={{ fontSize: size * 0.45, filter: isLegendary ? 'drop-shadow(0 0 4px #fbbf24)' : undefined }}>
        {badge}
      </span>

      {/* Glow pulse nos tiers altos */}
      {style.glow && animated && (
        <motion.span
          className="absolute inset-[-4px] rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 16px ${style.glow}, 0 0 32px ${style.glow}` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Conic rotation pro tier top (Warren Buffett) */}
      {isLegendary && animated && (
        <motion.span
          className="absolute inset-[-3px] rounded-full pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(251,191,36,0.4), transparent, rgba(251,191,36,0.4), transparent)',
            mixBlendMode: 'screen',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.span>
  )
}

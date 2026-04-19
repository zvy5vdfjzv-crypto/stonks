// 🏰 Sigil RPG/Warcraft pros titulos de ranking.
// CUSTOM SVG paths (briefing 9: "nao usar Lucide sem customizacao" nos icones principais).
// Cada tier tem um glyph heraldico desenhado — nao e icon stock.
import { motion } from 'framer-motion'

// SVG paths proprios pra cada tier (escala: viewBox 24x24, centralizada)
// Desenhados pra leitura em 16-32px, nao paths complexos.
const TIER_GLYPHS = [
  // Tier 0 — Iniciado: broto simples emergindo
  <g key="g">
    <path d="M12 20 L12 10 M12 10 Q8 7 6 9 Q8 12 12 10 M12 10 Q16 7 18 9 Q16 12 12 10" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </g>,
  // Tier 1 — Vigilante: chave esqueleto
  <g key="g">
    <circle cx="8" cy="8" r="4" fill="none" strokeWidth="2" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <path d="M11.5 9.5 L19 17 M17 17 L19 15 M14 17 L16 15" fill="none" strokeWidth="2" strokeLinecap="round" />
  </g>,
  // Tier 2 — Sentinela: escudo heraldico com cruz
  <g key="g">
    <path d="M12 3 L4 6 L4 12 Q4 17 12 21 Q20 17 20 12 L20 6 Z" fill="none" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 7 L12 17 M8 12 L16 12" strokeWidth="1.8" strokeLinecap="round" />
  </g>,
  // Tier 3 — Arauto Arcano: chama estilizada
  <g key="g">
    <path d="M12 3 Q9 7 10 10 Q7 9 7 13 Q7 17 12 21 Q17 17 17 13 Q17 9 14 10 Q15 7 12 3 Z" fill="currentColor" opacity="0.25" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 10 Q10 12 11 15 Q13 16 13 14 Q13 12 12 10 Z" fill="currentColor" opacity="0.6" />
  </g>,
  // Tier 4 — Lorde dos Memes: coroa com gemas
  <g key="g">
    <path d="M3 16 L5 7 L9 11 L12 5 L15 11 L19 7 L21 16 Z" fill="none" strokeWidth="2" strokeLinejoin="round" />
    <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="7" cy="13" r="0.7" fill="currentColor" />
    <circle cx="17" cy="13" r="0.7" fill="currentColor" />
  </g>,
  // Tier 5 — Oraculo Viral: olho que tudo ve com iris
  <g key="g">
    <path d="M2 12 Q7 5 12 5 Q17 5 22 12 Q17 19 12 19 Q7 19 2 12 Z" fill="none" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" opacity="0.3" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="13" cy="11" r="0.6" fill="#fff" />
  </g>,
  // Tier 6 — Arquiduque: diamante cravejado com facetas
  <g key="g">
    <path d="M12 2 L22 9 L12 22 L2 9 Z" fill="none" strokeWidth="2" strokeLinejoin="round" />
    <path d="M2 9 L22 9 M12 2 L12 22 M7 9 L12 14 L17 9" strokeWidth="1.3" opacity="0.7" />
    <circle cx="12" cy="6" r="0.9" fill="currentColor" />
  </g>,
]

const TIER_STYLES = [
  { ring: '#5a4a3a', inner: '#3a2e22', glow: null, rays: 0 },
  { ring: '#9ca3af', inner: '#4b5563', glow: null, rays: 0 },
  { ring: '#3b82f6', inner: '#1e3a8a', glow: '#3b82f655', rays: 4 },
  { ring: '#ff6b1a', inner: '#7c2d12', glow: '#ff6b1a77', rays: 6 },
  { ring: '#ec4899', inner: '#831843', glow: '#ec489988', rays: 8 },
  { ring: '#10b981', inner: '#064e3b', glow: '#10b98199', rays: 10 },
  { ring: '#fbbf24', inner: '#78350f', glow: '#fbbf24cc', rays: 12 },
]

export default function RankSigil({ tier = 0, badge, size = 40, animated = true }) {
  const style = TIER_STYLES[Math.min(tier, TIER_STYLES.length - 1)] || TIER_STYLES[0]
  const hasRays = style.rays > 0
  const isLegendary = tier >= 6
  const glyph = TIER_GLYPHS[Math.min(tier, TIER_GLYPHS.length - 1)] || TIER_GLYPHS[0]
  const glyphColor = isLegendary ? '#fef3c7' : '#ffffff'
  const glyphFilter = isLegendary
    ? `drop-shadow(0 0 6px ${style.ring})`
    : style.glow ? `drop-shadow(0 0 3px ${style.ring})` : undefined

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

        {hasRays && Array.from({ length: style.rays }).map((_, i) => {
          const angle = (i / style.rays) * 360
          return (
            <g key={i} transform={`rotate(${angle} 24 24)`}>
              <polygon points="24,0 25.5,6 22.5,6" fill={style.ring} opacity="0.6" />
            </g>
          )
        })}

        <circle cx="24" cy="24" r="20" fill="none" stroke={`url(#sg-ring-${tier})`} strokeWidth="2.5" />
        <circle cx="24" cy="24" r="17" fill={`url(#sg-inner-${tier})`} />
        {isLegendary && (
          <>
            <circle cx="24" cy="5" r="1.5" fill={style.ring} />
            <circle cx="24" cy="43" r="1.5" fill={style.ring} />
            <circle cx="5" cy="24" r="1.5" fill={style.ring} />
            <circle cx="43" cy="24" r="1.5" fill={style.ring} />
          </>
        )}
      </svg>

      {/* 🗡️ Glyph heraldico CUSTOM (nao Lucide) — desenhado pra cada tier */}
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        className="relative z-10"
        style={{ color: glyphColor, filter: glyphFilter, stroke: glyphColor }}
      >
        {glyph}
      </svg>

      {style.glow && animated && (
        <motion.span
          className="absolute inset-[-4px] rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 16px ${style.glow}, 0 0 32px ${style.glow}` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

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

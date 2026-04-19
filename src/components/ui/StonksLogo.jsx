// 🔥 STONKS LOGO — rebranding Gen Z
// Icone: triangulo de chart subindo em gradient money→hype, com risco interno
// de candlestick e halo sutil. Wordmark em Space Grotesk black italic.
// Bounce breathing sutil pra parecer vivo.
import { motion } from 'framer-motion'

export default function StonksLogo({ size = 32, showWordmark = true, wordmarkClassName = '', animated = true, href }) {
  const iconSize = size
  const wordSize = size * 0.9

  const icon = (
    <motion.div
      animate={animated ? { y: [0, -1.5, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="relative shrink-0"
      style={{ width: iconSize, height: iconSize }}
    >
      {/* Halo pulse atras */}
      {animated && (
        <motion.span
          className="absolute inset-[-25%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.22), transparent 65%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} className="relative">
        <defs>
          <linearGradient id="stonks-logo-grad" x1="0" y1="48" x2="48" y2="0">
            <stop offset="0%" stopColor="#00FF88" />
            <stop offset="55%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF6B1A" />
          </linearGradient>
          <linearGradient id="stonks-logo-shine" x1="24" y1="0" x2="8" y2="20">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Triangulo principal — chart peak */}
        <polygon
          points="24,4 44,40 4,40"
          fill="url(#stonks-logo-grad)"
        />
        {/* Shine highlight */}
        <polygon
          points="24,4 44,40 4,40"
          fill="url(#stonks-logo-shine)"
        />

        {/* Candlestick bars dentro — tres niveis subindo */}
        <rect x="13" y="30" width="4" height="6" fill="#0a0a0f" opacity="0.75" rx="0.5" />
        <rect x="22" y="24" width="4" height="12" fill="#0a0a0f" opacity="0.75" rx="0.5" />
        <rect x="31" y="18" width="4" height="18" fill="#0a0a0f" opacity="0.75" rx="0.5" />

        {/* Linha do chart ligando os topos */}
        <path
          d="M15,30 L24,24 L33,18 L37,14"
          stroke="#0a0a0f"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* Seta up no topo */}
        <polygon points="37,14 40,14 37,11" fill="#0a0a0f" opacity="0.9" />
      </svg>
    </motion.div>
  )

  const wordmark = showWordmark ? (
    <span
      translate="no"
      className={`font-display font-black italic tracking-tight leading-none ${wordmarkClassName}`}
      style={{ fontSize: wordSize }}
    >
      <span className="text-text-primary">STO</span>
      <span className="text-money">N</span>
      <span className="text-hype">K</span>
      <span className="text-text-primary">S</span>
    </span>
  ) : null

  const content = (
    <span className="inline-flex items-center gap-2">
      {icon}
      {wordmark}
    </span>
  )

  return href ? <a href={href} className="no-underline">{content}</a> : content
}

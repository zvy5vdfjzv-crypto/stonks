// 🔥 STONKS LOGO — Rebranding v2
// Diamante cravejado (diamond hands / WSB culture) com $ interno bold.
// Shape rotated 45deg = gema + candle subindo dupla leitura.
// Gradient money→hype. Facet lines internas dao profundidade.
// Wordmark em Space Grotesk black italic com N verde e K laranja.
import { motion } from 'framer-motion'

export default function StonksLogo({ size = 32, showWordmark = true, wordmarkClassName = '', animated = true, href }) {
  const iconSize = size
  const wordSize = size * 0.92

  const icon = (
    <motion.div
      animate={animated ? { rotate: [0, -2, 2, -1, 0], y: [0, -1.5, 0] } : {}}
      transition={{
        rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="relative shrink-0"
      style={{ width: iconSize, height: iconSize }}
    >
      {/* Glow radial atras */}
      {animated && (
        <motion.span
          className="absolute inset-[-30%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.25), rgba(255,107,26,0.1) 50%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <svg viewBox="0 0 64 64" width={iconSize} height={iconSize} className="relative">
        <defs>
          <linearGradient id="stonks-diamond-face" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="#00FF88" />
            <stop offset="45%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF6B1A" />
          </linearGradient>
          <linearGradient id="stonks-diamond-shine" x1="32" y1="4" x2="20" y2="32">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stonks-diamond-shadow" x1="32" y1="60" x2="44" y2="32">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer diamond shape (rotated square with facets) */}
        <path d="M32 2 L62 32 L32 62 L2 32 Z" fill="url(#stonks-diamond-face)" />

        {/* Shine highlight top-left facet */}
        <path d="M32 2 L62 32 L32 62 L2 32 Z" fill="url(#stonks-diamond-shine)" />
        {/* Shadow bottom-right */}
        <path d="M32 2 L62 32 L32 62 L2 32 Z" fill="url(#stonks-diamond-shadow)" />

        {/* Facet lines (cortes da gema) */}
        <path d="M32 2 L32 62 M2 32 L62 32" stroke="#0a0a0f" strokeWidth="0.8" opacity="0.25" />
        <path d="M2 32 L32 2 L62 32" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />

        {/* $ bold central (glyph custom, nao texto — garante render consistente) */}
        <g transform="translate(32, 32)">
          {/* S shape */}
          <path
            d="M -7 -11 Q -12 -11 -12 -6 Q -12 -1 -4 -1 L 4 -1 Q 12 -1 12 6 Q 12 11 7 11 L -5 11 Q -10 11 -10 6"
            fill="none"
            stroke="#0a0a0f"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Vertical dollar bar */}
          <line x1="0" y1="-16" x2="0" y2="16" stroke="#0a0a0f" strokeWidth="2.8" strokeLinecap="round" />
        </g>

        {/* Pequenos pontos-gema nos vertices */}
        <circle cx="32" cy="3" r="1.5" fill="#ffffff" opacity="0.9" />
        <circle cx="61" cy="32" r="1.2" fill="#ffffff" opacity="0.6" />
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

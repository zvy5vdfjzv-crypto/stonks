import { motion } from 'framer-motion'
import { VERIFICATION_TYPES } from '../../context/UserContext'

export default function VerifiedBadge({ type, size = 16 }) {
  if (!type) return null
  const info = VERIFICATION_TYPES[type]
  if (!info) return null

  const s = size
  const inner = s * 0.45

  // Gradient pairs for each type
  const gradients = {
    blue: { from: '#4A9EFF', to: '#0066FF', glow: '#4A9EFF', shine: '#89C4FF' },
    yellow: { from: '#FFD700', to: '#FF9500', glow: '#FFD700', shine: '#FFF4B8' },
    black: { from: '#555555', to: '#111111', glow: '#888888', shine: '#CCCCCC' },
    stonks: { from: '#9B6DFF', to: '#6C3CE7', glow: '#9B6DFF', shine: '#D4BFFF' },
  }

  const g = gradients[type] || gradients.blue
  const uid = `vb-${type}-${Math.random().toString(36).slice(2, 6)}`

  return (
    <motion.span
      className="inline-flex items-center justify-center shrink-0 ml-0.5 relative"
      style={{ width: s, height: s }}
      title={info.label}
      initial={false}
      whileHover={{ scale: 1.2 }}
    >
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Main gradient */}
          <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor={g.from} />
            <stop offset="100%" stopColor={g.to} />
          </linearGradient>
          {/* Shine sweep */}
          <linearGradient id={`${uid}-shine`} x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor={g.shine} stopOpacity="0" />
            <stop offset="40%" stopColor={g.shine} stopOpacity="0.6" />
            <stop offset="60%" stopColor={g.shine} stopOpacity="0" />
          </linearGradient>
          {/* Glow filter */}
          <filter id={`${uid}-glow`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow */}
        <circle cx="12" cy="12" r="10" fill={g.glow} opacity="0.15" filter={`url(#${uid}-glow)`} />

        {/* Badge shape - hexagonal star */}
        <path
          d="M12 1.5L14.5 7.2L20.7 8L16.35 12.2L17.4 18.4L12 15.6L6.6 18.4L7.65 12.2L3.3 8L9.5 7.2L12 1.5Z"
          fill={`url(#${uid}-grad)`}
          stroke={g.from}
          strokeWidth="0.3"
        />

        {/* Shine overlay */}
        <path
          d="M12 1.5L14.5 7.2L20.7 8L16.35 12.2L17.4 18.4L12 15.6L6.6 18.4L7.65 12.2L3.3 8L9.5 7.2L12 1.5Z"
          fill={`url(#${uid}-shine)`}
        />

        {/* Inner shape */}
        <circle cx="12" cy="10.5" r="4" fill={g.to} opacity="0.3" />

        {/* Check mark or star */}
        {type === 'stonks' ? (
          <text x="12" y="12.5" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" dominantBaseline="central">★</text>
        ) : (
          <path d="M8.5 10.5L11 13L15.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        )}
      </svg>

      {/* Animated shimmer */}
      <motion.span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 30%, ${g.shine}40, transparent 60%)` }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />
    </motion.span>
  )
}

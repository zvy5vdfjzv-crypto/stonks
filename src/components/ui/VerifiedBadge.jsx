import { motion } from 'framer-motion'
import { VERIFICATION_TYPES } from '../../context/UserContext'

export default function VerifiedBadge({ type, secondary, size = 16 }) {
  if (!type) return null
  const info = VERIFICATION_TYPES[type]
  if (!info) return null

  return (
    <span className="inline-flex items-center shrink-0 ml-0.5 gap-0.5">
      <Badge type={type} size={size} />
      {secondary && <Badge type={secondary} size={Math.round(size * 0.85)} />}
    </span>
  )
}

function Badge({ type, size }) {
  if (type === 'stonks') return <StonksBadge size={size} />
  if (type === 'blue') return <BlueBadge size={size} />
  if (type === 'yellow') return <GoldBadge size={size} />
  if (type === 'black') return <BlackBadge size={size} />
  return null
}

// 🏆 STONKS owner badge — DOPAMINERGICO LVL MAX
// Estrela dupla + rays pulsantes + conic rotation + shine travel + hue shift
function StonksBadge({ size }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center shrink-0 relative"
      style={{ width: size * 1.15, height: size * 1.15 }}
      title="STONKS Official — Admin"
      whileHover={{ scale: 1.4, rotate: 20 }}
      animate={{ rotate: [0, -2, 2, 0] }}
      transition={{ rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
    >
      {/* Rays explodindo atras da estrela */}
      <motion.span
        className="absolute inset-[-40%] pointer-events-none"
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="100%" height="100%" viewBox="0 0 48 48" className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360
            return (
              <g key={i} transform={`rotate(${angle} 24 24)`}>
                <polygon points="24,0 25.5,4 22.5,4" fill="#C084FC" opacity="0.9" />
              </g>
            )
          })}
        </svg>
      </motion.span>

      {/* Conic gradient rotation (trail) */}
      <motion.span
        className="absolute inset-[-8%] pointer-events-none rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent, #C084FC, transparent, #00FF88, transparent, #FF6B1A, transparent, #C084FC, transparent)',
          mixBlendMode: 'screen',
          opacity: 0.55,
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      />

      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="relative z-10">
        <defs>
          <linearGradient id="sg1" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#F5D0FE" />
            <stop offset="40%" stopColor="#C084FC" />
            <stop offset="75%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="sg2" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="sg-glow">
            <feGaussianBlur stdDeviation="0.8" result="b" />
            <feComposite in="SourceGraphic" in2="b" operator="over" />
          </filter>
        </defs>

        {/* Outer ring */}
        <circle cx="12" cy="12" r="11.5" stroke="#C084FC" strokeWidth="0.6" fill="none" opacity="0.6" />

        {/* Second star (rotated) — cria efeito de "flor" */}
        <polygon points="12,1 15,8 23,8 17,13 19,21 12,16 5,21 7,13 1,8 9,8"
          fill="#4C1D95" opacity="0.5" transform="rotate(36 12 12)" />

        {/* Main star */}
        <polygon points="12,1 15,8 23,8 17,13 19,21 12,16 5,21 7,13 1,8 9,8" fill="url(#sg1)" filter="url(#sg-glow)" />

        {/* Shine overlay */}
        <polygon points="12,1 15,8 23,8 17,13 19,21 12,16 5,21 7,13 1,8 9,8" fill="url(#sg2)" />

        {/* S letter */}
        <text x="12" y="12.5" textAnchor="middle" fontSize="9" fill="white" fontWeight="900" dominantBaseline="central" fontFamily="system-ui">S</text>
      </svg>

      {/* Shine travel — pequeno brilho que passa pela estrela */}
      <motion.span
        className="absolute w-1.5 h-1.5 rounded-full bg-white pointer-events-none"
        style={{ top: '20%', left: '20%', boxShadow: '0 0 8px #fff' }}
        animate={{ x: [0, size * 0.5, 0], y: [0, size * 0.5, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
      />
    </motion.span>
  )
}

// Blue verified - crisp gradient circle
function BlueBadge({ size }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title="Verificado"
      whileHover={{ scale: 1.15 }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="bg1" x1="2" y1="2" x2="22" y2="22">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="url(#bg1)" />
        {/* Highlight */}
        <ellipse cx="9" cy="8" rx="5" ry="4" fill="white" opacity="0.12" />
        {/* Check */}
        <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.span>
  )
}

// Gold business - metallic star
function GoldBadge({ size }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title="Empresa Verificada"
      whileHover={{ scale: 1.15 }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="gg1" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="gg2" x1="0" y1="0" x2="20" y2="20">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#FEF3C7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="12,1.5 15,8 22,8.5 17,13 18.5,20.5 12,16.5 5.5,20.5 7,13 2,8.5 9,8" fill="url(#gg1)" />
        <polygon points="12,1.5 15,8 22,8.5 17,13 18.5,20.5 12,16.5 5.5,20.5 7,13 2,8.5 9,8" fill="url(#gg2)" />
        <path d="M7.5 11.5L10.5 14.5L16.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.span>
  )
}

// Black political - dark premium circle
function BlackBadge({ size }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title="Figura Publica"
      whileHover={{ scale: 1.15 }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="bkg1" x1="2" y1="2" x2="22" y2="22">
            <stop offset="0%" stopColor="#525252" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="url(#bkg1)" stroke="#404040" strokeWidth="0.8" />
        <ellipse cx="9" cy="8" rx="5" ry="4" fill="white" opacity="0.08" />
        <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.span>
  )
}

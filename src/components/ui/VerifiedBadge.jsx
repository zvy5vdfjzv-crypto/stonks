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

// STONKS owner badge - animated star with rotating glow
function StonksBadge({ size }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center shrink-0 relative"
      style={{ width: size, height: size }}
      title="STONKS Official"
      whileHover={{ scale: 1.3, rotate: 15 }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="sg1" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="sg2" x1="20" y1="0" x2="4" y2="20">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="sg">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feComposite in="SourceGraphic" in2="b" operator="over" />
          </filter>
        </defs>
        {/* Outer glow ring */}
        <circle cx="12" cy="12" r="11.5" stroke="#C084FC" strokeWidth="0.5" fill="none" opacity="0.4" />
        {/* Star shape */}
        <polygon points="12,1 15,8 23,8 17,13 19,21 12,16 5,21 7,13 1,8 9,8" fill="url(#sg1)" filter="url(#sg)" />
        {/* Shine overlay */}
        <polygon points="12,1 15,8 23,8 17,13 19,21 12,16 5,21 7,13 1,8 9,8" fill="url(#sg2)" />
        {/* S letter */}
        <text x="12" y="12.5" textAnchor="middle" fontSize="9" fill="white" fontWeight="900" dominantBaseline="central" fontFamily="system-ui">S</text>
      </svg>
      {/* Rotating conic gradient */}
      <motion.span
        className="absolute inset-[-2px] pointer-events-none rounded-full"
        style={{ background: 'conic-gradient(from 0deg, transparent, #C084FC30, transparent, #7C3AED30, transparent)', mixBlendMode: 'screen' }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
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

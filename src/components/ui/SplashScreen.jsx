// 🎬 SplashScreen cinematico — Instrument Serif italic + glass + BlurText
// Tom apple-fluid, fundo preto com gradient sutil money/hype.
import { motion } from 'framer-motion'
import StonksLogo from './StonksLogo'

export default function SplashScreen({ onDone }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onDone}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Gradient ambiente */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,255,136,0.08),transparent_60%),radial-gradient(circle_at_50%_80%,rgba(255,107,26,0.05),transparent_70%)]" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0, filter: 'blur(10px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Logo icon glass-wrapped */}
        <div className="liquid-glass-strong rounded-full w-24 h-24 flex items-center justify-center">
          <StonksLogo size={56} showWordmark={false} />
        </div>

        {/* Wordmark em Instrument Serif italic */}
        <motion.h1
          initial={{ y: 20, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="font-heading italic text-white text-6xl sm:text-7xl tracking-[-3px] leading-none"
          translate="no"
        >
          STONKS
        </motion.h1>

        {/* Tagline em Barlow light */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="font-body-alt font-light text-white/70 text-sm sm:text-base tracking-wide"
        >
          A bolsa dos virais
        </motion.p>

        {/* Loading bar liquid-glass */}
        <div className="liquid-glass rounded-full mt-4 w-[220px] h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.4, duration: 1.4, ease: 'easeInOut' }}
            onAnimationComplete={onDone}
            className="h-full bg-gradient-to-r from-money via-yellow to-hype rounded-full"
            style={{ boxShadow: '0 0 8px rgba(0,255,136,0.6)' }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

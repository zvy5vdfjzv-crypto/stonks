import { motion } from 'framer-motion'
import StonksLogo from './StonksLogo'

export default function SplashScreen({ onDone }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onAnimationComplete={onDone}
      className="fixed inset-0 z-50 bg-[var(--bg-app)] flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-money/8 via-transparent to-hype/5" />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        {/* 🔥 Logo icon grande */}
        <StonksLogo size={80} showWordmark={false} />

        {/* Wordmark */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <StonksLogo size={48} showWordmark animated={false} />
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-text-muted text-xs font-mono-stonks uppercase tracking-[0.4em]"
        >
          A Bolsa dos Virais
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.3, duration: 1.5, ease: 'easeInOut' }}
          onAnimationComplete={onDone}
          className="h-0.5 bg-money rounded-full mt-4 mx-auto max-w-[200px] w-full"
          style={{ boxShadow: '0 0 8px #00ff8888' }}
        />
      </motion.div>
    </motion.div>
  )
}

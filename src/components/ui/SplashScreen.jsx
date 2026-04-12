import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

export default function SplashScreen({ onDone }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onAnimationComplete={onDone}
      className="fixed inset-0 z-50 bg-[#0a0a0c] flex flex-col items-center justify-center"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-green/5" />

      {/* Logo animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: 2, duration: 0.4, delay: 0.5 }}
          className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 mx-auto glow-accent"
        >
          <TrendingUp className="text-accent" size={40} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-4xl font-bold text-center stonks-glow"
        >
          STON<span className="text-accent">KS</span>
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-text-muted text-sm text-center mt-2"
        >
          A Bolsa dos Virais
        </motion.p>

        {/* Loading bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.3, duration: 1.5, ease: 'easeInOut' }}
          onAnimationComplete={onDone}
          className="h-0.5 bg-accent rounded-full mt-8 mx-auto max-w-[200px]"
        />
      </motion.div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'

// 🧠 Cada variante tem um papel. `money` e o CTA critico do app ("BANCAR").
const variants = {
  primary: 'bg-accent hover:bg-accent-light text-white',
  green: 'bg-green hover:bg-green/80 text-white',
  red: 'bg-red hover:bg-red/80 text-white',
  // 🔥 Money — o botao mais satisfatorio do produto.
  // Verde money solido + mono ALL CAPS + glow na hover + border sutil.
  money: 'bg-money hover:bg-money-dim text-[#0a0a0f] font-display uppercase tracking-wider glow-money',
  hype: 'bg-hype hover:bg-hype-dim text-white font-display uppercase tracking-wider glow-hype',
  outline: 'bg-transparent border border-border text-text-primary hover:bg-surface-hover hover:border-accent/50',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover',
}

export default function Button({ children, variant = 'primary', className = '', disabled, haptic = false, onClick, ...props }) {
  const handleClick = (e) => {
    // Haptic leve em mobile quando pedido
    if (haptic && !disabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(variant === 'money' || variant === 'hype' ? [30] : [10])
    }
    onClick?.(e)
  }

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.96 }}
      whileHover={disabled ? {} : { scale: 1.01 }}
      onClick={handleClick}
      className={`
        font-semibold px-4 py-2.5 rounded-xl cursor-pointer
        transition-all duration-200 text-sm
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}

import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-accent hover:bg-accent-light text-white',
  green: 'bg-green hover:bg-green/80 text-white',
  red: 'bg-red hover:bg-red/80 text-white',
  outline: 'bg-transparent border border-border text-text-primary hover:bg-surface-hover hover:border-accent/50',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover',
}

export default function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
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

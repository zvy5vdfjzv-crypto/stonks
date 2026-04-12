import { motion } from 'framer-motion'

export default function Card({ children, className = '', onClick, ...props }) {
  return (
    <motion.div
      layout
      whileHover={onClick ? { scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={`
        bg-surface rounded-2xl border border-border p-4
        ${onClick ? 'cursor-pointer hover:border-accent/30 hover:bg-surface-hover' : ''}
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

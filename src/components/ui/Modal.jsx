// 🎬 Modal cinematico — liquid-glass + spring damped
// Backdrop com gradient + blur. Corpo glass-strong com glass border.
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const widthMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' }
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.92, y: 10, filter: 'blur(4px)' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={`liquid-glass-strong fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
              rounded-2xl p-6 w-[92vw] ${widthMap[size] || widthMap.md}
              bg-[var(--bg-elevated)]/85`}
          >
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading italic text-text-primary text-2xl tracking-[-1px] leading-none">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-text-primary transition-colors cursor-pointer
                    w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

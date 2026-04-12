import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useGame } from '../../context/GameContext'

export default function ToastContainer() {
  const { toasts, dismissToast } = useGame()

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 sm:bottom-6">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const isNews = toast.type === 'news'

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      className={`bg-surface border rounded-xl px-4 py-3 text-sm max-w-xs
        shadow-xl shadow-black/30 cursor-pointer
        ${isNews ? 'border-yellow/30 text-yellow' : 'border-green/30 text-green'}`}
      onClick={() => onDismiss(toast.id)}
    >
      {toast.message}
    </motion.div>
  )
}

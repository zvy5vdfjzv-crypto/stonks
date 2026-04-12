import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

export default function PushNotifications() {
  const { pushQueue, dismissPush, NOTIFICATION_TYPES } = useNotifications()

  return (
    <div className="fixed top-12 right-2 sm:top-4 sm:right-4 z-50 flex flex-col gap-2 w-72 sm:w-96 pointer-events-none">
      <AnimatePresence>
        {pushQueue.slice(0, 3).map(notif => (
          <PushItem key={notif.id} notif={notif} onDismiss={dismissPush} types={NOTIFICATION_TYPES} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function PushItem({ notif, onDismiss, types }) {
  const typeInfo = types[notif.type] || types.news

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notif.id), 5000)
    return () => clearTimeout(timer)
  }, [notif.id, onDismiss])

  return (
    <motion.div
      initial={{ x: 400, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 250 }}
      className={`pointer-events-auto bg-surface border rounded-2xl p-4 shadow-2xl shadow-black/50
        cursor-pointer backdrop-blur-xl ${typeInfo.bgColor}`}
      onClick={() => onDismiss(notif.id)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">{typeInfo.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${typeInfo.color}`}>{notif.title}</p>
          <p className="text-text-secondary text-xs mt-0.5 line-clamp-2">{notif.body}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(notif.id) }}
          className="text-text-muted hover:text-text-primary transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}

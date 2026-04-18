import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, CheckCheck, X } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, markRead, markAllRead, unreadCount, muted, toggleMute, NOTIFICATION_TYPES } = useNotifications()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            // 🧠 NEUROMARKETING: Glassmorphism no painel de notificacoes — visual premium
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 backdrop-blur-xl bg-surface/85 border border-border/50 rounded-2xl
              shadow-2xl shadow-black/50 overflow-hidden z-50 max-h-[70vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-accent" />
                <span className="font-bold text-text-primary text-sm">Notificacoes</span>
                {unreadCount > 0 && (
                  <span className="bg-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* 🎵 Mute toggle — muta push + som + haptic (unified sensory mute) */}
                <button
                  onClick={toggleMute}
                  title={muted ? 'Som, haptics e push silenciados. Clique para ativar.' : 'Som, haptics e push ativos.'}
                  className={`flex items-center gap-1 text-[10px] font-mono-stonks font-bold uppercase tracking-wider px-2 py-1 rounded-lg cursor-pointer transition-all
                    ${muted
                      ? 'bg-loss/10 text-loss border border-loss/30'
                      : 'bg-money/10 text-money border border-money/30'
                    }`}
                >
                  {muted ? <BellOff size={10} /> : <Bell size={10} />}
                  {muted ? 'Mudo' : 'Som'}
                </button>
                {unreadCount > 0 && (
                  <button onClick={markAllRead}
                    className="text-accent text-[10px] font-medium cursor-pointer hover:underline flex items-center gap-1">
                    <CheckCheck size={11} /> Ler tudo
                  </button>
                )}
                <button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Muted banner — sensory total */}
            {muted && (
              <div className="px-4 py-2 bg-loss/5 border-b border-loss/20 flex items-center gap-2">
                <BellOff size={12} className="text-loss" />
                <span className="text-loss text-[11px] font-mono-stonks">Som, haptics e push silenciados</span>
                <button onClick={toggleMute} className="ml-auto text-money text-[10px] font-mono-stonks font-bold uppercase tracking-wider cursor-pointer hover:text-money-dim">
                  Ativar
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell size={24} className="text-text-muted mx-auto mb-2" />
                  <p className="text-text-muted text-sm">Nenhuma notificacao</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const typeInfo = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.news
                  return (
                    <div
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-border/30 cursor-pointer
                        transition-colors hover:bg-surface-hover
                        ${!notif.read ? 'bg-accent/5' : ''}`}
                    >
                      <span className="text-lg shrink-0 mt-0.5">{typeInfo.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${!notif.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {notif.title}
                        </p>
                        <p className="text-text-muted text-[11px] mt-0.5 line-clamp-2">{notif.body}</p>
                        <p className="text-text-muted text-[9px] mt-1">{timeAgo(notif.time)}</p>
                      </div>
                      {!notif.read && <span className="w-2 h-2 bg-accent rounded-full shrink-0 mt-2" />}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

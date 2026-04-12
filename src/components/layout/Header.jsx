import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Wallet, Bell, Trophy, Crown, BarChart2, Settings, Pencil } from 'lucide-react'
import EditProfileModal from '../profile/EditProfileModal'
import NotificationPanel from '../notifications/NotificationPanel'
import { useNotifications } from '../../context/NotificationContext'
import { useLang } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { useUser } from '../../context/UserContext'
import { Link } from 'react-router-dom'
import UserAvatar from '../ui/UserAvatar'

export default function Header() {
  const { lang, toggleLang } = useLang()
  const { balance } = useGame()
  const { user, creatorTitle } = useUser()
  const { unreadCount } = useNotifications()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  return (
  <>
    <header className="sticky top-0 z-30 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-border/50 px-3 py-2 sm:px-4 sm:py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
            <TrendingUp className="text-accent" size={16} />
          </div>
          <span className="font-bold text-base text-text-primary tracking-tight">
            STON<span className="text-accent">KS</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <motion.div
            key={balance}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 bg-surface rounded-xl px-3 py-1.5 border border-border"
          >
            <Wallet size={13} className="text-green" />
            <span className="text-green font-semibold text-xs">S$</span>
            <span className="text-text-primary font-semibold text-xs">
              {balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </motion.div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false) }}
              className="bg-surface border border-border rounded-lg p-1.5 text-text-muted
                hover:text-text-primary hover:border-accent/50 transition-all cursor-pointer relative"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red text-white text-[8px] font-bold
                  rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          <button
            onClick={toggleLang}
            className="bg-surface border border-border rounded-lg px-2 py-1.5 text-[10px]
              font-semibold text-text-secondary hover:text-text-primary hover:border-accent/50
              transition-all cursor-pointer"
          >
            {lang === 'pt' ? '🇺🇸' : '🇧🇷'}
          </button>

          {/* Profile menu button */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-2 border-transparent
                hover:border-accent/50 transition-all"
            >
              <UserAvatar size={32} className="rounded-full" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl
                      shadow-xl shadow-black/40 overflow-hidden z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-text-primary text-sm">{user?.displayName}</p>
                      <p className="text-accent text-xs">{user?.handle}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm">{creatorTitle.badge}</span>
                        <span className={`text-[10px] font-semibold ${creatorTitle.color}`}>{creatorTitle.title}</span>
                      </div>
                    </div>

                    {/* Edit profile button */}
                    <div className="px-3 py-2 border-b border-border">
                      <button
                        onClick={() => { setMenuOpen(false); setEditOpen(true) }}
                        className="w-full flex items-center justify-center gap-1.5 bg-accent/15 text-accent
                          py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-accent/25 transition-colors"
                      >
                        <Pencil size={12} /> Editar Perfil
                      </button>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {[
                        { to: '/insights', icon: BarChart2, label: 'Meu Perfil & Insights' },
                        { to: '/creator-rank', icon: Crown, label: 'Ranking de Criadores' },
                        { to: '/leaderboard', icon: Trophy, label: 'Leaderboard Traders' },
                        { to: '/creators', icon: Settings, label: 'Canais' },
                      ].map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-text-secondary hover:text-text-primary
                            hover:bg-surface-hover transition-colors no-underline text-xs"
                        >
                          <item.icon size={14} />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>

    <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
  </>
  )
}

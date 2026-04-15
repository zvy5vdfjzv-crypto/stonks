import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Wallet, Bell, Trophy, Crown, BarChart2, Settings, Pencil, Plus, Menu, Search, TrendingUp, TrendingDown } from 'lucide-react'
import EditProfileModal from '../profile/EditProfileModal'
import VerifiedBadge from '../ui/VerifiedBadge'
import NotificationPanel from '../notifications/NotificationPanel'
import AnimatedNumber from '../ui/AnimatedNumber'
import { useNotifications } from '../../context/NotificationContext'
import { useLang } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { useUser } from '../../context/UserContext'
import { Link } from 'react-router-dom'
import UserAvatar from '../ui/UserAvatar'

export default function Header({ onCreateMeme, onOpenMenu }) {
  const { lang, toggleLang } = useLang()
  const { balance } = useGame()
  const { user, creatorTitle } = useUser()
  const { unreadCount } = useNotifications()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const prevBalanceRef = useRef(balance)
  const balanceDelta = balance - prevBalanceRef.current
  useEffect(() => { prevBalanceRef.current = balance }, [balance])

  return (
  <>
    <header className="sticky top-0 z-30 bg-[var(--bg-app)]/90 backdrop-blur-xl border-b border-border/50 px-3 py-2 sm:px-4 sm:py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onOpenMenu && (
            <button onClick={onOpenMenu}
              className="text-text-muted hover:text-text-primary cursor-pointer p-1 -ml-1">
              <Menu size={20} />
            </button>
          )}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
            <Zap className="text-accent" size={16} fill="currentColor" />
          </div>
          <span className="font-bold text-base text-text-primary tracking-tight">
            STON<span className="text-accent">KS</span>
          </span>
        </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Saldo com numeros rolantes + indicador de variacao */}
          <motion.div
            key="balance-pill"
            className="flex items-center gap-1.5 bg-surface rounded-xl px-3 py-1.5 border border-border"
          >
            <Wallet size={13} className="text-green" />
            <span className="text-green font-semibold text-xs">S$</span>
            <AnimatedNumber value={balance} className="text-text-primary font-semibold text-xs" />
            {balanceDelta !== 0 && (
              <AnimatePresence>
                <motion.span
                  key={balanceDelta}
                  initial={{ opacity: 0, y: balanceDelta > 0 ? 4 : -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-[9px] font-bold flex items-center ${balanceDelta > 0 ? 'text-green' : 'text-red'}`}
                >
                  {balanceDelta > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                </motion.span>
              </AnimatePresence>
            )}
          </motion.div>

          {/* Search */}
          <Link to="/search"
            className="bg-surface border border-border rounded-lg p-1.5 text-text-muted
              hover:text-text-primary hover:border-accent/50 transition-all">
            <Search size={15} />
          </Link>

          {/* Create meme - mobile */}
          {onCreateMeme && (
            <button onClick={onCreateMeme}
              className="sm:hidden bg-accent rounded-lg p-1.5 text-white cursor-pointer hover:bg-accent-light transition-colors">
              <Plus size={15} />
            </button>
          )}

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
                      <p className="font-semibold text-text-primary text-sm flex items-center">
                        {user?.displayName}<VerifiedBadge type={user?.verified} secondary={user?.verifiedSecondary} size={14} />
                      </p>
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

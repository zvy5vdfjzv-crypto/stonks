import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Settings, Eye, Clock, Moon, Sun, Type, ChevronRight, Lock, Users, AtSign, BarChart2 } from 'lucide-react'
import { useUser } from '../../context/UserContext'
import UserAvatar from '../ui/UserAvatar'
import VerifiedBadge from '../ui/VerifiedBadge'

export default function SideMenu({ isOpen, onClose, onNavigate }) {
  const { user, creatorTitle, updatePrivacy, addScreenTime } = useUser()
  const [activeSection, setActiveSection] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('stonks_theme') !== 'light'
  })
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('stonks_fontsize') || 'M'
  })

  // Apply theme via html class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
    localStorage.setItem('stonks_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Apply font size
  useEffect(() => {
    const sizes = { P: '14px', M: '16px', G: '18px' }
    document.documentElement.style.fontSize = sizes[fontSize] || '16px'
    localStorage.setItem('stonks_fontsize', fontSize)
  }, [fontSize])

  // Track screen time
  useEffect(() => {
    const interval = setInterval(() => addScreenTime(1), 60000)
    return () => clearInterval(interval)
  }, [addScreenTime])

  if (!user) return null

  const sections = [
    { id: 'verification', icon: Shield, label: 'Verificação', color: 'text-blue', action: () => { onClose(); onNavigate?.('/verification') } },
    { id: 'settings', icon: Settings, label: 'Configurações' },
    { id: 'privacy', icon: Lock, label: 'Privacidade' },
    { id: 'activity', icon: Eye, label: 'Atividade de amigos' },
    { id: 'screentime', icon: Clock, label: 'Tempo de uso' },
    { id: 'logout', icon: X, label: 'Sair da conta', color: 'text-red', action: () => {
      if (confirm('Tem certeza? Voce vai precisar recadastrar.')) {
        localStorage.clear()
        window.location.href = '/'
      }
    }},
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-[300px] sm:w-[340px] z-50
              bg-surface border-r border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-text-primary text-sm">Menu</span>
                <button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <UserAvatar size={44} className="rounded-full" />
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-text-primary text-sm">{user.displayName}</span>
                    <VerifiedBadge type={user.verified} secondary={user.verifiedSecondary} size={16} />
                  </div>
                  <p className="text-accent text-xs">{user.handle}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs">{creatorTitle.badge}</span>
                    <span className={`text-[10px] font-medium ${creatorTitle.color}`}>{creatorTitle.title}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {!activeSection ? (
                  <motion.div key="menu" initial={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="py-2">
                      {sections.map(section => (
                        <button key={section.id}
                          onClick={() => section.action ? section.action() : setActiveSection(section.id)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover
                            transition-colors cursor-pointer text-left">
                          <div className="flex items-center gap-3">
                            <section.icon size={18} className={section.color || 'text-text-secondary'} />
                            <span className="text-text-primary text-sm">{section.label}</span>
                          </div>
                          <ChevronRight size={16} className="text-text-muted" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : activeSection === 'settings' ? (
                  <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    <button onClick={() => setActiveSection(null)}
                      className="flex items-center gap-2 px-4 py-3 text-accent text-sm font-medium cursor-pointer w-full hover:bg-surface-hover">
                      ← Configurações
                    </button>
                    <div className="px-4 py-2 space-y-4">
                      {/* Dark/Light mode */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {darkMode ? <Moon size={16} className="text-accent" /> : <Sun size={16} className="text-yellow" />}
                          <span className="text-text-primary text-sm">Modo escuro</span>
                        </div>
                        <button onClick={() => setDarkMode(!darkMode)}
                          className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${darkMode ? 'bg-accent' : 'bg-surface-hover border border-border'}`}>
                          <motion.div animate={{ x: darkMode ? 20 : 2 }}
                            className="w-4 h-4 rounded-full bg-white shadow" />
                        </button>
                      </div>
                      {/* Font size */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Type size={16} className="text-text-secondary" />
                          <span className="text-text-primary text-sm">Tamanho da fonte</span>
                        </div>
                        <div className="flex gap-2">
                          {['P', 'M', 'G'].map(s => (
                            <button key={s} onClick={() => setFontSize(s)}
                              className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all
                                ${fontSize === s ? 'bg-accent text-white' : 'bg-surface-hover text-text-muted border border-border'}`}>
                              {s === 'P' ? 'Pequeno' : s === 'M' ? 'Medio' : 'Grande'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : activeSection === 'privacy' ? (
                  <motion.div key="privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    <button onClick={() => setActiveSection(null)}
                      className="flex items-center gap-2 px-4 py-3 text-accent text-sm font-medium cursor-pointer w-full hover:bg-surface-hover">
                      ← Privacidade
                    </button>
                    <div className="px-4 py-2 space-y-4">
                      {/* Private account */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-primary text-sm">Conta privada</p>
                          <p className="text-text-muted text-[10px]">Apenas seguidores veem seu conteudo</p>
                        </div>
                        <button onClick={() => updatePrivacy('privateAccount', !user.privacy.privateAccount)}
                          className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${user.privacy.privateAccount ? 'bg-accent' : 'bg-surface-hover border border-border'}`}>
                          <motion.div animate={{ x: user.privacy.privateAccount ? 20 : 2 }}
                            className="w-4 h-4 rounded-full bg-white shadow" />
                        </button>
                      </div>
                      {/* Activity visibility */}
                      <div>
                        <p className="text-text-primary text-sm mb-1.5">Quem pode ver sua atividade</p>
                        {['followers', 'mutuals', 'nobody'].map(opt => (
                          <button key={opt} onClick={() => updatePrivacy('showActivity', opt)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1 cursor-pointer transition-all text-left
                              ${user.privacy.showActivity === opt ? 'bg-accent/15 border border-accent/30' : 'bg-surface-hover border border-border'}`}>
                            <span className={`text-xs ${user.privacy.showActivity === opt ? 'text-accent font-semibold' : 'text-text-secondary'}`}>
                              {opt === 'followers' ? 'Seus seguidores' : opt === 'mutuals' ? 'Seguidores mutuos' : 'Ninguem'}
                            </span>
                          </button>
                        ))}
                      </div>
                      {/* Allow mentions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-primary text-sm">Permitir marcações</p>
                          <p className="text-text-muted text-[10px]">Outros podem te marcar em posts</p>
                        </div>
                        <button onClick={() => updatePrivacy('allowMentions', !user.privacy.allowMentions)}
                          className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${user.privacy.allowMentions ? 'bg-accent' : 'bg-surface-hover border border-border'}`}>
                          <motion.div animate={{ x: user.privacy.allowMentions ? 20 : 2 }}
                            className="w-4 h-4 rounded-full bg-white shadow" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : activeSection === 'activity' ? (
                  <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    <button onClick={() => setActiveSection(null)}
                      className="flex items-center gap-2 px-4 py-3 text-accent text-sm font-medium cursor-pointer w-full hover:bg-surface-hover">
                      ← Atividade de amigos
                    </button>
                    <div className="px-4 py-3 space-y-3">
                      {[
                        { avatar: '😎', name: 'CryptoMemeLord', action: 'bancou $PEDRO', time: '2m' },
                        { avatar: '👑', name: 'MemeQueen_BR', action: 'postou uma tese de Alta', time: '5m' },
                        { avatar: '💎', name: 'DiamondHands42', action: 'curtiu seu post', time: '12m' },
                        { avatar: '🦈', name: 'ViralHunter', action: 'comecou a te seguir', time: '30m' },
                        { avatar: '👀', name: 'FofocaTrader', action: 'vendeu $SKBDI', time: '1h' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-lg">{item.avatar}</span>
                          <div className="flex-1">
                            <p className="text-text-primary text-xs">
                              <span className="font-semibold">{item.name}</span>{' '}
                              <span className="text-text-secondary">{item.action}</span>
                            </p>
                          </div>
                          <span className="text-text-muted text-[10px]">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : activeSection === 'screentime' ? (
                  <motion.div key="screentime" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    <button onClick={() => setActiveSection(null)}
                      className="flex items-center gap-2 px-4 py-3 text-accent text-sm font-medium cursor-pointer w-full hover:bg-surface-hover">
                      ← Tempo de uso
                    </button>
                    <div className="px-4 py-3">
                      <div className="bg-surface-hover rounded-xl p-4 text-center mb-4">
                        <Clock size={24} className="text-accent mx-auto mb-2" />
                        <p className="text-text-primary text-2xl font-bold">
                          {Math.floor((user.screenTime?.totalMinutes || 0) / 60)}h {(user.screenTime?.totalMinutes || 0) % 60}m
                        </p>
                        <p className="text-text-muted text-xs mt-1">Tempo total no STONKS</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Hoje</span>
                          <span className="text-text-primary font-medium">{Math.min(user.screenTime?.totalMinutes || 0, 45)}m</span>
                        </div>
                        <div className="h-2 bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(((user.screenTime?.totalMinutes || 0) / 120) * 100, 100)}%` }} />
                        </div>
                        <p className="text-text-muted text-[10px]">Meta diaria: 2h</p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 🧠 BottomNav dopaminergico — TikTok vibes:
// Tab ativa incha + linha money no topo + label em mono ALL CAPS.
// Mantem glassmorphism da Fase 2 premium overhaul.
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, MessageSquare, ShoppingBag, MessageCircle, Briefcase } from 'lucide-react'

const navItems = [
  { path: '/', icon: Flame, label: 'Feed' },
  { path: '/social', icon: MessageSquare, label: 'Social' },
  { path: '/shop', icon: ShoppingBag, label: 'Loja', highlight: true },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl bg-[var(--bg-app)]/80 border-t border-border/50">
      <div className="max-w-5xl mx-auto flex">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] sm:text-[10px]
              transition-colors no-underline relative
              ${item.highlight && !isActive
                ? 'text-hype'
                : isActive
                  ? 'text-money'
                  : 'text-text-muted hover:text-text-secondary'}
            `}
          >
            {({ isActive }) => (
              <>
                {/* Linha indicadora no topo do tab ativo — glow money */}
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-money rounded-b-full"
                    style={{ boxShadow: '0 0 12px #00ff8888' }}
                  />
                )}

                {/* Icon que incha quando ativo */}
                <motion.div
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative"
                >
                  {item.highlight && !isActive ? (
                    <div className="relative">
                      <item.icon size={18} />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-hype rounded-full" />
                    </div>
                  ) : (
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  )}
                </motion.div>

                {/* Label: mono ALL CAPS quando ativo */}
                <span className={isActive
                  ? 'font-mono-stonks font-bold uppercase tracking-wider'
                  : 'font-semibold'}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

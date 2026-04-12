import { NavLink } from 'react-router-dom'
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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0c]/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-5xl mx-auto flex">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] sm:text-[10px] font-semibold
              transition-all no-underline
              ${item.highlight && !isActive
                ? 'text-yellow'
                : isActive
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-secondary'}
            `}
          >
            {item.highlight ? (
              <div className="relative">
                <item.icon size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow rounded-full" />
              </div>
            ) : (
              <item.icon size={18} />
            )}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

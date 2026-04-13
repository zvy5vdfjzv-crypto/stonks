import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, Users, TrendingUp, Zap } from 'lucide-react'
import { STONKS_OFFICIAL_ACCOUNTS } from '../context/UserContext'
import { useGame } from '../context/GameContext'
import { useChat } from '../context/ChatContext'
import VerifiedBadge from '../components/ui/VerifiedBadge'

export default function SearchPage() {
  const navigate = useNavigate()
  const { trends } = useGame()
  const { friends } = useChat()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    if (!q) return { users: [], trends: [], pages: [] }

    // Search users (friends / mock)
    const users = friends.filter(f =>
      f.name.toLowerCase().includes(q) || (f.handle && f.handle.toLowerCase().includes(q))
    )

    // Search trends by name, ticker, category
    const matchedTrends = trends.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.ticker.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    )

    // Search official pages
    const pages = STONKS_OFFICIAL_ACCOUNTS.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.handle.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.desc.toLowerCase().includes(q)
    )

    return { users, trends: matchedTrends, pages }
  }, [q, friends, trends])

  const hasResults = results.users.length > 0 || results.trends.length > 0 || results.pages.length > 0

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-4 pb-24">
      {/* Search header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="text-text-muted hover:text-text-primary cursor-pointer shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuarios, trends, @paginas..."
            autoFocus
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm
              text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
          />
        </div>
      </div>

      {/* No query - show suggestions */}
      {!q && (
        <div className="space-y-4">
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-3">Paginas STONKS</p>
            <div className="space-y-1.5">
              {STONKS_OFFICIAL_ACCOUNTS.map(account => (
                <motion.div key={account.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => navigate(`/page/${account.id}`)}
                  className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3
                    cursor-pointer hover:bg-surface-hover hover:border-accent/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xl shrink-0">
                    {account.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-text-primary text-sm">{account.name}</span>
                      <VerifiedBadge type="stonks" size={13} />
                    </div>
                    <p className="text-text-muted text-xs">{account.handle} · {account.followers} seguidores</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search results */}
      {q && !hasResults && (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-text-muted text-sm">Nenhum resultado para "{query}"</p>
        </div>
      )}

      {q && hasResults && (
        <div className="space-y-5">
          {/* Pages STONKS */}
          {results.pages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-accent" />
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wide">Paginas STONKS</p>
              </div>
              <div className="space-y-1.5">
                {results.pages.map(account => (
                  <motion.div key={account.id}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate(`/page/${account.id}`)}
                    className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3
                      cursor-pointer hover:bg-surface-hover hover:border-accent/20 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xl shrink-0">
                      {account.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-text-primary text-sm">{account.name}</span>
                        <VerifiedBadge type="stonks" size={13} />
                      </div>
                      <p className="text-text-muted text-xs">{account.handle} · {account.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Trends */}
          {results.trends.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-green" />
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wide">Trends</p>
              </div>
              <div className="space-y-1.5">
                {results.trends.map(trend => (
                  <motion.div key={trend.id}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3
                      cursor-pointer hover:bg-surface-hover hover:border-accent/20 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-xl shrink-0">
                      {trend.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary text-sm">{trend.name}</p>
                      <p className="text-text-muted text-xs">{trend.ticker}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-text-primary text-sm">S$ {trend.price.toFixed(2)}</p>
                      <p className={`text-xs font-medium ${trend.change24h >= 0 ? 'text-green' : 'text-red'}`}>
                        {trend.change24h >= 0 ? '+' : ''}{trend.change24h.toFixed(2)}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-blue" />
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wide">Pessoas</p>
              </div>
              <div className="space-y-1.5">
                {results.users.map(usr => (
                  <motion.div key={usr.id}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3
                      cursor-pointer hover:bg-surface-hover hover:border-accent/20 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-xl shrink-0">
                      {usr.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary text-sm">{usr.name}</p>
                      {usr.handle && <p className="text-text-muted text-xs">{usr.handle}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

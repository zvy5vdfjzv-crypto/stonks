import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, ChevronRight } from 'lucide-react'
import Badge from '../components/ui/Badge'
import { creators } from '../data/creators'
import { useGame } from '../context/GameContext'
import { useLang } from '../context/LanguageContext'
import { CATEGORIES } from '../data/trends'

const categoryColors = {
  memes: 'accent', finance: 'green', music: 'blue',
  tech: 'accent', ai: 'pink', influencer: 'yellow',
  viral: 'pink', cars: 'red', sports: 'green', gaming: 'blue',
}

export default function CreatorsPage() {
  const { trends } = useGame()
  const { t } = useLang()
  const [followedIds, setFollowedIds] = useState(new Set())
  const [activeCategory, setActiveCategory] = useState(null)

  const toggleFollow = (id) => {
    setFollowedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = activeCategory
    ? creators.filter(c => c.category === activeCategory)
    : creators

  return (
    <div className="px-4 py-5 max-w-5xl mx-auto w-full pb-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-5"
      >
        <Users size={20} className="text-accent" />
        <h1 className="text-xl font-bold text-text-primary">Canais</h1>
        {followedIds.size > 0 && (
          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
            {followedIds.size} seguindo
          </span>
        )}
      </motion.div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all
            ${!activeCategory
              ? 'bg-accent text-white'
              : 'bg-surface text-text-muted border border-border hover:text-text-secondary'
            }`}
        >
          Todos
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all
              ${activeCategory === cat
                ? 'bg-accent text-white'
                : 'bg-surface text-text-muted border border-border hover:text-text-secondary'
              }`}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((creator, i) => {
          const isFollowing = followedIds.has(creator.id)
          const creatorTrends = creator.trending
            .map(id => trends.find(t => t.id === id))
            .filter(Boolean)
            .slice(0, 3)

          return (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-surface border border-border rounded-2xl overflow-hidden"
            >
              <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center text-2xl shrink-0">
                  {creator.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-primary text-sm">{creator.name}</h3>
                    <Badge color={categoryColors[creator.category] || 'neutral'}>
                      {t(`categories.${creator.category}`)}
                    </Badge>
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">{creator.handle} · {creator.followers} seguidores</p>
                  <p className="text-text-secondary text-xs mt-1.5 line-clamp-2">{creator.description}</p>
                </div>
                <button
                  onClick={() => toggleFollow(creator.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all
                    ${isFollowing
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'bg-accent text-white hover:bg-accent-light'
                    }`}
                >
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </button>
              </div>

              {/* Trending memes from this creator */}
              {creatorTrends.length > 0 && (
                <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
                  {creatorTrends.map(trend => {
                    const isPositive = trend.change24h >= 0
                    return (
                      <div
                        key={trend.id}
                        className="shrink-0 flex items-center gap-2 bg-surface-hover rounded-lg px-3 py-2
                          border border-border/50"
                      >
                        {trend.thumbnail ? (
                          <img src={trend.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <span className="text-lg">{trend.emoji}</span>
                        )}
                        <div>
                          <p className="text-text-primary text-[11px] font-medium truncate max-w-[100px]">
                            {trend.ticker}
                          </p>
                          <p className={`text-[10px] font-semibold ${isPositive ? 'text-green' : 'text-red'}`}>
                            {isPositive ? '+' : ''}{trend.change24h.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

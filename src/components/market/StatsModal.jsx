import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart2, DollarSign, Activity, ExternalLink } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import Modal from '../ui/Modal'
import { useGame } from '../../context/GameContext'
import { useLang } from '../../context/LanguageContext'
import { fetchRedditPosts } from '../../services/redditFeed'

function CustomTooltip({ active, payload }) {
  if (active && payload?.[0]) {
    return (
      <div className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs shadow-lg">
        <span className="text-green font-medium">S$ {payload[0].value.toFixed(2)}</span>
      </div>
    )
  }
  return null
}

export default function StatsModal({ isOpen, onClose, trend }) {
  const { holdings } = useGame()
  const { t } = useLang()
  const [relatedPosts, setRelatedPosts] = useState([])

  useEffect(() => {
    if (trend?.category && isOpen) {
      fetchRedditPosts(trend.category, 3).then(setRelatedPosts)
    }
  }, [trend?.category, isOpen])

  if (!trend) return null

  const isPositive = trend.change24h >= 0
  const chartColor = isPositive ? '#00D68F' : '#FF6B6B'
  const holding = holdings[trend.id]

  const stats = [
    { icon: DollarSign, label: t('market.price'), value: `S$ ${trend.price.toFixed(2)}` },
    { icon: Activity, label: t('market.change'), value: `${isPositive ? '+' : ''}${trend.change24h.toFixed(2)}%`, color: isPositive ? 'text-green' : 'text-red' },
    { icon: BarChart2, label: t('market.volume'), value: trend.volume.toLocaleString() },
    { icon: BarChart2, label: 'Cap', value: `S$ ${(trend.marketCap / 1000).toFixed(0)}K` },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${trend.emoji} ${trend.name}`}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Mini chart */}
        <div className="bg-surface-hover rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-primary font-bold text-lg">S$ {trend.price.toFixed(2)}</span>
            <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green' : 'text-red'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isPositive ? '+' : ''}{trend.change24h.toFixed(2)}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={trend.priceHistory}>
              <defs>
                <linearGradient id={`modal-g-${trend.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2}
                fill={`url(#modal-g-${trend.id})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map(stat => (
            <div key={stat.label} className="bg-surface-hover rounded-xl p-2.5">
              <div className="flex items-center gap-1 mb-1">
                <stat.icon size={11} className="text-text-muted" />
                <span className="text-text-muted text-[11px]">{stat.label}</span>
              </div>
              <p className={`font-semibold text-sm ${stat.color || 'text-text-primary'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Your position */}
        {holding && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3">
            <p className="text-accent-light text-[11px] font-semibold uppercase mb-2">{t('portfolio.holdings')}</p>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{holding.quantity} {t('portfolio.shares')}</span>
              <span className={`font-semibold ${(trend.price - holding.avgPrice) >= 0 ? 'text-green' : 'text-red'}`}>
                {((trend.price - holding.avgPrice) * holding.quantity) >= 0 ? '+' : ''}
                S$ {((trend.price - holding.avgPrice) * holding.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-text-secondary text-sm">{trend.description}</p>

        {/* YouTube link */}
        {trend.youtubeId && (
          <a
            href={`https://www.youtube.com/watch?v=${trend.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-red/10 text-red border border-red/20 rounded-xl
              px-3 py-2.5 text-sm font-medium no-underline hover:bg-red/20 transition-colors"
          >
            <span>▶</span>
            Ver no YouTube
            <ExternalLink size={13} className="ml-auto" />
          </a>
        )}

        {/* Reddit posts */}
        {relatedPosts.length > 0 && (
          <div>
            <p className="text-text-muted text-[11px] font-semibold uppercase mb-2">🔥 Reddit</p>
            <div className="space-y-1.5">
              {relatedPosts.map(post => (
                <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 bg-surface-hover rounded-lg p-2 no-underline
                    hover:bg-border/30 transition-colors">
                  {(post.preview || post.thumbnail) && (
                    <img src={post.preview || post.thumbnail} alt=""
                      className="w-10 h-10 rounded object-cover shrink-0 bg-black" loading="lazy" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary text-xs truncate">{post.title}</p>
                    <span className="text-text-muted text-[10px]">r/{post.subreddit} · ⬆{post.score.toLocaleString()}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

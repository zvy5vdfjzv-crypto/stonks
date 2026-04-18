import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, BarChart2, DollarSign, Activity, Play } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import TradeModal from '../components/market/TradeModal'
import { useGame } from '../context/GameContext'
import { useLang } from '../context/LanguageContext'
import { fetchRedditPosts } from '../services/redditFeed'

function VideoEmbed({ youtubeId, name }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden border border-border mb-5 w-full h-[280px] sm:h-[340px]"
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onClick={() => setPlaying(true)}
      className="relative rounded-2xl overflow-hidden border border-border mb-5 cursor-pointer
        group h-[280px] sm:h-[340px]"
    >
      <img
        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors
        flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-red/90 flex items-center justify-center
          group-hover:scale-110 transition-transform shadow-lg">
          <Play size={28} className="text-white ml-1" fill="white" />
        </div>
      </div>
    </motion.div>
  )
}

const categoryColors = {
  memes: 'accent', finance: 'green', music: 'blue',
  tech: 'accent', ai: 'pink', influencer: 'yellow',
  viral: 'pink', cars: 'red', sports: 'green', gaming: 'blue',
}

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

export default function TrendDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTrend, holdings } = useGame()
  const { t } = useLang()
  const [tradeOpen, setTradeOpen] = useState(false)
  const [tradeMode, setTradeMode] = useState('buy')
  const [relatedPosts, setRelatedPosts] = useState([])

  const trend = getTrend(id)

  useEffect(() => {
    if (trend?.category) {
      fetchRedditPosts(trend.category, 4).then(setRelatedPosts)
    }
  }, [trend?.category])
  if (!trend) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Trend not found</p>
      </div>
    )
  }

  const isPositive = trend.change24h >= 0
  const holding = holdings[trend.id]
  const chartColor = isPositive ? '#00D68F' : '#FF6B6B'

  const openTrade = (mode) => {
    setTradeMode(mode)
    setTradeOpen(true)
  }

  const stats = [
    { icon: DollarSign, label: t('market.price'), value: `S$ ${trend.price.toFixed(2)}` },
    { icon: Activity, label: t('market.change'), value: `${isPositive ? '+' : ''}${trend.change24h.toFixed(2)}%`, color: isPositive ? 'text-green' : 'text-red' },
    { icon: BarChart2, label: t('market.volume'), value: trend.volume.toLocaleString() },
    { icon: BarChart2, label: t('market.marketCap'), value: `S$ ${(trend.marketCap / 1000).toFixed(0)}K` },
  ]

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto w-full">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-5
          cursor-pointer bg-transparent border-0 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>{t('nav.market')}</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-3xl border border-border">
            {trend.emoji}
          </div>
          <div>
            <h1 className="font-bold text-text-primary text-xl sm:text-2xl">{trend.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-text-muted text-sm">{trend.ticker}</span>
              <Badge color={categoryColors[trend.category] || 'neutral'}>
                {t(`categories.${trend.category}`)}
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-text-secondary text-sm mt-3">{trend.description}</p>
      </motion.div>

      {trend.youtubeId && (
        <VideoEmbed youtubeId={trend.youtubeId} name={trend.name} />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-surface border border-border rounded-2xl p-5 mb-5"
      >
        <div className="flex items-end justify-between mb-4">
          <div>
            <motion.p
              key={trend.price}
              initial={{ scale: 1.03 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-text-primary"
            >
              S$ {trend.price.toFixed(2)}
            </motion.p>
            <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${isPositive ? 'text-green' : 'text-red'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isPositive ? '+' : ''}{trend.change24h.toFixed(2)}%</span>
              <span className="text-text-muted ml-1 text-xs">24h</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trend.priceHistory}>
            <defs>
              <linearGradient id={`gradient-${trend.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#gradient-${trend.id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
            className="bg-surface border border-border rounded-xl p-3.5"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <stat.icon size={12} className="text-text-muted" />
              <span className="text-text-muted text-[11px] font-medium">{stat.label}</span>
            </div>
            <p className={`font-semibold text-sm ${stat.color || 'text-text-primary'}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {holding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-accent/5 border border-accent/20 rounded-2xl p-4 mb-5"
        >
          <h3 className="text-accent-light text-xs font-semibold mb-2.5 uppercase tracking-wide">
            {t('portfolio.holdings')}
          </h3>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{t('portfolio.shares')}</span>
              <span className="text-text-primary font-medium">{holding.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{t('portfolio.avgPrice')}</span>
              <span className="text-text-primary">S$ {holding.avgPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{t('portfolio.pnl')}</span>
              {(() => {
                const pnl = (trend.price - holding.avgPrice) * holding.quantity
                return (
                  <span className={`font-semibold ${pnl >= 0 ? 'text-green' : 'text-red'}`}>
                    {pnl >= 0 ? '+' : ''}S$ {pnl.toFixed(2)}
                  </span>
                )
              })()}
            </div>
          </div>
        </motion.div>
      )}

      {relatedPosts.length > 0 && (
        <div className="mb-5">
          <h3 className="text-text-primary font-semibold text-sm uppercase tracking-wide mb-3">
            🔥 Hot on Reddit
          </h3>
          <div className="space-y-2">
            {relatedPosts.map(post => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3
                  hover:bg-surface-hover hover:border-accent/20 transition-all no-underline group"
              >
                {(post.preview || post.thumbnail) && (
                  <img
                    src={post.preview || post.thumbnail}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover shrink-0 bg-surface-hover"
                    loading="lazy"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary text-sm truncate group-hover:text-accent transition-colors">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-text-muted text-[11px]">r/{post.subreddit}</span>
                    <span className="text-text-muted text-[11px]">⬆ {post.score.toLocaleString()}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="money" haptic onClick={() => openTrade('buy')} className="flex-1 py-3.5">
          {t('trade.buy')} {trend.ticker}
        </Button>
        <Button
          variant="red"
          haptic
          onClick={() => openTrade('sell')}
          disabled={!holding}
          className="flex-1 py-3.5"
        >
          {t('trade.sell')} {trend.ticker}
        </Button>
      </div>

      <TradeModal
        isOpen={tradeOpen}
        onClose={() => setTradeOpen(false)}
        trend={trend}
        mode={tradeMode}
      />
    </div>
  )
}

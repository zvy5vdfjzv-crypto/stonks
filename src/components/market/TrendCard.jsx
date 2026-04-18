import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart2, ChevronUp, ChevronDown, Minus, Plus, ShoppingCart } from 'lucide-react'
import SparkLine from './SparkLine'
import Badge from '../ui/Badge'
import FlyingCoins from '../ui/FlyingCoins'
import { sound } from '../../lib/sound'
import { haptics } from '../../lib/haptics'
import { useLang } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

const categoryColors = {
  memes: 'accent', finance: 'green', music: 'blue',
  tech: 'accent', ai: 'pink', influencer: 'yellow',
  viral: 'pink', cars: 'red', sports: 'green', gaming: 'blue',
}

export default function TrendCard({ trend, index, onOpenStats }) {
  const { t } = useLang()
  const { balance, holdings, buy, sell } = useGame()
  const [qty, setQty] = useState(1)
  const [flash, setFlash] = useState(null)
  const [flyOrigin, setFlyOrigin] = useState(null)
  const isPositive = trend.change24h >= 0
  const holding = holdings[trend.id]
  // 🧠 NEUROMARKETING: FOMO threshold — memes subindo >15% ganham destaque urgente
  const isHotPump = Math.abs(trend.change24h) > 15

  const handleBuy = (e) => {
    e.stopPropagation()
    if (qty * trend.price > balance) return
    buy(trend.id, qty)
    sound.register()
    haptics.fire('medium')
    setFlash('buy')
    setTimeout(() => setFlash(null), 600)
    setFlyOrigin({ x: e.clientX, y: e.clientY, count: Math.min(qty, 8) })
  }

  const handleSell = (e) => {
    e.stopPropagation()
    if (!holding || holding.quantity < qty) return
    const profit = (trend.price - holding.avgPrice) * qty
    sell(trend.id, qty)
    if (profit > 0) { sound.gain(); haptics.fire('success') }
    else { sound.loss(); haptics.fire('loss') }
    setFlash('sell')
    setTimeout(() => setFlash(null), 600)
  }

  return (
    <>
    {/* 🧠 FASE 4: Moedas voando do click → wallet quando banca */}
    <FlyingCoins origin={flyOrigin} count={flyOrigin?.count || 6} onDone={() => setFlyOrigin(null)} />
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-surface rounded-2xl border overflow-hidden transition-all duration-300
        ${flash === 'buy' ? 'border-money/60 glow-money' : flash === 'sell' ? 'border-loss/60'
          : isHotPump ? 'border-hype/50 glow-hype' : 'border-border'}`}
    >
      {/* Thumbnail + overlay info */}
      <div
        className="relative w-full h-40 overflow-hidden bg-surface-hover cursor-pointer"
        onClick={() => onOpenStats?.(trend)}
      >
        {trend.thumbnail ? (
          <img
            src={trend.thumbnail}
            alt={trend.name}
            className="w-full h-full object-cover opacity-70 hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-hover">
            {trend.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{trend.emoji}</span>
              <h3 className="font-semibold text-white text-sm drop-shadow-lg">{trend.name}</h3>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-white/50 text-xs">{trend.ticker}</span>
              <Badge color={categoryColors[trend.category] || 'neutral'}>
                {t(`categories.${trend.category}`)}
              </Badge>
              {/* 🧠 NEUROMARKETING: Badge FOMO — urgencia pulsante */}
              {isHotPump && (
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="bg-green/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_10px_#00D68F]"
                >
                  🔥 HOT
                </motion.span>
              )}
            </div>
          </div>
          <div className="text-right">
            <motion.p
              key={trend.price}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="font-bold text-white text-base drop-shadow-lg"
            >
              S$ {trend.price.toFixed(2)}
            </motion.p>
            <div className={`flex items-center gap-0.5 justify-end text-xs font-semibold
              ${isPositive ? 'text-green' : 'text-red'}`}
            >
              {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              <span>{isPositive ? '+' : ''}{trend.change24h.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-3 py-2 flex items-center gap-3 border-b border-border/50">
        <div className="flex-1 h-8">
          <SparkLine data={trend.priceHistory.slice(-20)} positive={isPositive} />
        </div>
        <div className="flex items-center gap-3 text-[11px] text-text-muted shrink-0">
          <span className="flex items-center gap-1">
            <BarChart2 size={10} />
            Vol {(trend.volume / 1000).toFixed(0)}K
          </span>
          <span>Cap {(trend.marketCap / 1000000).toFixed(1)}M</span>
        </div>
        {holding && (
          <span className="text-[11px] text-accent font-semibold shrink-0">
            {holding.quantity} cotas
          </span>
        )}
      </div>

      {/* Quick trade bar */}
      <div className="px-3 py-2.5 flex items-center gap-2">
        <div className="flex items-center bg-surface-hover rounded-lg border border-border">
          <button
            onClick={(e) => { e.stopPropagation(); setQty(Math.max(1, qty - 1)) }}
            className="px-2 py-1.5 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="text-text-primary text-sm font-semibold w-8 text-center">{qty}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setQty(qty + 1) }}
            className="px-2 py-1.5 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={handleBuy}
          disabled={qty * trend.price > balance}
          className="flex-1 bg-money hover:bg-money-dim disabled:opacity-30 text-[#0a0a0f]
            font-mono-stonks font-bold uppercase tracking-wider text-[11px]
            py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5
            disabled:cursor-not-allowed hover:glow-money"
        >
          <ShoppingCart size={13} strokeWidth={2.5} />
          {t('trade.buy')} · <span className="tabular-nums">S${(qty * trend.price).toFixed(0)}</span>
        </button>

        <button
          onClick={handleSell}
          disabled={!holding || holding.quantity < qty}
          className="bg-red/15 hover:bg-red/25 disabled:opacity-30 text-red text-xs font-semibold
            px-3 py-2 rounded-lg cursor-pointer transition-all disabled:cursor-not-allowed
            flex items-center gap-1 border border-red/20"
        >
          <TrendingDown size={12} /> {t('trade.sell')}
        </button>
      </div>
    </motion.div>
    </>
  )
}

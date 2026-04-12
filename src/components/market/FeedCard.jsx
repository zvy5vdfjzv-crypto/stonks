import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Heart, MessageCircle, Share2, Bookmark, Info, MoreHorizontal } from 'lucide-react'
import { useLang } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

export default function FeedCard({ trend, onOpenStats }) {
  const { t } = useLang()
  const { balance, holdings, buy, sell } = useGame()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showBancou, setShowBancou] = useState(false)
  const [bankQty, setBankQty] = useState(0)
  const isPositive = trend.change24h >= 0
  const holding = holdings[trend.id]

  // Simple instant buy - no hold delay
  const handleBancar = () => {
    const qty = 1
    if (qty * trend.price > balance) return
    buy(trend.id, qty)
    setBankQty(prev => prev + 1)
    setShowBancou(true)
    setTimeout(() => setShowBancou(false), 1200)
  }

  const handleSell = () => {
    if (!holding || holding.quantity < 1) return
    sell(trend.id, 1)
  }

  const handleShare = () => {
    const text = `${trend.emoji} ${trend.name} (${trend.ticker}) - S$${trend.price.toFixed(2)} ${isPositive ? '📈' : '📉'}${trend.change24h.toFixed(2)}% no STONKS!`
    if (navigator.share) {
      navigator.share({ title: trend.name, text, url: window.location.origin })
    } else {
      navigator.clipboard?.writeText(text + ' ' + window.location.origin)
      setShowShare(true)
      setTimeout(() => setShowShare(false), 1500)
    }
  }

  const topBancadores = trend.socialProof?.topBancadores || []
  const bancadas = trend.socialProof?.bancadas || 0

  return (
    <article className="border-b border-border/40">
      {/* Header - user/source info */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-pink flex items-center justify-center text-sm">
            {trend.emoji}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-text-primary text-xs font-semibold">{trend.ticker}</span>
              <span className="text-text-muted text-[10px]">· {trend.category}</span>
            </div>
          </div>
        </div>
        <button onClick={() => onOpenStats?.(trend)}
          className="text-text-muted hover:text-text-primary cursor-pointer p-1">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Image - tap to like */}
      <div className="relative w-full aspect-square bg-surface-hover overflow-hidden"
        onDoubleClick={() => { setLiked(true); handleBancar() }}>
        <img
          src={trend.thumbnail}
          alt={trend.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        {/* Price overlay - bottom right */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <p className={`font-bold text-sm ${isPositive ? 'text-green' : 'text-red'}`}>
            S$ {trend.price.toFixed(2)}
          </p>
          <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${isPositive ? 'text-green' : 'text-red'}`}>
            {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            {isPositive ? '+' : ''}{trend.change24h.toFixed(2)}%
          </div>
        </div>

        {/* Category badge - top left */}
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-0.5">
          <span className="text-white text-[10px] font-semibold">{t(`categories.${trend.category}`)}</span>
        </div>

        {/* Double-tap heart animation */}
        <AnimatePresence>
          {showBancou && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="text-6xl drop-shadow-lg">🚀</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons - Instagram style */}
      <div className="px-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* BANCAR (replaces like) */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleBancar}
              disabled={trend.price > balance}
              className="cursor-pointer disabled:opacity-30"
            >
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all
                ${holding ? 'bg-green/20 text-green' : 'bg-surface-hover text-text-primary hover:bg-green/10'}`}>
                🔥 Bancar
              </div>
            </motion.button>

            {/* Sell */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleSell}
              disabled={!holding}
              className="cursor-pointer disabled:opacity-20"
            >
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-hover text-[11px] font-bold text-text-secondary hover:text-red transition-all">
                📉 Vender
              </div>
            </motion.button>

            {/* Comment / Stats */}
            <button onClick={() => onOpenStats?.(trend)} className="text-text-secondary hover:text-text-primary cursor-pointer">
              <MessageCircle size={22} />
            </button>

            {/* Share */}
            <button onClick={handleShare} className="text-text-secondary hover:text-text-primary cursor-pointer relative">
              <Share2 size={20} />
              <AnimatePresence>
                {showShare && (
                  <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: -20 }} exit={{ opacity: 0 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] text-green font-semibold whitespace-nowrap">
                    Copiado!
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Save */}
          <button onClick={() => setSaved(!saved)} className="text-text-secondary hover:text-text-primary cursor-pointer">
            <Bookmark size={22} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-text-primary' : ''} />
          </button>
        </div>

        {/* Social proof */}
        <div className="mt-1.5">
          {topBancadores.length > 0 && (
            <p className="text-text-primary text-xs">
              <span className="font-semibold">Bancado por {topBancadores[0]}</span>
              {bancadas > 1 && <span className="text-text-secondary"> e <span className="font-semibold">outras {bancadas.toLocaleString()} pessoas</span></span>}
            </p>
          )}
          {holding && (
            <p className="text-green text-[11px] font-medium mt-0.5">
              Voce tem {holding.quantity} cotas · {((trend.price - holding.avgPrice) / holding.avgPrice * 100).toFixed(1)}%
            </p>
          )}
        </div>

        {/* Name + description */}
        <div className="mt-1">
          <p className="text-text-primary text-xs">
            <span className="font-semibold">{trend.name}</span>{' '}
            <span className="text-text-secondary">{trend.description}</span>
          </p>
        </div>

        <p className="text-text-muted text-[10px] mt-1 mb-2">
          Vol {(trend.volume / 1000).toFixed(0)}K · Cap S${(trend.marketCap / 1000000).toFixed(1)}M
        </p>
      </div>
    </article>
  )
}

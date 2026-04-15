import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Heart, MessageCircle, Share2, Bookmark, BarChart2, MoreHorizontal, Send } from 'lucide-react'
import CoinRain from '../ui/CoinRain'
import { useLang } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { useChat } from '../../context/ChatContext'

export default function FeedCard({ trend, onOpenStats }) {
  const { t } = useLang()
  const { balance, holdings, buy, sell } = useGame()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showBancou, setShowBancou] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([
    { id: 1, user: 'CryptoMemeLord', avatar: '😎', text: 'Bancando pesado nessa! 🚀', time: '2m' },
    { id: 2, user: 'MemeQueen_BR', avatar: '👑', text: 'Esse meme vai explodir essa semana', time: '5m' },
  ])
  const [sent, setSent] = useState(null)
  const [showCoinRain, setShowCoinRain] = useState(false)
  const { friends, communities, sendMessage } = useChat()
  const isPositive = trend.change24h >= 0
  const holding = holdings[trend.id]
  // 🧠 NEUROMARKETING: FOMO — highlight visual para pumps > 15%
  const isHotPump = Math.abs(trend.change24h) > 15

  const handleBancar = () => {
    if (trend.price > balance) return
    buy(trend.id, 1)
    // 🧠 NEUROMARKETING: Haptic feedback — toque fisico reforça decisao
    navigator.vibrate?.([50])
    setShowBancou(true)
    setTimeout(() => setShowBancou(false), 1200)
  }

  const handleSell = () => {
    if (!holding || holding.quantity < 1) return
    const profit = (trend.price - holding.avgPrice) * 1
    sell(trend.id, 1)
    // 🧠 NEUROMARKETING: Haptic + chuva de moedas no lucro — jackpot dopamina
    navigator.vibrate?.([50])
    if (profit > 0) {
      setShowCoinRain(true)
    }
  }

  const shareText = `${trend.emoji} ${trend.name} (${trend.ticker}) S$${trend.price.toFixed(2)} ${isPositive ? '📈' : '📉'}${trend.change24h.toFixed(2)}%`

  const handleSendToChat = (chatId, chatName) => {
    sendMessage(chatId, `${shareText} - Olha isso no STONKS! 🔥`)
    setSent(chatName)
    setTimeout(() => setSent(null), 1500)
  }

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`${shareText} ${window.location.origin}`)
    setSent('Link copiado!')
    setTimeout(() => { setSent(null); setShowShare(false) }, 1200)
  }

  const handleNativeShare = () => {
    navigator.share?.({ title: trend.name, text: shareText, url: window.location.origin })
    setShowShare(false)
  }

  const topBancadores = trend.socialProof?.topBancadores || []
  const bancadas = trend.socialProof?.bancadas || 0

  return (
    <article className={`border-b border-border/40 ${isHotPump ? 'relative' : ''}`}>
      {/* 🧠 NEUROMARKETING: Chuva de moedas ao vender com lucro */}
      <CoinRain active={showCoinRain} onDone={() => setShowCoinRain(false)} />
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
      {/* 🧠 NEUROMARKETING: Borda neon verde pulsante em hot pumps — impossivel ignorar */}
      <div className={`relative w-full aspect-[4/5] max-h-[500px] bg-surface-hover overflow-hidden
        ${isHotPump ? 'ring-2 ring-green/60 shadow-[0_0_20px_#00D68F40] animate-pulse' : ''}`}
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
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-0.5">
            <span className="text-white text-[10px] font-semibold">{t(`categories.${trend.category}`)}</span>
          </div>
          {/* 🧠 NEUROMARKETING: FOMO badge — urgencia visual para nao perder a oportunidade */}
          {isHotPump && (
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="bg-green/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 shadow-[0_0_15px_#00D68F]"
            >
              <span className="text-white text-[10px] font-bold">🔥 HOT PUMP</span>
            </motion.div>
          )}
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

            {/* Comments */}
            <button onClick={() => setShowComments(!showComments)} className="text-text-secondary hover:text-text-primary cursor-pointer flex items-center gap-1">
              <MessageCircle size={20} />
              {comments.length > 0 && <span className="text-[10px] font-semibold">{comments.length}</span>}
            </button>

            {/* Share */}
            <button onClick={() => setShowShare(!showShare)} className="text-text-secondary hover:text-text-primary cursor-pointer">
              <Share2 size={20} />
            </button>

            {/* Stats */}
            <button onClick={() => onOpenStats?.(trend)} className="text-text-secondary hover:text-text-primary cursor-pointer">
              <BarChart2 size={20} />
            </button>
          </div>

          {/* Save */}
          <button onClick={() => setSaved(!saved)} className="text-text-secondary hover:text-text-primary cursor-pointer">
            <Bookmark size={22} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-text-primary' : ''} />
          </button>
        </div>

        {/* Share/Forward panel */}
        <AnimatePresence>
          {showShare && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2"
            >
              {sent && (
                <p className="text-green text-[11px] font-semibold text-center py-1">✓ {sent}</p>
              )}
              {/* Recent contacts - horizontal scroll */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {friends.slice(0, 6).map(f => (
                  <button key={f.id} onClick={() => handleSendToChat(f.id, f.name)}
                    className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                    <div className="w-11 h-11 rounded-full bg-surface-hover flex items-center justify-center text-lg
                      group-hover:bg-accent/20 transition-colors border border-border">
                      {f.avatar}
                    </div>
                    <span className="text-text-muted text-[9px] w-12 text-center truncate group-hover:text-accent">{f.name.split(/(?=[A-Z_])/)[0]}</span>
                  </button>
                ))}
                {/* Communities */}
                {communities.slice(0, 3).map(c => (
                  <button key={c.id} onClick={() => handleSendToChat(c.id, c.name)}
                    className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                    <div className="w-11 h-11 rounded-lg bg-surface-hover flex items-center justify-center text-lg
                      group-hover:bg-accent/20 transition-colors border border-border">
                      {c.emoji}
                    </div>
                    <span className="text-text-muted text-[9px] w-12 text-center truncate group-hover:text-accent">{c.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
              {/* Actions row */}
              <div className="flex gap-2 mt-1">
                <button onClick={handleCopyLink}
                  className="flex-1 bg-surface-hover border border-border rounded-lg py-1.5 text-[10px] text-text-secondary font-medium cursor-pointer hover:text-text-primary transition-colors">
                  📋 Copiar link
                </button>
                <button onClick={handleNativeShare}
                  className="flex-1 bg-surface-hover border border-border rounded-lg py-1.5 text-[10px] text-text-secondary font-medium cursor-pointer hover:text-text-primary transition-colors">
                  📤 Mais opcoes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2">
              <div className="max-h-[200px] overflow-y-auto space-y-2 mb-2">
                {comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{c.avatar}</span>
                    <div>
                      <p className="text-text-primary text-xs">
                        <span className="font-semibold">{c.user}</span>{' '}
                        <span className="text-text-secondary">{c.text}</span>
                      </p>
                      <span className="text-text-muted text-[9px]">{c.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && commentText.trim()) {
                      setComments(prev => [...prev, { id: Date.now(), user: 'Voce', avatar: '🎮', text: commentText.trim(), time: 'agora' }])
                      setCommentText('')
                    }
                  }}
                  placeholder="Adicionar comentario..."
                  className="flex-1 bg-surface-hover border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                <button onClick={() => {
                    if (!commentText.trim()) return
                    setComments(prev => [...prev, { id: Date.now(), user: 'Voce', avatar: '🎮', text: commentText.trim(), time: 'agora' }])
                    setCommentText('')
                  }}
                  disabled={!commentText.trim()}
                  className="bg-accent disabled:opacity-30 text-white w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer shrink-0">
                  <Send size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

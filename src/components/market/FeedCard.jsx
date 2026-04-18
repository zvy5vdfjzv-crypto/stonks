import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Heart, MessageCircle, Share2, Bookmark, BarChart2, MoreHorizontal, Send, Flame } from 'lucide-react'
import CoinRain from '../ui/CoinRain'
import AnimatedNumber from '../ui/AnimatedNumber'
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
  const baseBancadas = trend.socialProof?.bancadas || 0

  // 🧠 NEUROMARKETING: Contador social que incrementa em tempo real.
  // Prova social dinamica — sempre parece que "mais gente ta entrando agora".
  const [liveBancadas, setLiveBancadas] = useState(baseBancadas)
  useEffect(() => {
    if (baseBancadas === 0) return
    const interval = setInterval(() => {
      // Incremento proporcional a volatilidade — hot pumps ganham gente rapido
      const rate = Math.abs(trend.change24h) > 15 ? 3 : Math.abs(trend.change24h) > 5 ? 1 : 0.5
      setLiveBancadas(prev => prev + Math.max(1, Math.floor(Math.random() * rate * 3)))
    }, 4000 + Math.random() * 4000)
    return () => clearInterval(interval)
  }, [baseBancadas, trend.change24h])

  return (
    <article className={`border-b border-border/40 transition-all hover:bg-surface/30 ${isHotPump ? 'relative' : ''}`}>
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
      {/* 🧠 FOMO border — hype orange (laranja de urgencia) pulsante em hot pumps */}
      <div className={`relative w-full aspect-[4/5] max-h-[500px] bg-surface-hover overflow-hidden transition-all
        ${isHotPump ? 'ring-2 ring-hype/70 glow-hype' : ''}`}
        onDoubleClick={() => { setLiked(true); handleBancar() }}>
        <img
          src={trend.thumbnail}
          alt={trend.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        {/* Price HERO overlay — mono grande, chunky seta */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
          <p className={`font-mono-stonks font-bold text-lg tabular-nums ${isPositive ? 'text-money' : 'text-loss'}`}>
            S$ {trend.price.toFixed(2)}
          </p>
          <div className={`flex items-center gap-1 text-[11px] font-mono-stonks font-bold tabular-nums ${isPositive ? 'text-money' : 'text-loss'}`}>
            <span className="text-base leading-none">{isPositive ? '▲' : '▼'}</span>
            {isPositive ? '+' : ''}{trend.change24h.toFixed(2)}%
          </div>
        </div>

        {/* Category badge - top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-0.5">
            <span className="text-white text-[10px] font-semibold">{t(`categories.${trend.category}`)}</span>
          </div>
          {/* 🔥 FOMO badge — hype orange pulsando, peso visual total */}
          {isHotPump && (
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="bg-hype backdrop-blur-sm rounded-full px-2.5 py-0.5 glow-hype flex items-center gap-1"
            >
              <Flame size={10} strokeWidth={2.5} className="text-white" />
              <span className="text-white text-[10px] font-mono-stonks font-bold uppercase tracking-wider">Hot Pump</span>
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
            {/* 🔥 BANCAR — CTA hero. Mono ALL CAPS + money glow quando afford.
               Este e o momento-chave do app: botao mais satisfatorio do produto. */}
            <motion.button
              whileHover={trend.price > balance ? {} : { scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleBancar}
              disabled={trend.price > balance}
              className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-mono-stonks font-bold uppercase tracking-wider border transition-all
                ${holding
                  ? 'bg-money/15 text-money border-money/40 glow-money'
                  : 'bg-money text-[#0a0a0f] border-money hover:bg-money-dim hover:glow-money'}`}>
                <TrendingUp size={13} strokeWidth={2.5} /> Bancar
              </div>
            </motion.button>

            {/* Sell — peso secundario, mono mas sem glow */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleSell}
              disabled={!holding}
              className="cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-hover border border-border text-[11px] font-mono-stonks font-bold uppercase tracking-wider text-text-secondary hover:text-loss hover:border-loss/30 hover:bg-loss/10 transition-all">
                <TrendingDown size={13} strokeWidth={2.5} /> Vender
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

        {/* 🧠 Social proof — contador mono incrementando em tempo real */}
        <div className="mt-1.5">
          {topBancadores.length > 0 && (
            <p className="text-text-primary text-xs flex items-center gap-1 flex-wrap">
              <span className="font-semibold">Bancado por {topBancadores[0]}</span>
              {liveBancadas > 1 && (
                <span className="text-text-secondary">
                  {' '}e{' '}
                  <AnimatedNumber
                    value={liveBancadas}
                    className="font-mono-stonks font-bold text-money tabular-nums"
                  />
                  <span className="font-semibold"> pessoas bancaram</span>
                </span>
              )}
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

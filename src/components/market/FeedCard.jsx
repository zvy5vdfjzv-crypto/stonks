import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Info, Coins, Users } from 'lucide-react'
import SparkLine from './SparkLine'
import Badge from '../ui/Badge'
import { useLang } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

const categoryGradients = {
  memes: 'from-purple-900/80 via-indigo-900/60 to-black',
  finance: 'from-emerald-900/80 via-teal-900/60 to-black',
  music: 'from-blue-900/80 via-cyan-900/60 to-black',
  tech: 'from-violet-900/80 via-purple-900/60 to-black',
  ai: 'from-pink-900/80 via-rose-900/60 to-black',
  influencer: 'from-amber-900/80 via-orange-900/60 to-black',
  viral: 'from-rose-900/80 via-pink-900/60 to-black',
  cars: 'from-red-900/80 via-orange-900/60 to-black',
  sports: 'from-green-900/80 via-emerald-900/60 to-black',
  gaming: 'from-indigo-900/80 via-blue-900/60 to-black',
}

const categoryColors = {
  memes: 'accent', finance: 'green', music: 'blue', tech: 'accent',
  ai: 'pink', influencer: 'yellow', viral: 'pink', cars: 'red', sports: 'green', gaming: 'blue',
}

// Confetti particles
function Confetti() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.3,
    color: ['#6C5CE7', '#00D68F', '#FECA57', '#FF6B6B', '#54A0FF', '#FF6B9D'][Math.floor(Math.random() * 6)],
  }))
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: '50%', x: `${p.x}%`, opacity: 1, scale: 1 }}
          animate={{ y: '-20%', opacity: 0, scale: 0, rotate: Math.random() * 360 }}
          transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}

export default function FeedCard({ trend, index, onOpenStats }) {
  const { t } = useLang()
  const { balance, holdings, buy, sell } = useGame()
  const [isBanking, setIsBanking] = useState(false)
  const [bankAmount, setBankAmount] = useState(0)
  const [showBankResult, setShowBankResult] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [liveBancadas, setLiveBancadas] = useState(Math.floor(Math.random() * 50) + 5)
  const cardRef = useRef(null)
  const intervalRef = useRef(null)
  const isPositive = trend.change24h >= 0
  const holding = holdings[trend.id]
  const pricePerUnit = trend.price
  const maxAffordable = Math.floor(balance / pricePerUnit)

  // Simulate live bancadas counter
  useEffect(() => {
    const iv = setInterval(() => {
      setLiveBancadas(prev => prev + (Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0))
    }, 4000)
    return () => clearInterval(iv)
  }, [])

  const startBanking = useCallback(() => {
    if (maxAffordable <= 0) return
    setIsBanking(true)
    setBankAmount(0)
    let acc = 0
    intervalRef.current = setInterval(() => {
      acc += 1
      if (acc > maxAffordable) { acc = maxAffordable; clearInterval(intervalRef.current) }
      setBankAmount(acc)
    }, 100)
  }, [maxAffordable])

  const stopBanking = useCallback(() => {
    clearInterval(intervalRef.current)
    setIsBanking(false)
    if (bankAmount > 0) {
      buy(trend.id, bankAmount)
      setShowBankResult(true)
      setTimeout(() => setShowBankResult(false), 2500)
    }
    setBankAmount(0)
  }, [bankAmount, buy, trend.id])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const handleSell = (e) => {
    e.stopPropagation()
    if (!holding || holding.quantity < 1) return
    sell(trend.id, 1)
  }

  const gradientBg = categoryGradients[trend.category] || categoryGradients.memes
  const hasThumbnail = trend.thumbnail && !imgError

  return (
    <div
      ref={cardRef}
      className="snap-start flex items-center justify-center px-0 sm:px-3 py-0 sm:py-2"
      style={{ height: 'calc(100dvh - 155px)', minHeight: '480px' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`relative w-full max-w-lg bg-black sm:rounded-3xl border overflow-hidden
          shadow-2xl h-full flex flex-col transition-colors duration-500
          ${isBanking ? 'border-green/50 shadow-green/20' : 'border-white/5 sm:border-white/5 border-transparent'}`}
      >
        {/* Media / background */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          {hasThumbnail ? (
            <img
              src={trend.thumbnail}
              alt={trend.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-b ${gradientBg} flex items-center justify-center`}>
              <span className="text-8xl opacity-30">{trend.emoji}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
            <Badge color={categoryColors[trend.category] || 'neutral'}>
              {t(`categories.${trend.category}`)}
            </Badge>
            <div className="flex items-center gap-2">
              {/* Live bancadas counter */}
              <motion.div
                key={liveBancadas}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1"
              >
                <Users size={10} className="text-green" />
                <span className="text-[10px] text-green font-semibold">{liveBancadas} bancando</span>
              </motion.div>
              <button
                onClick={() => onOpenStats?.(trend)}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md
                  flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
              >
                <Info size={14} className="text-white/70" />
              </button>
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
            {/* Name + ticker */}
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <h2 className="font-bold text-white text-xl leading-tight drop-shadow-lg">
                  {trend.emoji} {trend.name}
                </h2>
                <p className="text-white/40 text-sm mt-0.5">{trend.ticker}</p>
              </div>

              {/* Price */}
              <div className="text-right">
                <motion.p
                  key={trend.price}
                  initial={{ scale: 1.08, color: isPositive ? '#00D68F' : '#FF6B6B' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.6 }}
                  className="font-bold text-white text-3xl drop-shadow-lg"
                >
                  {trend.price.toFixed(2)}
                </motion.p>
                <motion.div
                  className={`flex items-center gap-1 justify-end text-sm font-bold ${isPositive ? 'text-green' : 'text-red'}`}
                >
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{isPositive ? '+' : ''}{trend.change24h.toFixed(2)}%</span>
                </motion.div>
              </div>
            </div>

            {/* Social proof */}
            {trend.socialProof && (
              <div className="flex items-center gap-2 mb-2">
                {/* Stacked avatars */}
                <div className="flex -space-x-1.5">
                  {(trend.socialProof.topBancadores || []).slice(0, 3).map((name, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-accent/30 border border-black/50
                      flex items-center justify-center text-[8px] font-bold text-white"
                      title={name}>
                      {name[0]}
                    </div>
                  ))}
                </div>
                <p className="text-white/60 text-[11px]">
                  <span className="text-white/80 font-medium">{trend.socialProof.topBancadores?.[0]}</span>
                  {trend.socialProof.topBancadores?.length > 1 && (
                    <> e <span className="text-white/80 font-medium">{trend.socialProof.topBancadores[1]}</span></>
                  )}
                  {trend.socialProof.bancadas > 0 && (
                    <> e +{trend.socialProof.bancadas.toLocaleString()} bancaram</>
                  )}
                </p>
              </div>
            )}

            {/* Sparkline */}
            <div className="h-8 opacity-40 mb-2">
              <SparkLine data={trend.priceHistory.slice(-24)} positive={isPositive} />
            </div>

            {/* Holdings badge */}
            {holding && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 bg-accent/20 backdrop-blur-sm text-accent
                  text-xs font-semibold px-3 py-1 rounded-full border border-accent/30">
                <Coins size={11} />
                {holding.quantity} cotas · {((trend.price - holding.avgPrice) / holding.avgPrice * 100).toFixed(1)}%
              </motion.div>
            )}
          </div>
        </div>

        {/* BANCAR action bar */}
        <div className="bg-black/90 backdrop-blur-xl px-3 py-2 sm:px-4 sm:py-3 shrink-0 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <motion.button
                onPointerDown={startBanking}
                onPointerUp={stopBanking}
                onPointerLeave={stopBanking}
                disabled={maxAffordable <= 0}
                animate={isBanking ? { boxShadow: '0 0 30px rgba(0,214,143,0.4)' } : { boxShadow: '0 0 0px rgba(0,214,143,0)' }}
                className={`w-full py-3 rounded-2xl font-bold text-sm cursor-pointer
                  transition-all select-none touch-none disabled:opacity-20 disabled:cursor-not-allowed
                  ${isBanking ? 'bg-green text-black scale-[0.97]' : 'bg-green text-black'}`}
              >
                {isBanking ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}>
                      <Coins size={16} />
                    </motion.span>
                    BANCANDO {bankAmount}x · S${(bankAmount * pricePerUnit).toFixed(0)}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 text-base">
                    🔥 BANCAR
                  </span>
                )}
              </motion.button>
              {isBanking && maxAffordable > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((bankAmount / maxAffordable) * 100, 100)}%` }}
                  className="absolute bottom-0 left-0 h-1 bg-white/40 rounded-b-2xl"
                />
              )}
            </div>

            <motion.button
              onClick={handleSell}
              disabled={!holding}
              whileTap={holding ? { scale: 0.9 } : {}}
              className="bg-white/5 hover:bg-white/10 disabled:opacity-10 text-red text-xs font-bold
                px-4 py-3 rounded-2xl cursor-pointer transition-all disabled:cursor-not-allowed border border-white/5 shrink-0"
            >
              Vender
            </motion.button>
          </div>
        </div>

        {/* BANCOU overlay + confetti */}
        <AnimatePresence>
          {showBankResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-20"
            >
              <Confetti />
              <motion.div
                initial={{ scale: 0.5, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center z-30"
              >
                <motion.div
                  animate={{ scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6 }}
                  className="text-7xl mb-4"
                >
                  🚀
                </motion.div>
                <p className="text-green font-bold text-2xl">BANCOU!</p>
                <p className="text-white/50 text-sm mt-1">
                  +{bankAmount || 1} cotas de {trend.ticker}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

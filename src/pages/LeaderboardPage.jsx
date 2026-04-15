import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { useLang } from '../context/LanguageContext'
import { mockPlayers } from '../data/players'

export default function LeaderboardPage() {
  const { getPortfolioValue, initialBalance } = useGame()
  const { t } = useLang()

  const portfolioValue = getPortfolioValue()
  const pnlPercent = parseFloat((((portfolioValue - initialBalance) / initialBalance) * 100).toFixed(1))

  const leaderboard = useMemo(() => {
    const userEntry = {
      id: 'user',
      name: 'Voce / You',
      avatar: '🎮',
      portfolioValue,
      pnlPercent,
      isUser: true,
    }
    return [...mockPlayers, userEntry]
      .sort((a, b) => b.portfolioValue - a.portfolioValue)
      .map((p, i) => ({ ...p, rank: i + 1 }))
  }, [portfolioValue, pnlPercent])

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto w-full pb-24">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2"
      >
        <Trophy size={22} className="text-yellow" />
        {t('leaderboard.title')}
      </motion.h1>

      <div className="flex justify-center gap-3 mb-8">
        {leaderboard.slice(0, 3).map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex flex-col items-center p-4 bg-surface border border-border rounded-2xl
              w-28 sm:w-36
              ${i === 0 ? 'order-2 -mt-3' : i === 1 ? 'order-1 mt-2' : 'order-3 mt-4'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
              ${i === 0 ? 'bg-[#FFD700]/20' : i === 1 ? 'bg-[#C0C0C0]/20' : 'bg-[#CD7F32]/20'}`}>
              <Trophy size={16} className={i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-[#C0C0C0]' : 'text-[#CD7F32]'} />
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2
              ${i === 0 ? 'border-[#FFD700]/50' : i === 1 ? 'border-[#C0C0C0]/50' : 'border-[#CD7F32]/50'}
              bg-surface-hover mb-2`}>
              {player.avatar}
            </div>
            <p className={`text-xs font-semibold text-center truncate w-full
              ${player.isUser ? 'text-accent' : 'text-text-primary'}`}>
              {player.name}
            </p>
            <p className="text-text-muted text-[11px] mt-1">
              S$ {(player.portfolioValue / 1000).toFixed(1)}K
            </p>
            <div className={`flex items-center gap-0.5 text-[11px] font-medium mt-0.5
              ${player.pnlPercent >= 0 ? 'text-green' : 'text-red'}`}>
              {player.pnlPercent >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              <span>{player.pnlPercent >= 0 ? '+' : ''}{player.pnlPercent}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[50px_1fr_100px_80px] sm:grid-cols-[60px_1fr_140px_100px]
          items-center px-4 py-3 border-b border-border text-[11px] font-medium text-text-muted uppercase tracking-wide">
          <span>{t('leaderboard.rank')}</span>
          <span>{t('leaderboard.player')}</span>
          <span className="text-right">{t('leaderboard.value')}</span>
          <span className="text-right">{t('leaderboard.pnl')}</span>
        </div>

        {leaderboard.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.025 }}
            className={`grid grid-cols-[50px_1fr_100px_80px] sm:grid-cols-[60px_1fr_140px_100px]
              items-center px-4 py-3.5 border-b border-border/50 transition-colors
              ${player.isUser
                ? 'bg-accent/5 border-l-2 border-l-accent'
                : 'hover:bg-surface-hover'}`}
          >
            <span className={`font-semibold text-sm
              ${player.rank <= 3 ? 'text-yellow' : 'text-text-muted'}`}>
              #{player.rank}
            </span>

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-lg">{player.avatar}</span>
              <span className={`text-sm truncate
                ${player.isUser ? 'text-accent font-semibold' : 'text-text-primary'}`}>
                {player.name}
                {player.isUser && (
                  <span className="text-accent-light ml-1 text-xs">{t('leaderboard.you')}</span>
                )}
              </span>
            </div>

            <span className="text-right text-sm text-text-primary">
              S$ {player.portfolioValue.toLocaleString()}
            </span>

            <span className={`text-right text-sm font-semibold
              ${player.pnlPercent >= 0 ? 'text-green' : 'text-red'}`}>
              {player.pnlPercent >= 0 ? '+' : ''}{player.pnlPercent}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

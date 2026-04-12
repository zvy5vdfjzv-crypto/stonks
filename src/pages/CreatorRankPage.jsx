import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crown, TrendingUp, BarChart2 } from 'lucide-react'
import { useUser, getCreatorTitle } from '../context/UserContext'

const mockCreatorRanking = [
  { id: 1, name: 'MemeGod_BR', handle: '@memegod', avatar: '😈', score: 18500, memesPosted: 47, followers: '125K' },
  { id: 2, name: 'ViralQueen', handle: '@viralqueen', avatar: '👑', score: 12300, memesPosted: 38, followers: '98K' },
  { id: 3, name: 'CryptoJester', handle: '@cryptojester', avatar: '🃏', score: 9800, memesPosted: 29, followers: '76K' },
  { id: 4, name: 'TrendHunter', handle: '@trendhunter', avatar: '🎯', score: 7200, memesPosted: 24, followers: '61K' },
  { id: 5, name: 'HypeMaster', handle: '@hypemaster', avatar: '🔥', score: 5500, memesPosted: 21, followers: '53K' },
  { id: 6, name: 'MemeFactory', handle: '@memefactory', avatar: '🏭', score: 4100, memesPosted: 18, followers: '42K' },
  { id: 7, name: 'VibeChecker', handle: '@vibechecker', avatar: '✅', score: 2800, memesPosted: 15, followers: '31K' },
  { id: 8, name: 'CloutChaser', handle: '@cloutchaser', avatar: '🏃', score: 1900, memesPosted: 12, followers: '24K' },
  { id: 9, name: 'NichoNerd', handle: '@nichonerd', avatar: '🤓', score: 1200, memesPosted: 9, followers: '18K' },
  { id: 10, name: 'FreshPoster', handle: '@freshposter', avatar: '🌱', score: 600, memesPosted: 5, followers: '8K' },
  { id: 11, name: 'NewbieTrader', handle: '@newbietrader', avatar: '🐣', score: 200, memesPosted: 3, followers: '2K' },
  { id: 12, name: 'LurkKing', handle: '@lurkking', avatar: '👻', score: 80, memesPosted: 1, followers: '500' },
]

export default function CreatorRankPage() {
  const { user } = useUser()

  const ranking = useMemo(() => {
    const list = [...mockCreatorRanking]
    if (user) {
      list.push({
        id: 'user',
        name: user.displayName,
        handle: user.handle,
        avatar: user.avatar,
        score: user.creatorScore,
        memesPosted: 0,
        followers: '0',
        isUser: true,
      })
    }
    return list
      .sort((a, b) => b.score - a.score)
      .map((c, i) => ({ ...c, rank: i + 1 }))
  }, [user])

  const podiumColors = ['text-yellow', 'text-text-secondary', 'text-[#CD7F32]']

  return (
    <div className="px-4 py-5 max-w-xl mx-auto w-full pb-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-6"
      >
        <Crown size={20} className="text-yellow" />
        <h1 className="text-xl font-bold text-text-primary">Ranking de Criadores</h1>
      </motion.div>

      {/* Podium */}
      <div className="flex justify-center gap-3 mb-8">
        {ranking.slice(0, 3).map((creator, i) => {
          const title = getCreatorTitle(creator.score)
          return (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col items-center p-4 bg-surface border border-border rounded-2xl
                w-28 sm:w-36 ${creator.isUser ? 'border-accent/40' : ''}
                ${i === 0 ? 'order-2 -mt-3' : i === 1 ? 'order-1 mt-2' : 'order-3 mt-4'}`}
            >
              <span className={`text-lg font-bold ${podiumColors[i]}`}>#{i + 1}</span>
              <span className="text-3xl my-1">{creator.avatar}</span>
              <p className={`text-xs font-semibold text-center truncate w-full
                ${creator.isUser ? 'text-accent' : 'text-text-primary'}`}>
                {creator.name}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm">{title.badge}</span>
                <span className={`text-[10px] font-semibold ${title.color}`}>{title.title}</span>
              </div>
              <p className="text-text-muted text-[10px] mt-1">{creator.score} pts</p>
            </motion.div>
          )
        })}
      </div>

      {/* Full list */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_80px_60px] items-center px-4 py-2.5 border-b border-border
          text-[10px] font-medium text-text-muted uppercase tracking-wide">
          <span>#</span>
          <span>Criador</span>
          <span className="text-right">Titulo</span>
          <span className="text-right">Score</span>
        </div>

        {ranking.map((creator, i) => {
          const title = getCreatorTitle(creator.score)
          return (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.02 }}
              className={`grid grid-cols-[40px_1fr_80px_60px] items-center px-4 py-3 border-b border-border/30
                transition-colors ${creator.isUser ? 'bg-accent/5 border-l-2 border-l-accent' : 'hover:bg-surface-hover'}`}
            >
              <span className={`font-semibold text-sm ${creator.rank <= 3 ? 'text-yellow' : 'text-text-muted'}`}>
                {creator.rank}
              </span>

              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{creator.avatar}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${creator.isUser ? 'text-accent' : 'text-text-primary'}`}>
                    {creator.name}
                  </p>
                  <p className="text-text-muted text-[10px]">{creator.handle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 justify-end">
                <span className="text-sm">{title.badge}</span>
                <span className={`text-[10px] font-semibold ${title.color}`}>{title.title}</span>
              </div>

              <span className="text-right text-sm text-text-primary font-medium">
                {creator.score >= 1000 ? `${(creator.score / 1000).toFixed(1)}K` : creator.score}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

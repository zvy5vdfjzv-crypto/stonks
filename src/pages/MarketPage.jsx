import { useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Flame, Zap, User } from 'lucide-react'
import FeedCard from '../components/market/FeedCard'
import StatsModal from '../components/market/StatsModal'
import { useGame } from '../context/GameContext'
import { useLang } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'

const TABS = [
  { id: 'foryou', icon: User, labelPt: 'Pra Voce', labelEn: 'For You' },
  { id: 'exploding', icon: Flame, labelPt: 'Explodindo', labelEn: 'Exploding' },
  { id: 'niche', icon: Zap, labelPt: 'Seu Nicho', labelEn: 'Your Niche' },
]

export default function MarketPage() {
  const { trends } = useGame()
  const { lang } = useLang()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('foryou')
  const [statsTrend, setStatsTrend] = useState(null)

  const feedTrends = useMemo(() => {
    let sorted = [...trends]
    if (activeTab === 'exploding') {
      sorted.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    } else if (activeTab === 'niche') {
      const niches = user?.niches || []
      if (niches.length > 0) {
        sorted = sorted.filter(t => niches.includes(t.category))
      }
      sorted.sort((a, b) => b.volume - a.volume)
    } else {
      // "For You" - prioritize user niches then mix rest
      const niches = user?.niches || []
      if (niches.length > 0) {
        const inNiche = sorted.filter(t => niches.includes(t.category))
        const outNiche = sorted.filter(t => !niches.includes(t.category))
        inNiche.sort(() => Math.random() - 0.5)
        outNiche.sort(() => Math.random() - 0.5)
        sorted = [...inNiche, ...outNiche]
      } else {
        sorted.sort(() => Math.random() - 0.5)
      }
    }
    return sorted
  }, [trends, activeTab, user?.niches])

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 115px)' }}>
      {/* Tabs */}
      <div className="flex items-center justify-center gap-1 px-4 py-1.5 bg-[#0a0a0c]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold
              cursor-pointer transition-all
              ${activeTab === tab.id
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-text-secondary'
              }`}
          >
            <tab.icon size={13} />
            {lang === 'pt' ? tab.labelPt : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Feed - vertical scroll, snap to cards */}
      <div className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth">
        {feedTrends.map((trend, i) => (
          <FeedCard
            key={trend.id}
            trend={trend}
            index={i}
            onOpenStats={setStatsTrend}
          />
        ))}
      </div>

      <StatsModal
        isOpen={!!statsTrend}
        onClose={() => setStatsTrend(null)}
        trend={statsTrend}
      />
    </div>
  )
}

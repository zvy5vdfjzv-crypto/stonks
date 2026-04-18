import { useState, useMemo } from 'react'
import { Flame, Zap, User } from 'lucide-react'
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
      if (niches.length > 0) sorted = sorted.filter(t => niches.includes(t.category))
      sorted.sort((a, b) => b.volume - a.volume)
    } else {
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
    <div className="pb-16 max-w-[500px] mx-auto">
      {/* Tabs - sticky */}
      <div className="sticky top-[41px] sm:top-[45px] z-10 flex items-center justify-center gap-1 px-3 py-1.5 bg-[var(--bg-app)]/95 backdrop-blur-xl border-b border-border/30">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all
              ${activeTab === tab.id ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'}`}
          >
            <tab.icon size={12} />
            {lang === 'pt' ? tab.labelPt : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Feed - TikTok-style fluid scroll com snap */}
      <div className="snap-feed momentum-scroll">
        {feedTrends.map(trend => (
          <div key={trend.id} className="snap-item">
            <FeedCard trend={trend} onOpenStats={setStatsTrend} />
          </div>
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

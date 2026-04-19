// 🧠 CNBC-style ticker — "Terminal Bloomberg hackeado pela geracao TikTok"
// Faixa rolante horizontal infinita com tickers + variacao em mono.
// Isso sozinho ja muda a cara do app.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../../context/GameContext'

export default function NewsTicker() {
  const { trends, activeNews } = useGame()

  // Top 12 trends por volatilidade absoluta — mais interessante
  const tickerItems = useMemo(() => {
    return [...trends]
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
      .slice(0, 12)
  }, [trends])

  if (!tickerItems.length) return null

  // Duplicar lista pra loop continuo sem gap
  const loop = [...tickerItems, ...tickerItems]

  return (
    <div className="relative bg-[#000] border-y border-[#2a2a38] overflow-hidden h-8 flex items-center">
      {/* Mascara lateral — fade nos cantos */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      {/* Breaking news flash (quando tem noticia ativa) */}
      {activeNews && (
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center gap-2 bg-hype/15 border-r border-hype/30 px-3">
          <span className="w-1.5 h-1.5 rounded-full bg-hype animate-pulse" />
          <span className="text-hype font-mono-stonks text-[10px] font-bold uppercase tracking-widest">BREAKING</span>
        </div>
      )}

      {/* Ticker scrolling — translate=no pra nao traduzir $MOON em $LUA etc */}
      <div translate="no" className="flex animate-ticker-scroll whitespace-nowrap will-change-transform">
        {loop.map((trend, i) => {
          const isUp = trend.change24h >= 0
          return (
            <Link
              key={`${trend.id}-${i}`}
              to={`/trend/${trend.id}`}
              className="inline-flex items-center gap-2 px-5 font-mono-stonks text-[11px] no-underline hover:bg-white/5 transition-colors h-8"
            >
              <span className="text-text-secondary font-bold">{trend.ticker}</span>
              <span className="text-text-primary tabular-nums">{trend.price.toFixed(2)}</span>
              <span className={`${isUp ? 'text-money' : 'text-loss'} font-bold tabular-nums`}>
                {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{trend.change24h.toFixed(2)}%
              </span>
            </Link>
          )
        })}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-ticker-scroll {
          animation: ticker-scroll 60s linear infinite;
        }
        .animate-ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

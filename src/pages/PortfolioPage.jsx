// 🧠 FASE 5 — Portfolio refeito: Hero patrimony + sparklines inline + terminal log
// Briefing 4.8: "Valor Total" em display-xl mono HERO. Historico como log de terminal.
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Wallet, ArrowUp, ArrowDown, Briefcase, Flame, Terminal, Zap } from 'lucide-react'
import { sound } from '../lib/sound'
import { haptics } from '../lib/haptics'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import SparkLine from '../components/market/SparkLine'
import { useGame } from '../context/GameContext'
import { useLang } from '../context/LanguageContext'

// Agrupa transacoes por janela temporal
function groupTransactions(txs) {
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000
  const groups = { today: [], yesterday: [], thisWeek: [], older: [] }
  txs.forEach(tx => {
    const age = now - tx.timestamp
    if (age < DAY) groups.today.push(tx)
    else if (age < 2 * DAY) groups.yesterday.push(tx)
    else if (age < 7 * DAY) groups.thisWeek.push(tx)
    else groups.older.push(tx)
  })
  return groups
}

function formatTimestamp(ts) {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export default function PortfolioPage() {
  const { balance, holdings, transactions, trends, getPortfolioValue, getTotalPnL, initialBalance, sellAll, pendingTrades } = useGame()
  const { t } = useLang()
  const navigate = useNavigate()
  const [liquidating, setLiquidating] = useState(null) // id being liquidated

  const handlePanicSell = async (e, memeId, pnl) => {
    e.stopPropagation()
    setLiquidating(memeId)
    const res = await sellAll(memeId)
    if (res?.success) {
      if (pnl >= 0) { sound.gain(); haptics.fire('success') }
      else { sound.loss(); haptics.fire('loss') }
    } else {
      haptics.fire('denied')
    }
    setLiquidating(null)
  }

  const portfolioValue = getPortfolioValue()
  const totalPnL = getTotalPnL()
  const pnlPercent = (totalPnL / initialBalance) * 100
  const isPnLPositive = totalPnL >= 0

  const holdingsList = useMemo(() => {
    return Object.entries(holdings).map(([trendId, h]) => {
      const trend = trends.find(tr => tr.id === trendId)
      if (!trend) return null
      const currentValue = trend.price * h.quantity
      const pnl = (trend.price - h.avgPrice) * h.quantity
      const pnlPct = ((trend.price - h.avgPrice) / h.avgPrice * 100)
      return { ...h, trend, currentValue, pnl, pnlPct }
    }).filter(Boolean).sort((a, b) => b.currentValue - a.currentValue)
  }, [holdings, trends])

  const txGroups = useMemo(() => groupTransactions(transactions), [transactions])

  return (
    <div className="px-4 py-5 max-w-4xl mx-auto w-full pb-24">
      {/* 🦾 HERO: Patrimonio Total — display-xl mono, centralizado */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 mt-2"
      >
        <p className="text-text-muted text-[10px] font-mono-stonks uppercase tracking-[0.3em] mb-2">
          Patrimonio Total
        </p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-money font-mono-stonks text-lg font-medium">S$</span>
          <AnimatedNumber
            value={portfolioValue}
            decimals={2}
            className="font-mono-stonks font-bold text-[44px] sm:text-[56px] leading-none tabular-nums text-text-primary"
          />
        </div>
        {/* Variacao do dia — seta chunky + percentual */}
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-lg border font-mono-stonks font-bold text-sm
          ${isPnLPositive
            ? 'bg-money/10 text-money border-money/30'
            : 'bg-loss/10 text-loss border-loss/30'}`}>
          {isPnLPositive ? <ArrowUp size={16} strokeWidth={3} /> : <ArrowDown size={16} strokeWidth={3} />}
          <AnimatedNumber value={totalPnL} prefix={isPnLPositive ? '+S$' : 'S$'} decimals={2} />
          <span className="opacity-60">·</span>
          <AnimatedNumber value={pnlPercent} prefix={isPnLPositive ? '+' : ''} decimals={2} />%
        </div>
      </motion.div>

      {/* KPIs secundarios — denso tipo Bloomberg */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface border border-border rounded-xl p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet size={11} className="text-money" />
            <span className="text-text-muted text-[9px] font-mono-stonks uppercase tracking-wider">Saldo</span>
          </div>
          <p className="text-text-primary font-mono-stonks font-bold text-base tabular-nums">
            <AnimatedNumber value={balance} prefix="S$ " decimals={2} />
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-border rounded-xl p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Briefcase size={11} className="text-system" />
            <span className="text-text-muted text-[9px] font-mono-stonks uppercase tracking-wider">Posicoes</span>
          </div>
          <p className="text-text-primary font-mono-stonks font-bold text-base tabular-nums">
            {holdingsList.length}
          </p>
        </motion.div>
      </div>

      {/* Holdings — tabela densa com sparklines */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-text-primary font-mono-stonks font-bold text-xs uppercase tracking-[0.25em]">
          Posicoes
        </h2>
        {holdingsList.length > 0 && (
          <span className="text-text-muted text-[10px] font-mono-stonks">
            {holdingsList.length} ativos
          </span>
        )}
      </div>

      {holdingsList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-surface border border-border rounded-2xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-3">
            <Briefcase size={24} className="text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm font-mono-stonks uppercase tracking-wider">
            📉 Cofre vazio
          </p>
          <p className="text-text-muted text-xs mt-1 mb-4">Banca teu primeiro meme, bro</p>
          <Link to="/"
            className="inline-flex items-center gap-1.5 bg-money text-[#0a0a0f] px-5 py-2 rounded-lg
              text-xs font-mono-stonks font-bold uppercase tracking-wider no-underline transition-all hover:bg-money-dim glow-money">
            <Flame size={14} /> Explorar mercado
          </Link>
        </motion.div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-8">
          {holdingsList.map((h, i) => {
            const isUp = h.pnl >= 0
            return (
              <motion.div
                key={h.trend.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/trend/${h.trend.id}`)}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-surface-hover transition-colors border-b border-border/40 last:border-b-0"
              >
                {/* Emoji compacto */}
                <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center text-lg shrink-0">
                  {h.trend.emoji}
                </div>

                {/* Ticker + qty */}
                <div className="min-w-0 flex-shrink-0" style={{ width: '85px' }}>
                  <p className="font-mono-stonks font-bold text-text-primary text-xs">{h.trend.ticker}</p>
                  <p className="text-text-muted text-[10px] font-mono-stonks">
                    {h.quantity}x @ {h.avgPrice.toFixed(2)}
                  </p>
                </div>

                {/* Sparkline inline — cara de terminal */}
                <div className="flex-1 min-w-0 h-8 hidden sm:block">
                  <SparkLine data={h.trend.priceHistory.slice(-24)} positive={isUp} />
                </div>

                {/* Valor + PnL mono */}
                <div className="text-right shrink-0">
                  <p className="font-mono-stonks font-bold text-text-primary text-xs tabular-nums">
                    S$ {h.currentValue.toFixed(2)}
                  </p>
                  <p className={`font-mono-stonks text-[10px] font-bold tabular-nums flex items-center gap-0.5 justify-end
                    ${isUp ? 'text-money' : 'text-loss'}`}>
                    <span className="leading-none">{isUp ? '▲' : '▼'}</span>
                    {isUp ? '+' : ''}{h.pnlPct.toFixed(2)}%
                  </p>
                </div>

                {/* ⚡ PANIC SELL — liquidar posicao inteira */}
                <button
                  onClick={(e) => handlePanicSell(e, h.trend.id, h.pnl)}
                  disabled={liquidating === h.trend.id || pendingTrades > 0}
                  title={isUp ? 'Realizar lucro' : 'Cortar perda'}
                  className={`shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-mono-stonks font-bold uppercase tracking-wider
                    cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed
                    ${isUp
                      ? 'bg-money/10 text-money border-money/30 hover:bg-money/20'
                      : 'bg-loss/10 text-loss border-loss/30 hover:bg-loss/20'}`}
                >
                  <Zap size={11} strokeWidth={2.5} />
                  {liquidating === h.trend.id ? '...' : (isUp ? 'Lucro' : 'Sair')}
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Historico — estilo terminal log */}
      <div className="flex items-center gap-2 mb-3">
        <Terminal size={13} className="text-money" />
        <h2 className="text-text-primary font-mono-stonks font-bold text-xs uppercase tracking-[0.25em]">
          Log de Transacoes
        </h2>
      </div>

      {transactions.length === 0 ? (
        <p className="text-text-muted text-xs text-center py-8 font-mono-stonks uppercase tracking-wider">
          &gt; nenhuma transacao ainda
        </p>
      ) : (
        <div className="bg-[var(--bg-terminal)] border border-border rounded-xl p-3 font-mono-stonks text-[11px] terminal-grid">
          {Object.entries({
            today: 'HOJE',
            yesterday: 'ONTEM',
            thisWeek: 'ESTA SEMANA',
            older: 'ANTERIORES',
          }).map(([key, label]) => {
            const group = txGroups[key]
            if (!group || group.length === 0) return null
            return (
              <div key={key} className="mb-3 last:mb-0">
                <p className="text-text-muted text-[9px] uppercase tracking-[0.3em] mb-1.5 border-b border-border/30 pb-1">
                  &gt; {label} <span className="text-text-tertiary">[{group.length}]</span>
                </p>
                <div className="space-y-0.5">
                  {group.map((tx, i) => {
                    const trend = trends.find(tr => tr.id === tx.trendId)
                    const isBuy = tx.type === 'buy'
                    return (
                      <motion.div
                        key={tx.timestamp + '-' + i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="grid grid-cols-[70px_auto_1fr_auto] gap-2 items-baseline hover:bg-white/5 px-1.5 py-0.5 rounded"
                      >
                        <span className="text-text-tertiary tabular-nums text-[10px]">
                          {formatTimestamp(tx.timestamp)}
                        </span>
                        <span className={`font-bold uppercase px-1 ${isBuy ? 'text-money' : 'text-loss'}`}>
                          [{isBuy ? 'BUY' : 'SELL'}]
                        </span>
                        <span className="text-text-secondary truncate">
                          {tx.quantity}x {trend?.ticker || tx.trendId}
                          <span className="text-text-tertiary ml-1">@ {(tx.price || 0).toFixed(2)}</span>
                        </span>
                        <span className={`tabular-nums font-bold ${isBuy ? 'text-loss' : 'text-money'}`}>
                          {isBuy ? '-' : '+'}S${tx.total.toFixed(2)}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {/* Cursor piscando pra reforcar vibe terminal */}
          <p className="text-money text-[10px] mt-2">
            <span className="animate-pulse">▊</span>
          </p>
        </div>
      )}
    </div>
  )
}

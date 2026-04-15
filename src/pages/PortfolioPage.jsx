import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Briefcase, Flame } from 'lucide-react'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import { useGame } from '../context/GameContext'
import { useLang } from '../context/LanguageContext'

export default function PortfolioPage() {
  const { balance, holdings, transactions, trends, getPortfolioValue, getTotalPnL, initialBalance } = useGame()
  const { t } = useLang()
  const navigate = useNavigate()

  const portfolioValue = getPortfolioValue()
  const totalPnL = getTotalPnL()
  const pnlPercent = ((totalPnL / initialBalance) * 100).toFixed(2)
  const isPnLPositive = totalPnL >= 0

  const holdingsList = useMemo(() => {
    return Object.entries(holdings).map(([trendId, h]) => {
      const trend = trends.find(tr => tr.id === trendId)
      if (!trend) return null
      const currentValue = trend.price * h.quantity
      const pnl = (trend.price - h.avgPrice) * h.quantity
      const pnlPct = ((trend.price - h.avgPrice) / h.avgPrice * 100).toFixed(2)
      return { ...h, trend, currentValue, pnl, pnlPct }
    }).filter(Boolean).sort((a, b) => b.currentValue - a.currentValue)
  }, [holdings, trends])

  const recentTransactions = transactions.slice(0, 10)

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto w-full">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-text-primary mb-6"
      >
        {t('portfolio.title')}
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-2xl p-3"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Wallet size={14} className="text-green" />
            <span className="text-text-muted text-[10px] font-medium uppercase tracking-wider">{t('portfolio.balance')}</span>
          </div>
          {/* 🧠 NEUROMARKETING: Numeros rolantes no saldo — slot machine dopamina */}
          <p className="text-text-primary font-bold text-xl">
            <AnimatedNumber value={balance} prefix="S$ " decimals={2} />
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface border border-border rounded-2xl p-3"
        >
          <span className="text-text-muted text-[10px] font-medium uppercase tracking-wider">{t('portfolio.totalValue')}</span>
          {/* 🧠 NEUROMARKETING: Patrimonio total com spring animation */}
          <p className="text-text-primary font-bold text-xl mt-2">
            <AnimatedNumber value={portfolioValue} prefix="S$ " decimals={2} />
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-surface border rounded-2xl p-3 ${isPnLPositive ? 'border-green/20' : 'border-red/20'}`}
        >
          <span className="text-text-muted text-[10px] font-medium uppercase tracking-wider">{t('portfolio.totalPnL')}</span>
          {/* 🧠 NEUROMARKETING: PnL rolante — ver lucro subindo e dopaminergico */}
          <p className={`font-bold text-xl mt-2 ${isPnLPositive ? 'text-green' : 'text-red'}`}>
            <AnimatedNumber value={totalPnL} prefix={isPnLPositive ? '+S$ ' : 'S$ '} decimals={2} className={isPnLPositive ? 'text-green' : 'text-red'} />
          </p>
          <p className={`text-xs font-medium ${isPnLPositive ? 'text-green' : 'text-red'}`}>
            <AnimatedNumber value={parseFloat(pnlPercent)} prefix={isPnLPositive ? '+' : ''} decimals={2} className={isPnLPositive ? 'text-green' : 'text-red'} />%
          </p>
        </motion.div>
      </div>

      <h2 className="text-text-primary font-semibold text-sm uppercase tracking-wide mb-4">
        {t('portfolio.holdings')}
      </h2>

      {holdingsList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-surface border border-border rounded-2xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-3">
            <Briefcase size={24} className="text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm font-medium">{t('portfolio.noHoldings')}</p>
          <p className="text-text-muted text-xs mt-1 mb-4">Compre memes no mercado para comecar</p>
          <Link to="/"
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-white px-5 py-2 rounded-xl
              text-xs font-semibold no-underline transition-colors">
            <Flame size={14} /> Explorar mercado
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-2.5 mb-8">
          {holdingsList.map((h, i) => (
            <motion.div
              key={h.trend.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/trend/${h.trend.id}`)}
              className="bg-surface border border-border rounded-xl p-4 cursor-pointer
                hover:bg-surface-hover hover:border-accent/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-xl">
                    {h.trend.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{h.trend.name}</p>
                    <p className="text-text-muted text-xs">
                      {h.quantity} {t('portfolio.shares')} @ S$ {h.avgPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary text-sm">
                    S$ {h.currentValue.toFixed(2)}
                  </p>
                  <div className={`flex items-center gap-1 justify-end text-xs font-medium
                    ${h.pnl >= 0 ? 'text-green' : 'text-red'}`}
                  >
                    {h.pnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{h.pnl >= 0 ? '+' : ''}S$ {h.pnl.toFixed(2)} ({h.pnlPct}%)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <h2 className="text-text-primary font-semibold text-sm uppercase tracking-wide mb-4">
        {t('portfolio.history')}
      </h2>

      {recentTransactions.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-8">{t('portfolio.noHistory')}</p>
      ) : (
        <div className="space-y-1.5 pb-20">
          {recentTransactions.map((tx, i) => {
            const trend = trends.find(tr => tr.id === tx.trendId)
            const isBuy = tx.type === 'buy'
            return (
              <motion.div
                key={tx.timestamp + i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between bg-surface border border-border
                  rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md
                    ${isBuy ? 'bg-green/15 text-green' : 'bg-red/15 text-red'}`}>
                    {isBuy ? t('portfolio.bought') : t('portfolio.sold')}
                  </span>
                  <span className="text-text-primary text-sm">
                    {tx.quantity}x {trend?.emoji} {trend?.ticker || tx.trendId}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${isBuy ? 'text-red' : 'text-green'}`}>
                  {isBuy ? '-' : '+'}S$ {tx.total.toFixed(2)}
                </span>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

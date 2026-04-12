import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useGame } from '../../context/GameContext'
import { useLang } from '../../context/LanguageContext'

export default function TradeModal({ isOpen, onClose, trend, mode = 'buy' }) {
  const [quantity, setQuantity] = useState('')
  const [activeTab, setActiveTab] = useState(mode)
  const [showSuccess, setShowSuccess] = useState(false)
  const { balance, holdings, buy, sell } = useGame()
  const { t } = useLang()

  if (!trend) return null

  const qty = parseInt(quantity) || 0
  const total = qty * trend.price
  const holding = holdings[trend.id]
  const canBuy = qty > 0 && total <= balance
  const canSell = qty > 0 && holding && holding.quantity >= qty

  const handleTrade = () => {
    if (activeTab === 'buy' && canBuy) {
      buy(trend.id, qty)
    } else if (activeTab === 'sell' && canSell) {
      sell(trend.id, qty)
    } else {
      return
    }
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setQuantity('')
      onClose()
    }, 1500)
  }

  const setMax = () => {
    if (activeTab === 'buy') {
      setQuantity(String(Math.floor(balance / trend.price)))
    } else if (holding) {
      setQuantity(String(holding.quantity))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${trend.emoji} ${trend.name}`}>
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center py-10"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-5xl mb-4"
            >
              {activeTab === 'buy' ? '🚀' : '💰'}
            </motion.div>
            <p className="text-green font-semibold text-lg">
              {t('trade.success')}
            </p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex mb-5 bg-surface-hover rounded-xl p-1">
              {['buy', 'sell'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setQuantity('') }}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all
                    ${activeTab === tab
                      ? tab === 'buy'
                        ? 'bg-green text-white shadow-md'
                        : 'bg-red text-white shadow-md'
                      : 'bg-transparent text-text-muted hover:text-text-secondary'
                    }`}
                >
                  {t(`trade.${tab}`)}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>{t('market.price')}</span>
                  <span className="text-green font-medium">S$ {trend.price.toFixed(2)}</span>
                </div>
                {activeTab === 'buy' && (
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>{t('portfolio.balance')}</span>
                    <span className="font-medium">S$ {balance.toFixed(2)}</span>
                  </div>
                )}
                {activeTab === 'sell' && holding && (
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>{t('portfolio.shares')}</span>
                    <span className="font-medium">{holding.quantity}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1.5 font-medium">
                  {t('trade.quantity')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={t('trade.enterQuantity')}
                    className="flex-1 bg-surface-hover border border-border rounded-xl px-3.5 py-2.5
                      text-text-primary text-sm focus:outline-none focus:border-accent/50
                      placeholder:text-text-muted transition-colors"
                  />
                  <button
                    onClick={setMax}
                    className="bg-surface-hover border border-border rounded-xl px-3.5 py-2.5
                      text-xs text-accent font-semibold cursor-pointer hover:border-accent/50 transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {qty > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-surface-hover rounded-xl p-3"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">{t('trade.total')}</span>
                    <span className={`font-bold ${activeTab === 'buy' ? 'text-green' : 'text-red'}`}>
                      S$ {total.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              )}

              <Button
                variant={activeTab === 'buy' ? 'green' : 'red'}
                onClick={handleTrade}
                disabled={activeTab === 'buy' ? !canBuy : !canSell}
                className="w-full py-3"
              >
                {t(`trade.${activeTab}`)} {qty > 0 ? `${qty}x ${trend.ticker}` : ''}
              </Button>

              {activeTab === 'buy' && qty > 0 && !canBuy && (
                <p className="text-red text-xs text-center">{t('trade.insufficientFunds')}</p>
              )}
              {activeTab === 'sell' && qty > 0 && !canSell && (
                <p className="text-red text-xs text-center">{t('trade.insufficientShares')}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}

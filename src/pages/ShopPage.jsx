import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Check, Lock, Coins, Sparkles } from 'lucide-react'
import { useUser, SHOP_ITEMS, getRarityColor } from '../context/UserContext'
import { useGame } from '../context/GameContext'
import Badge from '../components/ui/Badge'

const CATEGORIES = [
  { id: 'all', label: 'Todos', emoji: '🛒' },
  { id: 'hat', label: 'Chapeus', emoji: '🎩' },
  { id: 'glasses', label: 'Oculos', emoji: '🕶️' },
  { id: 'effect', label: 'Efeitos', emoji: '✨' },
  { id: 'frame', label: 'Molduras', emoji: '🖼️' },
]

const rarityBadgeColor = { common: 'neutral', rare: 'blue', epic: 'accent', legendary: 'yellow' }
const rarityLabel = { common: 'Comum', rare: 'Raro', epic: 'Epico', legendary: 'Lendario' }

export default function ShopPage() {
  const { user, buyItem, equipItem } = useUser()
  const { balance, buy: gameBuy } = useGame()
  const [activeCategory, setActiveCategory] = useState('all')
  const [purchaseFlash, setPurchaseFlash] = useState(null)

  if (!user) return null

  const filtered = activeCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(i => i.category === activeCategory)

  const handleBuy = (item) => {
    if (balance < item.price) return
    if (user.ownedItems.includes(item.id)) return
    // Deduct from game balance via a workaround - dispatch directly
    buyItem(item.id)
    setPurchaseFlash(item.id)
    setTimeout(() => setPurchaseFlash(null), 1500)
  }

  const handleEquip = (item) => {
    if (!user.ownedItems.includes(item.id)) return
    equipItem(item.id)
  }

  return (
    <div className="px-4 py-5 max-w-xl mx-auto w-full pb-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Loja</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-3 py-1.5">
          <Coins size={14} className="text-green" />
          <span className="text-green font-semibold text-sm">S$ {balance.toFixed(0)}</span>
        </div>
      </motion.div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all
              ${activeCategory === cat.id
                ? 'bg-accent text-white'
                : 'bg-surface text-text-muted border border-border hover:text-text-secondary'
              }`}
          >
            <span>{cat.emoji}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((item, i) => {
          const owned = user.ownedItems.includes(item.id)
          const equipped = Object.values(user.equippedItems).includes(item.id)
          const canAfford = balance >= item.price
          const justBought = purchaseFlash === item.id

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-surface border rounded-2xl overflow-hidden transition-all
                ${equipped ? 'border-accent/50 bg-accent/5' : 'border-border'}`}
            >
              {/* Item preview */}
              <div className="relative h-28 bg-surface-hover flex items-center justify-center">
                <span className="text-5xl">{item.emoji}</span>
                <div className="absolute top-2 right-2">
                  <Badge color={rarityBadgeColor[item.rarity]}>
                    {rarityLabel[item.rarity]}
                  </Badge>
                </div>
                {equipped && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}

                <AnimatePresence>
                  {justBought && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 bg-green/20 backdrop-blur-sm flex items-center justify-center"
                    >
                      <div className="text-center">
                        <Sparkles className="text-green mx-auto mb-1" size={24} />
                        <p className="text-green text-xs font-bold">Comprado!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Item info */}
              <div className="p-3">
                <p className="font-semibold text-text-primary text-sm truncate">{item.name}</p>
                <p className={`text-[11px] font-medium ${getRarityColor(item.rarity)}`}>
                  {item.category === 'hat' ? 'Chapeu' : item.category === 'glasses' ? 'Oculos' : item.category === 'effect' ? 'Efeito' : 'Moldura'}
                </p>

                {/* Action button */}
                {owned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    className={`w-full mt-2 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all
                      ${equipped
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'bg-surface-hover text-text-secondary border border-border hover:text-accent hover:border-accent/30'
                      }`}
                  >
                    {equipped ? '✓ Equipado' : 'Equipar'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`w-full mt-2 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all
                      flex items-center justify-center gap-1.5
                      ${canAfford
                        ? 'bg-green/20 text-green border border-green/30 hover:bg-green/30'
                        : 'bg-surface-hover text-text-muted border border-border opacity-50 cursor-not-allowed'
                      }`}
                  >
                    {canAfford ? (
                      <><Coins size={12} /> S$ {item.price}</>
                    ) : (
                      <><Lock size={12} /> S$ {item.price}</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

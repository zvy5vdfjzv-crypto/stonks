import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Check, Lock, Coins, Sparkles, Gift, Zap } from 'lucide-react'
import CoinRain from '../components/ui/CoinRain'
import LootboxReveal from '../components/ui/LootboxReveal'
import UserAvatar from '../components/ui/UserAvatar'
import UserCharacter from '../components/avatar/UserCharacter'
import { CHARACTER_CLASSES } from '../data/characters'
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

const rarityBadgeColor = { common: 'neutral', rare: 'blue', epic: 'accent', legendary: 'yellow', mythic: 'pink' }
const rarityLabel = { common: 'Comum', rare: 'Raro', epic: 'Epico', legendary: 'Lendario', mythic: 'Mitico' }
// 🧠 Classes CSS por raridade — briefing 4.5: "sentida em 0.2s sem ler texto"
const rarityCardClass = {
  common: 'rarity-common',
  rare: 'rarity-rare',
  epic: 'rarity-epic',
  legendary: 'rarity-legendary',
  mythic: 'rarity-mythic',
}

// 🧠 NEUROMARKETING: Lootboxes — economia de status + dopamina de revelacao aleatoria
// Probabilidades calibradas para dar "quase-ganho" frequente (efeito cassino)
const LOOTBOXES = [
  {
    id: 'box-basic', name: 'Caixa Bronze', price: 200, emoji: '📦',
    color: 'from-amber-700 to-amber-900',
    borderColor: 'border-amber-600/50',
    odds: { common: 60, rare: 30, epic: 8, legendary: 2 },
  },
  {
    id: 'box-premium', name: 'Caixa Dourada', price: 500, emoji: '🎁',
    color: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-400/50',
    odds: { common: 30, rare: 40, epic: 22, legendary: 8 },
  },
  {
    id: 'box-legendary', name: 'Caixa Diamante', price: 1500, emoji: '💎',
    color: 'from-accent to-pink',
    borderColor: 'border-accent/50',
    odds: { common: 5, rare: 25, epic: 45, legendary: 25 },
  },
]

export default function ShopPage() {
  const { user, buyItem, equipItem } = useUser()
  const { balance, buy: gameBuy } = useGame()
  const [activeCategory, setActiveCategory] = useState('all')
  const [purchaseFlash, setPurchaseFlash] = useState(null)
  // 🧠 NEUROMARKETING: Lootbox states — animacao de revelacao = pico de dopamina
  const [lootboxOpening, setLootboxOpening] = useState(null) // box id being opened
  const [lootboxPhase, setLootboxPhase] = useState('idle') // idle, spinning, reveal
  const [lootboxResult, setLootboxResult] = useState(null) // won item
  const [showCoinRain, setShowCoinRain] = useState(false)

  const openLootbox = useCallback((box) => {
    if (balance < box.price) return
    if (lootboxPhase !== 'idle') return

    navigator.vibrate?.([50, 30, 50]) // 🧠 Haptic anticipation pattern
    setLootboxOpening(box.id)
    setLootboxPhase('spinning')

    // Roll rarity based on odds
    const roll = Math.random() * 100
    let rarity = 'common'
    let cumulative = 0
    for (const [r, chance] of Object.entries(box.odds)) {
      cumulative += chance
      if (roll < cumulative) { rarity = r; break }
    }

    // Pick random unowned item of that rarity, or any if all owned
    const candidates = SHOP_ITEMS.filter(i => i.rarity === rarity && !user.ownedItems.includes(i.id))
    const allOfRarity = SHOP_ITEMS.filter(i => i.rarity === rarity)
    const won = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : allOfRarity[Math.floor(Math.random() * allOfRarity.length)]

    // Spinning phase — builds anticipation
    setTimeout(() => {
      setLootboxPhase('reveal')
      setLootboxResult(won)
      navigator.vibrate?.([100]) // 🧠 Reveal haptic
      if (won.rarity === 'legendary' || won.rarity === 'epic') {
        setShowCoinRain(true) // 🧠 Jackpot visual para raridades altas
      }
      // Actually give the item
      if (!user.ownedItems.includes(won.id)) {
        buyItem(won.id)
      }
    }, 2000)

    // Reset after reveal
    setTimeout(() => {
      setLootboxPhase('idle')
      setLootboxOpening(null)
      setLootboxResult(null)
    }, 5000)
  }, [balance, lootboxPhase, user.ownedItems, buyItem])

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
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Loja</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-3 py-1.5">
          <Coins size={14} className="text-money" />
          <span className="text-money font-mono-stonks font-bold text-sm tabular-nums">S$ {balance.toFixed(0)}</span>
        </div>
      </motion.div>

      {/* 🏰 PREVIEW do PERSONAGEM RPG com items equipados */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-[#14141c] to-[#0a0a0f] border border-border rounded-2xl p-4 mb-5 flex items-center gap-4"
      >
        <UserCharacter size={112} className="rounded-2xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-text-muted text-[10px] font-mono-stonks uppercase tracking-widest mb-0.5">Seu Personagem</p>
          <p className="text-text-primary font-display font-bold text-base truncate">
            {CHARACTER_CLASSES.find(c => c.id === user.characterClass)?.name || 'Humano'}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['hat', 'glasses', 'effect', 'frame'].map(cat => {
              const eqId = user.equippedItems?.[cat]
              const item = eqId ? SHOP_ITEMS.find(i => i.id === eqId) : null
              const isHighRarity = item && (item.rarity === 'legendary' || item.rarity === 'mythic')
              return (
                <span key={cat} className={`text-[9px] px-2 py-0.5 rounded border font-mono-stonks uppercase tracking-wider
                  ${item
                    ? isHighRarity ? 'border-yellow/50 text-yellow bg-yellow/10' : 'border-money/30 text-money bg-money/10'
                    : 'border-border text-text-muted bg-surface/50'}`}>
                  {cat === 'hat' ? 'Elmo' : cat === 'glasses' ? 'Visor' : cat === 'effect' ? 'Aura' : 'Moldura'}
                  {item && <span className="opacity-70 ml-1">✓</span>}
                </span>
              )
            })}
          </div>
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

      {/* 🧠 NEUROMARKETING: Secao de Lootbox — economia de status + revelacao aleatoria */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Gift size={18} className="text-yellow" />
          <h2 className="text-text-primary font-bold text-sm">Caixa Misteriosa</h2>
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-[10px] bg-yellow/20 text-yellow px-2 py-0.5 rounded-full font-bold"
          >
            NOVO
          </motion.span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {LOOTBOXES.map(box => {
            const isOpening = lootboxOpening === box.id
            const canAfford = balance >= box.price
            return (
              <motion.div
                key={box.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`relative bg-surface border rounded-2xl overflow-hidden transition-all
                  ${isOpening ? 'border-yellow/60 shadow-[0_0_20px_#FECA5740]' : box.borderColor}`}
              >
                {/* Box visual */}
                <div className={`h-24 bg-gradient-to-br ${box.color} flex items-center justify-center relative`}>
                  <AnimatePresence mode="wait">
                    {isOpening && lootboxPhase === 'spinning' ? (
                      <motion.div
                        key="spin"
                        animate={{ rotateY: [0, 360, 720, 1080] }}
                        transition={{ duration: 1.8, ease: 'easeInOut' }}
                        className="text-4xl"
                      >
                        {box.emoji}
                      </motion.div>
                    ) : isOpening && lootboxPhase === 'reveal' && lootboxResult ? (
                      <motion.div
                        key="reveal"
                        initial={{ scale: 0, rotateZ: -20 }}
                        animate={{ scale: 1, rotateZ: 0 }}
                        className="text-center"
                      >
                        <span className="text-4xl drop-shadow-lg">{lootboxResult.emoji}</span>
                        <p className={`text-[10px] font-bold mt-0.5 ${getRarityColor(lootboxResult.rarity)}`}>
                          {rarityLabel[lootboxResult.rarity]}!
                        </p>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="idle"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-4xl drop-shadow-lg"
                      >
                        {box.emoji}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Odds bar visual */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex h-1 rounded-full overflow-hidden bg-black/30">
                    <div className="bg-text-muted/60" style={{ width: `${box.odds.common}%` }} title="Comum" />
                    <div className="bg-blue/70" style={{ width: `${box.odds.rare}%` }} title="Raro" />
                    <div className="bg-accent/80" style={{ width: `${box.odds.epic}%` }} title="Epico" />
                    <div className="bg-yellow/90" style={{ width: `${box.odds.legendary}%` }} title="Lendario" />
                  </div>
                </div>
                {/* Box info */}
                <div className="p-2.5 text-center">
                  <p className="text-text-primary font-semibold text-xs">{box.name}</p>
                  <button
                    onClick={() => openLootbox(box)}
                    disabled={!canAfford || lootboxPhase !== 'idle'}
                    className={`w-full mt-1.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all
                      flex items-center justify-center gap-1
                      ${canAfford && lootboxPhase === 'idle'
                        ? 'bg-yellow/20 text-yellow border border-yellow/30 hover:bg-yellow/30'
                        : 'bg-surface-hover text-text-muted border border-border opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <Zap size={10} /> S$ {box.price}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
        {/* 🧠 NEUROMARKETING: "Quase ganhou lendario" — near-miss messaging */}
        <p className="text-text-muted text-[10px] text-center mt-2">
          Cada caixa contem 1 item aleatorio. Raridade depende da sorte! 🍀
        </p>
      </div>

      {/* Coin rain for epic/legendary lootbox wins */}
      <CoinRain active={showCoinRain} onDone={() => setShowCoinRain(false)} />

      {/* 🧠 FASE 4: LootboxReveal — ritual tela cheia (briefing 4.6) */}
      <LootboxReveal
        isOpen={lootboxPhase !== 'idle'}
        phase={lootboxPhase}
        box={LOOTBOXES.find(b => b.id === lootboxOpening)}
        result={lootboxResult}
        onClose={() => { setLootboxPhase('idle'); setLootboxOpening(null); setLootboxResult(null) }}
        onSkip={() => { setLootboxPhase('idle'); setLootboxOpening(null); setLootboxResult(null) }}
      />

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((item, i) => {
          const owned = user.ownedItems.includes(item.id)
          const equipped = Object.values(user.equippedItems).includes(item.id)
          const canAfford = balance >= item.price
          const justBought = purchaseFlash === item.id

          const rarityClass = rarityCardClass[item.rarity] || 'rarity-common'
          const isHighRarity = item.rarity === 'legendary' || item.rarity === 'mythic'

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -2 }}
              className={`bg-surface rounded-2xl overflow-hidden transition-all ${rarityClass}
                ${equipped ? 'ring-2 ring-money/50' : ''}`}
            >
              {/* Item preview */}
              <div className="relative h-28 bg-surface-hover flex items-center justify-center overflow-hidden">
                {/* Particulas flutuantes pra lendario/mitico */}
                {isHighRarity && (
                  <>
                    <span className="rarity-particle" style={{ left: '15%', bottom: '10%', animationDelay: '0s', color: item.rarity === 'mythic' ? '#ff2d6b' : '#ffb800' }}>✦</span>
                    <span className="rarity-particle" style={{ left: '75%', bottom: '15%', animationDelay: '1s', color: item.rarity === 'mythic' ? '#ff2d6b' : '#ffb800' }}>✦</span>
                    <span className="rarity-particle" style={{ left: '45%', bottom: '8%', animationDelay: '2s', color: item.rarity === 'mythic' ? '#ff2d6b' : '#ffb800' }}>✧</span>
                  </>
                )}
                <span className="text-5xl relative z-10" style={isHighRarity ? { filter: `drop-shadow(0 0 8px ${item.rarity === 'mythic' ? '#ff2d6b88' : '#ffb80088'})` } : {}}>
                  {item.emoji}
                </span>
                <div className="absolute top-2 right-2 z-10">
                  <Badge color={rarityBadgeColor[item.rarity]}>
                    {rarityLabel[item.rarity]}
                  </Badge>
                </div>
                {equipped && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-money flex items-center justify-center z-10">
                    <Check size={12} className="text-[#0a0a0f]" strokeWidth={3} />
                  </div>
                )}

                <AnimatePresence>
                  {justBought && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 bg-money/20 backdrop-blur-sm flex items-center justify-center z-20"
                    >
                      <div className="text-center">
                        <Sparkles className="text-money mx-auto mb-1" size={24} />
                        <p className="text-money text-xs font-bold font-mono-stonks uppercase tracking-wider">Comprado!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Item info */}
              <div className="p-3">
                <p className={`font-semibold text-sm truncate
                  ${item.rarity === 'legendary' ? 'font-mono-stonks text-[#ffb800]' : ''}
                  ${item.rarity === 'mythic' ? 'font-mono-stonks text-[#ff2d6b]' : ''}
                  ${item.rarity !== 'legendary' && item.rarity !== 'mythic' ? 'text-text-primary' : ''}`}>
                  {item.name}
                </p>
                <p className={`text-[11px] font-medium ${getRarityColor(item.rarity)}`}>
                  {item.category === 'hat' ? 'Chapeu' : item.category === 'glasses' ? 'Oculos' : item.category === 'effect' ? 'Efeito' : 'Moldura'}
                </p>

                {/* Action button */}
                {owned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    className={`w-full mt-2 py-2 rounded-lg text-[11px] font-mono-stonks font-bold uppercase tracking-wider cursor-pointer transition-all
                      ${equipped
                        ? 'bg-money/15 text-money border border-money/30'
                        : 'bg-surface-hover text-text-secondary border border-border hover:text-money hover:border-money/30'
                      }`}
                  >
                    {equipped ? '✓ Equipado' : 'Equipar'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`w-full mt-2 py-2 rounded-lg text-[11px] font-mono-stonks font-bold uppercase tracking-wider cursor-pointer transition-all
                      flex items-center justify-center gap-1.5
                      ${canAfford
                        ? 'bg-money/15 text-money border border-money/30 hover:bg-money/25'
                        : 'bg-surface-hover text-text-muted border border-border opacity-50 cursor-not-allowed'
                      }`}
                  >
                    {canAfford ? (
                      <><Coins size={12} /> <span className="tabular-nums">S$ {item.price}</span></>
                    ) : (
                      <><Lock size={12} /> <span className="tabular-nums">S$ {item.price}</span></>
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

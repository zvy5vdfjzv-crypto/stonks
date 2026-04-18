// 🏦 GameContext — Supabase-backed economy.
// Toda compra/venda passa pela RPC `trade_meme` (server-side, anti-fraude).
// Saldo vem de profiles.hype_coins_balance. Precos de memes (realtime).
// Holdings derivados de transactions. News eh apenas ambience (nao move preco).
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from './UserContext'
import useMemeMarket from '../hooks/useMemeMarket'
import { newsEvents } from '../data/news'

const INITIAL_BALANCE = 1000

const GameContext = createContext()

export function GameProvider({ children, lang }) {
  const { user, session } = useUser()
  const { memes, loading: memesLoading } = useMemeMarket()

  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [transactions, setTransactions] = useState([])
  const [activeNews, setActiveNews] = useState(null)
  const [newsHistory, setNewsHistory] = useState([])
  const [pendingTrades, setPendingTrades] = useState(0)
  const newsIndexRef = useRef(0)

  // Carregar saldo do user
  useEffect(() => {
    if (!user?.id) {
      setBalance(INITIAL_BALANCE)
      return
    }
    const loadBalance = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('hype_coins_balance')
        .eq('id', user.id)
        .single()
      if (data) setBalance(Number(data.hype_coins_balance || INITIAL_BALANCE))
    }
    loadBalance()
  }, [user?.id])

  // Subscribe ao balance (realtime)
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`profile_balance_${user.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new?.hype_coins_balance !== undefined) {
            setBalance(Number(payload.new.hype_coins_balance))
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  // Carregar transactions do user + realtime
  useEffect(() => {
    if (!user?.id) {
      setTransactions([])
      return
    }
    const load = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200)
      if (data) {
        setTransactions(data.map(t => ({
          type: t.transaction_type,
          trendId: t.meme_id,
          quantity: Number(t.amount),
          price: Number(t.price_at_transaction),
          total: Number(t.total_cost),
          timestamp: new Date(t.created_at).getTime(),
        })))
      }
    }
    load()

    const channel = supabase
      .channel(`tx_${user.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const t = payload.new
          if (!t) return
          setTransactions(prev => [{
            type: t.transaction_type,
            trendId: t.meme_id,
            quantity: Number(t.amount),
            price: Number(t.price_at_transaction),
            total: Number(t.total_cost),
            timestamp: new Date(t.created_at).getTime(),
          }, ...prev])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  // News events — apenas ambience (nao movem preco mais)
  useEffect(() => {
    const interval = setInterval(() => {
      const newsItem = newsEvents[newsIndexRef.current % newsEvents.length]
      newsIndexRef.current += 1
      const headline = newsItem.headline[lang] || newsItem.headline.pt
      setActiveNews(headline)
      setNewsHistory(prev => [{ headline, timestamp: Date.now() }, ...prev].slice(0, 20))
    }, 15000)
    return () => clearInterval(interval)
  }, [lang])

  // 💰 RPC trade_meme — toda transacao passa por aqui
  const executeTrade = useCallback(async (memeId, action, quantity) => {
    if (!session?.user?.id || !user?.id) {
      return { success: false, error: 'Nao logado' }
    }
    if (quantity <= 0) return { success: false, error: 'Quantidade invalida' }

    setPendingTrades(n => n + 1)
    try {
      const { data, error } = await supabase.rpc('trade_meme', {
        p_user_id: user.id,
        p_meme_id: memeId,
        p_action: action,
        p_amount: quantity,
      })
      if (error) {
        console.warn('trade_meme error:', error.message)
        return { success: false, error: error.message }
      }
      return data || { success: true }
    } catch (err) {
      console.error('trade RPC exception:', err)
      return { success: false, error: err.message || 'Erro de rede' }
    } finally {
      setPendingTrades(n => n - 1)
    }
  }, [session?.user?.id, user?.id])

  const buy = useCallback((memeId, quantity) => {
    return executeTrade(memeId, 'buy', quantity)
  }, [executeTrade])

  const sell = useCallback((memeId, quantity) => {
    return executeTrade(memeId, 'sell', quantity)
  }, [executeTrade])

  // Vender tudo (panic sell)
  const sellAll = useCallback((memeId) => {
    const holding = holdings[memeId]
    if (!holding || holding.quantity <= 0) return Promise.resolve({ success: false, error: 'Sem posicao' })
    return executeTrade(memeId, 'sell', holding.quantity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeTrade, transactions])

  // Holdings derivados de transactions
  const holdings = (() => {
    const map = {}
    // Percorre em ordem cronologica pra calcular avgPrice corretamente
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp)
    for (const tx of sorted) {
      if (!map[tx.trendId]) map[tx.trendId] = { quantity: 0, avgPrice: 0 }
      const h = map[tx.trendId]
      if (tx.type === 'buy') {
        const newQty = h.quantity + tx.quantity
        h.avgPrice = newQty > 0 ? (h.avgPrice * h.quantity + tx.price * tx.quantity) / newQty : 0
        h.quantity = newQty
      } else {
        h.quantity = Math.max(0, h.quantity - tx.quantity)
        if (h.quantity === 0) h.avgPrice = 0
      }
    }
    // Remove holdings zerados
    for (const id of Object.keys(map)) {
      if (map[id].quantity <= 0) delete map[id]
    }
    return map
  })()

  const getTrend = useCallback((id) => {
    return memes.find(m => m.id === id)
  }, [memes])

  const getPortfolioValue = useCallback(() => {
    let total = Number(balance) || 0
    for (const [memeId, h] of Object.entries(holdings)) {
      const m = memes.find(x => x.id === memeId)
      if (m) total += m.price * h.quantity
    }
    return Number(total.toFixed(2))
  }, [balance, holdings, memes])

  const getTotalPnL = useCallback(() => {
    return Number((getPortfolioValue() - INITIAL_BALANCE).toFixed(2))
  }, [getPortfolioValue])

  // createMeme — cria meme novo no DB (insert direto nao e permitido por RLS,
  // entao precisa ser via RPC futura; por enquanto noop)
  const createMeme = useCallback(async (memeData) => {
    console.warn('createMeme — feature em desenvolvimento (Fase 4)')
    return { success: false, error: 'Criacao de memes em breve' }
  }, [])

  return (
    <GameContext.Provider value={{
      balance,
      trends: memes,
      holdings,
      transactions,
      activeNews,
      newsHistory,
      pendingTrades,
      memesLoading,
      buy,
      sell,
      sellAll,
      createMeme,
      getTrend,
      getPortfolioValue,
      getTotalPnL,
      initialBalance: INITIAL_BALANCE,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}

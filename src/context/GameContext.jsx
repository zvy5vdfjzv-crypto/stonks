import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import { initialTrends } from '../data/trends'
import { newsEvents } from '../data/news'

const INITIAL_BALANCE = 10000
const TICK_INTERVAL = 3000
const NEWS_INTERVAL = 15000

const initialState = {
  balance: INITIAL_BALANCE,
  trends: initialTrends,
  holdings: {},
  transactions: [],
  activeNews: null,
  newsHistory: [],
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'TICK_PRICES': {
      const trends = state.trends.map(trend => {
        const volatility = 0.02 + Math.random() * 0.03
        const drift = trend.change24h > 0 ? 0.001 : -0.001
        const change = (Math.random() - 0.48 + drift) * trend.price * volatility
        const newPrice = parseFloat(Math.max(trend.price + change, 0.5).toFixed(2))
        const newHistory = [...trend.priceHistory.slice(1), { time: trend.priceHistory.length, price: newPrice }]
        const oldestPrice = newHistory[0].price
        const newChange = parseFloat((((newPrice - oldestPrice) / oldestPrice) * 100).toFixed(2))
        return { ...trend, price: newPrice, priceHistory: newHistory, change24h: newChange }
      })
      return { ...state, trends }
    }

    case 'APPLY_NEWS_IMPACT': {
      const { newsItem, lang } = action.payload
      const trends = state.trends.map(trend => {
        const impactPercent = newsItem.impact[trend.id]
        if (!impactPercent) return trend
        const priceChange = trend.price * (impactPercent / 100)
        const newPrice = parseFloat(Math.max(trend.price + priceChange, 0.5).toFixed(2))
        return { ...trend, price: newPrice, change24h: parseFloat((trend.change24h + impactPercent).toFixed(2)) }
      })
      const headline = newsItem.headline[lang] || newsItem.headline.pt
      return {
        ...state,
        trends,
        activeNews: headline,
        newsHistory: [{ headline, timestamp: Date.now() }, ...state.newsHistory].slice(0, 20),
        _lastEvent: { type: 'news', headline, timestamp: Date.now() },
      }
    }

    case 'BUY': {
      const { trendId, quantity, price } = action.payload
      const total = price * quantity
      if (total > state.balance) return state
      const existing = state.holdings[trendId] || { quantity: 0, avgPrice: 0 }
      const newQty = existing.quantity + quantity
      const newAvg = (existing.avgPrice * existing.quantity + price * quantity) / newQty
      return {
        ...state,
        balance: parseFloat((state.balance - total).toFixed(2)),
        holdings: { ...state.holdings, [trendId]: { quantity: newQty, avgPrice: parseFloat(newAvg.toFixed(2)) } },
        transactions: [{ type: 'buy', trendId, quantity, price, total, timestamp: Date.now() }, ...state.transactions],
        _lastEvent: { type: 'buy', quantity, trendId, timestamp: Date.now() },
      }
    }

    case 'SELL': {
      const { trendId, quantity, price } = action.payload
      const existing = state.holdings[trendId]
      if (!existing || existing.quantity < quantity) return state
      const total = price * quantity
      const newQty = existing.quantity - quantity
      const newHoldings = { ...state.holdings }
      if (newQty === 0) {
        delete newHoldings[trendId]
      } else {
        newHoldings[trendId] = { ...existing, quantity: newQty }
      }
      return {
        ...state,
        balance: parseFloat((state.balance + total).toFixed(2)),
        holdings: newHoldings,
        transactions: [{ type: 'sell', trendId, quantity, price, total, timestamp: Date.now() }, ...state.transactions],
        _lastEvent: { type: 'sell', quantity, trendId, timestamp: Date.now() },
      }
    }

    case 'CREATE_MEME': {
      const { name, ticker, category, description, thumbnail, youtubeId } = action.payload
      const basePrice = parseFloat((1 + Math.random() * 20).toFixed(2))
      const history = []
      let p = basePrice
      for (let i = 0; i < 48; i++) {
        p = parseFloat(Math.max(p + (Math.random() - 0.45) * basePrice * 0.05, 0.5).toFixed(2))
        history.push({ time: i, price: p })
      }
      history[history.length - 1].price = basePrice
      const newTrend = {
        id: `user-meme-${Date.now()}`,
        name,
        ticker: ticker.startsWith('$') ? ticker : `$${ticker}`,
        category,
        description,
        emoji: '🆕',
        thumbnail: thumbnail || null,
        youtubeId: youtubeId || null,
        price: basePrice,
        change24h: parseFloat(((Math.random() - 0.3) * 10).toFixed(2)),
        volume: Math.floor(Math.random() * 5000) + 100,
        marketCap: Math.floor(basePrice * 10000),
        priceHistory: history,
        isUserCreated: true,
      }
      return {
        ...state,
        trends: [newTrend, ...state.trends],
        _lastEvent: { type: 'meme_created', name, timestamp: Date.now() },
      }
    }

    default:
      return state
  }
}

const GameContext = createContext()

export function GameProvider({ children, lang }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const newsIndexRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'TICK_PRICES' }), TICK_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const newsItem = newsEvents[newsIndexRef.current % newsEvents.length]
      newsIndexRef.current += 1
      dispatch({ type: 'APPLY_NEWS_IMPACT', payload: { newsItem, lang } })
    }, NEWS_INTERVAL)
    return () => clearInterval(interval)
  }, [lang])

  const buy = useCallback((trendId, quantity) => {
    const trend = state.trends.find(t => t.id === trendId)
    if (trend) dispatch({ type: 'BUY', payload: { trendId, quantity, price: trend.price } })
  }, [state.trends])

  const sell = useCallback((trendId, quantity) => {
    const trend = state.trends.find(t => t.id === trendId)
    if (trend) dispatch({ type: 'SELL', payload: { trendId, quantity, price: trend.price } })
  }, [state.trends])

  const createMeme = useCallback((memeData) => {
    dispatch({ type: 'CREATE_MEME', payload: memeData })
  }, [])

  const getTrend = useCallback((id) => {
    return state.trends.find(t => t.id === id)
  }, [state.trends])

  const getPortfolioValue = useCallback(() => {
    let total = state.balance
    for (const [trendId, holding] of Object.entries(state.holdings)) {
      const trend = state.trends.find(t => t.id === trendId)
      if (trend) total += trend.price * holding.quantity
    }
    return parseFloat(total.toFixed(2))
  }, [state.balance, state.holdings, state.trends])

  const getTotalPnL = useCallback(() => {
    return parseFloat((getPortfolioValue() - INITIAL_BALANCE).toFixed(2))
  }, [getPortfolioValue])

  return (
    <GameContext.Provider value={{
      ...state,
      buy,
      sell,
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

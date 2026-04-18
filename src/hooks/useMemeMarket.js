// 🔌 useMemeMarket — realtime subscription ao canal de memes.
// Carrega memes do DB + escuta UPDATEs via Supabase Realtime.
// Expoe trends com current_price sempre atualizado.
import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useMemeMarket() {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const priceHistoryRef = useRef({}) // client-side rolling sparkline history

  // Push no histograma de precos pra sparkline client-side
  const pushPricePoint = useCallback((memeId, price) => {
    const hist = priceHistoryRef.current[memeId] || []
    const next = [...hist.slice(-47), { time: Date.now(), price: Number(price) }]
    priceHistoryRef.current[memeId] = next
    return next
  }, [])

  // Carrega memes iniciais
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { data, error: err } = await supabase
          .from('memes')
          .select('*')
          .order('total_invested', { ascending: false })
        if (err) throw err
        if (cancelled) return
        const normalized = (data || []).map(m => {
          const history = pushPricePoint(m.id, m.current_price)
          return {
            id: m.id,
            name: m.title,
            ticker: m.ticker,
            description: m.description || '',
            category: m.category || 'memes',
            emoji: m.emoji || '🎮',
            thumbnail: m.image_url,
            youtubeId: m.youtube_id,
            price: Number(m.current_price),
            change24h: 0, // sera calculado via history rolling
            volume: 0,
            marketCap: Math.floor(Number(m.total_invested || 0)),
            priceHistory: history,
            isUserCreated: !!m.creator_id,
          }
        })
        setMemes(normalized)
        setLoading(false)
      } catch (e) {
        setError(e.message || 'Erro carregando memes')
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [pushPricePoint])

  // Realtime subscription em UPDATEs de memes
  useEffect(() => {
    const channel = supabase
      .channel('memes_market')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'memes' },
        (payload) => {
          const row = payload.new
          if (!row) return
          setMemes(prev => prev.map(m => {
            if (m.id !== row.id) return m
            const oldPrice = m.price
            const newPrice = Number(row.current_price)
            const history = pushPricePoint(row.id, newPrice)
            // change24h temporario: variacao vs primeira amostra da janela
            const firstPrice = history[0]?.price || newPrice
            const changePct = firstPrice > 0
              ? ((newPrice - firstPrice) / firstPrice) * 100
              : 0
            return {
              ...m,
              price: newPrice,
              change24h: Number(changePct.toFixed(2)),
              marketCap: Math.floor(Number(row.total_invested || 0)),
              priceHistory: history,
              _priceDelta: newPrice - oldPrice,
              _lastUpdate: Date.now(),
            }
          }))
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'memes' },
        (payload) => {
          const row = payload.new
          if (!row) return
          const history = pushPricePoint(row.id, row.current_price)
          const newMeme = {
            id: row.id,
            name: row.title,
            ticker: row.ticker,
            description: row.description || '',
            category: row.category || 'memes',
            emoji: row.emoji || '🎮',
            thumbnail: row.image_url,
            youtubeId: row.youtube_id,
            price: Number(row.current_price),
            change24h: 0,
            volume: 0,
            marketCap: Math.floor(Number(row.total_invested || 0)),
            priceHistory: history,
            isUserCreated: !!row.creator_id,
          }
          setMemes(prev => [newMeme, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pushPricePoint])

  return { memes, loading, error }
}

// 🧠 useMemeBackers — contador REAL de bancadores (briefing 4.3).
// Conta DISTINCT user_ids que compraram o meme. Cache simples por memeId.
// Atualiza via realtime quando nova transacao INSERT chega.
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const cache = new Map() // memeId → count (memoria, nao persistente)

export default function useMemeBackers(memeId) {
  const [count, setCount] = useState(cache.get(memeId) ?? null)

  useEffect(() => {
    if (!memeId) return
    let cancelled = false

    const load = async () => {
      // head: true retorna apenas count sem rows; count: exact e preciso
      const { count: n, error } = await supabase
        .from('transactions')
        .select('user_id', { count: 'exact', head: true })
        .eq('meme_id', memeId)
        .eq('transaction_type', 'buy')
      if (cancelled) return
      if (!error && typeof n === 'number') {
        cache.set(memeId, n)
        setCount(n)
      }
    }
    load()

    // Incremento otimista a cada novo buy no realtime
    const ch = supabase
      .channel(`backers_${memeId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions', filter: `meme_id=eq.${memeId}` },
        (payload) => {
          if (payload.new?.transaction_type === 'buy') {
            setCount(prev => {
              const next = (prev ?? 0) + 1
              cache.set(memeId, next)
              return next
            })
          }
        }
      )
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(ch) }
  }, [memeId])

  return count
}

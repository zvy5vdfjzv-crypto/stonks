// 🚀 usePumpAlerts — escuta UPDATEs em memes e dispara Toast + som
// quando um meme EM POSICAO do user sobe > 15%.
import { useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { useNotifications } from '../context/NotificationContext'

const PUMP_THRESHOLD = 15 // %
const COOLDOWN_MS = 60_000 // 1min por meme (anti-spam)

export default function usePumpAlerts() {
  const { trends, holdings } = useGame()
  const { addNotification } = useNotifications()
  const lastAlertRef = useRef({}) // memeId -> timestamp do ultimo alerta

  useEffect(() => {
    if (!trends || !Object.keys(holdings).length) return

    trends.forEach(meme => {
      const holding = holdings[meme.id]
      if (!holding || holding.quantity <= 0) return

      const now = Date.now()
      const last = lastAlertRef.current[meme.id] || 0
      if (now - last < COOLDOWN_MS) return

      if (meme.change24h >= PUMP_THRESHOLD) {
        lastAlertRef.current[meme.id] = now
        addNotification(
          'price_up',
          `🔥 ${meme.ticker} esta bombando!`,
          `+${meme.change24h.toFixed(1)}% nas ultimas atualizacoes. Posicao: ${holding.quantity}x`,
        )
      } else if (meme.change24h <= -PUMP_THRESHOLD) {
        lastAlertRef.current[meme.id] = now
        addNotification(
          'price_down',
          `📉 ${meme.ticker} caindo`,
          `${meme.change24h.toFixed(1)}%. Considere realizar.`,
        )
      }
    })
  }, [trends, holdings, addNotification])
}

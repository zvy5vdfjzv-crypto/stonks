import { useEffect, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import { useNotifications } from '../../context/NotificationContext'
import usePumpAlerts from '../../hooks/usePumpAlerts'

// Bridges GameContext events into the unified NotificationContext
export default function NotificationBridge() {
  const { activeNews } = useGame()
  const { addNotification } = useNotifications()
  const lastNewsRef = useRef(null)

  // Listen for market news events
  useEffect(() => {
    if (!activeNews || activeNews === lastNewsRef.current) return
    lastNewsRef.current = activeNews
    addNotification('news', 'Mercado', activeNews)
  }, [activeNews, addNotification])

  // 🚀 Pump alerts: posicoes do user que sobem/caem > 15%
  usePumpAlerts()

  return null
}

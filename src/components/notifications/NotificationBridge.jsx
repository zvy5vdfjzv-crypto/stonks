import { useEffect, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import { useNotifications } from '../../context/NotificationContext'

// Bridges GameContext events into the unified NotificationContext
export default function NotificationBridge() {
  const { activeNews, newsHistory } = useGame()
  const { addNotification } = useNotifications()
  const lastNewsRef = useRef(null)

  // Listen for market news events
  useEffect(() => {
    if (!activeNews || activeNews === lastNewsRef.current) return
    lastNewsRef.current = activeNews
    addNotification('news', 'Mercado', activeNews)
  }, [activeNews, addNotification])

  return null
}

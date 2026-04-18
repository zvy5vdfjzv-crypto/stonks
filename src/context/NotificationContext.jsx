import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { sound } from '../lib/sound'
import { haptics } from '../lib/haptics'

const NOTIFICATION_TYPES = {
  bancada: { emoji: '🚀', color: 'text-green', bgColor: 'bg-green/10 border-green/20' },
  like: { emoji: '❤️', color: 'text-pink', bgColor: 'bg-pink/10 border-pink/20' },
  comment: { emoji: '💬', color: 'text-blue', bgColor: 'bg-blue/10 border-blue/20' },
  follow: { emoji: '👤', color: 'text-accent', bgColor: 'bg-accent/10 border-accent/20' },
  price_up: { emoji: '📈', color: 'text-green', bgColor: 'bg-green/10 border-green/20' },
  price_down: { emoji: '📉', color: 'text-red', bgColor: 'bg-red/10 border-red/20' },
  boost: { emoji: '⚡', color: 'text-yellow', bgColor: 'bg-yellow/10 border-yellow/20' },
  news: { emoji: '🔥', color: 'text-yellow', bgColor: 'bg-yellow/10 border-yellow/20' },
  trade: { emoji: '💰', color: 'text-green', bgColor: 'bg-green/10 border-green/20' },
  meme: { emoji: '🆕', color: 'text-accent', bgColor: 'bg-accent/10 border-accent/20' },
}

const mockNotifications = [
  { id: 'n1', type: 'bancada', title: 'Novo investimento!', body: 'CryptoMemeLord bancou 25 cotas do seu meme', time: Date.now() - 60000, read: false },
  { id: 'n2', type: 'like', title: 'Curtida na sua tese', body: 'MemeQueen_BR curtiu "GTA 6 vai explodir"', time: Date.now() - 180000, read: false },
  { id: 'n3', type: 'price_up', title: '$PEDRO subiu 15%!', body: 'Seu investimento em Pedro Pedro valorizou', time: Date.now() - 300000, read: false },
  { id: 'n4', type: 'follow', title: 'Novo seguidor', body: 'DiamondHands42 comecou a te seguir', time: Date.now() - 500000, read: true },
  { id: 'n5', type: 'comment', title: 'Comentario na sua tese', body: 'ViralHunter respondeu: "Concordo, all-in!"', time: Date.now() - 600000, read: true },
]

const initialState = {
  notifications: mockNotifications,
  pushQueue: [],
}

function notifReducer(state, action) {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const notif = { id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...action.payload, time: Date.now(), read: false }
      return {
        ...state,
        notifications: [notif, ...state.notifications].slice(0, 50),
        pushQueue: action.payload.silent ? state.pushQueue : [...state.pushQueue, notif],
      }
    }
    case 'MARK_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) }
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) }
    case 'DISMISS_PUSH':
      return { ...state, pushQueue: state.pushQueue.filter(n => n.id !== action.payload) }
    default:
      return state
  }
}

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notifReducer, initialState)
  const [muted, setMuted] = useLocalStorage('stonks_notif_muted', false)
  const intervalRef = useRef(null)

  // 🎵 Sincroniza sound + haptics com estado muted (unified sensory mute)
  useEffect(() => {
    sound.setMuted(muted)
    haptics.setMuted(muted)
  }, [muted])

  const addNotification = useCallback((type, title, body, options = {}) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type, title, body, silent: muted || options.silent } })
    // 🎵 Som de notificacao (exceto se silent)
    if (!muted && !options.silent) {
      const toneMap = { bancada: 'market', like: 'like', comment: 'social', follow: 'social', price_up: 'price_up', price_down: 'price_down', boost: 'market', news: 'market', trade: 'market', meme: 'social' }
      sound.ding(toneMap[type] || 'default')
    }
  }, [muted])

  const markRead = useCallback((id) => dispatch({ type: 'MARK_READ', payload: id }), [])
  const markAllRead = useCallback(() => dispatch({ type: 'MARK_ALL_READ' }), [])
  const dismissPush = useCallback((id) => dispatch({ type: 'DISMISS_PUSH', payload: id }), [])
  const toggleMute = useCallback(() => setMuted(prev => !prev), [setMuted])

  const unreadCount = state.notifications.filter(n => !n.read).length

  // Simulate random social notifications
  useEffect(() => {
    const randomNotifs = [
      { type: 'bancada', title: 'Nova bancada!', body: 'Alguem bancou cotas do seu meme' },
      { type: 'like', title: 'Curtida!', body: 'Sua tese recebeu uma curtida' },
      { type: 'follow', title: 'Novo seguidor!', body: 'Um trader comecou a te seguir' },
      { type: 'comment', title: 'Nova resposta!', body: 'Alguem respondeu sua tese' },
    ]
    intervalRef.current = setInterval(() => {
      const n = randomNotifs[Math.floor(Math.random() * randomNotifs.length)]
      addNotification(n.type, n.title, n.body)
    }, 45000)
    return () => clearInterval(intervalRef.current)
  }, [addNotification])

  return (
    <NotificationContext.Provider value={{
      ...state,
      addNotification,
      markRead,
      markAllRead,
      dismissPush,
      unreadCount,
      muted,
      toggleMute,
      NOTIFICATION_TYPES,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

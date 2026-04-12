import { createContext, useContext, useReducer, useCallback } from 'react'

const mockFriends = [
  { id: 'f1', name: 'CryptoMemeLord', avatar: '😎', handle: '@cryptomemelord', online: true },
  { id: 'f2', name: 'MemeQueen_BR', avatar: '👑', handle: '@memequeen', online: true },
  { id: 'f3', name: 'ViralHunter', avatar: '🦈', handle: '@viralhunter', online: false },
  { id: 'f4', name: 'DiamondHands42', avatar: '💎', handle: '@diamondhands', online: true },
  { id: 'f5', name: 'FofocaTrader', avatar: '👀', handle: '@fofocatrader', online: false },
]

const mockCommunities = [
  { id: 'c-memes', name: 'Memes Hub', emoji: '😂', members: 12400, category: 'memes' },
  { id: 'c-finance', name: 'WSB Brasil', emoji: '💰', members: 8200, category: 'finance' },
  { id: 'c-gaming', name: 'Gamers Stonks', emoji: '🎮', members: 6800, category: 'gaming' },
  { id: 'c-tech', name: 'Tech Cringe', emoji: '💻', members: 4500, category: 'tech' },
  { id: 'c-viral', name: 'Viral Watch', emoji: '⚡', members: 15600, category: 'viral' },
]

const mockGroups = [
  { id: 'g1', name: 'Traders da Madrugada', emoji: '🌙', members: ['f1', 'f2', 'f4'], memberCount: 3 },
  { id: 'g2', name: 'Caca-Memes Premium', emoji: '🔥', members: ['f1', 'f3', 'f5'], memberCount: 3 },
]

const mockMessages = {
  f1: [
    { id: 'm1', from: 'f1', text: 'E ai, viu o Pedro Pedro? Explodiu!', time: Date.now() - 600000 },
    { id: 'm2', from: 'user', text: 'Vi sim! Bancei 50 cotas ontem', time: Date.now() - 300000 },
    { id: 'm3', from: 'f1', text: 'Genio! Ta subindo demais 🚀', time: Date.now() - 120000 },
  ],
  f2: [
    { id: 'm4', from: 'f2', text: 'Mana, shorta $SKBDI. Vai cair', time: Date.now() - 900000 },
    { id: 'm5', from: 'user', text: 'Sera? Ainda ta forte no TikTok', time: Date.now() - 800000 },
  ],
  'c-memes': [
    { id: 'cm1', from: 'CryptoMemeLord', avatar: '😎', text: 'Novo meme do gato no espaco acabou de dropar', time: Date.now() - 180000 },
    { id: 'cm2', from: 'MemeQueen_BR', avatar: '👑', text: 'Ja bancei 100 cotas, confio demais', time: Date.now() - 120000 },
    { id: 'cm3', from: 'ViralHunter', avatar: '🦈', text: 'Cuidado galera, pode ser pump and dump', time: Date.now() - 60000 },
  ],
  'c-finance': [
    { id: 'cf1', from: 'DiamondHands42', avatar: '💎', text: 'HODL $DMNDS! Nao vendam!', time: Date.now() - 300000 },
    { id: 'cf2', from: 'FofocaTrader', avatar: '👀', text: 'Elon twittou de novo... cuidado', time: Date.now() - 200000 },
  ],
  g1: [
    { id: 'gm1', from: 'CryptoMemeLord', avatar: '😎', text: 'Bora maratona de trade essa madruga?', time: Date.now() - 400000 },
    { id: 'gm2', from: 'DiamondHands42', avatar: '💎', text: 'To dentro! Trago os charts', time: Date.now() - 350000 },
  ],
}

const initialState = {
  friends: mockFriends,
  communities: mockCommunities,
  groups: mockGroups,
  messages: mockMessages,
  following: new Set(['f1', 'f2']),
}

function chatReducer(state, action) {
  switch (action.type) {
    case 'SEND_MESSAGE': {
      const { chatId, text } = action.payload
      const msg = { id: `msg-${Date.now()}`, from: 'user', text, time: Date.now() }
      const existing = state.messages[chatId] || []
      return { ...state, messages: { ...state.messages, [chatId]: [...existing, msg] } }
    }
    case 'TOGGLE_FOLLOW': {
      const following = new Set(state.following)
      following.has(action.payload) ? following.delete(action.payload) : following.add(action.payload)
      return { ...state, following }
    }
    case 'CREATE_GROUP': {
      const group = { id: `g-${Date.now()}`, name: action.payload.name, emoji: action.payload.emoji || '💬', members: action.payload.members, memberCount: action.payload.members.length }
      return { ...state, groups: [...state.groups, group] }
    }
    default:
      return state
  }
}

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const sendMessage = useCallback((chatId, text) => {
    dispatch({ type: 'SEND_MESSAGE', payload: { chatId, text } })
  }, [])

  const toggleFollow = useCallback((userId) => {
    dispatch({ type: 'TOGGLE_FOLLOW', payload: userId })
  }, [])

  const createGroup = useCallback((name, emoji, members) => {
    dispatch({ type: 'CREATE_GROUP', payload: { name, emoji, members } })
  }, [])

  const isFollowing = useCallback((userId) => {
    return state.following.has(userId)
  }, [state.following])

  return (
    <ChatContext.Provider value={{ ...state, sendMessage, toggleFollow, createGroup, isFollowing }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}

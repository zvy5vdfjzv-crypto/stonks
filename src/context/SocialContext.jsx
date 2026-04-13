import { createContext, useContext, useReducer, useCallback } from 'react'

const mockPosts = [
  // STONKS Official accounts posts
  {
    id: 'so1', userId: 'STONKS Car', avatar: '🏎️', handle: '@stonkscar', verified: 'stonks',
    content: '⚡ Tesla Cybertruck flagrada com a porta caindo no meio da highway. O meme que nao para de dar. $CYBR subindo 18% hoje. Quem bancou ta rindo.',
    image: 'https://images.unsplash.com/photo-1562911791-c7a97b729ec5?w=600&h=400&fit=crop',
    trendId: 'cybertruck-memes',
    likes: 4520, reposts: 890, replies: 234,
    timestamp: Date.now() - 90000, isOfficial: true,
  },
  {
    id: 'so2', userId: 'STONKS Gaming', avatar: '🎮', handle: '@stonksgame', verified: 'stonks',
    content: '🌴 LEAK: GTA 6 gameplay de 2 minutos vazou no Reddit e foi deletado em 15 minutos. Quem viu, viu. $GTA6 em alta historica.',
    image: 'https://images.unsplash.com/photo-1533310266094-8898a03807dd?w=600&h=400&fit=crop',
    trendId: 'gta6-hype',
    likes: 12800, reposts: 3400, replies: 1567,
    timestamp: Date.now() - 200000, isOfficial: true,
  },
  {
    id: 'so3', userId: 'STONKS Money', avatar: '💰', handle: '@stonksmoney', verified: 'stonks',
    content: '💎 WallStreetBets em modo full YOLO. $DMNDS acumula 5.600 bancadas em 24h. Os diamond hands estao de volta. Epoca de loss porn ou gain porn?',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
    trendId: 'wsb-diamond-hands',
    likes: 6700, reposts: 1200, replies: 445,
    timestamp: Date.now() - 400000, isOfficial: true,
  },
  {
    id: 'so4', userId: 'STONKS Tech', avatar: '💻', handle: '@stonkstech', verified: 'stonks',
    content: '🤖 ChatGPT agora gera memes melhores que humanos. O mercado de $GPT ta pegando fogo. IA vai substituir memeiros?',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    trendId: 'chatgpt-memes',
    likes: 3400, reposts: 780, replies: 290,
    timestamp: Date.now() - 700000, isOfficial: true,
  },
  {
    id: 'so5', userId: 'STONKS Sport', avatar: '⚽', handle: '@stonkssport', verified: 'stonks',
    content: '⚽ O edit sigma do gol de Messi bateu 50M de views. Phonk + futebol = formula imbativel. $GOAT so sobe.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
    trendId: 'football-edits',
    likes: 8900, reposts: 2100, replies: 567,
    timestamp: Date.now() - 1000000, isOfficial: true,
  },
  // Regular user posts
  {
    id: 'p1', userId: 'CryptoMemeLord', avatar: '😎',
    content: '🚀 $PEDRO vai explodir essa semana. O TikTok ta cheio de remix. Quem nao entrou ainda vai chorar. BANQUEM AGORA!',
    image: 'https://i.ytimg.com/vi/dRpzxKsSEZg/hqdefault.jpg',
    trendId: 'pedro-pedro', sentiment: 'bull',
    likes: 234, reposts: 45, replies: 12,
    timestamp: Date.now() - 120000,
  },
  {
    id: 'p2', userId: 'FofocaTrader', avatar: '👀',
    content: 'Skibidi Toilet ta perdendo forca. A Gen Alpha ja ta enjoada. Short nesse lixo. $SKBDI vai cair 30% ate sexta.',
    sentiment: 'bear',
    likes: 156, reposts: 23, replies: 67,
    timestamp: Date.now() - 300000,
  },
  {
    id: 'p3', userId: 'MemeQueen_BR', avatar: '👑',
    content: 'GTA 6 trailer 2 vai cair essa semana segundo leakers confiaveis. $GTA6 vai dobrar. Eu to all-in e nao tenho medo.',
    image: 'https://i.ytimg.com/vi/QdBZY2fkU-0/hqdefault.jpg',
    trendId: 'gta6-hype', sentiment: 'bull',
    likes: 891, reposts: 201, replies: 145,
    timestamp: Date.now() - 600000,
  },
  {
    id: 'p4', userId: 'DiamondHands42', avatar: '💎',
    content: 'Looksmaxxing e a maior piramide mental da internet. Mewing nao funciona. $MEWW e short eterno. Nao me convence.',
    sentiment: 'bear',
    likes: 342, reposts: 89, replies: 234,
    timestamp: Date.now() - 900000,
  },
  {
    id: 'p5', userId: 'ViralHunter', avatar: '🦈',
    content: 'Kai Cenat + MrBeast collab confirmada pro mes que vem. Se isso acontecer, $KAI e $BEAST explodem juntos. Bancando os dois.',
    sentiment: 'bull',
    likes: 567, reposts: 134, replies: 78,
    timestamp: Date.now() - 1200000,
  },
  {
    id: 'p6', userId: 'BolhaDoMeme', avatar: '🫧',
    content: 'Cybertruck virou piada mundial. Cada semana um problema novo. Quanto mais fail, mais meme. $CYBR so sobe por causa da zoeira.',
    image: 'https://i.ytimg.com/vi/udxR5rBq_Vg/hqdefault.jpg',
    trendId: 'cybertruck-memes', sentiment: 'bull',
    likes: 445, reposts: 112, replies: 56,
    timestamp: Date.now() - 1800000,
  },
]

const initialState = {
  posts: mockPosts,
  userPosts: [],
}

function socialReducer(state, action) {
  switch (action.type) {
    case 'ADD_POST': {
      const newPost = {
        id: `user-${Date.now()}`,
        userId: 'Voce',
        avatar: '🎮',
        content: action.payload.content,
        image: action.payload.image || null,
        trendId: action.payload.trendId || null,
        sentiment: action.payload.sentiment || null,
        likes: 0,
        reposts: 0,
        replies: 0,
        timestamp: Date.now(),
        isUserPost: true,
      }
      return {
        ...state,
        posts: [newPost, ...state.posts],
        userPosts: [newPost, ...state.userPosts],
      }
    }

    case 'LIKE_POST': {
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.payload ? { ...p, likes: p.likes + 1 } : p
        ),
      }
    }

    case 'REPOST': {
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.payload ? { ...p, reposts: p.reposts + 1 } : p
        ),
      }
    }

    case 'BOOST_POST': {
      const { postId, tier } = action.payload
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === postId
            ? { ...p, boosted: true, boostTier: tier, boostTimestamp: Date.now(), likes: p.likes + tier.multiplier * 10, reposts: p.reposts + tier.multiplier * 3 }
            : p
        ),
      }
    }

    default:
      return state
  }
}

const SocialContext = createContext()

export function SocialProvider({ children }) {
  const [state, dispatch] = useReducer(socialReducer, initialState)

  const addPost = useCallback((content, sentiment, trendId, image) => {
    dispatch({ type: 'ADD_POST', payload: { content, sentiment, trendId, image } })
  }, [])

  const likePost = useCallback((id) => {
    dispatch({ type: 'LIKE_POST', payload: id })
  }, [])

  const repost = useCallback((id) => {
    dispatch({ type: 'REPOST', payload: id })
  }, [])

  const boostPost = useCallback((postId, tier) => {
    dispatch({ type: 'BOOST_POST', payload: { postId, tier } })
  }, [])

  return (
    <SocialContext.Provider value={{ ...state, addPost, likePost, repost, boostPost }}>
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const ctx = useContext(SocialContext)
  if (!ctx) throw new Error('useSocial must be used within SocialProvider')
  return ctx
}

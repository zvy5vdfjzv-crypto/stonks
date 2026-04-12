import { createContext, useContext, useReducer, useCallback } from 'react'

const mockPosts = [
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

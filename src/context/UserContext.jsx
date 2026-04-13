import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const UserContext = createContext()

const CREATOR_TITLES = [
  { minScore: 0, title: 'Novato', badge: '🌱', color: 'text-text-muted' },
  { minScore: 50, title: 'Observador', badge: '👀', color: 'text-blue' },
  { minScore: 200, title: 'Trend Spotter', badge: '🔍', color: 'text-accent' },
  { minScore: 500, title: 'Hype Builder', badge: '🔥', color: 'text-yellow' },
  { minScore: 1500, title: 'Meme Lord', badge: '👑', color: 'text-pink' },
  { minScore: 5000, title: 'Oraculo', badge: '🔮', color: 'text-green' },
  { minScore: 15000, title: 'Warren Buffett dos Memes', badge: '💎', color: 'text-accent-light' },
]

export const SHOP_ITEMS = [
  // Hats
  { id: 'hat-crown', name: 'Coroa de Ouro', category: 'hat', price: 500, emoji: '👑', svgOverlay: '<text x="50" y="18" text-anchor="middle" font-size="20">👑</text>', rarity: 'epic' },
  { id: 'hat-cap', name: 'Bone Invertido', category: 'hat', price: 150, emoji: '🧢', svgOverlay: '<text x="50" y="18" text-anchor="middle" font-size="18">🧢</text>', rarity: 'common' },
  { id: 'hat-tophat', name: 'Cartola Stonks', category: 'hat', price: 800, emoji: '🎩', svgOverlay: '<text x="50" y="15" text-anchor="middle" font-size="18">🎩</text>', rarity: 'legendary' },
  { id: 'hat-fire', name: 'Cabeca em Chamas', category: 'hat', price: 1200, emoji: '🔥', svgOverlay: '<text x="50" y="12" text-anchor="middle" font-size="22">🔥</text>', rarity: 'legendary' },
  { id: 'hat-rocket', name: 'Capacete Espacial', category: 'hat', price: 350, emoji: '🚀', svgOverlay: '<text x="50" y="14" text-anchor="middle" font-size="16">🚀</text>', rarity: 'rare' },
  { id: 'hat-alien', name: 'Antena Alien', category: 'hat', price: 600, emoji: '👽', svgOverlay: '<text x="50" y="12" text-anchor="middle" font-size="16">👽</text>', rarity: 'epic' },

  // Glasses
  { id: 'glasses-pixel', name: 'Oculos Pixel', category: 'glasses', price: 200, emoji: '🕶️', svgOverlay: '<rect x="30" y="37" width="40" height="10" rx="2" fill="#000" opacity="0.8"/><rect x="33" y="39" width="12" height="6" rx="1" fill="#39FF14" opacity="0.6"/><rect x="55" y="39" width="12" height="6" rx="1" fill="#39FF14" opacity="0.6"/>', rarity: 'common' },
  { id: 'glasses-deal', name: 'Deal With It', category: 'glasses', price: 400, emoji: '😎', svgOverlay: '<rect x="28" y="37" width="44" height="10" rx="2" fill="#111"/><rect x="31" y="39" width="14" height="6" fill="#222"/><rect x="55" y="39" width="14" height="6" fill="#222"/>', rarity: 'rare' },
  { id: 'glasses-laser', name: 'Olhos de Laser', category: 'glasses', price: 900, emoji: '🔴', svgOverlay: '<circle cx="38" cy="42" r="5" fill="#FF0000" opacity="0.7"/><circle cx="62" cy="42" r="5" fill="#FF0000" opacity="0.7"/><line x1="38" y1="42" x2="10" y2="60" stroke="#FF0000" stroke-width="2" opacity="0.5"/><line x1="62" y1="42" x2="90" y2="60" stroke="#FF0000" stroke-width="2" opacity="0.5"/>', rarity: 'epic' },
  { id: 'glasses-heart', name: 'Oculos Coracao', category: 'glasses', price: 250, emoji: '💖', svgOverlay: '<text x="38" y="47" text-anchor="middle" font-size="14">💖</text><text x="62" y="47" text-anchor="middle" font-size="14">💖</text>', rarity: 'common' },

  // Effects
  { id: 'effect-glow', name: 'Aura Neon', category: 'effect', price: 700, emoji: '✨', svgOverlay: '<circle cx="50" cy="50" r="45" fill="none" stroke="#6C5CE7" stroke-width="3" opacity="0.4"/><circle cx="50" cy="50" r="48" fill="none" stroke="#A29BFE" stroke-width="1" opacity="0.3"/>', rarity: 'rare' },
  { id: 'effect-diamond', name: 'Chuva de Diamantes', category: 'effect', price: 1500, emoji: '💎', svgOverlay: '<text x="15" y="15" font-size="10" opacity="0.6">💎</text><text x="80" y="20" font-size="8" opacity="0.5">💎</text><text x="25" y="85" font-size="9" opacity="0.5">💎</text><text x="78" y="80" font-size="10" opacity="0.6">💎</text>', rarity: 'legendary' },
  { id: 'effect-money', name: 'Money Rain', category: 'effect', price: 1000, emoji: '💸', svgOverlay: '<text x="10" y="12" font-size="10" opacity="0.5">💸</text><text x="75" y="18" font-size="8" opacity="0.4">💵</text><text x="20" y="90" font-size="9" opacity="0.4">💰</text><text x="82" y="85" font-size="10" opacity="0.5">💸</text>', rarity: 'epic' },
  { id: 'effect-stars', name: 'Estrelas', category: 'effect', price: 300, emoji: '⭐', svgOverlay: '<text x="12" y="18" font-size="8" opacity="0.5">⭐</text><text x="85" y="15" font-size="10" opacity="0.6">⭐</text><text x="8" y="82" font-size="9" opacity="0.4">⭐</text><text x="88" y="88" font-size="8" opacity="0.5">⭐</text>', rarity: 'common' },

  // Frames
  { id: 'frame-gold', name: 'Moldura Dourada', category: 'frame', price: 2000, emoji: '🖼️', svgOverlay: '<rect x="2" y="2" width="96" height="96" rx="18" fill="none" stroke="#FFD700" stroke-width="4"/>', rarity: 'legendary' },
  { id: 'frame-neon', name: 'Moldura Neon', category: 'frame', price: 600, emoji: '💜', svgOverlay: '<rect x="2" y="2" width="96" height="96" rx="18" fill="none" stroke="#6C5CE7" stroke-width="3" opacity="0.8"/>', rarity: 'rare' },
  { id: 'frame-fire', name: 'Moldura Fire', category: 'frame', price: 1000, emoji: '🔥', svgOverlay: '<rect x="2" y="2" width="96" height="96" rx="18" fill="none" stroke="#FF6B6B" stroke-width="3"/><rect x="4" y="4" width="92" height="92" rx="16" fill="none" stroke="#FECA57" stroke-width="1" opacity="0.5"/>', rarity: 'epic' },
]

export const VERIFICATION_TYPES = {
  blue: { label: 'Verificado', color: '#2563EB', price: 10, needsApproval: false, desc: 'Conta pessoal verificada', features: ['Selo verificado', 'Prioridade no feed', 'Credibilidade'] },
  yellow: { label: 'Empresa', color: '#F59E0B', price: 30, needsApproval: true, desc: 'Conta empresarial verificada', features: ['Selo empresarial', 'Prioridade maxima', 'Insights avancados', 'Suporte prioritario'] },
  black: { label: 'Politico', color: '#1a1a1a', price: 30, needsApproval: true, desc: 'Figura publica/politica', features: ['Selo politico', 'Prioridade maxima', 'Protecao de identidade', 'Suporte dedicado'] },
  stonks: { label: 'STONKS', color: '#7C3AED', price: null, needsApproval: false, desc: 'Administrador da plataforma', features: ['Selo exclusivo STONKS', 'Acesso total', 'Controle da plataforma'] },
}

export const STONKS_OFFICIAL_ACCOUNTS = [
  { id: 'stonks-main', handle: '@stonks', name: 'STONKS', emoji: '📈', verified: 'stonks', category: 'viral', followers: '1.2M', desc: 'Conta oficial da plataforma' },
  { id: 'stonks-car', handle: '@stonkscar', name: 'STONKS Car', emoji: '🏎️', verified: 'stonks', category: 'cars', followers: '340K', desc: 'Tudo sobre carros, tuning e car meets' },
  { id: 'stonks-art', handle: '@stonksart', name: 'STONKS Art', emoji: '🎨', verified: 'stonks', category: 'ai', followers: '280K', desc: 'Arte, design e AI art' },
  { id: 'stonks-game', handle: '@stonksgame', name: 'STONKS Gaming', emoji: '🎮', verified: 'stonks', category: 'gaming', followers: '560K', desc: 'Games, streams e e-sports' },
  { id: 'stonks-money', handle: '@stonksmoney', name: 'STONKS Money', emoji: '💰', verified: 'stonks', category: 'finance', followers: '890K', desc: 'Mercado financeiro e crypto' },
  { id: 'stonks-music', handle: '@stonksmusic', name: 'STONKS Music', emoji: '🎵', verified: 'stonks', category: 'music', followers: '420K', desc: 'Musica, trends sonoras e virais' },
  { id: 'stonks-tech', handle: '@stonkstech', name: 'STONKS Tech', emoji: '💻', verified: 'stonks', category: 'tech', followers: '310K', desc: 'Tecnologia, AI e inovacao' },
  { id: 'stonks-sport', handle: '@stonkssport', name: 'STONKS Sport', emoji: '⚽', verified: 'stonks', category: 'sports', followers: '670K', desc: 'Esportes, edits e compilados' },
]

export const BOOST_TIERS = [
  { id: 'boost-small', name: 'Mini Boost', price: 100, multiplier: 2, duration: '1h', emoji: '⚡' },
  { id: 'boost-medium', name: 'Super Boost', price: 500, multiplier: 5, duration: '6h', emoji: '🚀' },
  { id: 'boost-mega', name: 'Mega Boost', price: 2000, multiplier: 15, duration: '24h', emoji: '💥' },
]

const RARITY_COLORS = { common: 'text-text-secondary', rare: 'text-blue', epic: 'text-accent', legendary: 'text-yellow' }

export function getRarityColor(rarity) {
  return RARITY_COLORS[rarity] || RARITY_COLORS.common
}

export function getCreatorTitle(score) {
  let result = CREATOR_TITLES[0]
  for (const t of CREATOR_TITLES) {
    if (score >= t.minScore) result = t
  }
  return result
}

const OWNER_EMAIL = 'pedronhobrab@gmail.com'

// Convert DB profile (snake_case) to app user (camelCase)
function dbToUser(profile) {
  if (!profile) return null
  const email = profile.email?.trim().toLowerCase()
  const isOwner = email === OWNER_EMAIL
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name || '',
    handle: profile.handle || '',
    avatar: profile.avatar || '🎮',
    avatarType: profile.avatar_type || 'emoji',
    avatarConfig: null,
    bio: profile.bio || '',
    socialLinks: profile.social_links || { instagram: '', x: '', youtube: '', linkedin: '' },
    niches: profile.niches || [],
    verified: isOwner ? 'stonks' : (profile.verified || null),
    verifiedSecondary: isOwner ? 'blue' : (profile.verified_secondary || null),
    verifiedPlan: profile.verified_plan || null,
    accountType: isOwner ? 'owner' : (profile.account_type || 'personal'),
    creatorScore: profile.creator_score || 0,
    followers: profile.followers || 0,
    following: profile.following || 0,
    memesPosted: profile.memes_posted || 0,
    totalBancadas: profile.total_bancadas || 0,
    totalViews: profile.total_views || 0,
    privacy: profile.privacy || { privateAccount: false, showActivity: 'followers', allowMentions: true },
    screenTime: profile.screen_time || { totalMinutes: 0, sessions: [] },
    ownedItems: profile.owned_items || [],
    equippedItems: profile.equipped_items || { hat: null, glasses: null, effect: null, frame: null },
    createdAt: profile.created_at ? new Date(profile.created_at).getTime() : Date.now(),
  }
}

// Convert app user fields to DB columns for update
function userToDb(fields) {
  const map = {
    displayName: 'display_name',
    handle: 'handle',
    avatar: 'avatar',
    avatarType: 'avatar_type',
    bio: 'bio',
    socialLinks: 'social_links',
    niches: 'niches',
    verified: 'verified',
    verifiedSecondary: 'verified_secondary',
    verifiedPlan: 'verified_plan',
    accountType: 'account_type',
    creatorScore: 'creator_score',
    followers: 'followers',
    following: 'following',
    memesPosted: 'memes_posted',
    totalBancadas: 'total_bancadas',
    totalViews: 'total_views',
    privacy: 'privacy',
    screenTime: 'screen_time',
    ownedItems: 'owned_items',
    equippedItems: 'equipped_items',
  }
  const db = {}
  for (const [key, val] of Object.entries(fields)) {
    if (map[key]) db[map[key]] = val
  }
  return db
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Fetch profile from Supabase
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      console.warn('Profile fetch error:', error.message)
      return null
    }
    return data
  }, [])

  // Sync local state to Supabase (debounced)
  const syncToDb = useCallback(async (updates) => {
    if (!session?.user?.id) return
    const dbUpdates = userToDb(updates)
    if (Object.keys(dbUpdates).length === 0) return
    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', session.user.id)
    if (error) console.warn('Profile sync error:', error.message)
  }, [session])

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        fetchProfile(s.user.id).then(profile => {
          if (profile && profile.handle) {
            setUser(dbToUser(profile))
          }
          // If profile exists but no handle, user needs to complete onboarding
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s?.user) {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // Register - create auth account + profile
  const register = useCallback(async (data) => {
    setAuthError(null)
    // Sign up with Supabase auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: data.email,
      password: data.password || 'stonks1234', // fallback password
    })
    if (authErr) {
      setAuthError(authErr.message)
      return false
    }

    const userId = authData.user?.id
    if (!userId) {
      setAuthError('Erro ao criar conta')
      return false
    }

    const handle = data.handle.startsWith('@') ? data.handle : `@${data.handle}`
    const email = data.email?.trim().toLowerCase()
    const isOwner = email === OWNER_EMAIL

    // Upsert profile (trigger may have created a minimal one)
    const profileData = {
      id: userId,
      email: data.email,
      display_name: data.displayName,
      handle: handle,
      avatar: data.avatar || '🎮',
      avatar_type: data.avatarType || 'emoji',
      niches: data.niches || [],
      bio: '',
      social_links: { instagram: '', x: '', youtube: '', linkedin: '' },
      verified: isOwner ? 'stonks' : null,
      verified_secondary: isOwner ? 'blue' : null,
      account_type: isOwner ? 'owner' : 'personal',
      creator_score: 0,
      followers: 0,
      following: 0,
      memes_posted: 0,
      total_bancadas: 0,
      total_views: 0,
      privacy: { privateAccount: false, showActivity: 'followers', allowMentions: true },
      screen_time: { totalMinutes: 0, sessions: [] },
      owned_items: [],
      equipped_items: { hat: null, glasses: null, effect: null, frame: null },
    }

    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })

    if (profileErr) {
      setAuthError(profileErr.message)
      return false
    }

    setUser(dbToUser(profileData))
    return true
  }, [])

  // Login with email/password
  const login = useCallback(async (email, password) => {
    setAuthError(null)
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setAuthError(error.message)
      return false
    }

    const profile = await fetchProfile(authData.user.id)
    if (profile && profile.handle) {
      setUser(dbToUser(profile))
    }
    return true
  }, [fetchProfile])

  // Logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    // Clear local caches
    localStorage.removeItem('stonks_notif_muted')
  }, [])

  // Profile update methods - update local state immediately + sync to DB
  const updateProfile = useCallback((data) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = {
        ...prev,
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.handle !== undefined && { handle: data.handle.startsWith('@') ? data.handle : `@${data.handle}` }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.avatarType !== undefined && { avatarType: data.avatarType }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.socialLinks !== undefined && { socialLinks: { ...prev.socialLinks, ...data.socialLinks } }),
      }
      // Sync changed fields to DB
      const changes = {}
      if (data.displayName !== undefined) changes.displayName = updated.displayName
      if (data.handle !== undefined) changes.handle = updated.handle
      if (data.avatar !== undefined) changes.avatar = updated.avatar
      if (data.avatarType !== undefined) changes.avatarType = updated.avatarType
      if (data.bio !== undefined) changes.bio = updated.bio
      if (data.socialLinks !== undefined) changes.socialLinks = updated.socialLinks
      syncToDb(changes)
      return updated
    })
  }, [syncToDb])

  const updateNiches = useCallback((niches) => {
    setUser(prev => prev ? { ...prev, niches } : prev)
    syncToDb({ niches })
  }, [syncToDb])

  const addCreatorScore = useCallback((points) => {
    setUser(prev => {
      if (!prev) return prev
      const newScore = prev.creatorScore + points
      syncToDb({ creatorScore: newScore })
      return { ...prev, creatorScore: newScore }
    })
  }, [syncToDb])

  const incrementStat = useCallback((stat, amount = 1) => {
    setUser(prev => {
      if (!prev) return prev
      const newVal = (prev[stat] || 0) + amount
      syncToDb({ [stat]: newVal })
      return { ...prev, [stat]: newVal }
    })
  }, [syncToDb])

  const buyItem = useCallback((itemId) => {
    setUser(prev => {
      if (!prev || prev.ownedItems.includes(itemId)) return prev
      const newItems = [...prev.ownedItems, itemId]
      syncToDb({ ownedItems: newItems })
      return { ...prev, ownedItems: newItems }
    })
    return true
  }, [syncToDb])

  const equipItem = useCallback((itemId) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item) return
    setUser(prev => {
      if (!prev) return prev
      const equipped = { ...prev.equippedItems }
      equipped[item.category] = equipped[item.category] === itemId ? null : itemId
      syncToDb({ equippedItems: equipped })
      return { ...prev, equippedItems: equipped }
    })
  }, [syncToDb])

  const setVerified = useCallback((type, plan) => {
    setUser(prev => prev ? { ...prev, verified: type, verifiedPlan: plan } : prev)
    syncToDb({ verified: type, verifiedPlan: plan })
  }, [syncToDb])

  const updatePrivacy = useCallback((key, value) => {
    setUser(prev => {
      if (!prev) return prev
      const p = prev.privacy || { privateAccount: false, showActivity: 'followers', allowMentions: true }
      const newPrivacy = { ...p, [key]: value }
      syncToDb({ privacy: newPrivacy })
      return { ...prev, privacy: newPrivacy }
    })
  }, [syncToDb])

  const addScreenTime = useCallback((minutes) => {
    setUser(prev => {
      if (!prev) return prev
      const st = prev.screenTime || { totalMinutes: 0, sessions: [] }
      const newSt = { ...st, totalMinutes: (st.totalMinutes || 0) + minutes }
      // Don't sync screen time on every minute - too noisy
      return { ...prev, screenTime: newSt }
    })
  }, [])

  const isRegistered = !!user && !!user.handle
  const creatorTitle = user ? getCreatorTitle(user.creatorScore) : CREATOR_TITLES[0]

  return (
    <UserContext.Provider value={{
      user,
      session,
      loading,
      authError,
      isRegistered,
      creatorTitle,
      register,
      login,
      logout,
      updateProfile,
      updateNiches,
      addCreatorScore,
      incrementStat,
      buyItem,
      equipItem,
      setVerified,
      updatePrivacy,
      addScreenTime,
      CREATOR_TITLES,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}

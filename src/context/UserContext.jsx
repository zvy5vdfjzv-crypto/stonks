import { createContext, useContext, useState, useCallback } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

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

export function UserProvider({ children }) {
  const [rawUser, setRawUser] = useLocalStorage('stonks_user', null)

  const ownerEmail = 'pedronhobrab@gmail.com'

  // Migrate old users - fill missing fields
  const isOwner = !!(rawUser?.email && rawUser.email.trim().toLowerCase() === ownerEmail)
  const user = rawUser ? {
    ...rawUser,
    bio: rawUser.bio ?? '',
    socialLinks: rawUser.socialLinks ?? { instagram: '', x: '', youtube: '', linkedin: '' },
    verified: isOwner ? 'stonks' : (rawUser.verified || null),
    verifiedSecondary: isOwner ? 'blue' : (rawUser.verifiedSecondary || null),
    verifiedPlan: rawUser.verifiedPlan ?? null,
    accountType: isOwner ? 'owner' : (rawUser.accountType ?? 'personal'),
    privacy: rawUser.privacy ?? { privateAccount: false, showActivity: 'followers', allowMentions: true },
    screenTime: rawUser.screenTime ?? { totalMinutes: 0, sessions: [] },
    ownedItems: rawUser.ownedItems ?? [],
    equippedItems: rawUser.equippedItems ?? { hat: null, glasses: null, effect: null, frame: null },
  } : null

  const setUser = setRawUser

  const register = useCallback((data) => {
    setUser({
      email: data.email,
      displayName: data.displayName,
      handle: data.handle.startsWith('@') ? data.handle : `@${data.handle}`,
      avatar: data.avatar || '🎮',
      avatarType: data.avatarType || 'emoji',
      avatarConfig: data.avatarConfig || null,
      niches: data.niches || [],
      createdAt: Date.now(),
      creatorScore: 0,
      followers: 0,
      following: 0,
      memesPosted: 0,
      totalBancadas: 0,
      totalViews: 0,
      bio: '',
      socialLinks: { instagram: '', x: '', youtube: '', linkedin: '' },
      verified: data.email?.trim().toLowerCase() === ownerEmail ? 'stonks' : null,
      verifiedSecondary: data.email?.trim().toLowerCase() === ownerEmail ? 'blue' : null,
      verifiedPlan: null,
      accountType: data.email?.trim().toLowerCase() === ownerEmail ? 'owner' : 'personal',
      privacy: { privateAccount: false, showActivity: 'followers', allowMentions: true },
      screenTime: { totalMinutes: 0, sessions: [] },
      ownedItems: [],
      equippedItems: { hat: null, glasses: null, effect: null, frame: null },
    })
  }, [])

  const updateProfile = useCallback((data) => {
    setUser(prev => {
      if (!prev) return prev
      return {
        ...prev,
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.handle !== undefined && { handle: data.handle.startsWith('@') ? data.handle : `@${data.handle}` }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.avatarType !== undefined && { avatarType: data.avatarType }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.socialLinks !== undefined && { socialLinks: { ...prev.socialLinks, ...data.socialLinks } }),
      }
    })
  }, [])

  const updateNiches = useCallback((niches) => {
    setUser(prev => prev ? { ...prev, niches } : prev)
  }, [])

  const addCreatorScore = useCallback((points) => {
    setUser(prev => prev ? { ...prev, creatorScore: prev.creatorScore + points } : prev)
  }, [])

  const incrementStat = useCallback((stat, amount = 1) => {
    setUser(prev => prev ? { ...prev, [stat]: (prev[stat] || 0) + amount } : prev)
  }, [])

  const buyItem = useCallback((itemId) => {
    setUser(prev => {
      if (!prev || prev.ownedItems.includes(itemId)) return prev
      return { ...prev, ownedItems: [...prev.ownedItems, itemId] }
    })
    return true
  }, [])

  const equipItem = useCallback((itemId) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item) return
    setUser(prev => {
      if (!prev) return prev
      const equipped = { ...prev.equippedItems }
      equipped[item.category] = equipped[item.category] === itemId ? null : itemId
      return { ...prev, equippedItems: equipped }
    })
  }, [])

  const setVerified = useCallback((type, plan) => {
    setUser(prev => prev ? { ...prev, verified: type, verifiedPlan: plan } : prev)
  }, [setUser])

  const updatePrivacy = useCallback((key, value) => {
    setUser(prev => {
      if (!prev) return prev
      const p = prev.privacy || { privateAccount: false, showActivity: 'followers', allowMentions: true }
      return { ...prev, privacy: { ...p, [key]: value } }
    })
  }, [setUser])

  const addScreenTime = useCallback((minutes) => {
    setUser(prev => {
      if (!prev) return prev
      const st = prev.screenTime || { totalMinutes: 0, sessions: [] }
      return { ...prev, screenTime: { ...st, totalMinutes: (st.totalMinutes || 0) + minutes } }
    })
  }, [setUser])

  const isRegistered = !!user
  const creatorTitle = user ? getCreatorTitle(user.creatorScore) : CREATOR_TITLES[0]

  return (
    <UserContext.Provider value={{
      user,
      isRegistered,
      creatorTitle,
      register,
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

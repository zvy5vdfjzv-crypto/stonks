import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const UserContext = createContext()

// 🏰 CREATOR TITLES — flavor Warcraft/RPG em vez de emojis padrao
// tier indice e usado pelo RankSigil pra escolher cor do anel
const CREATOR_TITLES = [
  { tier: 0, minScore: 0, title: 'Iniciado', badge: '🌿', color: 'text-text-muted' },
  { tier: 1, minScore: 50, title: 'Vigilante', badge: '🗝️', color: 'text-text-secondary' },
  { tier: 2, minScore: 200, title: 'Sentinela do Hype', badge: '🛡️', color: 'text-blue' },
  { tier: 3, minScore: 500, title: 'Arauto Arcano', badge: '🔥', color: 'text-system' },
  { tier: 4, minScore: 1500, title: 'Lorde dos Memes', badge: '👑', color: 'text-pink' },
  { tier: 5, minScore: 5000, title: 'Oraculo Viral', badge: '🔮', color: 'text-money' },
  { tier: 6, minScore: 15000, title: 'Arquiduque dos Virais', badge: '💎', color: 'text-yellow' },
]

// 🏰 SHOP ITEMS — nomes fantasia + overlays mais ornados (vibe Warcraft)
// svgOverlay em viewBox 100x100. Renderizado composicionalmente em UserAvatar.
export const SHOP_ITEMS = [
  // ==== HATS / HELMOS ====
  { id: 'hat-crown', name: 'Coroa do Ancião', category: 'hat', price: 500, emoji: '👑',
    svgOverlay: '<g><polygon points="26,18 34,10 42,18 50,6 58,18 66,10 74,18 74,26 26,26" fill="#FFD700" stroke="#8B6914" stroke-width="1"/><circle cx="50" cy="10" r="2" fill="#FF3B6B"/><circle cx="34" cy="14" r="1.5" fill="#4A9EFF"/><circle cx="66" cy="14" r="1.5" fill="#00FF88"/><rect x="26" y="24" width="48" height="3" fill="#B8860B"/></g>',
    rarity: 'epic' },
  { id: 'hat-cap', name: 'Capuz do Arqueiro', category: 'hat', price: 150, emoji: '🧢',
    svgOverlay: '<path d="M25,28 Q50,8 75,28 L80,32 L20,32 Z" fill="#2d4a2b" stroke="#1a2b19" stroke-width="1"/><path d="M35,14 Q50,10 65,14 L65,20 L35,20 Z" fill="#3d5a3b"/></g>',
    rarity: 'common' },
  { id: 'hat-tophat', name: 'Cartola do Barão', category: 'hat', price: 800, emoji: '🎩',
    svgOverlay: '<g><rect x="30" y="6" width="40" height="20" fill="#0a0a0f" stroke="#FFD700" stroke-width="0.5"/><rect x="26" y="24" width="48" height="4" fill="#1a1a1a"/><rect x="30" y="14" width="40" height="3" fill="#C084FC" opacity="0.8"/><circle cx="50" cy="15.5" r="1.5" fill="#FFD700"/></g>',
    rarity: 'legendary' },
  { id: 'hat-fire', name: 'Elmo em Chamas', category: 'hat', price: 1200, emoji: '🔥',
    svgOverlay: '<g><path d="M35,26 Q30,10 42,12 Q44,4 50,8 Q56,4 58,12 Q70,10 65,26 Z" fill="#FF6B1A" opacity="0.95"/><path d="M40,24 Q38,14 46,16 Q50,8 54,16 Q62,14 60,24 Z" fill="#FECA57" opacity="0.8"/><path d="M45,22 Q44,16 50,18 Q56,16 55,22 Z" fill="#fff" opacity="0.6"/></g>',
    rarity: 'legendary' },
  { id: 'hat-rocket', name: 'Capacete Estelar', category: 'hat', price: 350, emoji: '🚀',
    svgOverlay: '<g><path d="M35,26 L35,18 Q35,10 50,6 Q65,10 65,18 L65,26 Z" fill="#c0c5cc" stroke="#4a4a5a" stroke-width="1"/><rect x="42" y="14" width="16" height="7" rx="3" fill="#4a9eff" opacity="0.7"/><circle cx="46" cy="17" r="1" fill="#fff" opacity="0.9"/><rect x="36" y="24" width="28" height="3" fill="#808898"/></g>',
    rarity: 'rare' },
  { id: 'hat-alien', name: 'Antena do Exilado', category: 'hat', price: 600, emoji: '👽',
    svgOverlay: '<g><circle cx="38" cy="8" r="2" fill="#00FF88"/><circle cx="62" cy="8" r="2" fill="#00FF88"/><line x1="38" y1="10" x2="40" y2="24" stroke="#4a5564" stroke-width="1.5"/><line x1="62" y1="10" x2="60" y2="24" stroke="#4a5564" stroke-width="1.5"/><path d="M32,26 Q32,18 50,14 Q68,18 68,26 Z" fill="#2d4a3b" opacity="0.9"/></g>',
    rarity: 'epic' },

  // ==== GLASSES / MASKS ====
  { id: 'glasses-pixel', name: 'Visor Runico', category: 'glasses', price: 200, emoji: '🕶️',
    svgOverlay: '<g><rect x="28" y="36" width="44" height="12" rx="2" fill="#000" opacity="0.9"/><rect x="31" y="38" width="14" height="8" rx="1" fill="#00FF88" opacity="0.7"/><rect x="55" y="38" width="14" height="8" rx="1" fill="#00FF88" opacity="0.7"/><line x1="45" y1="42" x2="55" y2="42" stroke="#222" stroke-width="2"/></g>',
    rarity: 'common' },
  { id: 'glasses-deal', name: 'Oculos do Rebel', category: 'glasses', price: 400, emoji: '😎',
    svgOverlay: '<g><rect x="26" y="36" width="48" height="11" rx="2" fill="#0a0a0a"/><rect x="29" y="38" width="16" height="7" fill="#1a1a1a" stroke="#333" stroke-width="0.3"/><rect x="55" y="38" width="16" height="7" fill="#1a1a1a" stroke="#333" stroke-width="0.3"/><line x1="45" y1="41" x2="55" y2="41" stroke="#333" stroke-width="1.5"/></g>',
    rarity: 'rare' },
  { id: 'glasses-laser', name: 'Olhar Demoniaco', category: 'glasses', price: 900, emoji: '🔴',
    svgOverlay: '<g><defs><radialGradient id="lz" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#ff3b3b"/><stop offset="100%" stop-color="#8b0000"/></radialGradient></defs><circle cx="38" cy="42" r="5" fill="url(#lz)"/><circle cx="62" cy="42" r="5" fill="url(#lz)"/><line x1="38" y1="42" x2="6" y2="62" stroke="#ff3b3b" stroke-width="1.5" opacity="0.7"/><line x1="62" y1="42" x2="94" y2="62" stroke="#ff3b3b" stroke-width="1.5" opacity="0.7"/><circle cx="38" cy="42" r="2" fill="#fff" opacity="0.9"/><circle cx="62" cy="42" r="2" fill="#fff" opacity="0.9"/></g>',
    rarity: 'epic' },
  { id: 'glasses-heart', name: 'Olhos Encantados', category: 'glasses', price: 250, emoji: '💖',
    svgOverlay: '<g><path d="M38,38 l0,0 c-2,-3 -6,-3 -6,1 c0,4 6,7 6,7 s6,-3 6,-7 c0,-4 -4,-4 -6,-1 Z" fill="#FF6B9D"/><path d="M62,38 l0,0 c-2,-3 -6,-3 -6,1 c0,4 6,7 6,7 s6,-3 6,-7 c0,-4 -4,-4 -6,-1 Z" fill="#FF6B9D"/></g>',
    rarity: 'common' },

  // ==== EFFECTS / AURAS ====
  { id: 'effect-glow', name: 'Aura Arcana', category: 'effect', price: 700, emoji: '✨',
    svgOverlay: '<g><circle cx="50" cy="50" r="46" fill="none" stroke="#7C5CFF" stroke-width="2.5" opacity="0.5" stroke-dasharray="2 3"/><circle cx="50" cy="50" r="49" fill="none" stroke="#A28BFF" stroke-width="1" opacity="0.4"/></g>',
    rarity: 'rare' },
  { id: 'effect-diamond', name: 'Chuva de Mithril', category: 'effect', price: 1500, emoji: '💎',
    svgOverlay: '<g><text x="14" y="16" font-size="11" fill="#4a9eff" opacity="0.7">◆</text><text x="82" y="22" font-size="9" fill="#7c5cff" opacity="0.6">◆</text><text x="24" y="86" font-size="10" fill="#4a9eff" opacity="0.6">◆</text><text x="80" y="82" font-size="11" fill="#a0aed0" opacity="0.7">◆</text><text x="8" y="50" font-size="8" fill="#7c5cff" opacity="0.5">◆</text><text x="90" y="55" font-size="8" fill="#4a9eff" opacity="0.5">◆</text></g>',
    rarity: 'legendary' },
  { id: 'effect-money', name: 'Chuva de Ouro', category: 'effect', price: 1000, emoji: '💸',
    svgOverlay: '<g><circle cx="14" cy="14" r="3" fill="#FFD700" opacity="0.6" stroke="#B8860B" stroke-width="0.5"/><circle cx="82" cy="20" r="2.5" fill="#FFD700" opacity="0.5"/><circle cx="20" cy="86" r="3" fill="#FFD700" opacity="0.55"/><circle cx="85" cy="80" r="3.5" fill="#FFD700" opacity="0.65"/><circle cx="8" cy="50" r="2" fill="#FFD700" opacity="0.45"/></g>',
    rarity: 'epic' },
  { id: 'effect-stars', name: 'Estrelas Ancestrais', category: 'effect', price: 300, emoji: '⭐',
    svgOverlay: '<g><polygon points="14,18 15,14 17,18 14,20" fill="#FECA57" opacity="0.7"/><polygon points="85,14 86,10 88,14 86,17" fill="#FECA57" opacity="0.8"/><polygon points="8,82 9,78 11,82 9,85" fill="#FECA57" opacity="0.6"/><polygon points="88,86 89,82 91,86 89,89" fill="#FECA57" opacity="0.7"/></g>',
    rarity: 'common' },

  // ==== FRAMES / BORDAS ====
  { id: 'frame-gold', name: 'Moldura Real', category: 'frame', price: 2000, emoji: '👑',
    svgOverlay: '<g><rect x="1.5" y="1.5" width="97" height="97" rx="14" fill="none" stroke="#FFD700" stroke-width="3.5"/><rect x="4" y="4" width="92" height="92" rx="12" fill="none" stroke="#FEF3C7" stroke-width="1" opacity="0.6"/><circle cx="50" cy="2" r="3" fill="#FFD700" stroke="#8B6914" stroke-width="0.5"/><circle cx="50" cy="98" r="3" fill="#FFD700" stroke="#8B6914" stroke-width="0.5"/></g>',
    rarity: 'legendary' },
  { id: 'frame-neon', name: 'Moldura Arcana', category: 'frame', price: 600, emoji: '🔮',
    svgOverlay: '<g><rect x="2" y="2" width="96" height="96" rx="14" fill="none" stroke="#7C5CFF" stroke-width="3" opacity="0.9"/><rect x="4" y="4" width="92" height="92" rx="12" fill="none" stroke="#A28BFF" stroke-width="0.8" opacity="0.6" stroke-dasharray="3 2"/></g>',
    rarity: 'rare' },
  { id: 'frame-fire', name: 'Moldura Infernal', category: 'frame', price: 1000, emoji: '🔥',
    svgOverlay: '<g><rect x="1.5" y="1.5" width="97" height="97" rx="14" fill="none" stroke="#FF6B1A" stroke-width="3.5"/><rect x="4" y="4" width="92" height="92" rx="12" fill="none" stroke="#FECA57" stroke-width="1.2" opacity="0.7"/><circle cx="50" cy="1" r="2" fill="#FF6B1A"/><circle cx="50" cy="99" r="2" fill="#FF6B1A"/><circle cx="1" cy="50" r="2" fill="#FF6B1A"/><circle cx="99" cy="50" r="2" fill="#FF6B1A"/></g>',
    rarity: 'epic' },
  { id: 'frame-mythic', name: 'Moldura Mítica', category: 'frame', price: 5000, emoji: '💠',
    svgOverlay: '<g><rect x="1" y="1" width="98" height="98" rx="14" fill="none" stroke="#FF2D6B" stroke-width="3"/><rect x="3.5" y="3.5" width="93" height="93" rx="12" fill="none" stroke="#ff6ba8" stroke-width="1" opacity="0.7" stroke-dasharray="2 1"/><polygon points="50,0 52,4 50,8 48,4" fill="#FF2D6B"/><polygon points="50,92 52,96 50,100 48,96" fill="#FF2D6B"/></g>',
    rarity: 'mythic' },
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
    // 🏰 Character class RPG — campo separado do avatar
    characterClass: profile.character_class || 'humano',
    hypeCoinsBalance: Number(profile.hype_coins_balance ?? 1000),
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
    characterClass: 'character_class',
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

// Translate common Supabase errors to Portuguese
function translateAuthError(msg) {
  const map = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Email nao confirmado. Verifique sua caixa de entrada.',
    'User already registered': 'Este email ja esta cadastrado. Clique "Ja tenho conta" para entrar.',
    'Password should be at least 6 characters': 'A senha deve ter no minimo 6 caracteres',
    'Unable to validate email address: invalid format': 'Formato de email invalido',
    'Too many requests': 'Muitas tentativas. Aguarde um momento e tente novamente.',
    'For security purposes, you can only request this after': 'Aguarde um momento antes de tentar novamente.',
    'Auth session missing!': 'Sessao expirada. Faca login novamente.',
  }
  for (const [en, pt] of Object.entries(map)) {
    if (msg?.includes(en)) return pt
  }
  return msg
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Clear old localStorage data from pre-Supabase era
  useEffect(() => {
    localStorage.removeItem('stonks_user')
  }, [])

  // Fetch profile from Supabase
  const fetchProfile = useCallback(async (userId) => {
    try {
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
    } catch (err) {
      console.error('Profile fetch exception:', err)
      return null
    }
  }, [])

  // Ensure profile row exists (handles cases where trigger failed)
  const ensureProfile = useCallback(async (userId, email) => {
    let profile = await fetchProfile(userId)
    if (!profile) {
      // Trigger may have failed (e.g. UNIQUE constraint on handle default)
      // Create the profile row manually
      const tempHandle = `@user_${userId.slice(0, 8)}`
      await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        handle: tempHandle,
      }).select().single()
      profile = await fetchProfile(userId)
    }
    return profile
  }, [fetchProfile])

  // Sync local state to Supabase (debounced)
  const syncToDb = useCallback(async (updates) => {
    if (!session?.user?.id) return
    const dbUpdates = userToDb(updates)
    if (Object.keys(dbUpdates).length === 0) return
    try {
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', session.user.id)
      if (error) console.warn('Profile sync error:', error.message)
    } catch (err) {
      console.warn('Profile sync exception:', err)
    }
  }, [session])

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        ensureProfile(s.user.id, s.user.email).then(profile => {
          if (profile) {
            setUser(dbToUser(profile))
          }
          setLoading(false)
        }).catch(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }).catch((err) => {
      console.error('Session check failed:', err)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s?.user) {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile, ensureProfile])

  // Register - create auth account + profile
  const register = useCallback(async (data) => {
    setAuthError(null)
    const password = data.password || 'stonks1234'

    try {
      // Sign up with Supabase auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: data.email,
        password,
        options: { data: { display_name: data.displayName } },
      })
      if (authErr) {
        setAuthError(translateAuthError(authErr.message))
        return false
      }

      let userId = authData.user?.id
      if (!userId) {
        setAuthError('Erro ao criar conta. Tente novamente.')
        return false
      }

      // If no session (email confirmation required), auto sign-in
      if (!authData.session) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: data.email,
          password,
        })
        if (signInErr) {
          setAuthError('Conta criada! Verifique seu email para confirmar, depois clique "Ja tenho conta" para entrar.')
          return false
        }
        userId = signInData.user?.id || userId
      }

      const handle = data.handle.startsWith('@') ? data.handle : `@${data.handle}`
      const email = data.email?.trim().toLowerCase()
      const isOwner = email === OWNER_EMAIL

      const profileData = {
        id: userId,
        email: data.email,
        display_name: data.displayName,
        handle: handle,
        avatar: data.avatar || '🎮',
        avatar_type: data.avatarType || 'emoji',
        character_class: data.characterClass || 'humano',
        niches: data.niches || [],
        bio: '',
        social_links: { instagram: '', x: '', youtube: '', linkedin: '' },
        verified: isOwner ? 'stonks' : null,
        verified_secondary: isOwner ? 'blue' : null,
        account_type: isOwner ? 'owner' : 'personal',
      }

      // Use upsert to handle both cases: trigger created row OR trigger failed
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })

      if (profileErr) {
        // Fallback: try update if upsert fails (RLS might block insert)
        const { id: _id, email: _email, ...updateFields } = profileData
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(updateFields)
          .eq('id', userId)
        if (updateErr) {
          setAuthError('Erro ao salvar perfil: ' + translateAuthError(updateErr.message))
          return false
        }
      }

      // Build full user object for local state
      const fullProfile = {
        ...profileData,
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
        created_at: new Date().toISOString(),
      }

      setUser(dbToUser(fullProfile))
      return true
    } catch (err) {
      console.error('Register error:', err)
      setAuthError('Erro de conexao. Verifique sua internet e tente novamente.')
      return false
    }
  }, [])

  // Login with email/password
  const login = useCallback(async (email, password) => {
    setAuthError(null)
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setAuthError(translateAuthError(error.message))
        return false
      }

      // Ensure profile exists (trigger might have failed)
      const profile = await ensureProfile(authData.user.id, authData.user.email)
      if (profile) {
        setUser(dbToUser(profile))
      }
      return true
    } catch (err) {
      console.error('Login error:', err)
      setAuthError('Erro de conexao. Verifique sua internet e tente novamente.')
      return false
    }
  }, [ensureProfile])

  // Reset password
  const resetPassword = useCallback(async (email) => {
    setAuthError(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        setAuthError(translateAuthError(error.message))
        return false
      }
      return true
    } catch (err) {
      setAuthError('Erro ao enviar email. Tente novamente.')
      return false
    }
  }, [])

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

  // 🏰 Trocar classe do personagem RPG
  const updateCharacterClass = useCallback((characterClass) => {
    setUser(prev => prev ? { ...prev, characterClass } : prev)
    syncToDb({ characterClass })
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
      resetPassword,
      updateProfile,
      updateNiches,
      updateCharacterClass,
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

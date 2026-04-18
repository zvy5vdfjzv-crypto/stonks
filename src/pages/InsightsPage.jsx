import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Eye, Award, Coins, Grid3X3, Trophy, Camera, Pencil, Globe, Search, Palette, FileText, Check } from 'lucide-react'

const ACHIEVEMENT_ICONS = { Eye, Search, BarChart2, Palette, FileText }
import { useUser, getCreatorTitle, SHOP_ITEMS } from '../context/UserContext'
import { useGame } from '../context/GameContext'
import { useSocial } from '../context/SocialContext'
import Badge from '../components/ui/Badge'
import VerifiedBadge from '../components/ui/VerifiedBadge'
import RankSigil from '../components/ui/RankSigil'
import UserAvatar from '../components/ui/UserAvatar'
import EditProfileModal from '../components/profile/EditProfileModal'

function SocialIcon({ type, size = 14, className = '' }) {
  const s = size
  if (type === 'instagram') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
  if (type === 'x') return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  if (type === 'youtube') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
  if (type === 'linkedin') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
  return <Globe size={s} className={className} />
}

const SOCIAL_URLS = {
  instagram: 'https://instagram.com/',
  x: 'https://x.com/',
  youtube: 'https://youtube.com/',
  linkedin: 'https://linkedin.com/in/',
}
const SOCIAL_HOVER = {
  instagram: 'hover:text-pink',
  x: 'hover:text-text-primary',
  youtube: 'hover:text-red',
  linkedin: 'hover:text-blue',
}

export default function InsightsPage() {
  const { user, creatorTitle, CREATOR_TITLES } = useUser()
  const { trends, holdings } = useGame()
  const { posts } = useSocial()
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const fileRef = useState(null)

  const userMemes = useMemo(() => trends.filter(t => t.isUserCreated), [trends])
  const userPosts = useMemo(() => posts.filter(p => p.isUserPost), [posts])

  const totalInvestido = useMemo(() => userMemes.reduce((s, m) => s + m.volume * m.price * 0.001, 0), [userMemes])
  const totalViews = useMemo(() => userMemes.reduce((s, m) => s + m.volume, 0), [userMemes])

  const nextTitle = CREATOR_TITLES.find(t => t.minScore > (user?.creatorScore || 0))
  const progressToNext = nextTitle ? ((user?.creatorScore || 0) / nextTitle.minScore) * 100 : 100

  // Build grid items: memes + posts with images + achievements
  const gridItems = useMemo(() => {
    const items = []
    userMemes.forEach(m => items.push({ type: 'meme', data: m, image: m.thumbnail, label: m.ticker }))
    userPosts.filter(p => p.image).forEach(p => items.push({ type: 'post', data: p, image: p.image, label: 'Post' }))

    // Achievements
    const achievements = [
      user?.creatorScore >= 50 && { type: 'achievement', icon: 'Eye', label: 'Observador', color: 'from-blue-900/50 to-blue-950/80' },
      user?.creatorScore >= 200 && { type: 'achievement', icon: 'Search', label: 'Trend Spotter', color: 'from-purple-900/50 to-purple-950/80' },
      Object.keys(holdings).length >= 3 && { type: 'achievement', icon: 'BarChart2', label: 'Diversificado', color: 'from-green-900/50 to-green-950/80' },
      userMemes.length >= 1 && { type: 'achievement', icon: 'Palette', label: 'Criador', color: 'from-pink-900/50 to-pink-950/80' },
      userPosts.length >= 1 && { type: 'achievement', icon: 'FileText', label: 'Analista', color: 'from-yellow-900/50 to-yellow-950/80' },
    ].filter(Boolean)
    achievements.forEach(a => items.push(a))

    return items
  }, [userMemes, userPosts, holdings, user?.creatorScore])

  if (!user) return null

  const hasSocials = Object.values(user.socialLinks || {}).some(v => v)

  return (
    <div className="max-w-xl mx-auto w-full pb-24">
      {/* Profile header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-start gap-4">
          {/* 🧠 Avatar com items EQUIPADOS — hat, glasses, effect, frame visiveis */}
          <div className="relative group cursor-pointer shrink-0" onClick={() => setEditOpen(true)}>
            <UserAvatar size={80} className="rounded-full border-2 border-border group-hover:border-accent/50 transition-colors" />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={16} className="text-white" />
            </div>
          </div>

          {/* 🧠 Nome colorido por nivel + RankSigil RPG */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className={`font-bold text-lg ${user.accountType === 'owner' ? 'text-accent-light' : creatorTitle.color}`}>
                {user.displayName}
              </h1>
              <VerifiedBadge type={user.verified} secondary={user.verifiedSecondary} size={20} />
              {user.accountType !== 'owner' && (
                <RankSigil tier={creatorTitle.tier} badge={creatorTitle.badge} size={24} />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-accent text-sm">{user.handle}</p>
              {user.accountType === 'owner' && (
                <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-semibold">ADMIN</span>
              )}
            </div>

            {/* Stats grid — mono, tabular-nums, estilo Bloomberg */}
            <div className="flex gap-5 mt-3">
              {[
                { value: userMemes.length + userPosts.length, label: 'Posts' },
                { value: `${(totalViews / 1000).toFixed(1)}K`, label: 'Views' },
                { value: user.creatorScore, label: 'Score' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-mono-stonks font-bold text-text-primary text-base tabular-nums">{s.value}</p>
                  <p className="text-text-muted text-[10px] font-mono-stonks uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-text-primary text-sm mt-3">{user.bio}</p>
        )}

        {/* Social links */}
        {hasSocials && (
          <div className="flex gap-2 mt-3">
            {Object.entries(user.socialLinks || {}).map(([key, value]) => {
              if (!value) return null
              const baseUrl = SOCIAL_URLS[key]
              const hover = SOCIAL_HOVER[key] || ''
              if (!baseUrl) return null
              const url = value.startsWith('http') ? value : `${baseUrl}${value.replace('@', '')}`
              return (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-xl bg-surface-hover border border-border flex items-center justify-center
                    text-text-muted ${hover} transition-colors no-underline`}>
                  <SocialIcon type={key} size={16} />
                </a>
              )
            })}
          </div>
        )}

        {/* 🏰 Creator title progress — RankSigil atual e proximo */}
        {user.accountType !== 'owner' && <div className="mt-4 bg-surface border border-border rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RankSigil tier={creatorTitle.tier} badge={creatorTitle.badge} size={28} />
              <span className={`text-xs font-mono-stonks font-bold uppercase tracking-wider ${creatorTitle.color}`}>
                {creatorTitle.title}
              </span>
            </div>
            {nextTitle && (
              <div className="flex items-center gap-1.5 opacity-50">
                <span className="text-text-muted text-[10px] font-mono-stonks uppercase">proximo:</span>
                <RankSigil tier={nextTitle.tier} badge={nextTitle.badge} size={20} animated={false} />
              </div>
            )}
          </div>
          <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progressToNext, 100)}%` }}
              transition={{ duration: 1 }} className="h-full bg-money rounded-full" style={{ boxShadow: '0 0 8px #00ff8888' }} />
          </div>
          <p className="text-text-muted text-[10px] mt-1 font-mono-stonks tabular-nums">
            {user.creatorScore.toLocaleString()} / {nextTitle?.minScore?.toLocaleString() || '∞'} pts
          </p>
        </div>}

        {/* Edit profile button */}
        <button onClick={() => setEditOpen(true)}
          className="w-full mt-3 bg-surface-hover border border-border rounded-xl py-2.5 text-sm font-semibold
            text-text-primary hover:border-accent/30 cursor-pointer transition-colors flex items-center justify-center gap-2">
          <Pencil size={14} /> Editar perfil
        </button>
      </div>

      {/* Tab bar - Instagram style */}
      <div className="flex border-b border-border sticky top-[52px] bg-[var(--bg-app)] z-10">
        {[
          { id: 'posts', icon: Grid3X3, label: 'Posts' },
          { id: 'stats', icon: BarChart2, label: 'Stats' },
          { id: 'badges', icon: Trophy, label: 'Titulos' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium cursor-pointer transition-all
              border-b-2 ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'posts' && (
        <div className="px-1 pt-1">
          {gridItems.length === 0 ? (
            <div className="text-center py-14 px-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-3">
                <Grid3X3 size={24} className="text-text-muted" />
              </div>
              {/* 🧠 Empty state com personalidade — briefing 9 */}
              <p className="text-text-secondary text-sm font-mono-stonks font-bold uppercase tracking-wider">
                📉 Feed seco
              </p>
              <p className="text-text-muted text-xs mt-1">Larga o primeiro meme ai, bro. Perfil nao se preenche sozinho.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {gridItems.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="aspect-square relative overflow-hidden bg-surface-hover cursor-pointer group"
                >
                  {item.type === 'achievement' ? (
                    <div className={`w-full h-full bg-gradient-to-br ${item.color} flex flex-col items-center justify-center`}>
                      {(() => { const Icon = ACHIEVEMENT_ICONS[item.icon]; return Icon ? <Icon size={28} className="text-white/80 mb-1" /> : null })()}
                      <span className="text-white text-[10px] font-semibold">{item.label}</span>
                    </div>
                  ) : item.image ? (
                    <>
                      <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.label}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-surface flex flex-col items-center justify-center">
                      <span className="text-2xl mb-1">📝</span>
                      <span className="text-text-muted text-[9px]">{item.label}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: BarChart2, label: 'Memes Postados', value: userMemes.length, color: 'text-accent' },
              { icon: Eye, label: 'Volume Total', value: `${(totalViews / 1000).toFixed(1)}K`, color: 'text-blue' },
              { icon: Coins, label: 'Capital Atraido', value: `S$ ${totalInvestido.toFixed(0)}`, color: 'text-green' },
              { icon: Award, label: 'Score Criador', value: user.creatorScore, color: 'text-yellow' },
            ].map((stat, i) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-surface border border-border rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center mb-2">
                  <stat.icon size={15} className="text-text-muted" />
                </div>
                <p className={`font-bold text-lg ${stat.color}`}>{stat.value}</p>
                <p className="text-text-muted text-[10px] mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Memes list */}
          {userMemes.length > 0 && (
            <>
              <h3 className="text-text-primary font-semibold text-sm mt-6 mb-2">Seus memes no mercado</h3>
              {userMemes.map(meme => (
                <div key={meme.id} className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{meme.emoji}</span>
                    <div>
                      <p className="text-text-primary text-sm font-medium">{meme.name}</p>
                      <p className="text-text-muted text-xs">{meme.ticker}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-text-primary text-sm font-semibold">S$ {meme.price.toFixed(2)}</p>
                    <p className={`text-xs font-medium ${meme.change24h >= 0 ? 'text-green' : 'text-red'}`}>
                      {meme.change24h >= 0 ? '+' : ''}{meme.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="px-4 pt-4">
          <div className="space-y-2">
            {CREATOR_TITLES.map((title, i) => {
              const unlocked = (user?.creatorScore || 0) >= title.minScore
              const progress = Math.min(100, ((user?.creatorScore || 0) / title.minScore) * 100)
              const isNext = !unlocked && progress > 0 && CREATOR_TITLES.findIndex(t => !((user?.creatorScore || 0) >= t.minScore)) === i
              return (
                <motion.div key={title.title}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all
                    ${unlocked
                      ? 'bg-surface border-border'
                      : isNext
                        ? 'bg-surface border-accent/30 shadow-[0_0_16px_rgba(124,92,255,0.1)]'
                        : 'bg-surface/50 border-border/30'}`}>
                  {/* 🏰 RankSigil RPG — bloqueado = grayscale opaco */}
                  <div className={`relative shrink-0 transition-all ${unlocked ? '' : 'grayscale opacity-30 contrast-75'}`}>
                    <RankSigil tier={title.tier} badge={title.badge} size={44} animated={unlocked} />
                    {unlocked && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-money flex items-center justify-center z-20">
                        <Check size={9} className="text-[#0a0a0f]" strokeWidth={4} />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${unlocked ? title.color : 'text-text-muted'}`}>
                      {title.title}
                    </p>
                    <p className="text-text-muted text-[10px] font-mono-stonks tabular-nums">
                      {title.minScore.toLocaleString()} pts
                    </p>
                    {/* Progress bar para o proximo */}
                    {isNext && (
                      <div className="mt-1.5 h-1 bg-surface-hover rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                          className="h-full bg-accent rounded-full" />
                      </div>
                    )}
                  </div>

                  {unlocked ? (
                    <span className="text-money text-[10px] font-mono-stonks font-bold uppercase tracking-wider bg-money/10 border border-money/25 px-2 py-0.5 rounded">
                      Ativo
                    </span>
                  ) : isNext ? (
                    <span className="text-accent text-[10px] font-mono-stonks font-bold uppercase tracking-wider">
                      Proximo
                    </span>
                  ) : (
                    <span className="text-text-tertiary text-[10px] font-mono-stonks uppercase tracking-wider">
                      Bloqueado
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}

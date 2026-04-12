import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Eye, Award, Coins, Grid3X3, Trophy, Camera, Pencil, Globe } from 'lucide-react'
import { useUser, getCreatorTitle } from '../context/UserContext'
import { useGame } from '../context/GameContext'
import { useSocial } from '../context/SocialContext'
import Badge from '../components/ui/Badge'
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
      user?.creatorScore >= 50 && { type: 'achievement', emoji: '👀', label: 'Observador', color: 'from-blue-900/50 to-blue-950/80' },
      user?.creatorScore >= 200 && { type: 'achievement', emoji: '🔍', label: 'Trend Spotter', color: 'from-purple-900/50 to-purple-950/80' },
      Object.keys(holdings).length >= 3 && { type: 'achievement', emoji: '📊', label: 'Diversificado', color: 'from-green-900/50 to-green-950/80' },
      userMemes.length >= 1 && { type: 'achievement', emoji: '🎨', label: 'Criador', color: 'from-pink-900/50 to-pink-950/80' },
      userPosts.length >= 1 && { type: 'achievement', emoji: '📝', label: 'Analista', color: 'from-yellow-900/50 to-yellow-950/80' },
    ].filter(Boolean)
    achievements.forEach(a => items.push(a))

    return items
  }, [userMemes, userPosts, holdings, user?.creatorScore])

  if (!user) return null

  const isUrl = typeof user.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))
  const hasSocials = Object.values(user.socialLinks || {}).some(v => v)

  return (
    <div className="max-w-xl mx-auto w-full pb-24">
      {/* Profile header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar - clicavel */}
          <div className="relative group cursor-pointer shrink-0" onClick={() => setEditOpen(true)}>
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border group-hover:border-accent/50 transition-colors">
              {isUrl ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-accent/20 flex items-center justify-center text-3xl">{user.avatar}</div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={16} className="text-white" />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-bold text-text-primary text-lg">{user.displayName}</h1>
              <span className="text-sm">{creatorTitle.badge}</span>
            </div>
            <p className="text-accent text-sm">{user.handle}</p>

            <div className="flex gap-5 mt-3">
              {[
                { value: userMemes.length + userPosts.length, label: 'Posts' },
                { value: `${(totalViews / 1000).toFixed(1)}K`, label: 'Views' },
                { value: user.creatorScore, label: 'Score' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-bold text-text-primary text-sm">{s.value}</p>
                  <p className="text-text-muted text-[10px]">{s.label}</p>
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

        {/* Creator title progress */}
        <div className="mt-4 bg-surface border border-border rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold ${creatorTitle.color}`}>{creatorTitle.badge} {creatorTitle.title}</span>
            {nextTitle && <span className="text-text-muted text-[10px]">{nextTitle.badge} {nextTitle.title}</span>}
          </div>
          <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progressToNext, 100)}%` }}
              transition={{ duration: 1 }} className="h-full bg-accent rounded-full" />
          </div>
          <p className="text-text-muted text-[9px] mt-1">{user.creatorScore} / {nextTitle?.minScore || '∞'} pts</p>
        </div>

        {/* Edit profile button */}
        <button onClick={() => setEditOpen(true)}
          className="w-full mt-3 bg-surface-hover border border-border rounded-xl py-2.5 text-sm font-semibold
            text-text-primary hover:border-accent/30 cursor-pointer transition-colors flex items-center justify-center gap-2">
          <Pencil size={14} /> Editar perfil
        </button>
      </div>

      {/* Tab bar - Instagram style */}
      <div className="flex border-b border-border sticky top-[52px] bg-[#0a0a0c] z-10">
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
            <div className="text-center py-16 px-4">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-text-muted text-sm">Nenhum post ainda.</p>
              <p className="text-text-muted text-xs mt-1">Publique memes e teses para preencher seu perfil!</p>
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
                      <span className="text-3xl mb-1">{item.emoji}</span>
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
        <div className="px-4 pt-4 space-y-3">
          {[
            { icon: BarChart2, label: 'Memes Postados', value: userMemes.length, color: 'text-accent' },
            { icon: Eye, label: 'Volume Total', value: `${(totalViews / 1000).toFixed(1)}K`, color: 'text-blue' },
            { icon: Coins, label: 'Capital Atraido', value: `S$ ${totalInvestido.toFixed(0)}`, color: 'text-green' },
            { icon: Award, label: 'Score Criador', value: user.creatorScore, color: 'text-yellow' },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center">
                  <stat.icon size={18} className="text-text-muted" />
                </div>
                <span className="text-text-secondary text-sm">{stat.label}</span>
              </div>
              <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
            </motion.div>
          ))}

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
              return (
                <motion.div key={title.title}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-colors
                    ${unlocked ? 'bg-surface border-border' : 'bg-surface/50 border-border/30 opacity-40'}`}>
                  <span className="text-2xl">{title.badge}</span>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${unlocked ? title.color : 'text-text-muted'}`}>{title.title}</p>
                    <p className="text-text-muted text-[10px]">{title.minScore}+ pontos</p>
                  </div>
                  {unlocked && (
                    <span className="text-green text-[11px] font-semibold bg-green/10 px-2 py-0.5 rounded-full">
                      ✓ Desbloqueado
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

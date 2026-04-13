import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Grid3X3, TrendingUp } from 'lucide-react'
import { STONKS_OFFICIAL_ACCOUNTS } from '../context/UserContext'
import VerifiedBadge from '../components/ui/VerifiedBadge'
import { useSocial } from '../context/SocialContext'
import { useGame } from '../context/GameContext'
import { useUser } from '../context/UserContext'

// Unsplash images per category for the grid feed
const CATEGORY_IMAGES = {
  viral: [
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504270997636-07ddfbd48945?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop',
  ],
  cars: [
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1525609004556-c46c3653bde9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=400&fit=crop',
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1547954575-855750c57bd3?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1531746790095-e5ada5bd5d10?w=400&h=400&fit=crop',
  ],
  gaming: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=400&h=400&fit=crop',
  ],
  finance: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&h=400&fit=crop',
  ],
  music: [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
  ],
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=400&fit=crop',
  ],
  sports: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1461896836934-bd45ba3c66a2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop',
  ],
}

export default function OfficialProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { posts } = useSocial()
  const { trends } = useGame()
  const { user } = useUser()
  const [following, setFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')

  const account = STONKS_OFFICIAL_ACCOUNTS.find(a => a.id === id)
  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-3xl mb-3">404</p>
        <p className="text-text-muted text-sm">Pagina nao encontrada</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-accent text-sm cursor-pointer">Voltar</button>
      </div>
    )
  }

  // Get posts by this account
  const accountPosts = posts.filter(p => p.handle === account.handle)

  // Get category trends
  const categoryTrends = trends.filter(t => t.category === account.category)

  // Images for the grid
  const images = CATEGORY_IMAGES[account.category] || CATEGORY_IMAGES.viral

  const followersNum = account.followers

  return (
    <div className="max-w-xl mx-auto w-full pb-24">
      {/* Back header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 z-10 bg-[var(--bg-app)]/95 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="text-text-muted hover:text-text-primary cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-text-primary text-sm">{account.name}</span>
            <VerifiedBadge type="stonks" size={16} />
          </div>
          <p className="text-text-muted text-[10px]">{account.handle}</p>
        </div>
      </div>

      {/* Profile header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-4xl shrink-0 border-2 border-accent/30">
            {account.emoji}
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-bold text-text-primary text-lg">{account.name}</h1>
              <VerifiedBadge type="stonks" size={20} />
            </div>
            <p className="text-accent text-sm">{account.handle}</p>

            <div className="flex gap-5 mt-3">
              {[
                { value: accountPosts.length + images.length, label: 'Posts' },
                { value: followersNum, label: 'Seguidores' },
                { value: categoryTrends.length, label: 'Trends' },
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
        <p className="text-text-primary text-sm mt-3">{account.desc}</p>
        <p className="text-text-muted text-xs mt-1">Conta oficial STONKS {account.emoji}</p>

        {/* Follow button */}
        <button
          onClick={() => setFollowing(!following)}
          className={`w-full mt-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2
            ${following
              ? 'bg-surface-hover border border-border text-text-primary hover:border-red/30 hover:text-red'
              : 'bg-accent hover:bg-accent-light text-white'
            }`}
        >
          <Users size={14} />
          {following ? 'Seguindo' : 'Seguir'}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border sticky top-[52px] bg-[var(--bg-app)] z-10">
        {[
          { id: 'posts', icon: Grid3X3, label: 'Posts' },
          { id: 'trends', icon: TrendingUp, label: 'Trends' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium cursor-pointer transition-all
              border-b-2 ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {activeTab === 'posts' && (
        <div className="px-0.5 pt-0.5">
          <div className="grid grid-cols-3 gap-0.5">
            {/* Account posts with images first */}
            {accountPosts.filter(p => p.image).map((post, i) => (
              <motion.div key={post.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="aspect-square relative overflow-hidden bg-surface-hover cursor-pointer group">
                <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </motion.div>
            ))}
            {/* Category images */}
            {images.map((img, i) => (
              <motion.div key={`img-${i}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (accountPosts.filter(p => p.image).length + i) * 0.03 }}
                className="aspect-square relative overflow-hidden bg-surface-hover cursor-pointer group">
                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trends tab */}
      {activeTab === 'trends' && (
        <div className="px-4 pt-4 space-y-2">
          {categoryTrends.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">Nenhuma trend nesta categoria ainda.</p>
          ) : (
            categoryTrends.map((trend, i) => (
              <motion.div key={trend.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-surface border border-border rounded-xl p-3.5 flex items-center justify-between
                  cursor-pointer hover:bg-surface-hover hover:border-accent/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-xl">
                    {trend.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{trend.name}</p>
                    <p className="text-text-muted text-xs">{trend.ticker}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary text-sm">S$ {trend.price.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${trend.change24h >= 0 ? 'text-green' : 'text-red'}`}>
                    {trend.change24h >= 0 ? '+' : ''}{trend.change24h.toFixed(2)}%
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

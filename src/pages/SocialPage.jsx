import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Repeat2, MessageCircle, Send, TrendingUp, TrendingDown, ImagePlus, X, Rocket, Zap } from 'lucide-react'
import { useSocial } from '../context/SocialContext'
import { useGame } from '../context/GameContext'
import { useUser, BOOST_TIERS } from '../context/UserContext'
import Badge from '../components/ui/Badge'
import VerifiedBadge from '../components/ui/VerifiedBadge'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function ComposeBox({ onClose }) {
  const { addPost } = useSocial()
  const { trends } = useGame()
  const [content, setContent] = useState('')
  const [sentiment, setSentiment] = useState(null)
  const [selectedTrend, setSelectedTrend] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)

  const handlePost = () => {
    if (!content.trim()) return
    addPost(content.trim(), sentiment, selectedTrend || null, imageUrl || null)
    setContent('')
    setSentiment(null)
    setSelectedTrend('')
    setImageUrl('')
    onClose?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-2xl p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-lg shrink-0">
          🎮
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Lanca sua tese... 🚀"
            rows={3}
            className="w-full bg-transparent text-text-primary text-sm resize-none
              placeholder:text-text-muted focus:outline-none"
          />

          {/* Image URL input */}
          <AnimatePresence>
            {showImageInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Cole a URL da imagem/meme..."
                  className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-xs
                    text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 mt-2"
                />
                {imageUrl && (
                  <div className="mt-2 relative rounded-lg overflow-hidden h-32">
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setImageUrl(''); setShowImageInput(false) }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center cursor-pointer"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sentiment + Trend selector */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              onClick={() => setSentiment(sentiment === 'bull' ? null : 'bull')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all
                ${sentiment === 'bull' ? 'bg-green/20 text-green border border-green/30' : 'bg-surface-hover text-text-muted hover:text-green'}`}
            >
              <TrendingUp size={12} /> Alta
            </button>
            <button
              onClick={() => setSentiment(sentiment === 'bear' ? null : 'bear')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all
                ${sentiment === 'bear' ? 'bg-red/20 text-red border border-red/30' : 'bg-surface-hover text-text-muted hover:text-red'}`}
            >
              <TrendingDown size={12} /> Baixa
            </button>

            <select
              value={selectedTrend}
              onChange={(e) => setSelectedTrend(e.target.value)}
              className="bg-surface-hover border border-border rounded-lg px-2 py-1 text-xs
                text-text-secondary cursor-pointer focus:outline-none"
            >
              <option value="">Trend (opcional)</option>
              {trends.map(t => (
                <option key={t.id} value={t.id}>{t.emoji} {t.ticker}</option>
              ))}
            </select>

            <button
              onClick={() => setShowImageInput(!showImageInput)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-surface-hover
                text-text-muted hover:text-accent cursor-pointer transition-colors"
            >
              <ImagePlus size={12} />
            </button>

            <button
              onClick={handlePost}
              disabled={!content.trim()}
              className="ml-auto bg-accent hover:bg-accent-light disabled:opacity-30 text-white
                px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all
                disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Send size={12} /> Postar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function PostCard({ post, onLike, onRepost, onBoost }) {
  const { trends, balance } = useGame()
  const { user } = useUser()
  const linkedTrend = post.trendId ? trends.find(t => t.id === post.trendId) : null
  const [liked, setLiked] = useState(false)
  const [reposted, setReposted] = useState(false)
  const [showBoostMenu, setShowBoostMenu] = useState(false)

  const handleLike = () => {
    if (!liked) { onLike(post.id); setLiked(true) }
  }
  const handleRepost = () => {
    if (!reposted) { onRepost(post.id); setReposted(true) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface border border-border rounded-2xl p-4 transition-colors
        ${post.isUserPost ? 'border-accent/20' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-lg shrink-0">
          {post.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-sm flex items-center ${post.isUserPost ? 'text-accent' : 'text-text-primary'}`}>
              {post.userId}
              {post.verified && <VerifiedBadge type={post.verified} size={13} />}
              {post.isUserPost && !post.verified && <VerifiedBadge type={user?.verified} secondary={user?.verifiedSecondary} size={13} />}
            </span>
            {post.handle && <span className="text-text-muted text-[10px]">{post.handle}</span>}
            {post.isOfficial && (
              <Badge color="accent">Oficial</Badge>
            )}
            {post.sentiment && (
              <Badge color={post.sentiment === 'bull' ? 'green' : 'red'}>
                {post.sentiment === 'bull' ? '🐂 Alta' : '🐻 Baixa'}
              </Badge>
            )}
            <span className="text-text-muted text-xs">{timeAgo(post.timestamp)}</span>
          </div>

          <p className="text-text-primary text-sm mt-1.5 whitespace-pre-wrap">{post.content}</p>

          {/* Image */}
          {post.image && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border">
              <img src={post.image} alt="" className="w-full h-48 object-cover" loading="lazy" />
            </div>
          )}

          {/* Linked trend */}
          {linkedTrend && (
            <div className="mt-3 flex items-center gap-2 bg-surface-hover rounded-xl px-3 py-2 border border-border/50">
              <span className="text-lg">{linkedTrend.emoji}</span>
              <div>
                <span className="text-text-primary text-xs font-semibold">{linkedTrend.ticker}</span>
                <span className={`ml-2 text-xs font-semibold
                  ${linkedTrend.change24h >= 0 ? 'text-green' : 'text-red'}`}>
                  S$ {linkedTrend.price.toFixed(2)} ({linkedTrend.change24h >= 0 ? '+' : ''}{linkedTrend.change24h.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs cursor-pointer transition-colors
                ${liked ? 'text-pink' : 'text-text-muted hover:text-pink'}`}
            >
              <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
              <span>{post.likes}</span>
            </button>
            <button
              onClick={handleRepost}
              className={`flex items-center gap-1.5 text-xs cursor-pointer transition-colors
                ${reposted ? 'text-green' : 'text-text-muted hover:text-green'}`}
            >
              <Repeat2 size={15} />
              <span>{post.reposts}</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent cursor-pointer transition-colors">
              <MessageCircle size={15} />
              <span>{post.replies}</span>
            </button>

            {post.isUserPost && !post.boosted && (
              <button
                onClick={() => setShowBoostMenu(!showBoostMenu)}
                className="flex items-center gap-1.5 text-xs text-yellow hover:text-yellow/80 cursor-pointer transition-colors ml-auto"
              >
                <Rocket size={15} />
                <span>Boost</span>
              </button>
            )}

            {post.boosted && (
              <span className="flex items-center gap-1 text-[10px] text-yellow font-semibold ml-auto bg-yellow/10 px-2 py-0.5 rounded-full">
                <Zap size={10} /> Impulsionado
              </span>
            )}
          </div>

          {/* Boost tier menu */}
          <AnimatePresence>
            {showBoostMenu && post.isUserPost && !post.boosted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-1.5 overflow-hidden"
              >
                <p className="text-text-muted text-[10px] font-medium">Impulsionar post:</p>
                {BOOST_TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => { onBoost(post.id, tier); setShowBoostMenu(false) }}
                    disabled={balance < tier.price}
                    className="w-full flex items-center justify-between bg-surface-hover border border-border rounded-lg
                      px-3 py-2 cursor-pointer hover:border-yellow/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <span>{tier.emoji}</span>
                      <div className="text-left">
                        <p className="text-text-primary text-xs font-semibold">{tier.name}</p>
                        <p className="text-text-muted text-[10px]">{tier.multiplier}x alcance · {tier.duration}</p>
                      </div>
                    </div>
                    <span className="text-yellow text-xs font-bold">S$ {tier.price}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default function SocialPage() {
  const { posts, likePost, repost, boostPost } = useSocial()
  const [showCompose, setShowCompose] = useState(false)

  return (
    <div className="px-4 py-5 max-w-xl mx-auto w-full pb-24">
      {/* Compose toggle */}
      {!showCompose ? (
        <button
          onClick={() => setShowCompose(true)}
          className="w-full bg-surface border border-border rounded-2xl px-4 py-3 mb-4
            text-left text-text-muted text-sm cursor-pointer hover:border-accent/30 transition-colors"
        >
          🎯 Lanca sua tese sobre o proximo viral...
        </button>
      ) : (
        <ComposeBox onClose={() => setShowCompose(false)} />
      )}

      {/* Feed */}
      <div className="space-y-3">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onLike={likePost}
            onRepost={repost}
            onBoost={boostPost}
          />
        ))}
      </div>
    </div>
  )
}

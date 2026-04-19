// 🔥 HYPE — feed agregado externo (Reddit + News RSS + YouTube)
// O que ta acontecendo no mundo AGORA, dividido por nicho.
// Auto-refresh a cada 5min. Cache em memoria por sessao.
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, Globe, Play, MessageSquare, ArrowUpRight, Clock, RefreshCw, Lock } from 'lucide-react'
import { fetchMultiCategoryReddit, fetchRedditPosts } from '../services/redditFeed'
import { fetchMultiCategoryNews, fetchNewsByCategory, NEWS_CATEGORIES } from '../services/newsFeeds'
import { fetchYouTubeTrending, isYouTubeConfigured } from '../services/youtubeFeed'
import { useUser } from '../context/UserContext'
import { useLang } from '../context/LanguageContext'
import useTranslated from '../hooks/useTranslated'

const ALL_CATEGORIES = ['memes', 'finance', 'tech', 'ai', 'viral', 'gaming', 'music', 'cars', 'sports', 'influencer']

const SOURCE_META = {
  reddit: { label: 'Reddit', icon: MessageSquare, color: '#ff4500' },
  news: { label: 'News', icon: Globe, color: '#3b82f6' },
  youtube: { label: 'YouTube', icon: Play, color: '#ff0000' },
}

const TAB_IDS = ['all', ...ALL_CATEGORIES]

function timeAgo(ts) {
  if (!ts) return ''
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 60) return `${secs}s`
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`
  return `${Math.floor(secs / 86400)}d`
}

function ContentCard({ item, isNew }) {
  const meta = SOURCE_META[item.source] || SOURCE_META.reddit
  const MetaIcon = meta.icon
  const img = item.thumbnail || item.preview
  // 🌐 Traduz titulo pra lingua do user (description mantida original — economiza quota MyMemory)
  const translatedTitle = useTranslated(item.title, 'en')
  return (
    <motion.a
      href={item.permalink || item.url}
      target="_blank" rel="noopener noreferrer"
      layout
      initial={isNew ? { opacity: 0, y: -20, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2 }}
      className={`block bg-surface border rounded-xl overflow-hidden transition-all no-underline group
        ${isNew ? 'border-money glow-money' : 'border-border hover:border-money/40'}`}
    >
      {img && (
        <div className="aspect-[16/9] bg-surface-hover overflow-hidden relative">
          <img src={img} alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none' }} />
          {isNew && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute top-2 left-2 bg-money text-[#0a0a0f] px-2 py-0.5 rounded font-mono-stonks font-bold text-[10px] uppercase tracking-wider"
              style={{ boxShadow: '0 0 12px rgba(0,255,136,0.6)' }}
            >
              NEW
            </motion.div>
          )}
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <MetaIcon size={11} style={{ color: meta.color }} />
          <span className="text-[10px] font-mono-stonks font-bold uppercase tracking-wider" style={{ color: meta.color }}>
            {item.subreddit ? `r/${item.subreddit}` : item.sourceName || item.channel || meta.label}
          </span>
          {item._category && (
            <span className="text-[9px] text-text-muted font-mono-stonks uppercase">· {item._category}</span>
          )}
          <div className="ml-auto flex items-center gap-1 text-text-muted text-[10px]">
            <Clock size={9} />
            {timeAgo(item.publishedAt || item.createdAt)}
          </div>
        </div>
        <p className="text-text-primary text-sm font-medium line-clamp-2 group-hover:text-money transition-colors">
          {translatedTitle}
        </p>
        {item.description && (
          <p className="text-text-muted text-[11px] mt-1 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono-stonks text-text-muted">
          {item.score !== undefined && <span>▲ {item.score.toLocaleString()}</span>}
          {item.numComments !== undefined && <span>💬 {item.numComments}</span>}
          {item.views !== undefined && <span>👁 {(item.views / 1000).toFixed(0)}K</span>}
          <ArrowUpRight size={11} className="ml-auto text-money opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.a>
  )
}

export default function HypePage() {
  const { user } = useUser()
  const { t } = useLang()
  const TABS = [
    { id: 'all', label: t('hype.all') },
    ...ALL_CATEGORIES.map(c => ({ id: c, label: t(`categories.${c}`) })),
  ]
  const [activeCategory, setActiveCategory] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [newItemIds, setNewItemIds] = useState(new Set()) // IDs marcados como 'NEW' pra badge
  const [lastUpdateTs, setLastUpdateTs] = useState(0)

  // 🔥 Merge — preserva items existentes, marca novos com NEW badge
  const mergeItems = (prev, incoming) => {
    if (!prev?.length) return incoming
    const existingIds = new Set(prev.map(i => `${i.source}-${i.id}`))
    const trulyNew = incoming.filter(i => !existingIds.has(`${i.source}-${i.id}`))
    if (!trulyNew.length) return prev // nada novo
    // Marca IDs novos pra badge NEW
    setNewItemIds(curr => {
      const next = new Set(curr)
      trulyNew.forEach(i => next.add(`${i.source}-${i.id}`))
      // Remove marca de NEW depois de 45s (via timeout no render)
      return next
    })
    // Prepend novos no topo + existentes
    return [...trulyNew, ...prev].slice(0, 50) // max 50 items pra nao crescer infinito
  }

  const loadContent = async (cat, isInitial = false) => {
    if (isInitial) setLoading(true)
    try {
      const cats = cat === 'all'
        ? (user?.niches?.length ? user.niches : ALL_CATEGORIES)
        : [cat]

      const [reddit, news, yt] = await Promise.all([
        cat === 'all'
          ? fetchMultiCategoryReddit(cats, 2)
          : fetchRedditPosts(cat, 6),
        cat === 'all'
          ? fetchMultiCategoryNews(cats, 2)
          : fetchNewsByCategory(cat, 6),
        cat === 'all'
          ? Promise.all(cats.slice(0, 3).map(c => fetchYouTubeTrending(c, 2))).then(arr => arr.flat())
          : fetchYouTubeTrending(cat, 4),
      ])

      const incoming = [...reddit, ...news, ...yt].sort((a, b) =>
        (b.publishedAt || b.createdAt || 0) - (a.publishedAt || a.createdAt || 0)
      )

      if (isInitial) {
        setItems(incoming)
      } else {
        setItems(prev => mergeItems(prev, incoming))
      }
      setLastUpdateTs(Date.now())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ⚡ Refresh AGRESSIVO: a cada 60 segundos. Merge sem reset.
  useEffect(() => {
    loadContent(activeCategory, true)
    const interval = setInterval(() => loadContent(activeCategory, false), 60 * 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory])

  // Clean up NEW badges depois de 45s
  useEffect(() => {
    if (newItemIds.size === 0) return
    const timer = setTimeout(() => setNewItemIds(new Set()), 45000)
    return () => clearTimeout(timer)
  }, [newItemIds])

  const handleRefresh = () => {
    setRefreshing(true)
    loadContent(activeCategory, false)
  }

  return (
    <div className="pb-24 max-w-4xl mx-auto">
      {/* Header com LIVE pulse */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Flame size={22} className="text-hype" />
          <h1 translate="no" className="font-display font-black italic text-text-primary text-2xl">{t('hype.title')}</h1>
          <span translate="no" className="ml-2 text-[9px] bg-money/15 text-money border border-money/30 px-1.5 py-0.5 rounded font-mono-stonks uppercase tracking-wider flex items-center gap-1">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-money"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {t('hype.live')}
          </span>
        </div>
        <p className="text-text-muted text-xs font-mono-stonks uppercase tracking-wider">
          {t('hype.subtitle')} · atualizando a cada 60s
        </p>
      </div>

      {/* Tabs scroll horizontal */}
      <div className="sticky top-0 z-10 bg-[var(--bg-app)]/95 backdrop-blur-xl border-b border-border">
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveCategory(tab.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-mono-stonks font-bold uppercase tracking-wider transition-all cursor-pointer
                ${activeCategory === tab.id
                  ? 'bg-money text-[#0a0a0f]'
                  : 'bg-surface text-text-muted border border-border hover:text-text-primary'}`}>
              {tab.label}
            </button>
          ))}
          <button onClick={handleRefresh} disabled={refreshing}
            className="shrink-0 ml-auto w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center cursor-pointer hover:border-money/40 disabled:opacity-40">
            <RefreshCw size={14} className={`text-text-muted ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Platformas restritas — transparency note */}
      {!isYouTubeConfigured() && (
        <div className="mx-3 mt-3 bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
          <Lock size={16} className="text-text-muted shrink-0" />
          <div className="flex-1 text-[11px] text-text-secondary">
            <p className="font-semibold">{t('hype.youtubeOff')}</p>
            <p className="text-text-muted">{t('hype.youtubeOffDesc')}</p>
          </div>
        </div>
      )}

      {/* Grid de conteudo */}
      <div className="px-3 py-4">
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-surface-hover" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-20 bg-surface-hover rounded" />
                  <div className="h-4 w-full bg-surface-hover rounded" />
                  <div className="h-4 w-3/4 bg-surface-hover rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Globe size={32} className="text-text-muted mx-auto mb-2" />
            <p className="text-text-secondary text-sm font-mono-stonks uppercase tracking-wider">{t('hype.noContent')}</p>
            <p className="text-text-muted text-xs mt-1">{t('hype.noContentDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item, i) => (
              <ContentCard
                key={`${item.source}-${item.id}`}
                item={item}
                isNew={newItemIds.has(`${item.source}-${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sources footer — transparencia sobre APIs */}
      <div className="mx-3 mt-6 bg-surface/50 border border-border rounded-xl p-4 text-[10px] text-text-muted space-y-1.5">
        <p className="font-mono-stonks font-bold uppercase tracking-wider text-text-secondary">Fontes agregadas:</p>
        <p>✅ <span className="text-text-primary">Reddit</span> · API publica (sem chave)</p>
        <p>✅ <span className="text-text-primary">Portais de noticia</span> · RSS via rss2json (10k/dia gratis)</p>
        <p>{isYouTubeConfigured() ? '✅' : '⚠️'} <span className="text-text-primary">YouTube</span> · Data API v3 (free 10k/dia, requer chave em .env)</p>
        <p className="pt-1">❌ <span className="text-text-primary">Instagram · X · TikTok · LinkedIn</span> · APIs pagas/restritas. Nao integradas.</p>
        <p className="text-text-tertiary pt-1">Auto-refresh a cada 5min · ultima atualizacao: {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </div>
  )
}

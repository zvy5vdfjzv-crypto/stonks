// 📰 NewsReaderModal — leitor in-app pra noticias (evita mandar user pra fora)
// Abre ao clicar num card do Hype. Mostra imagem grande + titulo traduzido + desc.
// Oferece botao 'Abrir original' pra quem quer fonte completa.
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowUpRight, Clock, MessageSquare, Globe, Play, ExternalLink, Copy, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import useTranslated from '../../hooks/useTranslated'
import { useLang } from '../../context/LanguageContext'

const SOURCE_META = {
  reddit: { label: 'Reddit', icon: MessageSquare, color: '#ff4500' },
  news: { label: 'News', icon: Globe, color: '#3b82f6' },
  youtube: { label: 'YouTube', icon: Play, color: '#ff0000' },
}

function timeAgo(ts) {
  if (!ts) return ''
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 60) return `${secs}s`
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`
  return `${Math.floor(secs / 86400)}d`
}

export default function NewsReaderModal({ item, onClose }) {
  const { t } = useLang()
  const title = useTranslated(item?.title, 'en')
  const desc = useTranslated(item?.description, 'en')
  const [copied, setCopied] = useState(false)

  // Fecha com ESC
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // Bloqueia scroll do body quando modal aberto
  useEffect(() => {
    if (!item) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [item])

  if (!item) return null
  const meta = SOURCE_META[item.source] || SOURCE_META.reddit
  const MetaIcon = meta.icon
  const url = item.permalink || item.url
  const img = item.thumbnail || item.preview

  const handleCopy = () => {
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: item.title, url }) } catch {}
    } else {
      handleCopy()
    }
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-elevated)] border border-border w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh]"
          >
            {/* Handle bar (mobile drag affordance) */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-text-muted/30" />
            </div>

            {/* Imagem cover */}
            {img && (
              <div className="aspect-video w-full bg-surface-hover relative shrink-0 overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none' }} />
                {/* Source badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md rounded-full px-3 py-1">
                  <MetaIcon size={12} style={{ color: meta.color }} />
                  <span className="text-white text-[10px] font-mono-stonks font-bold uppercase tracking-wider">
                    {item.subreddit ? `r/${item.subreddit}` : (item.sourceName || item.channel || meta.label)}
                  </span>
                </div>
                {/* Close button */}
                <button onClick={onClose}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors">
                  <X size={18} className="text-white" />
                </button>
                {/* Time ago */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full px-3 py-1">
                  <Clock size={11} className="text-white/70" />
                  <span className="text-white/90 text-[10px] font-mono-stonks">{timeAgo(item.publishedAt || item.createdAt)}</span>
                </div>
              </div>
            )}

            {/* Close sem imagem */}
            {!img && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <MetaIcon size={14} style={{ color: meta.color }} />
                  <span className="text-text-secondary text-xs font-mono-stonks font-bold uppercase tracking-wider">
                    {item.subreddit ? `r/${item.subreddit}` : (item.sourceName || item.channel || meta.label)}
                  </span>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center cursor-pointer">
                  <X size={16} className="text-text-muted" />
                </button>
              </div>
            )}

            {/* Conteudo rolavel */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <h2 className="font-display font-bold text-text-primary text-xl sm:text-2xl leading-tight mb-3">
                {title}
              </h2>

              {item.author && (
                <p className="text-text-muted text-xs font-mono-stonks mb-4">
                  por <span className="text-text-secondary">{item.author}</span>
                  {item._category && <span className="ml-2">· {item._category}</span>}
                </p>
              )}

              {desc && (
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                  {desc}
                </p>
              )}

              {/* Stats */}
              {(item.score !== undefined || item.numComments !== undefined || item.views !== undefined) && (
                <div className="flex items-center gap-4 mt-5 text-[11px] font-mono-stonks text-text-muted">
                  {item.score !== undefined && <span>▲ {item.score.toLocaleString()}</span>}
                  {item.numComments !== undefined && <span>💬 {item.numComments}</span>}
                  {item.views !== undefined && <span>👁 {(item.views / 1000).toFixed(0)}K</span>}
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-text-tertiary text-[10px] mt-6 italic">
                Preview in-app. Clique abaixo pra ler o artigo completo no site original.
              </p>
            </div>

            {/* Rodape fixo com acoes */}
            <div className="shrink-0 flex items-center gap-2 p-3 border-t border-border bg-surface/50">
              <button onClick={handleShare}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-surface-hover border border-border text-text-secondary hover:text-text-primary hover:border-money/40 cursor-pointer transition-colors text-xs font-mono-stonks font-bold uppercase tracking-wider">
                <Share2 size={13} /> <span className="hidden sm:inline">Share</span>
              </button>
              <button onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-surface-hover border border-border text-text-secondary hover:text-text-primary hover:border-money/40 cursor-pointer transition-colors text-xs font-mono-stonks font-bold uppercase tracking-wider">
                <Copy size={13} /> <span className="hidden sm:inline">{copied ? 'Copiado' : 'Link'}</span>
              </button>
              <a
                href={url}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-money text-[#0a0a0f] font-mono-stonks font-bold uppercase tracking-wider text-xs hover:bg-money-dim transition-colors no-underline"
              >
                <ExternalLink size={13} /> Ler original
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

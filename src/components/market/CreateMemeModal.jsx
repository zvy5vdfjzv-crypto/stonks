import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ImagePlus, Film, Rocket, Check } from 'lucide-react'
import { useGame } from '../../context/GameContext'
import { useLang } from '../../context/LanguageContext'
import { CATEGORIES } from '../../data/trends'

export default function CreateMemeModal({ isOpen, onClose }) {
  const { createMeme } = useGame()
  const { t } = useLang()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [mediaType, setMediaType] = useState('image')
  const [mediaUrl, setMediaUrl] = useState('')
  const [published, setPublished] = useState(false)

  const categoryColors = {
    memes: 'bg-accent/20 border-accent/40 text-accent',
    finance: 'bg-green/20 border-green/40 text-green',
    music: 'bg-blue/20 border-blue/40 text-blue',
    tech: 'bg-accent/20 border-accent/40 text-accent',
    ai: 'bg-pink/20 border-pink/40 text-pink',
    influencer: 'bg-yellow/20 border-yellow/40 text-yellow',
    viral: 'bg-pink/20 border-pink/40 text-pink',
    cars: 'bg-red/20 border-red/40 text-red',
    sports: 'bg-green/20 border-green/40 text-green',
    gaming: 'bg-blue/20 border-blue/40 text-blue',
  }

  const reset = () => {
    setStep(1); setName(''); setTicker(''); setCategory(''); setDescription('')
    setMediaType('image'); setMediaUrl(''); setPublished(false)
  }

  const handleClose = () => { reset(); onClose() }

  const handlePublish = () => {
    if (!name.trim() || !ticker.trim() || !category) return

    createMeme({
      name: name.trim(),
      ticker: ticker.trim(),
      category,
      description: description.trim(),
      thumbnail: mediaType === 'image' && mediaUrl ? mediaUrl : null,
      youtubeId: mediaType === 'video' && mediaUrl ? extractYouTubeId(mediaUrl) : null,
    })

    setPublished(true)
    setTimeout(() => { handleClose() }, 2000)
  }

  const canAdvance = step === 1
    ? name.trim() && ticker.trim() && category
    : true

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border
              rounded-t-3xl max-h-[85vh] overflow-y-auto sm:bottom-auto sm:top-1/2 sm:left-1/2
              sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:max-w-md sm:w-[90vw]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface z-10">
              <h2 className="font-bold text-text-primary text-base">
                {published ? '' : step === 1 ? 'Criar Meme' : 'Adicionar Media'}
              </h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center cursor-pointer text-text-muted">
                <X size={18} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {published ? (
                <motion.div
                  key="published"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-8 text-center"
                >
                  <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }} className="text-6xl mb-4">🚀</motion.div>
                  <p className="text-green font-bold text-xl">Meme Publicado!</p>
                  <p className="text-text-secondary text-sm mt-2">Seu meme esta no mercado. Outros usuarios ja podem BANCAR!</p>
                </motion.div>
              ) : step === 1 ? (
                <motion.div key="step1" initial={{ x: 0 }} exit={{ x: -300, opacity: 0 }} className="p-4 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-text-secondary text-xs font-medium block mb-1.5">Nome do meme / trend</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Cachorro Caramelo no Oscar"
                      maxLength={50}
                      className="w-full bg-surface-hover border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                    />
                  </div>

                  {/* Ticker */}
                  <div>
                    <label className="text-text-secondary text-xs font-medium block mb-1.5">Ticker (sigla)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent font-semibold text-sm">$</span>
                      <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                        placeholder="CARAML"
                        maxLength={6}
                        className="w-full bg-surface-hover border border-border rounded-xl pl-7 pr-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 uppercase"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-text-secondary text-xs font-medium block mb-1.5">Nicho</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border
                            ${category === cat
                              ? categoryColors[cat] || 'bg-accent/20 border-accent/40 text-accent'
                              : 'bg-surface-hover border-border text-text-muted hover:text-text-secondary'
                            }`}
                        >
                          {t(`categories.${cat}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-text-secondary text-xs font-medium block mb-1.5">Descricao (opcional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Contexto sobre o meme... por que vai viralizar?"
                      rows={2}
                      maxLength={200}
                      className="w-full bg-surface-hover border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none"
                    />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!canAdvance}
                    className="w-full bg-accent hover:bg-accent-light disabled:opacity-30 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all disabled:cursor-not-allowed"
                  >
                    Proximo: Adicionar Media
                  </button>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-4 space-y-4">
                  {/* Media type toggle */}
                  <div className="flex bg-surface-hover rounded-xl p-1">
                    <button
                      onClick={() => setMediaType('image')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all
                        ${mediaType === 'image' ? 'bg-accent text-white' : 'text-text-muted'}`}
                    >
                      <ImagePlus size={14} /> Imagem
                    </button>
                    <button
                      onClick={() => setMediaType('video')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all
                        ${mediaType === 'video' ? 'bg-accent text-white' : 'text-text-muted'}`}
                    >
                      <Film size={14} /> Video
                    </button>
                  </div>

                  {/* URL input */}
                  <div>
                    <label className="text-text-secondary text-xs font-medium block mb-1.5">
                      {mediaType === 'image' ? 'URL da imagem do meme' : 'URL do video (YouTube)'}
                    </label>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder={mediaType === 'image' ? 'https://i.imgur.com/...' : 'https://youtube.com/watch?v=...'}
                      className="w-full bg-surface-hover border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                    />
                  </div>

                  {/* Preview */}
                  {mediaUrl && mediaType === 'image' && (
                    <div className="rounded-xl overflow-hidden border border-border h-40">
                      <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                  {mediaUrl && mediaType === 'video' && (
                    <div className="rounded-xl overflow-hidden border border-border h-40">
                      <img src={`https://img.youtube.com/vi/${extractYouTubeId(mediaUrl)}/hqdefault.jpg`} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Preview card */}
                  <div className="bg-surface-hover rounded-xl p-3 border border-border">
                    <p className="text-text-muted text-[10px] uppercase font-semibold mb-2">Preview do meme no mercado</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🆕</span>
                      <div>
                        <p className="text-text-primary text-sm font-semibold">{name || 'Nome do meme'}</p>
                        <p className="text-text-muted text-xs">${ticker || 'TICKER'} · {category ? t(`categories.${category}`) : 'Nicho'}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-green text-xs font-semibold">S$ IPO</p>
                        <p className="text-text-muted text-[10px]">Preco inicial</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setStep(1)} className="bg-surface-hover border border-border text-text-secondary px-4 py-3 rounded-xl text-sm font-medium cursor-pointer hover:text-text-primary transition-colors">
                      Voltar
                    </button>
                    <button
                      onClick={handlePublish}
                      className="flex-1 bg-green hover:bg-green/80 text-white py-3 rounded-xl font-bold text-sm cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Rocket size={16} /> Publicar Meme
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function extractYouTubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : url.length === 11 ? url : null
}

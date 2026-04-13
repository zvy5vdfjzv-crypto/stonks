import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowRight, Check, Sparkles, Camera, Shuffle, User, ImagePlus } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useLang } from '../context/LanguageContext'
import { CATEGORIES } from '../data/trends'

const EMOJIS = ['🎮', '🚀', '💎', '🔥', '👑', '🦍', '🐱', '🤖', '⚡', '🎯', '🌙', '🎨']

const SKIN_COLORS = ['#FFD5BE', '#F5C5A3', '#D4A37B', '#A67C5A', '#8B5E3C', '#6B4226']
const HAIR_COLORS = ['#2C1810', '#4A3728', '#8B6F47', '#D4A34E', '#E8C07A', '#C23616', '#6C5CE7', '#00D68F']
const BG_COLORS = ['#6C5CE7', '#00D68F', '#FF6B6B', '#54A0FF', '#FECA57', '#FF6B9D', '#2C3E50', '#1ABC9C']
const FACE_STYLES = ['happy', 'cool', 'wink', 'surprised', 'chill', 'laugh']

function generateAvatarSVG(skin, hair, bg, face) {
  const eyes = {
    happy: '<circle cx="38" cy="42" r="3" fill="#333"/><circle cx="62" cy="42" r="3" fill="#333"/>',
    cool: '<rect x="30" y="39" width="16" height="6" rx="3" fill="#333"/><rect x="54" y="39" width="16" height="6" rx="3" fill="#333"/>',
    wink: '<circle cx="38" cy="42" r="3" fill="#333"/><path d="M58 42 Q62 38 66 42" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    surprised: '<circle cx="38" cy="42" r="4" fill="#333"/><circle cx="62" cy="42" r="4" fill="#333"/>',
    chill: '<path d="M33 42 Q38 40 43 42" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M57 42 Q62 40 67 42" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    laugh: '<path d="M33 40 Q38 44 43 40" stroke="#333" stroke-width="2" fill="none"/><path d="M57 40 Q62 44 67 40" stroke="#333" stroke-width="2" fill="none"/>',
  }
  const mouths = {
    happy: '<path d="M42 56 Q50 64 58 56" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>',
    cool: '<line x1="44" y1="58" x2="56" y2="58" stroke="#333" stroke-width="2" stroke-linecap="round"/>',
    wink: '<path d="M44 57 Q50 62 56 57" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>',
    surprised: '<ellipse cx="50" cy="59" rx="5" ry="6" fill="#333"/>',
    chill: '<path d="M43 57 Q50 61 57 57" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>',
    laugh: '<path d="M40 55 Q50 68 60 55" stroke="#333" stroke-width="2" fill="#fff" stroke-linecap="round"/>',
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="${bg}"/>
    <circle cx="50" cy="52" r="30" fill="${skin}"/>
    <ellipse cx="50" cy="25" rx="28" ry="12" fill="${hair}"/>
    <ellipse cx="28" cy="35" rx="5" ry="8" fill="${hair}"/>
    <ellipse cx="72" cy="35" rx="5" ry="8" fill="${hair}"/>
    ${eyes[face] || eyes.happy}
    ${mouths[face] || mouths.happy}
  </svg>`
}


const nicheInfo = {
  memes: { emoji: '😂', desc: 'Os melhores memes da internet' },
  finance: { emoji: '💰', desc: 'Mercado financeiro e crypto memes' },
  viral: { emoji: '⚡', desc: 'O que ta explodindo agora' },
  tech: { emoji: '💻', desc: 'Tech bros e Silicon Valley cringe' },
  ai: { emoji: '🤖', desc: 'Inteligencia artificial e o futuro' },
  influencer: { emoji: '📱', desc: 'Creators e influencers' },
  music: { emoji: '🎵', desc: 'Musicas virais e trends sonoras' },
  cars: { emoji: '🏎️', desc: 'Cultura automotiva e fails' },
  sports: { emoji: '⚽', desc: 'Esportes, edits e compilados' },
  gaming: { emoji: '🎮', desc: 'Games, streams e nostalgia' },
}

function AvatarPicker({ avatarType, setAvatarType, avatar, setAvatar, avatarUrl, setAvatarUrl }) {
  const fileRef = useRef(null)
  const [skinIdx, setSkinIdx] = useState(0)
  const [hairIdx, setHairIdx] = useState(0)
  const [bgIdx, setBgIdx] = useState(0)
  const [faceIdx, setFaceIdx] = useState(0)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarUrl(ev.target.result)
      setAvatarType('photo')
      setAvatar(null)
    }
    reader.readAsDataURL(file)
  }

  const currentSVG = generateAvatarSVG(SKIN_COLORS[skinIdx], HAIR_COLORS[hairIdx], BG_COLORS[bgIdx], FACE_STYLES[faceIdx])
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(currentSVG)}`

  const randomizeAvatar = () => {
    setSkinIdx(Math.floor(Math.random() * SKIN_COLORS.length))
    setHairIdx(Math.floor(Math.random() * HAIR_COLORS.length))
    setBgIdx(Math.floor(Math.random() * BG_COLORS.length))
    setFaceIdx(Math.floor(Math.random() * FACE_STYLES.length))
  }

  const selectCustomAvatar = () => {
    setAvatarUrl(svgDataUrl)
    setAvatarType('3d')
    setAvatar(null)
  }

  return (
    <div className="space-y-4">
      <label className="text-text-secondary text-xs font-medium block">Seu avatar</label>

      {/* Avatar type tabs */}
      <div className="flex bg-surface-hover rounded-xl p-1 gap-1">
        {[
          { id: 'emoji', icon: '😎', label: 'Emoji' },
          { id: 'photo', icon: null, iconComp: Camera, label: 'Foto' },
          { id: '3d', icon: null, iconComp: User, label: 'Criar Avatar' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAvatarType(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold
              cursor-pointer transition-all
              ${avatarType === tab.id ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {tab.icon ? <span>{tab.icon}</span> : <tab.iconComp size={14} />}
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {/* Emoji picker */}
        {avatarType === 'emoji' && (
          <div>
            <div className="flex flex-wrap gap-2 justify-center">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => { setAvatar(e); setAvatarUrl(null) }}
                  className={`w-12 h-12 rounded-xl text-xl flex items-center justify-center cursor-pointer transition-all
                    ${avatar === e
                      ? 'bg-accent/20 border-2 border-accent scale-110'
                      : 'bg-surface border border-border hover:border-accent/30'
                    }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photo upload */}
        {avatarType === 'photo' && (
          <div className="flex flex-col items-center gap-3">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-28 h-28 rounded-2xl border-2 border-dashed border-border hover:border-accent/50
                flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden bg-surface"
            >
              {avatarUrl && avatarType === 'photo' ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={24} className="text-text-muted mb-1" />
                  <span className="text-text-muted text-[10px]">Clique para subir</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <p className="text-text-muted text-[10px]">JPG, PNG ou GIF. Max 5MB.</p>
          </div>
        )}

        {/* Avatar Creator */}
        {avatarType === '3d' && (
          <div className="space-y-4">

            {/* Preview */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl border-2 border-accent/30 overflow-hidden">
                  <img src={svgDataUrl} alt="Avatar" className="w-full h-full" />
                </div>
                <button
                  onClick={randomizeAvatar}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent text-white
                    flex items-center justify-center cursor-pointer hover:bg-accent-light transition-colors shadow-lg"
                >
                  <Shuffle size={14} />
                </button>
              </div>
            </div>

            {/* Skin color */}
            <div>
              <p className="text-text-muted text-[10px] font-medium mb-1.5 text-center">Pele</p>
              <div className="flex gap-2 justify-center">
                {SKIN_COLORS.map((c, i) => (
                  <button key={c} onClick={() => setSkinIdx(i)}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all ${skinIdx === i ? 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--bg-app)] scale-110' : 'hover:scale-105'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Hair color */}
            <div>
              <p className="text-text-muted text-[10px] font-medium mb-1.5 text-center">Cabelo</p>
              <div className="flex gap-2 justify-center">
                {HAIR_COLORS.map((c, i) => (
                  <button key={c} onClick={() => setHairIdx(i)}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all ${hairIdx === i ? 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--bg-app)] scale-110' : 'hover:scale-105'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Background */}
            <div>
              <p className="text-text-muted text-[10px] font-medium mb-1.5 text-center">Fundo</p>
              <div className="flex gap-2 justify-center">
                {BG_COLORS.map((c, i) => (
                  <button key={c} onClick={() => setBgIdx(i)}
                    className={`w-8 h-8 rounded-lg cursor-pointer transition-all ${bgIdx === i ? 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--bg-app)] scale-110' : 'hover:scale-105'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Expression */}
            <div>
              <p className="text-text-muted text-[10px] font-medium mb-1.5 text-center">Expressao</p>
              <div className="flex gap-2 justify-center">
                {['😊', '😎', '😉', '😮', '😌', '😂'].map((emoji, i) => (
                  <button key={i} onClick={() => setFaceIdx(i)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center cursor-pointer transition-all
                      ${faceIdx === i ? 'bg-accent/20 border border-accent scale-110' : 'bg-surface border border-border hover:border-accent/30'}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={selectCustomAvatar}
              className="w-full bg-accent/20 text-accent py-2.5 rounded-xl text-xs font-semibold cursor-pointer
                hover:bg-accent/30 transition-colors"
            >
              Usar este avatar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const { register, login, authError } = useUser()
  const { t } = useLang()
  const [mode, setMode] = useState('welcome') // 'welcome', 'login', 'register'
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')
  const [avatar, setAvatar] = useState('🎮')
  const [avatarType, setAvatarType] = useState('emoji')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [selectedNiches, setSelectedNiches] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const toggleNiche = (niche) => {
    setSelectedNiches(prev =>
      prev.includes(niche)
        ? prev.filter(n => n !== niche)
        : prev.length < 5 ? [...prev, niche] : prev
    )
  }

  const handleRegister = async () => {
    if (selectedNiches.length < 2) return
    setSubmitting(true)
    await register({
      email,
      password,
      phone,
      displayName,
      handle,
      avatar: avatarUrl || avatar,
      avatarType,
      niches: selectedNiches,
    })
    setSubmitting(false)
  }

  const handleLogin = async () => {
    if (!email.includes('@') || password.length < 4) return
    setSubmitting(true)
    const ok = await login(email, password)
    setSubmitting(false)
    if (!ok) return // authError will show
  }

  const canNextStep1 = displayName.trim().length >= 2 && handle.trim().length >= 2 && email.includes('@') && password.length >= 6

  return (
    <div className="min-h-dvh bg-[var(--bg-app)] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {/* Welcome screen */}
          {mode === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-5 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-accent" size={40} fill="currentColor" />
                </div>
                <h1 className="text-4xl font-bold text-text-primary">
                  STON<span className="text-accent">KS</span>
                </h1>
                <p className="text-text-secondary text-sm mt-2">A Bolsa dos Virais</p>
              </div>
              <button onClick={() => setMode('register')}
                className="w-full bg-accent hover:bg-accent-light text-white py-3.5 rounded-xl font-semibold text-sm cursor-pointer transition-all flex items-center justify-center gap-2">
                <Sparkles size={16} /> Criar conta
              </button>
              <button onClick={() => setMode('login')}
                className="w-full bg-surface border border-border hover:border-accent/30 text-text-primary py-3.5 rounded-xl font-semibold text-sm cursor-pointer transition-all">
                Ja tenho conta
              </button>
            </motion.div>
          )}

          {/* Login screen */}
          {mode === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: 200 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-accent" size={32} fill="currentColor" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Entrar no STONKS</h2>
              </div>
              {authError && (
                <div className="bg-red/15 border border-red/30 rounded-xl px-4 py-2.5 text-red text-xs">{authError}</div>
              )}
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1.5">Senha</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
              </div>
              <button onClick={handleLogin} disabled={submitting || !email.includes('@') || password.length < 4}
                className="w-full bg-accent hover:bg-accent-light disabled:opacity-30 text-white py-3.5 rounded-xl font-semibold text-sm cursor-pointer transition-all disabled:cursor-not-allowed">
                {submitting ? 'Entrando...' : 'Entrar'}
              </button>
              <button onClick={() => { setMode('welcome'); setPassword(''); setEmail('') }}
                className="w-full text-text-muted hover:text-text-secondary text-xs py-2 cursor-pointer transition-colors">
                Voltar
              </button>
            </motion.div>
          )}

          {mode === 'register' && step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -200 }}
              className="space-y-5"
            >
              {/* Logo */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-accent" size={32} fill="currentColor" />
                </div>
                <h1 className="text-3xl font-bold text-text-primary">
                  STON<span className="text-accent">KS</span>
                </h1>
                <p className="text-text-secondary text-sm mt-2">Criar sua conta</p>
              </div>

              {authError && (
                <div className="bg-red/15 border border-red/30 rounded-xl px-4 py-2.5 text-red text-xs">{authError}</div>
              )}

              {/* Avatar picker */}
              <AvatarPicker
                avatarType={avatarType}
                setAvatarType={setAvatarType}
                avatar={avatar}
                setAvatar={setAvatar}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
              />

              {/* Name */}
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1.5">Nome</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Como querem te chamar?"
                  maxLength={30}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                />
              </div>

              {/* Handle */}
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1.5">@ (seu arroba)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-medium text-sm">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
                    placeholder="seunick"
                    maxLength={20}
                    className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1.5">Telefone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9+() -]/g, '').slice(0, 20))}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1.5">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 6 caracteres"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canNextStep1}
                className="w-full bg-accent hover:bg-accent-light disabled:opacity-30 text-white py-3.5 rounded-xl
                  font-semibold text-sm cursor-pointer transition-all disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                Escolher seus nichos <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {mode === 'register' && step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -200 }}
              className="space-y-5"
            >
              <div className="text-center mb-4">
                <Sparkles className="text-accent mx-auto mb-3" size={28} />
                <h2 className="text-xl font-bold text-text-primary">Escolha suas tribos</h2>
                <p className="text-text-secondary text-sm mt-1">
                  Selecione 2 a 5 nichos. O algoritmo vai priorizar seu feed.
                </p>
              </div>

              <div className="space-y-2">
                {CATEGORIES.map(cat => {
                  const info = nicheInfo[cat]
                  const selected = selectedNiches.includes(cat)
                  return (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleNiche(cat)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all text-left
                        ${selected
                          ? 'bg-accent/15 border border-accent/40'
                          : 'bg-surface border border-border hover:border-accent/20'
                        }`}
                    >
                      <span className="text-2xl">{info.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${selected ? 'text-accent' : 'text-text-primary'}`}>
                          {t(`categories.${cat}`)}
                        </p>
                        <p className="text-text-muted text-xs">{info.desc}</p>
                      </div>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <div className="sticky bottom-0 bg-[var(--bg-app)] pt-3 pb-2 space-y-2">
                <p className="text-text-muted text-xs text-center">
                  {selectedNiches.length}/5 selecionados {selectedNiches.length < 2 ? '(minimo 2)' : ''}
                </p>
                <button
                  onClick={handleRegister}
                  disabled={selectedNiches.length < 2 || submitting}
                  className="w-full bg-green hover:bg-green/80 disabled:opacity-30 text-white py-3.5 rounded-xl
                    font-bold text-sm cursor-pointer transition-all disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> {submitting ? 'Criando conta...' : 'Entrar no STONKS'}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full text-text-muted hover:text-text-secondary text-xs py-2 cursor-pointer transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => { setMode('welcome'); setStep(1) }}
                  className="w-full text-text-muted hover:text-text-secondary text-[10px] py-1 cursor-pointer transition-colors"
                >
                  Ja tenho conta
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

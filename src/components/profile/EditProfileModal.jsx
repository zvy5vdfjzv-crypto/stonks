import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Check, Link2, Globe } from 'lucide-react'
import { useUser } from '../../context/UserContext'

function SocialIcon({ type, size = 14, className = '' }) {
  const s = size
  if (type === 'instagram') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
  if (type === 'x') return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  if (type === 'youtube') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
  if (type === 'linkedin') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
  return <Globe size={s} className={className} />
}

const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram', placeholder: '@seuperfil' },
  { key: 'x', label: 'X (Twitter)', placeholder: '@seuperfil' },
  { key: 'youtube', label: 'YouTube', placeholder: '@seucanal' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: '/in/seuperfil' },
]

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useUser()
  const fileRef = useRef(null)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [handle, setHandle] = useState(user?.handle?.replace('@', '') || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [socialLinks, setSocialLinks] = useState(user?.socialLinks || { instagram: '', x: '', youtube: '', linkedin: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saved, setSaved] = useState(false)

  if (!user) return null

  const currentAvatar = avatarPreview || user.avatar
  const isUrl = typeof currentAvatar === 'string' && (currentAvatar.startsWith('http') || currentAvatar.startsWith('data:'))

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || file.size > 5 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const updateSocial = (key, value) => {
    setSocialLinks(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    if (!displayName.trim() || !handle.trim()) return
    const updates = {
      displayName: displayName.trim(),
      handle: handle.trim(),
      bio: bio.trim(),
      socialLinks,
    }
    if (avatarPreview) {
      updates.avatar = avatarPreview
      updates.avatarType = 'photo'
    }
    updateProfile(updates)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1200)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border
              rounded-t-3xl max-h-[90vh] overflow-y-auto
              sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
              sm:rounded-2xl sm:max-w-md sm:w-[90vw] shadow-2xl"
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.div key="saved" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.4 }}
                    className="w-14 h-14 rounded-full bg-green/20 flex items-center justify-center mx-auto mb-3">
                    <Check size={24} className="text-green" />
                  </motion.div>
                  <p className="text-green font-semibold text-lg">Perfil atualizado!</p>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }} className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-text-primary text-lg">Editar Perfil</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center cursor-pointer text-text-muted">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Avatar - clicavel */}
                  <div className="flex justify-center mb-5">
                    <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border group-hover:border-accent/50 transition-colors">
                        {isUrl ? (
                          <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-accent/20 flex items-center justify-center text-4xl">{currentAvatar}</div>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100
                        transition-opacity flex items-center justify-center">
                        <Camera size={20} className="text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent text-white
                        flex items-center justify-center shadow-lg">
                        <Camera size={12} />
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="mb-3">
                    <label className="text-text-secondary text-xs font-medium block mb-1">Nome</label>
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30}
                      className="w-full bg-surface-hover border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50" />
                  </div>

                  {/* Handle */}
                  <div className="mb-3">
                    <label className="text-text-secondary text-xs font-medium block mb-1">@ arroba</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent font-medium text-sm">@</span>
                      <input type="text" value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
                        className="w-full bg-surface-hover border border-border rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50" />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <label className="text-text-secondary text-xs font-medium block mb-1">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={3}
                      placeholder="Conta quem voce e nesse universo de memes..."
                      className="w-full bg-surface-hover border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary
                        placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none" />
                    <p className="text-text-muted text-[10px] mt-0.5 text-right">{bio.length}/160</p>
                  </div>

                  {/* Social links */}
                  <div className="mb-5">
                    <label className="text-text-secondary text-xs font-medium block mb-2">
                      <Link2 size={12} className="inline mr-1" />
                      Links sociais
                    </label>
                    <div className="space-y-2">
                      {SOCIAL_FIELDS.map(field => (
                        <div key={field.key} className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border flex items-center justify-center shrink-0">
                            <SocialIcon type={field.key} size={14} className="text-text-secondary" />
                          </div>
                          <input
                            type="text"
                            value={socialLinks[field.key]}
                            onChange={(e) => updateSocial(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="flex-1 bg-surface-hover border border-border rounded-lg px-3 py-2 text-xs
                              text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 🎮 Avatar 3D placeholder — integracao Ready Player Me em breve */}
                  <div>
                    <label className="text-text-secondary text-xs font-medium block mb-2">
                      Avatar 3D <span className="text-[9px] bg-money/15 text-money border border-money/30 px-1.5 py-0.5 rounded ml-1 font-mono-stonks uppercase tracking-wider">Em breve</span>
                    </label>
                    <div id="rpm-container"
                      className="aspect-video w-full bg-gradient-to-br from-[#14141c] to-[#0a0a0f] border border-dashed border-border rounded-xl
                        flex flex-col items-center justify-center gap-2 text-center p-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center">
                        <span className="text-2xl">🕴️</span>
                      </div>
                      <p className="text-text-secondary text-xs font-mono-stonks uppercase tracking-wider">
                        Ready Player Me
                      </p>
                      <p className="text-text-muted text-[10px] max-w-xs">
                        Em breve: conecte seu avatar 3D premium e equipe items de raridade lendaria.
                      </p>
                    </div>
                  </div>

                  <button onClick={handleSave} disabled={!displayName.trim() || !handle.trim()}
                    className="w-full bg-accent hover:bg-accent-light disabled:opacity-30 text-white py-3 rounded-xl
                      font-semibold text-sm cursor-pointer transition-all disabled:cursor-not-allowed">
                    Salvar alteracoes
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

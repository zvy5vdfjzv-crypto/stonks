// ⚙️ STONKS Settings — padrao rede social (Instagram/X/TikTok hybrid)
// Mobile: lista clicavel → sub-view. Desktop: sidebar + content panel.
// 8 secoes: Conta / Privacidade / Notificacoes / Aparencia / Mercado / Seguranca / Dados / Sobre
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, User, Lock, Bell, Palette, TrendingUp, Shield, Database, Info,
  Moon, Sun, Type, Globe, Download, Trash2, LogOut, Check, Volume2, VolumeX,
  Eye, EyeOff, AtSign, Activity, Code2, AlertTriangle, Monitor, X
} from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useLang } from '../context/LanguageContext'
import { useNotifications } from '../context/NotificationContext'
import { supabase } from '../lib/supabase'
import useLocalStorage from '../hooks/useLocalStorage'

const APP_VERSION = '1.0.0'

// Toggle iOS-style — maior (52x28), inner highlight no knob, spring polido
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative w-[52px] h-7 rounded-full cursor-pointer transition-colors shrink-0 disabled:opacity-40
        ${checked
          ? 'bg-money'
          : 'bg-surface-hover border border-border'}`}
      style={checked
        ? { boxShadow: '0 0 12px rgba(0,255,136,0.35), inset 0 1px 3px rgba(0,0,0,0.15)' }
        : { boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.12)' }}
    >
      <motion.span
        animate={{ x: checked ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 520, damping: 32, mass: 0.8 }}
        className="absolute top-0.5 w-6 h-6 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f5 100%)',
          boxShadow: checked
            ? '0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)'
            : '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.15)',
        }}
      />
    </button>
  )
}

// 🐛 Fix: antes era <button>, mas isso impedia <Toggle> dentro de funcionar
// (HTML invalido: botao dentro de botao). Agora e div clicavel — Toggle opera livre.
function Row({ icon: Icon, label, desc, right, onClick, danger }) {
  const clickable = !!onClick
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }
      } : undefined}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left min-w-0
        ${clickable ? 'hover:bg-surface-hover cursor-pointer' : 'cursor-default'}`}
    >
      {Icon && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
          ${danger ? 'bg-loss/15 text-loss' : 'bg-surface-hover text-text-secondary'}`}>
          <Icon size={15} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${danger ? 'text-loss' : 'text-text-primary'}`}>{label}</p>
        {desc && <p className="text-text-muted text-[11px] mt-0.5 truncate">{desc}</p>}
      </div>
      {right && (
        <div
          className="shrink-0 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {right}
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-text-muted text-[10px] font-mono-stonks font-bold uppercase tracking-[0.2em] px-4 pt-5 pb-2">
      {children}
    </h2>
  )
}

// ========== SECTIONS ==========

function AccountSection() {
  const { user, updateProfile } = useUser()
  const [editingField, setEditingField] = useState(null) // 'name' | 'handle' | 'bio' | null
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [handle, setHandle] = useState(user?.handle?.replace('@', '') || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [status, setStatus] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const saveField = (field) => {
    if (field === 'name') updateProfile({ displayName: displayName.trim() })
    else if (field === 'handle') updateProfile({ handle: handle.replace(/[^a-z0-9_]/gi, '').toLowerCase() })
    else if (field === 'bio') updateProfile({ bio: bio.trim() })
    setEditingField(null)
    setStatus({ type: 'ok', msg: 'Salvo!' })
    setTimeout(() => setStatus(null), 1500)
  }

  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 4000); return }
    setDeleting(true)
    try {
      // Delete profile (CASCADE apaga transactions vinculadas)
      await supabase.from('profiles').delete().eq('id', user.id)
      // Limpa session + localStorage local
      await supabase.auth.signOut()
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('stonks_')) localStorage.removeItem(k)
      })
      window.location.href = '/'
    } catch (err) {
      alert('Erro ao deletar conta: ' + (err.message || 'desconhecido'))
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div>
      {status && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-money/15 border border-money/30 text-money text-xs font-mono-stonks uppercase tracking-wider text-center">
          ✓ {status.msg}
        </div>
      )}

      <SectionTitle>Perfil</SectionTitle>
      <div className="bg-surface border-y border-border divide-y divide-border/40">
        {/* Nome — inline edit */}
        <div>
          <Row
            icon={User}
            label="Nome"
            desc={editingField !== 'name' ? (user?.displayName || 'Sem nome') : 'Editando...'}
            right={editingField !== 'name' && <ChevronRight size={16} className="text-text-muted" />}
            onClick={() => { setEditingField(editingField === 'name' ? null : 'name'); setDisplayName(user?.displayName || '') }}
          />
          <AnimatePresence>
            {editingField === 'name' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-3 space-y-2">
                  <input
                    type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                    maxLength={40}
                    placeholder="Como querem te chamar?"
                    className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-money/50"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingField(null)} className="flex-1 py-1.5 rounded-lg text-[11px] font-mono-stonks font-bold uppercase tracking-wider bg-surface-hover border border-border text-text-muted cursor-pointer hover:text-text-primary">Cancelar</button>
                    <button onClick={() => saveField('name')} disabled={!displayName.trim()} className="flex-1 py-1.5 rounded-lg text-[11px] font-mono-stonks font-bold uppercase tracking-wider bg-money text-[#0a0a0f] cursor-pointer hover:bg-money-dim disabled:opacity-40 disabled:cursor-not-allowed">Salvar</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Handle — inline edit */}
        <div>
          <Row
            icon={AtSign}
            label="@ (handle)"
            desc={editingField !== 'handle' ? (user?.handle || '@sem-handle') : 'Editando...'}
            right={editingField !== 'handle' && <ChevronRight size={16} className="text-text-muted" />}
            onClick={() => { setEditingField(editingField === 'handle' ? null : 'handle'); setHandle(user?.handle?.replace('@','') || '') }}
          />
          <AnimatePresence>
            {editingField === 'handle' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-3 space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-money font-bold text-sm">@</span>
                    <input
                      type="text" value={handle}
                      onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
                      maxLength={20} placeholder="seunick"
                      className="w-full bg-surface-hover border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-money/50 font-mono-stonks"
                      autoFocus
                    />
                  </div>
                  <p className="text-text-muted text-[10px]">Somente letras minusculas, numeros e underscore</p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingField(null)} className="flex-1 py-1.5 rounded-lg text-[11px] font-mono-stonks font-bold uppercase tracking-wider bg-surface-hover border border-border text-text-muted cursor-pointer hover:text-text-primary">Cancelar</button>
                    <button onClick={() => saveField('handle')} disabled={handle.length < 2} className="flex-1 py-1.5 rounded-lg text-[11px] font-mono-stonks font-bold uppercase tracking-wider bg-money text-[#0a0a0f] cursor-pointer hover:bg-money-dim disabled:opacity-40 disabled:cursor-not-allowed">Salvar</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bio — inline edit */}
        <div>
          <Row
            icon={Activity}
            label="Bio"
            desc={editingField !== 'bio' ? (user?.bio || 'Sem bio ainda') : 'Editando...'}
            right={editingField !== 'bio' && <ChevronRight size={16} className="text-text-muted" />}
            onClick={() => { setEditingField(editingField === 'bio' ? null : 'bio'); setBio(user?.bio || '') }}
          />
          <AnimatePresence>
            {editingField === 'bio' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-3 space-y-2">
                  <textarea
                    value={bio} onChange={e => setBio(e.target.value)} maxLength={160} rows={3}
                    placeholder="Conta algo sobre voce..."
                    className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-money/50 resize-none"
                    autoFocus
                  />
                  <p className="text-text-muted text-[10px] text-right">{bio.length}/160</p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingField(null)} className="flex-1 py-1.5 rounded-lg text-[11px] font-mono-stonks font-bold uppercase tracking-wider bg-surface-hover border border-border text-text-muted cursor-pointer hover:text-text-primary">Cancelar</button>
                    <button onClick={() => saveField('bio')} className="flex-1 py-1.5 rounded-lg text-[11px] font-mono-stonks font-bold uppercase tracking-wider bg-money text-[#0a0a0f] cursor-pointer hover:bg-money-dim">Salvar</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Row icon={Globe} label="Email" desc={user?.email} />
      </div>

      <SectionTitle>Sessao</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={LogOut} label="Sair da conta" onClick={async () => {
          if (confirm('Sair da conta?')) {
            await supabase.auth.signOut()
            window.location.href = '/'
          }
        }} />
      </div>

      <SectionTitle>Zona perigosa</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row
          icon={Trash2} danger
          label={deleting ? 'Deletando...' : confirmDelete ? 'Tap de novo pra confirmar' : 'Deletar conta'}
          desc={confirmDelete ? 'Apaga perfil, historico e sai' : 'Remove dados, holdings, transactions'}
          onClick={handleDeleteAccount}
        />
      </div>
    </div>
  )
}

function PrivacySection() {
  const { user, updatePrivacy } = useUser()
  const p = user?.privacy || { privateAccount: false, showActivity: 'followers', allowMentions: true }

  return (
    <div>
      <SectionTitle>Visibilidade</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={Lock} label="Conta privada" desc="Apenas seguidores veem seu conteudo" right={<Toggle checked={p.privateAccount} onChange={v => updatePrivacy('privateAccount', v)} />} />
      </div>

      <SectionTitle>Atividade</SectionTitle>
      <div className="bg-surface border-y border-border">
        <p className="px-4 pt-3 text-text-secondary text-xs">Quem pode ver suas transacoes e posicoes</p>
        {['followers', 'mutuals', 'nobody'].map((opt, i) => (
          <button key={opt} onClick={() => updatePrivacy('showActivity', opt)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover cursor-pointer border-t border-border/40 first:border-t-0 mt-2">
            <span className="text-text-primary text-sm">
              {opt === 'followers' ? 'Seus seguidores' : opt === 'mutuals' ? 'Seguidores mutuos' : 'Ninguem (so voce)'}
            </span>
            {p.showActivity === opt && <Check size={16} className="text-money" strokeWidth={3} />}
          </button>
        ))}
      </div>

      <SectionTitle>Interacoes</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={AtSign} label="Permitir marcações" desc="Outros podem te mencionar em posts" right={<Toggle checked={p.allowMentions} onChange={v => updatePrivacy('allowMentions', v)} />} />
      </div>
    </div>
  )
}

function NotificationsSection() {
  const { muted, toggleMute } = useNotifications()
  const [bancadaPush, setBancadaPush] = useLocalStorage('stonks_notif_bancada', true)
  const [pumpPush, setPumpPush] = useLocalStorage('stonks_notif_pump', true)
  const [socialPush, setSocialPush] = useLocalStorage('stonks_notif_social', true)
  const [marketPush, setMarketPush] = useLocalStorage('stonks_notif_market', true)
  const [dndStart, setDndStart] = useLocalStorage('stonks_dnd_start', '')
  const [dndEnd, setDndEnd] = useLocalStorage('stonks_dnd_end', '')

  return (
    <div>
      <SectionTitle>Geral</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row
          icon={muted ? VolumeX : Volume2}
          label="Sons, haptics e notificacoes"
          desc={muted ? 'Tudo silenciado' : 'Ativo'}
          right={<Toggle checked={!muted} onChange={() => toggleMute()} />}
        />
      </div>

      <SectionTitle>Push por tipo</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={TrendingUp} label="Bancadas em seus memes" desc="Quando alguem banca algo que voce criou" right={<Toggle checked={bancadaPush} onChange={setBancadaPush} />} />
        <div className="border-t border-border/40" />
        <Row icon={Activity} label="Pump alerts" desc="Quando posicao sua sobe > 15%" right={<Toggle checked={pumpPush} onChange={setPumpPush} />} />
        <div className="border-t border-border/40" />
        <Row icon={User} label="Interacoes sociais" desc="Curtidas, comentarios, seguidores" right={<Toggle checked={socialPush} onChange={setSocialPush} />} />
        <div className="border-t border-border/40" />
        <Row icon={Bell} label="Mercado" desc="Breaking news e eventos do mercado" right={<Toggle checked={marketPush} onChange={setMarketPush} />} />
      </div>

      <SectionTitle>Nao perturbe</SectionTitle>
      <div className="bg-surface border-y border-border px-4 py-3 space-y-3">
        <p className="text-text-secondary text-xs">Silencia notificacoes nesse intervalo (vazio = desativado)</p>
        <div className="flex items-center gap-2 min-w-0">
          <input type="time" value={dndStart} onChange={(e) => setDndStart(e.target.value)}
            className="flex-1 min-w-0 bg-surface-hover border border-border rounded-lg px-2 py-2 text-xs text-text-primary font-mono-stonks" />
          <span className="text-text-muted text-xs shrink-0">ate</span>
          <input type="time" value={dndEnd} onChange={(e) => setDndEnd(e.target.value)}
            className="flex-1 min-w-0 bg-surface-hover border border-border rounded-lg px-2 py-2 text-xs text-text-primary font-mono-stonks" />
        </div>
      </div>
    </div>
  )
}

function AppearanceSection() {
  const { lang, setLang, AVAILABLE_LANGUAGES, geo, isAutoDetected } = useLang()
  const [showLangs, setShowLangs] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage('stonks_theme_dark', true)
  const [fontSize, setFontSize] = useLocalStorage('stonks_fontsize', 'M')
  const [reduceMotion, setReduceMotion] = useLocalStorage('stonks_reduce_motion', false)

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode)
    localStorage.setItem('stonks_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    const sizes = { P: '14px', M: '16px', G: '18px' }
    document.documentElement.style.fontSize = sizes[fontSize] || '16px'
  }, [fontSize])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [reduceMotion])

  return (
    <div>
      <SectionTitle>Tema</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={darkMode ? Moon : Sun} label="Modo escuro" desc={darkMode ? 'Dark' : 'Light'} right={<Toggle checked={darkMode} onChange={setDarkMode} />} />
      </div>

      <SectionTitle>Tipografia</SectionTitle>
      <div className="bg-surface border-y border-border px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Type size={14} className="text-text-secondary" />
          <span className="text-text-primary text-sm">Tamanho da fonte</span>
        </div>
        <div className="flex gap-2">
          {[{ v: 'P', l: 'Pequeno' }, { v: 'M', l: 'Medio' }, { v: 'G', l: 'Grande' }].map(s => (
            <button key={s.v} onClick={() => setFontSize(s.v)}
              className={`flex-1 py-2 rounded-lg text-xs font-mono-stonks font-bold uppercase tracking-wider cursor-pointer transition-all
                ${fontSize === s.v ? 'bg-money text-[#0a0a0f]' : 'bg-surface-hover text-text-muted border border-border hover:text-text-primary'}`}>
              {s.l}
            </button>
          ))}
        </div>
      </div>

      <SectionTitle>Idioma</SectionTitle>
      <div className="bg-surface border-y border-border">
        {(() => {
          const current = AVAILABLE_LANGUAGES.find(l => l.code === lang) || AVAILABLE_LANGUAGES[0]
          return (
            <div>
              <Row
                icon={Globe}
                label={`${current.flag} ${current.native}`}
                desc={isAutoDetected
                  ? `🌍 Auto-detectado${geo?.country ? ` · ${geo.country}${geo.city ? ', ' + geo.city : ''}` : ''}`
                  : '🔒 Definido manualmente'}
                right={<ChevronRight size={16} className={`text-text-muted transition-transform ${showLangs ? 'rotate-90' : ''}`} />}
                onClick={() => setShowLangs(!showLangs)}
              />
              {/* Botao pra resetar pra auto-detect se user esta em manual */}
              {!isAutoDetected && (
                <div className="px-4 py-2 border-t border-border/40">
                  <button
                    onClick={() => {
                      try {
                        localStorage.removeItem('stonks_lang')
                        localStorage.removeItem('stonks_lang_source')
                      } catch {}
                      window.location.reload()
                    }}
                    className="w-full py-2 rounded-lg text-[11px] font-mono-stonks font-bold uppercase tracking-wider
                      bg-money/10 text-money border border-money/30 hover:bg-money/20 transition-colors cursor-pointer
                      flex items-center justify-center gap-2"
                  >
                    🌍 Detectar automaticamente
                  </button>
                  <p className="text-text-muted text-[10px] text-center mt-1.5">
                    Reseta e recarrega pra usar idioma do seu pais
                  </p>
                </div>
              )}
              <AnimatePresence>
                {showLangs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border/40"
                  >
                    {AVAILABLE_LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setShowLangs(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-surface-hover border-t border-border/30 first:border-t-0
                          ${l.code === lang ? 'bg-money/5' : ''}`}
                      >
                        <span className="text-xl">{l.flag}</span>
                        <span className={`flex-1 text-left text-sm ${l.code === lang ? 'text-money font-semibold' : 'text-text-primary'}`}>
                          {l.native}
                        </span>
                        <span className="text-text-muted text-[10px] font-mono-stonks uppercase">{l.code}</span>
                        {l.code === lang && <Check size={14} className="text-money" strokeWidth={3} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })()}
      </div>

      <SectionTitle>Acessibilidade</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={Monitor} label="Reduzir animacoes" desc="Menos movimento, telas estaticas" right={<Toggle checked={reduceMotion} onChange={setReduceMotion} />} />
      </div>
    </div>
  )
}

function MarketSection() {
  const [confirmTrades, setConfirmTrades] = useLocalStorage('stonks_confirm_trades', false)
  const [showSparklines, setShowSparklines] = useLocalStorage('stonks_show_sparklines', true)
  const [currency, setCurrency] = useLocalStorage('stonks_currency', 'S$')

  return (
    <div>
      <SectionTitle>Trading</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={AlertTriangle} label="Confirmar antes de trade" desc="Dialog pedindo confirmacao a cada compra/venda" right={<Toggle checked={confirmTrades} onChange={setConfirmTrades} />} />
      </div>

      <SectionTitle>Exibicao</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={Activity} label="Mostrar sparklines nas posicoes" right={<Toggle checked={showSparklines} onChange={setShowSparklines} />} />
      </div>

      <SectionTitle>Moeda</SectionTitle>
      <div className="bg-surface border-y border-border">
        <p className="px-4 pt-3 text-text-secondary text-xs">Prefixo exibido nos valores</p>
        {['S$', 'HC', '$'].map(c => (
          <button key={c} onClick={() => setCurrency(c)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover cursor-pointer border-t border-border/40 first:border-t-0 mt-2">
            <span className="text-text-primary text-sm font-mono-stonks">{c} 1.000,00</span>
            {currency === c && <Check size={16} className="text-money" strokeWidth={3} />}
          </button>
        ))}
      </div>
    </div>
  )
}

function SecuritySection() {
  const [changing, setChanging] = useState(false)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [status, setStatus] = useState(null)

  const handleChangePassword = async () => {
    setStatus(null)
    if (newPwd.length < 6) { setStatus({ type: 'err', msg: 'Senha deve ter no minimo 6 caracteres' }); return }
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    if (error) { setStatus({ type: 'err', msg: error.message }); return }
    setStatus({ type: 'ok', msg: 'Senha atualizada!' })
    setCurrentPwd(''); setNewPwd('')
    setTimeout(() => { setChanging(false); setStatus(null) }, 2000)
  }

  return (
    <div>
      <SectionTitle>Autenticacao</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={Shield} label="Senha" desc="••••••••" right={<ChevronRight size={16} className="text-text-muted" />} onClick={() => setChanging(!changing)} />
        <AnimatePresence>
          {changing && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/40">
              <div className="p-4 space-y-3">
                <input type="password" placeholder="Nova senha (min 6)" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-money/50" />
                {status && (
                  <p className={`text-xs ${status.type === 'ok' ? 'text-money' : 'text-loss'}`}>{status.msg}</p>
                )}
                <div className="flex gap-2">
                  <button onClick={() => { setChanging(false); setStatus(null) }}
                    className="flex-1 py-2 rounded-lg text-xs font-mono-stonks font-bold uppercase tracking-wider bg-surface-hover border border-border text-text-muted cursor-pointer hover:text-text-primary">
                    Cancelar
                  </button>
                  <button onClick={handleChangePassword} disabled={newPwd.length < 6}
                    className="flex-1 py-2 rounded-lg text-xs font-mono-stonks font-bold uppercase tracking-wider bg-money text-[#0a0a0f] cursor-pointer hover:bg-money-dim disabled:opacity-40 disabled:cursor-not-allowed">
                    Atualizar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SectionTitle>Sessao</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={Monitor} label="Dispositivo atual" desc={navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} />
      </div>
    </div>
  )
}

function DataSection() {
  const { user } = useUser()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const [{ data: profile }, { data: txs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('transactions').select('*').eq('user_id', user.id),
      ])
      const payload = { exported_at: new Date().toISOString(), profile, transactions: txs }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stonks-dados-${user.handle?.replace('@','')}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const handleClearCache = () => {
    if (!confirm('Limpar cache local (preferencias e dados temporarios)?')) return
    const keepKeys = [] // nada preserva
    Object.keys(localStorage).forEach(k => {
      if (!keepKeys.includes(k)) localStorage.removeItem(k)
    })
    alert('Cache limpo. Reloading...')
    window.location.reload()
  }

  return (
    <div>
      <SectionTitle>Meus dados</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={Download} label={exporting ? 'Exportando...' : 'Baixar meus dados'} desc="JSON com perfil + transacoes" onClick={handleExport} />
      </div>

      <SectionTitle>Armazenamento local</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={Trash2} label="Limpar cache" desc="Reseta preferencias (tema, fontsize, filtros)" onClick={handleClearCache} />
      </div>
    </div>
  )
}

function LegalModal({ open, title, body, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={onClose}>
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-[var(--bg-elevated)] border border-border rounded-2xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-text-primary text-lg">{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center cursor-pointer">
                <X size={16} className="text-text-muted" />
              </button>
            </div>
            <div className="text-text-secondary text-sm leading-relaxed space-y-3 whitespace-pre-wrap">{body}</div>
            <button onClick={onClose}
              className="mt-5 w-full py-2.5 rounded-lg bg-money text-[#0a0a0f] font-mono-stonks font-bold uppercase tracking-wider text-xs cursor-pointer hover:bg-money-dim">
              Entendi
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const TERMS_BODY = `O STONKS e uma plataforma gamificada de simulacao de mercado de memes.

1. NATUREZA DO PRODUTO
Todo o "dinheiro" usado (HypeCoins / S$) e virtual. Nao ha dinheiro real envolvido. NAO E uma plataforma de investimento. NAO constitui conselho financeiro. NAO oferece rendimento real.

2. USO ACEITAVEL
Voce concorda em nao usar o app pra:
- Fraude, abuso, assedio
- Spam ou automacao nao autorizada
- Engenharia reversa da economia (multi-conta pra manipular precos)

3. CONTEUDO DO USER
Voce mantem direitos sobre o que posta. Concede ao STONKS licenca pra exibir dentro da plataforma.

4. BANIMENTO
Contas com comportamento abusivo podem ser banidas sem aviso.

5. LIMITACAO DE RESPONSABILIDADE
O STONKS e fornecido "como esta". Nao garantimos disponibilidade continua.

6. MUDANCAS
Estes termos podem mudar. Uso continuado = aceitacao dos novos termos.`

const PRIVACY_BODY = `POLITICA DE PRIVACIDADE

1. DADOS COLETADOS
- Email (pra autenticacao)
- Nome, handle, bio, avatar (voce escolhe)
- Historico de transacoes no app (pra calcular holdings)
- Preferencias (tema, idioma) — salvas no seu device

2. COMO USAMOS
Exclusivamente pra fazer o app funcionar (login, exibir seu perfil, calcular portfolio). Nao vendemos dados. Nao compartilhamos com anunciantes.

3. ARMAZENAMENTO
Dados ficam em Supabase (infra hospedada no AWS). Senhas sao criptografadas via bcrypt.

4. SEU CONTROLE
Voce pode:
- Baixar todos seus dados (Settings → Meus dados → Baixar)
- Deletar conta a qualquer momento (Settings → Conta → Zona perigosa)
- Trocar preferencias a qualquer momento

5. COOKIES / LOCALSTORAGE
Usamos localStorage pra salvar tema, idioma, toggles de notificacao e mute. Nao usamos cookies de rastreamento.

6. CONTATO
pedronhobrab@gmail.com`

function AboutSection() {
  const [legal, setLegal] = useState(null) // 'terms' | 'privacy' | null

  return (
    <div>
      <SectionTitle>STONKS</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={Info} label="Versao" desc={APP_VERSION} />
        <div className="border-t border-border/40" />
        <Row icon={Code2} label="Codigo fonte" desc="github.com/zvy5vdfjzv-crypto/stonks" right={<ChevronRight size={16} className="text-text-muted" />}
          onClick={() => window.open('https://github.com/zvy5vdfjzv-crypto/stonks', '_blank')} />
      </div>

      <SectionTitle>Legal</SectionTitle>
      <div className="bg-surface border-y border-border">
        <Row icon={Info} label="Termos de uso" desc="Ler termos" right={<ChevronRight size={16} className="text-text-muted" />} onClick={() => setLegal('terms')} />
        <div className="border-t border-border/40" />
        <Row icon={Lock} label="Politica de privacidade" right={<ChevronRight size={16} className="text-text-muted" />} onClick={() => setLegal('privacy')} />
      </div>

      <div className="px-4 py-6 text-center">
        <p className="text-text-tertiary text-[10px] font-mono-stonks">
          Feito com <span className="text-loss">♥</span> por traders de memes.
          Isso nao e conselho financeiro. E um jogo.
        </p>
      </div>

      <LegalModal
        open={legal !== null}
        title={legal === 'terms' ? 'Termos de uso' : 'Politica de privacidade'}
        body={legal === 'terms' ? TERMS_BODY : PRIVACY_BODY}
        onClose={() => setLegal(null)}
      />
    </div>
  )
}

// ========== MAIN ==========

const SECTIONS = [
  { id: 'account', label: 'Conta', icon: User, component: AccountSection },
  { id: 'privacy', label: 'Privacidade', icon: Lock, component: PrivacySection },
  { id: 'notifications', label: 'Notificacoes', icon: Bell, component: NotificationsSection },
  { id: 'appearance', label: 'Aparencia', icon: Palette, component: AppearanceSection },
  { id: 'market', label: 'Mercado', icon: TrendingUp, component: MarketSection },
  { id: 'security', label: 'Seguranca', icon: Shield, component: SecuritySection },
  { id: 'data', label: 'Meus dados', icon: Database, component: DataSection },
  { id: 'about', label: 'Sobre', icon: Info, component: AboutSection },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const [active, setActive] = useState(null) // mobile: null = list view, section id = detail view

  const ActiveComponent = SECTIONS.find(s => s.id === active)?.component

  return (
    <div className="min-h-dvh bg-[var(--bg-app)] pb-24 overflow-x-hidden">
      {/* Header mobile — sempre visivel ate lg */}
      <div className="lg:hidden sticky top-0 z-10 bg-[var(--bg-app)]/95 backdrop-blur-xl border-b border-border flex items-center gap-3 px-3 py-2.5">
        <button onClick={() => active ? setActive(null) : navigate(-1)}
          className="w-9 h-9 rounded-lg hover:bg-surface-hover flex items-center justify-center cursor-pointer">
          <ArrowLeft size={18} className="text-text-primary" />
        </button>
        <h1 className="font-display font-bold text-text-primary text-base truncate">
          {active ? SECTIONS.find(s => s.id === active)?.label : 'Configuracoes'}
        </h1>
      </div>

      <div className="w-full max-w-5xl mx-auto lg:flex lg:gap-6 lg:px-4 lg:py-6">
        {/* Sidebar desktop / Lista completa mobile sem section ativa */}
        <aside className={`w-full ${active ? 'hidden lg:block' : ''} lg:w-72 lg:shrink-0`}>
          <div className="hidden lg:block px-4 pb-3">
            <h1 className="font-display font-bold text-text-primary text-2xl">Configuracoes</h1>
            <p className="text-text-muted text-xs mt-1 font-mono-stonks uppercase tracking-wider">Tudo do seu perfil</p>
          </div>
          <nav className="lg:bg-surface lg:border lg:border-border lg:rounded-2xl lg:overflow-hidden">
            {SECTIONS.map((s, i) => {
              const isActive = active === s.id
              const SIcon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer
                    lg:border-t lg:border-border/40 lg:first:border-t-0
                    ${isActive ? 'lg:bg-money/10 lg:border-l-2 lg:border-l-money' : 'hover:bg-surface-hover'}
                    ${i === 0 ? '' : 'border-t border-border/40 lg:border-t-border/40'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                    ${isActive ? 'bg-money/20 text-money' : 'bg-surface-hover text-text-secondary'}`}>
                    <SIcon size={15} />
                  </div>
                  <span className={`text-sm font-medium flex-1 truncate ${isActive ? 'text-money' : 'text-text-primary'}`}>
                    {s.label}
                  </span>
                  <ChevronRight size={16} className="text-text-muted lg:hidden shrink-0" />
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content panel — full width em mobile */}
        <main className={`w-full min-w-0 lg:flex-1 ${!active ? 'hidden lg:block' : ''}`}>
          {!active && (
            <div className="hidden lg:flex items-center justify-center h-96 text-text-muted text-sm">
              Selecione uma secao a esquerda
            </div>
          )}
          {active && ActiveComponent && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <ActiveComponent />
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Users, MessageCircle, Hash, Plus, UserPlus, Circle, Search } from 'lucide-react'
import { useChat } from '../context/ChatContext'

function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h`
}

function ChatBubble({ msg, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm
        ${isUser
          ? 'bg-accent text-white rounded-br-md'
          : 'bg-surface-hover text-text-primary border border-border rounded-bl-md'
        }`}
      >
        {!isUser && msg.avatar && (
          <p className="text-[10px] text-accent font-semibold mb-0.5">{msg.from}</p>
        )}
        <p>{msg.text}</p>
        <p className={`text-[9px] mt-0.5 ${isUser ? 'text-white/50' : 'text-text-muted'}`}>
          {timeAgo(msg.time)}
        </p>
      </div>
    </motion.div>
  )
}

function ChatRoom({ chatId, title, emoji, onBack }) {
  const { messages, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)
  const msgs = messages[chatId] || []

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [msgs.length])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(chatId, input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface shrink-0">
        <button onClick={onBack} className="text-text-muted hover:text-text-primary cursor-pointer">
          <ArrowLeft size={18} />
        </button>
        <span className="text-lg">{emoji}</span>
        <span className="font-semibold text-text-primary text-sm">{title}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {msgs.length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">Nenhuma mensagem ainda. Diga oi!</p>
        )}
        {msgs.map(msg => (
          <ChatBubble key={msg.id} msg={msg} isUser={msg.from === 'user'} />
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-surface shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-surface-hover border border-border rounded-xl px-3.5 py-2.5 text-sm
              text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-accent hover:bg-accent-light disabled:opacity-30 text-white w-10 h-10
              rounded-xl flex items-center justify-center cursor-pointer transition-all disabled:cursor-not-allowed shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateGroupModal({ isOpen, onClose }) {
  const { friends, createGroup } = useChat()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('💬')
  const [selected, setSelected] = useState(new Set())

  const toggle = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const handleCreate = () => {
    if (!name.trim() || selected.size < 1) return
    createGroup(name.trim(), emoji, Array.from(selected))
    setName(''); setSelected(new Set()); onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto
          sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:max-w-sm sm:w-[90vw]"
      >
        <h3 className="font-bold text-text-primary mb-4">Criar Grupo</h3>
        <div className="flex gap-2 mb-3">
          <div className="flex gap-1">
            {['💬', '🔥', '🚀', '💎', '🌙', '🎮', '📈'].map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center cursor-pointer ${emoji === e ? 'bg-accent/20 border border-accent' : 'bg-surface-hover border border-border'}`}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do grupo"
          className="w-full bg-surface-hover border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 mb-3" />
        <p className="text-text-muted text-xs mb-2">Adicionar membros:</p>
        <div className="space-y-1.5 mb-4">
          {friends.map(f => (
            <button key={f.id} onClick={() => toggle(f.id)}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all text-left
                ${selected.has(f.id) ? 'bg-accent/15 border border-accent/30' : 'bg-surface-hover border border-border'}`}>
              <span className="text-lg">{f.avatar}</span>
              <span className={`text-sm ${selected.has(f.id) ? 'text-accent font-semibold' : 'text-text-primary'}`}>{f.name}</span>
            </button>
          ))}
        </div>
        <button onClick={handleCreate} disabled={!name.trim() || selected.size < 1}
          className="w-full bg-accent hover:bg-accent-light disabled:opacity-30 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer disabled:cursor-not-allowed">
          Criar Grupo ({selected.size} membros)
        </button>
      </motion.div>
    </>
  )
}

export default function ChatPage() {
  const { friends, communities, groups, messages, isFollowing, toggleFollow } = useChat()
  const [activeTab, setActiveTab] = useState('dms')
  const [openChat, setOpenChat] = useState(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [search, setSearch] = useState('')

  if (openChat) {
    return (
      <div className="h-[calc(100dvh-130px)]">
        <ChatRoom
          chatId={openChat.id}
          title={openChat.name}
          emoji={openChat.emoji}
          onBack={() => setOpenChat(null)}
        />
      </div>
    )
  }

  const tabs = [
    { id: 'dms', label: 'Mensagens', icon: MessageCircle },
    { id: 'communities', label: 'Comunidades', icon: Hash },
    { id: 'groups', label: 'Grupos', icon: Users },
  ]

  const getLastMessage = (chatId) => {
    const msgs = messages[chatId] || []
    return msgs[msgs.length - 1]
  }

  return (
    <div className="px-4 py-4 max-w-xl mx-auto w-full pb-24">
      {/* Tabs */}
      <div className="flex bg-surface-hover rounded-xl p-1 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all
              ${activeTab === tab.id ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'}`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
          className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
      </div>

      {/* DMs */}
      {activeTab === 'dms' && (
        <div className="space-y-1.5">
          {friends.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase())).map(friend => {
            const lastMsg = getLastMessage(friend.id)
            const following = isFollowing(friend.id)
            return (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3 cursor-pointer
                  hover:bg-surface-hover hover:border-accent/20 transition-all"
                onClick={() => setOpenChat({ id: friend.id, name: friend.name, emoji: friend.avatar })}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-surface-hover flex items-center justify-center text-xl">
                    {friend.avatar}
                  </div>
                  {friend.online && (
                    <Circle size={10} fill="#00D68F" className="text-green absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-primary text-sm truncate">{friend.name}</p>
                    {friend.online && <span className="text-[9px] text-green">online</span>}
                  </div>
                  {lastMsg && (
                    <p className="text-text-muted text-xs truncate">{lastMsg.text}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {lastMsg && <span className="text-text-muted text-[9px]">{timeAgo(lastMsg.time)}</span>}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFollow(friend.id) }}
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-all
                      ${following ? 'bg-accent/20 text-accent' : 'bg-surface-hover text-text-muted hover:text-accent'}`}
                  >
                    {following ? 'Seguindo' : 'Seguir'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Communities */}
      {activeTab === 'communities' && (
        <div className="space-y-1.5">
          {communities.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map(comm => {
            const lastMsg = getLastMessage(comm.id)
            return (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setOpenChat({ id: comm.id, name: comm.name, emoji: comm.emoji })}
                className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3 cursor-pointer
                  hover:bg-surface-hover hover:border-accent/20 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-surface-hover flex items-center justify-center text-xl border border-border">
                  {comm.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm">{comm.name}</p>
                  {lastMsg ? (
                    <p className="text-text-muted text-xs truncate">{lastMsg.from}: {lastMsg.text}</p>
                  ) : (
                    <p className="text-text-muted text-xs">{comm.members.toLocaleString()} membros</p>
                  )}
                </div>
                <span className="text-text-muted text-[10px] shrink-0">{comm.members.toLocaleString()}</span>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Groups */}
      {activeTab === 'groups' && (
        <div className="space-y-1.5">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="w-full flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-xl p-3
              cursor-pointer hover:bg-accent/15 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center">
              <Plus size={18} className="text-accent" />
            </div>
            <span className="text-accent font-semibold text-sm">Criar novo grupo</span>
          </button>

          {groups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase())).map(group => {
            const lastMsg = getLastMessage(group.id)
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setOpenChat({ id: group.id, name: group.name, emoji: group.emoji })}
                className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3 cursor-pointer
                  hover:bg-surface-hover hover:border-accent/20 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-surface-hover flex items-center justify-center text-xl">
                  {group.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm">{group.name}</p>
                  {lastMsg ? (
                    <p className="text-text-muted text-xs truncate">{lastMsg.text}</p>
                  ) : (
                    <p className="text-text-muted text-xs">{group.memberCount} membros</p>
                  )}
                </div>
                <span className="text-text-muted text-[10px] shrink-0">{group.memberCount} membros</span>
              </motion.div>
            )
          })}
        </div>
      )}

      <CreateGroupModal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} />
    </div>
  )
}

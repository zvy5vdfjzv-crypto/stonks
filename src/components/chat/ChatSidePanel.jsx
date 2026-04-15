import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, ArrowLeft, Send, Users, Hash, Circle, Search, Minus } from 'lucide-react'
import { useChat } from '../../context/ChatContext'

function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h`
}

function MiniChatRoom({ chatId, title, emoji, onBack, onMinimize }) {
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
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0">
        <button onClick={onBack} className="text-text-muted hover:text-text-primary cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <span className="text-base">{emoji}</span>
        <span className="font-semibold text-text-primary text-xs flex-1 truncate">{title}</span>
        <button onClick={onMinimize} className="text-text-muted hover:text-text-primary cursor-pointer">
          <Minus size={14} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {msgs.length === 0 && <p className="text-text-muted text-xs text-center py-4">Diga oi!</p>}
        {msgs.map(msg => {
          const isUser = msg.from === 'user'
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs
                ${isUser
                  ? 'bg-accent text-white rounded-br-sm'
                  : 'bg-surface-hover text-text-primary border border-border/50 rounded-bl-sm'}`}
              >
                {!isUser && msg.avatar && <p className="text-[9px] text-accent font-semibold">{msg.from}</p>}
                <p>{msg.text}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-3 py-2 border-t border-border shrink-0">
        <div className="flex gap-1.5">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mensagem..."
            className="flex-1 bg-surface-hover border border-border rounded-lg px-3 py-2 text-xs
              text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
          <button onClick={handleSend} disabled={!input.trim()}
            className="bg-accent disabled:opacity-30 text-white w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer shrink-0">
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ChatSidePanel() {
  const { friends, communities, groups, messages, isFollowing, toggleFollow } = useChat()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dms')
  const [openChat, setOpenChat] = useState(null)
  const [search, setSearch] = useState('')
  const [unread] = useState(3)

  const getLastMessage = (chatId) => {
    const msgs = messages[chatId] || []
    return msgs[msgs.length - 1]
  }

  return (
    <>
      {/* Floating chat button - desktop only */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:flex fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-accent
          hover:bg-accent-light text-white shadow-lg shadow-accent/30 items-center justify-center
          cursor-pointer transition-all"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red text-white text-[10px] font-bold
            rounded-full flex items-center justify-center">{unread}</span>
        )}
      </button>

      {/* Side panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            // 🧠 NEUROMARKETING: Glassmorphism premium — chat panel translucido estilo iOS
            className="hidden sm:flex fixed top-0 right-0 bottom-0 w-[360px] z-30
              backdrop-blur-xl bg-surface/80 border-l border-border/50 flex-col shadow-2xl shadow-black/40"
          >
            {openChat ? (
              <MiniChatRoom
                chatId={openChat.id}
                title={openChat.name}
                emoji={openChat.emoji}
                onBack={() => setOpenChat(null)}
                onMinimize={() => setIsOpen(false)}
              />
            ) : (
              <>
                {/* Header */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                  <h2 className="font-bold text-text-primary text-sm">Chat</h2>
                  <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex px-3 pt-3 gap-1">
                  {[
                    { id: 'dms', label: 'DMs', icon: MessageCircle },
                    { id: 'communities', label: 'Comunidades', icon: Hash },
                    { id: 'groups', label: 'Grupos', icon: Users },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all
                        ${activeTab === tab.id ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'}`}>
                      <tab.icon size={11} /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="px-3 pt-2.5">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
                      className="w-full bg-surface-hover border border-border rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                  </div>
                </div>

                {/* Chat list */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                  {activeTab === 'dms' && friends.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase())).map(friend => {
                    const lastMsg = getLastMessage(friend.id)
                    return (
                      <div key={friend.id}
                        onClick={() => setOpenChat({ id: friend.id, name: friend.name, emoji: friend.avatar })}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-full bg-surface-hover flex items-center justify-center text-base">{friend.avatar}</div>
                          {friend.online && <Circle size={8} fill="#00D68F" className="text-green absolute -bottom-0.5 -right-0.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary text-xs truncate">{friend.name}</p>
                          {lastMsg && <p className="text-text-muted text-[10px] truncate">{lastMsg.text}</p>}
                        </div>
                        {lastMsg && <span className="text-text-muted text-[9px] shrink-0">{timeAgo(lastMsg.time)}</span>}
                      </div>
                    )
                  })}

                  {activeTab === 'communities' && communities.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map(comm => {
                    const lastMsg = getLastMessage(comm.id)
                    return (
                      <div key={comm.id}
                        onClick={() => setOpenChat({ id: comm.id, name: comm.name, emoji: comm.emoji })}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center text-base border border-border/50">{comm.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary text-xs">{comm.name}</p>
                          <p className="text-text-muted text-[10px] truncate">{lastMsg ? `${lastMsg.from}: ${lastMsg.text}` : `${comm.members.toLocaleString()} membros`}</p>
                        </div>
                      </div>
                    )
                  })}

                  {activeTab === 'groups' && groups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase())).map(group => {
                    const lastMsg = getLastMessage(group.id)
                    return (
                      <div key={group.id}
                        onClick={() => setOpenChat({ id: group.id, name: group.name, emoji: group.emoji })}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center text-base">{group.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary text-xs">{group.name}</p>
                          <p className="text-text-muted text-[10px]">{lastMsg ? lastMsg.text : `${group.memberCount} membros`}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../../context/ChatContext'
import { STONKS_OFFICIAL_ACCOUNTS } from '../../context/UserContext'
import VerifiedBadge from './VerifiedBadge'

// Build full mention candidates list
function useMentionCandidates() {
  const { friends } = useChat()

  // Combine friends + official accounts
  const candidates = [
    ...STONKS_OFFICIAL_ACCOUNTS.map(a => ({
      id: a.id,
      name: a.name,
      handle: a.handle,
      avatar: a.emoji,
      verified: 'stonks',
      isOfficial: true,
    })),
    ...friends.map(f => ({
      id: f.id,
      name: f.name,
      handle: `@${f.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      avatar: f.avatar,
      verified: null,
      isOfficial: false,
    })),
  ]

  return candidates
}

export default function MentionInput({
  value,
  onChange,
  placeholder = '',
  rows = 3,
  className = '',
  onMention,
}) {
  const candidates = useMentionCandidates()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionStart, setMentionStart] = useState(-1)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const textareaRef = useRef(null)

  const filtered = mentionQuery
    ? candidates.filter(c =>
        c.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        c.handle.toLowerCase().includes(mentionQuery.toLowerCase())
      ).slice(0, 6)
    : candidates.slice(0, 6)

  const handleChange = useCallback((e) => {
    const val = e.target.value
    onChange(val)

    const cursorPos = e.target.selectionStart
    // Find @ before cursor
    const textBeforeCursor = val.slice(0, cursorPos)
    const atMatch = textBeforeCursor.match(/@(\w*)$/)

    if (atMatch) {
      setShowSuggestions(true)
      setMentionQuery(atMatch[1])
      setMentionStart(cursorPos - atMatch[0].length)
      setSelectedIdx(0)
    } else {
      setShowSuggestions(false)
      setMentionQuery('')
      setMentionStart(-1)
    }
  }, [onChange])

  const insertMention = useCallback((candidate) => {
    if (mentionStart < 0) return
    const before = value.slice(0, mentionStart)
    const after = value.slice(mentionStart + mentionQuery.length + 1) // +1 for @
    const newValue = `${before}${candidate.handle} ${after}`
    onChange(newValue)
    setShowSuggestions(false)
    setMentionQuery('')
    setMentionStart(-1)
    onMention?.(candidate)

    // Focus back
    setTimeout(() => {
      const ta = textareaRef.current
      if (ta) {
        const pos = before.length + candidate.handle.length + 1
        ta.focus()
        ta.setSelectionRange(pos, pos)
      }
    }, 10)
  }, [value, onChange, mentionStart, mentionQuery, onMention])

  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || filtered.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter' && showSuggestions) {
      e.preventDefault()
      insertMention(filtered[selectedIdx])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }, [showSuggestions, filtered, selectedIdx, insertMention])

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-transparent text-text-primary text-sm resize-none
          placeholder:text-text-muted focus:outline-none ${className}`}
      />

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {showSuggestions && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute left-0 right-0 bottom-full mb-1 bg-surface border border-border rounded-xl
              shadow-xl shadow-black/30 overflow-hidden z-50 max-h-52 overflow-y-auto"
          >
            {filtered.map((candidate, i) => (
              <button
                key={candidate.id}
                onClick={() => insertMention(candidate)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left cursor-pointer transition-colors
                  ${i === selectedIdx ? 'bg-accent/15' : 'hover:bg-surface-hover'}`}
              >
                <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-sm shrink-0">
                  {candidate.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-text-primary text-xs font-semibold truncate">{candidate.name}</span>
                    {candidate.verified && <VerifiedBadge type={candidate.verified} size={11} />}
                  </div>
                  <p className="text-text-muted text-[10px] truncate">{candidate.handle}</p>
                </div>
                {candidate.isOfficial && (
                  <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-medium shrink-0">Oficial</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Utility to render text with clickable @mentions
export function RenderMentions({ text, onMentionClick }) {
  if (!text) return null

  // Split on @handles
  const parts = text.split(/(@\w+)/g)

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const handle = part.toLowerCase()
          const official = STONKS_OFFICIAL_ACCOUNTS.find(a => a.handle === handle)
          return (
            <span
              key={i}
              className="text-accent font-semibold cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                onMentionClick?.(handle, official)
              }}
            >
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

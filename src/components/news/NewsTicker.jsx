import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useGame } from '../../context/GameContext'
import { useLang } from '../../context/LanguageContext'

export default function NewsTicker() {
  const { activeNews, newsHistory } = useGame()
  const { t } = useLang()

  const displayNews = activeNews || (newsHistory.length > 0 ? newsHistory[0].headline : null)

  if (!displayNews) return null

  return (
    <div className="hidden sm:block bg-surface border-b border-border overflow-hidden">
      <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap size={13} className="text-yellow" />
          <span className="text-yellow text-[11px] font-bold uppercase">
            {t('news.breaking')}
          </span>
        </div>
        <div className="overflow-hidden flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={displayNews}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-text-secondary text-xs whitespace-nowrap truncate"
            >
              {displayNews}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

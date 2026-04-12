import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { LanguageProvider, useLang } from './context/LanguageContext'
import { UserProvider, useUser } from './context/UserContext'
import { GameProvider } from './context/GameContext'
import { SocialProvider } from './context/SocialContext'
import { ChatProvider } from './context/ChatContext'
import { NotificationProvider } from './context/NotificationContext'
import PushNotifications from './components/notifications/PushNotifications'
import NotificationBridge from './components/notifications/NotificationBridge'
import SplashScreen from './components/ui/SplashScreen'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import NewsTicker from './components/news/NewsTicker'
// Toast system removed - unified into NotificationContext
import CreateMemeModal from './components/market/CreateMemeModal'
import ChatSidePanel from './components/chat/ChatSidePanel'
import OnboardingPage from './pages/OnboardingPage'
import MarketPage from './pages/MarketPage'
import SocialPage from './pages/SocialPage'
import CreatorsPage from './pages/CreatorsPage'
import PortfolioPage from './pages/PortfolioPage'
import LeaderboardPage from './pages/LeaderboardPage'
import InsightsPage from './pages/InsightsPage'
import CreatorRankPage from './pages/CreatorRankPage'
import ChatPage from './pages/ChatPage'
import ShopPage from './pages/ShopPage'

function MainApp() {
  const { lang } = useLang()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <GameProvider lang={lang}>
      <SocialProvider>
        <ChatProvider>
        <NotificationProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-dvh bg-[#0a0a0c]">
            <Header onCreateMeme={() => setCreateOpen(true)} />
            <NewsTicker />
            <main className="flex-1 pb-16">
              <Routes>
                <Route path="/" element={<MarketPage />} />
                <Route path="/social" element={<SocialPage />} />
                <Route path="/creators" element={<CreatorsPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/creator-rank" element={<CreatorRankPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/chat" element={<ChatPage />} />
              </Routes>
            </main>
            <BottomNav />

            {/* Create meme FAB - desktop only, on mobile use header button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCreateOpen(true)}
              className="hidden sm:flex fixed z-30 w-14 h-14 rounded-full bg-accent hover:bg-accent-light
                text-white shadow-lg shadow-accent/30 items-center justify-center cursor-pointer
                transition-colors bottom-6 right-24"
            >
              <Plus size={22} />
            </motion.button>

            <CreateMemeModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
            <ChatSidePanel />
            <PushNotifications />
            <NotificationBridge />
          </div>
        </BrowserRouter>
        </NotificationProvider>
        </ChatProvider>
      </SocialProvider>
    </GameProvider>
  )
}

function AppGate() {
  const { isRegistered } = useUser()
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />
  }

  if (!isRegistered) {
    return <OnboardingPage />
  }

  return <MainApp />
}

function AppContent() {
  return (
    <UserProvider>
      <AppGate />
    </UserProvider>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

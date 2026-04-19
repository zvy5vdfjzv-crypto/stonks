import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
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
import SideMenu from './components/layout/SideMenu'
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
import VerificationPage from './pages/VerificationPage'
import OfficialProfilePage from './pages/OfficialProfilePage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import HypePage from './pages/HypePage'

// Reset page - access /reset to clear account and re-register
function ResetPage() {
  localStorage.removeItem('stonks_user')
  localStorage.removeItem('stonks_notif_muted')
  window.location.href = '/'
  return null
}

function SideMenuWithNav({ isOpen, onClose }) {
  const navigate = useNavigate()
  return <SideMenu isOpen={isOpen} onClose={onClose} onNavigate={(path) => navigate(path)} />
}

function MainApp() {
  const { lang } = useLang()
  const [createOpen, setCreateOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <GameProvider lang={lang}>
      <SocialProvider>
        <ChatProvider>
        <NotificationProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-dvh bg-[var(--bg-app)]">
            <Header onCreateMeme={() => setCreateOpen(true)} onOpenMenu={() => setMenuOpen(true)} />
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
                <Route path="/verification" element={<VerificationPage />} />
                <Route path="/reset" element={<ResetPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/page/:id" element={<OfficialProfilePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/hype" element={<HypePage />} />
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
            <SideMenuWithNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
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
  const { isRegistered, loading, logout } = useUser()
  const [showSplash, setShowSplash] = useState(true)

  // Allow /reset even when logged in
  if (window.location.pathname === '/reset') {
    logout?.()
    localStorage.removeItem('stonks_notif_muted')
    localStorage.removeItem('stonks_theme')
    window.location.href = '/'
    return null
  }

  if (showSplash || loading) {
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

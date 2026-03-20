import { Routes, Route, useLocation } from 'react-router-dom'
import { useTheme } from './contexts/ThemeContext.jsx'
import { useConversation } from './contexts/ConversationContext.jsx'
import { useState, useCallback, useEffect } from 'react'
import Header from './components/layout/Header.jsx'
import MainChat from './components/layout/MainChat.jsx'
import ArtifactsPanel from './components/artifacts/ArtifactsPanel.jsx'
import Sidebar from './components/sidebar/Sidebar.jsx'
import SettingsModal from './components/modals/SettingsModal.jsx'
import PromptLibraryModal from './components/modals/PromptLibraryModal.jsx'
import ProjectSettings from './components/projects/ProjectSettings.jsx'
import ShareModal from './components/modals/ShareModal.jsx'
import ExportModal from './components/modals/ExportModal.jsx'
import CommandPalette from './components/modals/CommandPalette.jsx'
import OnboardingTour from './components/common/OnboardingTour.jsx'
import SharedView from './pages/SharedView.jsx'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js'

export default function App() {
  const { theme } = useTheme()
  const { activeConversation, createConversation } = useConversation()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [artifactsPanelOpen, setArtifactsPanelOpen] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false)
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mobileOverlayOpen, setMobileOverlayOpen] = useState(false)

  // Check if we're on a shared view route
  const isSharedView = location.pathname.startsWith('/share/')

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setMobileOverlayOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) setMobileOverlayOpen(false)
  }, [activeConversation?.id])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(s => !s)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useKeyboardShortcuts({
    onNewChat: useCallback(() => createConversation(), [createConversation]),
    onToggleSettings: useCallback(() => setSettingsOpen(s => !s), []),
    onToggleSidebar: useCallback(() => {
      if (isMobile) setMobileOverlayOpen(s => !s)
      else setSidebarOpen(s => !s)
    }, [isMobile]),
  })

  const handleToggleSidebar = () => {
    if (isMobile) setMobileOverlayOpen(s => !s)
    else setSidebarOpen(s => !s)
  }

  const handleShare = useCallback(() => {
    if (activeConversation?.id) setShareModalOpen(true)
  }, [activeConversation?.id])

  const handleExport = useCallback(() => {
    if (activeConversation?.id) setExportModalOpen(true)
  }, [activeConversation?.id])

  // Shared view renders independently
  if (isSharedView) {
    return (
      <div className={`h-full flex flex-col ${theme === 'dark' ? 'dark' : ''}`}
           style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Routes>
          <Route path="/share/:token" element={<SharedView />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'dark' : ''}`}
         style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header
        sidebarOpen={isMobile ? mobileOverlayOpen : sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onOpenSettings={() => setSettingsOpen(true)}
        onNewProject={() => setProjectSettingsOpen(true)}
        onShare={handleShare}
        onExport={handleExport}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        {!isMobile && (
          <div id="sidebar-slot"
            className={`transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden flex-shrink-0`}
            style={{ borderRight: sidebarOpen ? '1px solid var(--border-color)' : 'none', backgroundColor: 'var(--sidebar-bg)' }}>
            <Sidebar
              onShare={() => setShareModalOpen(true)}
              onExport={() => setExportModalOpen(true)}
            />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {isMobile && mobileOverlayOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOverlayOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-40 w-72 slide-in-left"
              style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)' }}>
              <Sidebar
                isMobile={true}
                onCloseMobile={() => setMobileOverlayOpen(false)}
                onShare={() => setShareModalOpen(true)}
                onExport={() => setExportModalOpen(true)}
              />
            </div>
          </>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <MainChat
            onArtifactOpen={(a) => { setSelectedArtifact(a); setArtifactsPanelOpen(true) }}
            onOpenPromptLibrary={() => setPromptLibraryOpen(true)}
          />
        </div>

        {/* Artifacts panel */}
        {artifactsPanelOpen && (
          <ArtifactsPanel
            conversationId={activeConversation?.id}
            initialArtifact={selectedArtifact}
            onClose={() => setArtifactsPanelOpen(false)}
          />
        )}
      </div>

      {/* Modals */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {promptLibraryOpen && <PromptLibraryModal onClose={() => setPromptLibraryOpen(false)} onUsePrompt={() => {}} />}
      {projectSettingsOpen && <ProjectSettings onClose={() => setProjectSettingsOpen(false)} />}
      {shareModalOpen && activeConversation?.id && (
        <ShareModal conversationId={activeConversation.id} onClose={() => setShareModalOpen(false)} />
      )}
      {exportModalOpen && activeConversation?.id && (
        <ExportModal conversationId={activeConversation.id} conversationTitle={activeConversation.title} onClose={() => setExportModalOpen(false)} />
      )}
      {commandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          onOpenSettings={() => { setCommandPaletteOpen(false); setSettingsOpen(true) }}
          onToggleSidebar={handleToggleSidebar}
        />
      )}
      <OnboardingTour />
    </div>
  )
}

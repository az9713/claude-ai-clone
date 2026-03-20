import { useEffect, useState, useRef } from 'react'
import { useConversations } from '../../hooks/useConversations.js'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api.js'
import NewChatButton from './NewChatButton.jsx'
import SearchBar from './SearchBar.jsx'
import ConversationList from './ConversationList.jsx'
import FolderTree from './FolderTree.jsx'

export default function Sidebar({ isMobile = false, onCloseMobile, onShare, onExport }) {
  const {
    conversations,
    activeConversation,
    selectConversation,
    deleteConversation,
    updateConversation,
    loadConversations,
    searchQuery,
    setSearchQuery,
    searchDeep,
    grouped,
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    addToFolder,
  } = useConversations()

  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const sidebarRef = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    if (!loaded) {
      loadConversations().then(() => setLoaded(true))
    }
  }, [loaded, loadConversations])

  // Swipe-to-close for mobile
  useEffect(() => {
    if (!isMobile || !sidebarRef.current) return

    const el = sidebarRef.current
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX
    }
    const handleTouchEnd = (e) => {
      if (touchStartX.current === null) return
      const diff = e.changedTouches[0].clientX - touchStartX.current
      if (diff < -80) {
        onCloseMobile?.()
      }
      touchStartX.current = null
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, onCloseMobile])

  const handleSelect = (conv) => {
    console.log('[Sidebar] handleSelect called:', conv.id, conv.title)
    selectConversation(conv)
    navigate(`/c/${conv.id}`)
    if (isMobile) onCloseMobile?.()
  }

  const handleDelete = async (id) => {
    await deleteConversation(id)
    if (activeConversation?.id === id) {
      navigate('/')
    }
  }

  const handleRename = async (id, title) => {
    await updateConversation(id, { title })
  }

  const handlePin = async (id, pinned) => {
    try {
      await api.put(`/conversations/${id}/pin`, { pinned })
      await loadConversations()
    } catch (err) {
      console.error('Failed to pin:', err)
    }
  }

  const handleArchive = async (id, archived) => {
    try {
      await api.put(`/conversations/${id}/archive`, { archived })
      await loadConversations()
    } catch (err) {
      console.error('Failed to archive:', err)
    }
  }

  const handleDuplicate = async (id) => {
    try {
      const data = await api.post(`/conversations/${id}/duplicate`)
      await loadConversations()
      if (data.data) {
        navigate(`/c/${data.data.id}`)
      }
    } catch (err) {
      console.error('Failed to duplicate:', err)
    }
  }

  const handleDropConversation = async (folderId, conversationId) => {
    await addToFolder(folderId, conversationId)
  }

  return (
    <nav
      ref={sidebarRef}
      className="h-full flex flex-col gap-3 p-3"
      role="navigation"
      aria-label="Conversation sidebar"
    >
      {/* Mobile close button */}
      {isMobile && (
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm" style={{ color: 'var(--claude-orange)' }}>Claude</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close sidebar"
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* New chat button */}
      <NewChatButton />

      {/* Search */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchDeep={searchDeep}
      />

      {/* Conversation list */}
      <ConversationList
        grouped={grouped}
        activeConversation={activeConversation}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onRename={handleRename}
        onPin={handlePin}
        onArchive={handleArchive}
        onDuplicate={handleDuplicate}
        onShare={onShare}
        onExport={onExport}
      />

      {/* Folders */}
      <FolderTree
        folders={folders}
        onCreateFolder={createFolder}
        onRenameFolder={renameFolder}
        onDeleteFolder={deleteFolder}
        onDropConversation={handleDropConversation}
      />

      {/* User profile section */}
      <div
        className="flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-150 cursor-pointer"
        style={{ borderTop: '1px solid var(--border-color)' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
          style={{ backgroundColor: 'var(--claude-orange)' }}
        >
          U
        </div>
        <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          User
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"
          className="flex-shrink-0"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </div>
    </nav>
  )
}

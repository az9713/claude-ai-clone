import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onPin,
  onArchive,
  onDuplicate,
  onDragStart,
  onShare,
  onExport,
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(conversation.title || 'New Chat')
  const renameRef = useRef(null)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Close context menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  // Focus rename input
  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus()
      renameRef.current.select()
    }
  }, [isRenaming])

  const handleClick = () => {
    if (isRenaming) return
    onSelect(conversation)
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  const handleDoubleClick = () => {
    setIsRenaming(true)
    setRenameValue(conversation.title || 'New Chat')
  }

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== conversation.title) {
      onRename(conversation.id, trimmed)
    }
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') handleRenameSubmit()
    if (e.key === 'Escape') setIsRenaming(false)
  }

  const menuAction = (action) => {
    setShowMenu(false)
    action()
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('conversationId', conversation.id)
          if (onDragStart) onDragStart(conversation)
        }}
        className={`group px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors duration-150 flex items-center gap-2 ${
          isActive ? 'font-medium' : ''
        }`}
        style={{
          backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        {conversation.is_pinned ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--claude-orange)" stroke="var(--claude-orange)" strokeWidth="2" className="flex-shrink-0">
            <path d="M12 2L15 9H22L16 14L18 21L12 17L6 21L8 14L2 9H9L12 2Z" />
          </svg>
        ) : null}

        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              ref={renameRef}
              type="text"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleRenameKeyDown}
              className="w-full bg-transparent outline-none text-sm px-0 py-0"
              style={{
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--claude-orange)',
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div className="truncate" style={{ color: 'var(--text-primary)' }}>
              {conversation.title || 'New Chat'}
            </div>
          )}
        </div>

        <span
          className="text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ color: 'var(--text-secondary)' }}
        >
          {formatTime(conversation.updated_at || conversation.created_at)}
        </span>

        {/* Three-dot menu button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            const rect = e.currentTarget.getBoundingClientRect()
            setMenuPos({ x: rect.left, y: rect.bottom + 4 })
            setShowMenu(s => !s)
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity duration-150"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 py-1 rounded-lg shadow-lg min-w-[160px]"
          style={{
            left: menuPos.x,
            top: menuPos.y,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}
        >
          <ContextMenuItem
            label="Rename"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
            onClick={() => menuAction(() => { setIsRenaming(true); setRenameValue(conversation.title || 'New Chat') })}
          />
          <ContextMenuItem
            label={conversation.is_pinned ? 'Unpin' : 'Pin'}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15 9H22L16 14L18 21L12 17L6 21L8 14L2 9H9L12 2Z"/></svg>}
            onClick={() => menuAction(() => onPin(conversation.id, !conversation.is_pinned))}
          />
          <ContextMenuItem
            label={conversation.is_archived ? 'Unarchive' : 'Archive'}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg>}
            onClick={() => menuAction(() => onArchive(conversation.id, !conversation.is_archived))}
          />
          <ContextMenuItem
            label="Duplicate"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>}
            onClick={() => menuAction(() => onDuplicate(conversation.id))}
          />
          <ContextMenuItem
            label="Share"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
            onClick={() => menuAction(() => onShare?.(conversation.id))}
          />
          <ContextMenuItem
            label="Export"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>}
            onClick={() => menuAction(() => onExport?.(conversation.id))}
          />
          <div className="my-1" style={{ borderTop: '1px solid var(--border-color)' }} />
          <ContextMenuItem
            label="Delete"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>}
            danger
            onClick={() => menuAction(() => onDelete(conversation.id))}
          />
        </div>
      )}
    </>
  )
}

function ContextMenuItem({ label, icon, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-1.5 text-sm flex items-center gap-2 transition-colors duration-100"
      style={{
        color: danger ? '#ef4444' : 'var(--text-primary)',
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)' }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {icon}
      {label}
    </button>
  )
}

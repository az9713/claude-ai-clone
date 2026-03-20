import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConversation } from '../../contexts/ConversationContext.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'

function fuzzyMatch(query, text) {
  if (!query) return true
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return true
  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++
  }
  return qi === q.length
}

function fuzzyScore(query, text) {
  if (!query) return 0
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  // Fuzzy character match score
  let score = 0
  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) { score += 10; qi++ }
  }
  return qi === q.length ? score : 0
}

export default function CommandPalette({ onClose, onOpenSettings, onToggleSidebar }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()
  const { conversations, createConversation } = useConversation()
  const { toggleTheme } = useTheme()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Build items list
  const items = useMemo(() => {
    const actions = [
      {
        id: 'new-chat',
        type: 'action',
        label: 'New Chat',
        description: 'Start a new conversation',
        icon: 'plus',
        action: () => { createConversation(); navigate('/') },
      },
      {
        id: 'toggle-theme',
        type: 'action',
        label: 'Toggle Theme',
        description: 'Switch between light and dark mode',
        icon: 'theme',
        action: () => toggleTheme(),
      },
      {
        id: 'open-settings',
        type: 'action',
        label: 'Open Settings',
        description: 'Open settings modal',
        icon: 'settings',
        action: () => onOpenSettings?.(),
      },
      {
        id: 'toggle-sidebar',
        type: 'action',
        label: 'Toggle Sidebar',
        description: 'Show or hide the sidebar',
        icon: 'sidebar',
        action: () => onToggleSidebar?.(),
      },
    ]

    const convItems = (conversations || []).map(c => ({
      id: `conv-${c.id}`,
      type: 'conversation',
      label: c.title || 'New Chat',
      description: new Date(c.updated_at || c.created_at).toLocaleDateString(),
      icon: 'chat',
      action: () => navigate(`/c/${c.id}`),
    }))

    const allItems = [...actions, ...convItems]

    if (!query.trim()) return allItems.slice(0, 20)

    return allItems
      .filter(item => fuzzyMatch(query, item.label) || fuzzyMatch(query, item.description || ''))
      .sort((a, b) => fuzzyScore(query, b.label) - fuzzyScore(query, a.label))
      .slice(0, 20)
  }, [query, conversations, createConversation, navigate, toggleTheme, onOpenSettings, onToggleSidebar])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex]
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const executeItem = useCallback((item) => {
    onClose()
    // Defer action to allow modal to close
    setTimeout(() => item.action(), 0)
  }, [onClose])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (items[selectedIndex]) executeItem(items[selectedIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const renderIcon = (icon) => {
    switch (icon) {
      case 'plus':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )
      case 'theme':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )
      case 'settings':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        )
      case 'sidebar':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        )
      case 'chat':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search conversations, actions..."
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Command palette search"
          />
          <kbd
            className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2" role="listbox">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              No results found
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                role="option"
                aria-selected={i === selectedIndex}
                onClick={() => executeItem(item)}
                onMouseEnter={() => setSelectedIndex(i)}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                style={{
                  backgroundColor: i === selectedIndex ? 'var(--sidebar-hover)' : 'transparent',
                  color: 'var(--text-primary)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: item.type === 'action' ? 'var(--claude-orange)' : 'var(--bg-tertiary)',
                    color: item.type === 'action' ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {renderIcon(item.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.label}</div>
                  {item.description && (
                    <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {item.description}
                    </div>
                  )}
                </div>
                <span className="text-xs flex-shrink-0 px-1.5 py-0.5 rounded" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-tertiary)',
                }}>
                  {item.type === 'action' ? 'Action' : 'Chat'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-2 text-xs"
          style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-tertiary)' }}
        >
          <span className="flex items-center gap-1">
            <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>Up</kbd>
            <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>Down</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>Enter</kbd>
            to select
          </span>
        </div>
      </div>
    </div>
  )
}

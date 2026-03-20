import { useEffect } from 'react'

export function useKeyboardShortcuts({ onNewChat, onToggleSettings, onToggleSidebar }) {
  useEffect(() => {
    function handleKeyDown(e) {
      const isMod = e.metaKey || e.ctrlKey

      // Ctrl/Cmd+N: New chat
      if (isMod && e.key === 'n') {
        e.preventDefault()
        onNewChat?.()
      }

      // Ctrl/Cmd+Shift+S: Open settings
      if (isMod && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        onToggleSettings?.()
      }

      // Ctrl/Cmd+/: Toggle sidebar
      if (isMod && e.key === '/') {
        e.preventDefault()
        onToggleSidebar?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNewChat, onToggleSettings, onToggleSidebar])
}

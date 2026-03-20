import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useConversation } from '../../contexts/ConversationContext.jsx'
import ProjectSelector from '../projects/ProjectSelector.jsx'

const MODELS = {
  Gemini: [
    { id: 'gemini-flash-lite-latest', name: 'Flash Lite' },
    { id: 'gemini-2.5-flash-preview-05-20', name: '2.5 Flash' },
    { id: 'gemini-2.5-pro-preview-05-06', name: '2.5 Pro' },
    { id: 'gemini-2.0-flash', name: '2.0 Flash' },
  ],
  Anthropic: [
    { id: 'claude-sonnet-4-5-20250929', name: 'Sonnet 4.5' },
    { id: 'claude-haiku-4-5-20251001', name: 'Haiku 4.5' },
    { id: 'claude-opus-4-1-20250805', name: 'Opus 4.1' },
  ],
  OpenAI: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'o3-mini', name: 'o3-mini' },
  ],
}

export default function Header({ sidebarOpen, onToggleSidebar, onOpenSettings, onNewProject }) {
  const { theme, toggleTheme } = useTheme()
  const { model, setModel, activeConversation } = useConversation()

  return (
    <header className="h-12 flex items-center px-4 gap-3 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar toggle */}
      <button onClick={onToggleSidebar}
        className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="font-semibold text-base truncate" style={{ color: 'var(--claude-orange)' }}>
          Claude
        </span>
        {activeConversation && (
          <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
            / {activeConversation.title}
          </span>
        )}
      </div>

      {/* Project selector */}
      <ProjectSelector onNewProject={onNewProject} />

      {/* Model selector - Wave 3 extends */}
      <div id="model-selector-slot">
        <select value={model} onChange={e => setModel(e.target.value)}
          className="text-xs px-2 py-1 rounded-md border transition-colors cursor-pointer"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}>
          {Object.entries(MODELS).map(([provider, models]) => (
            <optgroup key={provider} label={provider}>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {/* Settings button */}
      <div id="settings-slot">
        <button onClick={onOpenSettings}
          className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Settings (Ctrl+Shift+S)"
          aria-label="Open settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </header>
  )
}

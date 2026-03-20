import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { api } from '../../utils/api.js'

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'instructions', label: 'Custom Instructions' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts' },
  { id: 'apikeys', label: 'API Keys' },
  { id: 'usage', label: 'Usage' },
]

const SHORTCUTS = [
  { keys: 'Ctrl/Cmd + N', description: 'New chat' },
  { keys: 'Ctrl/Cmd + Shift + S', description: 'Open settings' },
  { keys: 'Ctrl/Cmd + /', description: 'Toggle sidebar' },
  { keys: 'Enter', description: 'Send message' },
  { keys: 'Shift + Enter', description: 'New line in message' },
  { keys: 'Escape', description: 'Close modal' },
]

export default function SettingsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('general')
  const { theme, setTheme } = useTheme()
  const [preferences, setPreferences] = useState({
    fontSize: 16,
    messageDensity: 'comfortable',
  })
  const [customInstructions, setCustomInstructions] = useState('')
  const [usageData, setUsageData] = useState({ daily: [], monthly: [], byModel: [] })
  const [mockApiKeys, setMockApiKeys] = useState([
    { id: 1, name: 'Default API Key', key: 'sk-ant-...xxxx', active: true, lastUsed: '2026-03-18' },
  ])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load settings
    api.get('/settings').then(data => {
      if (data.data?.preferences) {
        setPreferences(prev => ({ ...prev, ...data.data.preferences }))
      }
      if (data.data?.custom_instructions) {
        setCustomInstructions(data.data.custom_instructions)
      }
    }).catch(() => {})

    // Load usage data
    Promise.all([
      api.get('/usage/daily?days=14').catch(() => ({ data: [] })),
      api.get('/usage/monthly').catch(() => ({ data: [] })),
      api.get('/usage/by-model').catch(() => ({ data: [] })),
    ]).then(([daily, monthly, byModel]) => {
      setUsageData({
        daily: daily.data || [],
        monthly: monthly.data || [],
        byModel: byModel.data || [],
      })
    })
  }, [])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const savePreferences = async (newPrefs) => {
    const merged = { ...preferences, ...newPrefs }
    setPreferences(merged)
    try {
      await api.put('/settings', { preferences: merged })
    } catch {}
  }

  const saveCustomInstructions = async () => {
    setSaving(true)
    try {
      await api.put('/settings/custom-instructions', { custom_instructions: customInstructions })
    } catch {}
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          maxHeight: '80vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tab sidebar */}
          <div className="w-44 border-r py-2 flex-shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full text-left px-4 py-2 text-sm transition-colors"
                style={{
                  color: activeTab === tab.id ? 'var(--claude-orange)' : 'var(--text-secondary)',
                  backgroundColor: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Theme</label>
                  <div className="flex gap-2">
                    {['light', 'dark', 'auto'].map(t => (
                      <button
                        key={t}
                        onClick={() => { setTheme(t === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t) }}
                        className="px-4 py-2 rounded-lg text-sm capitalize border transition-colors"
                        style={{
                          borderColor: theme === t || (t !== 'auto') && theme === t ? 'var(--claude-orange)' : 'var(--border-color)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Font Size: {preferences.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={preferences.fontSize}
                    onChange={e => savePreferences({ fontSize: parseInt(e.target.value) })}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    <span>Small</span>
                    <span>Large</span>
                  </div>
                </div>

                {/* Message density */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Message Density</label>
                  <div className="flex gap-2">
                    {['compact', 'comfortable', 'spacious'].map(d => (
                      <button
                        key={d}
                        onClick={() => savePreferences({ messageDensity: d })}
                        className="px-4 py-2 rounded-lg text-sm capitalize border transition-colors"
                        style={{
                          borderColor: preferences.messageDensity === d ? 'var(--claude-orange)' : 'var(--border-color)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'instructions' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Custom Instructions
                  </label>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    These instructions will be included with every conversation.
                  </p>
                  <textarea
                    value={customInstructions}
                    onChange={e => setCustomInstructions(e.target.value)}
                    placeholder="Tell Claude about yourself, your preferences, or how you'd like responses formatted..."
                    rows={10}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none transition-colors"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <button
                  onClick={saveCustomInstructions}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm text-white font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--claude-orange)' }}
                >
                  {saving ? 'Saving...' : 'Save Instructions'}
                </button>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Keyboard Shortcuts</h3>
                <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <th className="text-left px-4 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Shortcut</th>
                        <th className="text-left px-4 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SHORTCUTS.map((s, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                          <td className="px-4 py-2.5">
                            <kbd
                              className="px-2 py-0.5 rounded text-xs font-mono"
                              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                            >
                              {s.keys}
                            </kbd>
                          </td>
                          <td className="px-4 py-2.5" style={{ color: 'var(--text-primary)' }}>{s.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'apikeys' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>API Keys</h3>
                  <button
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: 'var(--claude-orange)' }}
                    onClick={() => {
                      setMockApiKeys(prev => [...prev, {
                        id: Date.now(),
                        name: `API Key ${prev.length + 1}`,
                        key: 'sk-ant-...new',
                        active: true,
                        lastUsed: 'Never',
                      }])
                    }}
                  >
                    + Add Key
                  </button>
                </div>
                <div className="space-y-2">
                  {mockApiKeys.map(key => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{key.name}</div>
                        <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>{key.key}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Last used: {key.lastUsed}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: key.active ? '#4CAF50' : '#9E9E9E' }}
                        />
                        <button
                          onClick={() => setMockApiKeys(prev => prev.filter(k => k.id !== key.id))}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-6">
                {/* Usage by model */}
                <div>
                  <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Usage by Model</h3>
                  {usageData.byModel.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No usage data yet. Start chatting to see stats.</p>
                  ) : (
                    <div className="space-y-2">
                      {usageData.byModel.map((m, i) => (
                        <div key={i} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--text-primary)' }}>{m.model}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{(m.total_tokens || 0).toLocaleString()} tokens</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            <span>{m.request_count || 0} requests</span>
                            <span>${m.total_cost || '0.0000'}</span>
                          </div>
                          {/* Simple bar */}
                          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                backgroundColor: 'var(--claude-orange)',
                                width: `${Math.min(100, ((m.total_tokens || 0) / Math.max(1, ...usageData.byModel.map(x => x.total_tokens || 0))) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Daily stats */}
                <div>
                  <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Daily Usage (Last 14 Days)</h3>
                  {usageData.daily.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No daily usage data.</p>
                  ) : (
                    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <th className="text-left px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Date</th>
                            <th className="text-right px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Requests</th>
                            <th className="text-right px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Tokens</th>
                            <th className="text-right px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usageData.daily.map((d, i) => (
                            <tr key={i} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                              <td className="px-3 py-2" style={{ color: 'var(--text-primary)' }}>{d.date}</td>
                              <td className="px-3 py-2 text-right" style={{ color: 'var(--text-primary)' }}>{d.request_count}</td>
                              <td className="px-3 py-2 text-right" style={{ color: 'var(--text-primary)' }}>{(d.total_tokens || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 text-right" style={{ color: 'var(--text-primary)' }}>${d.total_cost || '0.00'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Monthly stats */}
                <div>
                  <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Monthly Summary</h3>
                  {usageData.monthly.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No monthly usage data.</p>
                  ) : (
                    <div className="space-y-2">
                      {usageData.monthly.map((m, i) => (
                        <div key={i} className="flex justify-between p-3 rounded-lg border text-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{m.month}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {(m.total_tokens || 0).toLocaleString()} tokens / ${m.total_cost || '0.00'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

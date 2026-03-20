import { useState, useEffect } from 'react'
import { api } from '../../utils/api.js'

const CATEGORIES = ['all', 'general', 'coding', 'writing', 'creative', 'learning']

export default function PromptLibraryModal({ onClose, onUsePrompt }) {
  const [prompts, setPrompts] = useState([])
  const [examples, setExamples] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newPrompt, setNewPrompt] = useState({ title: '', description: '', prompt_template: '', category: 'general' })

  useEffect(() => {
    loadPrompts()
    api.get('/prompts/examples').then(data => setExamples(data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const loadPrompts = async () => {
    try {
      const data = await api.get('/prompts/library')
      setPrompts(data.data || [])
    } catch {}
  }

  const allPrompts = [...prompts, ...examples]
  const filtered = allPrompts.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCreate = async () => {
    if (!newPrompt.title || !newPrompt.prompt_template) return
    try {
      await api.post('/prompts/library', newPrompt)
      setNewPrompt({ title: '', description: '', prompt_template: '', category: 'general' })
      setShowCreate(false)
      loadPrompts()
    } catch {}
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/prompts/${id}`)
      loadPrompts()
    } catch {}
  }

  const handleUse = (prompt) => {
    onUsePrompt?.(prompt.prompt_template)
    onClose()
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
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Prompt Library</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search + Categories */}
        <div className="px-6 pt-4 pb-2 space-y-3 flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ color: 'var(--text-secondary)' }}
              >
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search prompts..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white flex-shrink-0"
              style={{ backgroundColor: 'var(--claude-orange)' }}
            >
              + New
            </button>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1 rounded-full text-xs capitalize transition-colors"
                style={{
                  backgroundColor: activeCategory === cat ? 'var(--claude-orange)' : 'var(--bg-secondary)',
                  color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${activeCategory === cat ? 'var(--claude-orange)' : 'var(--border-color)'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="px-6 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <input
                type="text"
                value={newPrompt.title}
                onChange={e => setNewPrompt(p => ({ ...p, title: e.target.value }))}
                placeholder="Prompt title"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={newPrompt.description}
                onChange={e => setNewPrompt(p => ({ ...p, description: e.target.value }))}
                placeholder="Short description"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
              <textarea
                value={newPrompt.prompt_template}
                onChange={e => setNewPrompt(p => ({ ...p, prompt_template: e.target.value }))}
                placeholder="Prompt template (use {{variable}} for placeholders)"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
              <div className="flex items-center gap-2">
                <select
                  value={newPrompt.category}
                  onChange={e => setNewPrompt(p => ({ ...p, category: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  {CATEGORIES.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  onClick={handleCreate}
                  disabled={!newPrompt.title || !newPrompt.prompt_template}
                  className="px-3 py-1.5 rounded-lg text-sm text-white font-medium disabled:opacity-50"
                  style={{ backgroundColor: 'var(--claude-orange)' }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prompt list */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No prompts found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(prompt => (
                <div
                  key={prompt.id}
                  className="p-3 rounded-lg border transition-colors hover:border-orange-300 cursor-pointer group"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
                  onClick={() => handleUse(prompt)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {prompt.title}
                        </h4>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] capitalize flex-shrink-0"
                          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                        >
                          {prompt.category}
                        </span>
                        {prompt.is_example && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] flex-shrink-0"
                            style={{ backgroundColor: 'var(--claude-orange)', color: 'white' }}
                          >
                            Example
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                        {prompt.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUse(prompt) }}
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: 'var(--claude-orange)' }}
                      >
                        Use
                      </button>
                      {!prompt.is_example && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(prompt.id) }}
                          className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

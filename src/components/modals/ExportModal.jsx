import { useState } from 'react'
import { api } from '../../utils/api.js'

export default function ExportModal({ conversationId, conversationTitle, onClose }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const fetchMessages = async () => {
    const data = await api.get(`/conversations/${conversationId}/messages`)
    return data.data || []
  }

  const exportJSON = async () => {
    setLoading('json')
    setError(null)
    try {
      const messages = await fetchMessages()
      const exportData = {
        title: conversationTitle || 'Conversation',
        exported_at: new Date().toISOString(),
        message_count: messages.length,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          created_at: m.created_at,
        })),
      }
      const filename = `${(conversationTitle || 'conversation').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
      downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const exportMarkdown = async () => {
    setLoading('markdown')
    setError(null)
    try {
      const messages = await fetchMessages()
      let md = `# ${conversationTitle || 'Conversation'}\n\n`
      md += `*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`

      for (const msg of messages) {
        const role = msg.role === 'user' ? 'You' : 'Claude'
        md += `### ${role}\n\n${msg.content || ''}\n\n---\n\n`
      }

      const filename = `${(conversationTitle || 'conversation').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
      downloadFile(md, filename, 'text/markdown')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Export conversation"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-6"
        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Export Conversation
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            aria-label="Close export modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-red-500" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* JSON export */}
          <button
            onClick={exportJSON}
            disabled={loading !== null}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: '#3b82f6' }}>
              JSON
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {loading === 'json' ? 'Exporting...' : 'JSON Format'}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Full data with metadata
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </button>

          {/* Markdown export */}
          <button
            onClick={exportMarkdown}
            disabled={loading !== null}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: '#8b5cf6' }}>
              MD
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {loading === 'markdown' ? 'Exporting...' : 'Markdown Format'}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Readable text format
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

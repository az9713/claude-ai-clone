import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import MessageBubble from '../components/chat/MessageBubble.jsx'

export default function SharedView() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSharedConversation()
  }, [token])

  const fetchSharedConversation = async () => {
    try {
      const res = await fetch(`/api/share/${token}`)
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Failed to load shared conversation')
      } else {
        setData(json.data)
      }
    } catch (err) {
      setError('Failed to load shared conversation')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--claude-orange)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading shared conversation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#fee2e2' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Cannot Load Conversation
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <a
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-lg text-sm text-white transition-colors"
            style={{ backgroundColor: 'var(--claude-orange)' }}
          >
            Go to Claude
          </a>
        </div>
      </div>
    )
  }

  const { conversation, messages, share } = data

  // Parse images JSON if needed
  const parsedMessages = (messages || []).map(m => {
    let images = []
    if (m.images) {
      try { images = typeof m.images === 'string' ? JSON.parse(m.images) : m.images } catch {}
    }
    return { ...m, images }
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="h-14 flex items-center px-6 gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--claude-orange)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <span className="font-semibold" style={{ color: 'var(--claude-orange)' }}>Claude</span>
        </div>
        <div
          className="px-2 py-0.5 rounded text-xs"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
        >
          Shared Conversation
        </div>
        <div className="flex-1" />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {conversation?.title || 'Untitled'}
        </span>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto" role="log" aria-label="Shared conversation messages">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {parsedMessages.map((message, i) => (
            <MessageBubble key={message.id || i} message={message} onArtifactOpen={() => {}} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-3 text-center text-xs"
        style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-tertiary)' }}
      >
        Shared via Claude &middot; {share?.view_count || 0} views
      </footer>
    </div>
  )
}

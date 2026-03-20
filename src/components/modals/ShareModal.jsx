import { useState, useEffect } from 'react'
import { api } from '../../utils/api.js'

const EXPIRY_OPTIONS = [
  { label: '1 day', value: 1 },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: 'Never', value: null },
]

export default function ShareModal({ conversationId, onClose }) {
  const [share, setShare] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiryDays, setExpiryDays] = useState(7)
  const [isPublic, setIsPublic] = useState(true)
  const [error, setError] = useState(null)

  const shareUrl = share ? `${window.location.origin}/share/${share.share_token}` : ''

  useEffect(() => {
    // Check if already shared
    loadExistingShare()
  }, [conversationId])

  const loadExistingShare = async () => {
    // We create on demand, no pre-check needed beyond the POST which returns existing
  }

  const handleCreateShare = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/share', {
        conversationId,
        expires_in_days: expiryDays,
        is_public: isPublic,
      })
      setShare(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleDeleteShare = async () => {
    if (!share) return
    try {
      await api.delete(`/share/${share.share_token}`)
      setShare(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdateSettings = async () => {
    if (!share) return
    try {
      const data = await api.put(`/share/${share.share_token}/settings`, {
        is_public: isPublic,
        expires_in_days: expiryDays,
      })
      setShare(data.data)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Share conversation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6"
        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Share Conversation
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            aria-label="Close share modal"
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

        {!share ? (
          <>
            {/* Expiry selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Link expires in
              </label>
              <div className="flex gap-2 flex-wrap">
                {EXPIRY_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setExpiryDays(opt.value)}
                    className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: expiryDays === opt.value ? 'var(--claude-orange)' : 'var(--bg-secondary)',
                      color: expiryDays === opt.value ? 'white' : 'var(--text-primary)',
                      border: '1px solid ' + (expiryDays === opt.value ? 'var(--claude-orange)' : 'var(--border-color)'),
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Public toggle */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Public link (anyone with the link can view)
              </span>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className="w-10 h-6 rounded-full transition-colors relative"
                style={{ backgroundColor: isPublic ? 'var(--claude-orange)' : 'var(--bg-tertiary)' }}
                role="switch"
                aria-checked={isPublic}
                aria-label="Toggle public sharing"
              >
                <div
                  className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-200"
                  style={{ transform: isPublic ? 'translateX(20px)' : 'translateX(4px)' }}
                />
              </button>
            </div>

            {/* Create button */}
            <button
              onClick={handleCreateShare}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--claude-orange)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--claude-orange-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--claude-orange)' }}
            >
              {loading ? 'Creating...' : 'Generate Share Link'}
            </button>
          </>
        ) : (
          <>
            {/* Share link display */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Share link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: copied ? '#22c55e' : 'var(--claude-orange)' }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* View count */}
            <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {share.view_count || 0} views
            </div>

            {/* Expiry selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Expires
              </label>
              <div className="flex gap-2 flex-wrap">
                {EXPIRY_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => { setExpiryDays(opt.value); }}
                    className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: expiryDays === opt.value ? 'var(--claude-orange)' : 'var(--bg-secondary)',
                      color: expiryDays === opt.value ? 'white' : 'var(--text-primary)',
                      border: '1px solid ' + (expiryDays === opt.value ? 'var(--claude-orange)' : 'var(--border-color)'),
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Public toggle */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Public</span>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className="w-10 h-6 rounded-full transition-colors relative"
                style={{ backgroundColor: isPublic ? 'var(--claude-orange)' : 'var(--bg-tertiary)' }}
                role="switch"
                aria-checked={isPublic}
                aria-label="Toggle public sharing"
              >
                <div
                  className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-200"
                  style={{ transform: isPublic ? 'translateX(20px)' : 'translateX(4px)' }}
                />
              </button>
            </div>

            {/* Update / Delete buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleUpdateSettings}
                className="flex-1 py-2 rounded-xl text-white font-medium text-sm transition-colors"
                style={{ backgroundColor: 'var(--claude-orange)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--claude-orange-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--claude-orange)' }}
              >
                Update Settings
              </button>
              <button
                onClick={handleDeleteShare}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors text-red-500"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)' }}
              >
                Delete Link
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

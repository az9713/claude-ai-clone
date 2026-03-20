import { useState, useRef, useEffect } from 'react'

export default function VersionSelector({ versions, currentVersion, onSelectVersion }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!versions || versions.length <= 1) return null

  const current = versions.find(v => v.id === currentVersion?.id) || currentVersion

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors"
        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
        <span>v{current?.version || 1}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full mb-1 left-0 min-w-[180px] rounded-lg shadow-lg py-1 z-50"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => { onSelectVersion(v); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors flex items-center justify-between"
              style={{
                color: v.id === current?.id ? 'var(--claude-orange)' : 'var(--text-primary)',
                backgroundColor: v.id === current?.id ? 'var(--bg-secondary)' : 'transparent',
              }}
              onMouseEnter={e => { if (v.id !== current?.id) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)' }}
              onMouseLeave={e => { if (v.id !== current?.id) e.currentTarget.style.backgroundColor = 'transparent' }}>
              <span className="font-medium">Version {v.version}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>
                {new Date(v.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
